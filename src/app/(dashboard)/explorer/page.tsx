const employees = [
  { name: "Alicia Mendez", role: "VP, Revenue", band: "L5", comp: "$255k", status: "At target", tone: "good" },
  { name: "Darius Kim", role: "Senior PM", band: "L4", comp: "$198k", status: "Market lead", tone: "good" },
  { name: "Imani Patel", role: "Director, Finance", band: "L5", comp: "$232k", status: "Below band", tone: "warn" },
  { name: "Noah Singh", role: "Staff Engineer", band: "L4", comp: "$188k", status: "At target", tone: "good" },
  { name: "Sofia Nguyen", role: "Customer Success Mgr", band: "L3", comp: "$141k", status: "Risk", tone: "risk" },
];

export default function ExplorerPage() {
  return (
    <div className="page-shell">
      <header className="page-head">
        <div>
          <div className="breadcrumb">
            <span>Explorer</span>
            <span className="sec-num">02</span>
          </div>
          <h1 className="page-title">Compensation explorer</h1>
        </div>
        <div className="page-actions">
          <button className="btn-action">Add filters</button>
          <button className="btn-action primary">Export matrix</button>
        </div>
      </header>

      <div className="filterbar">
        <input defaultValue="Search by employee or team" aria-label="Search employees" />
        <select aria-label="Filter by team">
          <option>All teams</option>
          <option>Product</option>
          <option>Engineering</option>
          <option>Revenue</option>
        </select>
        <select aria-label="Filter by band">
          <option>All bands</option>
          <option>L3</option>
          <option>L4</option>
          <option>L5</option>
        </select>
        <div className="spacer" />
        <div className="filter-count">
          <strong>5</strong> records
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Employee compensation matrix</div>
          </div>
          <div className="panel-tag">Latest sync</div>
        </div>

        <div className="table-wrap">
          <table className="comp-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Band</th>
                <th>Comp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.name}>
                  <td>
                    <div className="name-cell">
                      <div className="avatar">{employee.name.slice(0, 1)}</div>
                      <div>
                        <div>{employee.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>{employee.role}</td>
                  <td>{employee.band}</td>
                  <td>{employee.comp}</td>
                  <td>
                    <span className={`pill ${employee.tone}`}>{employee.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
