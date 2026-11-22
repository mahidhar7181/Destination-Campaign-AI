import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, Check, ChevronDown } from 'lucide-react';

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeTheme = themes.find((t) => t.id === theme) || themes[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-sky-500/25 bg-navy-900/80 hover:bg-navy-800 text-xs font-semibold transition text-slate-200 shadow-sm"
        title="Switch Visual Theme"
      >
        <span className="text-sm">{activeTheme.icon}</span>
        <span className="hidden sm:inline font-medium">{activeTheme.name.split(' ')[0]}</span>
        <div
          className="w-2.5 h-2.5 rounded-full border border-white/20"
          style={{ backgroundColor: activeTheme.accentColor }}
        ></div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-navy-900 border border-navy-700 shadow-2xl p-2 z-50 glass-panel animate-scale-in">
          <div className="px-3 py-2 border-b border-navy-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Visual Theme</span>
            <Palette className="w-3.5 h-3.5 text-sky-400" />
          </div>

          <div className="space-y-1 pt-1.5">
            {themes.map((t) => {
              const isSelected = t.id === theme;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-sky-500/15 border border-sky-500/40 font-bold text-sky-400'
                      : 'hover:bg-navy-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base">{t.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{t.name}</span>
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: t.accentColor }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal truncate">
                        {t.description}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-sky-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
