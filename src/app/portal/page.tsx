"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  COMPLAINTS_INIT,
  CLOSURES,
  PARISHES,
  DEPARTMENTS,
  CASE_STATUS_COLORS,
  CASE_STATUS_LABELS,
  SLA_COLORS,
  SLA_LABELS,
  getSlaStatus,
  getSlaDaysRemaining,
} from "@/data/mock";
import type { Complaint } from "@/data/mock";
import AnimatedCounter from "@/components/dashboard/AnimatedCounter";
import LiveFeed from "@/components/dashboard/LiveFeed";
import ComplaintHeatmap from "@/components/dashboard/ComplaintHeatmap";

// Lazy-load Recharts components (large bundle, client-only)
const StatusPieChart = dynamic(
  () => import("@/components/dashboard/DashboardCharts").then((m) => m.StatusPieChart),
  { ssr: false },
);
const CategoryBarChart = dynamic(
  () => import("@/components/dashboard/DashboardCharts").then((m) => m.CategoryBarChart),
  { ssr: false },
);
const ParishBarChart = dynamic(
  () => import("@/components/dashboard/DashboardCharts").then((m) => m.ParishBarChart),
  { ssr: false },
);
const SlaOverviewChart = dynamic(
  () => import("@/components/dashboard/DashboardCharts").then((m) => m.SlaOverviewChart),
  { ssr: false },
);
const SubmissionsTimeline = dynamic(
  () => import("@/components/dashboard/DashboardCharts").then((m) => m.SubmissionsTimeline),
  { ssr: false },
);
const PriorityChart = dynamic(
  () => import("@/components/dashboard/DashboardCharts").then((m) => m.PriorityChart),
  { ssr: false },
);

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                  */
/* ------------------------------------------------------------------ */

type Tab = "dashboard" | "cms";
type SortField = "id" | "date" | "category" | "parish" | "priority" | "status";
type SortDir = "asc" | "desc";

const PRIORITY_COLORS: Record<string, string> = {
  high: "#C62828",
  standard: "#1565C0",
  low: "#4CAF50",
};

const STATUS_TIMELINE_STEPS = [
  "Submitted",
  "Under Review",
  "Sent for Review",
  "Work in Progress",
  "Resolved",
];

/* ------------------------------------------------------------------ */
/*  Helper: short ID (last 4 chars)                                    */
/* ------------------------------------------------------------------ */
function shortId(id: string): string {
  return id.slice(-4);
}

