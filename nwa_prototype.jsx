import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from "react-leaflet";

// ===== DATA =====
const PARISHES = ["Kingston","St. Andrew","St. Thomas","Portland","St. Mary","St. Ann","Trelawny","St. James","Hanover","Westmoreland","St. Elizabeth","Manchester","Clarendon","St. Catherine"];

const PROJECTS = [
  { id:1, title:"Mandela Highway Rehabilitation", parish:"St. Catherine", status:"in_progress", pct:65, lat:18.0150, lng:-76.8650, desc:"Major corridor rehabilitation including drainage, resurfacing, and road widening.", start:"2025-06", end:"2026-09" },
  { id:2, title:"Fern Gully Retaining Wall", parish:"St. Ann", status:"in_progress", pct:40, lat:18.4100, lng:-77.1200, desc:"Construction of reinforced retaining walls along the Fern Gully corridor.", start:"2025-09", end:"2026-06" },
  { id:3, title:"May Pen Bypass Phase 2", parish:"Clarendon", status:"planned", pct:0, lat:17.9700, lng:-77.2400, desc:"Extension of the May Pen bypass road to reduce town centre congestion.", start:"2026-04", end:"2027-08" },
  { id:4, title:"Brunswick Avenue Resurfacing", parish:"St. Andrew", status:"complete", pct:100, lat:18.0200, lng:-76.7850, desc:"Full resurfacing and drainage improvement along Brunswick Avenue.", start:"2024-11", end:"2025-08" },
  { id:5, title:"Montego Bay Perimeter Road", parish:"St. James", status:"in_progress", pct:52, lat:18.4700, lng:-77.9200, desc:"New perimeter road to ease traffic congestion in Montego Bay.", start:"2025-03", end:"2026-12" },
  { id:6, title:"Port Antonio Coastal Defence", parish:"Portland", status:"in_progress", pct:30, lat:18.1800, lng:-76.4500, desc:"Coastal erosion protection and road rehabilitation along the Portland coastline.", start:"2025-07", end:"2026-10" },
  { id:7, title:"Spanish Town Bypass Upgrade", parish:"St. Catherine", status:"delayed", pct:22, lat:18.0100, lng:-76.9500, desc:"Upgrade and widening of the Spanish Town bypass corridor.", start:"2025-01", end:"2026-03" },
  { id:8, title:"Negril Long Bay Road Repair", parish:"Westmoreland", status:"complete", pct:100, lat:18.2700, lng:-78.3500, desc:"Emergency repair of Long Bay Road following hurricane damage.", start:"2025-02", end:"2025-09" },
  { id:9, title:"Bull Bay Bridge Replacement", parish:"St. Andrew", status:"in_progress", pct:58, lat:17.9600, lng:-76.7200, desc:"Replacement of the deteriorated Bull Bay bridge structure.", start:"2025-05", end:"2026-04" },
  { id:10, title:"Bog Walk Gorge Stabilisation", parish:"St. Catherine", status:"in_progress", pct:45, lat:18.0900, lng:-76.9900, desc:"Slope stabilisation and rock fall protection along the Bog Walk Gorge.", start:"2025-08", end:"2026-07" },
  { id:11, title:"Ocho Rios Main Street", parish:"St. Ann", status:"complete", pct:100, lat:18.4074, lng:-77.1025, desc:"Streetscaping and drainage improvements along Ocho Rios main commercial corridor.", start:"2024-06", end:"2025-05" },
  { id:12, title:"Savanna-la-Mar Flood Mitigation", parish:"Westmoreland", status:"planned", pct:0, lat:18.2200, lng:-78.1300, desc:"Flood mitigation infrastructure including culverts and drainage channels.", start:"2026-06", end:"2027-04" },
  { id:13, title:"Junction Road Rehabilitation", parish:"St. Mary", status:"in_progress", pct:35, lat:18.2700, lng:-76.8900, desc:"Full rehabilitation of the Junction Road connecting St. Mary to St. Andrew.", start:"2025-10", end:"2026-11" },
];

const NEWS = [
  { id:1, title:"NWA Completes Rehabilitation of Brunswick Avenue", date:"2025-08-15", category:"Press Release", parish:"St. Andrew", excerpt:"The National Works Agency has completed the full resurfacing and drainage improvement project along Brunswick Avenue..." },
  { id:2, title:"Road Advisory: Mandela Highway Lane Closures", date:"2025-12-20", category:"Road Advisory", parish:"St. Catherine", excerpt:"Motorists are advised that intermittent lane closures will be in effect along sections of the Mandela Highway..." },
  { id:3, title:"NWA Awards Contract for May Pen Bypass Phase 2", date:"2026-01-10", category:"Press Release", parish:"Clarendon", excerpt:"The National Works Agency has awarded the contract for the second phase of the May Pen bypass project..." },
  { id:4, title:"Hurricane Season Preparedness: NWA Drain Cleaning Programme", date:"2025-11-01", category:"Announcement", parish:"Kingston", excerpt:"In preparation for the 2025 hurricane season, the NWA has commenced island-wide drain cleaning operations..." },
  { id:5, title:"Montego Bay Perimeter Road Reaches 50% Completion", date:"2026-02-05", category:"Update", parish:"St. James", excerpt:"The Montego Bay Perimeter Road project has reached the 50% completion milestone ahead of schedule..." },
  { id:6, title:"NWA Opens New Parish Office in Portland", date:"2026-01-28", category:"Announcement", parish:"Portland", excerpt:"The National Works Agency has opened a new parish operations office in Port Antonio to improve service delivery..." },
];

const CLOSURES = [
  { id:1, road:"Mandela Highway", parish:"St. Catherine", start:"2026-02-18", end:"2026-02-25", reason:"Bridge deck repairs", detour:"Use Portmore Toll Road as alternate route", severity:"critical", push:true, lat:18.0150, lng:-76.8650 },
  { id:2, road:"Fern Gully", parish:"St. Ann", start:"2026-02-20", end:"2026-02-22", reason:"Retaining wall construction", detour:"Use Murphy Hill alternate route", severity:"warning", push:true, lat:18.4100, lng:-77.1200 },
  { id:3, road:"Hope Road (near Liguanea)", parish:"St. Andrew", start:"2026-02-15", end:"2026-02-17", reason:"Water main repair", detour:"Use Old Hope Road", severity:"info", push:false, lat:18.0250, lng:-76.7700 },
];

const COMPLAINTS_INIT = [
  { id:"NWA-20260215-0001", category:"Pothole", desc:"Large pothole on Washington Boulevard near Three Miles. Approximately 2 feet wide.", parish:"Kingston", status:"under_review", date:"2026-02-15", lat:18.0150, lng:-76.8100, assignedTo:"Road Maintenance", priority:"high" },
  { id:"NWA-20260216-0002", category:"Flooding", desc:"Persistent flooding at the intersection of Spanish Town Road and Marcus Garvey Drive after moderate rainfall.", parish:"Kingston", status:"pending", date:"2026-02-16", lat:18.0050, lng:-76.8000, priority:"standard" },
  { id:"NWA-20260217-0003", category:"Road Damage", desc:"Road surface severely damaged along a 200m stretch of the Junction Road near Castleton.", parish:"St. Mary", status:"resolved", date:"2026-02-17", lat:18.2500, lng:-76.8800, assignedTo:"Parish Operations", resolvedBy:"J. Williams", closedBy:"M. Thompson", priority:"high" },
  { id:"NWA-20260218-0004", category:"Signage", desc:"Missing directional sign at the roundabout entering Mandeville from the bypass.", parish:"Manchester", status:"pending", date:"2026-02-18", lat:18.0400, lng:-77.5000, priority:"low" },
  { id:"NWA-20260210-0005", category:"Pothole", desc:"Series of potholes on Constant Spring Road near Manor Park causing traffic slowdowns.", parish:"St. Andrew", status:"resolved", date:"2026-02-10", lat:18.0350, lng:-76.7850, assignedTo:"Road Maintenance", resolvedBy:"D. Brown", closedBy:"S. Clarke", priority:"standard" },
  { id:"NWA-20260211-0006", category:"Drainage", desc:"Blocked drain causing water accumulation on Red Hills Road near Stony Hill.", parish:"St. Andrew", status:"under_review", date:"2026-02-11", lat:18.0450, lng:-76.8050, assignedTo:"Bridge & Drainage", priority:"standard" },
  { id:"NWA-20260212-0007", category:"Road Damage", desc:"Road shoulder collapse on the North Coast Highway near Discovery Bay.", parish:"St. Ann", status:"sent_review", date:"2026-02-12", lat:18.4500, lng:-77.4000, assignedTo:"Parish Operations", priority:"high" },
  { id:"NWA-20260213-0008", category:"Flooding", desc:"Chronic flooding at Bog Walk Gorge entrance during moderate rainfall.", parish:"St. Catherine", status:"under_review", date:"2026-02-13", lat:18.0900, lng:-76.9900, assignedTo:"Bridge & Drainage", priority:"standard" },
  { id:"NWA-20260214-0009", category:"Pothole", desc:"Deep pothole on Molynes Road near Queensborough. Two vehicles damaged.", parish:"Kingston", status:"pending", date:"2026-02-14", lat:18.0200, lng:-76.8000, priority:"high" },
  { id:"NWA-20260219-0010", category:"Road Damage", desc:"Landslide debris partially blocking Junction Road near Hardware Gap.", parish:"St. Andrew", status:"pending", date:"2026-02-19", lat:18.1200, lng:-76.7100, priority:"standard" },
  { id:"NWA-20260219-0011", category:"Signage", desc:"Faded road markings on the Mandela Highway near Portmore toll plaza.", parish:"St. Catherine", status:"sent_review", date:"2026-02-19", lat:18.0050, lng:-76.8700, assignedTo:"Traffic Management", priority:"low" },
  { id:"NWA-20260220-0012", category:"Flooding", desc:"Severe flooding on Marcus Garvey Drive after overnight rain. Two lanes impassable.", parish:"Kingston", status:"pending", date:"2026-02-20", lat:18.0000, lng:-76.7900, priority:"high" },
];

const EMERGENCY_EVENTS = [
  { id:1, type:"Tropical Storm", name:"Tropical Storm Adele", severity:"warning", date:"2026-02-19", parishes:["Portland","St. Thomas","St. Mary"], roadsAffected:4, crewsDeployed:12, status:"monitoring", desc:"Tropical storm approaching eastern parishes with expected rainfall of 100-150mm. NWA crews pre-positioned." },
  { id:2, type:"Landslide", name:"Junction Road Landslide", severity:"critical", date:"2026-02-18", parishes:["St. Mary"], roadsAffected:1, crewsDeployed:6, status:"active", desc:"Major landslide blocking Junction Road near Castleton. Heavy equipment deployed. Alternative routes via Stony Hill." },
  { id:3, type:"Flooding", name:"Kingston Metro Flooding", severity:"warning", date:"2026-02-20", parishes:["Kingston","St. Andrew"], roadsAffected:8, crewsDeployed:15, status:"active", desc:"Widespread urban flooding affecting multiple corridors in the Kingston Metropolitan Area. Drain clearing in progress." },
  { id:4, type:"Bridge Damage", name:"Rio Cobre Bridge Assessment", severity:"info", date:"2026-02-17", parishes:["St. Catherine"], roadsAffected:1, crewsDeployed:3, status:"assessment", desc:"Structural assessment underway following report of foundation erosion at Rio Cobre crossing." },
];

const PARISH_ALERT_LEVELS = { Kingston:"warning", "St. Andrew":"warning", "St. Thomas":"advisory", Portland:"advisory", "St. Mary":"emergency", "St. Ann":"normal", Trelawny:"normal", "St. James":"normal", Hanover:"normal", Westmoreland:"normal", "St. Elizabeth":"normal", Manchester:"normal", Clarendon:"normal", "St. Catherine":"advisory" };
const ALERT_LEVEL_COLORS = { normal:"#4CAF50", advisory:"#FF9800", warning:"#E65100", emergency:"#C62828" };
const ALERT_LEVEL_LABELS = { normal:"Normal", advisory:"Advisory", warning:"Warning", emergency:"Emergency" };
const PARISH_COORDS = { Kingston:[18.0,-76.8], "St. Andrew":[18.04,-76.78], "St. Thomas":[17.97,-76.35], Portland:[18.18,-76.45], "St. Mary":[18.27,-76.89], "St. Ann":[18.41,-77.1], Trelawny:[18.35,-77.6], "St. James":[18.47,-77.92], Hanover:[18.41,-78.13], Westmoreland:[18.22,-78.15], "St. Elizabeth":[18.05,-77.85], Manchester:[18.04,-77.5], Clarendon:[17.97,-77.24], "St. Catherine":[18.04,-76.95] };

