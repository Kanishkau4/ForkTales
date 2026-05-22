import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import StoryCard from './StoryCard';
import { API_BASE_URL } from '../util';

function UserDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [myStories, setMyStories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Available pixel-art names provided by the user
    const avatarNames = [
        "Amaya", "Liliana", "Oliver", "Jade", "Nolan", 
        "Jameson", "Vivian", "Mason", "Brian", "Leo", 
        "Riley", "Luis", "Eden", "Jessica", "Avery", 
        "Katherine", "Adrian", "Leah", "Robert", "Ryan"
    ];

    // Avatar state
    const [avatarConfig, setAvatarConfig] = useState(() => {
        const saved = localStorage.getItem(`avatar_${user?.id || 'guest'}`);
        return saved ? JSON.parse(saved) : { style: 'pixel-art', seed: avatarNames[0] };
    });
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const [tempSeed, setTempSeed] = useState(avatarConfig.seed);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        const fetchStories = async () => {
            try {
                // Fetch stories specifically for this user
                const { data } = await axios.get(`${API_BASE_URL}/story/user/${user.id}`);
                setMyStories(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, [user, navigate]);

    const saveAvatar = () => {
        const newConfig = { style: 'pixel-art', seed: tempSeed };
        setAvatarConfig(newConfig);
        localStorage.setItem(`avatar_${user?.id || 'guest'}`, JSON.stringify(newConfig));
        setIsEditingAvatar(false);
        window.dispatchEvent(new Event('avatarUpdate'));
    };

    const handleTogglePublish = async (storyId) => {
        try {
            const { data } = await axios.patch(`${API_BASE_URL}/story/${storyId}/publish`);
            if (data.status === 'success') {
                setMyStories(prev => prev.map(s => 
                    s.id === storyId ? { ...s, is_published: data.is_published } : s
                ));
            }
        } catch (err) {
            console.error("Failed to toggle publish status:", err);
        }
    };

    const handleDeleteStory = async (storyId, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this story? This cannot be undone.")) return;
        try {
            await axios.delete(`${API_BASE_URL}/story/${storyId}`);
            setMyStories(prev => prev.filter(s => s.id !== storyId));
        } catch (err) {
            console.error("Failed to delete story:", err);
            alert("Failed to delete story. Please try again.");
        }
    };

    const handleShareStory = (storyId, e) => {
        e.stopPropagation();
        const url = `${window.location.origin}/story/${storyId}`;
        navigator.clipboard.writeText(url);
        alert("Story link copied to clipboard!");
    };

    if (!user) return null;

    const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(avatarConfig.seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

    // Mock stats
    const stats = {
        quests: myStories.length,
        victories: Math.floor(myStories.length * 0.3),
        deaths: Math.floor(myStories.length * 0.6)
    };

    return (
        <div className="relative min-h-screen bg-[#05020a] text-white selection:bg-[#7c3aed] selection:text-white pb-20">
            <Navbar />
            
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_0%,rgba(124,58,237,0.15)_0%,transparent_100%)]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32">
                
                {/* 1. PLAYER PROFILE SECTION */}
                <div className="bg-[#0e0e14]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-8 mb-10 sm:mb-16 shadow-[0_0_40px_rgba(124,58,237,0.1)] flex flex-col sm:flex-row items-center gap-6">
                    
                    {/* Avatar Card */}
                    <div className="relative group cursor-pointer" onClick={() => setIsEditingAvatar(true)}>
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#7c3aed] to-cyan-400 rounded-3xl blur-lg opacity-50 group-hover:opacity-100 transition duration-500" />
                        <div className="relative w-32 h-32 md:w-40 md:h-40 bg-[#111] rounded-2xl p-2 border border-white/20">
                            <img 
                                src={avatarUrl} 
                                alt="Avatar"
                                className="w-full h-full object-cover rounded-xl"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                <span className="text-[10px] font-pixel text-white uppercase tracking-widest">Edit</span>
                            </div>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left flex flex-col justify-center">
                        <div className="inline-block bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-[#a78bfa] mb-3 w-max mx-auto md:mx-0">
                            Adventurer's Guild
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">
                            {user.email.split('@')[0]}
                        </h1>
                        <p className="text-gray-400 font-retro text-lg tracking-widest uppercase">Rank: Novice Explorer</p>
                    </div>

                    {/* RPG Stats */}
                    <div className="flex gap-3 items-center justify-center w-full sm:w-auto flex-wrap sm:flex-nowrap">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[80px] sm:min-w-[100px] flex-1 sm:flex-none hover:bg-white/10 transition-colors shadow-lg">
                            <div className="text-2xl sm:text-3xl font-pixel text-[#a78bfa] mb-2">{stats.quests}</div>
                            <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-gray-500">Quests Forged</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[80px] sm:min-w-[100px] flex-1 sm:flex-none hover:bg-white/10 transition-colors shadow-lg">
                            <div className="text-2xl sm:text-3xl font-pixel text-green-400 mb-2">{stats.victories}</div>
                            <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-gray-500">Victories</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[80px] sm:min-w-[100px] flex-1 sm:flex-none hover:bg-white/10 transition-colors shadow-lg">
                            <div className="text-2xl sm:text-3xl font-pixel text-red-500 mb-2">{stats.deaths}</div>
                            <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-gray-500">Deaths</div>
                        </div>
                    </div>
                </div>

                {/* Avatar Editor Modal */}
                {isEditingAvatar && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsEditingAvatar(false)} />
                        <div className="relative bg-[#0e0e14] border border-white/10 rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Choose Your Avatar</h2>
                                <button onClick={() => setIsEditingAvatar(false)} className="text-gray-500 hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                                {avatarNames.map(name => (
                                    <button 
                                        key={name}
                                        onClick={() => setTempSeed(name)}
                                        className={`relative group rounded-xl border-2 transition-all p-1 ${tempSeed === name ? 'border-[#7c3aed] bg-[#7c3aed]/10' : 'border-white/5 hover:border-white/20 bg-white/5'}`}
                                    >
                                        <img 
                                            src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                                            alt={name} 
                                            className="w-full aspect-square rounded-lg" 
                                        />
                                        <div className={`absolute bottom-0 left-0 right-0 py-0.5 text-[8px] font-bold uppercase tracking-tighter text-center rounded-b-lg ${tempSeed === name ? 'bg-[#7c3aed] text-white' : 'bg-black/60 text-gray-400'}`}>
                                            {name}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setIsEditingAvatar(false)} className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Cancel</button>
                                <button onClick={saveAvatar} className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all">Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. MY ADVENTURES SECTION */}
                <div className="space-y-8">
                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">My Adventures</h2>
                            <p className="text-gray-500 text-sm">Your private library of generated tales.</p>
                        </div>
                        <button onClick={() => navigate('/')} className="hidden sm:flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(124,58,237,0.4)]">
                            <span>+</span> New Quest
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {myStories.map((story) => (
                                <div key={story.id} className="relative group flex flex-col h-full">
                                    <StoryCard story={story} />
                                    
                                    {/* Overlay Actions on Hover */}
                                    <div className="absolute inset-0 bg-[#05020a]/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex flex-col items-center justify-center p-6 z-20 border border-white/10">
                                        
                                        <div className="flex w-full gap-2 mb-4">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); navigate(`/story/${story.id}`); }}
                                                className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-2 rounded-xl transition-all uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:-translate-y-0.5"
                                            >
                                                Play
                                            </button>
                                            <button 
                                                onClick={(e) => handleDeleteStory(story.id, e)}
                                                className="w-10 h-10 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all flex items-center justify-center shrink-0"
                                                title="Delete Story"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            {story.is_published && (
                                                <button 
                                                    onClick={(e) => handleShareStory(story.id, e)}
                                                    className="w-10 h-10 bg-blue-500/20 hover:bg-blue-500 text-blue-500 hover:text-white rounded-xl transition-all flex items-center justify-center shrink-0"
                                                    title="Copy Share Link"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                        
                                        <label className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 p-3 rounded-xl cursor-pointer transition-colors border border-white/10 mt-auto">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {story.is_published ? "Published 🌍" : "Private 🔒"}
                                            </span>
                                            <div className="relative">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={story.is_published || false}
                                                    onChange={(e) => { e.stopPropagation(); handleTogglePublish(story.id); }}
                                                />
                                                <div className="w-9 h-5 bg-black border border-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7c3aed] peer-checked:after:bg-white"></div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserDashboard;
