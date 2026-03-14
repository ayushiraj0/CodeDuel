// src/pages/LobbyPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCopy, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import socket from '../startMatch/socket';

const LobbyPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // The Shareable Link
  const shareLink = `${window.location.origin}/lobby/${roomId}`;

  useEffect(() => {
    const userAuthId = localStorage.getItem('userAuthId');
    if (!userAuthId) { navigate('/login'); return; }

    // Connect if not connected
    if (!socket.connected) socket.connect();

    // 1. IF I AM THE FRIEND (JOINING):
    // If I didn't create this room (I just clicked a link), I need to emit 'join'
    // A simple check: If I am NOT the host (we can track this via state or just try joining)
    // For simplicity, we just emit join. The backend ignores if Host re-joins or handles it.
    socket.emit('join_private_lobby', { roomId, userAuthId });

    // 2. LISTEN FOR GAME START
    socket.on('match_found', (data) => {
        // Redirect both players to the Arena
        navigate(`/game-arena/${data.roomId}`, {
            state: { 
                type: "startMatch", 
                problemId: data.problemId,
                isRanked: false,
                players: data.players 
            }
        });
    });

    socket.on('error', (err) => alert(err.message));

    return () => {
        socket.off('match_found');
        socket.off('error');
    };
  }, [roomId, navigate]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center border border-gray-700">
        <h1 className="text-3xl font-bold mb-4 text-blue-400">Lobby Created!</h1>
        <p className="text-gray-400 mb-8">Waiting for your friend to join...</p>

        {/* Loader Animation */}
        <div className="flex justify-center mb-8">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500/30 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                <FaSpinner className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400" />
            </div>
        </div>

        {/* Link Box */}
        <div className="bg-gray-900 p-4 rounded-lg flex items-center justify-between border border-gray-600 mb-4">
            <code className="text-sm text-green-400 truncate mr-2">{shareLink}</code>
            <button onClick={copyToClipboard} className="text-gray-400 hover:text-white transition">
                {copied ? <FaCheckCircle className="text-green-500"/> : <FaCopy />}
            </button>
        </div>
        <p className="text-xs text-gray-500">Share this link with your friend to start the duel.</p>
        
        <button onClick={() => navigate('/')} className="mt-8 text-gray-400 hover:text-white text-sm underline">
            Cancel & Return Home
        </button>
      </div>
    </div>
  );
};

export default LobbyPage;