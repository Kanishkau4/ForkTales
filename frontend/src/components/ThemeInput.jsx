import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import StoryCard from "./StoryCard";
import AnimatedSprite from "./AnimatedSprite";
import AuthModal from "./AuthModal";
import dragonSprite from "../assets/sprites/dragon_fly.png";
import heroVideo from "../assets/Hero_Video.mp4";
import { API_BASE_URL } from "../util";
import { useAuth } from "../context/AuthContext";

const DIFFICULTIES = [
    { value: "easy", label: "Easy", desc: "3–4 levels, perfect for beginners" },
    { value: "medium", label: "Medium", desc: "5–6 levels, balanced challenge" },
    { value: "hard", label: "Hard", desc: "7–8 levels, complex twists" },
];

const GENRE_CHIPS = ["Fantasy", "Sci-Fi", "Mystery", "Horror", "Adventure", "Romance"];

function ThemeInput({ onSubmit }) {
    const { user } = useAuth();
    const [theme, setTheme] = useState("");
    const [error, setError] = useState("");
    const [difficulty, setDifficulty] = useState("medium");
    const [diffOpen, setDiffOpen] = useState(false);
    const [recentStories, setRecentStories] = useState([]);
    const [loadingStories, setLoadingStories] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [manaPoints, setManaPoints] = useState(5);

    useEffect(() => {
        const fetchStories = async () => {
            setLoadingStories(true);
            try {
                const endpoint = user 
                    ? `${API_BASE_URL}/story/user/${user.id}`
                    : `${API_BASE_URL}/story/recent`;
                const { data } = await axios.get(endpoint);
                setRecentStories(data);
            } catch {
                // silently fail
            } finally {
                setLoadingStories(false);
            }
        };
        fetchStories();
    }, [user]);

    useEffect(() => {
        const fetchMana = async () => {
            if (user) {
                try {
                    const { data } = await axios.get(`${API_BASE_URL}/user/${user.id}/profile`);
                    setManaPoints(data.mana_points);
                } catch {
                    // silently fail
                }
            }
        };
        fetchMana();
        window.addEventListener('manaUpdate', fetchMana);
        return () => window.removeEventListener('manaUpdate', fetchMana);
    }, [user]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        // Auth gate — require login to create a story
        if (!user) {
            setAuthMode('login');
            setShowAuthModal(true);
            return;
        }

        const input = theme.trim();
        if (!input) {
            setError("Please enter a story theme");
            return;
        }

        if (manaPoints <= 0) {
            setError("Not enough Mana to cast this spell. Wait until tomorrow!");
            return;
        }

        // Fire event to deduct mana optimistically in UI (or wait for next fetch)
        onSubmit(input, difficulty);
        setTimeout(() => window.dispatchEvent(new Event('manaUpdate')), 1000);
    };

    const selectedDiff = DIFFICULTIES.find(d => d.value === difficulty) || DIFFICULTIES[1];

    return (
        <div className="relative min-h-screen bg-[#05020a] text-white selection:bg-[#7c3aed] selection:text-white">
            <Navbar onLoginClick={(mode) => { setAuthMode(mode); setShowAuthModal(true); }} />

            {/* Auth Modal */}
            {showAuthModal && <AuthModal initialMode={authMode} onClose={() => setShowAuthModal(false)} />}

            {/* ── Hero Section ── */}
            <div className="relative h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">

                {/* Background Video — light overlay */}
                <div className="absolute inset-0">
                    <video
                        autoPlay loop muted playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-85"
                    >
                        <source src={heroVideo} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-[#05020a]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_0%,rgba(5,2,10,0.55)_100%)]" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-4xl space-y-5 mt-8">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-1.5 rounded-full text-xs font-semibold text-gray-200 tracking-widest uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] animate-pulse inline-block" />
                        AI-Powered Interactive Stories
                    </div>

                    {/* Heading */}
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]">
                        The World's First <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#a78bfa] via-white to-[#7c3aed]">
                            AI Story Adventure
                        </span>
                    </h1>

                    <p className="text-base md:text-lg text-gray-300 tracking-wide max-w-xl mx-auto drop-shadow-md">
                        Choose your path. Shape your fate. Every story is yours.
                    </p>

                    {/* Input Box */}
                    <div className="pt-4 w-full max-w-2xl mx-auto">
                        <form onSubmit={handleSubmit} className="relative group w-full">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#7c3aed]/40 to-[#a78bfa]/20 rounded-2xl blur-md group-hover:opacity-100 opacity-60 transition duration-500" />

                            <div className="relative flex items-center bg-[#0e0e14]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2.5 pl-5 shadow-2xl">
                                {/* Book icon */}
                                <div className="text-gray-500 mr-3 shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>

                                <input
                                    type="text"
                                    id="story-theme-input"
                                    placeholder="Enter your story theme... (e.g. Space Pirates, Dragon Quest)"
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none text-sm md:text-base font-medium text-white placeholder:text-gray-600 h-10"
                                />

                                {/* Difficulty Dropdown */}
                                <div className="relative shrink-0">
                                    <button
                                        type="button"
                                        id="difficulty-selector"
                                        onClick={() => setDiffOpen(!diffOpen)}
                                        className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border-l border-white/10 px-3 py-2 mx-2 rounded-lg text-xs font-semibold text-gray-400 transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                        {selectedDiff.label}
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform ${diffOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    {diffOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-52 bg-[#111]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                                            {DIFFICULTIES.map(d => (
                                                <button
                                                    key={d.value}
                                                    type="button"
                                                    onClick={() => { setDifficulty(d.value); setDiffOpen(false); }}
                                                    className={`w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 ${difficulty === d.value ? 'bg-[#7c3aed]/20' : ''}`}
                                                >
                                                    <div className={`text-sm font-semibold ${difficulty === d.value ? 'text-[#a78bfa]' : 'text-gray-300'}`}>{d.label}</div>
                                                    <div className="text-[10px] text-gray-500 mt-0.5">{d.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Submit / Auth gate button */}
                                <button
                                    type="submit"
                                    id="generate-story-btn"
                                    disabled={user && manaPoints <= 0}
                                    title={!user ? "Login to generate a story" : (manaPoints <= 0 ? "Out of Mana" : "Generate story")}
                                    className={`w-10 h-10 flex items-center justify-center text-white rounded-xl shadow-[0_0_16px_rgba(124,58,237,0.5)] transition-all duration-300 shrink-0 ${user && manaPoints <= 0 ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-[#7c3aed] hover:bg-[#6d28d9] hover:scale-105 active:scale-95'}`}
                                >
                                    {!user ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {error && (
                                <p className={`absolute -bottom-7 left-4 font-medium text-xs ${error.includes('Mana') ? 'text-yellow-400 font-pixel' : 'text-red-400'}`}>{error}</p>
                            )}
                        </form>
                    </div>

                    {/* Not logged in hint */}
                    {!user && (
                        <p className="text-gray-600 text-xs pt-2">
                            <button onClick={() => setShowAuthModal(true)} className="text-[#a78bfa] hover:underline">Sign in</button> to generate your own story
                        </p>
                    )}

                    {/* Genre chips */}
                    <div className="flex flex-wrap justify-center gap-2 pt-1">
                        {GENRE_CHIPS.map(g => (
                            <button
                                key={g}
                                onClick={() => setTheme(g)}
                                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Recent Stories Section ── */}
            <div id="stories" className="relative z-10 max-w-7xl mx-auto px-6 pb-24 space-y-10">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
                        Stories People Love
                    </h2>
                    <p className="text-gray-500 text-sm">Dive into an adventure someone else started — or create your own</p>
                </div>

                {loadingStories ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="glass rounded-xl overflow-hidden animate-pulse">
                                <div className="aspect-video bg-white/5" />
                                <div className="p-4 space-y-3">
                                    <div className="h-3 bg-white/10 rounded w-3/4" />
                                    <div className="h-2 bg-white/5 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : recentStories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recentStories.map((story) => (
                            <StoryCard key={story.id} story={story} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "Dragon's Last Stand", theme: "Fantasy", desc: "A dragon faces extinction in a world that no longer believes in magic." },
                            { title: "Void Station", theme: "Sci-Fi", desc: "A crew of 3 must survive after their ship drifts into a silent zone of space." },
                            { title: "The Clockmaker's Secret", theme: "Mystery", desc: "Every clock in town stops at exactly 3:17am — and nobody knows why." },
                            { title: "Neon Samurai", theme: "Adventure", desc: "A samurai wakes up in a cyberpunk city with no memory of who they are." },
                        ].map((s, i) => (
                            <StoryCard key={i} story={{ id: null, title: s.title, theme: s.theme, desc: s.desc }} demo />
                        ))}
                    </div>
                )}
            </div>

            {/* Scanline CRT effect */}
            <div className="fixed inset-0 pointer-events-none z-[60] opacity-[0.025] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.01),rgba(0,0,255,0.04))] bg-[length:100%_2px,3px_100%]" />
        </div>
    );
}

export default ThemeInput;