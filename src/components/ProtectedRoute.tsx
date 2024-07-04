import React, { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "./AuthContext";
import { useStepTracking } from "./StepTrackingContext";

type ProtectedRouteProps = {
  children: ReactElement;
  requiredSteps?: string[];
  redirectPath?: string;
};

const stepOrder = [
  "Nouvelle-demande",
  "Nouvelle-modelisation",
  "guide-etage",
  "guide-classique",
  "guide-gingivectomie",
  "gouttiere-bruxismes",
  "autre-services",
  "rapport-radiologique",
  // Add more steps in the order they should be completed
];

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredSteps = [],
  redirectPath = "/login",
}) => {
  const { user, isLoading } = useAuthContext();
  const { isStepCompleted } = useStepTracking();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Find the index of the current step in the stepOrder array
  const currentStepIndex = stepOrder.findIndex((step) =>
    location.pathname.toLowerCase().includes(step.toLowerCase())
  );

  // Check if all previous steps are completed
  for (let i = 0; i < currentStepIndex; i++) {
    if (!isStepCompleted(stepOrder[i])) {
      // If a previous step is not completed, redirect to the first incomplete step
      return (
        <Navigate to={`/${stepOrder[i]}`} state={{ from: location }} replace />
      );
    }
  }

  // If we're here, all previous steps are completed
  // Now check if the current step's required steps are completed
  const allRequiredStepsCompleted = requiredSteps.every(isStepCompleted);

  if (!allRequiredStepsCompleted) {
    // Find the first incomplete required step
    const firstIncompleteStep = requiredSteps.find(
      (step) => !isStepCompleted(step)
    );
    return (
      <Navigate
        to={`/${firstIncompleteStep}`}
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
