import React from "react";
import ImmersiveClassroom from "../components/immersive/ImmersiveClassroom";

/**
 * PUBLIC_INTERFACE
 * Classroom - renders the immersive classroom scaffolding with WebRTC client abstraction.
 */
export default function Classroom() {
  return (
    <div className="container">
      <ImmersiveClassroom roomId="classroom-101" />
    </div>
  );
}
