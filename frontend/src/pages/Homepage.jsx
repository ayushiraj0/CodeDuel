// src/pages/HomePage.jsx
import React from 'react'; // Removed useState since we don't need the modal state anymore
import { useNavigate } from 'react-router-dom';
import CodingCard from '../Components/CodingCard';
import { FaLaptopCode, FaUsers, FaGraduationCap } from 'react-icons/fa';

// ✅ 1. Import Socket
import socket from '../startMatch/socket'; 

const HomePage = ({ user }) => { 
  const navigate = useNavigate();

  // Simple Handlers
  const handlePlayOnline = () => navigate('/matchmaking');
  const handleExploreChallenges = () => navigate('/practice');
  const handleProfileClick = () => navigate('/updateProfile');
  const handleLogin = () => navigate('/login');

  // ✅ 2. Updated Create Lobby Logic (Directly creates room)
  const handleCreateLobby = () => {
      const userAuthId = localStorage.getItem('userAuthId');
      
      // Auth Check
      if (!userAuthId) {
          navigate('/login');
          return;
      }

      // Connect if disconnected
      if (!socket.connected) socket.connect();

      // Listener: When server says "Lobby Ready", go to the waiting room
      socket.once('lobby_created', ({ roomId }) => {
          console.log("Lobby Created:", roomId);
          navigate(`/lobby/${roomId}`);
      });

      // Emit: "I want to create a room"
      socket.emit('create_private_lobby', { userAuthId });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-8">
      {/* Header */}
      <header className="w-full max-w-7xl flex justify-between items-center py-4 mb-12">
        <div className="flex items-center">
          <FaLaptopCode className="text-blue-400 text-3xl mr-3" />
          <span className="text-white text-3xl font-bold">CodeDuel</span>
        </div>
        
        {/* Navbar */}
        <nav className="hidden md:flex space-x-8">
            <button onClick={() => navigate('/leaderboard')} className="text-gray-300 hover:text-white text-lg">Leaderboard</button>
            <button onClick={() => navigate('/community')} className="text-gray-300 hover:text-white text-lg">Community</button>
            <button onClick={handleProfileClick} className="text-gray-300 hover:text-white text-lg">Profile</button>
        </nav>

        <div className="flex space-x-4">
           {user ? (
                <img
                src={user.profilePic || 'https://via.placeholder.com/150'}
                alt="Profile"
                onClick={handleProfileClick} 
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 cursor-pointer"
               />
               ) : (
               <button onClick={handleLogin} className="px-6 py-2 rounded-md border-2 border-blue-500 text-blue-500 font-semibold hover:bg-blue-500 hover:text-white transition">
                 Login
               </button>
             )}
        </div>
      </header>

      {/* Hero Section */}
      <h1 className="text-5xl font-extrabold text-white mb-8 text-center leading-tight">
        CODE. COMPETE. <span className="text-blue-500">CONQUER.</span>
      </h1>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mt-12">
        <CodingCard
          IconComponent={FaLaptopCode}
          title="PLAY ONLINE"
          description="Algorithm battles against a global competitor."
          buttonText="START MATCH"
          theme="online"
          onClick={handlePlayOnline} 
        />
        <CodingCard 
          IconComponent={FaUsers} 
          title="PLAY WITH FRIENDS" 
          description="Create a lobby and invite friends." 
          buttonText="CREATE LOBBY" 
          theme="friends" 
          onClick={handleCreateLobby} // 👈 This now triggers the socket logic
        />
        <CodingCard 
          IconComponent={FaGraduationCap} 
          title="PRACTICE & LEARN" 
          description="Sharpen your skills with coding challenges." 
          buttonText="EXPLORE CHALLENGES" 
          theme="practice" 
          onClick={handleExploreChallenges} 
        />
      </div>

      {/* Removed CreateLobbyModal since we are auto-creating the room now */}
    </div>
  );
};

export default HomePage;