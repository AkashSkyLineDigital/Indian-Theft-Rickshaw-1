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
    <div className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
      {/* Top Cinematic Letterbox Bar */}
      <div className="pointer-events-auto mx-auto w-full max-w-3xl bg-[#0B0E14]/94 border border-sky-500/60 shadow-2xl px-4 py-3 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {cutscene.phase === 'THANA_LOCKUP' ? (
              <Shield className="w-5 h-5 text-sky-400 shrink-0" />
            ) : (
              <Truck className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div>
              <div className="font-display text-sm sm:text-base font-extrabold tracking-wider text-sky-300 uppercase">
                {cutscene.title}
              </div>
              <div className="text-[11px] font-mono-num text-slate-300">
                {cutscene.stepLabel}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-[#0B0E14] text-xs font-display font-extrabold uppercase tracking-wider cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Skip Cutscene [Space]</span>
          </button>
        </div>

        {/* 4-Stage Custody Journey Indicator */}
        <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono-num">
          {CUSTODY_STEPS.map((label, idx) => {
            const active = cutscene.stepIndex === idx + 1;
            const done = cutscene.stepIndex > idx + 1;
            return (
              <div
                key={label}
                className={`px-2 py-1 border text-center truncate ${
                  active
                    ? 'bg-sky-500/25 border-sky-400 text-sky-200 font-bold'
                    : done
                      ? 'bg-emerald-950/75 border-emerald-500/60 text-emerald-300'
                      : 'bg-slate-900/90 border-slate-700 text-slate-500'
                }`}
              >
                {label}
              </div>
            );
          })}
        </div>

        <div className="w-full h-1.5 bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-sky-400 transition-all duration-150"
            style={{ width: `${Math.min(100, Math.max(0, cutscene.progressPct))}%` }}
          />
        </div>
      </div>

      {/* Bottom Subtitle Strip */}
      <div className="pointer-events-auto mx-auto w-full max-w-2xl bg-[#0B0E14]/94 border border-slate-700 shadow-2xl px-4 py-3 text-center">
        <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
          “{cutscene.subtitle}”
        </p>
      </div>
    </div>
  );
};
