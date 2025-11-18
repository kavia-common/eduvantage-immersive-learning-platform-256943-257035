import React from "react";
import Card from "../components/common/Card";

/**
 * PUBLIC_INTERFACE
 * Profile - authenticated user profile module placeholder.
 */
export default function Profile() {
  return (
    <div className="container">
      <Card>
        <h2>Profile</h2>
        <p className="mt-2" style={{ color: "var(--color-muted)" }}>
          Manage your account details and preferences.
        </p>
      </Card>
    </div>
  );
}
