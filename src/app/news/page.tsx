"use client";

import { useState } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { NEWS } from "@/data/mock";

export default function NewsPage() {
  const [selectedArticle, setSelectedArticle] = useState<(typeof NEWS)[0] | null>(null);

  if (selectedArticle) {
    const n = selectedArticle;
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-nwa-blue text-white py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-2xl font-extrabold mb-1">Newsroom</h1>
            <p className="text-blue-200 text-sm">Latest news, press releases, and updates from the National Works Agency.</p>
          </div>
        </div>
        <Breadcrumbs crumbs={[{ label: "Newsroom", href: "/news" }, { label: n.title.length > 50 ? n.title.slice(0, 50) + "…" : n.title }]} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => setSelectedArticle(null)}
            className="text-nwa-blue text-sm mb-4 hover:underline"
          >
            &larr; Back to Newsroom
          </button>
          <article className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="flex gap-2 items-center mb-3 flex-wrap">
              <span className="bg-blue-50 text-nwa-blue px-3 py-1 rounded-full text-xs font-semibold">{n.category}</span>
              <span className="text-sm text-gray-500">{n.parish}</span>
              <time className="text-sm text-gray-500 ml-auto" dateTime={n.date}>{n.date}</time>
            </div>
            <h1 className="text-2xl font-extrabold text-nwa-blue mb-4 leading-tight">{n.title}</h1>
            <div className="border-l-4 border-nwa-blue-light pl-5 mb-5">
              <p className="text-gray-600 leading-relaxed">{n.excerpt}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-5 text-gray-600 leading-relaxed space-y-3">
              <p>The National Works Agency continues to deliver on its mandate to maintain and improve Jamaica&apos;s road infrastructure. This initiative is part of the agency&apos;s ongoing commitment to ensuring safe and reliable road networks across all 14 parishes.</p>
              <p>NWA CEO Eng. E. George Lee has indicated that the agency will continue to prioritise projects that have the greatest impact on road safety and economic productivity. &quot;We remain committed to delivering quality infrastructure that serves the Jamaican people,&quot; said Eng. Lee.</p>
              <p>Members of the public are encouraged to report road issues through the NWA&apos;s online complaint portal or by contacting the agency directly at (876) 929-3380.</p>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              <button onClick={() => setSelectedArticle(null)} className="bg-nwa-blue text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-nwa-blue-light transition-colors">&larr; Back to Newsroom</button>
              <Link href="/complaints" className="bg-gray-100 px-5 py-2.5 rounded-lg text-sm hover:bg-gray-200 transition-colors">Report an Issue</Link>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-nwa-blue text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-extrabold mb-1">Newsroom</h1>
          <p className="text-blue-200 text-sm">Latest news, press releases, and updates from the National Works Agency.</p>
        </div>
      </div>
      <Breadcrumbs crumbs={[{ label: "Newsroom" }]} />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {NEWS.map((n) => (
          <article
            key={n.id}
            onClick={() => setSelectedArticle(n)}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex gap-2 items-center mb-2 flex-wrap">
              <span className="bg-blue-50 text-nwa-blue px-2.5 py-0.5 rounded-full text-xs font-semibold">{n.category}</span>
              <span className="text-xs text-gray-500">{n.parish}</span>
              <time className="text-xs text-gray-500 ml-auto" dateTime={n.date}>{n.date}</time>
            </div>
            <h2 className="font-bold text-nwa-blue mb-1">{n.title}</h2>
            <p className="text-sm text-gray-600 line-clamp-2">{n.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
