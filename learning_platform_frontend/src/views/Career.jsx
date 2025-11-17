import React from "react";
import { CareerProvider } from "../state/careerSlice";
import CareerPreferences from "../components/career/CareerPreferences";
import CareerRecommendations from "../components/career/CareerRecommendations";

/**
 * PUBLIC_INTERFACE
 * Career - protected page for Career Path AI module.
 * Renders preferences form and recommendations list with shared provider.
 */
export default function Career() {
  return (
    <div className="container">
      <CareerProvider>
        <div className="mt-0" style={{ display: "grid", gap: "1rem" }}>
          <CareerPreferences />
          <CareerRecommendations />
        </div>
      </CareerProvider>
    </div>
  );
}
