import { Suspense } from "react";
import OnboardingModal from "./OnboardingModal";

export default function OnboardingWrapper() {
  return (
    <Suspense fallback={null}>
      <OnboardingModal />
    </Suspense>
  );
}
