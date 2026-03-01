"use client";

import { useState } from "react";
import MapView from "@/components/MapView";
import { CLOSURES, PARISHES, SEVERITY_COLORS } from "@/data/mock";

const SEVERITY_MARKER_COLOR: Record<string, "red" | "orange" | "blue"> = {
  critical: "red",
  warning: "orange",
  info: "blue",
};

const SEVERITY_BADGE_CLASS: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  warning: "bg-orange-100 text-orange-800",
  info: "bg-blue-100 text-blue-800",
};

export default function ClosuresPage() {
  const [parishFilter, setParishFilter] = useState("");

  const filtered = CLOSURES.filter((c) => {
    if (parishFilter && c.parish !== parishFilter) return false;
    return true;
  });

  const mapMarkers = filtered.map((c) => ({
    lat: c.lat,
    lng: c.lng,
    label: c.road,
    popup: `${c.road} (${c.parish}) — ${c.reason}`,
    color: SEVERITY_MARKER_COLOR[c.severity] || ("blue" as const),
  }));

  return (
    <div className="min-h-screen bg-nwa-gray">
      {/* ── Header ── */}
      <div className="bg-nwa-blue text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Road Closures &amp; Advisories
          </h1>
          <p className="text-blue-200 text-sm md:text-base">
            Current road closures, detour routes, and travel advisories across
            Jamaica.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* ── Map ── */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Closure Map</h2>
          <MapView markers={mapMarkers} height="380px" zoom={9} />
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
            {Object.entries(SEVERITY_COLORS).map(([key, color]) => (
              <span key={key} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize">{key}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Parish Filter ── */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="parish-filter"
            className="text-sm font-medium text-gray-700"
          >
            Filter by Parish:
          </label>
          <select
            id="parish-filter"
            value={parishFilter}
            onChange={(e) => setParishFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-nwa-blue focus:outline-none bg-white"
          >
            <option value="">All Parishes</option>
            {PARISHES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <span className="ml-auto text-sm text-gray-500">
            {filtered.length} closure{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Closure Cards ── */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <p className="text-gray-500">No closures match your filter.</p>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((closure) => {
            const borderColor =
              SEVERITY_COLORS[closure.severity] || "#9E9E9E";

            return (
              <div
                key={closure.id}
                className="bg-white rounded-xl p-5 shadow-sm"
                style={{ borderLeft: `4px solid ${borderColor}` }}
              >
                {/* Top row: severity badge + road name */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {closure.road}
                    </h3>
                    <p className="text-sm text-gray-500">{closure.parish}</p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${
                      SEVERITY_BADGE_CLASS[closure.severity] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {closure.severity}
                  </span>
                </div>

                {/* Reason */}
                <div className="text-sm mb-2">
                  <span className="text-gray-500">Reason: </span>
                  <span className="text-gray-800">{closure.reason}</span>
                </div>

                {/* Detour — highlighted box */}
                {closure.detour && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                    <span className="text-xs font-semibold text-amber-800 uppercase">
                      Detour:{" "}
                    </span>
                    <span className="text-sm text-amber-900">
                      {closure.detour}
                    </span>
                  </div>
                )}

                {/* Date range */}
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-600">Period: </span>
                  {new Date(closure.start).toLocaleDateString("en-JM", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  &mdash;{" "}
                  {new Date(closure.end).toLocaleDateString("en-JM", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
