import Link from "next/link";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-nwa-dark text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-nwa-yellow rounded-full flex items-center justify-center">
                <span className="text-nwa-blue font-extrabold text-xs">NWA</span>
              </div>
              <span className="font-bold text-white">National Works Agency</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Building and maintaining Jamaica&apos;s road infrastructure for a safer, more connected nation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/projects" className="hover:text-nwa-yellow transition-colors">Projects</Link></li>
              <li><Link href="/closures" className="hover:text-nwa-yellow transition-colors">Road Closures</Link></li>
              <li><Link href="/complaints" className="hover:text-nwa-yellow transition-colors">Report an Issue</Link></li>
              <li><Link href="/news" className="hover:text-nwa-yellow transition-colors">Newsroom</Link></li>
              <li><Link href="/about" className="hover:text-nwa-yellow transition-colors">About NWA</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/complaints" className="hover:text-nwa-yellow transition-colors">Complaint Tracker</Link></li>
              <li><Link href="/projects" className="hover:text-nwa-yellow transition-colors">Project Updates</Link></li>
              <li><Link href="#" className="hover:text-nwa-yellow transition-colors">Tenders & Bids</Link></li>
              <li><Link href="#" className="hover:text-nwa-yellow transition-colors">Publications</Link></li>
              <li><Link href="#" className="hover:text-nwa-yellow transition-colors">GIS Data Requests</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <FiMapPin aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0 text-nwa-yellow" />
                <span>140 Maxfield Avenue,<br />Kingston 10, Jamaica</span>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone aria-hidden="true" className="w-4 h-4 shrink-0 text-nwa-yellow" />
                <span>(876) 929-3380</span>
              </li>
              <li className="flex items-center gap-2">
                <FiMail aria-hidden="true" className="w-4 h-4 shrink-0 text-nwa-yellow" />
                <span>info@nwa.gov.jm</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> National Works Agency, Jamaica. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link href="#" className="hover:text-gray-300">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-300">Terms of Use</Link>
            <Link href="#" className="hover:text-gray-300">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
