/**
 * /api/events — Server-Sent Events endpoint for NWA real-time push
 *
 * Streams NWA events (SLA breaches, emergencies, closures, new complaints)
 * to any connected client.
 *
 * Usage:
 *   const es = new EventSource("https://nwa-psi.vercel.app/api/events");
 *   es.onmessage = (e) => console.log(JSON.parse(e.data));
 *
 * Query params:
 *   ?parish=Kingston        — filter events to a specific parish
 *   ?severity=critical      — filter by severity (critical, warning, info)
 *   ?type=sla_breach        — filter by event type
 *   ?interval=10000         — ms between events (default 8000)
 */

import { createEventCycler, getAllCurrentEvents, type NWAEvent } from "@/lib/sse-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Cache-Control, Last-Event-ID",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filterParish = url.searchParams.get("parish")?.toLowerCase() ?? null;
  const filterSeverity = url.searchParams.get("severity")?.toLowerCase() ?? null;
  const filterType = url.searchParams.get("type")?.toLowerCase() ?? null;
  const interval = Math.max(2000, Math.min(60000, Number(url.searchParams.get("interval")) || 8000));

  const cycler = createEventCycler();

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send an initial comment to establish the connection
      controller.enqueue(encoder.encode(": NWA Event Stream connected\n\n"));

      // Send initial burst — all current critical/warning events
      const initial = getAllCurrentEvents();
      const filtered = initial.filter((e: NWAEvent) => {
        if (filterParish && e.parish.toLowerCase() !== filterParish) return false;
        if (filterSeverity && e.severity !== filterSeverity) return false;
        if (filterType && e.type !== filterType) return false;
        return true;
      });

      if (filtered.length > 0) {
        const snapshot = {
          type: "snapshot",
          count: filtered.length,
          events: filtered,
        };
        controller.enqueue(
          encoder.encode(`event: snapshot\ndata: ${JSON.stringify(snapshot)}\n\n`)
        );
      }

      // Then stream individual events on a timer
      const timer = setInterval(() => {
        try {
          const event = cycler();

          // Apply filters
          if (filterParish && event.parish.toLowerCase() !== filterParish) return;
          if (filterSeverity && event.severity !== filterSeverity) return;
          if (filterType && event.type !== filterType) return;

          const payload = `event: ${event.type}\nid: ${event.id}\ndata: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          clearInterval(timer);
          controller.close();
        }
      }, interval);

      // Clean up when client disconnects
      request.signal.addEventListener("abort", () => {
        clearInterval(timer);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      ...CORS_HEADERS,
    },
  });
}
