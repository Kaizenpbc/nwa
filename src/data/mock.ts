// ===== MOCK DATA — merged from NWA prototype =====

export const PARISHES = [
  "Kingston", "St. Andrew", "St. Thomas", "Portland", "St. Mary", "St. Ann",
  "Trelawny", "St. James", "Hanover", "Westmoreland", "St. Elizabeth",
  "Manchester", "Clarendon", "St. Catherine",
];

export const COMPLAINT_CATEGORIES = [
  "Pothole", "Road Damage", "Flooding", "Drainage", "Signage", "Other",
];

export const DEPARTMENTS = [
  "Road Maintenance", "Bridge & Drainage", "Parish Operations",
  "Traffic Management", "Major Projects", "Planning & Research",
];

// ── Status / Severity config ──
export const STATUS_COLORS: Record<string, string> = {
  complete: "#4CAF50", in_progress: "#FF9800", planned: "#9E9E9E", delayed: "#F44336",
};
export const STATUS_LABELS: Record<string, string> = {
  complete: "Complete", in_progress: "In Progress", planned: "Planned", delayed: "Delayed",
};
export const SEVERITY_COLORS: Record<string, string> = {
  critical: "#C62828", warning: "#E65100", info: "#1565C0",
};
export const CASE_STATUS_COLORS: Record<string, string> = {
  pending: "#FF9800", under_review: "#1565C0", sent_review: "#7B1FA2", resolved: "#4CAF50",
};
export const CASE_STATUS_LABELS: Record<string, string> = {
  pending: "Pending Approval", under_review: "Under Review",
  sent_review: "Sent for Review", resolved: "Resolved",
};

// SLA
export const SLA_DAYS: Record<string, number> = { high: 1, standard: 3, low: 5 };
export const SLA_COLORS: Record<string, string> = {
  on_track: "#4CAF50", at_risk: "#FF9800", breached: "#C62828", met: "#4CAF50", missed: "#C62828",
};
export const SLA_LABELS: Record<string, string> = {
  on_track: "On Track", at_risk: "At Risk", breached: "Breached", met: "SLA Met", missed: "SLA Missed",
};

// Emergency
export const ALERT_LEVEL_COLORS: Record<string, string> = {
  normal: "#4CAF50", advisory: "#FF9800", warning: "#E65100", emergency: "#C62828",
};
export const ALERT_LEVEL_LABELS: Record<string, string> = {
  normal: "Normal", advisory: "Advisory", warning: "Warning", emergency: "Emergency",
};
export const PARISH_ALERT_LEVELS: Record<string, string> = {
  Kingston: "warning", "St. Andrew": "warning", "St. Thomas": "advisory",
  Portland: "advisory", "St. Mary": "emergency", "St. Ann": "normal",
  Trelawny: "normal", "St. James": "normal", Hanover: "normal",
  Westmoreland: "normal", "St. Elizabeth": "normal", Manchester: "normal",
  Clarendon: "normal", "St. Catherine": "advisory",
};
export const PARISH_COORDS: Record<string, [number, number]> = {
  Kingston: [18.0, -76.8], "St. Andrew": [18.04, -76.78], "St. Thomas": [17.97, -76.35],
  Portland: [18.18, -76.45], "St. Mary": [18.27, -76.89], "St. Ann": [18.41, -77.1],
  Trelawny: [18.35, -77.6], "St. James": [18.47, -77.92], Hanover: [18.41, -78.13],
  Westmoreland: [18.22, -78.15], "St. Elizabeth": [18.05, -77.85], Manchester: [18.04, -77.5],
  Clarendon: [17.97, -77.24], "St. Catherine": [18.04, -76.95],
};

// ── Types ──
export interface Project {
  id: number;
  title: string;
  parish: string;
  status: string;
  pct: number;
  lat: number;
  lng: number;
  desc: string;
  start: string;
  end: string;
}

export interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  parish: string;
  excerpt: string;
}

export interface Closure {
  id: number;
  road: string;
  parish: string;
  start: string;
  end: string;
  reason: string;
  detour: string;
  severity: string;
  push: boolean;
  lat: number;
  lng: number;
}

export interface Complaint {
  id: string;
  category: string;
  desc: string;
  parish: string;
  status: string;
  date: string;
  lat: number;
  lng: number;
  assignedTo?: string;
  resolvedBy?: string;
  closedBy?: string;
  priority: string;
}

