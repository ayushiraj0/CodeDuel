// CreateLobbyModal.jsx
import React, { useState } from 'react';
import { FaTimes, FaUsers, FaLink, FaShareAlt } from 'react-icons/fa'; // Icons for lobby features

const CreateLobbyModal = ({ isOpen, onClose, onCreateLobby }) => {
  const [lobbyName, setLobbyName] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState('Two Sum'); // Example default
  const [inviteLink, setInviteLink] = useState(''); // State to hold generated invite link

  if (!isOpen) return null;

  const handleCreateAndGenerate = () => {
    // In a real application, this would make an API call
    // and receive a real invite link/code from the backend.
    const generatedLink = `https://codelduel.com/lobby/${Math.random().toString(36).substring(2, 10)}`;
    setInviteLink(generatedLink);
    onCreateLobby({ name: lobbyName, challenge: selectedChallenge, link: generatedLink });
    // You might keep the modal open to show the link, or close it and navigate.
    // For now, we'll keep it open to display the link.
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!'); // Simple notification
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md border border-gray-700 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
          aria-label="Close"
        >
          <FaTimes />
        </button>

        <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Private Lobby</h2>

        {/* Lobby Name Input */}
        <div className="mb-6">
          <label htmlFor="lobbyName" className="block text-gray-300 text-lg font-semibold mb-2">
            Lobby Name:
          </label>
          <input
            type="text"
            id="lobbyName"
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
            placeholder="e.g., Weekend Coding Battle"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Challenge Selection */}
        <div className="mb-8">
          <label htmlFor="challenge" className="block text-gray-300 text-lg font-semibold mb-2">
            Select Challenge:
          </label>
          <select
            id="challenge"
            value={selectedChallenge}
            onChange={(e) => setSelectedChallenge(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Two Sum">Two Sum (Easy)</option>
            <option value="Longest Substring">Longest Substring (Medium)</option>
            <option value="Merge Sort">Merge Sort (Hard)</option>
            {/* More challenges dynamically loaded from an API in a real app */}
          </select>
        </div>

        {/* Create Lobby Button */}
        <button
          onClick={handleCreateAndGenerate}
          className="w-full flex items-center justify-center py-3 px-6 bg-purple-600 text-white text-xl font-bold rounded-lg
                     hover:bg-purple-500 transition-colors duration-300 shadow-lg mb-4"
        >
          <FaUsers className="mr-3" /> Create Lobby & Get Link
        </button>

        {/* Invite Link Display */}
        {inviteLink && (
          <div className="bg-gray-700 p-4 rounded-md flex items-center justify-between text-white text-sm">
            <span className="truncate flex-grow mr-4">
                <FaLink className="inline-block mr-2 text-blue-400" />
                {inviteLink}
            </span>
            <button
              onClick={handleCopyToClipboard}
              className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200 text-sm"
            >
              <FaShareAlt className="inline-block mr-1" /> Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateLobbyModal;