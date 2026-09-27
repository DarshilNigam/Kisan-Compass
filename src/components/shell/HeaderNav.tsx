import React from 'react';
import { motion } from 'framer-motion';
import { useFarm, NavigationTab } from '../../context/FarmContext';
import { Compass, Sprout, Sliders, TrendingUp, History } from 'lucide-react';

export const HeaderNav: React.FC = () => {
  const { activeTab, setActiveTab } = useFarm();

  const tabs: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'compass', label: 'COMPASS', icon: Compass },
    { id: 'field', label: 'FIELD', icon: Sprout },
    { id: 'what-if', label: 'WHAT-IF', icon: Sliders },
    { id: 'markets', label: 'MARKETS', icon: TrendingUp },
    { id: 'decisions', label: 'DECISIONS', icon: History },
  ];

  return (
    <header className="sticky top-4 z-50 w-full max-w-5xl mx-auto px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center justify-between gap-4 p-2 rounded-2xl glass-primary shadow-glass-lg border border-white/80">
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('compass')}
          className="flex items-center gap-3 pl-2 pr-4 cursor-pointer select-none group"
        >
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Compass className="w-4 h-4 text-emerald-300" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 living-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xs tracking-wider text-emerald-950 font-mono flex items-center gap-1.5">
              KISAN COMPASS
            </span>
            <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
              Farm Decision Intelligence
            </span>
          </div>
        </div>

        {/* Floating Navigation Pill Switcher */}
        <nav className="flex items-center p-1 rounded-xl bg-zinc-200/50 backdrop-blur-md border border-zinc-300/40">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors duration-200 flex items-center gap-1.5 select-none ${
                  isActive ? 'text-emerald-950 font-bold' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavHighlight"
                    className="absolute inset-0 rounded-lg bg-white shadow-sm border border-emerald-900/10"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-zinc-500'}`} />
                  <span className="tracking-wider">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right Action: Active System Status indicator */}
        <div className="hidden sm:flex items-center gap-2 pr-2">
          <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-mono text-emerald-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 living-pulse" />
            <span className="font-semibold">ENGINE ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
};
