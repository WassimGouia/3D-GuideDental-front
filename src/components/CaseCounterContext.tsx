// caseCounterContext.js
import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const CaseCounterContext = createContext();

export const CaseCounterProvider = ({ children }) => {
  const [caseCount, setCaseCount] = useState(0);

  const submitCase = async (serviceId) => {
    try {
      const response = await axios.post('/api/submit-case', { serviceId });
      setCaseCount(response.data.caseCount);
    } catch (error) {
      console.error('Failed to submit case:', error);
    }
  };

  return (
    <CaseCounterContext.Provider value={{ caseCount, submitCase }}>
      {children}
    </CaseCounterContext.Provider>
  );
};

export const useCaseCounter = () => {
  return useContext(CaseCounterContext);
};