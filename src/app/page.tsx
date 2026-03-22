"use client";

import Link from "next/link";
import {
  PROJECTS,
  NEWS,
  CLOSURES,
  STATUS_COLORS,
  STATUS_LABELS,
  SEVERITY_COLORS,
} from "@/data/mock";

/* ------------------------------------------------------------------ */
/*  1. Video Hero                                                      */
/* ------------------------------------------------------------------ */
function VideoHero() {
  return (
    <section className="relative h-[520px] md:h-[600px] overflow-hidden bg-nwa-dark">
      {/* YouTube background embed — muted autoplay loop */}
      <div className="absolute inset-0 pointer-events-none">
        <iframe
          className="absolute top-1/2 left-1/2 w-[180%] h-[180%] -translate-x-1/2 -translate-y-1/2"
          src="https://www.youtube-nocookie.com/embed/HNftNo8Ewuc?autoplay=1&mute=1&loop=1&playlist=HNftNo8Ewuc&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
          title="NWA Jamaica background video"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
          Building Jamaica&apos;s Roads for the Future
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 max-w-2xl leading-relaxed">
          Managing over 5,000&nbsp;km of roads across all 14 parishes &mdash;
          planning, constructing, and maintaining the infrastructure that keeps
          Jamaica connected.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 bg-nwa-yellow text-nwa-dark font-semibold rounded-lg hover:bg-yellow-400 transition-colors text-sm sm:text-base"
          >
            View Projects Map &rarr;
          </Link>
          <Link
            href="/complaints"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors text-sm sm:text-base"
          >
            Report an Issue
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  2. Quick Links Grid                                                */
/* ------------------------------------------------------------------ */
const QUICK_LINKS = [
  { emoji: "\u{1F6A7}", label: "Report Issue", href: "/complaints" },
  { emoji: "\u26D4", label: "Road Closures", href: "/closures" },
  { emoji: "\u{1F3D7}\uFE0F", label: "Projects", href: "/projects" },
  { emoji: "\u{1F4F0}", label: "News", href: "/news" },
  { emoji: "\u{1F50D}", label: "Track Request", href: "/complaints/track" },
  { emoji: "\u{1F6A8}", label: "Emergency", href: "/emergency" },
  { emoji: "\u{1F464}", label: "Staff Portal", href: "/portal" },
  { emoji: "\u{1F3A4}", label: "Voice Assistant", href: "/voice" },
];

function QuickLinksGrid() {
  return (
    <section className="py-10 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex flex-col items-center gap-2 p-5 rounded-xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
            >
              <span className="text-3xl" role="img" aria-label={link.label}>
                {link.emoji}
              </span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-nwa-blue text-center">
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Active Closures Strip                                           */
/* ------------------------------------------------------------------ */
function ActiveClosuresStrip() {
  const pushed = CLOSURES.filter((c) => c.push);

  if (pushed.length === 0) return null;

  const severityBadgeClass = (severity: string): string => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700";
      case "warning":
        return "bg-orange-100 text-orange-700";
      case "info":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <section className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-lg" role="img" aria-label="warning">
            {"\u26A0\uFE0F"}
          </span>
          <h2 className="font-semibold text-amber-900">Active Road Closures</h2>
          <Link
            href="/closures"
            className="ml-auto text-sm font-medium text-nwa-blue hover:underline"
          >
            View all &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pushed.map((closure) => (
            <Link
              href="/closures"
              key={closure.id}
              className="flex items-start justify-between gap-2 p-3 rounded-lg bg-white border border-amber-200 hover:shadow-sm transition-shadow"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {closure.road}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {closure.parish} &mdash; {closure.reason}
                </p>
              </div>
              <span
                className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${severityBadgeClass(closure.severity)}`}
                style={{
                  borderLeft: `3px solid ${SEVERITY_COLORS[closure.severity] || "#999"}`,
                }}
              >
                {closure.severity}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  4. Latest News                                                     */
/* ------------------------------------------------------------------ */
function LatestNews() {
  const recentNews = NEWS.slice(0, 3);

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Latest News</h2>
          <Link
            href="/news"
            className="text-sm font-medium text-nwa-blue hover:underline"
          >
            All News &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentNews.map((item) => (
            <article
              key={item.id}
              className="flex flex-col rounded-xl border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Placeholder image strip */}
              <div className="h-40 bg-gradient-to-br from-nwa-blue to-nwa-blue-light flex items-center justify-center">
                <span className="text-white/50 text-xs font-medium tracking-wide">
                  NWA Photo
                </span>
              </div>

              <div className="p-5 flex flex-col flex-1">
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-nwa-blue/10 text-nwa-blue rounded-full">
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-400">{item.parish}</span>
                  <span className="text-xs text-gray-400 ml-auto" suppressHydrationWarning>
                    {new Date(item.date).toLocaleDateString("en-JM", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3 flex-1">
                  {item.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  5. Project Highlights                                              */
/* ------------------------------------------------------------------ */
function ProjectHighlights() {
  const inProgress = PROJECTS.filter((p) => p.status === "in_progress").slice(
    0,
    3,
  );

  return (
    <section className="py-14 bg-nwa-gray">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Project Highlights
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Current infrastructure works across Jamaica
            </p>
          </div>
          <Link
            href="/projects"
            className="hidden sm:inline-flex items-center gap-1 px-4 py-2 bg-nwa-blue text-white text-sm font-medium rounded-lg hover:bg-nwa-blue-light transition-colors"
          >
            View All Projects &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {inProgress.map((project) => {
            const statusColor =
              STATUS_COLORS[project.status] || STATUS_COLORS.planned;
            const statusLabel =
              STATUS_LABELS[project.status] || project.status;

            return (
              <div
                key={project.id}
                className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: `${statusColor}20`,
                      color: statusColor,
                    }}
                  >
                    {statusLabel}
                  </span>
                  <span className="text-xs text-gray-400">
                    {project.parish}
                  </span>
                </div>

                {/* Title & description */}
                <h3 className="font-semibold text-gray-900 mb-2">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {project.desc}
                </p>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Completion</span>
                    <span className="font-semibold text-nwa-blue">
                      {project.pct}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full progress-fill"
                      style={{
                        width: `${project.pct}%`,
                        backgroundColor: statusColor,
                      }}
                    />
                  </div>
                </div>

                {/* Timeline */}
                <p className="mt-3 text-xs text-gray-400">
                  {project.start} &mdash; {project.end}
                </p>
              </div>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 px-4 py-2 bg-nwa-blue text-white text-sm font-medium rounded-lg"
          >
            View All Projects &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  return (
    <>
      <VideoHero />
      <QuickLinksGrid />
      <ActiveClosuresStrip />
      <LatestNews />
      <ProjectHighlights />
    </>
  );
}
