// MatchmakingModal.jsx
import React, { useState } from 'react';
import { FaTimes, FaPlayCircle } from 'react-icons/fa';

const MatchmakingModal = ({ isOpen, onClose, onStartMatchmaking }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('Python');
  const [matchType, setMatchType] = useState('Ranked');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onStartMatchmaking({ language: selectedLanguage, type: matchType });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md border border-gray-700 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" aria-label="Close"> <FaTimes /> </button>
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Start a New Match</h2>

        <div className="mb-6">
          <label htmlFor="language" className="block text-gray-300 text-lg font-semibold mb-2"> Select Language: </label>
          <select id="language" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="Python">Python</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Java">Java</option>
            <option value="C++">C++</option>
          </select>
        </div>

        <div className="mb-8">
          <label className="block text-gray-300 text-lg font-semibold mb-2"> Match Type: </label>
          <div className="flex space-x-4">
            <button onClick={() => setMatchType('Ranked')} className={`flex-1 py-3 px-4 rounded-md text-lg font-semibold transition-all duration-200 ${matchType === 'Ranked' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600' }`}> Ranked </button>
            <button onClick={() => setMatchType('Casual')} className={`flex-1 py-3 px-4 rounded-md text-lg font-semibold transition-all duration-200 ${matchType === 'Casual' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600' }`}> Casual </button>
          </div>
        </div>

        <button onClick={handleSubmit}
          className="w-full flex items-center justify-center py-3 px-6 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-500 transition-colors duration-300 shadow-lg">
          <FaPlayCircle className="mr-3" /> Start Matchmaking
        </button>
      </div>
    </div>
  );
};

export default MatchmakingModal;