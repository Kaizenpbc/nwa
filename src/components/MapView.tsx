"use client";

import { useEffect, useState } from "react";

interface Marker {
  lat: number;
  lng: number;
  label: string;
  popup?: string;
  color?: "blue" | "red" | "green" | "yellow" | "orange";
}

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: Marker[];
  height?: string;
  className?: string;
}

const colorMap: Record<string, string> = {
  blue: "#003876",
  red: "#dc2626",
  green: "#009b3a",
  yellow: "#f4c430",
  orange: "#f59e0b",
};

export default function MapView({
  center = [18.1096, -77.2975],
  zoom = 9,
  markers = [],
  height = "400px",
  className = "",
}: MapViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <p role="status" className="text-gray-500 text-sm">Loading map...</p>
      </div>
    );
  }

  return <DynamicMap center={center} zoom={zoom} markers={markers} height={height} className={className} />;
}

function DynamicMap({ center, zoom, markers, height, className }: MapViewProps) {
  const [L, setL] = useState<typeof import("leaflet") | null>(null);
  const [Components, setComponents] = useState<{
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    CircleMarker: typeof import("react-leaflet").CircleMarker;
    Popup: typeof import("react-leaflet").Popup;
  } | null>(null);

  useEffect(() => {
    Promise.all([import("leaflet"), import("react-leaflet")]).then(([leaflet, rl]) => {
      setL(leaflet.default || leaflet);
      setComponents({
        MapContainer: rl.MapContainer,
        TileLayer: rl.TileLayer,
        CircleMarker: rl.CircleMarker,
        Popup: rl.Popup,
      });
    });
  }, []);

  useEffect(() => {
    if (L) {
      // Import leaflet CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        document.head.appendChild(link);
      }
    }
  }, [L]);

  if (!Components) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <p role="status" className="text-gray-500 text-sm">Loading map...</p>
      </div>
    );
  }

  const { MapContainer, TileLayer, CircleMarker, Popup } = Components;

  return (
    <div style={{ height }} className={`rounded-lg overflow-hidden ${className}`}>
      <MapContainer
        center={center || [18.1096, -77.2975]}
        zoom={zoom || 9}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        aria-label="Interactive map of Jamaica"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers?.map((marker, i) => (
          <CircleMarker
            key={i}
            center={[marker.lat, marker.lng]}
            radius={8}
            pathOptions={{
              color: "white",
              weight: 2,
              fillColor: colorMap[marker.color || "blue"],
              fillOpacity: 0.9,
            }}
          >
            {marker.popup && (
              <Popup>
                <div className="text-sm">
                  <strong>{marker.label}</strong>
                  <p className="mt-1 text-gray-600">{marker.popup}</p>
                </div>
              </Popup>
            )}
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
