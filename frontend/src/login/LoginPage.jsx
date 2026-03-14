import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaLock, FaSignInAlt, FaGithub, FaLaptopCode, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { GoogleLogin } from "@react-oauth/google";
import axios from 'axios';

// --- Social Button Component ---
const SocialButton = ({ children, onClick, loading, provider, icon: IconComponent }) => {
  const baseClasses = "w-full flex items-center justify-center py-3.5 px-4 font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg relative";
  
  let bgClasses = "";
  if (provider === 'GitHub') bgClasses = "bg-[#24292e] hover:bg-[#2b3137] text-white";
  else if (provider === 'Email') bgClasses = "bg-blue-600 hover:bg-blue-500 text-white";
  else bgClasses = "bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white";
  
  const buttonClasses = `${baseClasses} ${bgClasses} ${loading ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''}`;

  return (
    <button onClick={onClick} disabled={loading} className={buttonClasses}>
      {loading ? (
        <div className="flex items-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />Processing...</div>
      ) : (
        <>
          {IconComponent && <IconComponent className="text-xl mr-3 text-white" />}
          {children}
        </>
      )}
    </button>
  );
};

const LoginPage = ({ onLogin }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProvider, setLoadingProvider] = useState(null);
    const [viewMode, setViewMode] = useState('social'); 

    // Env Variables
    const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";
    const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID;
    const GITHUB_REDIRECT_URI = process.env.REACT_APP_GITHUB_REDIRECT_URI || "http://localhost:3001/login";

    // 🛑 CRITICAL FIX: Prevent Double-Firing in StrictMode
    const hasFetchedCode = useRef(false);

    // --- 1. Handle GitHub Callback ---
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const githubCode = queryParams.get("code");
        console.log("GitHub Code from URL:", githubCode);

        if (githubCode && !hasFetchedCode.current) {
            hasFetchedCode.current = true; // Mark as used immediately
            
            // Clean URL
            window.history.replaceState({}, document.title, location.pathname);

            const loginWithGithubCode = async () => {
                setLoadingProvider("GitHub");
                setError("");
                try {
                    const res = await axios.post(`${API_URL}/api/auth/github-login`, { code: githubCode });
                    console.log("Backend Response:", res.data);
                    handleBackendResponse(res.data);
                } catch (err) {
                    console.error("GitHub Login Error:", err);
                    handleError(err?.response?.data?.message || "GitHub authentication failed.");
                    // Note: We do NOT reset hasFetchedCode.current here to prevent infinite error loops
                } finally {
                    setLoadingProvider(null);
                }
            };
            loginWithGithubCode();
        }
    // eslint-disable-next-line
    }, [location.search]);

    // --- Helpers ---
    const handleBackendResponse = (data) => {
        if (data?.token) {
            localStorage.setItem("token", data.token);
            if (onLogin) onLogin(data.user ?? null);
            navigate('/');
        } else {
            setError("Invalid server response.");
        }
    };
    
    const handleError = (msg) => {
        setError(msg || "Login failed");
        setLoadingProvider(null);
        setIsLoading(false);
    };

    // --- Standard Login ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            handleBackendResponse(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Initiate GitHub ---
    const handleGithubLogin = () => {
        setError("");
        if (!GITHUB_CLIENT_ID) return setError("GitHub Client ID missing in .env");
        setLoadingProvider("GitHub");
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=user:email`;
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-700 relative">
                
                {viewMode === 'standard' && (
                    <button onClick={() => setViewMode('social')} className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors">
                        <FaArrowLeft className="h-6 w-6" />
                    </button>
                )}

                <div className="flex justify-center items-center mb-8">
                    <FaLaptopCode className="text-blue-400 text-5xl mr-3" />
                    <span className="text-white text-4xl font-extrabold">CodeDuel</span>
                </div>

                <h2 className="text-3xl font-bold text-white mb-8 text-center">
                    {viewMode === 'social' ? 'Sign in to continue' : 'Login with Email'}
                </h2>

                {error && <div className="bg-red-700 text-white text-center p-3 rounded-md text-sm mb-6">{error}</div>}

                {viewMode === 'social' && (
                    <div className="w-full space-y-4">
                        <div className={`flex justify-center w-full transition-all duration-200 ${loadingProvider ? 'opacity-70 pointer-events-none' : 'hover:scale-[1.02]'}`}>
                            <GoogleLogin
                                onSuccess={async (cred) => {
                                    try {
                                        const res = await axios.post(`${API_URL}/api/auth/google-login`, { token: cred.credential });
                                        handleBackendResponse(res.data);
                                    } catch (err) { handleError("Google login failed"); }
                                }}
                                onError={() => handleError("Google login failed")}
                                theme="filled_black" size="large" width="350px"
                            />
                        </div>

                        <SocialButton onClick={handleGithubLogin} loading={loadingProvider === "GitHub"} provider="GitHub" icon={FaGithub}>
                            Continue with GitHub
                        </SocialButton>
                        
                        <div className="flex items-center py-2">
                            <div className="flex-grow border-t border-gray-700"></div>
                            <span className="flex-shrink mx-4 text-gray-500">OR</span>
                            <div className="flex-grow border-t border-gray-700"></div>
                        </div>

                        <SocialButton onClick={() => setViewMode('standard')} loading={!!loadingProvider} provider="Email" icon={FaEnvelope}>
                            Continue with Email/Password
                        </SocialButton>
                    </div>
                )}

                {viewMode === 'standard' && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaUser className="h-5 w-5 text-gray-400" /></span>
                                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white outline-none focus:border-blue-500" disabled={isLoading} />
                            </div>
                        </div>
                        <div>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaLock className="h-5 w-5 text-gray-400" /></span>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white outline-none focus:border-blue-500" disabled={isLoading} />
                            </div>
                        </div>
                        <button type="submit" className="w-full py-3 px-6 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors shadow-lg" disabled={isLoading}>
                            {isLoading ? 'Logging In...' : 'Login'}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center text-gray-300">
                    <button onClick={() => navigate('/signup')} className="text-blue-400 hover:underline font-semibold">Sign up now</button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;