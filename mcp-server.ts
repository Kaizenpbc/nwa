#!/usr/bin/env npx tsx
/**
 * NWA Dashboard MCP Server (stdio transport)
 *
 * For local Claude Code usage via .mcp.json.
 * Tools are defined in src/lib/mcp-tools.ts (shared with the HTTP route).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./src/lib/mcp-tools.js";

const server = new McpServer({
  name: "nwa-dashboard",
  version: "1.0.0",
});

registerTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
