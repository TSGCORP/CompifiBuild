import { benchmarkTestRows } from "@/lib/data/compifiBenchmarkTest";

const flightRiskData = [
  { name: "Maya Chen", risk: "High", team: "Product", score: 88, compa: "1.07", trend: "Market offer pressure" },
  { name: "Evan Ross", risk: "Medium", team: "Engineering", score: 64, compa: "0.96", trend: "Skill concentration risk" },
  { name: "Sofia Nguyen", risk: "High", team: "Customer Success", score: 81, compa: "0.91", trend: "Retention concern" },
  { name: "Jacob Lee", risk: "Low", team: "Finance", score: 32, compa: "1.12", trend: "Stable retention" },
];

const teamRisk = [
  { team: "Engineering", score: 72, label: "Elevated", tone: "warn" },
  { team: "Product", score: 84, label: "Critical", tone: "risk" },
  { team: "Customer Success", score: 76, label: "High", tone: "warn" },
  { team: "Finance", score: 28, label: "Low", tone: "good" },
];

const benchmarkRiskRows = benchmarkTestRows.slice(0, 4).map((row, index) => ({
  name: row.jobTitle,
  risk: (row.usCompaRatio ?? 1) < 0.9 ? "High" : (row.usCompaRatio ?? 1) < 0.97 ? "Medium" : "Low",
  team: ["Engineering", "Product", "Customer Success", "Finance"][index] ?? "Engineering",
  score: Math.max(28, Math.min(92, Math.round(((row.usCompaRatio ?? 1) * 100) + (index * 8)))),
  compa: (row.usCompaRatio ?? 1).toFixed(2),
  trend: (row.usCompaRatio ?? 1) < 0.9 ? "Below market" : "Approaching target",
}));

export default function FlightRiskPage() {
  const riskCards = benchmarkRiskRows.length > 0 ? benchmarkRiskRows : flightRiskData;

  return (
    <div className="page-shell">
      <header className="page-head">
        <div>
          <div className="breadcrumb">
            <span>Flight Risk</span>
            <span className="sec-num">04</span>
          </div>
          <h1 className="page-title">Retention risk analysis</h1>
        </div>
        <div className="page-actions">
          <button className="btn-action">Review notes</button>
          <button className="btn-action primary">Open risk memo</button>
        </div>
      </header>

      <section className="kpi-grid">
        {riskCards.map((person) => (
          <div
            key={person.name}
            className={`kpi-card ${person.risk === "High" ? "alert" : person.risk === "Medium" ? "warn" : "good"}`}
          >
            <div className="kpi-label">{person.team}</div>
            <div className="kpi-value" style={{ fontSize: "32px" }}>{person.name}</div>
            <div className="kpi-meta">
              <span className={`pill ${person.risk === "High" ? "risk" : person.risk === "Medium" ? "warn" : "good"}`}>
                {person.risk}
              </span>
            </div>
            <div style={{ marginTop: 18 }}>
              <div className="bar-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="bar-label">Risk score</div>
                <div className="bar-value">{person.score}</div>
              </div>
              <div className="bar-track" style={{ marginTop: 8 }}>
                <div
                  className={`bar-fill ${person.risk === "High" ? "mint" : person.risk === "Medium" ? "gold" : "green"}`}
                  style={{ width: `${person.score}%` }}
                />
              </div>
              <div className="signal-detail" style={{ marginTop: 10 }}>
                {person.compa} compa · {person.trend}
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="card-grid-2">
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Retention signals</div>
            </div>
            <div className="panel-tag live">Live</div>
          </div>

          <div className="watch-list">
            <div className="watch-item">
              <span className="dot" />
              <span>
                <strong>Product shows the greatest external market pressure</strong>
                <br />
                The highest-risk cohort is concentrated in product leadership and specialist roles where benchmark offers are rising fastest.
              </span>
            </div>
            <div className="watch-item">
              <span className="dot" />
              <span>
                <strong>Compa levels are trending below the retention comfort band</strong>
                <br />
                Several employees in Customer Success and Engineering remain near or below the 0.90 compa threshold, increasing churn risk.
              </span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Action checklist</div>
            </div>
            <div className="panel-tag">Priority</div>
          </div>

          <ul className="summary-list">
            <li>
              <strong>Flag product managers</strong> for targeted retention planning and market alignment reviews.
            </li>
            <li>
              <strong>Reassess CS compensation bands</strong> where compa levels are most compressed.
            </li>
            <li>
              <strong>Review role-level succession risk</strong> in engineering for key specialists with high dependency.
            </li>
          </ul>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Team risk profile</div>
          </div>
          <div className="panel-tag">By function</div>
        </div>

        <div className="risk-bars">
          {teamRisk.map((team) => (
            <div key={team.team} className="bar-row">
              <div className="bar-label">{team.team}</div>
              <div className="bar-track">
                <div
                  className={`bar-fill ${team.tone === "risk" ? "mint" : team.tone === "warn" ? "gold" : "green"}`}
                  style={{ width: `${team.score}%` }}
                />
              </div>
              <div className="bar-value">{team.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