export interface EmergencyEvent {
  id: number;
  type: string;
  name: string;
  severity: string;
  date: string;
  parishes: string[];
  roadsAffected: number;
  crewsDeployed: number;
  status: string;
  desc: string;
}

// ── DATA ──
export const PROJECTS: Project[] = [
  { id: 1, title: "Mandela Highway Rehabilitation", parish: "St. Catherine", status: "in_progress", pct: 65, lat: 18.015, lng: -76.865, desc: "Major corridor rehabilitation including drainage, resurfacing, and road widening.", start: "2025-06", end: "2026-09" },
  { id: 2, title: "Fern Gully Retaining Wall", parish: "St. Ann", status: "in_progress", pct: 40, lat: 18.41, lng: -77.12, desc: "Construction of reinforced retaining walls along the Fern Gully corridor.", start: "2025-09", end: "2026-06" },
  { id: 3, title: "May Pen Bypass Phase 2", parish: "Clarendon", status: "planned", pct: 0, lat: 17.97, lng: -77.24, desc: "Extension of the May Pen bypass road to reduce town centre congestion.", start: "2026-04", end: "2027-08" },
  { id: 4, title: "Brunswick Avenue Resurfacing", parish: "St. Andrew", status: "complete", pct: 100, lat: 18.02, lng: -76.785, desc: "Full resurfacing and drainage improvement along Brunswick Avenue.", start: "2024-11", end: "2025-08" },
  { id: 5, title: "Montego Bay Perimeter Road", parish: "St. James", status: "in_progress", pct: 52, lat: 18.47, lng: -77.92, desc: "New perimeter road to ease traffic congestion in Montego Bay.", start: "2025-03", end: "2026-12" },
  { id: 6, title: "Port Antonio Coastal Defence", parish: "Portland", status: "in_progress", pct: 30, lat: 18.18, lng: -76.45, desc: "Coastal erosion protection and road rehabilitation along the Portland coastline.", start: "2025-07", end: "2026-10" },
  { id: 7, title: "Spanish Town Bypass Upgrade", parish: "St. Catherine", status: "delayed", pct: 22, lat: 18.01, lng: -76.95, desc: "Upgrade and widening of the Spanish Town bypass corridor.", start: "2025-01", end: "2026-03" },
  { id: 8, title: "Negril Long Bay Road Repair", parish: "Westmoreland", status: "complete", pct: 100, lat: 18.27, lng: -78.35, desc: "Emergency repair of Long Bay Road following hurricane damage.", start: "2025-02", end: "2025-09" },
  { id: 9, title: "Bull Bay Bridge Replacement", parish: "St. Andrew", status: "in_progress", pct: 58, lat: 17.96, lng: -76.72, desc: "Replacement of the deteriorated Bull Bay bridge structure.", start: "2025-05", end: "2026-04" },
  { id: 10, title: "Bog Walk Gorge Stabilisation", parish: "St. Catherine", status: "in_progress", pct: 45, lat: 18.09, lng: -76.99, desc: "Slope stabilisation and rock fall protection along the Bog Walk Gorge.", start: "2025-08", end: "2026-07" },
  { id: 11, title: "Ocho Rios Main Street", parish: "St. Ann", status: "complete", pct: 100, lat: 18.4074, lng: -77.1025, desc: "Streetscaping and drainage improvements along Ocho Rios main commercial corridor.", start: "2024-06", end: "2025-05" },
  { id: 12, title: "Savanna-la-Mar Flood Mitigation", parish: "Westmoreland", status: "planned", pct: 0, lat: 18.22, lng: -78.13, desc: "Flood mitigation infrastructure including culverts and drainage channels.", start: "2026-06", end: "2027-04" },
  { id: 13, title: "Junction Road Rehabilitation", parish: "St. Mary", status: "in_progress", pct: 35, lat: 18.27, lng: -76.89, desc: "Full rehabilitation of the Junction Road connecting St. Mary to St. Andrew.", start: "2025-10", end: "2026-11" },
];

