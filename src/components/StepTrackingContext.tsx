import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type StepTrackingContextType = {
  completeStep: (step: string) => void;
  isStepCompleted: (step: string) => boolean;
};

const StepTrackingContext = createContext<StepTrackingContextType | undefined>(undefined);

export const useStepTracking = () => {
  const context = useContext(StepTrackingContext);
  if (context === undefined) {
    throw new Error("useStepTracking must be used within a StepTrackingProvider");
  }
  return context;
};

export const StepTrackingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    const saved = localStorage.getItem("completedSteps");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("completedSteps", JSON.stringify(completedSteps));
  }, [completedSteps]);

  const completeStep = (step: string) => {
    setCompletedSteps(prev => [...new Set([...prev, step])]);
  };

  const isStepCompleted = (step: string) => completedSteps.includes(step);

  return (
    <StepTrackingContext.Provider value={{ completeStep, isStepCompleted }}>
      {children}
    </StepTrackingContext.Provider>
  );
};