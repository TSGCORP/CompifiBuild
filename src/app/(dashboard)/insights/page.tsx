const insightCards = [
  {
    title: "Comp drift by function",
    description: "Product and Sales remain ahead of benchmark by 2.8% and 3.1% respectively.",
    tone: "brand",
  },
  {
    title: "Best retention levers",
    description: "Targeted cash adjustments could reduce flight risk in three high-impact teams.",
    tone: "warn",
  },
  {
    title: "Equity efficiency",
    description: "Grant approvals improved utilization while preserving run-rate discipline.",
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
            <span className="sec-num">05</span>
          </div>
          <h1 className="page-title">Signals and recommendations</h1>
        </div>
        <div className="page-actions">
          <button className="btn-action">Share brief</button>
          <button className="btn-action primary">Review AI summary</button>
        </div>
      </header>

      <div className="card-grid-3">
        {insightCards.map((card) => (
          <article key={card.title} className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">{card.title}</div>
              </div>
              <div className={`panel-tag ${card.tone === "brand" ? "live" : ""}`}>
                {card.tone === "brand" ? "Signal" : card.tone === "warn" ? "Risk" : "Health"}
              </div>
            </div>
            <p className="page-sub" style={{ marginTop: 0 }}>{card.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
