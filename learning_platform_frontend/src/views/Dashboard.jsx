import React from "react";
import Card from "../components/common/Card";
import AssistantPanel from "../components/assistant/AssistantPanel";
import { Link } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Dashboard - authenticated overview module with Assistant panel.
 */
export default function Dashboard() {
  return (
    <div className="container">
      <div className="mt-0" style={{ display: "grid", gap: "1rem" }}>
        <Card>
          <h2>Dashboard</h2>
          <p className="mt-2" style={{ color: "var(--color-muted)" }}>
            Overview of your courses, progress, and quick actions.
          </p>
        </Card>

        <AssistantPanel defaultOpen />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div>
                <h3 className="mt-0">Social Feed</h3>
                <p className="mt-2" style={{ color: "var(--color-muted)" }}>
                  Share progress, ask questions, and celebrate wins with peers.
                </p>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Link to="/feed"><button className="btn">Open Feed</button></Link>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div>
                <h3 className="mt-0">Wellbeing</h3>
                <p className="mt-2" style={{ color: "var(--color-muted)" }}>
                  Log your daily mood and view trends over time.
                </p>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Link to="/wellbeing"><button className="btn">Open Wellbeing</button></Link>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div>
                <h3 className="mt-0">Career Path AI</h3>
                <p className="mt-2" style={{ color: "var(--color-muted)" }}>
                  Generate tailored career recommendations from your goals and interests.
                </p>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Link to="/career"><button className="btn">Open Career</button></Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
