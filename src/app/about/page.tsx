import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-nwa-blue text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-extrabold mb-1">About the National Works Agency</h1>
          <p className="text-blue-200 text-sm">An Executive Agency under the Ministry of Economic Growth &amp; Infrastructure Development.</p>
        </div>
      </div>
      <Breadcrumbs crumbs={[{ label: "About NWA" }]} />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Mandate */}
        <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-nwa-blue text-lg font-bold mb-3">Our Mandate</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            The National Works Agency (NWA) is the Government of Jamaica&apos;s executive agency responsible for the management, maintenance, and development of the island&apos;s road network. Established under the Executive Agencies Act, the NWA manages over 5,000 kilometres of main roads across Jamaica&apos;s 14 parishes.
          </p>
          <p className="text-gray-600 leading-relaxed">
            The agency&apos;s core functions include road construction and rehabilitation, bridge maintenance, drainage management, traffic management, and emergency response during natural disasters.
          </p>
        </section>

        {/* Mission / Vision / Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { title: "Mission", text: "To provide a safe, reliable, and efficient road network that supports Jamaica's economic and social development through professional management and sustainable practices." },
            { title: "Vision", text: "To be a world-class road management agency recognised for excellence in infrastructure delivery, innovation, and public service." },
            { title: "Core Values", text: "Integrity, Professionalism, Accountability, Innovation, and Service Excellence in all our operations across every parish." },
          ].map((v) => (
            <div key={v.title} className="bg-white rounded-xl p-6 shadow-sm border-t-4 border-[#1F4E79]">
              <h3 className="font-bold text-nwa-blue text-base mb-2">{v.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>

        {/* Key Facts */}
        <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-nwa-blue text-lg font-bold mb-5">Key Facts</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "5,000+", label: "Kilometres of main roads", color: "#1F4E79" },
              { value: "14", label: "Parishes served", color: "#2E75B6" },
              { value: "800+", label: "Bridges maintained", color: "#D4A843" },
              { value: "24/7", label: "Emergency operations", color: "#C62828" },
            ].map((f) => (
              <div key={f.label} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-extrabold" style={{ color: f.color }}>{f.value}</div>
                <div className="text-xs text-gray-500 mt-1">{f.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-3">
          <Link href="/projects" className="bg-nwa-blue text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-nwa-blue-light transition-colors">View Our Projects &rarr;</Link>
          <Link href="/contact" className="bg-gray-100 px-5 py-2.5 rounded-lg text-sm hover:bg-gray-200 transition-colors">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
