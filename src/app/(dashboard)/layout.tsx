"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/overview", label: "Overview" },
  { href: "/benchmarking", label: "Benchmarking" },
  { href: "/explorer", label: "Role Explorer" },
  { href: "/flight-risk", label: "Flight Risk" },
  { href: "/equity", label: "Pay Equity" },
  { href: "/insights", label: "Insights" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [tenantName, setTenantName] = useState("Your tenant");
  const [isLoadingTenant, setIsLoadingTenant] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNavItems = navItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return item.label.toLowerCase().includes(term) || item.href.toLowerCase().includes(term);
  });

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/auth/login");
      router.refresh();
    } catch {
      router.push("/auth/login");
    } finally {
      setIsSigningOut(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadTenant() {
      try {
        setIsLoadingTenant(true);
        const response = await fetch("/api/tenant", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { tenantName?: string | null };
        if (isMounted) {
          setTenantName(payload.tenantName ?? "Your tenant");
          setIsLoadingTenant(false);
        }
      } catch {
        if (isMounted) {
          setTenantName("Your tenant");
          setIsLoadingTenant(false);
        }
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
            Compi<span>fi</span>
          </strong>
        </Link>

        <div className="topbar-divider" />

        <div className="topbar-company" aria-label="Selected company" aria-busy={isLoadingTenant}>
          <div className="company-avatar">S</div>
          <div>
            <div className="company-name">{isLoadingTenant ? "Loading tenant..." : tenantName}</div>
            <div className="company-meta">{isLoadingTenant ? "Fetching workspace" : "Tenant workspace"}</div>
          </div>
        </div>

        <div className="topbar-spacer" />

        <div className="topbar-search" role="search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            aria-label="Search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search workspace, roles, teams"
          />
          <span className="kbd">⌘K</span>
        </div>

        <div className="topbar-actions">
          <div className="topbar-status-badges" aria-label="Dashboard status">
            <span className="status-badge live">Live sync</span>
            <span className="status-badge subtle">Q3 2026</span>
          </div>
          <button
            type="button"
            className="signout-button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            aria-label="Sign out"
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </header>

      <div className="dashboard-shell">
        <aside className="sidebar" aria-label="Primary navigation">
          <div className="sidebar-section">
            <div className="sidebar-label">Module</div>
            {filteredNavItems.length > 0 ? (
              filteredNavItems.map((item) => (
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
              ))
            ) : (
              <div className="sidebar-empty-state">No workspace matches</div>
            )}
          </div>

          <div className="sidebar-section signal-group">
            <div className="sidebar-label">Live signal</div>
            <div className="sb-signal-item">
              <div className="sb-signal-copy">
                <span className="sb-signal-title">Comp pressure</span>
                <span className="sb-signal-detail">+3.1% benchmark move</span>
                <span className="sb-signal-meta">Updated 4m ago</span>
              </div>
              <span className="sb-badge">1</span>
            </div>
            <div className="sb-signal-item">
              <div className="sb-signal-copy">
                <span className="sb-signal-title">Merit review</span>
                <span className="sb-signal-detail">3 actions due</span>
                <span className="sb-signal-meta">Updated 9m ago</span>
              </div>
              <span className="sb-badge amber">3</span>
            </div>
            <div className="sb-signal-item neutral">
              <div className="sb-signal-copy">
                <span className="sb-signal-title">Retention risk</span>
                <span className="sb-signal-detail">6 roles at risk</span>
                <span className="sb-signal-meta">Updated 7m ago</span>
              </div>
              <span className="sb-badge">6</span>
            </div>
            <div className="sb-signal-item neutral">
              <div className="sb-signal-copy">
                <span className="sb-signal-title">Quarterly pay</span>
                <span className="sb-signal-detail">+1.7% median move</span>
                <span className="sb-signal-meta">Updated 12m ago</span>
              </div>
              <span className="sb-badge">2</span>
            </div>
          </div>

          <div className="sidebar-section sidebar-status-section">
            <div className="sidebar-label">Status</div>
            <div className="sidebar-status online" aria-live="polite">
              <span className="pulse-dot" />
              <span>Live sync</span>
            </div>
          </div>
        </aside>

        <main className="main">{children}</main>
      </div>
    </div>
  );
}
