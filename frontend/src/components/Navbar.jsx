import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE_URL } from '../util';
import manaGif from '../assets/mana-spining.gif';
import logoGif from '../assets/logo.gif';

const Navbar = ({ onLoginClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [manaPoints, setManaPoints] = useState(5);

  useEffect(() => {
    const updateAvatar = () => {
      const saved = localStorage.getItem(`avatar_${user?.id || 'guest'}`);
      const config = saved ? JSON.parse(saved) : { style: 'pixel-art', seed: user?.email || 'adventurer' };
      setAvatarUrl(`https://api.dicebear.com/7.x/${config.style}/svg?seed=${encodeURIComponent(config.seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`);
    };

    updateAvatar();
    window.addEventListener('avatarUpdate', updateAvatar);

    // Fetch Mana points
    const fetchMana = async () => {
      if (user) {
        try {
          const { data } = await axios.get(`${API_BASE_URL}/user/${user.id}/profile`);
          setManaPoints(data.mana_points);
        } catch (error) {
          console.error("Failed to fetch mana", error);
        }
      }
    };

    fetchMana();
    // Allow other components to trigger a mana update
    window.addEventListener('manaUpdate', fetchMana);

    return () => {
      window.removeEventListener('avatarUpdate', updateAvatar);
      window.removeEventListener('manaUpdate', fetchMana);
    };
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 transition-all duration-300 ${scrolled
      ? 'bg-black/70 backdrop-blur-xl border-b border-white/10 shadow-lg py-1.5'
      : 'bg-black/40 backdrop-blur-md border-b border-white/5 py-2.5'
      }`}>
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 group">
        <img
          src={logoGif}
          alt="ForkTales Logo"
          className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(124,58,237,0.5)] group-hover:scale-110 transition-transform pixelated"
        />
        <span
          className="text-2xl font-extrabold tracking-tighter text-white font-pixel uppercase group-hover:text-[#a78bfa] transition-colors"
          style={{ fontFamily: '"Pixelify Sans", system-ui' }}
        >
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
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-xs font-semibold uppercase tracking-wider text-gray-300"
          title={`Switch to ${language === 'english' ? 'Sinhala' : 'English'}`}
        >
          {language === 'english' ? 'EN' : 'සිංහල'}
        </button>

        {!user ? (
          <div className="flex items-center gap-3">
            <button onClick={() => onLoginClick('login')} className="px-5 py-2 rounded-xl text-sm font-semibold border border-white/20 hover:bg-white hover:text-black transition-all duration-200">
              Login
            </button>
            <button onClick={() => onLoginClick('signup')} className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all duration-200">
              Sign Up
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">

            {/* Mana Display */}
            <div className="flex items-center gap-2 text-yellow-400 font-pixel text-xs bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 shadow-[0_0_10px_rgba(250,204,21,0.2)]">
              <img
                src={manaGif}
                alt="Mana"
                className="w-6 h-6 object-contain scale-150 origin-center"
              />
              <span>{manaPoints}/5</span>
            </div>

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
