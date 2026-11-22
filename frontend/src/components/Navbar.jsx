import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import { 
  Compass, Sparkles, Image, Briefcase, LayoutDashboard, 
  LogIn, UserPlus, LogOut, Cpu, Menu, X, ChevronDown, User 
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, isAuthenticated, logout, engineStatus, setEngineModalOpen } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Explore', icon: Compass },
    { id: 'studio', label: 'AI Studio', icon: Sparkles, highlight: true },
    { id: 'gallery', label: 'My Gallery', icon: Image, authRequired: true },
    { id: 'campaigns', label: 'Campaigns', icon: Briefcase, authRequired: true },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, authRequired: true },
  ];

  const handleNavClick = (pageId, authRequired) => {
    if (authRequired && !isAuthenticated) {
      setActivePage('login');
    } else {
      setActivePage(pageId);
    }
    setMobileMenuOpen(false);
  };

  const engineName = engineStatus?.engine_info?.name || 'Live Diffusion';
  const isDemo = engineStatus?.engine_info?.is_demo;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sky-500/15 bg-navy-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActivePage('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-brand via-sky-500 to-sky-glow p-[1.5px] shadow-lg shadow-sky-500/20 group-hover:shadow-sky-400/40 transition">
            <div className="w-full h-full bg-navy-900 rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-sky-400 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                DestinationCampaign <span className="text-sky-400 font-bold">AI</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">Travel Marketing Visual Generator</p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden xl:flex items-center gap-1 bg-navy-900/60 p-1.5 rounded-2xl border border-navy-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.authRequired)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                    : item.highlight
                    ? 'text-sky-300 hover:text-white hover:bg-navy-800'
                    : 'text-slate-300 hover:text-white hover:bg-navy-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Theme Switcher, Engine Pill & User Menu */}
        <div className="hidden xl:flex items-center gap-2.5">
          
          {/* Visual Theme Switcher */}
          <ThemeSwitcher />

          {/* AI Engine Status Pill */}
          <button
            onClick={() => setEngineModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition shadow-sm ${
              isDemo
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-sky-500/10 border-sky-500/25 text-sky-300 hover:bg-sky-500/20'
            }`}
            title="Configure Diffusion Engine & API Keys"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDemo ? 'bg-amber-400' : 'bg-sky-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isDemo ? 'bg-amber-500' : 'bg-sky-500'}`}></span>
            </span>
            <span className="truncate max-w-[120px]">{engineName.replace('Diffusion Engine', 'Diffusion')}</span>
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Auth Controls */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-navy-900 border border-navy-700/80 hover:border-sky-500/40 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left text-xs">
                  <div className="font-semibold text-white leading-none truncate max-w-[100px]">{user?.full_name}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[100px] mt-0.5">
                    {user?.agency_name || 'Travel Agency'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-navy-900 border border-navy-700 shadow-2xl p-2 z-50 glass-panel animate-scale-in"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-navy-800 text-xs">
                    <div className="font-bold text-white">{user?.full_name}</div>
                    <div className="text-slate-400 text-[11px] truncate">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      setActivePage('dashboard');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-navy-800 transition flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-sky-400" /> Dashboard & Stats
                  </button>
                  <button
                    onClick={() => {
                      setActivePage('gallery');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-navy-800 transition flex items-center gap-2"
                  >
                    <Image className="w-4 h-4 text-sky-400" /> My Saved Visuals
                  </button>
                  <button
                    onClick={() => {
                      setEngineModalOpen(true);
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-navy-800 transition flex items-center gap-2"
                  >
                    <Cpu className="w-4 h-4 text-sky-400" /> AI Engine Settings
                  </button>
                  <div className="my-1 border-t border-navy-800"></div>
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-500/10 transition flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePage('login')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-navy-800 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => setActivePage('register')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-brand text-white text-xs font-bold shadow-lg shadow-sky-500/25 hover:brightness-110 transition"
              >
                Get Started Free
              </button>
            </div>
          )}

        </div>

        {/* Mobile Hamburger Toggle & Theme Switcher */}
        <div className="xl:hidden flex items-center gap-1.5">
          <ThemeSwitcher />
          <button
            onClick={() => setEngineModalOpen(true)}
            className="p-2 rounded-xl bg-navy-900 border border-sky-500/30 text-sky-400"
          >
            <Cpu className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="p-2 rounded-xl bg-navy-900 border border-navy-700 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden px-4 pt-2 pb-6 space-y-3 bg-navy-900/95 border-b border-navy-800">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.authRequired)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive ? 'bg-sky-500 text-white' : 'text-slate-300 hover:bg-navy-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-navy-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="px-2 text-xs text-slate-400">Signed in as {user?.email}</div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-300 text-xs font-semibold"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setActivePage('login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-xl border border-navy-700 text-xs font-semibold text-slate-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setActivePage('register');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-xl bg-sky-500 text-white text-xs font-bold"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
