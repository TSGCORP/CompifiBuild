"use client";

import { useMemo, useState } from "react";
import { benchmarkTestRows } from "@/lib/data/compifiBenchmarkTest";

const benchmarkCards = [
  { label: "Source health", value: "98.4%", note: "Salary.com sync stability" },
  { label: "Median salary delta", value: "+3.1%", note: "vs last benchmark set" },
  { label: "Roles mapped", value: "37", note: "benchmark rows in active dataset" },
  { label: "Last refresh", value: "4 min ago", note: "Q3 2026 benchmark cycle" },
];

const jobOptions = Array.from(new Set(benchmarkTestRows.map((row) => row.jobTitle))).sort();
const geographyOptions = Array.from(new Set(benchmarkTestRows.map((row) => row.geography))).sort();

function formatCurrency(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export default function BenchmarkingPage() {
  const [selectedJob, setSelectedJob] = useState(jobOptions[0] ?? "Network Engineer");
  const [selectedGeography, setSelectedGeography] = useState(geographyOptions[0] ?? "United States");

  const filteredRows = useMemo(() => {
    return benchmarkTestRows.filter(
      (row) => row.jobTitle === selectedJob && row.geography === selectedGeography,
    );
  }, [selectedGeography, selectedJob]);

  const selectedRow = filteredRows[0] ?? benchmarkTestRows[0];

  const marketSummary = [
    { label: "P25", value: formatCurrency(selectedRow.usMin) },
    { label: "P50", value: formatCurrency(selectedRow.usMid) },
    { label: "P75", value: formatCurrency(selectedRow.usMax) },
  ];

  const benchmarkRows = benchmarkTestRows.slice(0, 5).map((row) => {
    const market = row.usMid ?? 0;
    const current = row.currentCompensation ?? 0;
    const deltaAmount = current - market;
    const delta = `${deltaAmount >= 0 ? "+" : "-"}$${Math.abs(Math.round(deltaAmount)).toLocaleString("en-US")}`;

    return {
      role: row.jobTitle,
      market: formatCurrency(row.usMid),
      p75: formatCurrency(row.usMax),
      region: row.geography,
      updated: "4 min ago",
      delta,
      tone: deltaAmount >= 0 ? "good" : "warn",
      trend: deltaAmount >= 0 ? "up" : "down",
    };
  });

  const benchmarkShiftRows = benchmarkTestRows.slice(0, 5).map((row) => {
    const currentMarket = row.usMid ?? 0;
    const priorMarket = currentMarket / Math.max(1 + (row.marketBonusPct ?? 0.04), 1.01);
    const shiftPct = ((currentMarket - priorMarket) / Math.max(priorMarket, 1)) * 100;
    const shiftText = `${shiftPct >= 0 ? "+" : ""}${shiftPct.toFixed(1)}%`;

    return {
      role: row.jobTitle,
      previous: formatCurrency(priorMarket),
      current: formatCurrency(currentMarket),
      shift: shiftText,
      tone: shiftPct >= 0 ? "good" : "warn",
      trend: shiftPct >= 0 ? "up" : "down",
      impact: shiftPct >= 0 ? "Comp pressure rising" : "Market cooling",
    };
  });

  const employeeMarketRows = benchmarkTestRows.slice(0, 4).map((row) => ({
    employee: row.jobTitle,
    salary: formatCurrency(row.currentCompensation),
    market: formatCurrency(row.usMid),
    compa: (row.usCompaRatio ?? 1).toFixed(2),
    range: `${formatCurrency(row.usMin)}-${formatCurrency(row.usMax)}`,
    status: (row.usCompaRatio ?? 1) >= 0.97 ? "At target" : "Below market",
    tone: (row.usCompaRatio ?? 1) >= 0.97 ? "good" : "warn",
  }));

  const internalRangeRows = benchmarkTestRows.slice(0, 3).map((row) => ({
    employee: row.jobTitle,
    salary: formatCurrency(row.currentCompensation),
    bandMin: formatCurrency(row.localMin),
    bandMid: formatCurrency(row.localMid),
    bandMax: formatCurrency(row.localMax),
    position: row.usCompaRatio && row.usCompaRatio >= 1 ? "Above midpoint" : "Low end",
    tone: row.usCompaRatio && row.usCompaRatio >= 1 ? "good" : "warn",
  }));

  const equityOutliers = [
    { employee: "Maya Chen", team: "Product", gap: "+12.4%", reason: "Leadership premium / market pressure", tone: "warn" },
    { employee: "Jacob Lee", team: "Finance", gap: "-8.1%", reason: "Below-band comp positioning", tone: "risk" },
    { employee: "Sofia Nguyen", team: "Customer Success", gap: "+9.9%", reason: "High internal compression risk", tone: "warn" },
  ];

  const sourceList = [
    { name: "Salary.com", status: "Connected", tone: "good" },
    { name: "Market pay files", status: "Queued", tone: "warn" },
    { name: "Compensation taxonomy", status: "Synced", tone: "good" },
  ];

  return (
    <div className="page-shell">
      <header className="page-head">
        <div>
          <div className="breadcrumb">
            <span>Benchmarking</span>
            <span className="sec-num">02</span>
          </div>
          <h1 className="page-title">Market benchmarking</h1>
        </div>
        <div className="page-actions">
          <button className="btn-action">Customize pull</button>
          <button className="btn-action primary">Export data</button>
        </div>
      </header>

      <section className="benchmark-layout">
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Benchmark a real job</div>
            </div>
            <div className="panel-tag live">Live</div>
          </div>

          <div className="config-grid">
            <label className="field">
              <span>Job title</span>
              <select value={selectedJob} onChange={(event) => setSelectedJob(event.target.value)}>
                {jobOptions.map((job) => (
                  <option key={job} value={job}>
                    {job}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Geography</span>
              <select value={selectedGeography} onChange={(event) => setSelectedGeography(event.target.value)}>
                {geographyOptions.map((geo) => (
                  <option key={geo} value={geo}>
                    {geo}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Department</span>
              <select defaultValue="engineering">
                <option value="engineering">Engineering</option>
                <option value="product">Product</option>
                <option value="sales">Sales</option>
                <option value="finance">Finance</option>
              </select>
            </label>

            <label className="field">
              <span>Job family</span>
              <select defaultValue="software-engineering">
                <option value="software-engineering">Software engineering</option>
                <option value="product-management">Product management</option>
                <option value="sales">Sales</option>
                <option value="finance">Finance</option>
              </select>
            </label>

            <label className="field">
              <span>Dataset</span>
              <select defaultValue="salary-com">
                <option value="salary-com">Salary.com</option>
                <option value="mercer">Mercer</option>
                <option value="radford">Radford</option>
              </select>
            </label>

            <label className="field">
              <span>Refresh</span>
              <select defaultValue="daily">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
          </div>
        </div>

        <aside className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Data source</div>
            </div>
            <div className="panel-tag">Secure</div>
          </div>

          <div className="status-stack">
            <div className="status-row">
              <span className="status-label">Benchmark API</span>
              <span className="status-chip good">Connected</span>
            </div>
            <div className="status-row">
              <span className="status-label">Last load</span>
              <span className="status-chip warn">4 min ago</span>
            </div>
            <div className="status-row">
              <span className="status-label">Taxonomy match</span>
              <span className="status-chip good">92%</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="kpi-grid">
        {benchmarkCards.map((item) => (
          <div key={item.label} className="kpi-card good">
            <div className="kpi-label">{item.label}</div>
            <div className="kpi-value" style={{ fontSize: "36px" }}>{item.value}</div>
            <div className="kpi-meta">{item.note}</div>
          </div>
        ))}
      </section>

      <div className="panel demo-panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Market distribution</div>
          </div>
          <div className="panel-tag">P25 / P50 / P75</div>
        </div>

        <div className="market-range-grid">
          {marketSummary.map((point) => (
            <div key={point.label} className="range-card">
              <div className="range-label">{point.label}</div>
              <div className="range-value">{point.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-grid-2">
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Employee vs. market</div>
            </div>
            <div className="panel-tag">Drill to employee</div>
          </div>

          <div className="table-wrap">
            <table className="comp-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Salary</th>
                  <th>Market</th>
                  <th>Compa</th>
                  <th>Range</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {employeeMarketRows.map((row) => (
                  <tr key={row.employee}>
                    <td>{row.employee}</td>
                    <td>{row.salary}</td>
                    <td>{row.market}</td>
                    <td>{row.compa}</td>
                    <td>{row.range}</td>
                    <td>
                      <span className="status-inline">
                        <span className={`status-dot ${row.tone}`} />
                        <span className={`pill ${row.tone}`}>{row.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Employee vs. internal range</div>
            </div>
            <div className="panel-tag">Band</div>
          </div>

          <div className="table-wrap">
            <table className="comp-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Salary</th>
                  <th>Min</th>
                  <th>Mid</th>
                  <th>Max</th>
                  <th>Position</th>
                </tr>
              </thead>
              <tbody>
                {internalRangeRows.map((row) => (
                  <tr key={row.employee}>
                    <td>{row.employee}</td>
                    <td>{row.salary}</td>
                    <td>{row.bandMin}</td>
                    <td>{row.bandMid}</td>
                    <td>{row.bandMax}</td>
                    <td>
                      <span className="status-inline">
                        <span className={`status-dot ${row.tone}`} />
                        <span className={`pill ${row.tone}`}>{row.position}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Market movement</div>
          </div>
          <div className="panel-tag">vs prior cycle</div>
        </div>

        <div className="table-wrap">
          <table className="comp-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Previous</th>
                <th>Current</th>
                <th>Shift</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              {benchmarkShiftRows.map((row) => (
                <tr key={row.role}>
                  <td>{row.role}</td>
                  <td>{row.previous}</td>
                  <td>{row.current}</td>
                  <td>
                    <span className={`pill ${row.tone}`}>{row.shift}</span>
                  </td>
                  <td>{row.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Benchmark matrix</div>
          </div>
          <div className="panel-tag">Latest</div>
        </div>

        <div className="table-wrap">
          <table className="comp-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Market</th>
                <th>P75</th>
                <th>Region</th>
                <th>Updated</th>
                <th>Delta</th>
              </tr>
            </thead>
            <tbody>
              {benchmarkRows.map((row) => (
                <tr key={row.role}>
                  <td>{row.role}</td>
                  <td>{row.market}</td>
                  <td>{row.p75}</td>
                  <td>{row.region}</td>
                  <td>{row.updated}</td>
                  <td className="delta-cell">
                    <div className="delta-wrap">
                      <span className={`delta-trend ${row.trend}`}>{row.trend === "up" ? "▲" : "▼"}</span>
                      <span className={`pill ${row.tone}`}>{row.delta}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-grid-2">
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Pay-equity outliers</div>
            </div>
            <div className="panel-tag">Review</div>
          </div>

          <div className="table-wrap">
            <table className="comp-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Team</th>
                  <th>Gap</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {equityOutliers.map((row) => (
                  <tr key={row.employee}>
                    <td>{row.employee}</td>
                    <td>{row.team}</td>
                    <td>
                      <span className={`pill ${row.tone}`}>{row.gap}</span>
                    </td>
                    <td>{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Where benchmark data comes from</div>
            </div>
            <div className="panel-tag">Source</div>
          </div>

          <div className="source-card-list">
            <div className="source-card">
              <strong>Salary.com</strong>
              <p>Primary live benchmark feed for role-based market pricing, geography adjustments, and compensation curve anchors.</p>
            </div>
            <div className="source-card">
              <strong>Client taxonomy mapping</strong>
              <p>Internal job families and departments are mapped to external benchmark titles to normalize current market comparisons.</p>
            </div>
            <div className="source-card">
              <strong>Refresh pipeline</strong>
              <p>Daily syncs update range data, and companies can review the selected benchmark cycle before applying it to employee-level decisions.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Connected data sources</div>
          </div>
          <div className="panel-tag">Status</div>
        </div>

        <div className="watch-list">
          {sourceList.map((source) => (
            <div key={source.name} className="watch-item">
              <span className="dot" />
              <span>
                <strong>{source.name}</strong>
                <br />
                <span className={`pill ${source.tone === "warn" ? "warn" : "good"}`}>{source.status}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
