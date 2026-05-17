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
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../util/translations";
import catGif from "../assets/cat-walking-white.gif";
import groundTile from "../assets/ground_tile.png";
import grassTile from "../assets/grass_tile.webp";

const PixelFlower = ({ color = "#ff77ff", className = "" }) => (
    <svg width="48" height="48" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" className={`pixelated ${className}`}>
        {/* 1. Dark Outline Silhouette Base */}
        <path d="M5 2h1v1H5zm5 0h1v1h-1z M4 3h3v1H4zm3 0h3v1H7zm2 0h3v1H9z M3 4h10v1H3z M3 5h10v1H3z M4 6h8v1H4z M5 7h6v1H5z M6 8h4v1H6z M7 9h2v1H7z M6 10h4v1H6z M4 11h8v1H4z M2 12h12v1H2z M3 13h10v1H3z M4 14h8v1H4z M6 15h4v1H6z" fill="#14151f" />

        {/* 2. Foliage Base (Mid Green) */}
        <path d="M7 10h2v1H7z M5 11h6v1H5z M3 12h10v1H3z M4 13h8v1H4z M6 14h4v1H6z M7 15h2v1H7z" fill="#249f4b" />

        {/* 3. Foliage Shadows (Dark Green) */}
        <path d="M7 11h2v1H7z M7 12h2v1H7zm4 0h2v1h-2z M7 13h2v1H7zm3 0h2v1h-2z M7 14h2v1H7z" fill="#115c27" />

        {/* 4. Foliage Highlights (Lime Green) */}
        <path d="M5 11h2v1H5z M3 12h3v1H3z M4 13h2v1H4z" fill="#a2f263" />

        {/* 5. Dynamic Flower Petals (Main Color) */}
        <path d="M5 3h1v1H5zm5 0h1v1h-1z M4 4h3v1H4zm5 0h3v1H9z M4 5h8v1H4z M5 6h6v1H5z M6 7h4v1H6z M7 8h2v1H7z" fill={color} />

        {/* 6. Flower Core/Center (Gold) */}
        <path d="M7 5h2v2H7z" fill="#ffd026" />

        {/* 7. Dynamic Petal Shadows (Blends over any color) */}
        <path d="M6 4h1v1H6zm5 0h1v1h-1z M9 5h3v1H9z M8 6h3v1H8z M8 7h2v1H8z M8 8h1v1H8z" fill="#000" opacity="0.2" />

        {/* 8. Dynamic Petal Highlights (Blends over any color) */}
        <path d="M5 3h1v1H5zm5 0h1v1h-1z M4 4h2v1H4zm5 0h2v1H9z M4 5h2v1H4z" fill="#fff" opacity="0.25" />
    </svg>
);

const PixelBush = ({ className = "" }) => (
    <svg width="64" height="32" viewBox="0 0 32 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" className={`pixelated ${className}`}>
        {/* Dark Shadow & Outline Base */}
        <path d="M11 2h10v1h-10z M9 3h14v1h-14z M7 4h18v1h-18z M5 5h22v1h-22z M4 6h24v1h-24z M3 7h26v1h-26z M2 8h28v1h-28z M1 9h30v7h-30z" fill="#122a18" />

        {/* Main Green Leaf Body */}
        <path d="M12 3h8v1h-8z M10 4h12v1h-12z M8 5h16v1h-16z M6 6h20v1h-20z M5 7h22v1h-22z M4 8h24v1h-24z M2 9h28v6h-28z" fill="#276e33" />

        {/* Highlight Clusters */}
        <path d="M12 4h4v1h-4z M10 5h5v1h-5z M8 6h5v1h-5z M18 6h3v1h-3z M7 7h4v1h-4z M17 7h5v1h-5z M6 8h3v1h-3z M18 8h5v1h-5z M5 9h3v1h-3z M19 9h3v1h-3z M4 10h3v1h-3z M6 11h2v1h-2z M15 11h2v1h-2z M14 12h2v1h-2z" fill="#59b357" />
    </svg>
);

// Removed static constants — now handled via translations utility

