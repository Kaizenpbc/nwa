"use client";

import { useEffect, useState } from "react";
import type { Complaint } from "@/data/mock";
import { CASE_STATUS_LABELS, CASE_STATUS_COLORS } from "@/data/mock";

/**
 * Auto-refreshing live complaint feed that shows the most recent
 * complaints and pulses to indicate "live" status.
 */
export default function LiveFeed({ complaints }: { complaints: Complaint[] }) {
  const [tick, setTick] = useState(0);
  const [pulse, setPulse] = useState(true);

  // Simulate a live pulse every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const recent = [...complaints]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="relative flex h-3 w-3">
          <span
            className={`absolute inline-flex h-full w-full rounded-full bg-green-400 ${
              pulse ? "animate-ping" : ""
            } opacity-75`}
          />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
        </span>
        <h3 className="font-semibold text-gray-900">Live Feed</h3>
        <span className="text-xs text-gray-400 ml-auto">Auto-refresh</span>
      </div>

      <div className="space-y-3">
        {recent.map((c) => {
          const color = CASE_STATUS_COLORS[c.status] || "#999";
          return (
            <div
              key={c.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div
                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-semibold text-gray-700">
                    {c.id.slice(-8)}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={{
                      backgroundColor: `${color}18`,
                      color,
                      border: `1px solid ${color}40`,
                    }}
                  >
                    {CASE_STATUS_LABELS[c.status]}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {c.category} — {c.parish}
                </p>
              </div>
              <span className="text-[10px] text-gray-400 shrink-0 whitespace-nowrap">
                {c.date}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
