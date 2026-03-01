import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════
//  NWA Jamaica — Complaint Dashboard MCP Server  (HTTP / SSE)
// ═══════════════════════════════════════════════════════════════════

// ── Reference Data ──────────────────────────────────────────────

const PARISHES = [
  "Kingston", "St. Andrew", "St. Thomas", "Portland", "St. Mary", "St. Ann",
  "Trelawny", "St. James", "Hanover", "Westmoreland", "St. Elizabeth",
  "Manchester", "Clarendon", "St. Catherine",
];

const CATEGORIES = [
  "Pothole", "Road Damage", "Flooding", "Drainage", "Signage", "Other",
];

const DEPARTMENTS = [
  "Road Maintenance", "Bridge & Drainage", "Parish Operations",
  "Traffic Management", "Major Projects", "Planning & Research",
];

const STATUS_LABELS = {
  pending: "Pending Approval",
  under_review: "Under Review",
  sent_review: "Sent for Review",
  resolved: "Resolved",
};

const SLA_DAYS = { high: 1, standard: 3, low: 5 };

// ── Helpers ─────────────────────────────────────────────────────

function generateId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = String(complaints.length + 1).padStart(4, "0");
  return `NWA-${date}-${seq}`;
}

function getSlaStatus(complaint) {
  const slaDays = SLA_DAYS[complaint.priority] || 3;
  const submitted = new Date(complaint.date);
  const deadline = new Date(submitted);
  deadline.setDate(deadline.getDate() + slaDays);
  const now = new Date();
  if (complaint.status === "resolved") return now <= deadline ? "met" : "missed";
  const elapsed = (now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24);
  if (elapsed > slaDays) return "breached";
  if (elapsed >= slaDays * 0.75) return "at_risk";
  return "on_track";
}

function getSlaDaysRemaining(complaint) {
  const slaDays = SLA_DAYS[complaint.priority] || 3;
  const submitted = new Date(complaint.date);
  const deadline = new Date(submitted);
  deadline.setDate(deadline.getDate() + slaDays);
  return Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
}

function formatComplaint(c) {
  return {
    id: c.id, category: c.category, description: c.desc, parish: c.parish,
    status: c.status, statusLabel: STATUS_LABELS[c.status] || c.status,
    date: c.date, priority: c.priority,
    location: { lat: c.lat, lng: c.lng },
    assignedTo: c.assignedTo || null, resolvedBy: c.resolvedBy || null, closedBy: c.closedBy || null,
    notes: c.notes || [],
    sla: { status: getSlaStatus(c), daysRemaining: getSlaDaysRemaining(c), deadlineDays: SLA_DAYS[c.priority] || 3 },
  };
}

// ── In-Memory Data Store ────────────────────────────────────────

let complaints = [
  { id: "NWA-20260215-0001", category: "Pothole", desc: "Large pothole on Washington Boulevard near Three Miles. Approximately 2 feet wide.", parish: "Kingston", status: "under_review", date: "2026-02-15", lat: 18.015, lng: -76.81, assignedTo: "Road Maintenance", priority: "high", notes: [] },
  { id: "NWA-20260216-0002", category: "Flooding", desc: "Persistent flooding at the intersection of Spanish Town Road and Marcus Garvey Drive after moderate rainfall.", parish: "Kingston", status: "pending", date: "2026-02-16", lat: 18.005, lng: -76.8, priority: "standard", notes: [] },
  { id: "NWA-20260217-0003", category: "Road Damage", desc: "Road surface severely damaged along a 200m stretch of the Junction Road near Castleton.", parish: "St. Mary", status: "resolved", date: "2026-02-17", lat: 18.25, lng: -76.88, assignedTo: "Parish Operations", resolvedBy: "J. Williams", closedBy: "M. Thompson", priority: "high", notes: [] },
  { id: "NWA-20260218-0004", category: "Signage", desc: "Missing directional sign at the roundabout entering Mandeville from the bypass.", parish: "Manchester", status: "pending", date: "2026-02-18", lat: 18.04, lng: -77.5, priority: "low", notes: [] },
  { id: "NWA-20260210-0005", category: "Pothole", desc: "Series of potholes on Constant Spring Road near Manor Park causing traffic slowdowns.", parish: "St. Andrew", status: "resolved", date: "2026-02-10", lat: 18.035, lng: -76.785, assignedTo: "Road Maintenance", resolvedBy: "D. Brown", closedBy: "S. Clarke", priority: "standard", notes: [] },
  { id: "NWA-20260211-0006", category: "Drainage", desc: "Blocked drain causing water accumulation on Red Hills Road near Stony Hill.", parish: "St. Andrew", status: "under_review", date: "2026-02-11", lat: 18.045, lng: -76.805, assignedTo: "Bridge & Drainage", priority: "standard", notes: [] },
  { id: "NWA-20260212-0007", category: "Road Damage", desc: "Road shoulder collapse on the North Coast Highway near Discovery Bay.", parish: "St. Ann", status: "sent_review", date: "2026-02-12", lat: 18.45, lng: -77.4, assignedTo: "Parish Operations", priority: "high", notes: [] },
  { id: "NWA-20260213-0008", category: "Flooding", desc: "Chronic flooding at Bog Walk Gorge entrance during moderate rainfall.", parish: "St. Catherine", status: "under_review", date: "2026-02-13", lat: 18.09, lng: -76.99, assignedTo: "Bridge & Drainage", priority: "standard", notes: [] },
  { id: "NWA-20260214-0009", category: "Pothole", desc: "Deep pothole on Molynes Road near Queensborough. Two vehicles damaged.", parish: "Kingston", status: "pending", date: "2026-02-14", lat: 18.02, lng: -76.8, priority: "high", notes: [] },
  { id: "NWA-20260219-0010", category: "Road Damage", desc: "Landslide debris partially blocking Junction Road near Hardware Gap.", parish: "St. Andrew", status: "pending", date: "2026-02-19", lat: 18.12, lng: -76.71, priority: "standard", notes: [] },
  { id: "NWA-20260219-0011", category: "Signage", desc: "Faded road markings on the Mandela Highway near Portmore toll plaza.", parish: "St. Catherine", status: "sent_review", date: "2026-02-19", lat: 18.005, lng: -76.87, assignedTo: "Traffic Management", priority: "low", notes: [] },
  { id: "NWA-20260220-0012", category: "Flooding", desc: "Severe flooding on Marcus Garvey Drive after overnight rain. Two lanes impassable.", parish: "Kingston", status: "pending", date: "2026-02-20", lat: 18.0, lng: -76.79, priority: "high", notes: [] },
];

