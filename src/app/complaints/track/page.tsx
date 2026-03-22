"use client";

import { useState } from "react";
import Link from "next/link";
import {
  COMPLAINTS_INIT,
  CASE_STATUS_COLORS,
  CASE_STATUS_LABELS,
} from "@/data/mock";
import type { Complaint } from "@/data/mock";
import Breadcrumbs from "@/components/Breadcrumbs";

/* ------------------------------------------------------------------ */
/*  Status timeline steps (matches Report page)                        */
/* ------------------------------------------------------------------ */
const TIMELINE_STEPS = [
  "Submitted",
  "Pending Approval",
  "Under Review",
  "Sent for Review",
  "Resolved",
];

/* Map backend status keys to timeline step index */
function statusToStepIndex(status: string): number {
  switch (status) {
    case "pending":
      return 1; // Pending Approval
    case "under_review":
      return 2; // Under Review
    case "sent_review":
      return 3; // Sent for Review
    case "resolved":
      return 4; // Resolved
    default:
      return 0; // Submitted
  }
}

/* ------------------------------------------------------------------ */
/*  Sample IDs for the demo helper                                     */
/* ------------------------------------------------------------------ */
const SAMPLE_IDS = COMPLAINTS_INIT.slice(0, 4).map((c) => c.id);

/* ================================================================== */
/*  Page Component                                                     */
/* ================================================================== */
export default function TrackComplaintPage() {
  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState<Complaint | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = searchId.trim();
    if (!trimmed) return;

    const found = COMPLAINTS_INIT.find(
      (c) => c.id.toLowerCase() === trimmed.toLowerCase()
    );
    if (found) {
      setResult(found);
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }
  };

  const selectSampleId = (id: string) => {
    setSearchId(id);
    const found = COMPLAINTS_INIT.find(
      (c) => c.id.toLowerCase() === id.toLowerCase()
    );
    if (found) {
      setResult(found);
      setNotFound(false);
    }
  };

  const currentStepIndex = result ? statusToStepIndex(result.status) : -1;

  return (
    <div className="min-h-screen bg-nwa-gray">
      {/* Header */}
      <div className="bg-nwa-blue text-white py-10">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Track My Request
          </h1>
          <p className="text-blue-100">
            Enter your tracking ID to check the status of your complaint.
          </p>
        </div>
      </div>
      <Breadcrumbs crumbs={[{ label: "Report an Issue", href: "/complaints" }, { label: "Track Request" }]} />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="flex-1 relative">
            {/* search icon */}
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Tracking ID (e.g., NWA-20260215-0001)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nwa-blue focus:border-transparent"
              aria-label="Tracking ID"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-nwa-blue text-white font-medium rounded-lg hover:bg-nwa-blue-light transition-colors"
          >
            Track
          </button>
        </form>

        {/* Demo helper — sample IDs */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 font-medium mb-2">
            Demo: Try these tracking IDs
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_IDS.map((id) => (
              <button
                key={id}
                onClick={() => selectSampleId(id)}
                className="text-xs px-2.5 py-1 bg-white border border-blue-300 rounded-full text-nwa-blue font-mono hover:bg-blue-100 transition-colors cursor-pointer"
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Not found state */}
        {notFound && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-6">
            <svg
              className="w-10 h-10 text-red-400 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <p className="text-red-700 font-medium">
              No complaint found with that tracking ID.
            </p>
            <p className="text-sm text-red-600 mt-1">
              Please check the ID and try again.
            </p>
          </div>
        )}

        {/* Result display */}
        {result && (
          <div className="space-y-6">
            {/* Header card with gradient */}
            <div className="rounded-xl overflow-hidden shadow-sm">
              <div
                className="px-6 py-5"
                style={{
                  background:
                    "linear-gradient(135deg, #003876 0%, #0055a5 100%)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-200">Tracking ID</p>
                    <p className="text-xl font-bold font-mono text-white">
                      {result.id}
                    </p>
                  </div>
                  <span
                    className="status-badge text-white text-xs"
                    style={{
                      backgroundColor:
                        CASE_STATUS_COLORS[result.status] || "#6b7280",
                    }}
                  >
                    {CASE_STATUS_LABELS[result.status] || result.status}
                  </span>
                </div>
              </div>

              <div className="bg-white px-6 py-5">
                {/* Description */}
                <p className="text-sm text-gray-700 mb-5">{result.desc}</p>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-6">
                  <div>
                    <span className="text-gray-500 block">Date Reported</span>
                    <p className="font-medium">
                      {new Date(result.date).toLocaleDateString("en-JM", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Category</span>
                    <p className="font-medium">{result.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Parish</span>
                    <p className="font-medium">{result.parish}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Assigned To</span>
                    <p className="font-medium">
                      {result.assignedTo || "Unassigned"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Location</span>
                    <p className="font-medium font-mono text-xs">
                      {result.lat.toFixed(4)}, {result.lng.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Status</span>
                    <p
                      className="font-medium"
                      style={{
                        color:
                          CASE_STATUS_COLORS[result.status] || "#374151",
                      }}
                    >
                      {CASE_STATUS_LABELS[result.status] || result.status}
                    </p>
                  </div>
                </div>

                {/* Status timeline */}
                <div className="border-t pt-5">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Status Timeline
                  </p>
                  <div className="flex items-center justify-between">
                    {TIMELINE_STEPS.map((step, i) => {
                      const done = i <= currentStepIndex;
                      const isCurrent = i === currentStepIndex;
                      return (
                        <div
                          key={step}
                          className="flex flex-col items-center flex-1"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              isCurrent
                                ? "bg-nwa-blue text-white ring-4 ring-blue-100"
                                : done
                                  ? "bg-nwa-green text-white"
                                  : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {done && !isCurrent ? (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              i + 1
                            )}
                          </div>
                          <span
                            className={`text-[10px] mt-1 text-center leading-tight hidden sm:block ${
                              isCurrent
                                ? "font-semibold text-nwa-blue"
                                : done
                                  ? "text-nwa-green font-medium"
                                  : "text-gray-500"
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {/* connector bars */}
                  <div className="flex mt-1">
                    {TIMELINE_STEPS.slice(0, -1).map((_, i) => (
                      <div key={i} className="flex-1 px-4">
                        <div
                          className={`h-1 rounded ${
                            i < currentStepIndex
                              ? "bg-nwa-green"
                              : "bg-gray-200"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Back link */}
            <div className="text-center">
              <Link
                href="/complaints"
                className="text-sm text-nwa-blue font-medium hover:underline"
              >
                &larr; Report another issue
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
