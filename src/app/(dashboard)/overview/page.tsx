import { formatCurrencyCompact, getTenantOverviewSnapshot } from "@/lib/supabase/queries";

export default async function OverviewPage() {
  const snapshot = await getTenantOverviewSnapshot();

  if (!snapshot.isAuthenticated) {
    return null;
  }

  const summaryCards = [
    { label: "Comp plan spend", value: formatCurrencyCompact(snapshot.totalCompensation), delta: "Live" },
    { label: "Employees in band", value: snapshot.employeeCount.toLocaleString(), delta: "Live" },
    ...(snapshot.averageCompaRatio === null
      ? []
      : [{ label: "Avg. pay position", value: `${snapshot.averageCompaRatio.toFixed(0)}%`, delta: "Live" }]),
  ];
  return (
    <div className="page-shell">
      <header className="page-head">
        <div className="page-head-l">
          <div className="breadcrumb">
            <span>Overview</span>
            <span className="sec-num">01</span>
          </div>
          <h1 className="page-title">
            Compensation intelligence for <em>{snapshot.tenantName ?? "your tenant"}</em>
          </h1>
          <p className="page-sub">
            Pay position, merit variance, and retention signals across the organization are synced to the latest benchmark data.
          </p>
        </div>

        <div className="page-actions">
          <button className="btn-action">Export plan</button>
          <button className="btn-action primary">Update review</button>
        </div>
      </header>

      <section className="kpi-grid">
        {summaryCards.map((card) => (
          <div key={card.label} className={`kpi-card ${card.label.includes("actions") ? "alert" : card.label.includes("Avg") ? "good" : ""}`}>
            <div className="kpi-label">{card.label}</div>
            <div className="kpi-value">{card.value}</div>
            <div className="kpi-meta">
              <span className="delta-up">{card.delta}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="card-grid-2">
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Priority watchlist</div>
            </div>
            <div className="panel-tag">{snapshot.insights.length} active</div>
          </div>

          <div className="watch-list">
            {snapshot.insights.map((insight) => (
              <div key={insight.insightId} className="watch-item">
                <span className="dot" />
                <span>
                  <strong>{insight.headline}</strong>
                  <br />
                  {insight.executiveSummary}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