export const NEWS: NewsItem[] = [
  { id: 1, title: "NWA Completes Rehabilitation of Brunswick Avenue", date: "2025-08-15", category: "Press Release", parish: "St. Andrew", excerpt: "The National Works Agency has completed the full resurfacing and drainage improvement project along Brunswick Avenue..." },
  { id: 2, title: "Road Advisory: Mandela Highway Lane Closures", date: "2025-12-20", category: "Road Advisory", parish: "St. Catherine", excerpt: "Motorists are advised that intermittent lane closures will be in effect along sections of the Mandela Highway..." },
  { id: 3, title: "NWA Awards Contract for May Pen Bypass Phase 2", date: "2026-01-10", category: "Press Release", parish: "Clarendon", excerpt: "The National Works Agency has awarded the contract for the second phase of the May Pen bypass project..." },
  { id: 4, title: "Hurricane Season Preparedness: NWA Drain Cleaning Programme", date: "2025-11-01", category: "Announcement", parish: "Kingston", excerpt: "In preparation for the 2025 hurricane season, the NWA has commenced island-wide drain cleaning operations..." },
  { id: 5, title: "Montego Bay Perimeter Road Reaches 50% Completion", date: "2026-02-05", category: "Update", parish: "St. James", excerpt: "The Montego Bay Perimeter Road project has reached the 50% completion milestone ahead of schedule..." },
  { id: 6, title: "NWA Opens New Parish Office in Portland", date: "2026-01-28", category: "Announcement", parish: "Portland", excerpt: "The National Works Agency has opened a new parish operations office in Port Antonio to improve service delivery..." },
];

export const CLOSURES: Closure[] = [
  { id: 1, road: "Mandela Highway", parish: "St. Catherine", start: "2026-02-18", end: "2026-02-25", reason: "Bridge deck repairs", detour: "Use Portmore Toll Road as alternate route", severity: "critical", push: true, lat: 18.015, lng: -76.865 },
  { id: 2, road: "Fern Gully", parish: "St. Ann", start: "2026-02-20", end: "2026-02-22", reason: "Retaining wall construction", detour: "Use Murphy Hill alternate route", severity: "warning", push: true, lat: 18.41, lng: -77.12 },
  { id: 3, road: "Hope Road (near Liguanea)", parish: "St. Andrew", start: "2026-02-15", end: "2026-02-17", reason: "Water main repair", detour: "Use Old Hope Road", severity: "info", push: false, lat: 18.025, lng: -76.77 },
];

export const COMPLAINTS_INIT: Complaint[] = [
  { id: "NWA-20260215-0001", category: "Pothole", desc: "Large pothole on Washington Boulevard near Three Miles. Approximately 2 feet wide.", parish: "Kingston", status: "under_review", date: "2026-02-15", lat: 18.015, lng: -76.81, assignedTo: "Road Maintenance", priority: "high" },
  { id: "NWA-20260216-0002", category: "Flooding", desc: "Persistent flooding at the intersection of Spanish Town Road and Marcus Garvey Drive after moderate rainfall.", parish: "Kingston", status: "pending", date: "2026-02-16", lat: 18.005, lng: -76.8, priority: "standard" },
  { id: "NWA-20260217-0003", category: "Road Damage", desc: "Road surface severely damaged along a 200m stretch of the Junction Road near Castleton.", parish: "St. Mary", status: "resolved", date: "2026-02-17", lat: 18.25, lng: -76.88, assignedTo: "Parish Operations", resolvedBy: "J. Williams", closedBy: "M. Thompson", priority: "high" },
  { id: "NWA-20260218-0004", category: "Signage", desc: "Missing directional sign at the roundabout entering Mandeville from the bypass.", parish: "Manchester", status: "pending", date: "2026-02-18", lat: 18.04, lng: -77.5, priority: "low" },
  { id: "NWA-20260210-0005", category: "Pothole", desc: "Series of potholes on Constant Spring Road near Manor Park causing traffic slowdowns.", parish: "St. Andrew", status: "resolved", date: "2026-02-10", lat: 18.035, lng: -76.785, assignedTo: "Road Maintenance", resolvedBy: "D. Brown", closedBy: "S. Clarke", priority: "standard" },
  { id: "NWA-20260211-0006", category: "Drainage", desc: "Blocked drain causing water accumulation on Red Hills Road near Stony Hill.", parish: "St. Andrew", status: "under_review", date: "2026-02-11", lat: 18.045, lng: -76.805, assignedTo: "Bridge & Drainage", priority: "standard" },
  { id: "NWA-20260212-0007", category: "Road Damage", desc: "Road shoulder collapse on the North Coast Highway near Discovery Bay.", parish: "St. Ann", status: "sent_review", date: "2026-02-12", lat: 18.45, lng: -77.4, assignedTo: "Parish Operations", priority: "high" },
  { id: "NWA-20260213-0008", category: "Flooding", desc: "Chronic flooding at Bog Walk Gorge entrance during moderate rainfall.", parish: "St. Catherine", status: "under_review", date: "2026-02-13", lat: 18.09, lng: -76.99, assignedTo: "Bridge & Drainage", priority: "standard" },
  { id: "NWA-20260214-0009", category: "Pothole", desc: "Deep pothole on Molynes Road near Queensborough. Two vehicles damaged.", parish: "Kingston", status: "pending", date: "2026-02-14", lat: 18.02, lng: -76.8, priority: "high" },
  { id: "NWA-20260219-0010", category: "Road Damage", desc: "Landslide debris partially blocking Junction Road near Hardware Gap.", parish: "St. Andrew", status: "pending", date: "2026-02-19", lat: 18.12, lng: -76.71, priority: "standard" },
  { id: "NWA-20260219-0011", category: "Signage", desc: "Faded road markings on the Mandela Highway near Portmore toll plaza.", parish: "St. Catherine", status: "sent_review", date: "2026-02-19", lat: 18.005, lng: -76.87, assignedTo: "Traffic Management", priority: "low" },
  { id: "NWA-20260220-0012", category: "Flooding", desc: "Severe flooding on Marcus Garvey Drive after overnight rain. Two lanes impassable.", parish: "Kingston", status: "pending", date: "2026-02-20", lat: 18.0, lng: -76.79, priority: "high" },
];

