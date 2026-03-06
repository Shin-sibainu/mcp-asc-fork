import { exec } from "child_process";
import { promisify } from "util";
import { existsSync, statSync } from "fs";
import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";

const execAsync = promisify(exec);

function parseXcodebuildOutput(output: string): { name: string; isShared: boolean }[] {
  const lines = output.split("\n");
  const schemes: { name: string; isShared: boolean }[] = [];
  let inSchemesSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "Schemes:") {
      inSchemesSection = true;
      continue;
    }
    if (
      inSchemesSection &&
      (trimmed === "" ||
        trimmed.startsWith("Build Configurations:") ||
        trimmed.startsWith("If no build configuration"))
    ) {
      break;
    }
    if (inSchemesSection && trimmed && !trimmed.startsWith("Information about project")) {
      schemes.push({ name: trimmed.trim(), isShared: !line.startsWith("    ") });
    }
  }
  return schemes;
}

export const schema = {
  projectPath: z
    .string()
    .describe("Path to .xcodeproj or .xcworkspace file"),
};
export const metadata: ToolMetadata = {
  name: "list-schemes",
  description: "List all available schemes in an Xcode project or workspace",
  annotations: {
    title: "List Xcode schemes",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

export default async function listSchemesTool(
  args: InferSchema<typeof schema>
) {
  const projectPath = args.projectPath;
  if (!existsSync(projectPath)) throw new Error(`Project path does not exist: ${projectPath}`);
  const stats = statSync(projectPath);
  if (!stats.isDirectory()) throw new Error(`Project path is not a directory: ${projectPath}`);
  const isWorkspace = projectPath.endsWith(".xcworkspace");
  const isProject = projectPath.endsWith(".xcodeproj");
  if (!isWorkspace && !isProject) {
    throw new Error("Project path must be either a .xcworkspace or .xcodeproj file");
  }
  const command = isWorkspace
    ? `xcodebuild -workspace "${projectPath}" -list`
    : `xcodebuild -project "${projectPath}" -list`;
  const { stdout } = await execAsync(command);
  const schemes = parseXcodebuildOutput(stdout);
  return JSON.stringify(
    {
      projectPath,
      projectType: isWorkspace ? "workspace" : "project",
      schemes,
      totalSchemes: schemes.length,
    },
    null,
    2
  );
}
