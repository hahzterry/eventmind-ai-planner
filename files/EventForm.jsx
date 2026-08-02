import { useState } from "react";

const EVENT_TYPES = [
  "Wedding", "Birthday", "Corporate", "Seminar",
  "College Fest", "Conference", "Other"
];

const BUDGET_RANGES = [
  { value: "under-600",    label: "Under $600" },
  { value: "600-1200",     label: "$600 – $1,200" },
  { value: "1200-2400",    label: "$1,200 – $2,400" },
  { value: "2400-6000",    label: "$2,400 – $6,000" },
  { value: "above-6000",   label: "Above $6,000" },
];

export default function EventForm({ onEventCreated }) {
  const [form, setForm] = useState({
    eventName: "",
    eventType: "",
    date: "",
    location: "",
    guestCount: "",
    budgetRange: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.eventName || !form.eventType || !form.date || !form.budgetRange) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/save-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save event");
      }

      setSuccess(true);
      if (onEventCreated) onEventCreated({ ...form, notionId: data.id });

      // Reset form after 2 seconds
      setTimeout(() => {
        setForm({
          eventName: "", eventType: "", date: "",
          location: "", guestCount: "", budgetRange: "",
        });
        setSuccess(false);
      }, 2500);

    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-form-container">
      <div className="form-header">
        <h2>🎉 Create New Event</h2>
        <p>Fill in the details and AI will generate vendors, budget & timeline for you!</p>
      </div>

      <form onSubmit={handleSubmit} className="event-form">
        {/* Event Name */}
        <div className="form-group">
          <label htmlFor="eventName">Event Name <span className="required">*</span></label>
          <input
            id="eventName"
            name="eventName"
            type="text"
            placeholder="e.g. Bray's Birthday Bash"
            value={form.eventName}
            onChange={handleChange}
            required
          />
        </div>

        {/* Event Type */}
        <div className="form-group">
          <label htmlFor="eventType">Event Type <span className="required">*</span></label>
          <select
            id="eventType"
            name="eventType"
            value={form.eventType}
            onChange={handleChange}
            required
          >
            <option value="">Select event type...</option>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Date & Location row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Event Date <span className="required">*</span></label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="e.g. Atlanta, GA"
              value={form.location}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Guest Count & Budget row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="guestCount">Number of Guests</label>
            <input
              id="guestCount"
              name="guestCount"
              type="number"
              min="1"
              placeholder="e.g. 150"
              value={form.guestCount}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="budgetRange">Budget Range <span className="required">*</span></label>
            <select
              id="budgetRange"
              name="budgetRange"
              value={form.budgetRange}
              onChange={handleChange}
              required
            >
              <option value="">Select budget range...</option>
              {BUDGET_RANGES.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="form-error">
            ⚠️ {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="form-success">
            ✅ Event saved to Notion! AI is generating your plan...
          </div>
        )}

        {/* Submit */}
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "⏳ Saving to Notion..." : "🚀 Create Event & Generate Plan"}
        </button>
      </form>
    </div>
  );
}
