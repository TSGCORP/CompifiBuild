const flightRiskData = [
  { name: "Maya Chen", risk: "High", team: "Product", score: 88 },
  { name: "Evan Ross", risk: "Medium", team: "Engineering", score: 64 },
  { name: "Sofia Nguyen", risk: "High", team: "Customer Success", score: 81 },
  { name: "Jacob Lee", risk: "Low", team: "Finance", score: 32 },
];

export default function FlightRiskPage() {
  return (
    <div className="page-shell">
      <header className="page-head">
        <div>
          <div className="breadcrumb">
            <span>Flight Risk</span>
            <span className="sec-num">03</span>
          </div>
          <h1 className="page-title">Retention risk analysis</h1>
        </div>
        <div className="page-actions">
          <button className="btn-action">Review notes</button>
          <button className="btn-action primary">Open risk memo</button>
        </div>
      </header>

      <div className="kpi-grid">
        {flightRiskData.map((person) => (
          <div key={person.name} className={`kpi-card ${person.risk === "High" ? "alert" : person.risk === "Medium" ? "warn" : "good"}`}>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
