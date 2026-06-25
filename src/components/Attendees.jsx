import { useState } from "react";

const STATUS = ["Invited", "Confirmed", "Declined", "Maybe"];
const STATUS_BADGE = { Invited: "badge-accent", Confirmed: "badge-teal", Declined: "badge-coral", Maybe: "badge-gold" };

export default function Attendees({ eventData, attendees, setAttendees }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", status: "Invited", group: "" });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const add = () => {
    if (!form.name || !form.email) { alert("Name and email required"); return; }
    setAttendees(a => [...a, { ...form, id: Date.now() }]);
    setForm({ name: "", email: "", phone: "", status: "Invited", group: "" });
  };

  const updateStatus = (id, status) => setAttendees(a => a.map(x => x.id === id ? { ...x, status } : x));
  const remove = (id) => setAttendees(a => a.filter(x => x.id !== id));

  const filtered = attendees.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = STATUS.reduce((acc, s) => ({ ...acc, [s]: attendees.filter(a => a.status === s).length }), {});

  const sendReminder = (att) => {
    alert(`Reminder sent to ${att.name} at ${att.email}!\n(In production, this triggers SendGrid/Twilio via Zapier)`);
  };

  const bulkRemind = () => {
    const invited = attendees.filter(a => a.status === "Invited");
    alert(`Sending reminders to ${invited.length} invited attendees!\n(In production: Zapier → SendGrid/Twilio automation)`);
  };

  return (
    <div>
      <div className="section-header">
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-accent">Step 04</span>
        </div>
        <h1 className="section-title">Attendee management</h1>
        <p className="section-sub">Track RSVPs, send invites and reminders</p>
      </div>

      <div className="grid-4 mb-3">
        <div className="stat-card">
          <div className="stat-label">Total Invited</div>
          <div className="stat-value">{attendees.length}</div>
          <div className="stat-sub">of {eventData?.guestCount || "?"} expected</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Confirmed</div>
          <div className="stat-value" style={{ color: "var(--teal)" }}>{counts.Confirmed || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Declined</div>
          <div className="stat-value" style={{ color: "var(--coral)" }}>{counts.Declined || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending RSVP</div>
          <div className="stat-value" style={{ color: "var(--gold)" }}>{counts.Invited || 0}</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: "1.5rem", alignItems: "start" }}>
        <div className="card">
          <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "1rem" }}>Add attendee</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="Rahul Sharma" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Group / Category</label>
                <input className="form-input" placeholder="Family, Friends..." value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className="form-input" placeholder="rahul@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" onClick={add}>+ Add Attendee</button>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <input className="form-input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "auto", flex: 1, marginRight: "8px" }} />
            <select className="form-select" style={{ width: "130px" }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option>All</option>
              {STATUS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {counts.Invited > 0 && (
            <button className="btn btn-ai mb-2" style={{ width: "100%", justifyContent: "center" }} onClick={bulkRemind}>
              ✦ Send Reminders to {counts.Invited} Pending
            </button>
          )}

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--text3)", fontSize: "13px" }}>
                {attendees.length === 0 ? "No attendees yet. Add your first one!" : "No results found."}
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 500, color: "var(--text)" }}>{a.name}</div>
                        {a.group && <div style={{ fontSize: "11px", color: "var(--text3)" }}>{a.group}</div>}
                      </td>
                      <td>
                        <div style={{ fontSize: "12px" }}>{a.email}</div>
                        {a.phone && <div style={{ fontSize: "11px", color: "var(--text3)" }}>{a.phone}</div>}
                      </td>
                      <td>
                        <select
                          className="form-select"
                          style={{ padding: "4px 8px", fontSize: "12px", width: "110px" }}
                          value={a.status}
                          onChange={e => updateStatus(a.id, e.target.value)}
                        >
                          {STATUS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn btn-outline btn-sm" onClick={() => sendReminder(a)}>Remind</button>
                          <button className="btn btn-danger btn-sm" onClick={() => remove(a.id)}>×</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