/* ------------------------------------------------------------------ */
/*  KPI Card                                                           */
/* ------------------------------------------------------------------ */
function KpiCard({
  icon,
  label,
  value,
  borderColor,
}: {
  icon: string;
  label: string;
  value: number;
  borderColor: string;
}) {
  return (
    <div
      className="bg-white rounded-xl p-5 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow"
      style={{ borderTop: `4px solid ${borderColor}` }}
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-3xl font-bold text-gray-900">
        <AnimatedCounter value={value} />
      </span>
      <span className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Status Breakdown Bar                                               */
/* ------------------------------------------------------------------ */
function StatusBreakdownBar({ complaints }: { complaints: Complaint[] }) {
  const counts: Record<string, number> = {};
  complaints.forEach((c) => {
    counts[c.status] = (counts[c.status] || 0) + 1;
  });

  const total = complaints.length;
  const statuses = Object.keys(CASE_STATUS_LABELS);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-3">Status Breakdown</h3>

      {/* Bar */}
      <div className="flex rounded-full overflow-hidden h-8 bg-gray-100">
        {statuses.map((s) => {
          const count = counts[s] || 0;
          if (count === 0) return null;
          const pct = (count / total) * 100;
          return (
            <div
              key={s}
              className="flex items-center justify-center text-white text-xs font-bold transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor: CASE_STATUS_COLORS[s],
                minWidth: count > 0 ? "28px" : "0",
              }}
              title={`${CASE_STATUS_LABELS[s]}: ${count}`}
            >
              {count}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3">
        {statuses.map((s) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: CASE_STATUS_COLORS[s] }}
            />
            {CASE_STATUS_LABELS[s]} ({counts[s] || 0})
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Priority Badge                                                     */
/* ------------------------------------------------------------------ */
function PriorityBadge({ priority }: { priority: string }) {
  const color = PRIORITY_COLORS[priority] || "#999";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase"
      style={{
        backgroundColor: `${color}18`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {priority}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */
function CaseStatusBadge({ status }: { status: string }) {
  const color = CASE_STATUS_COLORS[status] || "#999";
  const label = CASE_STATUS_LABELS[status] || status;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: `${color}18`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  SLA Badge                                                          */
/* ------------------------------------------------------------------ */
function SlaBadge({ complaint }: { complaint: Complaint }) {
  const slaStatus = getSlaStatus(complaint);
  const daysRemaining = getSlaDaysRemaining(complaint);
  const color = SLA_COLORS[slaStatus] || "#999";
  const label = SLA_LABELS[slaStatus] || slaStatus;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: `${color}18`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
      {complaint.status !== "resolved" && (
        <span className="text-[10px] opacity-75">
          ({daysRemaining > 0 ? `${daysRemaining}d` : `${Math.abs(daysRemaining)}d over`})
        </span>
      )}
    </span>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */

export default function PortalPage() {
  /* ── Top-level state ── */
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  /* ── Dashboard state ── */
  const [complaints, setComplaints] = useState<Complaint[]>([...COMPLAINTS_INIT]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Complaint | null>(null);
  const [showCloseoutModal, setShowCloseoutModal] = useState(false);
  const [closeoutTarget, setCloseoutTarget] = useState<Complaint | null>(null);

  // Update case form
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateCategory, setUpdateCategory] = useState("");
  const [updateAssignedTo, setUpdateAssignedTo] = useState("");
  const [updatePriority, setUpdatePriority] = useState("");
  const [updateNote, setUpdateNote] = useState("");
  const [caseNotes, setCaseNotes] = useState<Record<string, string[]>>({});

  /* ── CMS state ── */
  const [cmsStep, setCmsStep] = useState(0);
  const [closures, setClosures] = useState([...CLOSURES]);
  const [cmsArticleStatus, setCmsArticleStatus] = useState("draft");
  const [cmsPushToHomepage, setCmsPushToHomepage] = useState(false);

  /* ================================================================ */
  /*  DASHBOARD — derived data                                        */
  /* ================================================================ */

  const filteredComplaints = useMemo(() => {
    let result = [...complaints];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.desc.toLowerCase().includes(q) ||
          c.parish.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter) {
      result = result.filter((c) => c.priority === priorityFilter);
    }

    // Sort
    result.sort((a, b) => {
      let valA: string;
      let valB: string;

      switch (sortField) {
        case "id":
          valA = a.id;
          valB = b.id;
          break;
        case "date":
          valA = a.date;
          valB = b.date;
          break;
        case "category":
          valA = a.category;
          valB = b.category;
          break;
        case "parish":
          valA = a.parish;
          valB = b.parish;
          break;
        case "priority": {
          const pOrder: Record<string, number> = { high: 0, standard: 1, low: 2 };
          valA = String(pOrder[a.priority] ?? 9);
          valB = String(pOrder[b.priority] ?? 9);
          break;
        }
        case "status":
          valA = a.status;
          valB = b.status;
          break;
        default:
          valA = a.date;
          valB = b.date;
      }

      const cmp = valA.localeCompare(valB);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [complaints, searchQuery, statusFilter, priorityFilter, sortField, sortDir]);

  // KPI calculations
  const totalSubmissions = complaints.length;
  const openCases = complaints.filter(
    (c) => c.status !== "resolved"
  ).length;
  const slaBreached = complaints.filter(
    (c) => c.status !== "resolved" && getSlaStatus(c) === "breached"
  ).length;
  const atRisk = complaints.filter(
    (c) => c.status !== "resolved" && getSlaStatus(c) === "at_risk"
  ).length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;

  // Parish hotspots
  const parishHotspots = useMemo(() => {
    const map: Record<string, number> = {};
    complaints
      .filter((c) => c.status !== "resolved")
      .forEach((c) => {
        map[c.parish] = (map[c.parish] || 0) + 1;
      });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);
  }, [complaints]);

  /* ── Handlers ── */

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function sortIcon(field: SortField) {
    if (sortField !== field) return " \u2195";
    return sortDir === "asc" ? " \u2191" : " \u2193";
  }

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("");
    setPriorityFilter("");
  }

  function openDetailModal(complaint: Complaint) {
    setSelectedComplaint(complaint);
    setUpdateStatus(complaint.status);
    setUpdateCategory(complaint.category);
    setUpdateAssignedTo(complaint.assignedTo || "");
    setUpdatePriority(complaint.priority);
    setUpdateNote("");
    setShowDetailModal(true);
  }

  function closeDetailModal() {
    setShowDetailModal(false);
    setSelectedComplaint(null);
  }

  function handleUpdateCase() {
    if (!selectedComplaint) return;
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === selectedComplaint.id
          ? {
              ...c,
              status: updateStatus || c.status,
              category: updateCategory || c.category,
              assignedTo: updateAssignedTo || c.assignedTo,
              priority: updatePriority || c.priority,
            }
          : c
      )
    );
    if (updateNote.trim()) {
      setCaseNotes((prev) => ({
        ...prev,
        [selectedComplaint.id]: [
          ...(prev[selectedComplaint.id] || []),
          updateNote.trim(),
        ],
      }));
    }
    setUpdateNote("");
    // Refresh selected complaint
    setSelectedComplaint((prev) =>
      prev
        ? {
            ...prev,
            status: updateStatus || prev.status,
            category: updateCategory || prev.category,
            assignedTo: updateAssignedTo || prev.assignedTo,
            priority: updatePriority || prev.priority,
          }
        : null
    );
  }

  function openAssignModal(complaint: Complaint) {
    setAssignTarget(complaint);
    setShowAssignModal(true);
  }

  function assignToDepartment(dept: string) {
    if (!assignTarget) return;
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === assignTarget.id
          ? { ...c, assignedTo: dept, status: c.status === "pending" ? "under_review" : c.status }
          : c
      )
    );
    setShowAssignModal(false);
    setAssignTarget(null);
  }

  function openCloseoutModal(complaint: Complaint) {
    setCloseoutTarget(complaint);
    setShowCloseoutModal(true);
  }

  function confirmCloseout() {
    if (!closeoutTarget) return;
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === closeoutTarget.id
          ? {
              ...c,
              status: "resolved",
              resolvedBy: "J. Williams (Officer A)",
              closedBy: "M. Thompson (Supervisor B)",
            }
          : c
      )
    );
    setShowCloseoutModal(false);
    setCloseoutTarget(null);
  }

  /* ── Status timeline index helper ── */
  function statusToTimelineIndex(status: string): number {
    switch (status) {
      case "pending":
        return 0;
      case "under_review":
        return 1;
      case "sent_review":
        return 2;
      case "resolved":
        return 4;
      default:
        return 1;
    }
  }

  /* ================================================================ */
  /*  CMS WORKFLOW HELPERS                                             */
  /* ================================================================ */

  const CMS_STEPS = [
    "Log in as Editor",
    "Create News Article",
    "Submit for Review",
    "Log in as Approver",
    "Approve & Publish",
    "Create Road Closure Alert",
    "Complete",
  ];

  function handleCmsNext() {
    if (cmsStep === 2) {
      setCmsArticleStatus("pending_review");
    }
    if (cmsStep === 4) {
      setCmsArticleStatus("published");
    }
    if (cmsStep < CMS_STEPS.length - 1) {
      setCmsStep(cmsStep + 1);
    }
  }

  function handleCmsPrev() {
    if (cmsStep > 0) {
      setCmsStep(cmsStep - 1);
    }
  }

  function handlePublishAndPush() {
    setCmsPushToHomepage(true);
    // Add a new closure to local state
    setClosures((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        road: "Old Hope Road (near Papine)",
        parish: "St. Andrew",
        start: "2026-03-05",
        end: "2026-03-12",
        reason: "Emergency sinkhole repair",
        detour: "Use Gordon Town Road as alternate route",
        severity: "critical",
        push: true,
        lat: 18.02,
        lng: -76.745,
      },
    ]);
    setCmsStep(6);
  }

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div className="min-h-screen bg-nwa-gray">
      {/* ── Portal Header ── */}
      <div className="bg-nwa-blue text-white py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <span className="text-2xl">{"\uD83D\uDD10"}</span> Staff Portal
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-blue-200">Logged in as staff</span>
            <div className="w-8 h-8 bg-nwa-yellow rounded-full flex items-center justify-center">
              <span className="text-nwa-blue font-bold text-xs">ST</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "dashboard"
                  ? "border-nwa-blue text-nwa-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {"\uD83D\uDCCA"} Dashboard
            </button>
            <button
              onClick={() => setActiveTab("cms")}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "cms"
                  ? "border-nwa-blue text-nwa-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {"\uD83D\uDCDD"} CMS
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/*  DASHBOARD TAB                                                    */}
      {/* ================================================================ */}
      {activeTab === "dashboard" && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Title */}
          <div className="mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-900">
                Complaint Management Dashboard
              </h2>
              <span className="px-2.5 py-1 bg-nwa-blue/10 text-nwa-blue text-xs font-semibold rounded-full uppercase">
                Staff Role
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Staff view</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <KpiCard
              icon={"\uD83D\uDCE5"}
              label="Total Submissions"
              value={totalSubmissions}
              borderColor="#003876"
            />
            <KpiCard
              icon={"\uD83D\uDCC2"}
              label="Open Cases"
              value={openCases}
              borderColor="#FF9800"
            />
            <KpiCard
              icon={"\u26A0\uFE0F"}
              label="SLA Breached"
              value={slaBreached}
              borderColor="#C62828"
            />
            <KpiCard
              icon={"\u23F3"}
              label="At Risk"
              value={atRisk}
              borderColor="#FF9800"
            />
            <KpiCard
              icon={"\u2705"}
              label="Resolved"
              value={resolved}
              borderColor="#4CAF50"
            />
          </div>

          {/* Status Breakdown */}
          <div className="mb-6">
            <StatusBreakdownBar complaints={complaints} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            <StatusPieChart complaints={complaints} />
            <CategoryBarChart complaints={complaints} />
            <SlaOverviewChart complaints={complaints} />
          </div>

          {/* Timeline + Parish + Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            <SubmissionsTimeline complaints={complaints} />
            <ParishBarChart complaints={complaints} />
            <PriorityChart complaints={complaints} />
          </div>

          {/* Map + Live Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2">
              <ComplaintHeatmap complaints={complaints} height="380px" />
            </div>
            <LiveFeed complaints={complaints} />
          </div>

          {/* Main content: table + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Table area (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              {/* Search & Filter bar */}
              <div className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {"\uD83D\uDD0D"}
                  </span>
                  <input
                    type="text"
                    placeholder="Search by ID, description, parish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-nwa-blue focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-nwa-blue"
                  aria-label="Filter by status"
                >
                  <option value="">All Statuses</option>
                  {Object.entries(CASE_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-nwa-blue"
                  aria-label="Filter by priority"
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="standard">Standard</option>
                  <option value="low">Low</option>
                </select>
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
                <span className="text-xs text-gray-400 ml-auto">
                  {filteredComplaints.length} result{filteredComplaints.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Ticket Table — hidden on mobile, shown md+ */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th
                          className="px-4 py-3 text-left font-semibold text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                          onClick={() => handleSort("id")}
                        >
                          ID{sortIcon("id")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-semibold text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                          onClick={() => handleSort("date")}
                        >
                          Date{sortIcon("date")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-semibold text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                          onClick={() => handleSort("category")}
                        >
                          Category{sortIcon("category")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-semibold text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                          onClick={() => handleSort("parish")}
                        >
                          Parish{sortIcon("parish")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-semibold text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                          onClick={() => handleSort("priority")}
                        >
                          Priority{sortIcon("priority")}
                        </th>
                        <th
                          className="px-4 py-3 text-left font-semibold text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                          onClick={() => handleSort("status")}
                        >
                          Status{sortIcon("status")}
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">
                          SLA
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredComplaints.map((c) => (
                        <tr
                          key={c.id}
                          className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                          onClick={() => openDetailModal(c)}
                        >
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-nwa-blue">
                            ...{shortId(c.id)}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {new Date(c.date).toLocaleDateString("en-JM", {
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{c.category}</td>
                          <td className="px-4 py-3 text-gray-600">{c.parish}</td>
                          <td className="px-4 py-3">
                            <PriorityBadge priority={c.priority} />
                          </td>
                          <td className="px-4 py-3">
                            <CaseStatusBadge status={c.status} />
                          </td>
                          <td className="px-4 py-3">
                            <SlaBadge complaint={c} />
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className="flex gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => openAssignModal(c)}
                                className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                                title="Assign to department"
                              >
                                Assign
                              </button>
                              {c.status !== "resolved" && (
                                <button
                                  onClick={() => openCloseoutModal(c)}
                                  className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                                  title="Close case"
                                >
                                  Close
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredComplaints.length === 0 && (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-4 py-12 text-center text-gray-400"
                          >
                            No complaints match your filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Complaint Cards — shown only on small screens */}
              <div className="md:hidden space-y-3">
                {filteredComplaints.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl p-4 shadow-sm active:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => openDetailModal(c)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-semibold text-nwa-blue">
                        {c.id.slice(-8)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(c.date).toLocaleDateString("en-JM", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {c.desc}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <PriorityBadge priority={c.priority} />
                      <CaseStatusBadge status={c.status} />
                      <SlaBadge complaint={c} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {c.category} — {c.parish}
                      </span>
                      <div
                        className="flex gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => openAssignModal(c)}
                          className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Assign
                        </button>
                        {c.status !== "resolved" && (
                          <button
                            onClick={() => openCloseoutModal(c)}
                            className="px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredComplaints.length === 0 && (
                  <div className="bg-white rounded-xl p-8 shadow-sm text-center text-gray-400">
                    No complaints match your filters.
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar (1 col) */}
            <div className="space-y-4">
              {/* Parish Hotspots */}
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  {"\uD83D\uDCCD"} Parish Hotspots
                </h3>
                <div className="space-y-2">
                  {parishHotspots.map(([parish, count]) => (
                    <div
                      key={parish}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-700">{parish}</span>
                      <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-semibold">
                        {count} open
                      </span>
                    </div>
                  ))}
                  {parishHotspots.length === 0 && (
                    <p className="text-xs text-gray-400">No open cases.</p>
                  )}
                </div>
              </div>

              {/* 2-Person Closeout Info */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  {"\uD83D\uDC65"} 2-Person Closeout
                </h3>
                <p className="text-xs text-blue-800 leading-relaxed">
                  All case resolutions require sign-off by two authorized
                  personnel: <strong>Officer A</strong> (field verification) and{" "}
                  <strong>Supervisor B</strong> (approval). This ensures
                  accountability and prevents unauthorized closures.
                </p>
                <div className="mt-3 p-2 bg-white rounded-lg text-xs text-blue-700">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold">
                      A
                    </span>
                    <span>Officer resolves &amp; documents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold">
                      B
                    </span>
                    <span>Supervisor reviews &amp; closes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  CMS TAB                                                         */}
      {/* ================================================================ */}
      {activeTab === "cms" && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            CMS Content Workflow Demo
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Walk through the full content creation and approval pipeline.
          </p>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>
                Step {cmsStep + 1} of {CMS_STEPS.length}
              </span>
              <span>{CMS_STEPS[cmsStep]}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full bg-nwa-blue transition-all duration-500"
                style={{
                  width: `${((cmsStep + 1) / CMS_STEPS.length) * 100}%`,
                }}
              />
            </div>
            {/* Step dots */}
            <div className="flex justify-between mt-2">
              {CMS_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center ${
                    i <= cmsStep ? "text-nwa-blue" : "text-gray-300"
                  }`}
                  style={{ width: `${100 / CMS_STEPS.length}%` }}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                      i < cmsStep
                        ? "bg-nwa-blue border-nwa-blue text-white"
                        : i === cmsStep
                        ? "bg-white border-nwa-blue text-nwa-blue"
                        : "bg-white border-gray-300 text-gray-300"
                    }`}
                  >
                    {i < cmsStep ? "\u2713" : i + 1}
                  </div>
                  <span className="text-[10px] mt-1 text-center leading-tight hidden sm:block">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-xl p-6 shadow-sm min-h-[300px]">
            {/* Step 0: Log in as Editor */}
            {cmsStep === 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  {"\uD83D\uDD11"} Step 1: Log in as Editor
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 max-w-sm">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Username
                      </label>
                      <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700">
                        editor@nwa.gov.jm
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Role
                      </label>
                      <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700">
                        Content Editor
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg p-2">
                    <span>{"\u2705"}</span>
                    <span>Authenticated successfully</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Create News Article */}
            {cmsStep === 1 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  {"\uD83D\uDCF0"} Step 2: Create News Article
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-xs font-medium text-gray-500">Title</span>
                    <p className="text-sm font-semibold text-gray-800">
                      NWA Launches Emergency Pothole Repair Programme for Kingston
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">Category</span>
                    <p className="text-sm text-gray-700">Press Release</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">Parish</span>
                    <p className="text-sm text-gray-700">Kingston</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">Content</span>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-600 leading-relaxed">
                      The National Works Agency today announced an emergency pothole
                      repair programme targeting the Kingston Metropolitan Area.
                      The $150M initiative will address over 200 reported potholes
                      across major corridors including Washington Boulevard,
                      Constant Spring Road, and Marcus Garvey Drive. Crews will
                      operate on a 24-hour schedule to minimize traffic disruption.
                      Motorists are advised to exercise caution in work zones.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Status:</span>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs font-semibold">
                      Draft
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Submit for Review */}
            {cmsStep === 2 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  {"\uD83D\uDCE4"} Step 3: Submit for Review
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 mb-3">
                    The article has been submitted for editorial review. An
                    approver must review and publish the content.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Status:</span>
                    <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded-full text-xs font-semibold">
                      {cmsArticleStatus === "pending_review"
                        ? "Pending Review"
                        : "Draft"}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Submitted by: editor@nwa.gov.jm | {new Date().toLocaleDateString("en-JM")}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Log in as Approver */}
            {cmsStep === 3 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  {"\uD83D\uDD11"} Step 4: Log in as Approver
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 max-w-sm">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Username
                      </label>
                      <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700">
                        approver@nwa.gov.jm
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Role
                      </label>
                      <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700">
                        Content Approver / Communications Director
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg p-2">
                    <span>{"\u2705"}</span>
                    <span>Authenticated successfully</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Approve & Publish */}
            {cmsStep === 4 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  {"\u2705"} Step 5: Approve &amp; Publish
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 mb-3">
                    The article has been reviewed and approved for publication.
                    It is now live on the public website.
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-500">Title:</span>
                    <span className="text-sm font-semibold text-gray-800">
                      NWA Launches Emergency Pothole Repair Programme for Kingston
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Status:</span>
                    <span className="px-2 py-0.5 bg-green-200 text-green-800 rounded-full text-xs font-semibold">
                      Published
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Approved by: approver@nwa.gov.jm |{" "}
                    {new Date().toLocaleDateString("en-JM")}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Create Road Closure Alert */}
            {cmsStep === 5 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  {"\u26D4"} Step 6: Create Road Closure Alert
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Road</span>
                      <p className="text-sm text-gray-800">Old Hope Road (near Papine)</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Parish</span>
                      <p className="text-sm text-gray-800">St. Andrew</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Start Date</span>
                      <p className="text-sm text-gray-800">March 5, 2026</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">End Date</span>
                      <p className="text-sm text-gray-800">March 12, 2026</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-xs font-medium text-gray-500">Reason</span>
                      <p className="text-sm text-gray-800">Emergency sinkhole repair</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-xs font-medium text-gray-500">Detour</span>
                      <p className="text-sm text-gray-800">
                        Use Gordon Town Road as alternate route
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Severity</span>
                      <span className="inline-flex ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        Critical
                      </span>
                    </div>
                  </div>

                  {/* Push to homepage checkbox */}
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="push-to-homepage"
                      checked={cmsPushToHomepage}
                      onChange={(e) => setCmsPushToHomepage(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-nwa-blue focus:ring-nwa-blue"
                    />
                    <label
                      htmlFor="push-to-homepage"
                      className="text-sm font-medium text-amber-800 cursor-pointer"
                    >
                      Push to Homepage Alert Banner
                    </label>
                  </div>
                </div>

                {/* Special Publish & Push button */}
                <div className="mt-4">
                  <button
                    onClick={handlePublishAndPush}
                    className="px-6 py-3 bg-nwa-green text-white font-semibold rounded-lg hover:bg-nwa-green-dark transition-colors"
                  >
                    {"\uD83D\uDE80"} Publish &amp; Push to Homepage
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Complete */}
            {cmsStep === 6 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{"\uD83C\uDF89"}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Workflow Complete!
                </h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto mb-4">
                  You have successfully walked through the full CMS content
                  workflow: from creating a news article, submitting for review,
                  approving, and publishing a road closure alert.
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-sm">
                  <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full font-medium">
                    {"\u2705"} News Article Published
                  </div>
                  <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full font-medium">
                    {"\u2705"} Road Closure Alert Created
                  </div>
                  {cmsPushToHomepage && (
                    <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full font-medium">
                      {"\u2705"} Pushed to Homepage
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setCmsStep(0);
                      setCmsArticleStatus("draft");
                      setCmsPushToHomepage(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-nwa-blue border border-nwa-blue rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Restart Workflow
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          {cmsStep < 6 && cmsStep !== 5 && (
            <div className="flex justify-between mt-6">
              <button
                onClick={handleCmsPrev}
                disabled={cmsStep === 0}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  cmsStep === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {"\u2190"} Previous
              </button>
              <button
                onClick={handleCmsNext}
                className="px-5 py-2.5 text-sm font-semibold bg-nwa-blue text-white rounded-lg hover:bg-nwa-blue-light transition-colors"
              >
                Next {"\u2192"}
              </button>
            </div>
          )}
          {cmsStep === 5 && (
            <div className="flex justify-between mt-6">
              <button
                onClick={handleCmsPrev}
                className="px-5 py-2.5 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {"\u2190"} Previous
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/*  MODALS                                                          */}
      {/* ================================================================ */}

      {/* ── Ticket Detail Modal ── */}
      {showDetailModal && selectedComplaint && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto"
          onClick={closeDetailModal}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50" />

          {/* Modal content */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient header */}
            <div
              className="px-6 py-5 text-white"
              style={{
                background: `linear-gradient(135deg, #003876, ${
                  CASE_STATUS_COLORS[selectedComplaint.status] || "#003876"
                })`,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-200 font-mono mb-1">
                    {selectedComplaint.id}
                  </p>
                  <h3 className="text-lg font-bold">
                    {selectedComplaint.category} Report
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <CaseStatusBadge status={selectedComplaint.status} />
                  <button
                    onClick={closeDetailModal}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                    aria-label="Close modal"
                  >
                    {"\u2715"}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Description
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedComplaint.desc}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs text-gray-500">Date</span>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(selectedComplaint.date).toLocaleDateString("en-JM", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs text-gray-500">Parish</span>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedComplaint.parish}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs text-gray-500">Priority</span>
                  <div className="mt-0.5">
                    <PriorityBadge priority={selectedComplaint.priority} />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs text-gray-500">SLA</span>
                  <div className="mt-0.5">
                    <SlaBadge complaint={selectedComplaint} />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs text-gray-500">Assigned To</span>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedComplaint.assignedTo || "Unassigned"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs text-gray-500">Category</span>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedComplaint.category}
                  </p>
                </div>
              </div>

              {/* Resolved info */}
              {selectedComplaint.status === "resolved" && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-xs text-green-700">Resolved By</span>
                      <p className="font-medium text-green-800">
                        {selectedComplaint.resolvedBy || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-green-700">Closed By</span>
                      <p className="font-medium text-green-800">
                        {selectedComplaint.closedBy || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Update Case Panel */}
              {selectedComplaint.status !== "resolved" && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">
                    Update Case
                  </h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Status
                      </label>
                      <select
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-nwa-blue"
                      >
                        {Object.entries(CASE_STATUS_LABELS).map(
                          ([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Category
                      </label>
                      <select
                        value={updateCategory}
                        onChange={(e) => setUpdateCategory(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-nwa-blue"
                      >
                        <option value="Pothole">Pothole</option>
                        <option value="Road Damage">Road Damage</option>
                        <option value="Flooding">Flooding</option>
                        <option value="Drainage">Drainage</option>
                        <option value="Signage">Signage</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Assigned To
                      </label>
                      <select
                        value={updateAssignedTo}
                        onChange={(e) => setUpdateAssignedTo(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-nwa-blue"
                      >
                        <option value="">Unassigned</option>
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Priority
                      </label>
                      <select
                        value={updatePriority}
                        onChange={(e) => setUpdatePriority(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-nwa-blue"
                      >
                        <option value="high">High</option>
                        <option value="standard">Standard</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Internal Note
                    </label>
                    <textarea
                      value={updateNote}
                      onChange={(e) => setUpdateNote(e.target.value)}
                      rows={2}
                      placeholder="Add an internal note..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-nwa-blue focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleUpdateCase}
                    className="px-4 py-2 bg-nwa-blue text-white text-sm font-semibold rounded-lg hover:bg-nwa-blue-light transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}

              {/* Internal Notes */}
              {(caseNotes[selectedComplaint.id]?.length ?? 0) > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Internal Notes
                  </h4>
                  <div className="space-y-2">
                    {caseNotes[selectedComplaint.id].map((note, i) => (
                      <div
                        key={i}
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-900"
                      >
                        <div className="flex items-center gap-2 text-xs text-yellow-700 mb-1">
                          <span className="font-semibold">Staff</span>
                          <span>{"\u2022"}</span>
                          <span>{new Date().toLocaleDateString("en-JM")}</span>
                        </div>
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                  Status Timeline
                </h4>
                <div className="flex items-center gap-0">
                  {STATUS_TIMELINE_STEPS.map((step, i) => {
                    const currentIndex = statusToTimelineIndex(
                      selectedComplaint.status
                    );
                    const isActive = i <= currentIndex;
                    const isCurrent = i === currentIndex;
                    return (
                      <div key={i} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                              isActive
                                ? "bg-nwa-blue border-nwa-blue text-white"
                                : "bg-white border-gray-300 text-gray-400"
                            } ${
                              isCurrent
                                ? "ring-2 ring-nwa-blue/30 ring-offset-2"
                                : ""
                            }`}
                          >
                            {isActive && i < currentIndex ? "\u2713" : i + 1}
                          </div>
                          <span
                            className={`text-[10px] mt-1 text-center leading-tight ${
                              isActive ? "text-nwa-blue font-semibold" : "text-gray-400"
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                        {i < STATUS_TIMELINE_STEPS.length - 1 && (
                          <div
                            className={`h-0.5 w-full ${
                              i < currentIndex ? "bg-nwa-blue" : "bg-gray-200"
                            }`}
                            style={{ minWidth: "12px" }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    closeDetailModal();
                    openAssignModal(selectedComplaint);
                  }}
                  className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Assign
                </button>
                {selectedComplaint.status !== "resolved" && (
                  <button
                    onClick={() => {
                      closeDetailModal();
                      openCloseoutModal(selectedComplaint);
                    }}
                    className="px-4 py-2 text-sm font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    2-Person Closeout
                  </button>
                )}
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign Modal ── */}
      {showAssignModal && assignTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => {
            setShowAssignModal(false);
            setAssignTarget(null);
          }}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-nwa-blue text-white flex items-center justify-between">
              <h3 className="font-bold">Assign Case</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setAssignTarget(null);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white"
                aria-label="Close modal"
              >
                {"\u2715"}
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-1">
                Assign <span className="font-mono font-semibold text-nwa-blue">{assignTarget.id}</span> to a department:
              </p>
              <p className="text-xs text-gray-400 mb-4">
                {assignTarget.category} &mdash; {assignTarget.parish}
              </p>
              <div className="space-y-2">
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => assignToDepartment(dept)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors border ${
                      assignTarget.assignedTo === dept
                        ? "bg-nwa-blue/10 border-nwa-blue text-nwa-blue"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-200"
                    }`}
                  >
                    {dept}
                    {assignTarget.assignedTo === dept && (
                      <span className="ml-2 text-xs text-nwa-blue">(current)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2-Person Closeout Modal ── */}
      {showCloseoutModal && closeoutTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => {
            setShowCloseoutModal(false);
            setCloseoutTarget(null);
          }}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-gradient-to-r from-nwa-blue to-nwa-green text-white flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                {"\uD83D\uDC65"} 2-Person Closeout
              </h3>
              <button
                onClick={() => {
                  setShowCloseoutModal(false);
                  setCloseoutTarget(null);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white"
                aria-label="Close modal"
              >
                {"\u2715"}
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Case <span className="font-mono font-semibold text-nwa-blue">{closeoutTarget.id}</span> requires dual authorization to close.
              </p>

              <div className="space-y-3 mb-6">
                {/* Officer A */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold text-sm">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      J. Williams
                    </p>
                    <p className="text-xs text-gray-500">
                      Officer A &mdash; Field Verification
                    </p>
                  </div>
                  <span className="ml-auto text-green-600 text-lg">{"\u2705"}</span>
                </div>

                {/* Supervisor B */}
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center text-green-800 font-bold text-sm">
                    B
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      M. Thompson
                    </p>
                    <p className="text-xs text-gray-500">
                      Supervisor B &mdash; Final Approval
                    </p>
                  </div>
                  <span className="ml-auto text-green-600 text-lg">{"\u2705"}</span>
                </div>
              </div>

              <button
                onClick={confirmCloseout}
                className="w-full px-4 py-3 bg-nwa-green text-white font-semibold rounded-lg hover:bg-nwa-green-dark transition-colors text-sm"
              >
                {"\u2705"} Confirm &amp; Close Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
