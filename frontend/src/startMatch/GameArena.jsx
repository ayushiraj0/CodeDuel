import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  FaLaptopCode, FaArrowLeft, FaPlay, FaSyncAlt, FaClock, 
  FaSpinner, FaTrophy, FaTimesCircle, FaUserNinja, FaCheckCircle 
} from 'react-icons/fa';

// Context Imports
import { useProblems } from '../context/ProblemContext'; 
import { useProfile } from '../context/ProfileDataStore'; 
import socket from './socket'; 
import confetti from 'canvas-confetti'; 
import Chat from './Chat'; 

// Syntax Highlighting Import
import { highlightSyntax } from './syntaxConfig';

// --- Constants ---
const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const LANGUAGE_CONFIG = {
  'Python': { piston: 'python', version: '3.10.0', file: 'solution.py' },
  'JavaScript': { piston: 'javascript', version: '18.15.0', file: 'solution.js' },
  'C++': { piston: 'cpp', version: '10.2.0', file: 'solution.cpp' },
  'Java': { piston: 'java', version: '15.0.2', file: 'Main.java' },
};

// --- Sub-Components ---

const ProblemDescription = ({ problem, isSolved }) => {
  if (!problem) return <div className="text-gray-400 p-4">Loading problem details...</div>;
  
  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg h-full overflow-y-auto custom-scrollbar border border-gray-700">
      {/* 1. Header (Title & Difficulty) */}
      <div className="flex justify-between items-start mb-4">
        <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                {problem.title}
                {isSolved && <FaCheckCircle className="text-green-500 text-lg" title="You have solved this problem" />}
            </h3>
        </div>
        <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
            problem.difficulty === 'Easy' ? 'bg-green-900 text-green-400' : 
            problem.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-400' : 
            'bg-red-900 text-red-400'
        }`}>
            {problem.difficulty}
        </span>
      </div>
      
      {/* 2. Description Body */}
      <div className="prose prose-invert prose-sm max-w-none mb-6">
        <p className="text-gray-300 leading-relaxed">{problem.description}</p>
      </div>

      {/* 3. Examples */}
      <h4 className="text-lg font-bold text-white mb-3 border-b border-gray-700 pb-2">Examples</h4>
      <div className="space-y-4 mb-8">
        {problem.examples && problem.examples.map((example, index) => (
            <div key={index} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
            <p className="text-gray-300 text-xs mb-1">
                <span className="font-bold text-blue-400">Input:</span> <code className="bg-gray-800 px-1 rounded">{JSON.stringify(example.input)}</code>
            </p>
            <p className="text-gray-300 text-xs mb-1">
                <span className="font-bold text-green-400">Output:</span> <code className="bg-gray-800 px-1 rounded">{JSON.stringify(example.output)}</code>
            </p>
            </div>
        ))}
      </div>

      {/* 4. Constraints (At Bottom) */}
      {problem.constraints && problem.constraints.length > 0 && (
        <div className="mb-4">
            <h4 className="text-md font-bold text-white mb-2 pb-1 border-b border-gray-700">Constraints:</h4>
            <ul className="list-disc pl-5 space-y-1">
                {problem.constraints.map((constraint, index) => (
                    <li key={index} className="text-gray-400 text-sm font-mono bg-gray-900/30 px-2 py-0.5 rounded w-fit">
                        {constraint}
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
};

// --- CORE EDITOR COMPONENT ---
const CodeEditor = ({ code, onCodeChange, language }) => {
  const textareaRef = useRef(null);
  const preRef = useRef(null);

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleKeyDown = (e) => {
    const { selectionStart, selectionEnd, value } = textareaRef.current;
    
    // Auto-Match Logic
    const pairs = { '(': ')', '{': '}', '[': ']' };
    if (pairs[e.key]) {
      e.preventDefault();
      const open = e.key;
      const close = pairs[e.key];
      const newValue = value.substring(0, selectionStart) + open + close + value.substring(selectionEnd);
      onCodeChange(newValue);
      setTimeout(() => {
        if(textareaRef.current) {
            textareaRef.current.selectionStart = selectionStart + 1;
            textareaRef.current.selectionEnd = selectionStart + 1;
        }
      }, 0);
    }
    // Tab Logic
    if (e.key === 'Tab') {
        e.preventDefault();
        const newValue = value.substring(0, selectionStart) + "  " + value.substring(selectionEnd);
        onCodeChange(newValue);
        setTimeout(() => {
            if(textareaRef.current) {
                textareaRef.current.selectionStart = selectionStart + 2;
                textareaRef.current.selectionEnd = selectionStart + 2;
            }
        }, 0);
    }
  };

  return (
    <div className="flex-grow flex flex-col bg-gray-900 rounded-lg shadow-lg overflow-hidden relative border border-gray-700 mb-4">
      <div className="bg-gray-800 text-gray-400 text-xs px-4 py-2 flex justify-between items-center border-b border-gray-700 uppercase tracking-widest font-semibold flex-none">
        <span>Active File: {LANGUAGE_CONFIG[language]?.file || 'file'}</span>
        <span>{language} Environment</span>
      </div>
      <div className="relative flex-grow w-full h-full bg-[#1e1e1e] overflow-hidden">
        <pre
          ref={preRef}
          aria-hidden="true"
          className="absolute inset-0 m-0 p-4 font-mono text-base whitespace-pre-wrap break-words pointer-events-none custom-scrollbar"
          style={{ zIndex: 0, color: '#abb2bf', fontFamily: "'Fira Code', 'Courier New', monospace", lineHeight: '1.5rem', overflow: 'hidden' }}
          dangerouslySetInnerHTML={{ __html: highlightSyntax(code, language) + '<br/>' }} 
        />
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck="false"
          className="absolute inset-0 w-full h-full p-4 font-mono text-base resize-none focus:outline-none custom-scrollbar bg-transparent"
          style={{ zIndex: 1, color: 'transparent', caretColor: 'white', fontFamily: "'Fira Code', 'Courier New', monospace", lineHeight: '1.5rem', background: 'transparent' }}
          placeholder={`// Write your ${language} solution here...`}
        />
      </div>
    </div>
  );
};

