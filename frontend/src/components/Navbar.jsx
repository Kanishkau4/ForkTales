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
  const [mobileOpen, setMobileOpen] = useState(false);
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

  // Close mobile menu when route changes or user clicks away
  useEffect(() => { setMobileOpen(false); }, [user]);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
        ? 'bg-black/70 backdrop-blur-xl border-b border-white/10 shadow-lg'
        : 'bg-black/40 backdrop-blur-md border-b border-white/5'
        }`}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-2 sm:py-2.5">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0" onClick={() => setMobileOpen(false)}>
            <img
              src={logoGif}
              alt="ForkTales Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-[0_0_8px_rgba(124,58,237,0.5)] group-hover:scale-110 transition-transform pixelated"
            />
            <span
              className="text-lg sm:text-2xl font-extrabold tracking-tighter text-white font-pixel uppercase group-hover:text-[#a78bfa] transition-colors"
              style={{ fontFamily: '"Pixelify Sans", system-ui' }}
            >
              ForkTales
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 text-[12px] font-medium text-gray-400 uppercase tracking-widest">
            <a href="#stories" className="hover:text-white transition-colors">Stories</a>
            <a href="#themes" className="hover:text-white transition-colors">Themes</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          </div>

          {/* Right Actions — Desktop */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-xs font-semibold uppercase tracking-wider text-gray-300"
              title={`Switch to ${language === 'english' ? 'Sinhala' : 'English'}`}
            >
              {language === 'english' ? 'EN' : 'සිංහල'}
            </button>

            {!user ? (
              <div className="flex items-center gap-2">
                <button onClick={() => onLoginClick?.('login')} className="px-4 py-1.5 rounded-xl text-sm font-semibold border border-white/20 hover:bg-white hover:text-black transition-all duration-200">
                  Login
                </button>
                <button onClick={() => onLoginClick?.('signup')} className="px-4 py-1.5 rounded-xl text-sm font-semibold bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all duration-200">
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Mana Display */}
                <div className="flex items-center gap-1.5 text-yellow-400 font-pixel text-xs bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
                  <img src={manaGif} alt="Mana" className="w-5 h-5 object-contain scale-150 origin-center" />
                  <span>{manaPoints}/5</span>
                </div>

                <Link to="/dashboard" className="flex items-center gap-2 group cursor-pointer hover:bg-white/5 p-1 pr-2 rounded-2xl transition-colors">
                  <div className="w-8 h-8 rounded-xl border border-white/10 overflow-hidden bg-white/5 transition-transform group-hover:scale-105">
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter leading-none">Adventurer</p>
                    <p className="text-xs font-semibold text-white truncate max-w-[90px]">{user.email.split('@')[0]}</p>
                  </div>
                </Link>
                <button onClick={signOut} className="px-3 py-1.5 rounded-xl text-xs font-bold border border-white/10 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest text-gray-400">
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Actions */}
          <div className="flex sm:hidden items-center gap-2">

            {!user ? (
              <>
                <button
                  onClick={toggleLanguage}
                  className="px-2 py-1 rounded-lg border border-white/10 text-xs font-semibold text-gray-300"
                >
                  {language === 'english' ? 'EN' : 'සිංහල'}
                </button>
                <button
                  onClick={() => setMobileOpen(o => !o)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {mobileOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Mobile Mana */}
                <div className="flex items-center gap-1 text-yellow-400 font-pixel text-[10px] bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                  <img src={manaGif} alt="Mana" className="w-4 h-4 object-contain scale-125 origin-center" />
                  <span>{manaPoints}</span>
                </div>

                {/* Mobile Avatar */}
                <Link to="/dashboard" className="w-8 h-8 rounded-lg border border-white/10 overflow-hidden bg-white/5">
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </Link>

                <button
                  onClick={() => setMobileOpen(o => !o)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {mobileOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-white/10 bg-black/90 backdrop-blur-xl px-4 py-4 space-y-3">
            {user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 px-2">
                  <span className="text-sm font-semibold text-gray-300">Language</span>
                  <button onClick={toggleLanguage} className="px-3 py-1 rounded-lg border border-white/10 text-xs font-bold text-white bg-white/10">
                    {language === 'english' ? 'EN' : 'සිංහල'}
                  </button>
                </div>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="w-full text-left px-4 py-3 rounded-xl bg-white/5 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3">
                  📊 My Dashboard
                </Link>
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl bg-red-500/10 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-3">
                  🚪 Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button onClick={() => { onLoginClick?.('login'); setMobileOpen(false); }} className="w-full px-4 py-3 rounded-xl text-sm font-semibold border border-white/20 hover:bg-white hover:text-black transition-all">
                  Login
                </button>
                <button onClick={() => { onLoginClick?.('signup'); setMobileOpen(false); }} className="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-[#7c3aed] text-white hover:bg-[#6d28d9] transition-all">
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
