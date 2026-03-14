import React, { useState, useEffect, useRef } from "react";
import { FaLaptopCode, FaGithub, FaEnvelope, FaUser, FaLock, FaArrowLeft, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// --- Custom Components ---

// 1. Social Button (Reused)
const SocialButton = ({ children, onClick, loading, provider, icon: IconComponent }) => {
  const baseClasses = "w-full flex items-center justify-center py-3.5 px-4 font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg relative";
  let bgClasses = "";
  if (provider === 'GitHub') bgClasses = "bg-[#24292e] hover:bg-[#2b3137] text-white";
  else if (provider === 'Email') bgClasses = "bg-blue-600 hover:bg-blue-500 text-white";
  else bgClasses = "bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white";
  
  return (
    <button onClick={onClick} disabled={loading} className={`${baseClasses} ${bgClasses} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
      {loading ? "Processing..." : <>{IconComponent && <IconComponent className="text-xl mr-3 text-white" />}{children}</>}
    </button>
  );
};

// 2. Success Popup Component (New ✨)
const SuccessPopup = ({ message }) => (
  <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl animate-fade-in p-6">
    <div className="bg-green-500 rounded-full p-4 mb-4 shadow-lg shadow-green-500/30 animate-bounce-short">
      <FaCheckCircle className="text-white text-5xl" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
    <p className="text-gray-300 text-center mb-6">{message}</p>
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-gray-500 text-xs mt-4">Redirecting...</p>
  </div>
);

// --- Main Page ---
const SignupPage = ({ onSignupSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loadingProvider, setLoadingProvider] = useState(null); 
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState(""); // State for popup
  const [viewMode, setViewMode] = useState("social");
  const [showPassword, setShowPassword] = useState(false); // Toggle password
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";
  const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID;
  const GITHUB_REDIRECT_URI = process.env.REACT_APP_GITHUB_REDIRECT_URI || "http://localhost:3001/login";

  const hasFetchedCode = useRef(false);

  // --- GitHub Callback Handling ---
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const githubCode = queryParams.get("code");

    if (githubCode && !hasFetchedCode.current) {
        hasFetchedCode.current = true;
        window.history.replaceState({}, document.title, location.pathname);

        const githubSignup = async () => {
            setLoadingProvider("GitHub");
            try {
                const res = await axios.post(`${API_URL}/api/auth/github-login`, { code: githubCode });
                handleSocialSuccess(res.data);
            } catch (err) {
                setError(err?.response?.data?.message || "GitHub signup failed.");
            } finally {
                setLoadingProvider(null);
            }
        };
        githubSignup();
    }
  // eslint-disable-next-line
  }, [location.search]);

  // --- Helpers ---

  // 1. Handle Social Login (Direct to Dashboard)
  const handleSocialSuccess = (data) => {
    if (data?.token) {
      localStorage.setItem("token", data.token);
      if (onSignupSuccess) onSignupSuccess(data.user);
      navigate("/"); // Social logins go straight to dashboard
    }
  };

  // 2. Handle Email Register (Show Popup -> Go to Login)
  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoadingProvider("Email");
    
    try {
      // Backend call
      await axios.post(`${API_URL}/api/auth/register`, formData);
      
      // ✨ Show Success Popup
      setSuccessMsg("Account created successfully!");
      
      // Wait 2 seconds, then navigate to login
      setTimeout(() => {
        navigate("/login"); 
      }, 2000);

    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed.");
      setLoadingProvider(null); // Only stop loading on error
    }
  };

  const handleGithubClick = () => {
    if (!GITHUB_CLIENT_ID) return setError("GitHub Client ID missing.");
    setLoadingProvider("GitHub");
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=user:email`;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700 flex flex-col relative overflow-hidden">
        
        {/* ✨ Success Popup Overlay */}
        {successMsg && <SuccessPopup message={successMsg} />}

        {/* Back Button */}
        {viewMode === 'email' && !successMsg && (
            <button onClick={() => setViewMode('social')} className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors">
                <FaArrowLeft className="text-xl" />
            </button>
        )}

        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <FaLaptopCode className="text-blue-400 text-5xl mb-4" />
          <h1 className="text-3xl font-extrabold text-white">CodeDuel</h1>
          <p className="text-gray-400 mt-2">Create your account</p>
        </div>

        {/* Error Message */}
        {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-sm text-center p-3 rounded-lg mb-6 animate-pulse">
                {error}
            </div>
        )}

        {/* --- Social View --- */}
        {viewMode === 'social' && (
            <div className="w-full space-y-4">
                <div className={`flex justify-center w-full transition-all duration-200 ${loadingProvider ? 'opacity-70 pointer-events-none' : 'hover:scale-[1.02]'}`}>
                    <GoogleLogin
                        onSuccess={async (cred) => {
                            setLoadingProvider("Google");
                            try {
                                const res = await axios.post(`${API_URL}/api/auth/google-login`, { token: cred.credential });
                                handleSocialSuccess(res.data);
                            } catch (err) { setError("Google signup failed"); }
                        }}
                        onError={() => setError("Google signup failed")}
                        theme="filled_black" size="large" width="350px"
                    />
                </div>
                <SocialButton onClick={handleGithubClick} loading={loadingProvider === "GitHub"} provider="GitHub" icon={FaGithub}>
                    Sign up with GitHub
                </SocialButton>
                
                <div className="flex items-center py-2">
                    <div className="flex-grow border-t border-gray-700"></div><span className="mx-4 text-gray-500 text-sm">OR</span><div className="flex-grow border-t border-gray-700"></div>
                </div>
                
                <SocialButton onClick={() => setViewMode('email')} provider="Email" icon={FaEnvelope}>
                    Sign up with Email
                </SocialButton>
            </div>
        )}

        {/* --- Email Form View --- */}
        {viewMode === 'email' && (
            <form onSubmit={handleEmailRegister} className="space-y-5">
                {/* Name Input */}
                <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <FaUser/>
                    </span>
                    <input 
                        type="text" placeholder="Full Name" required
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>

                {/* Email Input */}
                <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <FaEnvelope/>
                    </span>
                    <input 
                        type="email" placeholder="Email Address" required
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                </div>

                {/* Password Input with Toggle */}
                <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <FaLock/>
                    </span>
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password" required
                        className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white cursor-pointer"
                    >
                        {showPassword ? <FaEyeSlash/> : <FaEye/>}
                    </button>
                </div>

                <button type="submit" disabled={loadingProvider} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transform active:scale-95 transition-all">
                    {loadingProvider ? "Creating Account..." : "Create Account"}
                </button>
            </form>
        )}

        <div className="mt-8 text-center text-sm text-gray-400">
          Already have an account? <button onClick={() => navigate('/login')} className="text-blue-400 hover:underline font-semibold ml-1">Log in</button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;