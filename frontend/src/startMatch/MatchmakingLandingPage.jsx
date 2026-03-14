import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchmakingModal from './MatchmakingModel';
import MatchmakingSearch from './MatchmakingSearch';
import { FaArrowLeft, FaLaptopCode } from 'react-icons/fa';
import socket from './socket'; 

const MatchmakingLandingPage = () => {
  const navigate = useNavigate();

  const [isMatchmakingModalOpen, setIsMatchmakingModalOpen] = useState(true);
  const [isMatchmakingSearching, setIsMatchmakingSearching] = useState(false);
  
  // State for UI
  const [matchmakingPreferences, setMatchmakingPreferences] = useState({
    language: 'Any', 
    type: 'Ranked', 
  });

  // 🆕 REF: Keeps track of latest preference so Socket Listener can read it accurately
  const preferencesRef = useRef(matchmakingPreferences);

  useEffect(() => {
    // 1. Socket Listeners
    const handleConnect = () => console.log('✅ Socket Connected:', socket.id);
    const handleConnectError = (err) => console.error('❌ Socket Error:', err.message);

    const handleMatchFound = (data) => {
      console.log('>>> Match found! Room:', data.roomId);
      setIsMatchmakingSearching(false);
      
      // 🆕 Get the language the user actually selected
      // If they chose 'Any', we default to 'Python' for the Arena
      let userLang = preferencesRef.current.language;
      if (userLang === 'Any') userLang = 'Python';

      navigate(`/game-arena/${encodeURIComponent(data.roomId)}`, {
        state: { 
            type: "startMatch", 
            problemId: data.problemId,
            isRanked: data.isRanked, 
            players: data.players,
            difficulty: "Adaptive",
            preferredLanguage: userLang // <--- PASSING IT HERE
        }
      });
    };

    const handleUserDisconnected = () => {
        setIsMatchmakingSearching(false);
        alert("Opponent disconnected during search.");
        setIsMatchmakingModalOpen(true); 
    };

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('match_found', handleMatchFound);
    socket.on('user-disconnected', handleUserDisconnected);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('match_found', handleMatchFound);
      socket.off('user-disconnected', handleUserDisconnected);
    };
  }, [navigate]);

  const handleCloseMatchmakingModal = () => setIsMatchmakingModalOpen(false);

  // 2. START MATCHMAKING
  const handleStartMatchmaking = ({ language, type }) => {
    const userAuthId = localStorage.getItem('userAuthId');
    const token = localStorage.getItem('token');

    if (!userAuthId || !token) {
        alert("⚠️ You must be logged in to play.");
        navigate('/login');
        return;
    }

    const mode = type.toLowerCase(); 

    console.log(`Initiating ${mode} Match for User: ${userAuthId}`);

    setIsMatchmakingModalOpen(false);
    
    // Update State & Ref
    setMatchmakingPreferences({ language, type });
    preferencesRef.current = { language, type }; // <--- Update Ref immediately
    
    setIsMatchmakingSearching(true);

    const emitSearch = () => {
        socket.emit('find_match', { 
            userAuthId, 
            mode: mode 
        });
    };

    if (socket.connected) {
      emitSearch();
    } else {
      socket.connect();
      socket.once('connect', emitSearch);
    }
  };

  const handleCancelMatchmaking = () => {
    setIsMatchmakingSearching(false);
    setIsMatchmakingModalOpen(true);
    if (socket.connected) socket.emit('cancel_search');
  };

  const handleBackToHome = () => {
    if (socket.connected) socket.emit('cancel_search');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8 text-white">
      <header className="w-full max-w-7xl flex justify-between items-center py-4 mb-12 absolute top-0 left-0 right-0 px-8">
        <div className="flex items-center">
          <button onClick={handleBackToHome} className="flex items-center text-gray-300 hover:text-white transition-colors text-lg mr-4">
            <FaArrowLeft className="mr-2" /> Back to Home
          </button>
          <div className="flex items-center gap-2">
            <FaLaptopCode className="text-blue-400 text-3xl" />
            <span className="text-white text-3xl font-bold">CodeDuel</span>
          </div>
        </div>
      </header>

      <h1 className="text-4xl font-bold mt-20 mb-8">Ready to Duel?</h1>
      <p className="text-lg text-gray-300 mb-8">Finding opponents with similar skill rating...</p>

      <MatchmakingModal
        isOpen={isMatchmakingModalOpen}
        onClose={handleCloseMatchmakingModal}
        onStartMatchmaking={handleStartMatchmaking} 
      />

      <MatchmakingSearch
        isOpen={isMatchmakingSearching}
        selectedLanguage={matchmakingPreferences.language}
        matchType={matchmakingPreferences.type} 
        onCancelMatchmaking={handleCancelMatchmaking}
      />
    </div>
  );
};

export default MatchmakingLandingPage;