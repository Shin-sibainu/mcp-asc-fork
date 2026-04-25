#!/usr/bin/env node
/**
 * mcp-asc Claude互換プロキシ
 *
 * Claude API の制約を回避する変換レイヤー:
 * 1. $schema を除去（Claude APIが拒否する）
 * 2. filter[id] → filter.id にプロパティ名変換
 * 3. boolean/number を文字列として公開し、呼び出し時に正しい型に復元
 *
 * 使い方: 各プロジェクトの .mcp.json で以下を指定
 * {
 *   "command": "node",
 *   "args": ["C:/Users/じゅぶ/Desktop/dev/mcp-asc-fork/proxy.mjs"]
 * }
 */
import { spawn } from "child_process";
import { createInterface } from "readline";
import { readFileSync, existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env から環境変数を読み込み
const envPath = resolve(__dirname, ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

// P8パスを絶対パスに解決
if (process.env.APP_STORE_CONNECT_P8_PATH && !process.env.APP_STORE_CONNECT_P8_PATH.includes(":")) {
  process.env.APP_STORE_CONNECT_P8_PATH = resolve(__dirname, process.env.APP_STORE_CONNECT_P8_PATH);
}

// fork版の mcp-asc を子プロセスで起動
const child = spawn("node", [resolve(__dirname, "dist", "stdio.js")], {
  stdio: ["pipe", "pipe", "inherit"],
  env: process.env,
});

// key変換: filter[id] → filter.id, exists[parent] → exists.parent
const bracketToSafe = (key) => key.replace(/\[([^\]]+)\]/g, ".$1");
const safeToBracket = (key) => key.replace(/^(filter|exists|sort)\.(.+)$/, "$1[$2]");

function transformProperties(props, toSafe) {
  if (!props || typeof props !== "object") return props;
  const result = {};
  for (const [key, value] of Object.entries(props)) {
    result[toSafe ? bracketToSafe(key) : safeToBracket(key)] = value;
  }
  return result;
}

function transformRequired(required, toSafe) {
  if (!Array.isArray(required)) return required;
  return required.map((key) => (toSafe ? bracketToSafe(key) : safeToBracket(key)));
}

// ツールごとのプロパティ型マップ
const toolTypeMap = {};

function transformToolsResponse(msg) {
  if (msg?.result?.tools) {
    for (const tool of msg.result.tools) {
      const schema = tool.inputSchema;
      delete schema?.["$schema"];
      if (schema?.properties) {
        const types = {};
        for (const [key, def] of Object.entries(schema.properties)) {
          const safeKey = bracketToSafe(key);
          if (def.type === "boolean") {
            types[safeKey] = "boolean";
            def.type = "string";
            def.enum = ["true", "false"];
            def.description = (def.description || "") + " (true/false)";
          } else if (def.type === "number") {
            types[safeKey] = "number";
            def.type = "string";
            def.description = (def.description || "") + " (number as string)";
          }
        }
        if (Object.keys(types).length > 0) toolTypeMap[tool.name] = types;
        schema.properties = transformProperties(schema.properties, true);
      }
      if (schema?.required) {
        schema.required = transformRequired(schema.required, true);
      }
    }
  }
  return msg;
}

function transformCallRequest(msg) {
  if (msg?.method === "tools/call" && msg?.params?.arguments) {
    const types = toolTypeMap[msg.params.name] || {};
    const restored = {};
    for (const [key, value] of Object.entries(msg.params.arguments)) {
      const origKey = safeToBracket(key);
      let val = value;
      const t = types[key];
      if (t === "boolean" && typeof val === "string") val = val === "true";
      else if (t === "number" && typeof val === "string") val = Number(val);
      restored[origKey] = val;
    }
    msg.params.arguments = restored;
  }
  return msg;
}

// stdin → child
const stdinRL = createInterface({ input: process.stdin });
stdinRL.on("line", (line) => {
  try {
    child.stdin.write(JSON.stringify(transformCallRequest(JSON.parse(line))) + "\n");
  } catch {
    child.stdin.write(line + "\n");
  }
});

// child → stdout
const childRL = createInterface({ input: child.stdout });
childRL.on("line", (line) => {
  try {
    process.stdout.write(JSON.stringify(transformToolsResponse(JSON.parse(line))) + "\n");
  } catch {
    process.stdout.write(line + "\n");
  }
});

child.on("exit", (code) => process.exit(code ?? 0));
process.on("SIGTERM", () => child.kill());
process.on("SIGINT", () => child.kill());
