"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { PROJECTS, STATUS_COLORS, STATUS_LABELS } from "@/data/mock";
import MapView from "@/components/MapView";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = Number(params.id);
  const project = PROJECTS.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="min-h-screen bg-nwa-gray flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
          <p className="text-gray-500 mb-6">The project you are looking for does not exist.</p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 bg-nwa-blue text-white text-sm font-medium rounded-lg hover:bg-nwa-blue-light transition-colors"
          >
            &larr; Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[project.status] || "#003876";
  const statusLabel = STATUS_LABELS[project.status] || project.status;

  const marker = {
    lat: project.lat,
    lng: project.lng,
    label: project.title,
    popup: `${project.title} — ${project.parish}`,
    color: "blue" as const,
  };

  return (
    <div className="min-h-screen bg-nwa-gray">
      {/* Header */}
      <div className="bg-nwa-blue text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-sm text-blue-200 hover:text-white mb-4 transition-colors"
          >
            &larr; Back to Projects
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold">{project.title}</h1>
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full shrink-0 self-start"
              style={{
                backgroundColor: `${statusColor}30`,
                color: "#fff",
                border: `1px solid ${statusColor}`,
              }}
            >
              {statusLabel}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-blue-100 text-sm">
            <span>{project.parish}</span>
            <span className="text-blue-300">|</span>
            <span>{project.start} to {project.end}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Completion card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Large percentage display */}
            <div className="flex items-center justify-center">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center border-4"
                style={{ borderColor: statusColor }}
              >
                <div className="text-center">
                  <span className="text-3xl font-bold text-gray-900">{project.pct}</span>
                  <span className="text-lg font-bold text-gray-500">%</span>
                </div>
              </div>
            </div>

            {/* Progress bar and details */}
            <div className="flex-1 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Project Completion</h2>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-700"
                  style={{
                    width: `${project.pct}%`,
                    backgroundColor: statusColor,
                  }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Start: {project.start}</span>
                <span>End: {project.end}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
          <p className="text-gray-600 leading-relaxed">{project.desc}</p>
        </div>

        {/* Location / Map */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Location</h2>
          <MapView
            center={[project.lat, project.lng]}
            zoom={13}
            markers={[marker]}
            height="350px"
          />
          <p className="text-sm text-gray-500 mt-3">
            Coordinates: {project.lat.toFixed(4)}, {project.lng.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
}
