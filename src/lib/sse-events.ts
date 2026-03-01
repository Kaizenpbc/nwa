/**
 * NWA SSE Event Generator
 *
 * Produces a stream of realistic NWA events:
 *  - SLA breach / at-risk warnings
 *  - New complaints
 *  - Road closure updates
 *  - Emergency escalations
 *  - Project milestone updates
 *
 * In production this would be backed by a database change stream or
 * message queue. For now it simulates events from mock data on a timer.
 */

import {
  COMPLAINTS_INIT,
  CLOSURES,
  EMERGENCY_EVENTS,
  PROJECTS,
  PARISHES,
  PARISH_ALERT_LEVELS,
  COMPLAINT_CATEGORIES,
  getSlaStatus,
  getSlaDaysRemaining,
  type Complaint,
  type Closure,
  type EmergencyEvent,
  type Project,
} from "@/data/mock";

// ── Event types ────────────────────────────────────────────────

export interface NWAEvent {
  id: string;
  type:
    | "sla_breach"
    | "sla_at_risk"
    | "new_complaint"
    | "closure_update"
    | "emergency_escalation"
    | "project_milestone"
    | "parish_alert";
  severity: "critical" | "warning" | "info";
  title: string;
  detail: string;
  parish: string;
  timestamp: string;
  data: Record<string, unknown>;
}

// ── Generators — each produces one event type ──────────────────

let eventSeq = 0;
function nextId(): string {
  return `evt-${Date.now()}-${++eventSeq}`;
}

function slaEvents(): NWAEvent[] {
  const events: NWAEvent[] = [];
  for (const c of COMPLAINTS_INIT) {
    const sla = getSlaStatus(c);
    if (sla === "breached") {
      events.push({
        id: nextId(),
        type: "sla_breach",
        severity: "critical",
        title: `SLA Breached: ${c.id}`,
        detail: `${c.category} complaint in ${c.parish} has exceeded its SLA deadline by ${Math.abs(getSlaDaysRemaining(c))} day(s).`,
        parish: c.parish,
        timestamp: new Date().toISOString(),
        data: { complaintId: c.id, category: c.category, priority: c.priority, daysOverdue: Math.abs(getSlaDaysRemaining(c)) },
      });
    } else if (sla === "at_risk") {
      events.push({
        id: nextId(),
        type: "sla_at_risk",
        severity: "warning",
        title: `SLA At Risk: ${c.id}`,
        detail: `${c.category} complaint in ${c.parish} has ${getSlaDaysRemaining(c)} day(s) remaining before breach.`,
        parish: c.parish,
        timestamp: new Date().toISOString(),
        data: { complaintId: c.id, category: c.category, priority: c.priority, daysRemaining: getSlaDaysRemaining(c) },
      });
    }
  }
  return events;
}

function emergencyEvents(): NWAEvent[] {
  return EMERGENCY_EVENTS.filter((e) => e.status === "active").map((e) => ({
    id: nextId(),
    type: "emergency_escalation" as const,
    severity: e.severity === "critical" ? "critical" as const : "warning" as const,
    title: `Emergency: ${e.name}`,
    detail: `${e.desc} — ${e.roadsAffected} road(s) affected, ${e.crewsDeployed} crew(s) deployed.`,
    parish: e.parishes[0],
    timestamp: new Date().toISOString(),
    data: { eventId: e.id, type: e.type, parishes: e.parishes, roadsAffected: e.roadsAffected, crewsDeployed: e.crewsDeployed },
  }));
}

function closureEvents(): NWAEvent[] {
  return CLOSURES.filter((c) => c.push).map((c) => ({
    id: nextId(),
    type: "closure_update" as const,
    severity: c.severity === "critical" ? "critical" as const : c.severity === "warning" ? "warning" as const : "info" as const,
    title: `Road Closure: ${c.road}`,
    detail: `${c.road} (${c.parish}) closed ${c.start} to ${c.end} — ${c.reason}. Detour: ${c.detour}`,
    parish: c.parish,
    timestamp: new Date().toISOString(),
    data: { closureId: c.id, road: c.road, start: c.start, end: c.end, detour: c.detour },
  }));
}

function parishAlertEvents(): NWAEvent[] {
  const events: NWAEvent[] = [];
  for (const [parish, level] of Object.entries(PARISH_ALERT_LEVELS)) {
    if (level === "emergency" || level === "warning") {
      events.push({
        id: nextId(),
        type: "parish_alert",
        severity: level === "emergency" ? "critical" : "warning",
        title: `Parish Alert: ${parish} — ${level.toUpperCase()}`,
        detail: `${parish} is currently at ${level} alert level.`,
        parish,
        timestamp: new Date().toISOString(),
        data: { parish, alertLevel: level },
      });
    }
  }
  return events;
}

function projectMilestoneEvents(): NWAEvent[] {
  return PROJECTS.filter((p) => p.status === "delayed").map((p) => ({
    id: nextId(),
    type: "project_milestone" as const,
    severity: "warning" as const,
    title: `Project Delayed: ${p.title}`,
    detail: `${p.title} in ${p.parish} is delayed at ${p.pct}% completion.`,
    parish: p.parish,
    timestamp: new Date().toISOString(),
    data: { projectId: p.id, pct: p.pct, start: p.start, end: p.end },
  }));
}

// Simulated new complaint (randomly generated each cycle)
function simulatedNewComplaint(): NWAEvent {
  const parish = PARISHES[Math.floor(Math.random() * PARISHES.length)];
  const category = COMPLAINT_CATEGORIES[Math.floor(Math.random() * COMPLAINT_CATEGORIES.length)];
  const fakeId = `NWA-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  return {
    id: nextId(),
    type: "new_complaint",
    severity: "info",
    title: `New Complaint: ${fakeId}`,
    detail: `New ${category.toLowerCase()} complaint reported in ${parish}.`,
    parish,
    timestamp: new Date().toISOString(),
    data: { complaintId: fakeId, category, parish },
  };
}

// ── Public: collect all current events ─────────────────────────

export function getAllCurrentEvents(): NWAEvent[] {
  return [
    ...slaEvents(),
    ...emergencyEvents(),
    ...closureEvents(),
    ...parishAlertEvents(),
    ...projectMilestoneEvents(),
  ];
}

/**
 * Build an event pool that the SSE route cycles through.
 * Each call returns the next event (round-robin through real events,
 * with occasional simulated new complaints injected).
 */
export function createEventCycler() {
  const pool = getAllCurrentEvents();
  let idx = 0;
  let tick = 0;

  return function next(): NWAEvent {
    tick++;
    // Every 5th tick inject a simulated new complaint
    if (tick % 5 === 0) {
      return simulatedNewComplaint();
    }
    if (pool.length === 0) {
      return simulatedNewComplaint();
    }
    const event = pool[idx % pool.length];
    // Re-stamp with current time so it looks live
    event.id = nextId();
    event.timestamp = new Date().toISOString();
    idx++;
    return event;
  };
}
