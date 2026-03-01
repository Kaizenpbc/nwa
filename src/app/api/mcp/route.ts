/**
 * /api/mcp — HTTP endpoint for the NWA Dashboard MCP server
 *
 * Allows remote MCP clients (e.g. Tom in another country) to connect
 * over the internet and query the dashboard data.
 *
 * Protocol: MCP Streamable HTTP (POST for requests, GET for SSE stream, DELETE to close)
 *
 * Tom configures his Claude Code or MCP client with:
 *   {
 *     "mcpServers": {
 *       "nwa-dashboard": {
 *         "type": "streamable-http",
 *         "url": "https://<your-deployed-url>/api/mcp"
 *       }
 *     }
 *   }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerTools } from "@/lib/mcp-tools";

// Stateless mode — each request is self-contained, no session tracking.
// This keeps the serverless deployment simple (no in-memory state needed).
function createTransport() {
  return new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
  });
}

function createServer() {
  const server = new McpServer({
    name: "nwa-dashboard",
    version: "1.0.0",
  });
  registerTools(server);
  return server;
}

export async function POST(request: Request) {
  const transport = createTransport();
  const server = createServer();
  await server.connect(transport);
  return transport.handleRequest(request);
}

export async function GET(request: Request) {
  const transport = createTransport();
  const server = createServer();
  await server.connect(transport);
  return transport.handleRequest(request);
}

export async function DELETE(request: Request) {
  return new Response(null, { status: 405 });
}
