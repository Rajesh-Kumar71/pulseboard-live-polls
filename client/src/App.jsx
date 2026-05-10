import { useEffect, useState } from "react";
import "./index.css";

function App() {
  const [apiStatus, setApiStatus] = useState("Checking backend...");

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await fetch("http://localhost:5000/api/health");
        const data = await response.json();

        setApiStatus(data.message || "Backend is running");
      } catch (error) {
        setApiStatus("Backend is not connected yet");
      }
    }

    checkBackend();
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Web Dev Cohort 2026 Hackathon</p>

        <h1>PulseBoard</h1>

        <p className="subtitle">
          Create live polls, share public links, collect feedback and view
          real-time analytics.
        </p>

        <div className="status-box">
          <span className="status-dot"></span>
          <span>{apiStatus}</span>
        </div>
      </section>
    </main>
  );
}

export default App;