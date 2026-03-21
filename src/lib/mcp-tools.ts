/**
 * NWA Dashboard MCP Tools — shared registration
 *
 * Registers all dashboard query tools on a given McpServer instance.
 * Used by both the stdio server (mcp-server.ts) and the HTTP route
 * (src/app/api/mcp/route.ts).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  COMPLAINTS_INIT,
  PROJECTS,
  CLOSURES,
  NEWS,
  EMERGENCY_EVENTS,
  PARISHES,
  COMPLAINT_CATEGORIES,
  DEPARTMENTS,
  SLA_DAYS,
  PARISH_ALERT_LEVELS,
  getSlaStatus,
  getSlaDaysRemaining,
  type Complaint,
} from "@/data/mock";

// ── Helper: build KPI summary ─────────────────────────────────

function buildDashboardKPIs(complaints: Complaint[]) {
  const total = complaints.length;
  const open = complaints.filter((c) => c.status !== "resolved").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;
  const breached = complaints.filter((c) => getSlaStatus(c) === "breached").length;
  const atRisk = complaints.filter((c) => getSlaStatus(c) === "at_risk").length;
  const byStatus: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byParish: Record<string, number> = {};
  const byPriority: Record<string, number> = {};

  for (const c of complaints) {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    byParish[c.parish] = (byParish[c.parish] || 0) + 1;
    byPriority[c.priority] = (byPriority[c.priority] || 0) + 1;
  }

  return { total, open, resolved, breached, atRisk, byStatus, byCategory, byParish, byPriority };
}

export type UserRole = "staff" | "public";

// ── Register tools on a server instance ───────────────────────

export function registerTools(server: McpServer, role: UserRole = "public") {
  if (role === "staff") {
    server.tool(
      "get-dashboard-summary",
      "Get a high-level KPI summary of the NWA complaint dashboard including totals, open/resolved counts, SLA stats, and breakdowns by status, category, parish, and priority.",
      {},
      async () => {
        const kpis = buildDashboardKPIs(COMPLAINTS_INIT);
        return { content: [{ type: "text", text: JSON.stringify(kpis, null, 2) }] };
      },
    );

    server.tool(
      "query-complaints",
      "Search and filter NWA complaints. Returns matching complaints with SLA status.",
      {
        search: z.string().optional().describe("Free-text search across ID, description, parish, category"),
        status: z.enum(["pending", "under_review", "sent_review", "resolved"]).optional().describe("Filter by complaint status"),
        priority: z.enum(["high", "standard", "low"]).optional().describe("Filter by priority level"),
        parish: z.string().optional().describe("Filter by parish name"),
        category: z.string().optional().describe("Filter by complaint category (Pothole, Road Damage, Flooding, Drainage, Signage, Other)"),
        sla_status: z.enum(["on_track", "at_risk", "breached", "met", "missed"]).optional().describe("Filter by SLA status"),
        limit: z.number().optional().default(20).describe("Max results to return (default 20)"),
      },
      async ({ search, status, priority, parish, category, sla_status, limit }) => {
        let results = [...COMPLAINTS_INIT];

        if (search) {
          const q = search.toLowerCase();
          results = results.filter(
            (c) =>
              c.id.toLowerCase().includes(q) ||
              c.desc.toLowerCase().includes(q) ||
              c.parish.toLowerCase().includes(q) ||
              c.category.toLowerCase().includes(q),
          );
        }
        if (status) results = results.filter((c) => c.status === status);
        if (priority) results = results.filter((c) => c.priority === priority);
        if (parish) results = results.filter((c) => c.parish.toLowerCase() === parish.toLowerCase());
        if (category) results = results.filter((c) => c.category.toLowerCase() === category.toLowerCase());
        if (sla_status) results = results.filter((c) => getSlaStatus(c) === sla_status);

        const enriched = results.slice(0, limit).map((c) => ({
          ...c,
          slaStatus: getSlaStatus(c),
          slaDaysRemaining: getSlaDaysRemaining(c),
        }));

        return {
          content: [{ type: "text", text: JSON.stringify({ count: results.length, complaints: enriched }, null, 2) }],
        };
      },
    );
  }

  server.tool(
    "query-projects",
    "Search and filter NWA infrastructure projects.",
    {
      parish: z.string().optional().describe("Filter by parish"),
      status: z.enum(["complete", "in_progress", "planned", "delayed"]).optional().describe("Filter by project status"),
      search: z.string().optional().describe("Free-text search across title, description, parish"),
    },
    async ({ parish, status, search }) => {
      let results = [...PROJECTS];

      if (search) {
        const q = search.toLowerCase();
        results = results.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.desc.toLowerCase().includes(q) ||
            p.parish.toLowerCase().includes(q),
        );
      }
      if (parish) results = results.filter((p) => p.parish.toLowerCase() === parish.toLowerCase());
      if (status) results = results.filter((p) => p.status === status);

      return {
        content: [{ type: "text", text: JSON.stringify({ count: results.length, projects: results }, null, 2) }],
      };
    },
  );

  server.tool(
    "query-closures",
    "Search and filter road closures and advisories.",
    {
      parish: z.string().optional().describe("Filter by parish"),
      severity: z.enum(["critical", "warning", "info"]).optional().describe("Filter by severity"),
    },
    async ({ parish, severity }) => {
      let results = [...CLOSURES];

      if (parish) results = results.filter((c) => c.parish.toLowerCase() === parish.toLowerCase());
      if (severity) results = results.filter((c) => c.severity === severity);

      return {
        content: [{ type: "text", text: JSON.stringify({ count: results.length, closures: results }, null, 2) }],
      };
    },
  );

  server.tool(
    "query-news",
    "Get NWA news articles and press releases.",
    {
      category: z.string().optional().describe("Filter by category (Press Release, Road Advisory, Announcement, Update)"),
      parish: z.string().optional().describe("Filter by parish"),
      search: z.string().optional().describe("Free-text search across title and excerpt"),
    },
    async ({ category, parish, search }) => {
      let results = [...NEWS];

      if (search) {
        const q = search.toLowerCase();
        results = results.filter(
          (n) => n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q),
        );
      }
      if (category) results = results.filter((n) => n.category.toLowerCase() === category.toLowerCase());
      if (parish) results = results.filter((n) => n.parish.toLowerCase() === parish.toLowerCase());

      return {
        content: [{ type: "text", text: JSON.stringify({ count: results.length, news: results }, null, 2) }],
      };
    },
  );

  server.tool(
    "query-emergencies",
    "Get active and recent emergency events.",
    {
      status: z.enum(["active", "monitoring", "assessment", "resolved"]).optional().describe("Filter by event status"),
      severity: z.enum(["critical", "warning", "info"]).optional().describe("Filter by severity"),
      parish: z.string().optional().describe("Filter by affected parish"),
    },
    async ({ status, severity, parish }) => {
      let results = [...EMERGENCY_EVENTS];

      if (status) results = results.filter((e) => e.status === status);
      if (severity) results = results.filter((e) => e.severity === severity);
      if (parish) results = results.filter((e) => e.parishes.some((p) => p.toLowerCase() === parish!.toLowerCase()));

      const summary = {
        activeEvents: results.filter((e) => e.status === "active").length,
        totalRoadsAffected: results.reduce((sum, e) => sum + e.roadsAffected, 0),
        totalCrewsDeployed: results.reduce((sum, e) => sum + e.crewsDeployed, 0),
      };

      return {
        content: [{ type: "text", text: JSON.stringify({ count: results.length, summary, events: results }, null, 2) }],
      };
    },
  );

  server.tool(
    "get-parish-overview",
    role === "staff"
      ? "Get a complete overview for a specific parish — complaints, projects, closures, emergencies, and alert level."
      : "Get a public overview for a specific parish — projects, closures, emergencies, and alert level.",
    {
      parish: z.string().describe("Parish name (e.g. Kingston, St. Andrew, St. Catherine)"),
    },
    async ({ parish }) => {
      const p = parish.toLowerCase();
      const projects = PROJECTS.filter((pr) => pr.parish.toLowerCase() === p);
      const closures = CLOSURES.filter((cl) => cl.parish.toLowerCase() === p);
      const emergencies = EMERGENCY_EVENTS.filter((e) =>
        e.parishes.some((ep) => ep.toLowerCase() === p),
      );

      const matchedParish = PARISHES.find((name) => name.toLowerCase() === p) || parish;
      const alertLevel = PARISH_ALERT_LEVELS[matchedParish] || "unknown";

      const payload: Record<string, unknown> = {
        parish: matchedParish,
        alertLevel,
        projects: { count: projects.length, items: projects },
        closures: { count: closures.length, items: closures },
        emergencies: { count: emergencies.length, items: emergencies },
      };

      if (role === "staff") {
        const complaints = COMPLAINTS_INIT.filter((c) => c.parish.toLowerCase() === p).map((c) => ({
          ...c,
          slaStatus: getSlaStatus(c),
          slaDaysRemaining: getSlaDaysRemaining(c),
        }));
        payload.complaints = { count: complaints.length, items: complaints };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      };
    },
  );

  server.tool(
    "list-reference-data",
    "List available parishes, complaint categories, departments, SLA rules, and parish alert levels.",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                parishes: PARISHES,
                complaintCategories: COMPLAINT_CATEGORIES,
                departments: DEPARTMENTS,
                slaDays: SLA_DAYS,
                parishAlertLevels: PARISH_ALERT_LEVELS,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