// ═══════════════════════════════════════════════════════════════════
//  Register Tools (shared factory)
// ═══════════════════════════════════════════════════════════════════

function createServer() {
  const server = new McpServer({
    name: "nwa-complaint-dashboard",
    version: "1.0.0",
    description: "NWA Jamaica Complaint Dashboard — query, create, update, and manage road infrastructure complaints across Jamaica's 14 parishes.",
  });

  // ── Tool 1: list_complaints ───────────────────────────────────
  server.tool(
    "list_complaints",
    "List all complaints with optional filters. Returns summary of each complaint including SLA status.",
    {
      status: z.enum(["pending", "under_review", "sent_review", "resolved"]).optional().describe("Filter by status"),
      priority: z.enum(["high", "standard", "low"]).optional().describe("Filter by priority"),
      parish: z.string().optional().describe("Filter by parish name"),
      category: z.string().optional().describe("Filter by category"),
      search: z.string().optional().describe("Search keyword in description or ID"),
    },
    async (params) => {
      let results = [...complaints];
      if (params.status) results = results.filter(c => c.status === params.status);
      if (params.priority) results = results.filter(c => c.priority === params.priority);
      if (params.parish) results = results.filter(c => c.parish.toLowerCase() === params.parish.toLowerCase());
      if (params.category) results = results.filter(c => c.category.toLowerCase() === params.category.toLowerCase());
      if (params.search) {
        const q = params.search.toLowerCase();
        results = results.filter(c => c.id.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
      }
      return { content: [{ type: "text", text: JSON.stringify({ total: results.length, complaints: results.map(formatComplaint) }, null, 2) }] };
    }
  );

  // ── Tool 2: get_complaint ─────────────────────────────────────
  server.tool("get_complaint", "Get full details of a single complaint by tracking ID.", {
    id: z.string().describe("Complaint tracking ID"),
  }, async ({ id }) => {
    const c = complaints.find(x => x.id === id);
    if (!c) return { content: [{ type: "text", text: JSON.stringify({ error: `Complaint ${id} not found` }) }] };
    return { content: [{ type: "text", text: JSON.stringify(formatComplaint(c), null, 2) }] };
  });

  // ── Tool 3: create_complaint ──────────────────────────────────
  server.tool("create_complaint", "Submit a new complaint. Returns auto-generated tracking ID.", {
    category: z.enum(["Pothole", "Road Damage", "Flooding", "Drainage", "Signage", "Other"]).describe("Issue category"),
    description: z.string().describe("Description of the issue"),
    parish: z.string().describe("Parish where the issue is located"),
    priority: z.enum(["high", "standard", "low"]).default("standard").describe("Priority level"),
    lat: z.number().optional().describe("Latitude"),
    lng: z.number().optional().describe("Longitude"),
  }, async (params) => {
    if (!PARISHES.includes(params.parish)) {
      return { content: [{ type: "text", text: JSON.stringify({ error: `Invalid parish. Valid: ${PARISHES.join(", ")}` }) }] };
    }
    const id = generateId();
    const complaint = { id, category: params.category, desc: params.description, parish: params.parish, status: "pending", date: new Date().toISOString().slice(0, 10), lat: params.lat || 18.0, lng: params.lng || -76.8, priority: params.priority, notes: [] };
    complaints.push(complaint);
    return { content: [{ type: "text", text: JSON.stringify({ success: true, trackingId: id, complaint: formatComplaint(complaint) }, null, 2) }] };
  });

  // ── Tool 4: update_complaint_status ───────────────────────────
  server.tool("update_complaint_status", "Update complaint status. 2-person closeout required for resolving.", {
    id: z.string().describe("Complaint tracking ID"),
    status: z.enum(["pending", "under_review", "sent_review", "resolved"]).describe("New status"),
    resolvedBy: z.string().optional().describe("Person who resolved (required for resolved)"),
    closedBy: z.string().optional().describe("Second person who approved (required for resolved)"),
  }, async (params) => {
    const c = complaints.find(x => x.id === params.id);
    if (!c) return { content: [{ type: "text", text: JSON.stringify({ error: `Complaint ${params.id} not found` }) }] };
    if (params.status === "resolved") {
      if (!params.resolvedBy || !params.closedBy) return { content: [{ type: "text", text: JSON.stringify({ error: "2-person closeout required. Provide both resolvedBy and closedBy." }) }] };
      if (params.resolvedBy === params.closedBy) return { content: [{ type: "text", text: JSON.stringify({ error: "resolvedBy and closedBy must be different people." }) }] };
      c.resolvedBy = params.resolvedBy;
      c.closedBy = params.closedBy;
    }
    const oldStatus = c.status;
    c.status = params.status;
    return { content: [{ type: "text", text: JSON.stringify({ success: true, message: `${STATUS_LABELS[oldStatus]} → ${STATUS_LABELS[params.status]}`, complaint: formatComplaint(c) }, null, 2) }] };
  });

  // ── Tool 5: assign_complaint ──────────────────────────────────
  server.tool("assign_complaint", "Assign a complaint to a department.", {
    id: z.string().describe("Complaint tracking ID"),
    department: z.string().describe("Department to assign to"),
  }, async (params) => {
    const c = complaints.find(x => x.id === params.id);
    if (!c) return { content: [{ type: "text", text: JSON.stringify({ error: `Complaint ${params.id} not found` }) }] };
    if (!DEPARTMENTS.includes(params.department)) return { content: [{ type: "text", text: JSON.stringify({ error: `Invalid department. Valid: ${DEPARTMENTS.join(", ")}` }) }] };
    const old = c.assignedTo;
    c.assignedTo = params.department;
    return { content: [{ type: "text", text: JSON.stringify({ success: true, message: old ? `Reassigned: ${old} → ${params.department}` : `Assigned to ${params.department}`, complaint: formatComplaint(c) }, null, 2) }] };
  });

  // ── Tool 6: add_complaint_note ────────────────────────────────
  server.tool("add_complaint_note", "Add an internal case note to a complaint.", {
    id: z.string().describe("Complaint tracking ID"),
    author: z.string().describe("Person adding the note"),
    text: z.string().describe("Note content"),
  }, async (params) => {
    const c = complaints.find(x => x.id === params.id);
    if (!c) return { content: [{ type: "text", text: JSON.stringify({ error: `Complaint ${params.id} not found` }) }] };
    if (!c.notes) c.notes = [];
    const note = { author: params.author, text: params.text, timestamp: new Date().toISOString() };
    c.notes.push(note);
    return { content: [{ type: "text", text: JSON.stringify({ success: true, totalNotes: c.notes.length, note }, null, 2) }] };
  });

  // ── Tool 7: get_dashboard_stats ───────────────────────────────
  server.tool("get_dashboard_stats", "Executive KPI dashboard: totals, SLA metrics, priority breakdown, parish hotspots.", {}, async () => {
    const total = complaints.length;
    const byStatus = {}, byPriority = {}, byParish = {}, byCategory = {};
    const slaBreached = [], slaAtRisk = [];
    let slaMet = 0, slaMissed = 0;
    for (const c of complaints) {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      byPriority[c.priority] = (byPriority[c.priority] || 0) + 1;
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
      if (c.status !== "resolved") byParish[c.parish] = (byParish[c.parish] || 0) + 1;
      const sla = getSlaStatus(c);
      if (sla === "breached") slaBreached.push(c.id);
      if (sla === "at_risk") slaAtRisk.push(c.id);
      if (sla === "met") slaMet++;
      if (sla === "missed") slaMissed++;
    }
    const parishHotspots = Object.entries(byParish).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([parish, count]) => ({ parish, openComplaints: count }));
    return { content: [{ type: "text", text: JSON.stringify({ summary: { total, open: total - (byStatus.resolved || 0), resolved: byStatus.resolved || 0, pending: byStatus.pending || 0, underReview: byStatus.under_review || 0, sentForReview: byStatus.sent_review || 0 }, sla: { breached: slaBreached.length, breachedIds: slaBreached, atRisk: slaAtRisk.length, atRiskIds: slaAtRisk, metCount: slaMet, missedCount: slaMissed }, byPriority, byCategory, parishHotspots }, null, 2) }] };
  });

  // ── Tool 8: get_parish_hotspots ───────────────────────────────
  server.tool("get_parish_hotspots", "Complaint hotspot analysis by parish.", {}, async () => {
    const parishes = {};
    for (const c of complaints) {
      if (c.status === "resolved") continue;
      if (!parishes[c.parish]) parishes[c.parish] = { total: 0, high: 0, standard: 0, low: 0, categories: {} };
      const p = parishes[c.parish];
      p.total++; p[c.priority] = (p[c.priority] || 0) + 1;
      p.categories[c.category] = (p.categories[c.category] || 0) + 1;
    }
    const hotspots = Object.entries(parishes).sort((a, b) => b[1].total - a[1].total).map(([parish, data]) => ({ parish, openComplaints: data.total, priorities: { high: data.high, standard: data.standard, low: data.low }, topCategories: Object.entries(data.categories).sort((a, b) => b[1] - a[1]).map(([cat, count]) => ({ category: cat, count })) }));
    return { content: [{ type: "text", text: JSON.stringify({ hotspots }, null, 2) }] };
  });

  // ── Tool 9: escalate_complaint ────────────────────────────────
  server.tool("escalate_complaint", "Escalate a complaint to high priority.", {
    id: z.string().describe("Complaint tracking ID"),
    reason: z.string().describe("Reason for escalation"),
    escalatedBy: z.string().describe("Person escalating"),
  }, async (params) => {
    const c = complaints.find(x => x.id === params.id);
    if (!c) return { content: [{ type: "text", text: JSON.stringify({ error: `Complaint ${params.id} not found` }) }] };
    const oldPriority = c.priority;
    c.priority = "high";
    if (!c.notes) c.notes = [];
    c.notes.push({ author: params.escalatedBy, text: `ESCALATED to high priority. Reason: ${params.reason}`, timestamp: new Date().toISOString() });
    return { content: [{ type: "text", text: JSON.stringify({ success: true, message: `Escalated from ${oldPriority} → high`, complaint: formatComplaint(c) }, null, 2) }] };
  });

  // ── Tool 10: search_complaints ────────────────────────────────
  server.tool("search_complaints", "Full-text search across all complaint fields.", {
    query: z.string().describe("Search query"),
  }, async ({ query }) => {
    const q = query.toLowerCase();
    const scored = complaints.map(c => {
      let score = 0;
      if (c.id.toLowerCase().includes(q)) score += 10;
      if (c.desc.toLowerCase().includes(q)) score += 5;
      if (c.parish.toLowerCase().includes(q)) score += 3;
      if (c.category.toLowerCase().includes(q)) score += 3;
      if (c.assignedTo && c.assignedTo.toLowerCase().includes(q)) score += 2;
      if (c.notes) for (const n of c.notes) { if (n.text.toLowerCase().includes(q)) score += 1; }
      return { complaint: c, score };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
    return { content: [{ type: "text", text: JSON.stringify({ query, total: scored.length, results: scored.map(x => ({ ...formatComplaint(x.complaint), relevanceScore: x.score })) }, null, 2) }] };
  });

  return server;
}

// ═══════════════════════════════════════════════════════════════════
//  HTTP Server (Streamable HTTP + SSE)
// ═══════════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

// Session store
const transports = {};

// POST /mcp — main MCP endpoint
app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];

  try {
    let transport;

    if (sessionId && transports[sessionId]) {
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid) => {
          console.log(`Session initialized: ${sid}`);
          transports[sid] = transport;
        },
      });

      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && transports[sid]) {
          delete transports[sid];
        }
      };

      const server = createServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    } else {
      res.status(400).json({ jsonrpc: "2.0", error: { code: -32000, message: "Bad Request: No valid session ID" }, id: null });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null });
    }
  }
});

// GET /mcp — SSE stream
app.get("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }
  await transports[sessionId].handleRequest(req, res);
});

// DELETE /mcp — session termination
app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }
  await transports[sessionId].handleRequest(req, res);
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", server: "nwa-complaint-dashboard", version: "1.0.0", tools: 10, complaints: complaints.length });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`NWA Complaint Dashboard MCP server (HTTP) listening on http://0.0.0.0:${PORT}/mcp`);
});

process.on("SIGINT", async () => {
  for (const sid in transports) {
    await transports[sid].close().catch(() => {});
    delete transports[sid];
  }
  process.exit(0);
});
