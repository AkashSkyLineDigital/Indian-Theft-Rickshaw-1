import React, { useState } from 'react';
import { Home, Sparkles } from 'lucide-react';

interface HouseNamingModalProps {
  onConfirmName: (houseName: string) => void;
}

const SAMPLE_NAMES = ['Sharma Niwas', 'Shanti Bhavan', 'Akash Villa', 'Swarg Sadan'];

export const HouseNamingModal: React.FC<HouseNamingModalProps> = ({ onConfirmName }) => {
  const [nameInput, setNameInput] = useState('Sharma Niwas');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = nameInput.trim() || 'Sharma Niwas';
    onConfirmName(cleaned.slice(0, 28));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06090F]/88 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#101520] border-2 border-amber-500/80 shadow-2xl overflow-hidden"
      >
        <div className="px-5 py-4 bg-gradient-to-r from-amber-950/80 via-[#151D2B] to-amber-950/60 border-b border-amber-500/40 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/20 border border-amber-400/70 flex items-center justify-center shrink-0">
            <Home className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="text-[10px] font-mono-num uppercase tracking-widest text-amber-400 font-bold">
              Shubh Grah Pravesh · Home Base Setup
            </div>
            <h2 className="font-display text-lg font-bold text-slate-100">
              Apne Ghar Ka Naam Rakhein
            </h2>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Aapka apna Indian Family House taiyaar hai! Yeh naam aapke ghar ke main gate ki{' '}
            <span className="text-amber-300 font-semibold">Brass Nameplate</span> aur{' '}
            <span className="text-sky-300 font-semibold">GPS Map</span> par hamesha dikhega.
          </p>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="custom-house-name"
              className="text-[11px] font-mono-num uppercase tracking-wider text-slate-400 font-semibold"
            >
              Custom House Name (Max 28 chars)
            </label>
            <input
              id="custom-house-name"
              type="text"
              maxLength={28}
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Sharma Niwas, Shanti Bhavan, Akash Villa"
              className="w-full px-3.5 py-2.5 bg-[#090D16] border border-slate-600 focus:border-amber-400 focus:outline-none text-sm font-semibold text-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono-num uppercase tracking-wider text-slate-400">
              Quick Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_NAMES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setNameInput(preset)}
                  className={`px-2.5 py-1 border text-[11px] font-semibold cursor-pointer transition-colors ${
                    nameInput.trim() === preset
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-[#151D2B] border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-[#0B0E14] font-display text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Confirm Nameplate & Enter Home</span>
          </button>
        </div>
      </form>
    </div>
  );
};
