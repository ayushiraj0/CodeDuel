// ✅ Uses your .env variable. Fallback to localhost if missing.
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
const API_URL = `${BACKEND_URL}/api/solved-problems`; // We will create this route next

// Helper to get token
// src/data/solvedProblemsData.js

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  
  // DEBUGGING: Check if token exists
  if (!token) {
    console.error("❌ NO TOKEN FOUND in LocalStorage! Request will fail.");
    return {}; 
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * 1. Fetch All Solved Problems for the Current User
 * Returns an array of objects: [{ problemId: 1, code: "...", language: "cpp" }, ...]
 */
export const fetchMySolvedProblems = async () => {
  try {
    const response = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch solved problems");
    }

    return data.data; // Returns array of solved problems
  } catch (error) {
    console.error("API Error (fetchMySolvedProblems):", error);
    throw error;
  }
};

/**
 * 2. Check if a specific problem is solved (Helper)
 * Returns true/false
 */
export const checkProblemStatus = async (problemId) => {
  try {
    const solvedList = await fetchMySolvedProblems();
    // Check if the problemId exists in the solved list
    const isSolved = solvedList.some(p => p.problemId === Number(problemId));
    return isSolved;
  } catch (error) {
    console.error("API Error (checkProblemStatus):", error);
    return false; // Default to false if error
  }
};