const OutputConsole = ({ output, isError }) => {
  return (
    <div className="h-40 flex-none bg-gray-900 rounded-lg shadow-lg overflow-hidden flex flex-col border border-gray-700">
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between flex-none">
        <span>Console Output</span>
        {isError && <span className="text-red-400">Execution Error</span>}
      </div>
      <div className={`p-4 overflow-y-auto custom-scrollbar flex-grow font-mono text-sm whitespace-pre-wrap ${isError ? 'text-red-400' : 'text-green-400'}`}>
         {output || "Run your code to see output..."}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const GameArena = () => {
  const navigate = useNavigate();
  const { roomId } = useParams(); 
  const location = useLocation();
  const { problems, isLoading } = useProblems();
  const { updateLocalStats, profile } = useProfile(); 

  // --- 1. DETERMINE MODE & PREFERENCES ---
  const gameMode = location.state?.type || "exploreChallenge"; 
  const isMultiplayer = gameMode === "startMatch";
  const preferredLanguage = location.state?.preferredLanguage; 

  const [currentProblem, setCurrentProblem] = useState(null);
  
  // --- 2. SET INITIAL LANGUAGE (Use Preference or Default) ---
  const [selectedLanguage, setSelectedLanguage] = useState(preferredLanguage || 'Python');
  
  const [userCode, setUserCode] = useState('');
  const [previousSolution, setPreviousSolution] = useState(null); 

  const [output, setOutput] = useState('');
  const [isOutputError, setIsOutputError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  const [opponentName, setOpponentName] = useState('Opponent');
  const [matchTime, setMatchTime] = useState(1800); 
  const [matchResult, setMatchResult] = useState(null); 
  const [matchDetails, setMatchDetails] = useState(null); 
  const [showResultModal, setShowResultModal] = useState(false);
  
  const timerRef = useRef(null);
  
  const myUsername = localStorage.getItem('username') || "Me";
  const myAuthId = localStorage.getItem('userAuthId') || localStorage.getItem('userId');

  // 3. SELECT PROBLEM FROM CONTEXT
  useEffect(() => {
    if (isLoading || problems.length === 0) return;
    let selected = null;
    if (gameMode === "exploreChallenge") {
        selected = problems.find(p => String(p.id) === String(roomId));
    } else if (isMultiplayer) {
        const pid = location.state?.problemId || 1;
        selected = problems.find(p => String(p.id) === String(pid)) || problems[0];
        const players = location.state?.players || [];
        const opponent = players.find(p => p.id !== myAuthId);
        if (opponent) setOpponentName(opponent.username);
    }
    if (selected) setCurrentProblem(selected);
  }, [problems, isLoading, gameMode, roomId, isMultiplayer, location.state, myAuthId]);


  // 4. FETCH PREVIOUS SOLUTION (SOLVED HISTORY)
  useEffect(() => {
    const fetchSolution = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${BACKEND_URL}/api/solved-problems/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success && data.data) {
                // Handle structure (User Doc or Array)
                let solvedList = Array.isArray(data.data) ? data.data : (data.data.problems || []);
                const found = solvedList.find(p => String(p.problemId) === String(roomId));
                
                if (found) {
                    setPreviousSolution(found);
                    
                    // --- SMART LANGUAGE LOGIC ---
                    const backendLang = found.language.toLowerCase();
                    let historyLang = 'Python';
                    if (backendLang.includes('cpp') || backendLang.includes('c++')) historyLang = 'C++';
                    else if (backendLang.includes('java') && !backendLang.includes('script')) historyLang = 'Java';
                    else if (backendLang.includes('js') || backendLang.includes('javascript')) historyLang = 'JavaScript';
                    
                    // If user did NOT pick a preference in Landing Page (e.g. came from Practice List)
                    // OR if their preference matches their history, Load History.
                    if (!preferredLanguage || preferredLanguage === historyLang) {
                         setSelectedLanguage(historyLang);
                         setUserCode(found.code);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching solved history:", error);
        }
    };

    if (roomId) fetchSolution();
  }, [roomId, preferredLanguage]);


  // 5. SET STARTER CODE (Modified to respect Solved Code)
  useEffect(() => {
    if (!currentProblem) return;

    // A. Check if we should show History Code
    if (previousSolution) {
        const backendLang = previousSolution.language.toLowerCase();
        const currentLangLower = selectedLanguage.toLowerCase();
        
        let match = false;
        if ((backendLang.includes('cpp') && currentLangLower === 'c++') ||
            (backendLang.includes('java') && !backendLang.includes('script') && currentLangLower === 'java') ||
            (backendLang.includes('python') && currentLangLower === 'python') ||
            (backendLang.includes('script') && currentLangLower === 'javascript')) {
             match = true;
        }

        if (match) {
            if(userCode !== previousSolution.code) setUserCode(previousSolution.code);
            return; // EXIT: Do not overwrite with starter code
        }
    }

    // B. Default: Load Starter Code
    if (currentProblem.starterCode) {
        const normalize = (str) => { if (!str) return ''; const lower = str.toLowerCase(); return lower === 'cpp' ? 'c++' : lower; };
        const targetLang = normalize(selectedLanguage);
        const matchedKey = Object.keys(currentProblem.starterCode).find(key => normalize(key) === targetLang);
        
        const starter = matchedKey ? currentProblem.starterCode[matchedKey] : `// No starter code for ${selectedLanguage}`;
        
        // Only update if code is not already set to something meaningful (simple check)
        setUserCode(starter);
    } else {
        setUserCode(`// Type your ${selectedLanguage} code here...`);
    }
  }, [currentProblem, selectedLanguage, previousSolution]); // Removed userCode dependency

  const triggerWinEffect = () => confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

  // 6. SOCKET LOGIC (MULTIPLAYER)
  useEffect(() => {
    if (!isMultiplayer) return;
    if (!socket.connected) socket.connect();

    const handleMatchOver = ({ winnerId, winDetails, loseDetails }) => {
        let resultType, details;
        const isRanked = location.state?.isRanked; 

        if (myAuthId === winnerId) {
             resultType = 'WIN'; details = winDetails; triggerWinEffect();
             const currentSolved = profile?.stats?.questionsSolved || 0;
             const updates = { questionsSolved: currentSolved + 1 };
             if (isRanked) { updates.rankedPoints = details.newPoints; updates.rank = details.newRank; } 
             updateLocalStats(updates);
        } else {
             resultType = 'LOSS'; details = loseDetails;
             if (isRanked) { updateLocalStats({ rankedPoints: details.newPoints, rank: details.newRank }); }
        }
        setMatchResult(resultType);
        setMatchDetails(details);
        setShowResultModal(true);
        clearInterval(timerRef.current);
    };

    const handleDisconnect = ({ message }) => {
        if (!matchResult) {
            alert(message);
            setMatchResult('WIN');
            setMatchDetails({ pointsChange: 20, newRank: 'Unchanged (Default)' }); 
            setShowResultModal(true);
            clearInterval(timerRef.current);
        }
    };

    socket.on('match_over', handleMatchOver);
    socket.on('user-disconnected', handleDisconnect);

    timerRef.current = setInterval(() => {
        setMatchTime((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);

    return () => {
        socket.off('match_over');
        socket.off('user-disconnected');
        clearInterval(timerRef.current);
    };
  }, [isMultiplayer, matchResult, myAuthId, location.state, updateLocalStats, profile]);

  // --- HANDLE RUN CODE ---
  const handleRunCode = async () => {
    const langKey = selectedLanguage.toLowerCase() === 'c++' ? 'cpp' : selectedLanguage.toLowerCase();
    
    let driverTemplate = null;
    if (currentProblem.driverCodeTemplates) {
        driverTemplate = currentProblem.driverCodeTemplates[langKey];
    }

    // 🛑 FALLBACK: IF NO DRIVER CODE -> SUBMIT DIRECTLY (Handles Java/Missing templates)
    if (!driverTemplate || !driverTemplate.trim()) {
        await handleSubmitCode(); 
        return; 
    }

    if (!userCode.trim()) return setOutput("Error: Empty code.");
    
    setIsRunning(true);
    setOutput("Compiling & Testing...\n");
    setIsOutputError(false);

    try {
        let finalCode = driverTemplate.replace("##USER_CODE_HERE##", userCode);
        const langConfig = LANGUAGE_CONFIG[selectedLanguage];

        const response = await fetch(PISTON_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                language: langConfig.piston, 
                version: langConfig.version, 
                files: [{ name: langConfig.file, content: finalCode }] 
            })
        });
        
        const data = await response.json();
        if (data.run) {
            const runOutput = data.run.output || "";
            const isLogicError = runOutput.includes("Wrong Answer");

            setOutput(runOutput || (data.run.code === 0 ? "Success (No Output)" : "Runtime Error"));
            setIsOutputError(data.run.code !== 0 || isLogicError);
        } else {
            setOutput("API Error");
        }

    } catch (err) {
        setOutput(`Execution Error: ${err.message}`);
        setIsOutputError(true);
    } finally {
        setIsRunning(false);
    }
  };

  // --- HANDLE SUBMIT ---
  const handleSubmitCode = async () => {
    const token = localStorage.getItem('token');
    if (!token) { alert("Please login"); return; }
    
    setOutput('Submitting to Judge...\n');
    setIsRunning(true);

    try {
        const response = await fetch(`${BACKEND_URL}/api/submit`, {
            method: 'POST',
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ problemId: currentProblem.id, userCode, language: selectedLanguage })
        });
        
        const data = await response.json();

        if (data.success && data.status === "Accepted") {
            setOutput(`✅ Status: Accepted\n\n${data.output}`);
            triggerWinEffect(); 
            
            // ✅ UPDATE LOCAL STATE TO REFLECT THE NEW SOLUTION IMMEDIATELY
            setPreviousSolution({
                problemId: currentProblem.id,
                code: userCode,
                language: selectedLanguage
            });

            if (isMultiplayer && !matchResult) {
                socket.emit('player_won', { roomId, problemId: currentProblem.id, userAuthId: myAuthId });
            } else if (!isMultiplayer) {
                if (data.pointsAwarded > 0) {
                     updateLocalStats({
                        points: (profile?.stats?.points || 0) + data.pointsAwarded,
                        questionsSolved: (profile?.stats?.questionsSolved || 0) + 1
                     });
                     alert(`Problem Solved! +${data.pointsAwarded} Points 🎉`);
                } else {
                     alert(`Solution Accepted! (Updated) ✅`);
                }
            }
        } else {
            setOutput(`❌ Status: ${data.status}\n\n${data.output}`);
            setIsOutputError(true);
        }
    } catch (error) { 
        setOutput(`Error: ${error.message}`); 
        setIsOutputError(true); 
    } finally { 
        setIsRunning(false); 
    }
  };

  const handleLeave = () => {
    if (isMultiplayer && !matchResult) {
        if (window.confirm('Leave match? You will lose points (Forfeit).')) {
            socket.disconnect(); 
            navigate('/');
        }
    } else {
        navigate('/practice');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes}:${remaining.toString().padStart(2, '0')}`;
  };

  if (isLoading || !currentProblem) {
      return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white"><FaSyncAlt className="animate-spin mr-2 text-2xl"/> Loading Arena...</div>;
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col relative overflow-hidden">
      
      {isMultiplayer && <Chat socket={socket} roomId={roomId} username={myUsername} />}

      {/* RESULT MODAL */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
          <div className={`bg-gray-800 rounded-xl p-8 max-w-sm w-full text-center border-2 shadow-2xl ${matchResult === 'WIN' ? 'border-green-500' : 'border-red-500'}`}>
            {matchResult === 'WIN' ? (
                <>
                    <FaTrophy className="text-6xl text-yellow-400 mx-auto mb-4 animate-bounce"/>
                    <h2 className="text-3xl font-bold mb-2 text-white">VICTORY!</h2>
                    <div className="bg-gray-700 rounded p-4 mb-6">
                        <p className="text-yellow-400 font-bold text-xl">
                            {matchDetails?.pointsChange > 0 ? `+${matchDetails.pointsChange}` : "0"} Points
                        </p>
                        <p className="text-gray-400 text-sm mt-1">Rank: {matchDetails?.newRank}</p>
                    </div>
                </>
            ) : (
                <>
                    <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4"/>
                    <h2 className="text-3xl font-bold mb-2 text-white">DEFEAT</h2>
                    <div className="bg-gray-700 rounded p-4 mb-6">
                        <p className="text-red-400 font-bold text-xl">{matchDetails?.pointsChange} Points</p>
                        <p className="text-gray-400 text-sm mt-1">Rank: {matchDetails?.newRank}</p>
                    </div>
                </>
            )}
            <button onClick={() => navigate('/')} className="px-6 py-3 rounded-lg font-bold w-full bg-blue-600 hover:bg-blue-500 transition shadow-lg">Return to Lobby</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-gray-800 border-b border-gray-700 p-2 h-14 flex items-center justify-between z-10 flex-none">
        <div className="flex items-center">
          <button onClick={handleLeave} className="flex items-center text-gray-400 hover:text-white transition-colors mr-6 group text-sm">
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Exit
          </button>
          <div className="flex items-center gap-2">
            <FaLaptopCode className="text-blue-500 text-xl" />
            <span className="font-bold text-lg hidden md:block">CodeDuel</span>
          </div>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4">
             {isMultiplayer && (
                 <div className="flex items-center gap-2 bg-gray-900 px-4 py-1.5 rounded-full border border-gray-600 shadow-sm">
                     <span className="text-xs text-gray-400">VS</span>
                     <FaUserNinja className="text-red-400" />
                     <span className="font-bold text-red-400 tracking-wide text-sm">{opponentName}</span>
                 </div>
             )}
        </div>

        <div className="flex items-center gap-3">
          <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="bg-gray-900 border border-gray-600 text-gray-200 text-xs rounded-md block w-28 p-1 cursor-pointer">
             <option value="Python">Python</option><option value="JavaScript">JavaScript</option><option value="C++">C++</option><option value="Java">Java</option>
          </select>
          
          {isMultiplayer && (
             <div className="flex items-center gap-1 bg-gray-900 px-2 py-1 rounded border border-gray-700">
                <FaClock className="text-yellow-500 text-xs"/>
                <span className="font-mono font-bold text-yellow-500 text-sm">{formatTime(matchTime)}</span>
             </div>
          )}

          <button onClick={handleRunCode} disabled={isRunning} className={`px-3 py-1 rounded text-white text-xs font-semibold flex items-center gap-1 transition ${isRunning ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
             {isRunning ? <FaSpinner className="animate-spin"/> : <FaPlay size={10}/>} Run
          </button>
          
          <button onClick={handleSubmitCode} disabled={isRunning || matchResult} className={`px-3 py-1 rounded text-white text-xs font-semibold flex items-center gap-1 transition shadow-lg ${matchResult ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-500'}`}>
             <FaSyncAlt size={10}/> Submit
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-5/12 p-4 h-full bg-gray-900">
          <ProblemDescription problem={currentProblem} isSolved={!!previousSolution} />
        </div>
        <div className="w-7/12 p-4 pl-0 h-full flex flex-col">
          <CodeEditor code={userCode} onCodeChange={setUserCode} language={selectedLanguage} />
          <OutputConsole output={output} isError={isOutputError} />
        </div>
      </div>
    </div>
  );
};

export default GameArena;