"use client";

import { useMemo } from "react";
import MapView from "@/components/MapView";
import type { Complaint } from "@/data/mock";
import { CASE_STATUS_COLORS } from "@/data/mock";

/**
 * Map showing all complaints as colour-coded markers.
 * Red = high priority, Orange = standard, Green = low.
 * Resolved complaints are shown in green regardless.
 */
export default function ComplaintHeatmap({
  complaints,
  height = "350px",
}: {
  complaints: Complaint[];
  height?: string;
}) {
  const markers = useMemo(
    () =>
      complaints.map((c) => {
        let color: "red" | "orange" | "green" | "blue" | "yellow" = "blue";
        if (c.status === "resolved") color = "green";
        else if (c.priority === "high") color = "red";
        else if (c.priority === "standard") color = "orange";
        else color = "yellow";

        return {
          lat: c.lat,
          lng: c.lng,
          label: c.id,
          popup: `<b>${c.category}</b> — ${c.parish}<br/>${c.desc.slice(0, 80)}...`,
          color,
        };
      }),
    [complaints],
  );

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-3">Complaint Locations</h3>
      <div className="flex flex-wrap gap-3 mb-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-700 inline-block" />
          High Priority
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
          Standard
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
          Low
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
          Resolved
        </span>
      </div>
      <MapView
        center={[18.1096, -77.2975]}
        zoom={9}
        markers={markers}
        height={height}
      />
    </div>
  );
}
