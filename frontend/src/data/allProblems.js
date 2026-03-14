// src/data/allProblems.js

// 1. Get the base URL from your .env file
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Fetches all problem statements from the backend.
 * @returns {Promise<Object>} The JSON response from the API.
 */
export const fetchAllProblems = async () => {
  try {
    // Check if the URL variable is loaded correctly
    if (!BACKEND_URL) {
      console.error("Error: REACT_APP_BACKEND_URL is not defined in .env file");
      return { success: false, message: "Configuration error: Backend URL missing." };
    }

    // 2. Make the GET request
    const response = await fetch(`${BACKEND_URL}/api/all-problems`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 3. Parse the JSON
    const data = await response.json();

    // 4. Return the data
    return data;

  } catch (error) {
    console.error("API Error fetching problems:", error);
    return { 
      success: false, 
      message: "Network error: Unable to connect to server.", 
      error: error.message 
    };
  }
};