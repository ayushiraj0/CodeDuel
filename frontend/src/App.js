// src/App.js
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import Hooks
import { useProfile } from './context/ProfileDataStore'; // <--- Import Hook
import { ProblemProvider } from './context/ProblemContext';

// Import Components
import ProtectedRoute from './Components/ProtectedRoute';
import HomePage from './pages/Homepage'; // (Filename check kar lena 'Homepage' vs 'HomePage')
import LoginPage from './login/LoginPage';
import SignupPage from './login/SignupPage';
import PracticePage from './practicePage/PracticePage';
import MatchmakingLandingPage from './startMatch/MatchmakingLandingPage';
import GameArena from './startMatch/GameArena'; 
import UpdateProfile from './pages/UpdateProfile';
import LobbyPage from './pages/LobbyPage';

const App = () => {
  const [user, setUser] = useState(null);

  // 1. Context se functions nikalo
  const { fetchUserProfile, clearProfile } = useProfile();

  // --- REHYDRATE USER (Page Refresh par) ---
  useEffect(() => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userAuthId');
      
      if (token && userId) {
          setUser({ _id: userId, token: token });
          // Agar refresh kiya hai, toh bhi data fetch kar lo safe side ke liye
          fetchUserProfile(); 
      }
  }, []); // Runs once on mount

  // --- LOGIN HANDLER (Main Change Here) ---
  const handleLogin = async (data) => {
    // 1. Pehle Token save karo (Bahut Important)
    if (data.token) localStorage.setItem('token', data.token);

    const userObj = data.user || data; 
    const userId = userObj._id || userObj.id;
    if (userId) localStorage.setItem('userAuthId', userId);
    
    // 2. Local State Set karo
    setUser(userObj);

    // 3. 🔥 IMMEDIATELY FETCH PROFILE DATA 🔥
    // Token save hone ke baad ye function call hoga aur data store mein aa jayega
    await fetchUserProfile();
    
    
  };

  const handleLogout = () => {
      // Logout logic agar App level pe chahiye
      clearProfile();
      localStorage.clear();
      window.location.href = '/login';
  }

  return (
    // ProfileProvider yaha se HATA diya hai (Kyunki index.js mein hai)
      <ProblemProvider user={user}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
             <Route path="/practice" element={<PracticePage user={user} />} />
             <Route path="/matchmaking" element={<MatchmakingLandingPage />} />
             <Route path="/game-arena/:roomId" element={<GameArena />} />
             <Route path="/updateProfile" element={<UpdateProfile />} />
             <Route path="/lobby/:roomId" element={<LobbyPage />} />
          </Route>

        </Routes>
      </ProblemProvider>
  );
};

export default App;