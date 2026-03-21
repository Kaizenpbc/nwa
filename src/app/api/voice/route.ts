/**
 * /api/voice — Natural language query handler for the voice interface
 *
 * Takes a plain-text question, detects intent via keyword matching,
 * queries the relevant data, and returns a spoken-friendly response.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  COMPLAINTS_INIT,
  PROJECTS,
  CLOSURES,
  NEWS,
  EMERGENCY_EVENTS,
  PARISHES,
  getSlaStatus,
  getSlaDaysRemaining,
} from "@/data/mock";

// ── Intent detection ─────────────────────────────────────────

type Intent =
  | "emergency"
  | "closures"
  | "projects"
  | "news"
  | "complaints"
  | "parish"
  | "summary"
  | "unknown";

function detectIntent(q: string): Intent {
  const t = q.toLowerCase();
  if (/emergenc|flood|storm|disaster|crisis|critical event/.test(t)) return "emergency";
  if (/clos|block|shut|road advis/.test(t)) return "closures";
  if (/project|construct|infrastructure|work|build/.test(t)) return "projects";
  if (/news|press|announc|update|release/.test(t)) return "news";
  if (/complaint|issue|report|pothole|damage|drain|signage/.test(t)) return "complaints";
  if (PARISHES.some((p) => t.includes(p.toLowerCase()))) return "parish";
  if (/summary|overview|dashboard|status|how many|total|kpi/.test(t)) return "summary";
  return "unknown";
}

function detectParish(q: string): string | null {
  const t = q.toLowerCase();
  return PARISHES.find((p) => t.includes(p.toLowerCase())) ?? null;
}

// ── Response builders ────────────────────────────────────────

function buildEmergencyResponse(parish: string | null): string {
  let events = [...EMERGENCY_EVENTS];
  if (parish) events = events.filter((e) => e.parishes.some((p) => p.toLowerCase() === parish.toLowerCase()));

  const active = events.filter((e) => e.status === "active");
  if (events.length === 0) return parish ? `No emergency events found for ${parish}.` : "There are no active emergency events at this time.";

  const lines = active.length > 0
    ? active.map((e) => `${e.name} in ${e.parishes.join(", ")} — ${e.crewsDeployed} crews deployed, ${e.roadsAffected} roads affected.`)
    : events.slice(0, 3).map((e) => `${e.name} — status: ${e.status}.`);

  return `There ${active.length === 1 ? "is" : "are"} ${active.length} active emergency event${active.length !== 1 ? "s" : ""}. ${lines.join(" ")}`;
}

function buildClosuresResponse(parish: string | null): string {
  let closures = [...CLOSURES];
  if (parish) closures = closures.filter((c) => c.parish.toLowerCase() === parish.toLowerCase());

  if (closures.length === 0) return parish ? `No road closures in ${parish} right now.` : "No road closures are currently reported.";

  const critical = closures.filter((c) => c.severity === "critical");
  const top = closures.slice(0, 3);
  const prefix = critical.length > 0 ? `${critical.length} critical closure${critical.length !== 1 ? "s" : ""}. ` : "";
  const details = top.map((c) => `${c.road} in ${c.parish}: ${c.reason}.`).join(" ");
  return `${prefix}${closures.length} total closure${closures.length !== 1 ? "s" : ""}. ${details}`;
}

function buildProjectsResponse(parish: string | null): string {
  let projects = [...PROJECTS];
  if (parish) projects = projects.filter((p) => p.parish.toLowerCase() === parish.toLowerCase());

  if (projects.length === 0) return parish ? `No projects found for ${parish}.` : "No projects found.";

  const inProgress = projects.filter((p) => p.status === "in_progress");
  const delayed = projects.filter((p) => p.status === "delayed");
  const top = inProgress.slice(0, 2);

  let msg = `${projects.length} project${projects.length !== 1 ? "s" : ""} total. ${inProgress.length} in progress`;
  if (delayed.length > 0) msg += `, ${delayed.length} delayed`;
  msg += ".";
  if (top.length > 0) msg += " " + top.map((p) => `${p.title} in ${p.parish} is ${p.pct}% complete.`).join(" ");
  return msg;
}

function buildNewsResponse(parish: string | null): string {
  let news = [...NEWS];
  if (parish) news = news.filter((n) => n.parish.toLowerCase() === parish.toLowerCase());

  if (news.length === 0) return "No news articles found.";

  const latest = news.slice(0, 3);
  return `Latest news: ${latest.map((n) => n.title).join(". ")}.`;
}

function buildComplaintsResponse(parish: string | null): string {
  let complaints = [...COMPLAINTS_INIT];
  if (parish) complaints = complaints.filter((c) => c.parish.toLowerCase() === parish.toLowerCase());

  const open = complaints.filter((c) => c.status !== "resolved");
  const breached = complaints.filter((c) => getSlaStatus(c) === "breached");
  const atRisk = complaints.filter((c) => getSlaStatus(c) === "at_risk");

  return `${complaints.length} complaint${complaints.length !== 1 ? "s" : ""} total${parish ? ` in ${parish}` : ""}. ${open.length} open. ${breached.length} SLA breached, ${atRisk.length} at risk.`;
}

function buildParishResponse(parish: string): string {
  const p = parish.toLowerCase();
  const complaints = COMPLAINTS_INIT.filter((c) => c.parish.toLowerCase() === p);
  const projects = PROJECTS.filter((pr) => pr.parish.toLowerCase() === p);
  const closures = CLOSURES.filter((cl) => cl.parish.toLowerCase() === p);
  const emergencies = EMERGENCY_EVENTS.filter((e) => e.parishes.some((ep) => ep.toLowerCase() === p));
  const active = emergencies.filter((e) => e.status === "active");
  const openComplaints = complaints.filter((c) => c.status !== "resolved");

  return `${parish} overview: ${openComplaints.length} open complaint${openComplaints.length !== 1 ? "s" : ""}, ${projects.length} project${projects.length !== 1 ? "s" : ""}, ${closures.length} road closure${closures.length !== 1 ? "s" : ""}, ${active.length} active emergency${active.length !== 1 ? " events" : " event"}.`;
}

function buildSummaryResponse(): string {
  const total = COMPLAINTS_INIT.length;
  const open = COMPLAINTS_INIT.filter((c) => c.status !== "resolved").length;
  const breached = COMPLAINTS_INIT.filter((c) => getSlaStatus(c) === "breached").length;
  const activeEmergencies = EMERGENCY_EVENTS.filter((e) => e.status === "active").length;
  const activeCriticalClosures = CLOSURES.filter((c) => c.severity === "critical").length;
  const inProgressProjects = PROJECTS.filter((p) => p.status === "in_progress").length;

  return `Dashboard summary: ${total} total complaints, ${open} open, ${breached} SLA breached. ${activeEmergencies} active emergency event${activeEmergencies !== 1 ? "s" : ""}. ${activeCriticalClosures} critical road closure${activeCriticalClosures !== 1 ? "s" : ""}. ${inProgressProjects} project${inProgressProjects !== 1 ? "s" : ""} in progress.`;
}

// ── Route handler ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const intent = detectIntent(query);
  const parish = detectParish(query);

  let response: string;
  switch (intent) {
    case "emergency":
      response = buildEmergencyResponse(parish);
      break;
    case "closures":
      response = buildClosuresResponse(parish);
      break;
    case "projects":
      response = buildProjectsResponse(parish);
      break;
    case "news":
      response = buildNewsResponse(parish);
      break;
    case "complaints":
      response = buildComplaintsResponse(parish);
      break;
    case "parish":
      response = buildParishResponse(parish!);
      break;
    case "summary":
      response = buildSummaryResponse();
      break;
    default:
      response = "I can help with emergencies, road closures, projects, news, complaints, or a parish overview. Try asking about one of those topics.";
  }

  return NextResponse.json({ response, intent, parish });
}
