import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onLoginClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const updateAvatar = () => {
        const saved = localStorage.getItem(`avatar_${user?.id || 'guest'}`);
        const config = saved ? JSON.parse(saved) : { style: 'pixel-art', seed: user?.email || 'adventurer' };
        setAvatarUrl(`https://api.dicebear.com/7.x/${config.style}/svg?seed=${encodeURIComponent(config.seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`);
    };

    updateAvatar();
    window.addEventListener('avatarUpdate', updateAvatar);
    return () => window.removeEventListener('avatarUpdate', updateAvatar);
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-3 transition-all duration-300 ${scrolled
      ? 'bg-black/70 backdrop-blur-xl border-b border-white/10 shadow-lg'
      : 'bg-black/40 backdrop-blur-md border-b border-white/5'
      }`}>
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#7c3aed] to-[#4f1fb8] shadow-[0_0_12px_rgba(124,58,237,0.5)] group-hover:shadow-[0_0_20px_rgba(124,58,237,0.8)] transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <span className="text-lg font-bold tracking-tight text-white font-pixel uppercase group-hover:text-[#a78bfa] transition-colors">
          ForkTales
        </span>
      </Link>

      {/* Nav Links */}
      <div className="hidden lg:flex items-center gap-8 text-[12px] font-medium text-gray-400 uppercase tracking-widest">
        <a href="#stories" className="hover:text-white transition-colors hover:text-shadow">Stories</a>
        <a href="#themes" className="hover:text-white transition-colors">Themes</a>
        <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
        <a href="#community" className="hover:text-white transition-colors">Community</a>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-tight cursor-pointer hover:text-white transition-colors mr-2">
          <span className="text-lg">📖</span>
          Featured
        </div>
        {!user ? (
          <div className="flex items-center gap-3">
            <button onClick={onLoginClick} className="px-5 py-2 rounded-xl text-sm font-semibold border border-white/20 hover:bg-white hover:text-black transition-all duration-200">
              Login
            </button>
            <button onClick={onLoginClick} className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all duration-200">
              Sign Up
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2 group cursor-pointer hover:bg-white/5 p-1 pr-3 rounded-2xl transition-colors">
              <div className="w-9 h-9 rounded-xl border border-white/10 overflow-hidden bg-white/5 transition-transform group-hover:scale-105 group-hover:shadow-[0_0_10px_rgba(124,58,237,0.3)]">
                <img 
                  src={avatarUrl} 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter leading-none group-hover:text-[#a78bfa] transition-colors">Adventurer</p>
                <p className="text-xs font-semibold text-white truncate max-w-[100px]">{user.email.split('@')[0]}</p>
              </div>
            </Link>
            <button onClick={signOut} className="px-4 py-2 rounded-xl text-xs font-bold border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 uppercase tracking-widest text-gray-400">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
