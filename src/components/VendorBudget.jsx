import { useState } from "react";

const COLORS = ["var(--accent2)", "var(--teal)", "var(--gold)", "var(--coral)", "#a78bfa", "#34d399"];

export default function VendorBudget({ eventData, aiResults, setAiResults, expenses, setExpenses }) {
  const [expForm, setExpForm] = useState({ category: "", description: "", amount: "" });

  if (!eventData) return (
    <div className="empty">
      <div className="empty-icon">◈</div>
      <div className="empty-text">Create an event first to see vendor & budget suggestions</div>
    </div>
  );

  const addExpense = () => {
    if (!expForm.category || !expForm.amount) return;
    setExpenses(e => [...e, { ...expForm, id: Date.now(), amount: Number(expForm.amount) }]);
    setExpForm({ category: "", description: "", amount: "" });
  };

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const budget = aiResults?.budget?.total || Number(eventData.budgetMax) || 0;
  const utilPct = budget ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;

  return (
    <div>
      <div className="section-header">
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-teal">Step 02</span>
          {!aiResults && <span className="badge badge-coral">No AI data yet — generate from Event form</span>}
        </div>
        <h1 className="section-title">Vendors & Budget</h1>
        <p className="section-sub">AI-suggested vendors and smart budget allocation</p>
      </div>

      <div className="grid-4 mb-3">
        <div className="stat-card">
          <div className="stat-label">Total Budget</div>
          <div className="stat-value" style={{ fontSize: "20px" }}>₹{Number(budget).toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Spent</div>
          <div className="stat-value" style={{ fontSize: "20px", color: totalSpent > budget ? "var(--coral)" : "var(--teal)" }}>₹{totalSpent.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Remaining</div>
          <div className="stat-value" style={{ fontSize: "20px" }}>₹{Math.max(0, budget - totalSpent).toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Utilization</div>
          <div className="stat-value" style={{ fontSize: "20px", color: utilPct > 90 ? "var(--coral)" : "var(--accent)" }}>{utilPct}%</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: "1.5rem" }}>
        {/* Vendors */}
        <div>
          <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "1rem", color: "var(--text)" }}>Suggested vendors</div>
          {aiResults?.vendors ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {aiResults.vendors.map((v, i) => (
                <div key={i} className="card" style={{ padding: "1rem", borderLeft: `3px solid ${COLORS[i % COLORS.length]}` }}>
                  <div className="flex justify-between items-center mb-1">
                    <span style={{ fontSize: "12px", fontFamily: "DM Mono", color: "var(--text3)", textTransform: "uppercase" }}>{v.category}</span>
                    <span style={{ fontSize: "12px", color: "var(--gold)" }}>{"★".repeat(Math.round(v.rating))} {v.rating}</span>
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--text)", marginBottom: "4px" }}>{v.name}</div>
                  <div className="flex justify-between">
                    <span style={{ fontSize: "13px", color: "var(--teal)" }}>{v.priceRange}</span>
                    <span style={{ fontSize: "12px", color: "var(--text3)" }}>{v.notes}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ borderStyle: "dashed", textAlign: "center", padding: "2rem" }}>
              <div style={{ color: "var(--text3)", fontSize: "13px" }}>Generate AI plan to see vendor suggestions</div>
            </div>
          )}
        </div>

        {/* Budget */}
        <div>
          <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "1rem", color: "var(--text)" }}>Budget allocation</div>
          {aiResults?.budget?.breakdown ? (
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {aiResults.budget.breakdown.map((b, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontSize: "13px", color: "var(--text2)" }}>{b.category}</span>
                    <span style={{ fontSize: "13px", color: "var(--text)" }}>₹{Number(b.amount).toLocaleString()} <span style={{ color: "var(--text3)" }}>({b.percentage}%)</span></span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${b.percentage}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ borderStyle: "dashed", textAlign: "center", padding: "2rem" }}>
              <div style={{ color: "var(--text3)", fontSize: "13px" }}>Budget breakdown will appear after AI generation</div>
            </div>
          )}

          {/* Expense tracker */}
          <div style={{ fontSize: "14px", fontWeight: 500, margin: "1.25rem 0 0.75rem", color: "var(--text)" }}>Track expenses</div>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-input" placeholder="Venue, Food..." value={expForm.category} onChange={e => setExpForm(f => ({ ...f, category: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input type="number" className="form-input" placeholder="5000" value={expForm.amount} onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" placeholder="Brief description" value={expForm.description} onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <button className="btn btn-outline btn-sm" onClick={addExpense} style={{ alignSelf: "flex-end" }}>+ Add Expense</button>
            {expenses.length > 0 && (
              <table className="table" style={{ marginTop: "0.5rem" }}>
                <thead><tr><th>Category</th><th>Description</th><th>Amount</th><th></th></tr></thead>
                <tbody>
                  {expenses.map(ex => (
                    <tr key={ex.id}>
                      <td><span className="badge badge-accent">{ex.category}</span></td>
                      <td>{ex.description || "—"}</td>
                      <td style={{ color: "var(--text)" }}>₹{ex.amount.toLocaleString()}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => setExpenses(e => e.filter(x => x.id !== ex.id))}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Budget utilization bar */}
          <div className="card-sm mt-2">
            <div className="flex justify-between mb-1">
              <span style={{ fontSize: "12px", color: "var(--text2)" }}>Budget used</span>
              <span style={{ fontSize: "12px", color: utilPct > 90 ? "var(--coral)" : "var(--teal)" }}>{utilPct}%</span>
            </div>
            <div className="progress-bar" style={{ height: "10px" }}>
              <div className="progress-fill" style={{ width: `${utilPct}%`, background: utilPct > 90 ? "var(--coral)" : utilPct > 70 ? "var(--gold)" : "var(--teal)" }} />
            </div>
          </div>
        </div>
      </div>

      {aiResults?.tips && (
        <div className="card mt-3" style={{ borderColor: "rgba(61,207,176,0.2)" }}>
          <div style={{ fontSize: "12px", fontFamily: "DM Mono", color: "var(--text3)", textTransform: "uppercase", marginBottom: "0.75rem" }}>AI Tips for your event</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {aiResults.tips.map((tip, i) => (
              <div key={i} style={{ fontSize: "14px", color: "var(--text2)", display: "flex", gap: "10px" }}>
                <span style={{ color: "var(--teal)", flexShrink: 0 }}>✦</span> {tip}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
