"use client";

import { useState } from "react";
import MapView from "@/components/MapView";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-nwa-blue text-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-2xl font-extrabold mb-1">Contact Us</h1>
          <p className="text-blue-200 text-sm">Reach the National Works Agency through any of the channels below.</p>
        </div>
      </div>
      <Breadcrumbs crumbs={[{ label: "Contact Us" }]} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Contact Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-[#1F4E79] font-bold text-base mb-4">Head Office</h2>
              {[
                { icon: "\uD83D\uDCCD", label: "Address", value: "140 Maxfield Avenue, Kingston 10, Jamaica" },
                { icon: "\uD83D\uDCDE", label: "Telephone", value: "(876) 929-3380 / 929-3506" },
                { icon: "\uD83D\uDCE0", label: "Fax", value: "(876) 929-2731" },
                { icon: "\uD83D\uDCE7", label: "Email", value: "info@nwa.gov.jm" },
                { icon: "\uD83C\uDF10", label: "Website", value: "www.nwa.gov.jm" },
                { icon: "\uD83D\uDD50", label: "Hours", value: "Mon–Fri: 8:30 AM – 5:00 PM" },
              ].map((c) => (
                <div key={c.label} className="flex gap-3 mb-3 text-sm">
                  <span className="text-base" aria-hidden="true">{c.icon}</span>
                  <div>
                    <div className="font-semibold text-[#1F4E79] mb-0.5">{c.label}</div>
                    <div className="text-gray-600">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 text-sm text-yellow-900 leading-relaxed">
              <strong>Emergency Hotline:</strong> For after-hours road emergencies, call <strong>(876) 929-3380</strong>. The NWA Emergency Operations Centre operates 24/7 during adverse weather events.
            </div>
          </div>

          {/* Right — Form + Map */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-[#1F4E79] font-bold text-base mb-4">Send Us a Message</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1F4E79] mb-1">Full Name</label>
                  <input placeholder="Your name" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1F4E79] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1F4E79] mb-1">Email</label>
                  <input placeholder="your@email.com" type="email" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1F4E79] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1F4E79] mb-1">Subject</label>
                  <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1F4E79] outline-none">
                    <option>General Inquiry</option>
                    <option>Road Complaint</option>
                    <option>Project Information</option>
                    <option>Media / Press</option>
                    <option>Tenders / Procurement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1F4E79] mb-1">Message</label>
                  <textarea placeholder="Type your message..." rows={4} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1F4E79] outline-none resize-y" />
                </div>
                {sent ? (
                  <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                    <div className="text-xl mb-1">&#x2705;</div>
                    <div className="font-bold text-green-800 text-sm">Message Sent Successfully</div>
                    <div className="text-xs text-green-600 mt-1">We&apos;ll respond within 2 business days.</div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSent(true)}
                    className="w-full bg-nwa-blue text-white py-3 rounded-lg font-bold text-sm hover:bg-nwa-blue-light transition-colors"
                  >
                    Send Message
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-xl overflow-hidden">
              <MapView
                center={[18.0165, -76.7955]}
                zoom={16}
                height="180px"
                markers={[
                  { lat: 18.0165, lng: -76.7955, label: "NWA Head Office", popup: "140 Maxfield Avenue, Kingston 10", color: "blue" },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
