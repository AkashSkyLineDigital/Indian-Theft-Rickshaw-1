import React from 'react';
import { Play, Settings } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, onOpenSettings }) => {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-start bg-gradient-to-r from-[#070A10]/92 via-[#070A10]/60 to-transparent p-4 sm:p-8 md:p-16 overflow-y-auto">
      <div className="max-w-lg w-full flex flex-col gap-4 sm:gap-6 my-auto">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <span className="text-[clamp(10px,2vw,12px)] font-mono-num tracking-widest text-amber-400 uppercase">
            Open-World Auto-Rickshaw Sandbox
          </span>
          <h1 className="font-display text-[clamp(2rem,7vw,3.75rem)] leading-[0.95] font-bold tracking-tight text-white">
            INDIAN THEFT RICKSHAW
          </h1>
          <p className="text-[clamp(0.8125rem,2.4vw,1rem)] text-slate-300 leading-relaxed">
            Roam the grid, commandeer Auto-Rickshaws and street cars, earn cash on the block, and evade city police intercept units — full keyboard &amp; mobile touch support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[clamp(11px,2.2vw,12px)] text-slate-300 bg-[#0B0E14]/90 border border-slate-800 p-3 sm:p-4">
          <div>
            <span className="font-mono-num text-amber-400 font-semibold">WASD / Touch Stick</span> · Move / Drive
          </div>
          <div>
            <span className="font-mono-num text-amber-400 font-semibold">Space / JUMP</span> · Jump
          </div>
          <div>
            <span className="font-mono-num text-amber-400 font-semibold">Click / J / FIRE</span> · Fight / Shoot
          </div>
          <div>
            <span className="font-mono-num text-amber-400 font-semibold">F / CAR</span> · Hijack Rickshaw / Car
          </div>
          <div>
            <span className="font-mono-num text-amber-400 font-semibold">Q / GUNS</span> · Weapon Wheel
          </div>
          <div>
            <span className="font-mono-num text-amber-400 font-semibold">G / R / Esc</span> · Horn · Radio · Settings
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onStart}
            className="flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 bg-amber-500 hover:bg-amber-400 text-[#0B0E14] font-display font-bold text-[clamp(0.875rem,2.6vw,1rem)] tracking-wide transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Enter City</span>
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 bg-[#141A26] hover:bg-[#1E2638] border border-slate-700 text-slate-200 font-semibold text-[clamp(0.8125rem,2.4vw,0.875rem)] transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
