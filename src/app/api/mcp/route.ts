/**
 * /api/mcp — HTTP endpoint for the NWA Dashboard MCP server
 *
 * Allows remote MCP clients (e.g. Tom in another country) to connect
 * over the internet and query the dashboard data.
 *
 * Protocol: MCP Streamable HTTP (stateless — each POST is self-contained)
 *
 * Tom configures his Claude Desktop or MCP client with:
 *   {
 *     "mcpServers": {
 *       "nwa-dashboard": {
 *         "url": "https://nwa-psi.vercel.app/api/mcp"
 *       }
 *     }
 *   }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerTools } from "@/lib/mcp-tools";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, Mcp-Session-Id",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

function createServer() {
  const server = new McpServer({
    name: "nwa-dashboard",
    version: "1.0.0",
  });
  registerTools(server);
  return server;
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(request: Request) {
  try {
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless — works on serverless
    });

    const server = createServer();
    await server.connect(transport);

    const response = await transport.handleRequest(request);

    // Merge CORS headers into the response
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      headers.set(key, value);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
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
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS,
        },
      },
    );
  }
}

export async function GET() {
  // GET is used for SSE streams — not supported in stateless serverless mode.
  // Return a friendly JSON response so clients know the endpoint is alive.
  return new Response(
    JSON.stringify({
      name: "nwa-dashboard",
      version: "1.0.0",
      status: "ok",
      message: "NWA Dashboard MCP server. Use POST with MCP Streamable HTTP protocol.",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS,
      },
    },
  );
}

export async function DELETE() {
  return new Response(null, {
    status: 405,
    headers: CORS_HEADERS,
  });
}
