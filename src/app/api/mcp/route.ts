/**
 * /api/mcp — HTTP endpoint for the NWA Dashboard MCP server
 *
 * Allows remote MCP clients (e.g. Claude.ai connectors, Claude Desktop)
 * to connect over the internet and query the dashboard data.
 *
 * Protocol: MCP Streamable HTTP (stateless — each POST is self-contained)
 *
 * Add as a connector in Claude.ai or configure in Claude Desktop:
 *   { "mcpServers": { "nwa-dashboard": { "url": "https://nwa-psi.vercel.app/api/mcp" } } }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerTools } from "@/lib/mcp-tools";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

function addCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
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

/**
 * Normalize the incoming request so the MCP SDK transport accepts it.
 *
 * The SDK requires `Accept: application/json, text/event-stream` on POST.
 * Some MCP clients (e.g. Claude.ai) may only send `Accept: application/json`.
 * We patch the header so the SDK doesn't reject it with 406.
 */
function normalizeRequest(request: Request): Request {
  const accept = request.headers.get("accept") ?? "";
  const needsJson = !accept.includes("application/json");
  const needsSse = !accept.includes("text/event-stream");

  if (needsJson || needsSse) {
    const parts: string[] = [];
    if (accept) parts.push(accept);
    if (needsJson) parts.push("application/json");
    if (needsSse) parts.push("text/event-stream");

    const headers = new Headers(request.headers);
    headers.set("accept", parts.join(", "));
    return new Request(request.url, {
      method: request.method,
      headers,
      body: request.body,
      // @ts-expect-error duplex is required for streaming bodies
      duplex: "half",
    });
  }

  return request;
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    const normalized = normalizeRequest(request);

    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless — works on serverless
      enableJsonResponse: true, // return JSON instead of SSE for serverless compat
    });

    const server = createServer();
    await server.connect(transport);

    const response = await transport.handleRequest(normalized);
    return addCorsHeaders(response);
  } catch (error) {
    console.error("MCP POST error:", error);
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      },
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      name: "nwa-dashboard",
      version: "1.0.0",
      status: "ok",
      protocol: "MCP Streamable HTTP",
      message: "Use POST with MCP protocol to interact with this server.",
    }),
    {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        Allow: "POST",
        ...CORS_HEADERS,
      },
    },
  );
}

export async function DELETE() {
  return new Response(null, { status: 405, headers: { Allow: "POST", ...CORS_HEADERS } });
}
