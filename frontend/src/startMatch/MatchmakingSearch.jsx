// MatchmakingSearch.jsx
import React from 'react';
import { FaSpinner, FaTimesCircle } from 'react-icons/fa';

const MatchmakingSearch = ({ isOpen, selectedLanguage, matchType, onCancelMatchmaking }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-lg border border-gray-700 relative text-center">
        <h2 className="text-4xl font-bold text-white mb-6 animate-pulse">Searching for Match...</h2>

        <div className="flex items-center justify-center mb-8">
          <FaSpinner className="text-blue-500 text-6xl animate-spin mr-4" />
          <p className="text-gray-300 text-xl">
            Looking for a <span className="text-blue-400 font-semibold">{matchType}</span> opponent
            <br />
            (Language: <span className="text-green-400 font-semibold">{selectedLanguage}</span>)
          </p>
        </div>

        <p className="text-gray-400 text-md mb-8">
          This may take a few moments. Please do not close this window.
        </p>

        <button
          onClick={onCancelMatchmaking}
          className="flex items-center justify-center mx-auto py-3 px-8 bg-red-600 text-white text-lg font-bold rounded-lg
                     hover:bg-red-500 transition-colors duration-300 shadow-lg"
        >
          <FaTimesCircle className="mr-3" /> Cancel Matchmaking
        </button>
      </div>
    </div>
  );
};

export default MatchmakingSearch;