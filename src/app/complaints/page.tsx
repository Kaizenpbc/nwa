"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PARISHES,
  COMPLAINT_CATEGORIES,
  CASE_STATUS_LABELS,
} from "@/data/mock";
import MapView from "@/components/MapView";
import Breadcrumbs from "@/components/Breadcrumbs";

/* ------------------------------------------------------------------ */
/*  Status timeline steps                                              */
/* ------------------------------------------------------------------ */
const TIMELINE_STEPS = [
  "Submitted",
  "Pending Approval",
  "Under Review",
  "Sent for Review",
  "Resolved",
];

/* ------------------------------------------------------------------ */
/*  Generate tracking ID: NWA-YYYYMMDD-XXXX                           */
/* ------------------------------------------------------------------ */
function generateTrackingId(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `NWA-${y}${m}${d}-${seq}`;
}

/* ================================================================== */
/*  Page Component                                                     */
/* ================================================================== */
export default function ReportIssuePage() {
  /* ---------- form state ---------- */
  const [form, setForm] = useState({
    category: "",
    description: "",
    parish: "",
    contactName: "",
    contactEmail: "",
  });

  const [pinnedLocation, setPinnedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  /* ---------- submission state ---------- */
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState("");

  /* ---------- helpers ---------- */
  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = generateTrackingId();
    setTrackingId(id);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setSubmitted(false);
    setTrackingId("");
    setPinnedLocation(null);
    setForm({
      category: "",
      description: "",
      parish: "",
      contactName: "",
      contactEmail: "",
    });
  };

  /* ================================================================ */
  /*  SUCCESS SCREEN                                                   */
  /* ================================================================ */
  if (submitted) {
    const currentStep = 0; // just submitted

    return (
      <div className="min-h-screen bg-nwa-gray">
        {/* Hero */}
        <div className="bg-nwa-blue text-white py-10">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="w-16 h-16 bg-nwa-green rounded-full flex items-center justify-center mx-auto mb-4">
              {/* check icon */}
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Issue Reported Successfully
            </h1>
            <p className="text-blue-100">
              Your issue has been logged and assigned for review.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="max-w-lg mx-auto px-4 -mt-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Tracking ID */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 mb-1">Your Tracking ID</p>
              <div className="text-3xl font-bold text-nwa-blue font-mono">
                {trackingId}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Save this ID to track your complaint status.
              </p>
            </div>

            {/* Status Timeline */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Status Timeline
              </p>
              <div className="flex items-center justify-between">
                {TIMELINE_STEPS.map((step, i) => {
                  const done = i <= currentStep;
                  return (
                    <div
                      key={step}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          done
                            ? "bg-nwa-green text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {done ? (
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
                      <span className="text-[10px] mt-1 text-center leading-tight text-gray-500 hidden sm:block">
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
                        i < currentStep ? "bg-nwa-green" : "bg-gray-200"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Detail grid */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium">{form.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Parish:</span>
                <span className="font-medium">
                  {form.parish || "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location:</span>
                <span className="font-medium">
                  {pinnedLocation
                    ? `${pinnedLocation.lat.toFixed(4)}, ${pinnedLocation.lng.toFixed(4)}`
                    : "Not pinned"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-medium text-amber-600">
                  {CASE_STATUS_LABELS.pending}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contact:</span>
                <span className="font-medium">
                  {form.contactName || form.contactEmail || "Anonymous"}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/complaints/track"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-nwa-blue text-white font-medium rounded-lg hover:bg-nwa-blue-light transition-colors"
              >
                {/* search icon */}
                <svg
                  className="w-4 h-4"
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
                Track My Request
              </Link>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 border border-gray-300 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Submit Another Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  REPORT FORM                                                      */
  /* ================================================================ */
  return (
    <div className="min-h-screen bg-nwa-gray">
      {/* Header */}
      <div className="bg-nwa-blue text-white py-10">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Report an Issue
          </h1>
          <p className="text-blue-100">
            Help us improve Jamaica&apos;s roads. Submit details about road
            issues, upload photos, and pin the location on the map to receive a
            tracking ID instantly.
          </p>
        </div>
      </div>
      <Breadcrumbs crumbs={[{ label: "Report an Issue" }]} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Link to track */}
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <span className="text-sm text-blue-800">
            Already submitted a complaint?
          </span>
          <Link
            href="/complaints/track"
            className="text-sm font-medium text-nwa-blue hover:underline flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
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
            Track My Request
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* -------- LEFT COLUMN: Form fields -------- */}
            <div className="space-y-6">
              {/* Category */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Issue Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Category *
                    </label>
                    <select
                      id="category"
                      required
                      aria-required="true"
                      value={form.category}
                      onChange={(e) => update("category", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nwa-blue focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      {COMPLAINT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description *
                    </label>
                    <textarea
                      id="description"
                      required
                      aria-required="true"
                      rows={4}
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nwa-blue focus:border-transparent"
                      placeholder="Describe the issue in detail..."
                    />
                  </div>

                  {/* Parish */}
                  <div>
                    <label
                      htmlFor="parish"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Parish
                    </label>
                    <select
                      id="parish"
                      value={form.parish}
                      onChange={(e) => update("parish", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nwa-blue focus:border-transparent"
                    >
                      <option value="">Select parish</option>
                      {PARISHES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Photo Upload
                </h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-nwa-blue transition-colors cursor-pointer">
                  {/* camera icon */}
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 text-gray-400 mx-auto mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG up to 10 MB each
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    aria-label="Upload photos"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Contact Information{" "}
                  <span className="text-sm font-normal text-gray-400">
                    (optional)
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contactName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Contact Name
                    </label>
                    <input
                      id="contactName"
                      type="text"
                      value={form.contactName}
                      onChange={(e) => update("contactName", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nwa-blue focus:border-transparent"
                      placeholder="e.g., John Brown"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contactEmail"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Contact Email
                    </label>
                    <input
                      id="contactEmail"
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => update("contactEmail", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nwa-blue focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* -------- RIGHT COLUMN: Map -------- */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-2">
                  Pin Location on Map
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Click on the map to mark the exact location of the issue.
                </p>
                <MapView
                  center={[18.1096, -77.2975]}
                  zoom={9}
                  height="380px"
                  markers={
                    pinnedLocation
                      ? [
                          {
                            lat: pinnedLocation.lat,
                            lng: pinnedLocation.lng,
                            label: "Issue Location",
                            color: "red",
                          },
                        ]
                      : []
                  }
                />

                {/* Demo pin button */}
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setPinnedLocation({ lat: 18.0179, lng: -76.8099 })
                    }
                    className="text-sm text-nwa-blue font-medium hover:underline flex items-center gap-1"
                  >
                    {/* map-pin icon */}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>
                    Use current location (demo)
                  </button>
                  {pinnedLocation && (
                    <button
                      type="button"
                      onClick={() => setPinnedLocation(null)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Clear pin
                    </button>
                  )}
                </div>

                {/* GPS Coordinates display */}
                <div className="mt-3 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    GPS Coordinates
                  </p>
                  {pinnedLocation ? (
                    <p className="text-sm font-mono text-gray-800">
                      {pinnedLocation.lat.toFixed(6)},{" "}
                      {pinnedLocation.lng.toFixed(6)}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      No location pinned yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit row */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-nwa-green text-white font-semibold rounded-lg hover:bg-nwa-green-dark transition-colors text-lg"
            >
              Submit Issue
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
