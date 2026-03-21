/**
 * /api/mcp — HTTP endpoint for the NWA Dashboard MCP server
 *
 * Protocol: MCP Streamable HTTP (stateless)
 *
 * Connect in Claude.ai: https://<domain>/api/mcp
 * Claude Desktop:  { "mcpServers": { "nwa": { "url": "https://<domain>/api/mcp" } } }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerTools, type UserRole } from "@/lib/mcp-tools";

/**
 * Staff token — set NWA_STAFF_TOKEN in your environment.
 * Requests with `Authorization: Bearer <token>` matching this value
 * receive full access (complaints + SLA data).  All other requests are
 * treated as public and receive the restricted tool set.
 */
const STAFF_TOKEN = process.env.NWA_STAFF_TOKEN ?? "";

function resolveRole(request: Request): UserRole {
  if (!STAFF_TOKEN) return "public";
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return token === STAFF_TOKEN ? "staff" : "public";
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, Mcp-Protocol-Version",
};

function corsResponse(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * The MCP SDK requires `Accept: application/json, text/event-stream` on POST.
 * Some clients (including Claude.ai) may omit one or both. Patch before
 * forwarding to the SDK so it doesn't 406.
 */
function normalizeAccept(req: Request): Request {
  const accept = req.headers.get("accept") ?? "";
  const hasJson = accept.includes("application/json");
  const hasSse = accept.includes("text/event-stream");
  if (hasJson && hasSse) return req;

  const parts: string[] = [];
  if (accept) parts.push(accept);
  if (!hasJson) parts.push("application/json");
  if (!hasSse) parts.push("text/event-stream");

  const h = new Headers(req.headers);
  h.set("accept", parts.join(", "));
  return new Request(req.url, {
    method: req.method,
    headers: h,
    body: req.body,
    // @ts-expect-error duplex required for streaming bodies
    duplex: "half",
  });
}

function createServer(role: UserRole) {
  const s = new McpServer({ name: "nwa-dashboard", version: "1.0.0" });
  registerTools(s, role);
  return s;
}

// ── HTTP verb handlers ───────────────────────────────────────

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    const role = resolveRole(request);
    const normalized = normalizeAccept(request);

    // Stateless: fresh transport + server per request (serverless-safe)
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    const server = createServer(role);
    await server.connect(transport);

    const response = await transport.handleRequest(normalized);
    return corsResponse(response);
  } catch (err) {
    console.error("MCP POST error:", err);
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } },
    );
  }
}

export async function GET() {
  // 405 with Allow: POST tells MCP clients this is a POST-only endpoint
  return new Response(
    JSON.stringify({
      name: "nwa-dashboard",
      version: "1.0.0",
      status: "ok",
      protocol: "MCP Streamable HTTP (stateless)",
      instructions: "POST a JSON-RPC message to interact with this MCP server.",
    }),
    {
      status: 405,
      headers: { "Content-Type": "application/json", Allow: "POST", ...CORS_HEADERS },
    },
  );
}

export async function DELETE() {
  return new Response(null, { status: 405, headers: { Allow: "POST", ...CORS_HEADERS } });
}
