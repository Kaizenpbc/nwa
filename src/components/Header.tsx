"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FiMenu, FiX, FiSearch, FiPhone } from "react-icons/fi";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Emergency", href: "/emergency" },
  { label: "Report Issue", href: "/complaints" },
  { label: "Closures", href: "/closures" },
  { label: "News", href: "/news" },
  { label: "Staff Portal", href: "/portal" },
];

const SEARCH_INDEX = [
  { label: "Road Projects", href: "/projects", keywords: "projects road works construction" },
  { label: "Report an Issue", href: "/complaints", keywords: "report complaint pothole issue problem" },
  { label: "Track My Request", href: "/complaints/track", keywords: "track complaint status request" },
  { label: "Road Closures", href: "/closures", keywords: "closure advisory detour road closed" },
  { label: "Emergency Operations", href: "/emergency", keywords: "emergency alert storm flood disaster" },
  { label: "Live Events", href: "/events", keywords: "live events stream real-time updates" },
  { label: "Newsroom", href: "/news", keywords: "news press release updates announcements" },
  { label: "About NWA", href: "/about", keywords: "about mandate mission vision agency" },
  { label: "Contact Us", href: "/contact", keywords: "contact phone email address location" },
  { label: "Staff Portal", href: "/portal", keywords: "staff portal login dashboard" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const results = query.trim().length > 0
    ? SEARCH_INDEX.filter((item) =>
        (item.label + " " + item.keywords).toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleResultClick(href: string) {
    setSearchOpen(false);
    setQuery("");
    router.push(href);
  }

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
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-white/10 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Search + mobile toggle */}
            <div className="flex items-center gap-2">
              <div className="relative" ref={searchRef}>
                <button
                  className="p-2 rounded-md hover:bg-white/10 transition-colors"
                  aria-label="Search"
                  onClick={() => setSearchOpen((prev) => !prev)}
                >
                  <FiSearch className="w-5 h-5" />
                </button>

                {searchOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 text-gray-900">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                      <FiSearch className="w-4 h-4 text-gray-400 shrink-0" />
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search NWA…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && results.length > 0) {
                            handleResultClick(results[0].href);
                          }
                          if (e.key === "Escape") {
                            setSearchOpen(false);
                            setQuery("");
                          }
                        }}
                        className="flex-1 text-sm outline-none bg-transparent"
                      />
                      {query && (
                        <button onClick={() => setQuery("")} aria-label="Clear search" className="text-gray-400 hover:text-gray-600">
                          <FiX className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {results.length > 0 ? (
                      <ul className="py-1">
                        {results.map((r) => (
                          <li key={r.href}>
                            <button
                              onClick={() => handleResultClick(r.href)}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-nwa-gray transition-colors"
                            >
                              <span className="font-medium text-nwa-blue">{r.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : query.trim().length > 0 ? (
                      <p className="px-4 py-3 text-sm text-gray-500">No results found.</p>
                    ) : (
                      <ul className="py-1">
                        {SEARCH_INDEX.slice(0, 5).map((r) => (
                          <li key={r.href}>
                            <button
                              onClick={() => handleResultClick(r.href)}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-nwa-gray transition-colors"
                            >
                              <span className="text-gray-600">{r.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

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
                  aria-current={pathname === item.href ? "page" : undefined}
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
