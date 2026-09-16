import { benchmarkTestRows } from "@/lib/data/compifiBenchmarkTest";

const payEquityData = [
  { title: "Overall pay gap", value: "2.8%", trend: "Below policy", tone: "good" },
  { title: "Highest variance", value: "12.4%", trend: "Engineering", tone: "warn" },
  { title: "Review cases", value: "14", trend: "+2 this cycle", tone: "warn" },
  { title: "Adjusted compa", value: "0.97", trend: "Within band", tone: "good" },
];

const payGapRows = [
  { team: "Engineering", median: "0.99", gap: "3.2%", status: "Healthy", tone: "good" },
  { team: "Sales", median: "1.04", gap: "6.4%", status: "Monitor", tone: "warn" },
  { team: "Support", median: "0.92", gap: "-2.1%", status: "Under market", tone: "risk" },
  { team: "Product", median: "1.01", gap: "1.8%", status: "Healthy", tone: "good" },
];

const benchmarkPayGapRows = benchmarkTestRows.slice(0, 4).map((row, index) => ({
  team: ["Engineering", "Product", "Sales", "Support"][index] ?? "Engineering",
  median: (row.usCompaRatio ?? 1).toFixed(2),
  gap: `${(((row.usCompaRatio ?? 1) - 1) * 100).toFixed(1)}%`,
  status: (row.usCompaRatio ?? 1) >= 0.97 ? "Healthy" : (row.usCompaRatio ?? 1) >= 0.9 ? "Monitor" : "Under market",
  tone: (row.usCompaRatio ?? 1) >= 0.97 ? "good" : (row.usCompaRatio ?? 1) >= 0.9 ? "warn" : "risk",
}));

export default function EquityPage() {
  return (
    <div className="page-shell">
      <header className="page-head">
        <div>
          <div className="breadcrumb">
            <span>Pay Equity</span>
            <span className="sec-num">05</span>
          </div>
          <h1 className="page-title">Pay equity overview</h1>
        </div>
        <div className="page-actions">
          <button className="btn-action">Review adjustments</button>
          <button className="btn-action primary">Export report</button>
        </div>
      </header>

      <section className="kpi-grid">
        {payEquityData.map((item) => (
          <div
            key={item.title}
            className={`kpi-card ${item.tone === "warn" ? "warn" : "good"}`}
          >
            <div className="kpi-label">{item.title}</div>
            <div className="kpi-value">{item.value}</div>
            <div className="kpi-meta">
              <span className={item.tone === "warn" ? "delta-dn" : "delta-up"}>{item.trend}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="card-grid-2">
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Pay equity summary</div>
            </div>
            <div className="panel-tag live">Live</div>
          </div>

          <div className="watch-list">
            <div className="watch-item">
              <span className="dot" />
              <span>
                <strong>Overall pay gap remains within policy threshold</strong>
                <br />
                The current workforce median gap sits at 2.8%, which is comfortably below the internal alert threshold of 5%.
              </span>
            </div>
            <div className="watch-item">
              <span className="dot" />
              <span>
                <strong>Engineering holds the largest variance</strong>
                <br />
                That function is still 12.4% above the team median, which indicates a need for targeted review in senior technical roles.
              </span>
            </div>
            <div className="watch-item">
              <span className="dot" />
              <span>
                <strong>Support remains under market</strong>
                <br />
                Support is showing a negative gap relative to benchmark, suggesting a retention risk if attrition continues to rise.
              </span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Action priorities</div>
            </div>
            <div className="panel-tag">Next</div>
          </div>

          <ul className="summary-list">
            <li>
              <strong>Review engineering comp bands</strong> for manager and senior IC roles where variance is highest.
            </li>
            <li>
              <strong>Rebalance Support pay positioning</strong> to reduce under-market pressure in frontline roles.
            </li>
            <li>
              <strong>Lock the cycle timing</strong> so compensation corrections are routed before the next merit review window.
            </li>
          </ul>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Fairness review matrix</div>
          </div>
          <div className="panel-tag">By function</div>
        </div>

        <div className="table-wrap">
          <table className="comp-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>Median compa</th>
                <th>Gap vs benchmark</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(benchmarkPayGapRows.length > 0 ? benchmarkPayGapRows : payGapRows).map((row) => {
                const isPositive = Number.parseFloat(row.gap) >= 0;

                return (
                  <tr key={row.team}>
                    <td>{row.team}</td>
                    <td>{row.median}</td>
                    <td className="delta-cell">
                      <div className="delta-wrap">
                        <span className={`delta-trend ${isPositive ? "up" : "down"}`}>{isPositive ? "▲" : "▼"}</span>
                        <span className={`pill ${row.tone}`}>{row.gap}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`pill ${row.tone}`}>{row.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
