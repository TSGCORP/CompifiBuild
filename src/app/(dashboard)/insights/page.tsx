import { benchmarkTestRows } from "@/lib/data/compifiBenchmarkTest";

const averageCompa =
  benchmarkTestRows.reduce((sum, row) => sum + (row.usCompaRatio ?? 0), 0) /
  Math.max(benchmarkTestRows.length, 1);

const belowMarketCount = benchmarkTestRows.filter((row) => (row.usCompaRatio ?? 1) < 0.9).length;
const aboveMarketCount = benchmarkTestRows.filter((row) => (row.usCompaRatio ?? 1) > 1.02).length;
const highRiskRoles = benchmarkTestRows
  .filter((row) => (row.usCompaRatio ?? 1) < 0.95)
  .slice(0, 4);

const marketTrendRows = benchmarkTestRows.slice(0, 5).map((row) => ({
  role: row.jobTitle,
  compa: (row.usCompaRatio ?? 1).toFixed(2),
  delta: `${(((row.usCompaRatio ?? 1) - 1) * 100).toFixed(1)}%`,
  signal: (row.usCompaRatio ?? 1) < 0.97 ? "Adjust" : (row.usCompaRatio ?? 1) > 1.05 ? "Ahead" : "Stable",
  tone: (row.usCompaRatio ?? 1) < 0.97 ? "warn" : (row.usCompaRatio ?? 1) > 1.05 ? "good" : "muted",
}));

const recommendations = [
  {
    title: "Tighten market alignment in product and support roles",
    detail: "The benchmark set shows a concentration of compa ratios below 0.97 in service-heavy and product specialist roles, suggesting an operational retention risk.",
    tone: "warn",
  },
  {
    title: "Protect technical leaders with targeted retention actions",
    detail: "Critical technical roles remain near or above market, but the variance signal suggests a need for selective retention and succession planning.",
    tone: "brand",
  },
  {
    title: "Keep the comp cycle disciplined by band",
    detail: "A balanced approach remains optimal: preserve healthy market positioning in revenue and technical leadership while correcting under-market compa bands.",
    tone: "good",
  },
];

export default function InsightsPage() {
  return (
    <div className="page-shell">
      <header className="page-head">
        <div>
          <div className="breadcrumb">
            <span>Insights</span>
            <span className="sec-num">06</span>
          </div>
          <h1 className="page-title">Signals and recommendations</h1>
        </div>
        <div className="page-actions">
          <button className="btn-action">Share brief</button>
          <button className="btn-action primary">Review AI summary</button>
        </div>
      </header>

      <section className="kpi-grid">
        <div className="kpi-card good">
          <div className="kpi-label">Portfolio compa</div>
          <div className="kpi-value">{averageCompa.toFixed(2)}</div>
          <div className="kpi-meta"><span className="delta-up">Live benchmark</span></div>
        </div>
        <div className="kpi-card warn">
          <div className="kpi-label">Below 0.90</div>
          <div className="kpi-value">{belowMarketCount}</div>
          <div className="kpi-meta"><span className="delta-dn">roles signaling risk</span></div>
        </div>
        <div className="kpi-card good">
          <div className="kpi-label">Above 1.02</div>
          <div className="kpi-value">{aboveMarketCount}</div>
          <div className="kpi-meta"><span className="delta-up">market-leading roles</span></div>
        </div>
        <div className="kpi-card alert">
          <div className="kpi-label">Watchlist</div>
          <div className="kpi-value">{highRiskRoles.length}</div>
          <div className="kpi-meta"><span className="delta-dn">priority reviews</span></div>
        </div>
      </section>

      <div className="card-grid-2">
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Executive summary</div>
            </div>
            <div className="panel-tag live">Signal</div>
          </div>

          <div className="watch-list">
            {recommendations.map((item) => (
              <div key={item.title} className="watch-item">
                <span className={`dot ${item.tone === "warn" ? "warn-dot" : item.tone === "brand" ? "brand-dot" : "good-dot"}`} />
                <span>
                  <strong>{item.title}</strong>
                  <br />
                  {item.detail}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Recommended actions</div>
            </div>
            <div className="panel-tag">Next</div>
          </div>

          <ul className="summary-list">
            <li>
              <strong>Review support and product specialist bands</strong> where compa ratios are most compressed.
            </li>
            <li>
              <strong>Prioritize retention planning</strong> for the highest-risk managerial and specialist roles with below-market compa.
            </li>
            <li>
              <strong>Preserve market-leading positioning</strong> in engineering and revenue functions to avoid unnecessary attrition.
            </li>
            <li>
              <strong>Use benchmark deltas as a gate for merit calibration</strong> before the next cycle closes.
            </li>
          </ul>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Market signal table</div>
          </div>
          <div className="panel-tag">Latest</div>
        </div>

        <div className="table-wrap">
          <table className="comp-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Compa</th>
                <th>Delta</th>
                <th>Signal</th>
              </tr>
            </thead>
            <tbody>
              {marketTrendRows.map((row) => {
                const deltaValue = Number.parseFloat(row.delta);

                return (
                  <tr key={row.role}>
                    <td>{row.role}</td>
                    <td>{row.compa}</td>
                    <td className="delta-cell">
                      <div className="delta-wrap">
                        <span className={`delta-trend ${deltaValue >= 0 ? "up" : "down"}`}>{deltaValue >= 0 ? "▲" : "▼"}</span>
                        <span className={`pill ${row.tone}`}>{row.delta}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`pill ${row.tone}`}>{row.signal}</span>
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
