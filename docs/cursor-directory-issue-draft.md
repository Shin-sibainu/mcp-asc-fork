# Cursor MCP Directory — issue draft (copy-paste into form)

Use this when opening: [New Server Request issue](https://github.com/cursor/mcp-servers/issues/new?template=server-request.yml).  
You must be signed in to GitHub. Copy each block into the corresponding form field.

---

## Title
`[Server Request]: App Store Connect MCP`

---

## Server Name
```
App Store Connect MCP
```

---

## Server URL/Repository
```
https://github.com/beautyfree/appstore-connect-mcp
```

---

## Description
```
MCP server for the official App Store Connect API. Connects Cursor, Claude Desktop, and other MCP clients to manage iOS/macOS apps, TestFlight, in-app subscriptions, and store metadata via chat or tool calls instead of the App Store Connect UI.

Use it to: list and inspect apps, builds, and beta groups; manage TestFlight testers and review submissions; create and update subscription groups and prices; edit App Store version localizations and "What's New"; download sales and finance reports; list Xcode schemes and CI products. Uses JWT auth and the same API Apple's tools use.
```

---

## Requirements Check
- [x] Provides clear installation and configuration instructions
- [x] Focused on developer tools/services (not consumer applications)
- [x] Has appropriate icon or branding available (logo in repo: .github/assets/logo.webp)

---

## Configuration JSON
```json
{
  "command": "npx",
  "args": ["-y", "mcp-asc"],
  "env": {
    "APP_STORE_CONNECT_KEY_ID": "",
    "APP_STORE_CONNECT_ISSUER_ID": "",
    "APP_STORE_CONNECT_P8_PATH": "",
    "APP_STORE_CONNECT_VENDOR_NUMBER": ""
  }
}
```

---

## Authentication
- [ ] This server uses OAuth authentication  
(Leave unchecked — uses JWT via .p8 key and env vars.)

---

## Icon
- [ ] I've attached a square SVG logo to this issue  
(Attach `.github/assets/logo.webp` or export logo as SVG and attach to the issue.)

---

## Documentation URL (if applicable)
```
https://github.com/beautyfree/appstore-connect-mcp#readme
```

---

## Additional Context
```
- Valuable for developers shipping iOS/macOS apps: automate TestFlight, metadata, subscriptions, and reports from the IDE or CI.
- Open source, MIT. npm package: mcp-asc.
- Requires App Store Connect API key (.p8) and Key ID/Issuer ID from App Store Connect → Users and Access → Integrations. Optional vendor number for sales/finance reports.
- Official API docs: https://developer.apple.com/documentation/appstoreconnectapi
```

---

## Submission Guidelines
- [x] Read the Contributing Guidelines
- [x] Searched existing issues and servers to avoid duplicates
- [x] Server provides significant value to developer community
