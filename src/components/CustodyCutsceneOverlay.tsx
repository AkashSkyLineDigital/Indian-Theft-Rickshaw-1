import React, { useEffect } from 'react';
import { Shield, SkipForward, Truck } from 'lucide-react';
import { CustodyCutsceneHud } from '../types/game';

interface CustodyCutsceneOverlayProps {
  cutscene: CustodyCutsceneHud;
  onSkip: () => void;
}

const CUSTODY_STEPS = [
  '1. Thana Lockup',
  '2. Van to Court',
  '3. Court Hearing',
  '4. Release / Jail',
];

export const CustodyCutsceneOverlay: React.FC<CustodyCutsceneOverlayProps> = ({
  cutscene,
  onSkip,
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onSkip();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onSkip]);

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-3 sm:p-5">
      {/* Slim Translucent Top Cutscene Ribbon */}
      <div className="pointer-events-auto mx-auto w-full max-w-3xl hud-glass rounded-xl shadow-xl px-3.5 py-2.5 flex flex-col gap-1.5 hud-text-shadow">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {cutscene.phase === 'THANA_LOCKUP' ? (
              <Shield className="w-4 h-4 text-[#FBBF24] shrink-0" />
            ) : (
              <Truck className="w-4 h-4 text-[#FBBF24] shrink-0" />
            )}
            <div className="min-w-0">
              <span className="font-display text-xs sm:text-sm font-bold tracking-wider text-[#FBBF24] uppercase">
                {cutscene.title}
              </span>
              <span className="hidden sm:inline text-white/30 mx-1.5">·</span>
              <span className="block sm:inline text-[11px] font-mono-num text-slate-200 truncate">
                {cutscene.stepLabel}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#F59E0B] hover:bg-[#FBBF24] rounded-lg text-[#0E1118] text-[11px] font-display font-extrabold uppercase tracking-wider cursor-pointer shrink-0"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Skip [Space]</span>
          </button>
        </div>

        {/* Sleek 4-Stage Progress Ribbon */}
        <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono-num">
          {CUSTODY_STEPS.map((label, idx) => {
            const active = cutscene.stepIndex === idx + 1;
            const done = cutscene.stepIndex > idx + 1;
            return (
              <div
                key={label}
                className={`px-2 py-0.5 rounded border text-center truncate ${
                  active
                    ? 'bg-amber-500/20 border-amber-400/65 text-[#FBBF24] font-bold'
                    : done
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                      : 'bg-white/[0.04] border-white/10 text-slate-300/65'
                }`}
              >
                {label}
              </div>
            );
          })}
        </div>

        <div className="w-full h-1 bg-black/45 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#F59E0B] transition-all duration-150"
            style={{ width: `${Math.min(100, Math.max(0, cutscene.progressPct))}%` }}
          />
        </div>
      </div>

      {/* Sleek Bottom Translucent Caption Bar */}
      <div className="pointer-events-auto mx-auto w-full max-w-2xl hud-glass rounded-xl shadow-xl px-4 py-2.5 text-center hud-text-shadow">
        <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
          &ldquo;{cutscene.subtitle}&rdquo;
        </p>
      </div>
    </div>
  );
};