const STATUS_COLORS = { complete:"#4CAF50", in_progress:"#FF9800", planned:"#9E9E9E", delayed:"#F44336" };
const STATUS_LABELS = { complete:"Complete", in_progress:"In Progress", planned:"Planned", delayed:"Delayed" };
const SEVERITY_COLORS = { critical:"#C62828", warning:"#E65100", info:"#1565C0" };
const CASE_STATUS_COLORS = { pending:"#FF9800", under_review:"#1565C0", sent_review:"#7B1FA2", resolved:"#4CAF50" };
const CASE_STATUS_LABELS = { pending:"Pending Approval", under_review:"Under Review", sent_review:"Sent for Review", resolved:"Resolved" };

const DEPARTMENTS = ["Road Maintenance","Bridge & Drainage","Parish Operations","Traffic Management","Major Projects","Planning & Research"];

// SLA configuration (days to resolve by priority)
const SLA_DAYS = { high:1, standard:3, low:5 };
const SLA_COLORS = { on_track:"#4CAF50", at_risk:"#FF9800", breached:"#C62828", met:"#4CAF50", missed:"#C62828" };
const SLA_LABELS = { on_track:"On Track", at_risk:"At Risk", breached:"Breached", met:"SLA Met", missed:"SLA Missed" };

function getSlaStatus(complaint) {
  const priority = complaint.priority || "standard";
  const slaDays = SLA_DAYS[priority];
  const submitted = new Date(complaint.date);
  const deadline = new Date(submitted);
  deadline.setDate(deadline.getDate() + slaDays);
  const now = new Date();

  if (complaint.status === "resolved") {
    // For resolved: compare resolve date (simulated as same day for demo) vs deadline
    return now <= deadline ? "met" : "missed";
  }

  const elapsed = (now - submitted) / (1000 * 60 * 60 * 24);
  const threshold = slaDays * 0.75;

  if (elapsed > slaDays) return "breached";
  if (elapsed >= threshold) return "at_risk";
  return "on_track";
}

function getSlaDaysRemaining(complaint) {
  const priority = complaint.priority || "standard";
  const slaDays = SLA_DAYS[priority];
  const submitted = new Date(complaint.date);
  const deadline = new Date(submitted);
  deadline.setDate(deadline.getDate() + slaDays);
  const now = new Date();
  const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  return diff;
}

const clickable = (onClick) => ({
  onClick,
  role: "button",
  tabIndex: 0,
  onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(e); } }
});

// Leaflet helper — click-to-pin inside MapContainer
function LocationPicker({ onSelect }) {
  useMapEvents({ click(e) { onSelect({ lat: e.latlng.lat, lng: e.latlng.lng }); } });
  return null;
}

