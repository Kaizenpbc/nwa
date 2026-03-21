"use client";

import Link from "next/link";
import MapView from "@/components/MapView";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  EMERGENCY_EVENTS,
  CLOSURES,
  PARISHES,
  PARISH_ALERT_LEVELS,
  PARISH_COORDS,
  ALERT_LEVEL_COLORS,
  ALERT_LEVEL_LABELS,
  SEVERITY_COLORS,
} from "@/data/mock";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const SEVERITY_BADGE_CLASS: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  warning: "bg-orange-100 text-orange-800",
  info: "bg-blue-100 text-blue-800",
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  monitoring: "bg-yellow-100 text-yellow-800",
  assessment: "bg-blue-100 text-blue-800",
  resolved: "bg-gray-100 text-gray-600",
};

const ALERT_MARKER_COLOR: Record<string, "green" | "orange" | "red"> = {
  normal: "green",
  advisory: "orange",
  warning: "orange",
  emergency: "red",
};

const ALERT_MARKER_RADIUS: Record<string, number> = {
  normal: 6,
  advisory: 8,
  warning: 10,
  emergency: 12,
};

/* ------------------------------------------------------------------ */
/*  Computed KPIs                                                      */
/* ------------------------------------------------------------------ */

function useKpis() {
  const activeEvents = EMERGENCY_EVENTS.filter(
    (e) => e.status === "active" || e.status === "monitoring",
  ).length;

  const roadsAffected = EMERGENCY_EVENTS.reduce(
    (sum, e) => sum + e.roadsAffected,
    0,
  );

  const crewsDeployed = EMERGENCY_EVENTS.reduce(
    (sum, e) => sum + e.crewsDeployed,
    0,
  );

  const parishesImpacted = new Set(
    EMERGENCY_EVENTS.flatMap((e) => e.parishes),
  ).size;

  const roadClosures = CLOSURES.length;

  return { activeEvents, roadsAffected, crewsDeployed, parishesImpacted, roadClosures };
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EmergencyPage() {
  const kpis = useKpis();

  /* Parish map markers */
  const parishMarkers = PARISHES.map((parish) => {
    const level = PARISH_ALERT_LEVELS[parish] || "normal";
    const coords = PARISH_COORDS[parish];
    return {
      lat: coords[0],
      lng: coords[1],
      label: parish,
      popup: `${parish}: ${ALERT_LEVEL_LABELS[level] || level}`,
      color: ALERT_MARKER_COLOR[level] || ("green" as const),
    };
  });

  return (
    <div className="min-h-screen bg-nwa-gray">
      {/* ── Alert Banner ── */}
      <div className="bg-gradient-to-r from-red-700 to-orange-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            Emergency Operations Centre
          </h1>
          <p className="text-red-100 text-sm md:text-base mb-3">
            Island-Wide Alert:{" "}
            <span className="font-bold text-white uppercase tracking-wide">
              ELEVATED
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="bg-white/20 rounded-full px-3 py-1">
              Tropical Storm Adele &mdash; Approaching Eastern Parishes
            </span>
            <span className="bg-white/20 rounded-full px-3 py-1">
              {kpis.activeEvents} Active Event
              {kpis.activeEvents !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
      <Breadcrumbs crumbs={[{ label: "Emergency Operations" }]} />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            {
              icon: "\u26A0\uFE0F",
              value: kpis.activeEvents,
              label: "Active Events",
              color: "#C62828",
            },
            {
              icon: "\uD83D\uDEE3\uFE0F",
              value: kpis.roadsAffected,
              label: "Roads Affected",
              color: "#E65100",
            },
            {
              icon: "\uD83D\uDC77",
              value: kpis.crewsDeployed,
              label: "Crews Deployed",
              color: "#003876",
            },
            {
              icon: "\uD83D\uDDFA\uFE0F",
              value: kpis.parishesImpacted,
              label: "Parishes Impacted",
              color: "#FF9800",
            },
            {
              icon: "\u26D4",
              value: kpis.roadClosures,
              label: "Road Closures",
              color: "#C62828",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white rounded-xl p-4 shadow-sm"
              style={{ borderTop: `4px solid ${kpi.color}` }}
            >
              <div className="text-2xl mb-1">{kpi.icon}</div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {kpi.value}
              </div>
              <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* ── Parish Alert Map ── */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-900 mb-3 text-lg">
            Parish Alert Map
          </h2>
          <MapView markers={parishMarkers} height="400px" zoom={9} />
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
            {Object.entries(ALERT_LEVEL_COLORS).map(([key, color]) => (
              <span key={key} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: color }}
                />
                <span>{ALERT_LEVEL_LABELS[key] || key}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Two-Column: Incidents + Parish Alerts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — Active Incidents (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">
              Active Incidents
            </h2>

            {EMERGENCY_EVENTS.map((event) => {
              const borderColor =
                SEVERITY_COLORS[event.severity] || "#9E9E9E";

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-xl p-5 shadow-sm"
                  style={{ borderLeft: `4px solid ${borderColor}` }}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {event.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${
                          SEVERITY_BADGE_CLASS[event.severity] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {event.severity}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                          STATUS_BADGE_CLASS[event.status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3">{event.desc}</p>

                  {/* Details row */}
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                    <span>
                      <span className="font-medium text-gray-600">Date:</span>{" "}
                      {new Date(event.date).toLocaleDateString("en-JM", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>
                      <span className="font-medium text-gray-600">
                        Parishes:
                      </span>{" "}
                      {event.parishes.join(", ")}
                    </span>
                    <span>
                      <span className="font-medium text-gray-600">Roads:</span>{" "}
                      {event.roadsAffected}
                    </span>
                    <span>
                      <span className="font-medium text-gray-600">Crews:</span>{" "}
                      {event.crewsDeployed}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right column — Parish Alert Levels (1/3 width) */}
          <div>
            <h2 className="font-semibold text-gray-900 text-lg mb-4">
              Parish Alert Levels
            </h2>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-700">
                      Parish
                    </th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PARISHES.map((parish) => {
                    const level = PARISH_ALERT_LEVELS[parish] || "normal";
                    const color = ALERT_LEVEL_COLORS[level] || "#4CAF50";
                    const label = ALERT_LEVEL_LABELS[level] || level;

                    return (
                      <tr
                        key={parish}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        <td className="px-4 py-2.5 text-gray-800">
                          {parish}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{
                              backgroundColor: `${color}20`,
                              color: color,
                            }}
                          >
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: color }}
                            />
                            {label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Legend */}
              <div className="border-t border-gray-200 px-4 py-3">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Legend
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  {Object.entries(ALERT_LEVEL_COLORS).map(([key, color]) => (
                    <span key={key} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: color }}
                      />
                      <span>{ALERT_LEVEL_LABELS[key] || key}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
