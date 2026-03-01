"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import {
  CASE_STATUS_COLORS,
  CASE_STATUS_LABELS,
  getSlaStatus,
  SLA_COLORS,
} from "@/data/mock";
import type { Complaint } from "@/data/mock";

/* ------------------------------------------------------------------ */
/*  Status Pie Chart                                                    */
/* ------------------------------------------------------------------ */

export function StatusPieChart({ complaints }: { complaints: Complaint[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      name: CASE_STATUS_LABELS[status] || status,
      value: count,
      color: CASE_STATUS_COLORS[status] || "#999",
    }));
  }, [complaints]);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-3">Status Distribution</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }: PieLabelRenderProps) =>
              `${name ?? ""} ${(((percent as number) ?? 0) * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Category Bar Chart                                                  */
/* ------------------------------------------------------------------ */

const CATEGORY_COLORS: Record<string, string> = {
  Pothole: "#C62828",
  "Road Damage": "#E65100",
  Flooding: "#1565C0",
  Drainage: "#7B1FA2",
  Signage: "#FF9800",
  Other: "#9E9E9E",
};

export function CategoryBarChart({ complaints }: { complaints: Complaint[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([category, count]) => ({
        category,
        count,
        fill: CATEGORY_COLORS[category] || "#999",
      }))
      .sort((a, b) => b.count - a.count);
  }, [complaints]);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-3">By Category</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <XAxis type="number" allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="category"
            width={90}
            tick={{ fontSize: 12 }}
          />
          <Tooltip />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Parish Bar Chart                                                    */
/* ------------------------------------------------------------------ */

export function ParishBarChart({ complaints }: { complaints: Complaint[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints
      .filter((c) => c.status !== "resolved")
      .forEach((c) => {
        counts[c.parish] = (counts[c.parish] || 0) + 1;
      });
    return Object.entries(counts)
      .map(([parish, count]) => ({ parish, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [complaints]);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-3">Open Cases by Parish</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="parish"
            tick={{ fontSize: 11 }}
            angle={-35}
            textAnchor="end"
            height={60}
          />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#003876" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SLA Overview Chart                                                  */
/* ------------------------------------------------------------------ */

export function SlaOverviewChart({ complaints }: { complaints: Complaint[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints
      .filter((c) => c.status !== "resolved")
      .forEach((c) => {
        const sla = getSlaStatus(c);
        counts[sla] = (counts[sla] || 0) + 1;
      });

    return [
      { name: "On Track", value: counts["on_track"] || 0, color: SLA_COLORS["on_track"] },
      { name: "At Risk", value: counts["at_risk"] || 0, color: SLA_COLORS["at_risk"] },
      { name: "Breached", value: counts["breached"] || 0, color: SLA_COLORS["breached"] },
    ];
  }, [complaints]);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-3">SLA Status (Open Cases)</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            label={({ name, value }) => (value > 0 ? `${name}: ${value}` : "")}
            labelLine={false}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Submissions Timeline (line chart — complaints by date)              */
/* ------------------------------------------------------------------ */

export function SubmissionsTimeline({ complaints }: { complaints: Complaint[] }) {
  const data = useMemo(() => {
    const byDate: Record<string, number> = {};
    complaints.forEach((c) => {
      byDate[c.date] = (byDate[c.date] || 0) + 1;
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en-JM", {
          month: "short",
          day: "numeric",
        }),
        submissions: count,
      }));
  }, [complaints]);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-3">Submission Timeline</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ left: 0, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="submissions"
            stroke="#003876"
            strokeWidth={2}
            dot={{ fill: "#003876", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Priority Breakdown (horizontal stacked bar)                         */
/* ------------------------------------------------------------------ */

const PRIORITY_CHART_COLORS: Record<string, string> = {
  high: "#C62828",
  standard: "#1565C0",
  low: "#4CAF50",
};

export function PriorityChart({ complaints }: { complaints: Complaint[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints.forEach((c) => {
      counts[c.priority] = (counts[c.priority] || 0) + 1;
    });
    return Object.entries(counts).map(([priority, count]) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: count,
      color: PRIORITY_CHART_COLORS[priority] || "#999",
    }));
  }, [complaints]);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-3">By Priority</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={70}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
