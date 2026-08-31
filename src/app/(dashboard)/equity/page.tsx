const equityData = [
  { title: "Option pool utilization", value: "68%", trend: "+4.1 pts" },
  { title: "New grant approvals", value: "12", trend: "+3" },
  { title: "Refresh cycle health", value: "86%", trend: "+9" },
  { title: "Equity runway", value: "18 mo", trend: "On track" },
];

export default function EquityPage() {
  return (
    <div className="page-shell">
      <header className="page-head">
        <div>
          <div className="breadcrumb">
            <span>Equity</span>
            <span className="sec-num">04</span>
          </div>
          <h1 className="page-title">Equity and grants</h1>
        </div>
        <div className="page-actions">
          <button className="btn-action">Manage grants</button>
          <button className="btn-action primary">Approve cycle</button>
        </div>
      </header>

      <section className="kpi-grid">
        {equityData.map((item) => (
          <div key={item.title} className="kpi-card good">
            <div className="kpi-label">{item.title}</div>
            <div className="kpi-value">{item.value}</div>
            <div className="kpi-meta">
              <span className="delta-up">{item.trend}</span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
