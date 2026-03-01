"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiSearch, FiPhone } from "react-icons/fi";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Emergency", href: "/emergency" },
  { label: "Report Issue", href: "/complaints" },
  { label: "Track", href: "/complaints/track" },
  { label: "Closures", href: "/closures" },
  { label: "News", href: "/news" },
  { label: "Staff Portal", href: "/portal" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-nwa-dark text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <FiPhone className="w-3 h-3" />
              <span className="hidden sm:inline">(876) 929-3380</span>
            </span>
            <span className="hidden md:inline text-gray-400">|</span>
            <span className="hidden md:inline">info@nwa.gov.jm</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/portal" className="hover:text-nwa-yellow transition-colors text-xs font-medium">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="bg-nwa-blue text-white shadow-lg" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-nwa-yellow rounded-full flex items-center justify-center">
                <span className="text-nwa-blue font-extrabold text-sm">NWA</span>
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-lg leading-tight">National Works Agency</div>
                <div className="text-xs text-blue-200">Government of Jamaica</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-white/10 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Search + mobile toggle */}
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-md hover:bg-white/10 transition-colors"
                aria-label="Search"
              >
                <FiSearch className="w-5 h-5" />
              </button>
              <button
                className="lg:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-white/10 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Jamaica flag accent stripe */}
      <div className="flex h-1">
        <div className="flex-1 bg-nwa-green"></div>
        <div className="flex-1 bg-nwa-yellow"></div>
        <div className="flex-1 bg-nwa-green"></div>
      </div>
    </header>
  );
}