export const EMERGENCY_EVENTS: EmergencyEvent[] = [
  { id: 1, type: "Tropical Storm", name: "Tropical Storm Adele", severity: "warning", date: "2026-02-19", parishes: ["Portland", "St. Thomas", "St. Mary"], roadsAffected: 4, crewsDeployed: 12, status: "monitoring", desc: "Tropical storm approaching eastern parishes with expected rainfall of 100-150mm. NWA crews pre-positioned." },
  { id: 2, type: "Landslide", name: "Junction Road Landslide", severity: "critical", date: "2026-02-18", parishes: ["St. Mary"], roadsAffected: 1, crewsDeployed: 6, status: "active", desc: "Major landslide blocking Junction Road near Castleton. Heavy equipment deployed. Alternative routes via Stony Hill." },
  { id: 3, type: "Flooding", name: "Kingston Metro Flooding", severity: "warning", date: "2026-02-20", parishes: ["Kingston", "St. Andrew"], roadsAffected: 8, crewsDeployed: 15, status: "active", desc: "Widespread urban flooding affecting multiple corridors in the Kingston Metropolitan Area. Drain clearing in progress." },
  { id: 4, type: "Bridge Damage", name: "Rio Cobre Bridge Assessment", severity: "info", date: "2026-02-17", parishes: ["St. Catherine"], roadsAffected: 1, crewsDeployed: 3, status: "assessment", desc: "Structural assessment underway following report of foundation erosion at Rio Cobre crossing." },
];

// ── Helpers ──
export function getSlaStatus(complaint: Complaint): string {
  const priority = complaint.priority || "standard";
  const slaDays = SLA_DAYS[priority];
  const submitted = new Date(complaint.date);
  const deadline = new Date(submitted);
  deadline.setDate(deadline.getDate() + slaDays);
  const now = new Date();

  if (complaint.status === "resolved") {
    return now <= deadline ? "met" : "missed";
  }

  const elapsed = (now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24);
  const threshold = slaDays * 0.75;

  if (elapsed > slaDays) return "breached";
  if (elapsed >= threshold) return "at_risk";
  return "on_track";
}

export function getSlaDaysRemaining(complaint: Complaint): number {
  const priority = complaint.priority || "standard";
  const slaDays = SLA_DAYS[priority];
  const submitted = new Date(complaint.date);
  const deadline = new Date(submitted);
  deadline.setDate(deadline.getDate() + slaDays);
  const now = new Date();
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
