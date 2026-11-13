import React from 'react';
import { Play, Settings } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, onOpenSettings }) => {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-start bg-gradient-to-r from-[#070A10]/90 via-[#070A10]/55 to-transparent p-8 md:p-16">
      <div className="max-w-lg flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono-num tracking-widest text-amber-400 uppercase">
            Open-World Auto-Rickshaw Sandbox
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-white">
            INDIAN THEFT RICKSHAW
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Roam the grid, commandeer Auto-Rickshaws and street cars, earn cash on the block, and evade city police intercept units.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-300 bg-[#0B0E14]/90 border border-slate-800 p-4">
          <div>
            <span className="font-mono-num text-amber-400 font-semibold">WASD</span> · Move / Drive
          </div>
          <div>
            <span className="font-mono-num text-amber-400 font-semibold">Space</span> · Jump
          </div>
          <div>
            <span className="font-mono-num text-amber-400 font-semibold">Click / J</span> · Fight / Shoot
          </div>
          <div>
            <span className="font-mono-num text-amber-400 font-semibold">F</span> · Hijack Rickshaw / Car
          </div>
          <div>
            <span className="font-mono-num text-amber-400 font-semibold">Hold Q</span> · Weapon Wheel
          </div>
          <div>
            <span className="font-mono-num text-amber-400 font-semibold">Esc</span> · Pause & Settings
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onStart}
            className="flex items-center gap-2.5 px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-[#0B0E14] font-display font-bold text-base tracking-wide transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Enter City</span>
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-5 py-3.5 bg-[#141A26] hover:bg-[#1E2638] border border-slate-700 text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
