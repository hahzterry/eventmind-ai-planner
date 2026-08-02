import { useState } from "react";
import EventForm from "./components/EventForm";
import VendorBudget from "./components/VendorBudget";
import Timeline from "./components/Timeline";
import Attendees from "./components/Attendees";
import Feedback from "./components/Feedback";
import Analytics from "./components/Analytics";
import "./App.css";

const tabs = [
  { id: "create", label: "Create Event", icon: "✦" },
  { id: "vendors", label: "Vendors & Budget", icon: "◈" },
  { id: "timeline", label: "Timeline", icon: "◷" },
  { id: "attendees", label: "Attendees", icon: "◉" },
  { id: "feedback", label: "Feedback", icon: "◎" },
  { id: "analytics", label: "Analytics", icon: "◆" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("create");
  const [eventData, setEventData] = useState(null);
  const [aiResults, setAiResults] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [expenses, setExpenses] = useState([]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">Event.</span>
            <span className="logo-tag">AI Planner</span>
          </div>
          <nav className="nav">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`nav-btn ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                <span className="nav-icon">{t.icon}</span>
                <span className="nav-label">{t.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main">
        {activeTab === "create" && (
          <EventForm
            eventData={eventData}
            setEventData={setEventData}
            setAiResults={setAiResults}
            onNext={() => setActiveTab("vendors")}
          />
        )}
        {activeTab === "vendors" && (
          <VendorBudget
            eventData={eventData}
            aiResults={aiResults}
            setAiResults={setAiResults}
            expenses={expenses}
            setExpenses={setExpenses}
          />
        )}
        {activeTab === "timeline" && <Timeline eventData={eventData} aiResults={aiResults} />}
        {activeTab === "attendees" && (
          <Attendees
            eventData={eventData}
            attendees={attendees}
            setAttendees={setAttendees}
          />
        )}
        {activeTab === "feedback" && (
          <Feedback feedbackList={feedbackList} setFeedbackList={setFeedbackList} eventData={eventData} />
        )}
        {activeTab === "analytics" && (
          <Analytics
            eventData={eventData}
            attendees={attendees}
            feedbackList={feedbackList}
            expenses={expenses}
            aiResults={aiResults}
          />
        )}
      </main>
    </div>
  );
}
