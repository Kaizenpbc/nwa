"use client";

import { useEffect, useRef, useState } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NWAEvent {
  id: string;
  type: string;
  severity: "critical" | "warning" | "info";
  title: string;
  detail: string;
  parish: string;
  timestamp: string;
  data: Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/*  Style maps                                                         */
/* ------------------------------------------------------------------ */

const SEVERITY_BADGE: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  warning: "bg-orange-100 text-orange-800 border-orange-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
};

const SEVERITY_BORDER: Record<string, string> = {
  critical: "border-l-red-600",
  warning: "border-l-orange-500",
  info: "border-l-blue-500",
};

const TYPE_LABEL: Record<string, string> = {
  sla_breach: "SLA Breach",
  sla_at_risk: "SLA At Risk",
  new_complaint: "New Complaint",
  closure_update: "Road Closure",
  emergency_escalation: "Emergency",
  project_milestone: "Project",
  parish_alert: "Parish Alert",
};

const TYPE_ICON: Record<string, string> = {
  sla_breach: "\u23F0",
  sla_at_risk: "\u26A0\uFE0F",
  new_complaint: "\uD83D\uDCDD",
  closure_update: "\u26D4",
  emergency_escalation: "\uD83D\uDEA8",
  project_milestone: "\uD83D\uDCC8",
  parish_alert: "\uD83D\uDDFA\uFE0F",
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EventsPage() {
  const [events, setEvents] = useState<NWAEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [snapshotCount, setSnapshotCount] = useState<number | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [paused, setPaused] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);

  // Keep ref in sync
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // SSE connection
  useEffect(() => {
    const es = new EventSource("/api/events?interval=5000");

    es.addEventListener("open", () => setConnected(true));

    // Snapshot (initial burst)
    es.addEventListener("snapshot", (e: MessageEvent) => {
      const payload = JSON.parse(e.data);
      setSnapshotCount(payload.count);
      setEvents(payload.events.reverse());
    });

    // Individual event types
    const eventTypes = [
      "sla_breach",
      "sla_at_risk",
      "new_complaint",
      "closure_update",
      "emergency_escalation",
      "project_milestone",
      "parish_alert",
    ];

    for (const type of eventTypes) {
      es.addEventListener(type, (e: MessageEvent) => {
        if (pausedRef.current) return;
        const event: NWAEvent = JSON.parse(e.data);
        setEvents((prev) => [event, ...prev].slice(0, 200));
      });
    }

    es.addEventListener("error", () => setConnected(false));

    return () => es.close();
  }, []);

  // Auto-scroll to top when new event arrives
  useEffect(() => {
    if (!paused && feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [events.length, paused]);

  /* ── Filtered view ── */
  const filtered = events.filter((e) => {
    if (filterSeverity !== "all" && e.severity !== filterSeverity) return false;
    if (filterType !== "all" && e.type !== filterType) return false;
    return true;
  });

  /* ── Counts ── */
  const criticalCount = events.filter((e) => e.severity === "critical").length;
  const warningCount = events.filter((e) => e.severity === "warning").length;
  const infoCount = events.filter((e) => e.severity === "info").length;

  return (
    <div className="min-h-screen bg-nwa-gray">
      {/* Header */}
      <div className="bg-gradient-to-r from-nwa-blue to-blue-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold">Live Event Stream</h1>
            <span className="relative flex h-3 w-3">
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${
                  connected ? "bg-green-400 animate-ping" : "bg-red-400"
                } opacity-75`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  connected ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </span>
          </div>
          <p className="text-blue-200 text-sm">
            Real-time NWA alerts, SLA breaches, emergencies, and complaints
            {snapshotCount !== null && (
              <span className="ml-2 bg-white/20 rounded-full px-2.5 py-0.5 text-xs">
                {snapshotCount} initial events loaded
              </span>
            )}
          </p>
        </div>
      </div>
      <Breadcrumbs crumbs={[{ label: "Live Events" }]} />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* ── KPI Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border-t-4 border-t-gray-300">
            <div className="text-2xl font-bold text-gray-900">{events.length}</div>
            <div className="text-xs text-gray-500">Total Events</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-t-4 border-t-red-600">
            <div className="text-2xl font-bold text-red-700">{criticalCount}</div>
            <div className="text-xs text-gray-500">Critical</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-t-4 border-t-orange-500">
            <div className="text-2xl font-bold text-orange-600">{warningCount}</div>
            <div className="text-xs text-gray-500">Warning</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-t-4 border-t-blue-500">
            <div className="text-2xl font-bold text-blue-600">{infoCount}</div>
            <div className="text-xs text-gray-500">Info</div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3">
          {/* Severity filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Severity
            </label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-nwa-blue focus:border-nwa-blue"
            >
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-nwa-blue focus:border-nwa-blue"
            >
              <option value="all">All Types</option>
              <option value="sla_breach">SLA Breach</option>
              <option value="sla_at_risk">SLA At Risk</option>
              <option value="new_complaint">New Complaint</option>
              <option value="closure_update">Road Closure</option>
              <option value="emergency_escalation">Emergency</option>
              <option value="project_milestone">Project</option>
              <option value="parish_alert">Parish Alert</option>
            </select>
          </div>

          {/* Pause / Resume */}
          <button
            onClick={() => setPaused(!paused)}
            className={`ml-auto text-sm font-medium px-4 py-1.5 rounded-lg transition-colors ${
              paused
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {paused ? "Resume" : "Pause"}
          </button>

          <span className="text-xs text-gray-400">
            Showing {filtered.length} of {events.length}
          </span>
        </div>

        {/* ── Event Feed ── */}
        <div
          ref={feedRef}
          className="space-y-2 max-h-[calc(100vh-380px)] overflow-y-auto pr-1"
        >
          {filtered.length === 0 && (
            <div className="bg-white rounded-xl p-12 shadow-sm text-center">
              <div className="text-3xl mb-2">{connected ? "\uD83D\uDD0C" : "\u23F3"}</div>
              <p className="text-gray-500 text-sm">
                {connected
                  ? "Waiting for events matching your filters..."
                  : "Connecting to event stream..."}
              </p>
            </div>
          )}

          {filtered.map((event, i) => (
            <div
              key={`${event.id}-${i}`}
              className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${
                SEVERITY_BORDER[event.severity] || "border-l-gray-300"
              } ${i === 0 && !paused ? "animate-fade-in" : ""}`}
            >
              {/* Top row: icon + title + badges + time */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="text-lg shrink-0 mt-0.5">
                    {TYPE_ICON[event.type] || "\uD83D\uDD14"}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                      {event.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{event.detail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Type badge */}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap">
                    {TYPE_LABEL[event.type] || event.type}
                  </span>
                  {/* Severity badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border whitespace-nowrap ${
                      SEVERITY_BADGE[event.severity] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {event.severity}
                  </span>
                </div>
              </div>

              {/* Bottom row: parish + timestamp */}
              <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="font-medium text-gray-500">Parish:</span>
                  {event.parish}
                </span>
                <span>
                  {new Date(event.timestamp).toLocaleTimeString("en-JM", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
