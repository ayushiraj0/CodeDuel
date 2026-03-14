// src/context/ProblemContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchAllProblems } from '../data/allProblems';

// 1. Create the Context
const ProblemContext = createContext();

// 2. Create the Provider (The "Store" Logic)
export const ProblemProvider = ({ children, user }) => {
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if User exists and we haven't fetched yet (problems.length === 0)
    if (user && problems.length === 0) {
      const loadData = async () => {
        setIsLoading(true);
        console.log("Fetching problems globally...");
        
        const result = await fetchAllProblems();
        
        if (result.success) {
          setProblems(result.data);
        } else {
          setError(result.message);
        }
        setIsLoading(false);
      };

      loadData();
    }
  }, [user]); // Logic runs whenever 'user' changes

  // 3. The value we want to share across the app
  const value = {
    problems,       // The actual data
    isLoading,      // Loading status
    error,          // Error status
    refreshProblems: () => setProblems([]) // Optional: Helper to force re-fetch
  };

  return (
    <ProblemContext.Provider value={value}>
      {children}
    </ProblemContext.Provider>
  );
};

// 4. Create a Custom Hook for easy access
export const useProblems = () => {
  return useContext(ProblemContext);
};