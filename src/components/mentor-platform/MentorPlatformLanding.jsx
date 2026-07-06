import React from "react";
import MentorPlatformLayout from "./MentorPlatformLayout";
import MentorHeroBand from "./landing/MentorHeroBand";
import MentorDiagnosticChips from "./landing/MentorDiagnosticChips";
import MentorDoorSelector from "./landing/MentorDoorSelector";
import MentorTrustBand from "./landing/MentorTrustBand";
import MentorProofStrip from "./landing/MentorProofStrip";
import MentorLandingPreFooter from "./shared/MentorLandingPreFooter";

export default function MentorPlatformLanding() {
  return (
    <MentorPlatformLayout activePage="Mentors">
      <MentorHeroBand />
      <MentorDiagnosticChips />
      <MentorDoorSelector />
      <MentorTrustBand />
      <MentorProofStrip />
      <MentorLandingPreFooter />
    </MentorPlatformLayout>
  );
}
