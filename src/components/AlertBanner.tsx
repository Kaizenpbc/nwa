"use client";

import { useState } from "react";
import Link from "next/link";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import { CLOSURES, SEVERITY_COLORS } from "@/data/mock";

export default function AlertBanner() {
  const [dismissed, setDismissed] = useState(false);
  const activeAlerts = CLOSURES.filter((c) => c.push);

  if (dismissed || activeAlerts.length === 0) return null;

  return (
    <div role="alert">
      {activeAlerts.map((alert) => (
        <div
          key={alert.id}
          className="text-white text-sm flex items-center gap-3 px-5 py-2.5 flex-wrap"
          style={{ background: SEVERITY_COLORS[alert.severity] || "#C62828" }}
        >
          <span className="bg-white/25 px-2 py-0.5 rounded text-xs font-bold uppercase">{alert.severity}</span>
          <span className="font-semibold">Road Closure: {alert.road} ({alert.parish})</span>
          <span className="opacity-90">{alert.reason} — {alert.detour}</span>
          <span className="ml-auto opacity-80 text-xs hidden sm:inline">{alert.start} to {alert.end}</span>
          <Link href="/closures" className="underline font-semibold hover:text-yellow-200 text-xs">
            Details →
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded hover:bg-white/20 transition-colors shrink-0"
            aria-label="Dismiss alert"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