function ThemeInput({ onSubmit }) {
    const { user } = useAuth();
    const { language } = useLanguage();
    const t = translations[language];

    const staticStars = useState(() =>
        [...Array(60)].map(() => ({
            top: `${Math.random() * 80}%`, // Distributed across the sky above the ground/grass
            left: `${Math.random() * 100}%`,
            opacity: 0.12 + Math.random() * 0.48 // Darker/softer stars
        }))
    )[0];

    const [theme, setTheme] = useState("");
    const [error, setError] = useState("");
    const [difficulty, setDifficulty] = useState("easy");
    const [diffOpen, setDiffOpen] = useState(false);
    const [recentStories, setRecentStories] = useState([]);
    const [loadingStories, setLoadingStories] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [manaPoints, setManaPoints] = useState(5);
    const [placeholderText, setPlaceholderText] = useState("");
    const [typingIndex, setTypingIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentText = t.placeholders[typingIndex];
        const typingSpeed = isDeleting ? 30 : 80;

        const timeout = setTimeout(() => {
            if (!isDeleting && placeholderText === currentText) {
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && placeholderText === "") {
                setIsDeleting(false);
                setTypingIndex((prev) => (prev + 1) % t.placeholders.length);
            } else {
                setPlaceholderText(currentText.substring(0, placeholderText.length + (isDeleting ? -1 : 1)));
            }
        }, typingSpeed);

        return () => clearTimeout(timeout);
    }, [placeholderText, isDeleting, typingIndex, t.placeholders]);

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
            setError(t.themeError);
            return;
        }

        if (manaPoints <= 0) {
            setError(t.manaError);
            return;
        }

        // Fire event to deduct mana optimistically in UI (or wait for next fetch)
        onSubmit(input, difficulty);
        setTimeout(() => window.dispatchEvent(new Event('manaUpdate')), 1000);
    };

    const selectedDiff = t.difficulties.find(d => d.value === difficulty) || t.difficulties[1];

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
                        {t.badge}
                    </div>

                    {/* Heading */}
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-retro leading-tight tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]" style={{ fontFamily: '"Pixelify Sans", system-ui' }}>
                        {t.heroTitle1} <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#a78bfa] via-white to-[#7c3aed]">
                            {t.heroTitle2}
                        </span>
                    </h1>

                    <p className="text-base md:text-lg text-gray-300 tracking-wide max-w-xl mx-auto drop-shadow-md">
                        {t.heroSubtitle}
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
                                    placeholder={`${t.inputPlaceholderBase}${placeholderText}`}
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
                                            {t.difficulties.map(d => (
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
                                    title={!user ? t.loginToGenerate : (manaPoints <= 0 ? t.outOfMana : t.generateBtn)}
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
                            <button onClick={() => setShowAuthModal(true)} className="text-[#a78bfa] hover:underline">{t.signIn}</button> {t.signInToGenerate}
                        </p>
                    )}

                    {/* Genre chips */}
                    <div className="flex flex-wrap justify-center gap-2 pt-1">
                        {t.genres.map(g => (
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
                    <h2 className="text-2xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: '"Pixelify Sans", system-ui' }}>
                        {t.storiesTitle}
                    </h2>
                    <p className="text-gray-500 text-sm">{t.storiesSubtitle}</p>
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

            {/* ── Animated Retro Footer ── */}
            <footer className="relative w-full overflow-hidden bg-[#05020a] pt-32 pb-0">
                {/* Night Sky with Stars */}
                <div className="absolute inset-0 pointer-events-none opacity-30">
                    {staticStars.map((star, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white/80 rounded-full pixelated animate-star"
                            style={{
                                top: star.top,
                                left: star.left,
                                opacity: star.opacity,
                                '--duration': `${3 + (i % 5)}s`
                            }}
                        />
                    ))}
                </div>

                {/* Footer Credits */}
                <div className="relative z-30 py-8 text-center">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[10px] font-pixel text-gray-500 uppercase tracking-[0.2em]">
                            ForkTales © 2026 • Infinite Stories await
                        </p>
                        <div className="flex gap-6 text-[10px] font-pixel text-gray-600 uppercase tracking-widest">
                            <a href="#" className="hover:text-[#a78bfa] transition-colors">Privacy</a>
                            <a href="#" className="hover:text-[#a78bfa] transition-colors">Terms</a>
                            <a href="#" className="hover:text-[#a78bfa] transition-colors">Discord</a>
                        </div>
                    </div>
                </div>

                {/* Scenery Container */}
                <div className="relative h-80 w-full overflow-hidden">
                    {/* Sky Background (Static) is already handled by footer bg */}

                    {/* Night Sky with Stars */}
                    <div className="absolute inset-0 pointer-events-none opacity-30">
                        {staticStars.map((star, i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-1 bg-white/80 rounded-full pixelated animate-star"
                                style={{
                                    top: star.top,
                                    left: star.left,
                                    opacity: star.opacity,
                                    '--duration': `${3 + (i % 5)}s`
                                }}
                            />
                        ))}
                    </div>

                    {/* SVG Props layer (Flowers & Bushes) */}
                    <div className="absolute bottom-24 left-0 w-[200%] h-16 z-10 flex animate-scroll-left-transform opacity-95 items-end overflow-hidden" style={{ filter: 'brightness(0.55)' }}>
                        {[...Array(2)].map((_, groupIdx) => (
                            <div key={groupIdx} className="w-1/2 flex items-end justify-around shrink-0 px-10">
                                <PixelBush />
                                <PixelFlower color="#ff77ff" />
                                <PixelBush />
                                <PixelBush />
                                <div className="flex gap-4">
                                    <PixelFlower color="#ff77ff" />
                                    <PixelFlower color="#ff4444" />
                                    <PixelFlower color="#ffaa00" />
                                </div>
                                <PixelBush />
                                <PixelFlower color="#9d06b4" />
                                <PixelFlower color="#ff7777" />
                            </div>
                        ))}
                    </div>

                    {/* Grass layer (Moving with Gaps) */}
                    <div className="absolute bottom-24 left-0 w-[200%] h-12 z-10 flex animate-scroll-left-transform opacity-90 items-end overflow-hidden" style={{ filter: 'brightness(0.55)' }}>
                        {[...Array(2)].map((_, groupIdx) => (
                            <div key={groupIdx} className="w-1/2 flex justify-around shrink-0 px-8">
                                <img src={grassTile} alt="grass" className="h-6 object-contain pixelated" />
                                <img src={grassTile} alt="grass" className="h-6 object-contain pixelated" />
                                <img src={grassTile} alt="grass" className="h-6 object-contain pixelated" />
                                <img src={grassTile} alt="grass" className="h-6 object-contain pixelated" />
                                <img src={grassTile} alt="grass" className="h-6 object-contain pixelated" />
                            </div>
                        ))}
                    </div>

                    {/* Ground layer (Moving) */}
                    <div
                        className="absolute bottom-0 left-0 w-full h-24 animate-scroll-left z-10 pixelated"
                        style={{
                            backgroundImage: `url(${groundTile})`,
                            backgroundRepeat: 'repeat-x',
                            backgroundSize: 'auto 100%',
                            filter: 'brightness(0.55)'
                        }}
                    />

                    {/* Walking Cat */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
                        <img
                            src={catGif}
                            alt="Walking Cat"
                            className="w-44 h-44 object-contain pixelated drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                            style={{ filter: 'brightness(0.65)' }}
                        />
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default ThemeInput;