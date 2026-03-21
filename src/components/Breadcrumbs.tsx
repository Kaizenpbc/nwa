import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  crumbs: Crumb[];
}

export default function Breadcrumbs({ crumbs }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-nwa-blue transition-colors font-medium">
              Home
            </Link>
          </li>
          {crumbs.map((crumb, i) => (
            <li key={i} className="flex items-center gap-1">
              <span className="text-gray-300 select-none">/</span>
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-nwa-blue transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium" aria-current="page">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
