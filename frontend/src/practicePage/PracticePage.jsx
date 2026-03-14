// src/pages/PracticePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProblems } from '../context/ProblemContext'; 
import { fetchMySolvedProblems } from '../data/solvedProblemsData'; 
import { 
  FaSearch, FaFilter, FaCodeBranch, FaLaptopCode, 
  FaSpinner, FaExclamationCircle, FaCheckCircle, 
  FaArrowLeft, FaDice, FaChartPie, FaEye, FaTimes 
} from 'react-icons/fa';

const PracticePage = ({ user }) => {
    const navigate = useNavigate();
    
    // --- Context Data ---
    const { problems, isLoading, error } = useProblems();

    // --- Local State ---
    const [displayedChallenges, setDisplayedChallenges] = useState([]); 
    
    // Store full solution objects mapped by ID
    // Format: { 1: { code: "...", language: "cpp" }, 2: { ... } }
    const [userSolutions, setUserSolutions] = useState({}); 

    // Modal State
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [selectedSolution, setSelectedSolution] = useState(null);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('All');
    const [filterTopic, setFilterTopic] = useState('All');
    const [filterLanguage, setFilterLanguage] = useState('All');

    // --- Security Check ---
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // --- Fetch Solved Status ---
    useEffect(() => {
        const loadSolvedStatus = async () => {
            if (user) {
                try {
                    // 1. CALL API (This function needs to return the data from /api/solved-problems/me)
                    const response = await fetchMySolvedProblems(); 
                    
                    // Handle if response is wrapped in { success: true, data: [...] } or just [...]
                    const data = response.data || response; 

                    // 2. Convert to Map for O(1) Lookup
                    const solutionsMap = {};
                    
                    if (Array.isArray(data)) {
                        data.forEach(item => {
                            // Ensure we use the correct ID field (problemId)
                            solutionsMap[item.problemId] = item;
                        });
                    } else if (data.problems && Array.isArray(data.problems)) {
                         // If your backend returns the nested array structure directly
                         data.problems.forEach(item => {
                            solutionsMap[item.problemId] = item;
                        });
                    }
                    
                    setUserSolutions(solutionsMap);
                } catch (err) {
                    console.error("Failed to load solved status", err);
                }
            }
        };
        loadSolvedStatus();
    }, [user]);

    // --- Filter Logic ---
    useEffect(() => {
        if (!problems) return;

        let filtered = problems.filter(challenge => {
            const titleMatch = challenge.title 
                ? challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) 
                : false;
            return titleMatch;
        });

        if (filterDifficulty !== 'All') {
            filtered = filtered.filter(challenge => challenge.difficulty === filterDifficulty);
        }

        if (filterTopic !== 'All') {
            filtered = filtered.filter(challenge => (challenge.topic || 'General') === filterTopic);
        }

        if (filterLanguage !== 'All') {
            filtered = filtered.filter(challenge => (challenge.language || 'Multi') === filterLanguage);
        }

        setDisplayedChallenges(filtered);
    }, [problems, searchTerm, filterDifficulty, filterTopic, filterLanguage]);

    // --- CALCULATE STATS ---
    const getStats = () => {
        const solvedIdList = Object.keys(userSolutions).map(Number);

        const totalSolved = solvedIdList.length;
        const totalProblems = problems.length;
        
        const easyTotal = problems.filter(p => p.difficulty === 'Easy').length;
        const easySolved = problems.filter(p => p.difficulty === 'Easy' && solvedIdList.includes(Number(p.id))).length;

        const mediumTotal = problems.filter(p => p.difficulty === 'Medium').length;
        const mediumSolved = problems.filter(p => p.difficulty === 'Medium' && solvedIdList.includes(Number(p.id))).length;

        const hardTotal = problems.filter(p => p.difficulty === 'Hard').length;
        const hardSolved = problems.filter(p => p.difficulty === 'Hard' && solvedIdList.includes(Number(p.id))).length;

        return { totalSolved, totalProblems, easyTotal, easySolved, mediumTotal, mediumSolved, hardTotal, hardSolved };
    };

    const stats = getStats();

    // --- Handlers ---
    const handleStartChallenge = (customId) => {
        navigate(`/game-arena/${customId}`, { 
            state: { type: "exploreChallenge" } 
        });
    };

    const handleViewCode = (problemId, title) => {
        const solution = userSolutions[problemId];
        if (solution) {
            setSelectedSolution({ ...solution, title });
            setShowCodeModal(true);
        }
    };

    const handleSurpriseMe = () => {
        const solvedIdList = Object.keys(userSolutions).map(Number);
        const unsolvedProblems = problems.filter(p => !solvedIdList.includes(Number(p.id)));
        
        if (unsolvedProblems.length === 0) {
            alert("Wow! You've solved everything! 🎉");
            return;
        }

        const randomIndex = Math.floor(Math.random() * unsolvedProblems.length);
        const randomProblem = unsolvedProblems[randomIndex];
        handleStartChallenge(randomProblem.id);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center text-white">
                <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
                <p className="text-gray-400">Syncing challenges...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center text-red-400">
                <FaExclamationCircle className="text-4xl mb-4" />
                <p className="text-lg mb-4">Error: {error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="px-6 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 relative">
            
            {/* CODE VIEW MODAL */}
            {showCodeModal && selectedSolution && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-gray-800 w-full max-w-3xl rounded-xl border border-gray-600 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedSolution.title}</h3>
                                <p className="text-sm text-gray-400">Language: <span className="text-blue-400 font-mono">{selectedSolution.language}</span></p>
                            </div>
                            <button 
                                onClick={() => setShowCodeModal(false)}
                                className="p-2 hover:bg-gray-700 rounded-full transition"
                            >
                                <FaTimes className="text-xl text-gray-400 hover:text-white" />
                            </button>
                        </div>
                        
                        <div className="p-0 overflow-auto bg-[#1e1e1e] custom-scrollbar flex-grow">
                            <pre className="p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap">
                                {selectedSolution.code}
                            </pre>
                        </div>

                        <div className="p-4 bg-gray-900 border-t border-gray-700 flex justify-end">
                            <button 
                                onClick={() => setShowCodeModal(false)}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm font-semibold transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center py-4 mb-8 border-b border-gray-700">
                <h1 className="text-4xl font-bold mb-4 md:mb-0">Practice Arena</h1>
                <div className="flex gap-4">
                    <button
                        onClick={handleSurpriseMe}
                        className="flex items-center px-6 py-2 rounded-md bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-colors duration-300 shadow-lg"
                    >
                        <FaDice className="mr-2" /> Surprise Me
                    </button>
                    <button
                        onClick={() => navigate('/')} 
                        className="flex items-center px-6 py-2 rounded-md bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-colors duration-300 shadow-md"
                    >
                        <FaArrowLeft className="mr-2" /> Home
                    </button>
                </div>
            </header>

            {/* STATS DASHBOARD */}
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm">Total Solved</p>
                        <p className="text-2xl font-bold text-white">{stats.totalSolved} <span className="text-gray-500 text-lg">/ {stats.totalProblems}</span></p>
                    </div>
                    <FaChartPie className="text-3xl text-blue-500 opacity-50" />
                </div>
                {/* Easy Stats */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="flex justify-between mb-1">
                        <span className="text-green-400 font-bold text-sm">Easy</span>
                        <span className="text-gray-400 text-xs">{stats.easySolved}/{stats.easyTotal}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${stats.easyTotal ? (stats.easySolved/stats.easyTotal)*100 : 0}%` }}></div>
                    </div>
                </div>
                {/* Medium Stats */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="flex justify-between mb-1">
                        <span className="text-yellow-400 font-bold text-sm">Medium</span>
                        <span className="text-gray-400 text-xs">{stats.mediumSolved}/{stats.mediumTotal}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${stats.mediumTotal ? (stats.mediumSolved/stats.mediumTotal)*100 : 0}%` }}></div>
                    </div>
                </div>
                {/* Hard Stats */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="flex justify-between mb-1">
                        <span className="text-red-400 font-bold text-sm">Hard</span>
                        <span className="text-gray-400 text-xs">{stats.hardSolved}/{stats.hardTotal}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${stats.hardTotal ? (stats.hardSolved/stats.hardTotal)*100 : 0}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="w-full max-w-7xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 border border-gray-700">
                {/* Search */}
                <div className="col-span-full md:col-span-1 flex items-center bg-gray-900 rounded-md px-3 py-2 border border-gray-600 focus-within:border-blue-500 transition">
                    <FaSearch className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search challenges..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow bg-transparent outline-none text-white placeholder-gray-500"
                    />
                </div>
                {/* Filters Dropdowns */}
                <div className="flex items-center">
                    <FaFilter className="text-gray-400 mr-2" />
                    <select
                        value={filterDifficulty}
                        onChange={(e) => setFilterDifficulty(e.target.value)}
                        className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                    >
                        <option value="All">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
                <div className="flex items-center">
                    <FaCodeBranch className="text-gray-400 mr-2" />
                    <select
                        value={filterTopic}
                        onChange={(e) => setFilterTopic(e.target.value)}
                        className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                    >
                        <option value="All">All Topics</option>
                        <option value="Arrays">Arrays</option>
                        <option value="Strings">Strings</option>
                        <option value="Sorting">Sorting</option>
                        <option value="Trees">Trees</option>
                        <option value="DP">DP</option>
                        <option value="General">General</option>
                    </select>
                </div>
                <div className="flex items-center">
                    <FaLaptopCode className="text-gray-400 mr-2" />
                    <select
                        value={filterLanguage}
                        onChange={(e) => setFilterLanguage(e.target.value)}
                        className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                    >
                        <option value="All">All Languages</option>
                        <option value="Python">Python</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="Java">Java</option>
                        <option value="C++">C++</option>
                    </select>
                </div>
            </div>

            {/* Grid of Challenges */}
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedChallenges.length > 0 ? (
                    displayedChallenges.map(challenge => {
                        const solution = userSolutions[challenge.id];
                        const isSolved = !!solution;

                        return (
                            <div key={challenge.id} className={`bg-gray-800 flex flex-col justify-between p-6 rounded-xl shadow-lg border ${isSolved ? 'border-green-500/50' : 'border-gray-700'} hover:border-blue-500 transition-all duration-300 hover:-translate-y-1`}>
                                
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-white truncate w-3/4" title={challenge.title}>
                                            {challenge.title}
                                        </h3>
                                        <div className="flex flex-col items-end gap-1">
                                            {isSolved && (
                                                <span className="flex items-center px-2 py-0.5 text-xs font-bold rounded bg-green-900/50 text-green-400 border border-green-500/30">
                                                    <FaCheckCircle className="mr-1" /> Solved
                                                </span>
                                            )}
                                            <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${
                                                challenge.difficulty === 'Easy' ? 'bg-green-900 text-green-400' :
                                                challenge.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-400' :
                                                'bg-red-900 text-red-400'
                                            }`}>
                                                {challenge.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-3 min-h-[60px]">
                                        {challenge.description || "Solve this coding challenge to improve your skills."}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 border-t border-gray-700 pt-3">
                                        <span className="flex items-center">
                                            <FaCodeBranch className="mr-1" /> {challenge.topic || 'General'}
                                        </span>
                                        <span className="flex items-center">
                                            <FaLaptopCode className="mr-1" /> {challenge.language || 'Multi'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {isSolved ? (
                                        <>
                                            <button
                                                onClick={() => handleViewCode(challenge.id, challenge.title)}
                                                className="flex-1 py-2 rounded-lg font-semibold bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600 transition-all text-sm flex items-center justify-center gap-2"
                                            >
                                                <FaEye /> View Code
                                            </button>
                                            <button
                                                onClick={() => handleStartChallenge(challenge.id)}
                                                className="flex-1 py-2 rounded-lg font-semibold bg-green-900/40 text-green-400 hover:bg-green-900/60 border border-green-900/60 transition-all text-sm"
                                            >
                                                Solve Again
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleStartChallenge(challenge.id)}
                                            className="w-full py-2 rounded-lg font-semibold shadow-lg transition-all bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-blue-900/30"
                                        >
                                            Solve Challenge
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        <p className="text-xl">No challenges found matching your filters.</p>
                        <button 
                            onClick={() => {
                                setSearchTerm('');
                                setFilterDifficulty('All');
                                setFilterTopic('All');
                                setFilterLanguage('All');
                            }}
                            className="mt-4 text-blue-400 hover:text-blue-300 underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PracticePage;