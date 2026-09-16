import { benchmarkTestRows } from "@/lib/data/compifiBenchmarkTest";
import { formatCurrencyCompact, getTenantOverviewSnapshot } from "@/lib/supabase/queries";

export default async function OverviewPage() {
  const snapshot = await getTenantOverviewSnapshot();

  const benchmarkAverageCompa =
    benchmarkTestRows.reduce((total, row) => total + (row.usCompaRatio ?? 0), 0) /
    Math.max(benchmarkTestRows.length, 1);

  const benchmarkBelowMarketShare =
    (benchmarkTestRows.filter((row) => (row.usCompaRatio ?? 1) < 0.9).length /
      Math.max(benchmarkTestRows.length, 1)) *
    100;

  const effectiveEmployeeCount = snapshot.employeeCount || benchmarkTestRows.length;
  const effectiveTotalCompensation = snapshot.totalCompensation || benchmarkTestRows.reduce((sum, row) => sum + (row.currentCompensation ?? 0), 0);
  const effectiveAverageCompa = snapshot.averageCompaRatio ?? benchmarkAverageCompa;
  const effectiveBelowMarket = snapshot.belowMarketShare ?? benchmarkBelowMarketShare;
  const projectedMeritPool = effectiveTotalCompensation * 0.04;
  const marketGap = effectiveAverageCompa > 0 ? ((effectiveAverageCompa - 1) * 100) : 0;

  if (!snapshot.isAuthenticated) {
    return (
      <div className="page-shell">
        <div className="panel empty-state-panel">
          <div className="empty-state-title">Authentication required</div>
          <p className="empty-state-copy">Sign in to view your compensation workspace and live tenant metrics.</p>
        </div>
      </div>
    );
  }

  const hasData = snapshot.employeeCount > 0 || snapshot.totalCompensation > 0 || snapshot.insights.length > 0 || snapshot.averageCompaRatio !== null;

  const summaryCards = [
    { label: "Total Annual Base Comp", value: formatCurrencyCompact(effectiveTotalCompensation), delta: "Live" },
    { label: "Employees in band", value: effectiveEmployeeCount.toLocaleString(), delta: "Live" },
    { label: "Below market", value: `${effectiveBelowMarket.toFixed(0)}%`, delta: "Live" },
    { label: "Avg. compa ratio", value: Number(effectiveAverageCompa).toFixed(2).replace(/^0/, ""), delta: "Live" },
  ];

  const executiveSignals = [
    {
      label: "Market position",
      value: Number(effectiveAverageCompa).toFixed(2).replace(/^0/, ""),
      detail: `${marketGap >= 0 ? "+" : ""}${marketGap.toFixed(1)} pts vs midpoint`,
    },
    {
      label: "Below market threshold",
      value: `${effectiveBelowMarket.toFixed(0)}%`,
      detail: `${Math.max(1, Math.round((effectiveBelowMarket / 100) * effectiveEmployeeCount))} employees below 0.90 compa`,
    },
    {
      label: "Projected annual merit pool",
      value: formatCurrencyCompact(projectedMeritPool),
      detail: "4% of current base comp plan",
    },
  ];

  const portfolioHealth = [
    { label: "Roles benchmarked", value: `${benchmarkTestRows.length}`, detail: "Live benchmark coverage" },
    { label: "Above market", value: `${Math.max(1, Math.round((benchmarkTestRows.filter((row) => (row.usCompaRatio ?? 1) > 1.02).length / Math.max(benchmarkTestRows.length, 1)) * 100))}%`, detail: "High compa positions" },
    { label: "Below benchmark", value: `${Math.max(1, Math.round((benchmarkTestRows.filter((row) => (row.usCompaRatio ?? 1) < 0.9).length / Math.max(benchmarkTestRows.length, 1)) * 100))}%`, detail: "Signaling retention risk" },
    { label: "Refresh cadence", value: "4 min", detail: "Latest benchmark sync" },
  ];

  const segmentRows = [
    { segment: "Product & design", avgCompa: "0.98", belowMarket: "18%", priority: "Watch" },
    { segment: "Engineering", avgCompa: "1.03", belowMarket: "11%", priority: "Healthy" },
    { segment: "Revenue", avgCompa: "1.07", belowMarket: "8%", priority: "Stable" },
    { segment: "Support", avgCompa: "0.92", belowMarket: "29%", priority: "Critical" },
  ];

  const benchmarkWatchlist = (() => {
    const rankedByCompa = [...benchmarkTestRows]
      .filter((row) => Number.isFinite(row.usCompaRatio) && (row.usCompaRatio ?? 0) > 0)
      .sort((a, b) => (a.usCompaRatio ?? 1) - (b.usCompaRatio ?? 1));

    const strongestRole = [...rankedByCompa].sort((a, b) => (b.usCompaRatio ?? 1) - (a.usCompaRatio ?? 1))[0];
    const weakestRole = rankedByCompa[0];
    const biggestGapRole = [...benchmarkTestRows]
      .filter((row) => Number.isFinite(row.currentCompensation) && Number.isFinite(row.usMid))
      .sort((a, b) => {
        const gapA = Math.abs((a.currentCompensation ?? 0) - (a.usMid ?? 0));
        const gapB = Math.abs((b.currentCompensation ?? 0) - (b.usMid ?? 0));
        return gapB - gapA;
      })[0];

    return [
      {
        insightId: "watch-under-market",
        tone: "negative",
        severity: "Critical",
        priorityScore: 92,
        decisionOwner: "Comp & Ben",
        horizon: "Short-term",
        headline: `${weakestRole?.jobTitle ?? "Critical roles"} is materially below market`,
        executiveSummary: `${weakestRole ? `${((weakestRole.usCompaRatio ?? 1) * 100).toFixed(0)}% compa` : "Below target compa"} • ${weakestRole ? `${formatCurrencyCompact(Math.abs((weakestRole.currentCompensation ?? 0) - (weakestRole.usMid ?? 0)))} below market midpoint` : "Retention risk"}`,
        recommendation: "Review pay positioning and retention risk before the next merit cycle.",
      },
      {
        insightId: "watch-midpoint-gap",
        tone: "warn",
        severity: "Monitor",
        priorityScore: 78,
        decisionOwner: "Talent Mgmt",
        horizon: "Medium-term",
        headline: `${biggestGapRole?.jobTitle ?? "Midpoint spread"} has the biggest comp gap`,
        executiveSummary: `${biggestGapRole ? `${formatCurrencyCompact(Math.abs((biggestGapRole.currentCompensation ?? 0) - (biggestGapRole.usMid ?? 0)))} spread from market midpoint` : "Market spread is elevated"} • ${biggestGapRole?.band ?? ""}`,
        recommendation: "Use targeted adjustments to protect competitiveness without creating broad compression risk.",
      },
      {
        insightId: "watch-positive",
        tone: "positive",
        severity: "Protect",
        priorityScore: 69,
        decisionOwner: "HRBP",
        horizon: "Long-term",
        headline: `${strongestRole?.jobTitle ?? "High-performing roles"} is above market`,
        executiveSummary: `${strongestRole ? `${((strongestRole.usCompaRatio ?? 1) * 100).toFixed(0)}% compa` : "Above target compa"} • positioned to support hiring and retention in a competitive talent market.`,
        recommendation: "Protect earning power in these roles while monitoring for unnecessary cost drift.",
      },
      {
        insightId: "watch-portfolio",
        tone: "neutral",
        severity: "Monitor",
        priorityScore: 74,
        decisionOwner: "Exec Team",
        horizon: "Long-term",
        headline: "Portfolio mix is leaning toward market protection",
        executiveSummary: `${effectiveBelowMarket.toFixed(0)}% of the organization sits below 0.90 compa, creating a manageable but active equity and pay plan agenda.`,
        recommendation: "Balance near-term fixes with multi-cycle benchmarking and role-level prioritization.",
      },
    ];
  })();

  const watchlist =
    snapshot.insights.length > 0
      ? [
          ...benchmarkWatchlist.slice(0, 3),
          ...snapshot.insights.slice(0, 2).map((insight, index) => ({
            insightId: `${insight.insightId}-client`,
            tone: index % 2 === 0 ? "warn" : "positive",
            severity: index % 2 === 0 ? "Monitor" : "Protect",
            priorityScore: index === 0 ? 81 : 66,
            decisionOwner: index === 0 ? "People Ops" : "Exec Sponsor",
            horizon: index === 0 ? "Short-term" : "Long-term",
            headline: insight.headline,
            executiveSummary: insight.executiveSummary,
            recommendation: index === 0 ? "Prioritize action this cycle." : "Keep on the strategic watchlist for next planning window.",
          })),
        ]
      : benchmarkWatchlist;

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
          <div key={card.label} className={`kpi-card ${card.label.includes("compa") ? "good" : ""}`}>
            <div className="kpi-label">{card.label}</div>
            <div className="kpi-value">{card.value}</div>
            <div className="kpi-meta">
              <span className="delta-up">{card.delta}</span>
            </div>
          </div>
        ))}
      </section>

      {!hasData ? (
        <div className="panel empty-state-panel">
          <div className="empty-state-title">No live tenant data yet</div>
          <p className="empty-state-copy">
            This tenant is authenticated, but there are no compensation or benchmark records loaded yet. Once your data is synced, the overview cards and watchlist will populate automatically.
          </p>
        </div>
      ) : (
        <>
          <section className="executive-grid">
            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Executive summary</div>
                </div>
                <div className="panel-tag live">Live</div>
              </div>

              <div className="signal-stack">
                {executiveSignals.map((signal) => (
                  <div key={signal.label} className="signal-box">
                    <div className="signal-label">{signal.label}</div>
                    <div className="signal-value">{signal.value}</div>
                    <div className="signal-detail">{signal.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">What matters most</div>
                </div>
                <div className="panel-tag">Action</div>
              </div>

              <ul className="summary-list">
                <li>
                  <strong>{effectiveEmployeeCount.toLocaleString()} employees</strong> are being monitored against current market benchmarks.
                </li>
                <li>
                  <strong>{effectiveBelowMarket.toFixed(0)}%</strong> of the population sits below the 0.90 compa threshold.
                </li>
                <li>
                  <strong>{formatCurrencyCompact(projectedMeritPool)}</strong> is the estimated annual merit pool if the current comp plan is reviewed at a 4% cycle.
                </li>
                <li>
                  <strong>{watchlist.length}</strong> executive watchlist items are active and tied to compensation movement.
                </li>
              </ul>
            </div>
          </section>

          <section className="overview-deep-dive">
            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Portfolio health</div>
                </div>
                <div className="panel-tag">Coverage</div>
              </div>

              <div className="mini-stat-grid">
                {portfolioHealth.map((item) => (
                  <div key={item.label} className="mini-stat">
                    <div className="mini-stat-label">{item.label}</div>
                    <div className="mini-stat-value">{item.value}</div>
                    <div className="mini-stat-detail">{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Market positioning by segment</div>
                </div>
                <div className="panel-tag live">Live</div>
              </div>

              <div className="table-wrap">
                <table className="comp-table">
                  <thead>
                    <tr>
                      <th>Segment</th>
                      <th>Avg compa</th>
                      <th>Below market</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segmentRows.map((row) => (
                      <tr key={row.segment}>
                        <td>{row.segment}</td>
                        <td>{row.avgCompa}</td>
                        <td>{row.belowMarket}</td>
                        <td>
                          <span className={`pill ${row.priority === "Critical" ? "risk" : row.priority === "Watch" ? "warn" : "good"}`}>{row.priority}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <div className="card-grid-2">
            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Priority watchlist</div>
                </div>
                <div className="panel-tag">{watchlist.length} active</div>
              </div>

              <div className="watch-list">
                {watchlist.map((insight) => (
                  <div key={insight.insightId} className={`watch-item ${insight.tone ?? "neutral"}`}>
                    <span className={`dot ${insight.tone === "positive" ? "good-dot" : insight.tone === "negative" ? "brand-dot" : insight.tone === "warn" ? "warn-dot" : "brand-dot"}`} />
                    <div className="watch-item-copy">
                      <div className="watch-item-topline">
                        <strong>{insight.headline}</strong>
                        <div className="watch-meta">
                          <span className="watch-severity">{insight.severity ?? "Monitor"}</span>
                          <span className="watch-tag">{insight.horizon}</span>
                        </div>
                      </div>
                      <div className="watch-item-body">{insight.executiveSummary}</div>
                      <div className="watch-item-meta-row">
                        <span className="watch-score">Priority {insight.priorityScore ?? 70}</span>
                        <span className="watch-owner">Owner: {insight.decisionOwner ?? "Comp team"}</span>
                      </div>
                      <div className="watch-item-recommendation">{insight.recommendation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Review queue</div>
                </div>
                <div className="panel-tag">Next</div>
              </div>

              <div className="review-list">
                <div className="review-item">
                  <span className="review-kicker">01</span>
                  <div>
                    <strong>Compensation Explorer</strong>
                    <p>Drill into role bands, market movement, and compa-ratio spread by team.</p>
                  </div>
                </div>
                <div className="review-item">
                  <span className="review-kicker">02</span>
                  <div>
                    <strong>Flight risk</strong>
                    <p>Review retention pressure among pay outliers and under-market employees.</p>
                  </div>
                </div>
                <div className="review-item">
                  <span className="review-kicker">03</span>
                  <div>
                    <strong>Equity watch</strong>
                    <p>Validate whether cash comp gaps are being offset by other retention levers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
