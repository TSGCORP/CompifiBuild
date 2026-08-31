"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const navItems = [
  { href: "/overview", label: "Overview" },
  { href: "/explorer", label: "Explorer" },
  { href: "/flight-risk", label: "Flight Risk" },
  { href: "/equity", label: "Equity" },
  { href: "/insights", label: "Insights" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [tenantName, setTenantName] = useState("Your tenant");

  useEffect(() => {
    let isMounted = true;

    async function loadTenant() {
      try {
        const response = await fetch("/api/tenant", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { tenantName?: string | null };
        if (isMounted && payload.tenantName) {
          setTenantName(payload.tenantName);
        }
      } catch {
        // Ignore transient load issues in the dashboard shell.
      }
    }

    void loadTenant();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9f6] text-[#0a0a0a]">
      <header className="topbar">
        <Link href="/overview" className="topbar-brand" aria-label="Compifi home">
          <strong>
            Compi<em>fi</em>
          </strong>
          <span className="logo-tag">IQ</span>
        </Link>

        <div className="topbar-divider" />

        <div className="topbar-company" aria-label="Selected company">
          <div className="company-avatar">S</div>
          <div>
            <div className="company-name">{tenantName}</div>
            <div className="company-meta">Tenant workspace</div>
          </div>
        </div>

        <div className="topbar-spacer" />

        <div className="topbar-search" role="search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input aria-label="Search" placeholder="Search employees, teams, bands" />
          <span className="kbd">⌘K</span>
        </div>

        <div className="topbar-pill">
          <span className="pulse-dot" />
          Live sync
        </div>

        <div className="topbar-user">SJ</div>
      </header>

      <div className="dashboard-shell">
        <aside className="sidebar" aria-label="Primary navigation">
          <div className="sidebar-section">
            <div className="sidebar-label">Workspace</div>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sb-item ${pathname === item.href ? "active" : ""}`}
              >
                <span className="sb-num">{String(navItems.indexOf(item) + 1).padStart(2, "0")}</span>
                <span>{item.label}</span>
                {item.href === "/flight-risk" && <span className="sb-badge amber">4</span>}
                {item.href === "/equity" && <span className="sb-badge">2</span>}
              </Link>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Signals</div>
            <div className="sb-item">
              <span className="sb-num">06</span>
              <span>Benchmark shifts</span>
              <span className="sb-badge">1</span>
            </div>
            <div className="sb-item">
              <span className="sb-num">07</span>
              <span>Comp cycle</span>
              <span className="sb-badge amber">3</span>
            </div>
          </div>

          <div className="sb-footer">
            <div className="sb-footer-label">Account</div>
            <div className="sb-footer-text">Tenant-scoped secure compensation environment.</div>
            <Link href="/overview" className="sb-footer-link">
              View tenant ▸
            </Link>
          </div>
        </aside>

        <main className="main">{children}</main>
      </div>
    </div>
  );
}
