"use client";

import { useMemo, useState } from "react";
import { benchmarkTestRows } from "@/lib/data/compifiBenchmarkTest";

const roleSummary = [
  { label: "Median compa", value: "1.02", note: "Across active roles" },
  { label: "Above market", value: "42%", note: "of benchmarked roles" },
  { label: "Below market", value: "18%", note: "under current targets" },
  { label: "Refresh cycle", value: "Q3 2026", note: "Latest benchmark set" },
];

const teamMix = [
  { team: "Engineering", count: 34, avg: "$191k", status: "Market close" },
  { team: "Product", count: 16, avg: "$214k", status: "Above market" },
  { team: "Sales", count: 21, avg: "$248k", status: "At market" },
  { team: "Finance", count: 12, avg: "$224k", status: "Healthy" },
];

function formatCurrency(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export default function ExplorerPage() {
  const [query, setQuery] = useState("");
  const [bandFilter, setBandFilter] = useState("All bands");
  const [geographyFilter, setGeographyFilter] = useState("All geographies");

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return benchmarkTestRows.filter((row) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        row.jobTitle.toLowerCase().includes(normalizedQuery) ||
        row.benchmarkTitle.toLowerCase().includes(normalizedQuery) ||
        row.geography.toLowerCase().includes(normalizedQuery) ||
        row.band.toLowerCase().includes(normalizedQuery);

      const matchesBand = bandFilter === "All bands" || row.band === bandFilter;
      const matchesGeography =
        geographyFilter === "All geographies" || row.geography === geographyFilter;

      return matchesQuery && matchesBand && matchesGeography;
    });
  }, [bandFilter, geographyFilter, query]);

  const marketTableRows = filteredRows.map((row) => {
    const current = row.currentCompensation ?? 0;
    const market = row.usMid ?? row.localMid ?? 0;
    const delta = current - market;
    const tone = delta >= 0 ? "good" : "warn";
    const deltaCurrency = `${delta >= 0 ? "+" : "-"}$${Math.abs(Math.round(delta)).toLocaleString("en-US")}`;

    return {
      role: row.jobTitle,
      band: row.band,
      current: formatCurrency(current),
      market: formatCurrency(market),
      p25: formatCurrency(row.usMin),
      p50: formatCurrency(row.usMid),
      p75: formatCurrency(row.usMax),
      delta: deltaCurrency,
      tone,
      trend: delta >= 0 ? "up" : "down",
    };
  });

  return (
    <div className="page-shell">
      <header className="page-head">
        <div>
          <div className="breadcrumb">
            <span>Role Explorer</span>
            <span className="sec-num">03</span>
          </div>
          <h1 className="page-title">Role market explorer</h1>
        </div>
        <div className="page-actions">
          <button className="btn-action">Add filters</button>
          <button className="btn-action primary">Export matrix</button>
        </div>
      </header>

      <div className="filterbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by role, title, or geography"
          aria-label="Search benchmark roles"
        />
        <select value={bandFilter} onChange={(event) => setBandFilter(event.target.value)} aria-label="Filter by band">
          <option>All bands</option>
          <option>L2</option>
          <option>L3</option>
          <option>L4</option>
          <option>L5</option>
        </select>
        <select
          value={geographyFilter}
          onChange={(event) => setGeographyFilter(event.target.value)}
          aria-label="Filter by geography"
        >
          <option>All geographies</option>
          <option>United States</option>
        </select>
        <div className="spacer" />
        <div className="filter-count">
          <strong>{filteredRows.length}</strong> benchmark rows
        </div>
      </div>

      <section className="kpi-grid">
        {roleSummary.map((item) => (
          <div key={item.label} className="kpi-card good">
            <div className="kpi-label">{item.label}</div>
            <div className="kpi-value" style={{ fontSize: "36px" }}>{item.value}</div>
            <div className="kpi-meta">{item.note}</div>
          </div>
        ))}
      </section>

      <div className="card-grid-2">
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Role mix by team</div>
            </div>
            <div className="panel-tag">Population</div>
          </div>

          <div className="team-mix-list">
            {teamMix.map((team) => (
              <div key={team.team} className="team-mix-item">
                <div>
                  <div className="team-name">{team.team}</div>
                  <div className="team-meta">{team.count} employees</div>
                </div>
                <div className="team-avg">{team.avg}</div>
                <div className="team-status">{team.status}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Action summary</div>
            </div>
            <div className="panel-tag">Next</div>
          </div>

          <ul className="summary-list">
            <li>
              <strong>Senior PM</strong> is the most exposed benchmark gap and should be reviewed in the next cycle.
            </li>
            <li>
              <strong>Engineering</strong> remains clustered near market, but a few roles are still below the p50 line.
            </li>
            <li>
              <strong>Revenue</strong> is aligned above market and does not currently indicate a pricing issue.
            </li>
          </ul>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Role benchmark matrix</div>
          </div>
          <div className="panel-tag">Latest sync</div>
        </div>

        <div className="table-wrap">
          <table className="comp-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Band</th>
                <th>Current</th>
                <th>Market</th>
                <th>P25</th>
                <th>P50</th>
                <th>P75</th>
                <th>Delta</th>
              </tr>
            </thead>
            <tbody>
              {marketTableRows.length > 0 ? (
                marketTableRows.map((row) => (
                  <tr key={`${row.role}-${row.band}`}>
                    <td>{row.role}</td>
                    <td>{row.band}</td>
                    <td>{row.current}</td>
                    <td>{row.market}</td>
                    <td>{row.p25}</td>
                    <td>{row.p50}</td>
                    <td>{row.p75}</td>
                    <td className="delta-cell">
                      <div className="delta-wrap">
                        <span className={`delta-trend ${row.trend}`}>{row.trend === "up" ? "▲" : "▼"}</span>
                        <span className={`pill ${row.tone}`}>{row.delta}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "var(--ink-3)" }}>
                    No benchmark rows matched your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
