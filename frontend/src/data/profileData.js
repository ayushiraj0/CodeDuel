// ✅ Uses your .env variable. Fallback to localhost if missing.
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
const API_URL = `${BACKEND_URL}/api/profile/me`;

// Helper to get token safely
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  
  // 1. SAFETY CHECK: If no token, return null so we can stop the request early
  if (!token) {
      console.warn("⚠️ No token found in localStorage.");
      return null;
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// 1. Fetch Profile Data
export const fetchUserProfile = async () => {
  try {
    const headers = getAuthHeaders();
    
    // Stop if not logged in
    if (!headers) throw new Error("No token available");

    const response = await fetch(API_URL, {
      method: 'GET',
      headers: headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      // If token is invalid (401), verify we clean up
      if (response.status === 401) {
          localStorage.removeItem('token');
          // Optional: window.location.href = '/login';
      }
      throw new Error(data.message || "Failed to fetch profile");
    }

    return data.data; 
  } catch (error) {
    console.error("API Error (fetchUserProfile):", error);
    throw error;
  }
};

// 2. Update Profile Data
export const updateUserProfile = async (updates) => {
  try {
    const headers = getAuthHeaders();
    if (!headers) throw new Error("No token available");

    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(updates)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update profile");
    }

    return data.data;
  } catch (error) {
    console.error("API Error (updateUserProfile):", error);
    throw error;
  }
};