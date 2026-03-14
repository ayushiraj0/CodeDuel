// src/pages/UpdateProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileDataStore';
import { 
  FaCamera, FaUser, FaUniversity, FaGithub, 
  FaTrophy, FaFire, FaArrowLeft, FaSave, FaChartLine, FaStar,
  FaSignOutAlt, FaCode 
} from 'react-icons/fa';

// ------------------------------------------------------------------
// 1. RANK PROGRESS LOGIC (Updated Limit check)
// ------------------------------------------------------------------
const getNextRankInfo = (rankedPoints) => {
  // Logic: Current Points se next rank ka target set karo
  if (rankedPoints < 500)  return { next: "Bronze II", limit: 500 };
  if (rankedPoints < 800)  return { next: "Bronze III", limit: 800 };
  if (rankedPoints < 1000) return { next: "Silver I", limit: 1000 };
  if (rankedPoints < 1300) return { next: "Gold I", limit: 1300 };
  if (rankedPoints < 1500) return { next: "Platinum I", limit: 1500 };
  if (rankedPoints < 2000) return { next: "Diamond I", limit: 2000 };
  if (rankedPoints < 3200) return { next: "Grandmaster", limit: 3200 };
  
  return { next: "Max Rank", limit: rankedPoints }; 
};

const UpdateProfile = () => {
  const navigate = useNavigate();
  
  // Context se data nikalo
  const { profile: storeProfile, updateProfile, fetchUserProfile, clearProfile, loading } = useProfile();

  const [formData, setFormData] = useState({
    username: '', fullName: '', college: '', bio: '',
    preferredLanguage: 'Java', github: '', profilePic: ''
  });

  // ------------------------------------------------------------------
  // 2. AUTO FETCH ON LOAD
  // ------------------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login');
        return;
    }
    // Agar store khali hai, toh fetch karo
    if (!storeProfile) {
        fetchUserProfile();
    }
  }, [storeProfile, navigate, fetchUserProfile]);

  // ------------------------------------------------------------------
  // 3. MAP DATABASE DATA TO UI STATE
  // ------------------------------------------------------------------
  useEffect(() => {
    if (storeProfile) {
      setFormData({
        // Root level fields
        username: storeProfile.username || '',
        fullName: storeProfile.fullName || '',
        college: storeProfile.college || '',
        bio: storeProfile.bio || '',
        preferredLanguage: storeProfile.preferredLanguage || 'Java',
        github: storeProfile.github || '',
        profilePic: storeProfile.profilePic || 'https://via.placeholder.com/150'
      });
    }
  }, [storeProfile]);

  // ------------------------------------------------------------------
  // 4. STATS EXTRACTION (Safe Access)
  // ------------------------------------------------------------------
  const stats = storeProfile?.stats || {};
  
  const currentLevel = stats.level || 1;
  const currentCasualPoints = stats.points || 0;        // "points" in DB
  const currentRankedPoints = stats.rankedPoints || 0;  // "rankedPoints" in DB
  const questionsSolved = stats.questionsSolved || 0;
  const currentStreak = stats.streak || 0;
  const currentRankName = stats.rank || "Unranked";     // "rank" in DB (e.g. "Bronze I")

  // Progress Bar Calc
  const { next, limit } = getNextRankInfo(currentRankedPoints);
  const progressPercent = limit > 0 
    ? Math.min((currentRankedPoints / limit) * 100, 100) 
    : 100;

  // ------------------------------------------------------------------
  // 5. HANDLERS
  // ------------------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const result = await updateProfile(formData);
    if (result.success) {
      alert("Profile Updated Successfully!");
      navigate('/'); 
    } else {
      alert("Error updating profile: " + result.message);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      if (clearProfile) clearProfile();
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  if (loading && !storeProfile) {
      return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading Profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      
      {/* HEADER */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <button onClick={() => navigate('/')} className="flex items-center text-gray-400 hover:text-white transition group">
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        <button onClick={handleSave} className="flex items-center px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5">
          <FaSave className="mr-2" /> Save Changes
        </button>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          
          <div className="bg-gray-800 p-6 rounded-xl flex flex-col items-center border border-gray-700 shadow-lg">
            <div className="relative group">
              <img 
                src={formData.profilePic} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-md"
              />
              <label htmlFor="file-upload" className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-500 transition shadow-lg transform hover:scale-110">
                <FaCamera className="text-white text-sm" />
              </label>
              <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            
            <h2 className="mt-4 text-xl font-bold">{formData.fullName || formData.username}</h2>
            <p className="text-gray-400 text-sm">@{formData.username}</p>
            
            {/* Rank Badge from DB */}
            <div className="mt-3 px-3 py-1 bg-gray-700 rounded-full text-blue-400 text-sm font-bold tracking-wide border border-gray-600">
              {currentRankName}
            </div>

            {/* Rank Progress Bar */}
            <div className="w-full mt-6">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Rank Progress</span>
                    <span>{currentRankedPoints} / {limit}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden border border-gray-600">
                    <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">
                    {next === "Max Rank" 
                      ? <span className="text-yellow-500 font-bold">Max Rank Achieved!</span> 
                      : <span>{limit - currentRankedPoints} Elo to <span className="text-yellow-500 font-bold">{next}</span></span>
                    }
                </p>
            </div>
          </div>

          {/* STATS CARD (Mapped correctly to your JSON) */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-300 border-b border-gray-700 pb-2">Battle Stats</h3>
            <div className="space-y-4">
              
              <div className="flex justify-between items-center">
                <span className="flex items-center text-gray-400"><FaTrophy className="mr-2 text-yellow-500"/> Level</span>
                <span className="font-bold text-xl">{currentLevel}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="flex items-center text-gray-400"><FaCode className="mr-2 text-green-500"/> Solved</span>
                <span className="font-bold text-xl">{questionsSolved}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="flex items-center text-gray-400"><FaStar className="mr-2 text-purple-400"/> Total XP</span>
                <span className="font-bold text-xl text-purple-400">{currentCasualPoints}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center text-gray-400"><FaChartLine className="mr-2 text-blue-400"/> Ranked Elo</span>
                <span className="font-bold text-xl text-blue-400">{currentRankedPoints}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center text-gray-400"><FaFire className="mr-2 text-orange-500"/> Streak</span>
                <span className="font-bold text-xl text-orange-400">{currentStreak} Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Edit Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-white">Edit Details</h3>
            
            {/* Username & Full Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Username</label>
                <div className="relative">
                  <FaUser className="absolute top-3 left-3 text-gray-500" />
                  <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition" />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500 transition" />
              </div>
            </div>

            {/* College */}
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">College / University</label>
              <div className="relative">
                <FaUniversity className="absolute top-3 left-3 text-gray-500" />
                <input type="text" name="college" value={formData.college} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition" />
              </div>
            </div>

            {/* Language */}
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">Preferred Language</label>
              <select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500 transition">
                <option value="C++">C++</option>
                <option value="Java">Java</option>
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
              </select>
            </div>

            {/* Github */}
            <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">GitHub URL</label>
                <div className="relative">
                  <FaGithub className="absolute top-3 left-3 text-gray-500" />
                  <input type="text" name="github" value={formData.github} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition" />
                </div>
            </div>

            {/* Bio */}
            <div className="mb-8">
              <label className="block text-gray-400 text-sm mb-2">Bio</label>
              <textarea name="bio" rows="4" value={formData.bio} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500 transition"></textarea>
            </div>

            {/* Logout Button */}
            <div className="flex justify-end border-t border-gray-700 pt-6 mt-6">
                <button 
                  type="button" 
                  onClick={handleLogout} 
                  className="flex items-center text-red-500 hover:text-red-400 font-semibold transition hover:bg-red-500/10 px-4 py-2 rounded-lg"
                >
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;