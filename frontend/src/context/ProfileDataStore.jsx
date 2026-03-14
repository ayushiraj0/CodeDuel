// src/context/ProfileDataStore.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserProfile as fetchUserProfileAPI, updateUserProfile as updateUserProfileAPI } from '../data/profileData';

// 1. Create the Context
const ProfileContext = createContext();

// 2. The Provider Component
export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Action: Fetch Data from Backend ---
  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const data = await fetchUserProfileAPI();
      setProfile(data);
      setError(null);
    } catch (err) {
      console.error("Profile Store Error:", err.message);
      setError(err.message);
      setProfile(null); 
      
      if (err.message.includes("401") || err.message.includes("token")) {
          localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Action: Update Data (API) ---
  const updateProfile = async (newDetails) => {
    try {
      const updatedData = await updateUserProfileAPI(newDetails);
      setProfile(updatedData);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // --- Action: Clear Data (FOR LOGOUT) ---
  const clearProfile = () => {
      setProfile(null);
      setError(null);
      setLoading(false); 
      console.log("Context Cleared");
  };

  // --- ✅ NEW ACTION: Update Local State Only (OPTIMISTIC UI) ---
  // This allows you to update points/rank immediately without a fetch
  const updateLocalStats = (newStats) => {
    if (!profile) return;

    setProfile((prevProfile) => ({
      ...prevProfile,
      stats: {
        ...prevProfile.stats, // Keep existing stats (like level, streak)
        ...newStats           // Overwrite points, rank, questionsSolved
      }
    }));
  };

  // --- Auto-Load on Startup ---
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const value = {
    profile,
    loading,
    error,
    fetchUserProfile,
    updateProfile,
    clearProfile,
    updateLocalStats // <--- Added to exports
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

// 3. The Custom Hook
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};