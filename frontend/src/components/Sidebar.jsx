import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, Image, Briefcase, LayoutDashboard, 
  Cpu, Compass, Plus, ShieldCheck, Heart 
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage }) {
  const { user, engineStatus, setEngineModalOpen } = useAuth();

  const links = [
    { id: 'studio', label: 'Visual Studio', icon: Sparkles, badge: 'AI Engine' },
    { id: 'gallery', label: 'My Saved Gallery', icon: Image },
    { id: 'campaigns', label: 'Campaign Kits', icon: Briefcase },
    { id: 'dashboard', label: 'Agency Analytics', icon: LayoutDashboard },
  ];

  const engineName = engineStatus?.engine_info?.name || 'Live Diffusion';
  const isDemo = engineStatus?.engine_info?.is_demo;

  return (
    <aside className="w-64 flex-shrink-0 hidden xl:flex flex-col justify-between p-4 bg-navy-950/60 border-r border-sky-500/10 min-h-[calc(100vh-4.5rem)]">
      
      {/* Top Navigation */}
      <div className="space-y-6">
        
        {/* Quick Launch CTA */}
        <button
          onClick={() => setActivePage('studio')}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-brand to-sky-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all duration-300"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate New Visual</span>
        </button>

        {/* Links */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Workspace
          </div>

          {links.map((link) => {
            const Icon = link.icon;
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActivePage(link.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-navy-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                    isActive ? 'bg-white/20 text-white' : 'bg-sky-500/10 text-sky-400'
                  }`}>
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Destinations Inspiration */}
        <div className="p-3.5 rounded-2xl bg-navy-900/50 border border-navy-800 space-y-2">
          <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
            <span>Destination Inspiration</span>
            <span className="text-[10px] text-sky-400">Explore the world</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Maldives', 'Swiss Alps', 'Santorini', 'Kyoto', 'Amalfi Coast', 'Bali'].map((dest) => (
              <button
                key={dest}
                onClick={() => setActivePage('studio')}
                className="px-2 py-1 rounded-lg bg-navy-950/70 hover:bg-sky-500/20 border border-white/5 hover:border-sky-500/30 text-[10px] text-slate-300 hover:text-sky-300 transition"
              >
                {dest}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Profile & AI Status Card */}
      <div className="space-y-3 pt-4 border-t border-navy-800">
        
        {/* Engine status widget */}
        <div 
          onClick={() => setEngineModalOpen(true)}
          className="p-3 rounded-2xl bg-navy-900/60 border border-sky-500/15 hover:border-sky-500/30 cursor-pointer transition space-y-1.5"
        >
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-400" /> AI Provider
            </span>
            <span className="text-[10px] text-sky-400 hover:underline">Config</span>
          </div>
          <div className="text-xs font-bold text-white truncate">
            {engineName}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isDemo ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
            {isDemo ? 'Offline Presets Active' : 'Diffusion Active'}
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0">
            {user?.full_name ? user.full_name[0].toUpperCase() : 'A'}
          </div>
          <div className="text-left text-xs truncate">
            <div className="font-bold text-slate-200 truncate">{user?.full_name || 'Travel Creator'}</div>
            <div className="text-[10px] text-slate-400 truncate">{user?.agency_name || 'Marketing Team'}</div>
          </div>
        </div>

      </div>

    </aside>
  );
}
