import React from "react";
import { WellbeingProvider } from "../state/wellbeingSlice";
import MoodCheck from "../components/wellbeing/MoodCheck";
import WellbeingPanel from "../components/wellbeing/WellbeingPanel";

/**
 * PUBLIC_INTERFACE
 * Wellbeing - protected page for mental health module UI.
 * Provides daily mood check and a trend visualization.
 */
export default function Wellbeing() {
  return (
    <div className="container">
      <WellbeingProvider>
        <div className="mt-0" style={{ display: "grid", gap: "1rem" }}>
          <MoodCheck />
          <WellbeingPanel />
        </div>
      </WellbeingProvider>
    </div>
  );
}
