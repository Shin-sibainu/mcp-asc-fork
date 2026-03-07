# Adding App Store Connect MCP to catalogs and registries

This doc describes how to list [appstore-connect-mcp](https://github.com/beautyfree/appstore-connect-mcp) in the main MCP catalogs so users can discover and install it.

**Done:** [Official MCP Registry](https://registry.modelcontextprotocol.io) published; [Cursor Directory](https://github.com/cursor/mcp-servers/issues/294) issue #294 submitted; [cursor.store](https://www.cursor.store/dashboard/edit/beautyfree/appstore-connect-mcp) listing filled and saved. **Optional:** attach logo to issue #294.

## 1. Official MCP Registry (modelcontextprotocol.io)

The [MCP Registry](https://modelcontextprotocol.io/registry/about) is the official metadata repository for MCP servers. Clients and marketplaces often consume it via the [Registry API](https://registry.modelcontextprotocol.io).

### Prerequisites

- GitHub account (for namespace `io.github.beautyfree/...`)
- Package already published to npm as `mcp-asc`

### Steps

1. **Ensure metadata in the repo**
   - `package.json` must include `mcpName`: `"io.github.beautyfree/app-store-connect"`.
   - Root `server.json` must match the [server schema](https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/server-json/server.schema.json) and reference the same name and npm package/version.

2. **Install the publisher CLI**
   ```bash
   brew install mcp-publisher
   # or: curl -L "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_..." | tar xz ...
   ```

3. **Log in with GitHub**
   ```bash
   mcp-publisher login github
   ```
   Complete the device flow in the browser.

4. **Publish**
   From the repo root (where `server.json` lives):
   ```bash
   mcp-publisher publish
   ```

5. **Update after releases**  
   Bump `version` in both `package.json` and `server.json`, publish to npm, then run `mcp-publisher publish` again.

- Docs: [Quickstart: Publish an MCP Server](https://modelcontextprotocol.io/registry/quickstart)  
- API: [registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io)

---

## 2. Cursor MCP Directory (cursor.com)

The [Cursor MCP Directory](https://cursor.com/docs/mcp/directory) is a curated list in Cursor’s docs. Adding a server is done by **request**, not by self-service.

### Steps

1. Open a **server request** issue (must be signed in to GitHub):  
   [github.com/cursor/mcp-servers/issues/new?template=server-request.yml](https://github.com/cursor/mcp-servers/issues/new?template=server-request.yml)
2. Copy-paste from **[docs/cursor-directory-issue-draft.md](cursor-directory-issue-draft.md)** into each form field, or fill manually:
   - **Name:** App Store Connect (or “App Store Connect MCP”)
   - **Description:** One line + optional short paragraph (e.g. from README).
   - **Transport:** stdio (and optionally HTTP/SSE if you document it).
   - **Install:** `npx -y mcp-asc` (and env vars as in README).
   - **Docs:** Link to [github.com/beautyfree/appstore-connect-mcp](https://github.com/beautyfree/appstore-connect-mcp) and README.
3. Submit the issue and wait for Cursor’s team to add the server to the directory.

---

## 3. cursor.store

[cursor.store](https://cursor.store) is a marketplace for Cursor MCPs. You can list the server via their form.

### Steps

1. Go to [cursor.store/mcp/new](https://cursor.store/mcp/new) (or use “List your MCP (free)” on the site).
2. Fill in:
   - **Name / slug:** e.g. “App Store Connect” and a URL slug.
   - **Short and long description:** e.g. from README; mention apps, TestFlight, subscriptions, localizations, reports.
   - **Category / tags:** e.g. DevTools, Apple, iOS, App Store, TestFlight, subscriptions.
   - **Author/maintainer:** beautyfree or your handle.
   - **Repository URL:** `https://github.com/beautyfree/appstore-connect-mcp`
   - **Install snippet:**  
     `npx -y mcp-asc`  
     And note required env: `APP_STORE_CONNECT_KEY_ID`, `APP_STORE_CONNECT_ISSUER_ID`, `APP_STORE_CONNECT_P8_PATH`, optional `APP_STORE_CONNECT_VENDOR_NUMBER`.
   - **Permission level:** e.g. medium (access to App Store Connect API with user-provided credentials).
   - **Safety/security:** e.g. “Uses official App Store Connect API; credentials (Key ID, Issuer ID, .p8 path) are user-provided env vars.”
3. Optionally add: docs URL, homepage, license (MIT), icon/logo, usage examples.
4. Submit; cursor.store will review and list.

- Rules/requirements: [cursor.store/rules](https://www.cursor.store/rules)

---

## 4. PulseMCP (pulsemcp.com)

[PulseMCP](https://www.pulsemcp.com/servers) ingests from the **Official MCP Registry** daily and processes weekly. Since **io.github.beautyfree/app-store-connect** is already in the official registry, it should appear on [pulsemcp.com/servers](https://www.pulsemcp.com/servers) within about a week. For faster listing or listing edits, email [hello@pulsemcp.com](mailto:hello@pulsemcp.com). No separate submit form—[Submit](https://www.pulsemcp.com/submit) points to the official registry flow.

## 5. MCP Hub Registry (registry.mcphub.io)

[registry.mcphub.io](https://registry.mcphub.io/) exposes an MCP Registry API. See [MCPHub docs](https://docs.mcphubx.com/) for how to register or sync servers.

## 6. Other catalogs (optional)

- **MCP Marketplace** ([mcp-marketplace.io](https://mcp-marketplace.io)): Lists tools from the Official MCP Registry; **io.github.beautyfree/app-store-connect** may appear after their sync. To submit manually: [Submit a Tool](https://mcp-marketplace.io/submit) (requires sign-in with Google).
- **Community lists / Awesome MCP**: Some “Awesome MCP” or “MCP servers list” repos accept PRs; you can open a PR adding a line for App Store Connect MCP with repo URL and one-line description.

---

## Summary

| Catalog              | Status | How to add / link |
|----------------------|--------|-------------------|
| Official MCP Registry| Done   | [Registry](https://registry.modelcontextprotocol.io) — for future releases: bump version, `npm publish`, then `mcp-publisher publish` |
| Cursor Directory     | Done   | [Issue #294](https://github.com/cursor/mcp-servers/issues/294) |
| cursor.store         | Done   | [Edit listing](https://www.cursor.store/dashboard/edit/beautyfree/appstore-connect-mcp) |
| PulseMCP             | Auto   | Ingests from official registry; [servers](https://www.pulsemcp.com/servers). For edits: [hello@pulsemcp.com](mailto:hello@pulsemcp.com) |
| MCP Hub Registry     | —      | [registry.mcphub.io](https://registry.mcphub.io/) — see [MCPHub docs](https://docs.mcphubx.com/) for API/registration |
| MCP Marketplace      | Submitted | [Dashboard](https://mcp-marketplace.io/dashboard); support contacted re: xmcp |

Keeping `server.json` and `mcpName` in sync with each release ensures the official registry and any aggregators that use it stay up to date after you run `mcp-publisher publish`.