// ===== MAIN APP =====
export default function NWAPrototype() {
  const [page, setPage] = useState("home");
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedParish, setSelectedParish] = useState("");
  const [complaints, setComplaints] = useState(COMPLAINTS_INIT);
  const [trackId, setTrackId] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [cmsStep, setCmsStep] = useState(0);
  const [formData, setFormData] = useState({ category:"Pothole", desc:"", parish:"Kingston", name:"", email:"" });
  const [submitted, setSubmitted] = useState(null);
  const [closures, setClosures] = useState(CLOSURES);
  const [newClosure, setNewClosure] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const navigate = useCallback((p, data) => {
    setPage(p);
    if (p === "project-detail") setSelectedProject(data);
    if (p !== "projects") setSelectedParish("");
    setTrackResult(null); setTrackId("");
    if (p !== "report") { setSubmitted(null); setFormData({ category:"Pothole", desc:"", parish:"Kingston", name:"", email:"" }); }
    if (p !== "cms") setCmsStep(0);
    setMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
    window.scrollTo(0, 0);
  }, []);

  const activeAlerts = closures.filter(c => c.push);

  // Search across all content
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results = [];
    PROJECTS.forEach(p => { if (p.title.toLowerCase().includes(q) || p.parish.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) results.push({ type:"Project", label:p.title, sub:p.parish, data:p }); });
    NEWS.forEach(n => { if (n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q)) results.push({ type:"News", label:n.title, sub:n.date }); });
    closures.forEach(c => { if (c.road.toLowerCase().includes(q) || c.parish.toLowerCase().includes(q) || c.reason.toLowerCase().includes(q)) results.push({ type:"Closure", label:c.road, sub:c.parish }); });
    return results.slice(0, 8);
  }, [searchQuery, closures]);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", color:"#1a1a1a", background:"#f8f9fa", minHeight:"100vh" }}>
      <style>{`
        @media (max-width: 768px) {
          .nwa-menu-toggle { display: block !important; }
          .nwa-nav { display: none !important; position: absolute; top: 64px; left: 0; right: 0; background: #1F4E79; flex-direction: column; padding: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 99; }
          .nwa-nav-open { display: flex !important; }
          .nwa-grid-2col { grid-template-columns: 1fr !important; }
        }
        .leaflet-container { font-family: inherit; }
        @keyframes nwa-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .nwa-page-enter { animation: nwa-fade-in 0.3s ease-out; }
      `}</style>

      {/* Alert Banner */}
      {activeAlerts.length > 0 && page === "home" && activeAlerts.map(alert => (
        <div key={alert.id} role="alert" style={{ background:SEVERITY_COLORS[alert.severity], color:"#fff", padding:"10px 20px", fontSize:13, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          <span style={{ background:"rgba(255,255,255,0.25)", padding:"2px 8px", borderRadius:3, fontWeight:700, fontSize:11, textTransform:"uppercase" }}>{alert.severity}</span>
          <span style={{ fontWeight:600 }}>Road Closure: {alert.road} ({alert.parish})</span>
          <span style={{ opacity:0.9 }}>{alert.reason} — {alert.detour}</span>
          <span style={{ marginLeft:"auto", opacity:0.8, fontSize:11 }}>{alert.start} to {alert.end}</span>
        </div>
      ))}

      {/* Header */}
      <header style={{ background:"#1F4E79", color:"#fff", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64, position:"sticky", top:0, zIndex:1000, boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} {...clickable(() => navigate("home"))} aria-label="Go to homepage">
          <div style={{ width:40, height:40, background:"#D4A843", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:18, color:"#1F4E79" }}>N</div>
          <div>
            <div style={{ fontWeight:700, fontSize:16, letterSpacing:0.5 }}>National Works Agency</div>
            <div style={{ fontSize:10, opacity:0.7, letterSpacing:1, textTransform:"uppercase" }}>Government of Jamaica</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          {/* Search */}
          <div ref={searchRef} style={{ position:"relative" }}>
            <button onClick={() => setSearchOpen(o => !o)} style={{ background: searchOpen ? "rgba(255,255,255,0.15)" : "transparent", color:"#fff", border:"none", padding:"8px 12px", borderRadius:6, cursor:"pointer", fontSize:16 }} aria-label="Search">
              🔍
            </button>
            {searchOpen && (
              <div style={{ position:"absolute", top:44, right:0, width:380, background:"#fff", borderRadius:12, boxShadow:"0 8px 32px rgba(0,0,0,0.2)", zIndex:200, overflow:"hidden" }}>
                <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search projects, news, closures..." style={{ width:"100%", padding:"14px 16px", border:"none", borderBottom:"1px solid #eee", fontSize:14, fontFamily:"inherit", boxSizing:"border-box", outline:"none" }} />
                {searchResults.length > 0 && (
                  <div style={{ maxHeight:320, overflowY:"auto" }}>
                    {searchResults.map((r, i) => (
                      <div key={i} {...clickable(() => { if (r.type === "Project") navigate("project-detail", r.data); else if (r.type === "News") navigate("news"); else navigate("closures"); })}
                        style={{ padding:"10px 16px", cursor:"pointer", borderBottom:"1px solid #f0f0f0", display:"flex", gap:10, alignItems:"center" }}
                        onMouseEnter={e => e.currentTarget.style.background="#f8f9fa"} onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                        <span style={{ background: r.type === "Project" ? "#2E75B6" : r.type === "News" ? "#D4A843" : "#C62828", color:"#fff", padding:"2px 8px", borderRadius:4, fontSize:10, fontWeight:700, flexShrink:0 }}>{r.type}</span>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:"#1F4E79", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.label}</div>
                          <div style={{ fontSize:11, color:"#888" }}>{r.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {searchQuery.trim() && searchResults.length === 0 && (
                  <div style={{ padding:20, textAlign:"center", color:"#888", fontSize:13 }}>No results found</div>
                )}
              </div>
            )}
          </div>
          <button className="nwa-menu-toggle" onClick={() => setMenuOpen(m => !m)} aria-label="Toggle navigation menu" style={{ background:"none", border:"none", color:"#fff", fontSize:24, cursor:"pointer", display:"none", padding:8 }}>
            {menuOpen ? "\u2715" : "\u2630"}
          </button>
          <nav className={`nwa-nav${menuOpen ? " nwa-nav-open" : ""}`} style={{ display:"flex", gap:2, alignItems:"center" }}>
            {[
              { label:"Home", p:"home" },
              { label:"Projects", p:"projects" },
              { label:"Emergency", p:"emergency" },
              { label:"Report Issue", p:"report" },
              { label:"Track", p:"track" },
              { label:"Closures", p:"closures" },
              { label:"News", p:"news" },
              { label:"Dashboard", p:"dashboard" },
              { label:"CMS Demo", p:"cms" },
            ].map(n => (
              <button key={n.p} onClick={() => navigate(n.p)} style={{ background: page === n.p ? "rgba(255,255,255,0.15)" : "transparent", color:"#fff", border:"none", padding:"8px 10px", borderRadius:6, cursor:"pointer", fontSize:12, fontWeight: page === n.p ? 700 : 400, transition:"all 0.2s" }} aria-current={page === n.p ? "page" : undefined}>
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth:1200, margin:"0 auto", padding:"0 20px" }}>
        <div key={page} className="nwa-page-enter">
        {page === "home" && <HomePage navigate={navigate} />}
        {page === "projects" && <ProjectsPage projects={PROJECTS} selectedParish={selectedParish} setSelectedParish={setSelectedParish} navigate={navigate} />}
        {page === "project-detail" && selectedProject && <ProjectDetail project={selectedProject} navigate={navigate} />}
        {page === "report" && <ReportPage formData={formData} setFormData={setFormData} submitted={submitted} setSubmitted={setSubmitted} complaints={complaints} setComplaints={setComplaints} navigate={navigate} />}
        {page === "track" && <TrackPage trackId={trackId} setTrackId={setTrackId} trackResult={trackResult} setTrackResult={setTrackResult} complaints={complaints} />}
        {page === "closures" && <ClosuresPage closures={closures} navigate={navigate} />}
        {page === "news" && <NewsPage navigate={navigate} />}
        {page === "cms" && <CMSDemo cmsStep={cmsStep} setCmsStep={setCmsStep} closures={closures} setClosures={setClosures} newClosure={newClosure} setNewClosure={setNewClosure} navigate={navigate} />}
        {page === "dashboard" && <DashboardPage complaints={complaints} setComplaints={setComplaints} navigate={navigate} />}
        {page === "emergency" && <EmergencyPage closures={closures} navigate={navigate} />}
        {page === "about" && <AboutPage navigate={navigate} />}
        {page === "contact" && <ContactPage />}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background:"#1F4E79", color:"#fff", marginTop:60, padding:"40px 24px 20px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:32 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>National Works Agency</div>
            <div style={{ fontSize:13, opacity:0.7, lineHeight:1.6 }}>An Executive Agency of the<br/>Government of Jamaica under the<br/>Ministry of Economic Growth &<br/>Infrastructure Development</div>
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>Quick Links</div>
            {[{label:"About Us",p:"about"},{label:"Projects",p:"projects"},{label:"Road Closures",p:"closures"},{label:"News",p:"news"},{label:"Contact",p:"contact"}].map(l => (
              <div key={l.label} {...clickable(() => navigate(l.p))} style={{ fontSize:13, opacity:0.7, marginBottom:4, cursor:"pointer" }}>{l.label}</div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>Contact</div>
            <div style={{ fontSize:13, opacity:0.7, lineHeight:1.8 }}>140 Maxfield Avenue<br/>Kingston 10, Jamaica<br/>Tel: (876) 929-3380<br/>info@nwa.gov.jm</div>
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>Follow Us</div>
            <div style={{ display:"flex", gap:8 }}>
              {["X","FB","IG","YT"].map(s => (
                <div key={s} style={{ width:32, height:32, background:"rgba(255,255,255,0.15)", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, cursor:"pointer" }} role="link" tabIndex={0} aria-label={s === "X" ? "Twitter/X" : s === "FB" ? "Facebook" : s === "IG" ? "Instagram" : "YouTube"}>{s}</div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ textAlign:"center", marginTop:32, paddingTop:16, borderTop:"1px solid rgba(255,255,255,0.15)", fontSize:11, opacity:0.5 }}>
          &copy; 2026 National Works Agency. Government of Jamaica. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// ===== HOMEPAGE =====
function HomePage({ navigate }) {
  return (
    <div>
      {/* Video Hero */}
      <div style={{ position:"relative", overflow:"hidden", borderRadius:"0 0 16px 16px", minHeight:420 }}>
        {/* YouTube Embed — muted autoplay background */}
        <div style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
          <iframe
            src="https://www.youtube.com/embed/HNftNo8Ewuc?autoplay=1&mute=1&loop=1&playlist=HNftNo8Ewuc&controls=0&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&playsinline=1"
            title="NWA Road Construction"
            allow="autoplay; encrypted-media"
            style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%, -50%)", width:"180%", height:"180%", border:"none" }}
          />
        </div>
        {/* Dark overlay */}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg, rgba(31,78,121,0.85) 0%, rgba(46,117,182,0.75) 50%, rgba(31,78,121,0.9) 100%)", zIndex:1 }} />
        {/* Content */}
        <div style={{ position:"relative", zIndex:2, padding:"90px 40px 80px", textAlign:"center", color:"#fff" }}>
          <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:3, opacity:0.8, marginBottom:12 }}>National Works Agency &bull; Government of Jamaica</div>
          <h1 style={{ fontSize:40, fontWeight:800, margin:"0 0 16px", lineHeight:1.2, textShadow:"0 2px 12px rgba(0,0,0,0.3)" }}>Building Jamaica's Roads<br/>for the Future</h1>
          <p style={{ fontSize:16, opacity:0.9, maxWidth:600, margin:"0 auto 32px", textShadow:"0 1px 4px rgba(0,0,0,0.2)" }}>Managing over 5,000 km of main roads — delivering infrastructure, transparency, and public service across all 14 parishes.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => navigate("projects")} style={{ background:"#D4A843", color:"#1F4E79", border:"none", padding:"14px 32px", borderRadius:8, fontWeight:700, fontSize:15, cursor:"pointer", boxShadow:"0 4px 12px rgba(0,0,0,0.3)" }}>View Projects Map →</button>
            <button onClick={() => navigate("report")} style={{ background:"rgba(255,255,255,0.15)", color:"#fff", border:"2px solid rgba(255,255,255,0.4)", padding:"14px 32px", borderRadius:8, fontWeight:700, fontSize:15, cursor:"pointer", backdropFilter:"blur(4px)" }}>Report an Issue</button>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:12, margin:"32px 0", padding:"0 8px" }}>
        {[
          { icon:"🚧", label:"Report Issue", p:"report", desc:"Submit a complaint" },
          { icon:"⚠️", label:"Road Closures", p:"closures", desc:"Closures & detours" },
          { icon:"🗺️", label:"Projects", p:"projects", desc:"Interactive map" },
          { icon:"📢", label:"News", p:"news", desc:"Press releases" },
          { icon:"🔍", label:"Track Request", p:"track", desc:"Check status" },
          { icon:"🚨", label:"Emergency", p:"emergency", desc:"Disaster operations" },
          { icon:"📊", label:"Staff Portal", p:"dashboard", desc:"Case management" },
          { icon:"💻", label:"Content Mgmt", p:"cms", desc:"Editorial workflow" },
        ].map(q => (
          <div key={q.p} {...clickable(() => navigate(q.p))} aria-label={q.label} style={{ background:"#fff", borderRadius:12, padding:"20px 12px", textAlign:"center", cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", border:"1px solid #e8e8e8", transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.06)"; }}>
            <div style={{ fontSize:28, marginBottom:6 }} aria-hidden="true">{q.icon}</div>
            <div style={{ fontWeight:700, fontSize:13, color:"#1F4E79" }}>{q.label}</div>
            <div style={{ fontSize:10, color:"#888", marginTop:2 }}>{q.desc}</div>
          </div>
        ))}
      </div>

      <SectionHeader title="Latest News" link="View All →" onLink={() => navigate("news")} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:20 }}>
        {NEWS.slice(0,3).map(n => <NewsCard key={n.id} news={n} />)}
      </div>

      <SectionHeader title="Project Highlights" link="View All Projects →" onLink={() => navigate("projects")} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:20, marginBottom:40 }}>
        {PROJECTS.filter(p => p.status === "in_progress").slice(0,3).map(p => (
          <div key={p.id} {...clickable(() => navigate("project-detail", p))} style={{ background:"#fff", borderRadius:12, padding:20, cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", border:"1px solid #e8e8e8" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <StatusBadge status={p.status} />
              <span style={{ fontSize:12, color:"#888" }}>{p.parish}</span>
            </div>
            <div style={{ fontWeight:700, fontSize:15, color:"#1F4E79", marginBottom:8 }}>{p.title}</div>
            <ProgressBar pct={p.pct} />
            <div style={{ fontSize:12, color:"#888", marginTop:8 }}>{p.start} — {p.end}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== PROJECTS PAGE (Leaflet Map) =====
function ProjectsPage({ projects, selectedParish, setSelectedParish, navigate }) {
  const filtered = selectedParish ? projects.filter(p => p.parish === selectedParish) : projects;
  return (
    <div style={{ paddingTop:24 }}>
      <h2 style={{ color:"#1F4E79", fontSize:24, fontWeight:800, margin:"0 0 8px" }}>Road Projects</h2>
      <p style={{ color:"#666", fontSize:14, marginBottom:20 }}>Interactive view of all NWA road projects across Jamaica's 14 parishes.</p>
      <div className="nwa-grid-2col" style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:20, minHeight:500 }}>
        <div>
          <select value={selectedParish} onChange={e => setSelectedParish(e.target.value)} aria-label="Filter by parish" style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid #ddd", fontSize:14, marginBottom:16 }}>
            <option value="">All Parishes ({projects.length} projects)</option>
            {PARISHES.map(p => <option key={p} value={p}>{p} ({projects.filter(pr => pr.parish === p).length})</option>)}
          </select>
          <div style={{ maxHeight:440, overflowY:"auto", display:"flex", flexDirection:"column", gap:8 }}>
            {filtered.map(p => (
              <div key={p.id} {...clickable(() => navigate("project-detail", p))} style={{ background:"#fff", borderRadius:8, padding:12, cursor:"pointer", border:"1px solid #e8e8e8", transition:"all 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor="#2E75B6"} onMouseLeave={e => e.currentTarget.style.borderColor="#e8e8e8"}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <StatusBadge status={p.status} />
                  <span style={{ fontSize:11, color:"#888" }}>{p.parish}</span>
                </div>
                <div style={{ fontWeight:600, fontSize:13, color:"#1F4E79", marginBottom:6 }}>{p.title}</div>
                <ProgressBar pct={p.pct} small />
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e8e8e8", overflow:"hidden", position:"relative" }}>
          <MapContainer center={[18.15, -77.3]} zoom={8} style={{ height:"100%", minHeight:500 }} scrollWheelZoom={true}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
            {filtered.map(p => (
              <CircleMarker key={p.id} center={[p.lat, p.lng]} radius={9} pathOptions={{ color:"#fff", weight:2, fillColor:STATUS_COLORS[p.status], fillOpacity:1 }}>
                <Popup>
                  <div style={{ minWidth:180 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:"#1F4E79", marginBottom:4 }}>{p.title}</div>
                    <div style={{ fontSize:12, color:"#666", marginBottom:6 }}>{p.parish} — {STATUS_LABELS[p.status]} ({p.pct}%)</div>
                    <ProgressBar pct={p.pct} small />
                    <button onClick={() => navigate("project-detail", p)} style={{ marginTop:8, background:"#1F4E79", color:"#fff", border:"none", padding:"6px 12px", borderRadius:4, fontSize:11, cursor:"pointer", fontWeight:600 }}>View Details →</button>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
          <div style={{ position:"absolute", bottom:12, left:12, background:"rgba(255,255,255,0.95)", borderRadius:8, padding:"8px 12px", fontSize:11, display:"flex", gap:12, boxShadow:"0 2px 8px rgba(0,0,0,0.1)", zIndex:500 }}>
            {Object.entries(STATUS_COLORS).map(([k,c]) => (
              <div key={k} style={{ display:"flex", alignItems:"center", gap:4 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:c }} />
                <span>{STATUS_LABELS[k]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== PROJECT DETAIL (Leaflet Map) =====
function ProjectDetail({ project, navigate }) {
  return (
    <div style={{ paddingTop:24 }}>
      <button onClick={() => navigate("projects")} style={{ background:"none", border:"none", color:"#2E75B6", fontSize:14, cursor:"pointer", padding:0, marginBottom:16 }}>← Back to Projects</button>
      <div style={{ background:"#fff", borderRadius:12, padding:32, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #e8e8e8" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16 }}>
          <div>
            <h1 style={{ color:"#1F4E79", fontSize:26, fontWeight:800, margin:"0 0 8px" }}>{project.title}</h1>
            <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
              <StatusBadge status={project.status} />
              <span style={{ fontSize:13, color:"#888" }}>📍 {project.parish}</span>
              <span style={{ fontSize:13, color:"#888" }}>📅 {project.start} — {project.end}</span>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:36, fontWeight:800, color:STATUS_COLORS[project.status] }}>{project.pct}%</div>
            <div style={{ fontSize:12, color:"#888" }}>Complete</div>
          </div>
        </div>
        <ProgressBar pct={project.pct} />
        <p style={{ color:"#444", fontSize:15, lineHeight:1.7, marginTop:20 }}>{project.desc}</p>
        <div style={{ marginTop:24, padding:20, background:"#f0f4f8", borderRadius:8 }}>
          <div style={{ fontWeight:700, color:"#1F4E79", marginBottom:8, fontSize:14 }}>Project Location</div>
          <div style={{ fontSize:13, color:"#666", marginBottom:12 }}>Latitude: {project.lat.toFixed(4)} | Longitude: {project.lng.toFixed(4)} | Parish: {project.parish}</div>
          <div style={{ borderRadius:8, overflow:"hidden" }}>
            <MapContainer center={[project.lat, project.lng]} zoom={14} style={{ height:200 }} scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
              <CircleMarker center={[project.lat, project.lng]} radius={10} pathOptions={{ color:"#fff", weight:2, fillColor:STATUS_COLORS[project.status], fillOpacity:1 }}>
                <Popup>{project.title}</Popup>
              </CircleMarker>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== REPORT ISSUE (Leaflet Map) =====
function ReportPage({ formData, setFormData, submitted, setSubmitted, complaints, setComplaints, navigate }) {
  const [pin, setPin] = useState(null);

  const handleSubmit = () => {
    if (!formData.desc.trim()) return;
    const id = `NWA-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${String(Date.now()).slice(-4)}`;
    const lat = pin ? pin.lat : 18.0 + Math.random() * 0.5;
    const lng = pin ? pin.lng : -76.8 - Math.random() * 0.5;
    const newComplaint = { id, category:formData.category, desc:formData.desc, parish:formData.parish, status:"pending", date:new Date().toISOString().slice(0,10), lat, lng };
    setComplaints(prev => [...prev, newComplaint]);
    setSubmitted(id);
  };

  if (submitted) {
    const t = complaints.find(c => c.id === submitted);
    return (
      <div style={{ paddingTop:40, maxWidth:600, margin:"0 auto" }}>
        {/* Success Banner */}
        <div style={{ background:"#E8F5E9", borderRadius:12, padding:"20px 24px", marginBottom:20, display:"flex", alignItems:"center", gap:16, border:"1px solid #A5D6A7" }}>
          <div style={{ fontSize:36 }} aria-hidden="true">✅</div>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:"#2E7D32" }}>Report Submitted Successfully</div>
            <div style={{ fontSize:13, color:"#4CAF50", marginTop:2 }}>Your issue has been recorded. Save your tracking ID below.</div>
          </div>
        </div>

        {/* Ticket Detail */}
        {t && (() => {
          const timeline = [
            { label:"Submitted", detail:"Citizen report received", done:true },
            { label:"Pending Approval", detail:"Awaiting initial review by supervisor", done:false },
            { label:"Under Review", detail:"Awaiting assignment", done:false },
            { label:"Sent for Review", detail:"Field inspection or verification in progress", done:false },
            { label:"Resolved", detail:"Pending resolution", done:false },
          ];
          return (
            <div style={{ background:"#fff", borderRadius:12, boxShadow:"0 4px 20px rgba(0,0,0,0.08)", overflow:"hidden" }}>
              {/* Header */}
              <div style={{ background:"linear-gradient(135deg, #1F4E79 0%, #2E75B6 100%)", color:"#fff", padding:"20px 24px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1.5, opacity:0.7, marginBottom:2 }}>Your Tracking ID</div>
                  <div style={{ fontSize:20, fontWeight:800 }}>{t.id}</div>
                  <div style={{ fontSize:13, opacity:0.9, marginTop:2 }}>{t.category} — {t.parish}</div>
                </div>
                <span style={{ background:CASE_STATUS_COLORS[t.status], color:"#fff", padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:700 }}>{CASE_STATUS_LABELS[t.status]}</span>
              </div>

              <div style={{ padding:24 }}>
                {/* Description */}
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Description</div>
                  <div style={{ fontSize:14, lineHeight:1.7, color:"#333", background:"#f8f9fa", padding:16, borderRadius:8, borderLeft:"4px solid #2E75B6" }}>{t.desc}</div>
                </div>

                {/* Details Grid */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                  {[
                    { label:"Date Reported", value:t.date },
                    { label:"Category", value:t.category },
                    { label:"Parish", value:t.parish },
                    { label:"Location", value:t.lat ? `${t.lat.toFixed(4)}, ${t.lng.toFixed(4)}` : "Not specified" },
                  ].map(d => (
                    <div key={d.label} style={{ background:"#f8f9fa", padding:"10px 14px", borderRadius:8 }}>
                      <div style={{ fontSize:10, fontWeight:600, color:"#888", textTransform:"uppercase", letterSpacing:0.5, marginBottom:2 }}>{d.label}</div>
                      <div style={{ fontSize:13, fontWeight:600, color:"#1F4E79" }}>{d.value}</div>
                    </div>
                  ))}
                </div>

                {/* Status Timeline */}
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Status Timeline</div>
                  <div style={{ position:"relative", paddingLeft:24 }}>
                    {timeline.map((step, i) => (
                      <div key={step.label} style={{ display:"flex", gap:12, marginBottom: i < timeline.length - 1 ? 16 : 0, position:"relative" }}>
                        {i < timeline.length - 1 && <div style={{ position:"absolute", left:-16, top:20, width:2, height:"calc(100% + 4px)", background: step.done ? "#4CAF50" : "#e0e0e0" }} />}
                        <div style={{ position:"absolute", left:-20, top:4, width:10, height:10, borderRadius:"50%", background: step.done ? "#4CAF50" : "#e0e0e0", border: step.done ? "2px solid #4CAF50" : "2px solid #ccc", zIndex:1 }} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:700, color: step.done ? "#1F4E79" : "#bbb" }}>{step.label}</div>
                          <div style={{ fontSize:12, color: step.done ? "#666" : "#ccc", marginTop:2 }}>{step.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:"flex", gap:12, borderTop:"1px solid #eee", paddingTop:16 }}>
                  <button onClick={() => navigate("track")} style={{ flex:1, background:"#1F4E79", color:"#fff", border:"none", padding:"12px", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:13 }}>Track My Request</button>
                  <button onClick={() => { setSubmitted(null); setPin(null); setFormData({ category:"Pothole", desc:"", parish:"Kingston", name:"", email:"" }); }} style={{ flex:1, background:"#2E75B6", color:"#fff", border:"none", padding:"12px", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:13 }}>Submit Another</button>
                  <button onClick={() => navigate("home")} style={{ flex:1, background:"#f0f0f0", border:"none", padding:"12px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Home</button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  return (
    <div style={{ paddingTop:24 }}>
      <h2 style={{ color:"#1F4E79", fontSize:24, fontWeight:800, margin:"0 0 8px" }}>Report an Issue</h2>
      <p style={{ color:"#666", fontSize:14, marginBottom:24 }}>Submit a road issue or complaint. You'll receive a tracking ID to monitor progress.</p>
      <div className="nwa-grid-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
          <FormField label="Category">
            <select value={formData.category} onChange={e => setFormData(p => ({...p, category:e.target.value}))} style={inputStyle}>
              {["Pothole","Road Damage","Flooding","Drainage","Signage","Other"].map(c => <option key={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Description *">
            <textarea value={formData.desc} onChange={e => setFormData(p => ({...p, desc:e.target.value}))} placeholder="Describe the issue in detail..." rows={4} style={{...inputStyle, resize:"vertical"}} />
          </FormField>
          <FormField label="Parish">
            <select value={formData.parish} onChange={e => setFormData(p => ({...p, parish:e.target.value}))} style={inputStyle}>
              {PARISHES.map(p => <option key={p}>{p}</option>)}
            </select>
          </FormField>
          <FormField label="Photo Upload">
            <div style={{ border:"2px dashed #ddd", borderRadius:8, padding:24, textAlign:"center", color:"#888", fontSize:13, cursor:"pointer" }}>📷 Click to upload photo (JPG/PNG, max 5MB)</div>
          </FormField>
          <FormField label="Contact Name (optional)">
            <input value={formData.name} onChange={e => setFormData(p => ({...p, name:e.target.value}))} placeholder="Your name" style={inputStyle} />
          </FormField>
          <FormField label="Contact Email (optional)">
            <input value={formData.email} onChange={e => setFormData(p => ({...p, email:e.target.value}))} placeholder="your@email.com" type="email" style={inputStyle} />
          </FormField>
          <button onClick={handleSubmit} disabled={!formData.desc.trim()} style={{ background: formData.desc.trim() ? "#1F4E79" : "#ccc", color:"#fff", border:"none", padding:"14px 32px", borderRadius:8, fontWeight:700, fontSize:15, cursor: formData.desc.trim() ? "pointer" : "default", width:"100%", marginTop:8 }}>Submit Report</button>
        </div>
        <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight:700, color:"#1F4E79", marginBottom:12, fontSize:14 }}>📍 Pin Location on Map</div>
          <div style={{ borderRadius:8, overflow:"hidden" }}>
            <MapContainer center={[18.015, -76.81]} zoom={12} style={{ height:340 }} scrollWheelZoom={true}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
              <LocationPicker onSelect={setPin} />
              {pin && <CircleMarker center={[pin.lat, pin.lng]} radius={10} pathOptions={{ color:"#C62828", weight:2, fillColor:"#F44336", fillOpacity:0.8 }}><Popup>Issue location</Popup></CircleMarker>}
            </MapContainer>
          </div>
          <div style={{ marginTop:12, padding:12, background:"#f8f9fa", borderRadius:8, fontSize:12, color:"#666" }}>
            <strong>GPS Coordinates:</strong> {pin ? `Lat: ${pin.lat.toFixed(4)}, Lng: ${pin.lng.toFixed(4)}` : "Click map to set location"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== TRACK REQUEST =====
function TrackPage({ trackId, setTrackId, trackResult, setTrackResult, complaints }) {
  const handleTrack = () => {
    const found = complaints.find(c => c.id.toLowerCase() === trackId.trim().toLowerCase());
    setTrackResult(found || "not_found");
  };
  return (
    <div style={{ paddingTop:40, maxWidth:600, margin:"0 auto" }}>
      <h2 style={{ color:"#1F4E79", fontSize:24, fontWeight:800, textAlign:"center", margin:"0 0 8px" }}>Track My Request</h2>
      <p style={{ color:"#666", fontSize:14, textAlign:"center", marginBottom:24 }}>Enter your tracking ID to check the status of your report.</p>
      <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", display:"flex", gap:12 }}>
        <input value={trackId} onChange={e => setTrackId(e.target.value)} onKeyDown={e => e.key === "Enter" && handleTrack()} placeholder="e.g. NWA-20260215-0001" aria-label="Tracking ID" style={{...inputStyle, flex:1}} />
        <button onClick={handleTrack} style={{ background:"#1F4E79", color:"#fff", border:"none", padding:"12px 24px", borderRadius:8, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>Track</button>
      </div>
      {trackResult === "not_found" && (
        <div role="alert" style={{ background:"#FFF3E0", borderRadius:8, padding:16, marginTop:16, textAlign:"center", color:"#E65100", fontSize:14 }}>No record found for this tracking ID. Please check and try again.</div>
      )}
      {trackResult && trackResult !== "not_found" && (() => {
        const t = trackResult;
        const timeline = [
          { label:"Submitted", detail:"Citizen report received", done:true },
          { label:"Pending Approval", detail:"Awaiting initial review by supervisor", done:t.status !== "pending" },
          { label:"Under Review", detail:t.assignedTo ? `Assigned to ${t.assignedTo}` : "Awaiting assignment", done:t.status === "under_review" || t.status === "sent_review" || t.status === "resolved" },
          { label:"Sent for Review", detail:"Field inspection or verification in progress", done:t.status === "sent_review" || t.status === "resolved" },
          { label:"Resolved", detail:t.resolvedBy ? `Resolved by ${t.resolvedBy}, confirmed by ${t.closedBy}` : "Pending resolution", done:t.status === "resolved" },
        ];
        return (
          <div style={{ background:"#fff", borderRadius:12, marginTop:20, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", overflow:"hidden" }}>
            {/* Header */}
            <div style={{ background:"linear-gradient(135deg, #1F4E79 0%, #2E75B6 100%)", color:"#fff", padding:"20px 24px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1.5, opacity:0.7, marginBottom:2 }}>Tracking Result</div>
                <div style={{ fontSize:18, fontWeight:800 }}>{t.id}</div>
                <div style={{ fontSize:13, opacity:0.9, marginTop:2 }}>{t.category} — {t.parish}</div>
              </div>
              <span style={{ background:CASE_STATUS_COLORS[t.status], color:"#fff", padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:700 }}>{CASE_STATUS_LABELS[t.status]}</span>
            </div>

            <div style={{ padding:24 }}>
              {/* Description */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Description</div>
                <div style={{ fontSize:14, lineHeight:1.7, color:"#333", background:"#f8f9fa", padding:16, borderRadius:8, borderLeft:"4px solid #2E75B6" }}>{t.desc}</div>
              </div>

              {/* Details Grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                {[
                  { label:"Date Reported", value:t.date },
                  { label:"Category", value:t.category },
                  { label:"Parish", value:t.parish },
                  { label:"Assigned To", value:t.assignedTo || "Unassigned" },
                  { label:"Location", value:t.lat ? `${t.lat.toFixed(4)}, ${t.lng.toFixed(4)}` : "Not specified" },
                  { label:"Status", value:CASE_STATUS_LABELS[t.status] },
                ].map(d => (
                  <div key={d.label} style={{ background:"#f8f9fa", padding:"10px 14px", borderRadius:8 }}>
                    <div style={{ fontSize:10, fontWeight:600, color:"#888", textTransform:"uppercase", letterSpacing:0.5, marginBottom:2 }}>{d.label}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#1F4E79" }}>{d.value}</div>
                  </div>
                ))}
              </div>

              {/* Status Timeline */}
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Status Timeline</div>
                <div style={{ position:"relative", paddingLeft:24 }}>
                  {timeline.map((step, i) => (
                    <div key={step.label} style={{ display:"flex", gap:12, marginBottom: i < timeline.length - 1 ? 16 : 0, position:"relative" }}>
                      {i < timeline.length - 1 && <div style={{ position:"absolute", left:-16, top:20, width:2, height:"calc(100% + 4px)", background: step.done ? "#4CAF50" : "#e0e0e0" }} />}
                      <div style={{ position:"absolute", left:-20, top:4, width:10, height:10, borderRadius:"50%", background: step.done ? "#4CAF50" : "#e0e0e0", border: step.done ? "2px solid #4CAF50" : "2px solid #ccc", zIndex:1 }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color: step.done ? "#1F4E79" : "#bbb" }}>{step.label}</div>
                        <div style={{ fontSize:12, color: step.done ? "#666" : "#ccc", marginTop:2 }}>{step.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      <div style={{ marginTop:16, textAlign:"center", fontSize:12, color:"#888" }}>
        Try: <span {...clickable(() => setTrackId("NWA-20260215-0001"))} style={{ color:"#2E75B6", cursor:"pointer", fontWeight:600 }}>NWA-20260215-0001</span>
      </div>
    </div>
  );
}

// ===== ROAD CLOSURES =====
function ClosuresPage({ closures, navigate }) {
  const [filter, setFilter] = useState("");
  const filtered = filter ? closures.filter(c => c.parish === filter) : closures;
  return (
    <div style={{ paddingTop:24 }}>
      <h2 style={{ color:"#1F4E79", fontSize:24, fontWeight:800, margin:"0 0 8px" }}>Road Closures & Advisories</h2>
      <p style={{ color:"#666", fontSize:14, marginBottom:16 }}>Current road closure notices organised by parish.</p>

      {/* Map */}
      <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e8e8e8", overflow:"hidden", marginBottom:20 }}>
        <MapContainer center={[18.15, -77.3]} zoom={8} style={{ height:280 }} scrollWheelZoom={true}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
          {closures.filter(c => c.lat).map(c => (
            <CircleMarker key={c.id} center={[c.lat, c.lng]} radius={10} pathOptions={{ color:"#fff", weight:2, fillColor:SEVERITY_COLORS[c.severity], fillOpacity:1 }}>
              <Popup>
                <div style={{ minWidth:160 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:"#1F4E79", marginBottom:4 }}>{c.road}</div>
                  <div style={{ fontSize:12, color:"#666", marginBottom:4 }}>{c.reason}</div>
                  <div style={{ fontSize:11, color:"#888" }}>{c.start} to {c.end}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter closures by parish" style={{...inputStyle, maxWidth:300, marginBottom:20 }}>
        <option value="">All Parishes</option>
        {PARISHES.map(p => <option key={p}>{p}</option>)}
      </select>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {filtered.map(c => (
          <div key={c.id} style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", borderLeft:`4px solid ${SEVERITY_COLORS[c.severity]}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, flexWrap:"wrap", gap:8 }}>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ background:SEVERITY_COLORS[c.severity], color:"#fff", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, textTransform:"uppercase" }}>{c.severity}</span>
                <span style={{ fontWeight:700, color:"#1F4E79", fontSize:15 }}>{c.road}</span>
              </div>
              <span style={{ fontSize:12, color:"#888" }}>{c.parish}</span>
            </div>
            <div style={{ fontSize:13, color:"#444", marginBottom:8 }}><strong>Reason:</strong> {c.reason}</div>
            <div style={{ fontSize:13, color:"#444", marginBottom:8 }}><strong>Detour:</strong> {c.detour}</div>
            <div style={{ fontSize:12, color:"#888" }}>📅 {c.start} to {c.end}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== NEWS =====
function NewsPage({ navigate }) {
  const [selectedArticle, setSelectedArticle] = useState(null);

  if (selectedArticle) {
    const n = selectedArticle;
    return (
      <div style={{ paddingTop:24 }}>
        <button onClick={() => setSelectedArticle(null)} style={{ background:"none", border:"none", color:"#2E75B6", fontSize:14, cursor:"pointer", padding:0, marginBottom:16 }}>← Back to Newsroom</button>
        <article style={{ background:"#fff", borderRadius:12, padding:32, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #e8e8e8" }}>
          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:12, flexWrap:"wrap" }}>
            <span style={{ background:"#E8F0FE", color:"#1F4E79", padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:600 }}>{n.category}</span>
            <span style={{ fontSize:13, color:"#888" }}>{n.parish}</span>
            <span style={{ fontSize:13, color:"#888", marginLeft:"auto" }}><time dateTime={n.date}>{n.date}</time></span>
          </div>
          <h1 style={{ color:"#1F4E79", fontSize:24, fontWeight:800, margin:"0 0 16px", lineHeight:1.3 }}>{n.title}</h1>
          <div style={{ borderLeft:"4px solid #2E75B6", paddingLeft:20, marginBottom:20 }}>
            <p style={{ fontSize:15, color:"#444", lineHeight:1.8, margin:0 }}>{n.excerpt}</p>
          </div>
          <div style={{ background:"#f8f9fa", borderRadius:8, padding:20, fontSize:14, color:"#444", lineHeight:1.8 }}>
            <p style={{ margin:"0 0 12px" }}>The National Works Agency continues to deliver on its mandate to maintain and improve Jamaica's road infrastructure. This initiative is part of the agency's ongoing commitment to ensuring safe and reliable road networks across all 14 parishes.</p>
            <p style={{ margin:"0 0 12px" }}>NWA CEO Eng. E. George Lee has indicated that the agency will continue to prioritise projects that have the greatest impact on road safety and economic productivity. "We remain committed to delivering quality infrastructure that serves the Jamaican people," said Eng. Lee.</p>
            <p style={{ margin:0 }}>Members of the public are encouraged to report road issues through the NWA's online complaint portal or by contacting the agency directly at (876) 929-3380.</p>
          </div>
          <div style={{ display:"flex", gap:12, marginTop:24, paddingTop:16, borderTop:"1px solid #eee" }}>
            <button onClick={() => setSelectedArticle(null)} style={{ background:"#1F4E79", color:"#fff", border:"none", padding:"10px 24px", borderRadius:8, fontWeight:600, cursor:"pointer", fontSize:13 }}>← Back to Newsroom</button>
            <button onClick={() => navigate("report")} style={{ background:"#f0f0f0", border:"none", padding:"10px 24px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Report an Issue</button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div style={{ paddingTop:24 }}>
      <h2 style={{ color:"#1F4E79", fontSize:24, fontWeight:800, margin:"0 0 8px" }}>Newsroom</h2>
      <p style={{ color:"#666", fontSize:14, marginBottom:20 }}>Latest news, press releases, and updates from the National Works Agency.</p>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {NEWS.map(n => (
          <div key={n.id} {...clickable(() => setSelectedArticle(n))} style={{ cursor:"pointer" }}>
            <NewsCard news={n} full />
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== CMS DEMO =====
function CMSDemo({ cmsStep, setCmsStep, closures, setClosures, newClosure, setNewClosure, navigate }) {
  const steps = [
    { title:"Step 1: Log in as Editor", desc:"The Editor role can create and edit content, but cannot publish directly." },
    { title:"Step 2: Create News Article", desc:"The Editor creates a new article and submits it for review." },
    { title:"Step 3: Submit for Review", desc:"Article status changes to 'In Review'. The Approver is notified." },
    { title:"Step 4: Log in as Approver", desc:"The Approver reviews the article in the moderation queue." },
    { title:"Step 5: Approve & Publish", desc:"The Approver transitions the article to Published. It appears on the Newsroom page." },
    { title:"Step 6: Create Road Closure Alert", desc:"Content Admin creates a road closure and checks 'Push to Homepage'." },
    { title:"✅ Complete", desc:"The road closure alert now appears on the homepage banner!" },
  ];
  const handleClosureCreate = () => {
    const nc = { id: closures.length + 1, road:"Washington Boulevard", parish:"Kingston", start:"2026-02-21", end:"2026-02-23", reason:"Emergency sinkhole repair", detour:"Use Hagley Park Road alternate route", severity:"critical", push:true };
    setClosures(prev => [nc, ...prev]);
    setNewClosure(nc);
    setCmsStep(6);
  };
  return (
    <div style={{ paddingTop:24 }}>
      <h2 style={{ color:"#1F4E79", fontSize:24, fontWeight:800, margin:"0 0 8px" }}>CMS Content Workflow Demo</h2>
      <p style={{ color:"#666", fontSize:14, marginBottom:24 }}>Simulates the Drupal editorial workflow: Editor creates → Approver publishes. Content Admin pushes alerts.</p>
      <div style={{ display:"flex", gap:4, marginBottom:32 }} role="progressbar" aria-valuenow={cmsStep} aria-valuemin={0} aria-valuemax={steps.length - 1} aria-label="CMS workflow progress">
        {steps.map((_, i) => (<div key={i} style={{ flex:1, height:6, borderRadius:3, background: i <= cmsStep ? "#1F4E79" : "#e0e0e0", transition:"background 0.3s" }} />))}
      </div>
      <div style={{ background:"#fff", borderRadius:12, padding:32, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", minHeight:300 }}>
        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
          <span style={{ background:"#1F4E79", color:"#fff", padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>{cmsStep <= 2 ? "Editor" : cmsStep <= 4 ? "Approver" : "Content Admin"}</span>
          <span style={{ fontSize:12, color:"#888" }}>{cmsStep <= 2 ? "demo_editor" : cmsStep <= 4 ? "demo_approver" : "demo_contentadmin"}</span>
        </div>
        <h3 style={{ color:"#1F4E79", fontSize:20, fontWeight:700, margin:"8px 0" }}>{steps[cmsStep].title}</h3>
        <p style={{ color:"#666", fontSize:14, marginBottom:24 }}>{steps[cmsStep].desc}</p>
        {cmsStep === 1 && (<div style={{ background:"#f8f9fa", borderRadius:8, padding:20, border:"1px solid #e0e0e0" }}><div style={{ fontWeight:700, color:"#1F4E79", marginBottom:12, fontSize:14 }}>New Article (simulated)</div><div style={{ marginBottom:8 }}><strong>Title:</strong> NWA Launches Island-Wide Pothole Repair Programme</div><div style={{ marginBottom:8 }}><strong>Body:</strong> The National Works Agency has commenced a comprehensive island-wide pothole repair programme targeting the most affected corridors...</div><div><strong>Parish:</strong> All Parishes | <strong>Category:</strong> Press Release</div></div>)}
        {cmsStep === 2 && (<div style={{ background:"#FFF8E1", borderRadius:8, padding:16, border:"1px solid #FFE082" }}><strong>Status:</strong> <span style={{ background:"#FF9800", color:"#fff", padding:"2px 8px", borderRadius:12, fontSize:12 }}>In Review</span><span style={{ marginLeft:12, fontSize:13, color:"#888" }}>Submitted by demo_editor at {new Date().toLocaleTimeString()}</span></div>)}
        {cmsStep === 4 && (<div style={{ background:"#E8F5E9", borderRadius:8, padding:16, border:"1px solid #A5D6A7" }}><strong>Status:</strong> <span style={{ background:"#4CAF50", color:"#fff", padding:"2px 8px", borderRadius:12, fontSize:12 }}>Published ✓</span><span style={{ marginLeft:12, fontSize:13, color:"#888" }}>Approved by demo_approver at {new Date().toLocaleTimeString()}</span><div style={{ marginTop:8, fontSize:13 }}>The article is now live on the Newsroom page.</div></div>)}
        {cmsStep === 5 && (<div style={{ background:"#f8f9fa", borderRadius:8, padding:20, border:"1px solid #e0e0e0" }}><div style={{ fontWeight:700, color:"#1F4E79", marginBottom:12, fontSize:14 }}>New Road Closure (simulated)</div><div style={{ marginBottom:6 }}><strong>Road:</strong> Washington Boulevard</div><div style={{ marginBottom:6 }}><strong>Parish:</strong> Kingston</div><div style={{ marginBottom:6 }}><strong>Reason:</strong> Emergency sinkhole repair</div><div style={{ marginBottom:6 }}><strong>Severity:</strong> <span style={{ background:"#C62828", color:"#fff", padding:"2px 8px", borderRadius:12, fontSize:12 }}>Critical</span></div><div><strong>☑ Push to Homepage:</strong> <span style={{ color:"#4CAF50", fontWeight:700 }}>Yes</span></div></div>)}
        {cmsStep === 6 && newClosure && (<div style={{ background:"#E8F5E9", borderRadius:8, padding:16, border:"1px solid #A5D6A7" }}><div style={{ fontSize:15, fontWeight:700, color:"#2E7D32", marginBottom:8 }}>✅ Road Closure Published & Pushed to Homepage</div><div style={{ fontSize:13, color:"#444" }}>The alert banner for <strong>{newClosure.road}</strong> is now visible on the homepage.</div><button onClick={() => navigate("home")} style={{ background:"#1F4E79", color:"#fff", border:"none", padding:"10px 20px", borderRadius:8, fontWeight:600, cursor:"pointer", marginTop:12, fontSize:13 }}>→ View Homepage with Alert Banner</button></div>)}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:32 }}>
          <button onClick={() => setCmsStep(s => Math.max(0, s-1))} disabled={cmsStep === 0} style={{ background: cmsStep === 0 ? "#eee" : "#f0f0f0", color: cmsStep === 0 ? "#bbb" : "#444", border:"none", padding:"10px 24px", borderRadius:8, fontWeight:600, cursor: cmsStep === 0 ? "default" : "pointer" }}>← Previous</button>
          {cmsStep < 5 && (<button onClick={() => setCmsStep(s => s + 1)} style={{ background:"#1F4E79", color:"#fff", border:"none", padding:"10px 24px", borderRadius:8, fontWeight:600, cursor:"pointer" }}>Next Step →</button>)}
          {cmsStep === 5 && (<button onClick={handleClosureCreate} style={{ background:"#C62828", color:"#fff", border:"none", padding:"10px 24px", borderRadius:8, fontWeight:600, cursor:"pointer" }}>🚨 Publish & Push to Homepage</button>)}
        </div>
      </div>
    </div>
  );
}

// ===== COMPLAINT MANAGEMENT DASHBOARD (NEW) =====
function DashboardPage({ complaints, setComplaints, navigate }) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [confirmClose, setConfirmClose] = useState(null);
  const [viewTicket, setViewTicket] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [caseNote, setCaseNote] = useState("");
  const [caseNotes, setCaseNotes] = useState({});

  const openTicket = (id) => { setViewTicket(id); setEditMode(false); setCaseNote(""); };
  const startEdit = (t) => { setEditData({ status:t.status, category:t.category, assignedTo:t.assignedTo || "", priority:t.priority || "standard" }); setEditMode(true); };
  const handleUpdate = (id) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, ...editData } : c));
    if (caseNote.trim()) {
      setCaseNotes(prev => ({ ...prev, [id]: [...(prev[id] || []), { text:caseNote.trim(), author:"nwa_supervisor", time:new Date().toLocaleString() }] }));
      setCaseNote("");
    }
    setEditMode(false);
  };
  const addNote = (id) => {
    if (!caseNote.trim()) return;
    setCaseNotes(prev => ({ ...prev, [id]: [...(prev[id] || []), { text:caseNote.trim(), author:"nwa_supervisor", time:new Date().toLocaleString() }] }));
    setCaseNote("");
  };

  // Search & filter
  const [dashSearch, setDashSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  // Sorting
  const [sortCol, setSortCol] = useState("date");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (col) => {
    if (sortCol === col) { setSortAsc(!sortAsc); }
    else { setSortCol(col); setSortAsc(true); }
  };

  const SLA_ORDER = { breached:0, at_risk:1, on_track:2, missed:3, met:4 };
  const STATUS_ORDER = { pending:0, under_review:1, sent_review:2, resolved:3 };
  const PRIORITY_ORDER = { high:0, standard:1, low:2 };

  const sortedComplaints = useMemo(() => {
    let arr = [...complaints];
    // Filter by search
    if (dashSearch.trim()) {
      const q = dashSearch.toLowerCase();
      arr = arr.filter(c => c.id.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.parish.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || (c.assignedTo || "").toLowerCase().includes(q));
    }
    // Filter by status
    if (filterStatus) arr = arr.filter(c => c.status === filterStatus);
    // Filter by priority
    if (filterPriority) arr = arr.filter(c => (c.priority || "standard") === filterPriority);
    // Sort
    arr.sort((a, b) => {
      let va, vb;
      switch (sortCol) {
        case "id": va = a.id; vb = b.id; break;
        case "date": va = a.date; vb = b.date; break;
        case "category": va = a.category; vb = b.category; break;
        case "parish": va = a.parish; vb = b.parish; break;
        case "status": va = STATUS_ORDER[a.status] ?? 9; vb = STATUS_ORDER[b.status] ?? 9; break;
        case "priority": va = PRIORITY_ORDER[a.priority || "standard"]; vb = PRIORITY_ORDER[b.priority || "standard"]; break;
        case "sla": va = SLA_ORDER[getSlaStatus(a)] ?? 9; vb = SLA_ORDER[getSlaStatus(b)] ?? 9; break;
        default: va = a.id; vb = b.id;
      }
      if (typeof va === "string") return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? va - vb : vb - va;
    });
    return arr;
  }, [complaints, sortCol, sortAsc, dashSearch, filterStatus, filterPriority]);

  const total = complaints.length;
  const open = complaints.filter(c => c.status !== "resolved").length;
  const resolved = complaints.filter(c => c.status === "resolved").length;
  const pending = complaints.filter(c => c.status === "pending").length;

  // Parish hotspot counts
  const parishCounts = {};
  complaints.filter(c => c.status !== "resolved").forEach(c => { parishCounts[c.parish] = (parishCounts[c.parish] || 0) + 1; });
  const sortedParishes = Object.entries(parishCounts).sort((a, b) => b[1] - a[1]);

  // Status counts for visual bar
  const statusCounts = {};
  Object.keys(CASE_STATUS_LABELS).forEach(s => { statusCounts[s] = complaints.filter(c => c.status === s).length; });

  const handleAssign = (id, dept) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, assignedTo: dept, status: c.status === "pending" ? "under_review" : c.status } : c));
    setSelectedTicket(null);
  };

  const handleCloseout = (id) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: "resolved", resolvedBy: "Officer A", closedBy: "Supervisor B" } : c));
    setConfirmClose(null);
  };

  return (
    <div style={{ paddingTop:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ color:"#1F4E79", fontSize:24, fontWeight:800, margin:"0 0 4px" }}>Complaint Management Dashboard</h2>
          <p style={{ color:"#666", fontSize:14, margin:0 }}>Staff view — manage, assign, and resolve citizen reports.</p>
        </div>
        <span style={{ background:"#1F4E79", color:"#fff", padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:600 }}>Logged in as: nwa_supervisor</span>
      </div>

      {/* KPI Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:16, marginBottom:24 }}>
        {[
          { label:"Total Submissions", value:total, color:"#1F4E79", icon:"📋" },
          { label:"Open Cases", value:open, color:"#E65100", icon:"📂" },
          { label:"SLA Breached", value:complaints.filter(c => getSlaStatus(c) === "breached").length, color:"#C62828", icon:"🚨" },
          { label:"At Risk", value:complaints.filter(c => getSlaStatus(c) === "at_risk").length, color:"#FF9800", icon:"⚠️" },
          { label:"Resolved", value:resolved, color:"#4CAF50", icon:"✅" },
        ].map(k => (
          <div key={k.label} style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", borderTop:`4px solid ${k.color}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:28, fontWeight:800, color:k.color }}>{k.value}</div>
              <div style={{ fontSize:24 }} aria-hidden="true">{k.icon}</div>
            </div>
            <div style={{ fontSize:12, color:"#888", marginTop:4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Status Breakdown Bar */}
      <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", marginBottom:24 }}>
        <div style={{ fontWeight:700, color:"#1F4E79", fontSize:14, marginBottom:12 }}>Status Breakdown</div>
        <div style={{ display:"flex", height:32, borderRadius:8, overflow:"hidden", marginBottom:8 }}>
          {Object.entries(statusCounts).map(([s, count]) => count > 0 && (
            <div key={s} style={{ width:`${(count / total) * 100}%`, background:CASE_STATUS_COLORS[s], display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:700, minWidth:count > 0 ? 30 : 0 }} title={`${CASE_STATUS_LABELS[s]}: ${count}`}>{count}</div>
          ))}
        </div>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          {Object.entries(CASE_STATUS_LABELS).map(([s, label]) => (
            <div key={s} style={{ display:"flex", alignItems:"center", gap:4, fontSize:12 }}>
              <div style={{ width:10, height:10, borderRadius:2, background:CASE_STATUS_COLORS[s] }} />
              <span style={{ color:"#666" }}>{label} ({statusCounts[s]})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ background:"#fff", borderRadius:12, padding:"16px 20px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", marginBottom:20, display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:200, position:"relative" }}>
          <input value={dashSearch} onChange={e => setDashSearch(e.target.value)} placeholder="Search by ID, category, parish, description, or assignee..." style={{...inputStyle, paddingLeft:36, width:"100%", boxSizing:"border-box"}} />
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14, color:"#888", pointerEvents:"none" }}>🔍</span>
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{...inputStyle, width:"auto", minWidth:140 }}>
          <option value="">All Statuses</option>
          {Object.entries(CASE_STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{...inputStyle, width:"auto", minWidth:120 }}>
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="standard">Standard</option>
          <option value="low">Low</option>
        </select>
        {(dashSearch || filterStatus || filterPriority) && (
          <button onClick={() => { setDashSearch(""); setFilterStatus(""); setFilterPriority(""); }} style={{ background:"#f0f0f0", border:"none", padding:"10px 16px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600, color:"#666", whiteSpace:"nowrap" }}>Clear Filters</button>
        )}
      </div>

      <div className="nwa-grid-2col" style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20 }}>
        {/* Ticket Table */}
        <div style={{ background:"#fff", borderRadius:12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid #eee", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontWeight:700, color:"#1F4E79", fontSize:14 }}>{sortedComplaints.length === total ? `All Cases (${total})` : `${sortedComplaints.length} of ${total} Cases`}</span>
            <span style={{ fontSize:11, color:"#888" }}>SLA: High 1d · Standard 3d · Low 5d</span>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead><tr style={{ background:"#f8f9fa" }}>
                {[
                  { key:"id", label:"ID" }, { key:"date", label:"Date" }, { key:"category", label:"Category" },
                  { key:"parish", label:"Parish" }, { key:"priority", label:"Priority" }, { key:"status", label:"Status" },
                  { key:"sla", label:"SLA" }, { key:null, label:"Action" },
                ].map(h => (
                  <th key={h.label} onClick={h.key ? () => handleSort(h.key) : undefined} style={{ padding:"10px 12px", textAlign:"left", fontWeight:600, color: sortCol === h.key ? "#1F4E79" : "#888", borderBottom:"1px solid #eee", cursor: h.key ? "pointer" : "default", userSelect:"none", whiteSpace:"nowrap" }}>
                    {h.label}{sortCol === h.key ? (sortAsc ? " ▲" : " ▼") : ""}
                  </th>
                ))}
              </tr></thead>
              <tbody>
                {sortedComplaints.map(c => {
                  const sla = getSlaStatus(c);
                  const daysLeft = getSlaDaysRemaining(c);
                  return (
                  <tr key={c.id} style={{ borderBottom:"1px solid #f0f0f0", cursor:"pointer" }} onClick={() => openTicket(c.id)} onMouseEnter={e => e.currentTarget.style.background="#f8f9fa"} onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"10px 12px", fontWeight:600, color:"#1F4E79" }}>{c.id.slice(-4)}</td>
                    <td style={{ padding:"10px 12px", color:"#666" }}>{c.date}</td>
                    <td style={{ padding:"10px 12px" }}>{c.category}</td>
                    <td style={{ padding:"10px 12px" }}>{c.parish}</td>
                    <td style={{ padding:"10px 12px" }}><span style={{ background: (c.priority || "standard") === "high" ? "#C62828" : (c.priority || "standard") === "low" ? "#78909C" : "#1565C0", color:"#fff", padding:"2px 8px", borderRadius:12, fontSize:10, fontWeight:600 }}>{(c.priority || "standard").charAt(0).toUpperCase() + (c.priority || "standard").slice(1)}</span></td>
                    <td style={{ padding:"10px 12px" }}><span style={{ background:CASE_STATUS_COLORS[c.status], color:"#fff", padding:"2px 8px", borderRadius:12, fontSize:10, fontWeight:600 }}>{CASE_STATUS_LABELS[c.status]}</span></td>
                    <td style={{ padding:"10px 12px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ background:SLA_COLORS[sla], color:"#fff", padding:"2px 8px", borderRadius:12, fontSize:10, fontWeight:600 }}>{SLA_LABELS[sla]}</span>
                        {c.status !== "resolved" && <span style={{ fontSize:10, color: daysLeft < 0 ? "#C62828" : "#888" }}>{daysLeft < 0 ? `${Math.abs(daysLeft)}d over` : `${daysLeft}d left`}</span>}
                      </div>
                    </td>
                    <td style={{ padding:"10px 12px" }}>
                      {c.status !== "resolved" ? (
                        <div style={{ display:"flex", gap:4 }}>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedTicket(c.id); }} style={{ background:"#2E75B6", color:"#fff", border:"none", padding:"4px 8px", borderRadius:4, fontSize:10, cursor:"pointer" }}>Assign</button>
                          <button onClick={(e) => { e.stopPropagation(); setConfirmClose(c.id); }} style={{ background:"#4CAF50", color:"#fff", border:"none", padding:"4px 8px", borderRadius:4, fontSize:10, cursor:"pointer" }}>Close</button>
                        </div>
                      ) : <span style={{ fontSize:10, color:"#4CAF50", fontWeight:600 }}>Closed</span>}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar: Parish Hotspots + Actions */}
        <div>
          <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", marginBottom:16 }}>
            <div style={{ fontWeight:700, color:"#1F4E79", fontSize:14, marginBottom:12 }}>Parish Hotspots</div>
            {sortedParishes.map(([parish, count]) => (
              <div key={parish} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:"1px solid #f0f0f0" }}>
                <span style={{ fontSize:13 }}>{parish}</span>
                <span style={{ background: count >= 3 ? "#C62828" : count >= 2 ? "#E65100" : "#FF9800", color:"#fff", padding:"2px 8px", borderRadius:12, fontSize:11, fontWeight:700 }}>{count} open</span>
              </div>
            ))}
          </div>
          <div style={{ background:"#FFF8E1", borderRadius:12, padding:16, border:"1px solid #FFE082", fontSize:12, color:"#6D4C00", lineHeight:1.6 }}>
            <strong>2-Person Closeout:</strong> All case resolutions require dual authorization. An officer resolves, then a supervisor confirms the closeout.
          </div>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {viewTicket && (() => {
        const t = complaints.find(c => c.id === viewTicket);
        if (!t) return null;
        const notes = caseNotes[t.id] || [];
        const timeline = [
          { label:"Submitted", detail:"Citizen report received", done:true },
          { label:"Pending Approval", detail:"Awaiting initial review by supervisor", done:t.status !== "pending" },
          { label:"Under Review", detail:t.assignedTo ? `Assigned to ${t.assignedTo}` : "Awaiting assignment", done:t.status === "under_review" || t.status === "sent_review" || t.status === "resolved" },
          { label:"Sent for Review", detail:"Field inspection or verification in progress", done:t.status === "sent_review" || t.status === "resolved" },
          { label:"Resolved", detail:t.resolvedBy ? `Resolved by ${t.resolvedBy}, closed by ${t.closedBy}` : "Pending resolution", done:t.status === "resolved" },
        ];
        const sty_label = { fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:0.5, marginBottom:4 };
        return (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000 }} onClick={() => { setViewTicket(null); setEditMode(false); }}>
            <div style={{ background:"#fff", borderRadius:16, maxWidth:640, width:"92%", maxHeight:"90vh", overflow:"auto" }} onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div style={{ background:"linear-gradient(135deg, #1F4E79 0%, #2E75B6 100%)", color:"#fff", padding:"24px 28px", borderRadius:"16px 16px 0 0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:1.5, opacity:0.7, marginBottom:4 }}>Case Details</div>
                  <div style={{ fontSize:20, fontWeight:800 }}>{t.id}</div>
                  <div style={{ fontSize:13, opacity:0.9, marginTop:4 }}>{t.category} — {t.parish}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ background:CASE_STATUS_COLORS[t.status], color:"#fff", padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:700 }}>{CASE_STATUS_LABELS[t.status]}</span>
                  <button onClick={() => { setViewTicket(null); setEditMode(false); }} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:"#fff", width:28, height:28, borderRadius:8, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                </div>
              </div>

              <div style={{ padding:"24px 28px" }}>
                {/* Description */}
                <div style={{ marginBottom:20 }}>
                  <div style={sty_label}>Description</div>
                  <div style={{ fontSize:14, lineHeight:1.7, color:"#333", background:"#f8f9fa", padding:16, borderRadius:8, borderLeft:"4px solid #2E75B6" }}>{t.desc}</div>
                </div>

                {/* Details Grid */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
                  {[
                    { label:"Date Reported", value:t.date },
                    { label:"Category", value:t.category },
                    { label:"Parish", value:t.parish },
                    { label:"Assigned To", value:t.assignedTo || "Unassigned" },
                    { label:"Location", value:t.lat ? `${t.lat.toFixed(4)}, ${t.lng.toFixed(4)}` : "Not specified" },
                    { label:"Priority", value:t.priority === "high" ? "High" : t.priority === "low" ? "Low" : "Standard" },
                  ].map(d => (
                    <div key={d.label} style={{ background:"#f8f9fa", padding:"12px 16px", borderRadius:8 }}>
                      <div style={{ fontSize:10, fontWeight:600, color:"#888", textTransform:"uppercase", letterSpacing:0.5, marginBottom:2 }}>{d.label}</div>
                      <div style={{ fontSize:13, fontWeight:600, color:"#1F4E79" }}>{d.value}</div>
                    </div>
                  ))}
                </div>

                {/* Update Case Panel */}
                {t.status !== "resolved" && (
                  <div style={{ marginBottom:20 }}>
                    {!editMode ? (
                      <button onClick={() => startEdit(t)} style={{ background:"#E8F0FE", color:"#1F4E79", border:"1px solid #B3D1F0", padding:"10px 20px", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:13, width:"100%" }}>Update Case</button>
                    ) : (
                      <div style={{ background:"#f8f9fa", borderRadius:12, padding:20, border:"1px solid #e0e0e0" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                          <div style={{ fontSize:14, fontWeight:700, color:"#1F4E79" }}>Update Case</div>
                          <span style={{ fontSize:11, color:"#888" }}>Editing as nwa_supervisor</span>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                          <div>
                            <div style={sty_label}>Status</div>
                            <select value={editData.status} onChange={e => setEditData(p => ({...p, status:e.target.value}))} style={{...inputStyle, width:"100%"}}>
                              {Object.entries(CASE_STATUS_LABELS).filter(([k]) => k !== "resolved").map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                          </div>
                          <div>
                            <div style={sty_label}>Category</div>
                            <select value={editData.category} onChange={e => setEditData(p => ({...p, category:e.target.value}))} style={{...inputStyle, width:"100%"}}>
                              {["Pothole","Road Damage","Flooding","Drainage","Signage","Other"].map(c => <option key={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <div style={sty_label}>Assigned To</div>
                            <select value={editData.assignedTo} onChange={e => setEditData(p => ({...p, assignedTo:e.target.value}))} style={{...inputStyle, width:"100%"}}>
                              <option value="">Unassigned</option>
                              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div>
                            <div style={sty_label}>Priority</div>
                            <select value={editData.priority} onChange={e => setEditData(p => ({...p, priority:e.target.value}))} style={{...inputStyle, width:"100%"}}>
                              <option value="low">Low</option>
                              <option value="standard">Standard</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                        </div>
                        <div style={{ marginBottom:12 }}>
                          <div style={sty_label}>Add Internal Note</div>
                          <textarea value={caseNote} onChange={e => setCaseNote(e.target.value)} placeholder="Add a note about this update..." rows={2} style={{...inputStyle, width:"100%", resize:"vertical", boxSizing:"border-box"}} />
                        </div>
                        <div style={{ display:"flex", gap:8 }}>
                          <button onClick={() => handleUpdate(t.id)} style={{ flex:1, background:"#1F4E79", color:"#fff", border:"none", padding:"10px", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:13 }}>Save Changes</button>
                          <button onClick={() => setEditMode(false)} style={{ flex:1, background:"#f0f0f0", border:"none", padding:"10px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Internal Notes */}
                {notes.length > 0 && (
                  <div style={{ marginBottom:20 }}>
                    <div style={sty_label}>Internal Notes ({notes.length})</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {notes.map((n, i) => (
                        <div key={i} style={{ background:"#FFFDE7", padding:"10px 14px", borderRadius:8, border:"1px solid #FFF9C4", fontSize:12 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                            <span style={{ fontWeight:700, color:"#1F4E79" }}>{n.author}</span>
                            <span style={{ color:"#999", fontSize:11 }}>{n.time}</span>
                          </div>
                          <div style={{ color:"#444", lineHeight:1.5 }}>{n.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Add Note (when not in edit mode, for resolved cases too) */}
                {!editMode && (
                  <div style={{ marginBottom:20 }}>
                    <div style={sty_label}>Add Note</div>
                    <div style={{ display:"flex", gap:8 }}>
                      <input value={caseNote} onChange={e => setCaseNote(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote(t.id)} placeholder="Type a note..." style={{...inputStyle, flex:1}} />
                      <button onClick={() => addNote(t.id)} disabled={!caseNote.trim()} style={{ background: caseNote.trim() ? "#1F4E79" : "#ccc", color:"#fff", border:"none", padding:"10px 16px", borderRadius:8, fontWeight:600, cursor: caseNote.trim() ? "pointer" : "default", fontSize:12, whiteSpace:"nowrap" }}>Add</button>
                    </div>
                  </div>
                )}

                {/* Status Timeline */}
                <div style={{ marginBottom:20 }}>
                  <div style={sty_label}>Status Timeline</div>
                  <div style={{ position:"relative", paddingLeft:24, marginTop:12 }}>
                    {timeline.map((step, i) => (
                      <div key={step.label} style={{ display:"flex", gap:12, marginBottom: i < timeline.length - 1 ? 16 : 0, position:"relative" }}>
                        {i < timeline.length - 1 && <div style={{ position:"absolute", left:-16, top:20, width:2, height:"calc(100% + 4px)", background: step.done ? "#4CAF50" : "#e0e0e0" }} />}
                        <div style={{ position:"absolute", left:-20, top:4, width:10, height:10, borderRadius:"50%", background: step.done ? "#4CAF50" : "#e0e0e0", border: step.done ? "2px solid #4CAF50" : "2px solid #ccc", zIndex:1 }} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:700, color: step.done ? "#1F4E79" : "#bbb" }}>{step.label}</div>
                          <div style={{ fontSize:12, color: step.done ? "#666" : "#ccc", marginTop:2 }}>{step.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:"flex", gap:8, borderTop:"1px solid #eee", paddingTop:16 }}>
                  {t.status !== "resolved" && (
                    <>
                      <button onClick={() => { setViewTicket(null); setEditMode(false); setSelectedTicket(t.id); }} style={{ flex:1, background:"#2E75B6", color:"#fff", border:"none", padding:"12px", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:13 }}>Assign</button>
                      <button onClick={() => { setViewTicket(null); setEditMode(false); setConfirmClose(t.id); }} style={{ flex:1, background:"#4CAF50", color:"#fff", border:"none", padding:"12px", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:13 }}>Close Case</button>
                    </>
                  )}
                  <button onClick={() => { setViewTicket(null); setEditMode(false); }} style={{ flex: t.status === "resolved" ? 1 : 0, minWidth:100, background:"#f0f0f0", border:"none", padding:"12px", borderRadius:8, cursor:"pointer", fontSize:13 }}>
                    {t.status === "resolved" ? "Close" : "Back"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Assign Modal */}
      {selectedTicket && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000 }} onClick={() => setSelectedTicket(null)}>
          <div style={{ background:"#fff", borderRadius:16, padding:32, maxWidth:400, width:"90%" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color:"#1F4E79", margin:"0 0 16px" }}>Assign Case {selectedTicket.slice(-4)}</h3>
            <p style={{ fontSize:13, color:"#666", marginBottom:16 }}>Select department to assign this case:</p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {DEPARTMENTS.map(d => (
                <button key={d} onClick={() => handleAssign(selectedTicket, d)} style={{ background:"#f8f9fa", border:"1px solid #e0e0e0", padding:"12px 16px", borderRadius:8, textAlign:"left", cursor:"pointer", fontSize:13, fontWeight:600, color:"#1F4E79" }}
                  onMouseEnter={e => e.currentTarget.style.background="#e8f0fe"} onMouseLeave={e => e.currentTarget.style.background="#f8f9fa"}>
                  {d}
                </button>
              ))}
            </div>
            <button onClick={() => setSelectedTicket(null)} style={{ marginTop:16, background:"#f0f0f0", border:"none", padding:"10px 24px", borderRadius:8, cursor:"pointer", width:"100%", fontSize:13 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* 2-Person Closeout Modal */}
      {confirmClose && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000 }} onClick={() => setConfirmClose(null)}>
          <div style={{ background:"#fff", borderRadius:16, padding:32, maxWidth:420, width:"90%" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color:"#1F4E79", margin:"0 0 8px" }}>2-Person Closeout Verification</h3>
            <p style={{ fontSize:13, color:"#666", marginBottom:20 }}>Case <strong>{confirmClose}</strong> requires dual authorization to resolve.</p>
            <div style={{ background:"#f0f4f8", borderRadius:8, padding:16, marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:13 }}><span style={{ color:"#888" }}>Resolved by:</span><strong>Officer A (current user)</strong></div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}><span style={{ color:"#888" }}>Confirmed by:</span><strong>Supervisor B (simulated)</strong></div>
            </div>
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={() => handleCloseout(confirmClose)} style={{ flex:1, background:"#4CAF50", color:"#fff", border:"none", padding:"12px", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:13 }}>Confirm & Close Case</button>
              <button onClick={() => setConfirmClose(null)} style={{ flex:1, background:"#f0f0f0", border:"none", padding:"12px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== EMERGENCY OPERATIONS (NEW) =====
function EmergencyPage({ closures, navigate }) {
  const activeEvents = EMERGENCY_EVENTS.filter(e => e.status === "active" || e.status === "monitoring");
  const totalRoads = EMERGENCY_EVENTS.reduce((s, e) => s + e.roadsAffected, 0);
  const totalCrews = EMERGENCY_EVENTS.reduce((s, e) => s + e.crewsDeployed, 0);
  const affectedParishes = [...new Set(EMERGENCY_EVENTS.flatMap(e => e.parishes))];

  return (
    <div style={{ paddingTop:24 }}>
      {/* Alert Level Banner */}
      <div style={{ background:"linear-gradient(135deg, #C62828 0%, #E65100 100%)", color:"#fff", borderRadius:12, padding:"24px 32px", marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
        <div>
          <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:2, opacity:0.8, marginBottom:4 }}>Emergency Operations Centre</div>
          <div style={{ fontSize:24, fontWeight:800 }}>Island-Wide Alert: ELEVATED</div>
          <div style={{ fontSize:13, opacity:0.9, marginTop:4 }}>Tropical Storm Adele — Eastern parishes under weather advisory. NWA crews pre-positioned.</div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:32, fontWeight:800 }}>{activeEvents.length}</div>
          <div style={{ fontSize:11, opacity:0.8 }}>Active Events</div>
        </div>
      </div>

      {/* Situation Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:16, marginBottom:24 }}>
        {[
          { label:"Active Events", value:activeEvents.length, color:"#C62828", icon:"🚨" },
          { label:"Roads Affected", value:totalRoads, color:"#E65100", icon:"🚧" },
          { label:"Crews Deployed", value:totalCrews, color:"#1565C0", icon:"👷" },
          { label:"Parishes Impacted", value:affectedParishes.length, color:"#7B1FA2", icon:"📍" },
          { label:"Road Closures", value:closures.length, color:"#F44336", icon:"⛔" },
        ].map(k => (
          <div key={k.label} style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", borderTop:`4px solid ${k.color}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:28, fontWeight:800, color:k.color }}>{k.value}</div>
              <div style={{ fontSize:24 }} aria-hidden="true">{k.icon}</div>
            </div>
            <div style={{ fontSize:12, color:"#888", marginTop:4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Parish Alert Map */}
      <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e8e8e8", overflow:"hidden", marginBottom:24 }}>
        <div style={{ padding:"12px 20px", borderBottom:"1px solid #eee", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontWeight:700, color:"#1F4E79", fontSize:14 }}>Parish Alert Map</span>
          <div style={{ display:"flex", gap:10 }}>
            {Object.entries(ALERT_LEVEL_LABELS).map(([k, v]) => (
              <div key={k} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:ALERT_LEVEL_COLORS[k] }} />
                <span style={{ color:"#666" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <MapContainer center={[18.15, -77.3]} zoom={8} style={{ height:300 }} scrollWheelZoom={true}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
          {PARISHES.map(p => {
            const level = PARISH_ALERT_LEVELS[p] || "normal";
            const coords = PARISH_COORDS[p];
            if (!coords) return null;
            return (
              <CircleMarker key={p} center={coords} radius={level === "emergency" ? 16 : level === "warning" ? 13 : level === "advisory" ? 11 : 8} pathOptions={{ color:"#fff", weight:2, fillColor:ALERT_LEVEL_COLORS[level], fillOpacity:0.85 }}>
                <Popup>
                  <div style={{ minWidth:140 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:"#1F4E79", marginBottom:4 }}>{p}</div>
                    <span style={{ background:ALERT_LEVEL_COLORS[level], color:"#fff", padding:"2px 10px", borderRadius:12, fontSize:11, fontWeight:700 }}>{ALERT_LEVEL_LABELS[level]}</span>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <div className="nwa-grid-2col" style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20 }}>
        {/* Active Incidents */}
        <div>
          <div style={{ fontWeight:700, color:"#1F4E79", fontSize:16, marginBottom:12 }}>Active Incidents</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {EMERGENCY_EVENTS.map(e => (
              <div key={e.id} style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", borderLeft:`4px solid ${SEVERITY_COLORS[e.severity]}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, flexWrap:"wrap", gap:8 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ background:SEVERITY_COLORS[e.severity], color:"#fff", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, textTransform:"uppercase" }}>{e.severity}</span>
                    <span style={{ fontWeight:700, color:"#1F4E79", fontSize:15 }}>{e.name}</span>
                  </div>
                  <span style={{ background: e.status === "active" ? "#C62828" : e.status === "monitoring" ? "#E65100" : "#1565C0", color:"#fff", padding:"3px 10px", borderRadius:20, fontSize:10, fontWeight:700, textTransform:"uppercase" }}>{e.status}</span>
                </div>
                <p style={{ fontSize:13, color:"#444", margin:"0 0 12px", lineHeight:1.5 }}>{e.desc}</p>
                <div style={{ display:"flex", gap:16, fontSize:12, color:"#888", flexWrap:"wrap" }}>
                  <span>📅 {e.date}</span>
                  <span>📍 {e.parishes.join(", ")}</span>
                  <span>🚧 {e.roadsAffected} road(s)</span>
                  <span>👷 {e.crewsDeployed} crews</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Parish Impact Grid */}
        <div>
          <div style={{ fontWeight:700, color:"#1F4E79", fontSize:16, marginBottom:12 }}>Parish Alert Levels</div>
          <div style={{ background:"#fff", borderRadius:12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", overflow:"hidden" }}>
            {PARISHES.map(p => {
              const level = PARISH_ALERT_LEVELS[p] || "normal";
              return (
                <div key={p} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 16px", borderBottom:"1px solid #f0f0f0" }}>
                  <span style={{ fontSize:13 }}>{p}</span>
                  <span style={{ background:ALERT_LEVEL_COLORS[level], color:"#fff", padding:"2px 10px", borderRadius:12, fontSize:10, fontWeight:700, textTransform:"uppercase" }}>{ALERT_LEVEL_LABELS[level]}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop:16, display:"flex", gap:8, flexWrap:"wrap" }}>
            {Object.entries(ALERT_LEVEL_LABELS).map(([k, v]) => (
              <div key={k} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:ALERT_LEVEL_COLORS[k] }} />
                <span style={{ color:"#666" }}>{v}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("closures")} style={{ marginTop:16, background:"#1F4E79", color:"#fff", border:"none", padding:"10px 20px", borderRadius:8, fontWeight:600, cursor:"pointer", width:"100%", fontSize:13 }}>View All Road Closures →</button>
        </div>
      </div>
    </div>
  );
}

// ===== ABOUT PAGE =====
function AboutPage({ navigate }) {
  return (
    <div style={{ paddingTop:24 }}>
      <h2 style={{ color:"#1F4E79", fontSize:24, fontWeight:800, margin:"0 0 8px" }}>About the National Works Agency</h2>
      <p style={{ color:"#666", fontSize:14, marginBottom:24 }}>An Executive Agency under the Ministry of Economic Growth & Infrastructure Development.</p>

      <div style={{ background:"#fff", borderRadius:12, padding:32, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", marginBottom:24 }}>
        <h3 style={{ color:"#1F4E79", fontSize:18, fontWeight:700, margin:"0 0 12px" }}>Our Mandate</h3>
        <p style={{ fontSize:14, color:"#444", lineHeight:1.8, margin:"0 0 16px" }}>The National Works Agency (NWA) is the Government of Jamaica's executive agency responsible for the management, maintenance, and development of the island's road network. Established under the Executive Agencies Act, the NWA manages over 5,000 kilometres of main roads across Jamaica's 14 parishes.</p>
        <p style={{ fontSize:14, color:"#444", lineHeight:1.8, margin:0 }}>The agency's core functions include road construction and rehabilitation, bridge maintenance, drainage management, traffic management, and emergency response during natural disasters.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))", gap:20, marginBottom:24 }}>
        {[
          { title:"Mission", text:"To provide a safe, reliable, and efficient road network that supports Jamaica's economic and social development through professional management and sustainable practices." },
          { title:"Vision", text:"To be a world-class road management agency recognised for excellence in infrastructure delivery, innovation, and public service." },
          { title:"Core Values", text:"Integrity, Professionalism, Accountability, Innovation, and Service Excellence in all our operations across every parish." },
        ].map(v => (
          <div key={v.title} style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", borderTop:"4px solid #1F4E79" }}>
            <div style={{ fontWeight:700, color:"#1F4E79", fontSize:16, marginBottom:8 }}>{v.title}</div>
            <p style={{ fontSize:13, color:"#444", lineHeight:1.7, margin:0 }}>{v.text}</p>
          </div>
        ))}
      </div>

      <div style={{ background:"#fff", borderRadius:12, padding:32, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", marginBottom:24 }}>
        <h3 style={{ color:"#1F4E79", fontSize:18, fontWeight:700, margin:"0 0 16px" }}>Key Facts</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:16 }}>
          {[
            { value:"5,000+", label:"Kilometres of main roads", color:"#1F4E79" },
            { value:"14", label:"Parishes served", color:"#2E75B6" },
            { value:"800+", label:"Bridges maintained", color:"#D4A843" },
            { value:"24/7", label:"Emergency operations", color:"#C62828" },
          ].map(f => (
            <div key={f.label} style={{ textAlign:"center", padding:16, background:"#f8f9fa", borderRadius:8 }}>
              <div style={{ fontSize:32, fontWeight:800, color:f.color }}>{f.value}</div>
              <div style={{ fontSize:12, color:"#888", marginTop:4 }}>{f.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"flex", gap:12 }}>
        <button onClick={() => navigate("projects")} style={{ background:"#1F4E79", color:"#fff", border:"none", padding:"12px 24px", borderRadius:8, fontWeight:600, cursor:"pointer", fontSize:13 }}>View Our Projects →</button>
        <button onClick={() => navigate("contact")} style={{ background:"#f0f0f0", border:"none", padding:"12px 24px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Contact Us</button>
      </div>
    </div>
  );
}

// ===== CONTACT PAGE =====
function ContactPage() {
  return (
    <div style={{ paddingTop:24 }}>
      <h2 style={{ color:"#1F4E79", fontSize:24, fontWeight:800, margin:"0 0 8px" }}>Contact Us</h2>
      <p style={{ color:"#666", fontSize:14, marginBottom:24 }}>Reach the National Works Agency through any of the channels below.</p>

      <div className="nwa-grid-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        <div>
          <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", marginBottom:16 }}>
            <h3 style={{ color:"#1F4E79", fontSize:16, fontWeight:700, margin:"0 0 16px" }}>Head Office</h3>
            {[
              { icon:"📍", label:"Address", value:"140 Maxfield Avenue, Kingston 10, Jamaica" },
              { icon:"📞", label:"Telephone", value:"(876) 929-3380 / 929-3506" },
              { icon:"📠", label:"Fax", value:"(876) 929-2731" },
              { icon:"📧", label:"Email", value:"info@nwa.gov.jm" },
              { icon:"🌐", label:"Website", value:"www.nwa.gov.jm" },
              { icon:"🕐", label:"Hours", value:"Mon–Fri: 8:30 AM – 5:00 PM" },
            ].map(c => (
              <div key={c.label} style={{ display:"flex", gap:12, marginBottom:12, fontSize:13 }}>
                <span style={{ fontSize:16 }} aria-hidden="true">{c.icon}</span>
                <div>
                  <div style={{ fontWeight:600, color:"#1F4E79", marginBottom:2 }}>{c.label}</div>
                  <div style={{ color:"#444" }}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background:"#FFF8E1", borderRadius:12, padding:16, border:"1px solid #FFE082", fontSize:13, color:"#6D4C00", lineHeight:1.6 }}>
            <strong>Emergency Hotline:</strong> For after-hours road emergencies, call <strong>(876) 929-3380</strong>. The NWA Emergency Operations Centre operates 24/7 during adverse weather events.
          </div>
        </div>

        <div>
          <div style={{ background:"#fff", borderRadius:12, padding:24, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", marginBottom:16 }}>
            <h3 style={{ color:"#1F4E79", fontSize:16, fontWeight:700, margin:"0 0 16px" }}>Send Us a Message</h3>
            <FormField label="Full Name"><input placeholder="Your name" style={inputStyle} /></FormField>
            <FormField label="Email"><input placeholder="your@email.com" type="email" style={inputStyle} /></FormField>
            <FormField label="Subject">
              <select style={inputStyle}>
                <option>General Inquiry</option>
                <option>Road Complaint</option>
                <option>Project Information</option>
                <option>Media / Press</option>
                <option>Tenders / Procurement</option>
              </select>
            </FormField>
            <FormField label="Message"><textarea placeholder="Type your message..." rows={4} style={{...inputStyle, resize:"vertical"}} /></FormField>
            <button style={{ background:"#1F4E79", color:"#fff", border:"none", padding:"12px 24px", borderRadius:8, fontWeight:700, cursor:"pointer", width:"100%", fontSize:14 }}>Send Message</button>
          </div>

          <div style={{ borderRadius:12, overflow:"hidden" }}>
            <MapContainer center={[18.0165, -76.7955]} zoom={16} style={{ height:180 }} scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
              <CircleMarker center={[18.0165, -76.7955]} radius={10} pathOptions={{ color:"#fff", weight:2, fillColor:"#1F4E79", fillOpacity:1 }}>
                <Popup>NWA Head Office<br/>140 Maxfield Avenue</Popup>
              </CircleMarker>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== SHARED COMPONENTS =====
function SectionHeader({ title, link, onLink }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", margin:"32px 0 16px" }}>
      <h2 style={{ color:"#1F4E79", fontSize:20, fontWeight:800, margin:0 }}>{title}</h2>
      {link && <span {...clickable(onLink)} style={{ color:"#2E75B6", fontSize:13, cursor:"pointer", fontWeight:600 }}>{link}</span>}
    </div>
  );
}

function NewsCard({ news, full }) {
  return (
    <article style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", border:"1px solid #e8e8e8" }}>
      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
        <span style={{ background:"#E8F0FE", color:"#1F4E79", padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>{news.category}</span>
        <span style={{ fontSize:12, color:"#888" }}>{news.parish}</span>
        <span style={{ fontSize:12, color:"#888", marginLeft:"auto" }}><time dateTime={news.date}>{news.date}</time></span>
      </div>
      <div style={{ fontWeight:700, fontSize:full ? 16 : 15, color:"#1F4E79", marginBottom:6 }}>{news.title}</div>
      <p style={{ fontSize:13, color:"#666", lineHeight:1.5, margin:0 }}>{news.excerpt}</p>
    </article>
  );
}

function StatusBadge({ status }) {
  return <span style={{ background:STATUS_COLORS[status], color:"#fff", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>{STATUS_LABELS[status]}</span>;
}

function ProgressBar({ pct, small }) {
  return (
    <div style={{ background:"#e8e8e8", borderRadius:20, height: small ? 6 : 10, overflow:"hidden", position:"relative" }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${pct}% complete`}>
      <div style={{ background: pct === 100 ? "#4CAF50" : pct > 0 ? "#2E75B6" : "#ccc", height:"100%", width:`${pct}%`, borderRadius:20, transition:"width 0.6s ease" }} />
      {!small && <span style={{ position:"absolute", right:8, top:-1, fontSize:10, fontWeight:700, color: pct > 50 ? "#fff" : "#888" }} aria-hidden="true">{pct}%</span>}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <label style={{ display:"block", marginBottom:16 }}>
      <span style={{ display:"block", fontWeight:600, fontSize:13, color:"#1F4E79", marginBottom:6 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = { width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid #ddd", fontSize:14, fontFamily:"inherit", boxSizing:"border-box" };
