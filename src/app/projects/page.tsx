"use client";

import { useState } from "react";
import Link from "next/link";
import { PROJECTS, PARISHES, STATUS_COLORS, STATUS_LABELS } from "@/data/mock";
import MapView from "@/components/MapView";
import Breadcrumbs from "@/components/Breadcrumbs";

const statusToMarkerColor: Record<string, "green" | "orange" | "red" | "blue"> = {
  complete: "green",
  in_progress: "orange",
  delayed: "red",
  planned: "blue",
};

export default function ProjectsPage() {
  const [parishFilter, setParishFilter] = useState("");

  const filtered = PROJECTS.filter((p) => {
    if (parishFilter && p.parish !== parishFilter) return false;
    return true;
  });

  const mapMarkers = filtered.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    label: p.title,
    popup: `${p.title} — ${p.parish} (${STATUS_LABELS[p.status] || p.status}, ${p.pct}%)`,
    color: statusToMarkerColor[p.status] || ("blue" as const),
  }));

  return (
    <div className="min-h-screen bg-nwa-gray">
      {/* Header */}
      <div className="bg-nwa-blue text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Road Projects</h1>
          <p className="text-blue-100">
            Interactive view of all NWA road projects across Jamaica&apos;s 14 parishes
          </p>
        </div>
      </div>
      <Breadcrumbs crumbs={[{ label: "Road Projects" }]} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left sidebar: filter + project cards */}
          <div className="space-y-4">
            {/* Parish filter */}
            <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
              <label htmlFor="parish-filter" className="text-sm font-medium text-gray-700 shrink-0">
                Filter by Parish
              </label>
              <select
                id="parish-filter"
                value={parishFilter}
                onChange={(e) => setParishFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-nwa-blue focus:outline-none"
                aria-label="Filter projects by parish"
              >
                <option value="">All Parishes</option>
                {PARISHES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500 shrink-0">
                {filtered.length} project{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Project cards */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filtered.length === 0 && (
                <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                  <p className="text-gray-500">No projects match your filter.</p>
                </div>
              )}
              {filtered.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-gray-200"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-nwa-blue">
                      {project.title}
                    </h3>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                      style={{
                        backgroundColor: `${STATUS_COLORS[project.status]}20`,
                        color: STATUS_COLORS[project.status],
                      }}
                    >
                      {STATUS_LABELS[project.status] || project.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{project.parish}</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-semibold text-nwa-blue">{project.pct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${project.pct}%`,
                          backgroundColor: STATUS_COLORS[project.status] || "#003876",
                        }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right side: Map */}
          <div>
            <div className="bg-white rounded-xl p-4 shadow-sm sticky top-4">
              <h2 className="font-semibold text-gray-900 mb-3">Project Locations</h2>
              <MapView markers={mapMarkers} height="500px" zoom={9} />
              {/* Map legend */}
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-600">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <span key={key} className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ backgroundColor: STATUS_COLORS[key] }}
                    />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
