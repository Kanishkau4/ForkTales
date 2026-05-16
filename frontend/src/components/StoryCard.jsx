import React from 'react';
import { useNavigate } from 'react-router-dom';

// Map genres to accent colors
const THEME_COLORS = {
    Fantasy:   { bg: 'from-purple-900/60 to-purple-700/20', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: '🐉' },
    'Sci-Fi':  { bg: 'from-cyan-900/60 to-cyan-700/20',    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',       icon: '🚀' },
    Mystery:   { bg: 'from-yellow-900/60 to-yellow-700/20', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: '🔍' },
    Horror:    { bg: 'from-red-900/60 to-red-800/20',       badge: 'bg-red-500/20 text-red-300 border-red-500/30',         icon: '👻' },
    Adventure: { bg: 'from-green-900/60 to-green-700/20',   badge: 'bg-green-500/20 text-green-300 border-green-500/30',   icon: '⚔️' },
    Romance:   { bg: 'from-pink-900/60 to-pink-700/20',     badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30',      icon: '💌' },
};

const DEFAULT_COLORS = {
    bg: 'from-indigo-900/60 to-indigo-700/20',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    icon: '📖'
};

const StoryCard = ({ story, demo = false }) => {
    const navigate = useNavigate();
    const { title, theme, desc, created_at, id, cover_image } = story;
    const colors = THEME_COLORS[theme] || DEFAULT_COLORS;

    // Use backend generated cover image if available, otherwise fallback
    const seed = Math.floor(Math.random() * 999999);
    const coverUrl = cover_image || `https://image.pollinations.ai/prompt/16-bit+pixel+art+cover+for+${encodeURIComponent(theme ?? 'adventure')}+story?width=400&height=220&seed=${seed}&nologo=true`;

    const handleClick = () => {
        if (!demo && id) navigate(`/story/${id}`);
    };

    return (
        <div
            id={`story-card-${id ?? title?.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={handleClick}
            className={`glass rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_32px_rgba(124,58,237,0.25)] border border-white/5 hover:border-[#7c3aed]/40 ${demo ? 'opacity-70' : ''}`}
        >
            {/* Cover Image */}
            <div className="relative aspect-video overflow-hidden">
                <img
                    src={coverUrl}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                />
                {/* Gradient overlay on image */}
                <div className={`absolute inset-0 bg-gradient-to-t ${colors.bg} opacity-60`} />

                {/* Genre badge */}
                <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${colors.badge} backdrop-blur-sm`}>
                    {colors.icon} {theme}
                </div>

                {demo && (
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-pixel text-gray-400 uppercase">
                        Sample
                    </div>
                )}
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-white truncate leading-snug group-hover:text-[#a78bfa] transition-colors">
                    {title}
                </h3>

                {desc && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {desc}
                    </p>
                )}

                {created_at && (
                    <p className="text-[10px] text-gray-600">
                        {new Date(created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                )}

                {!demo && id && (
                    <div className="pt-1 flex items-center gap-1 text-[#7c3aed] text-xs font-semibold group-hover:gap-2 transition-all">
                        Play Story
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoryCard;
