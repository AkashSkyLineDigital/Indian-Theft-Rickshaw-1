import React, { useEffect } from 'react';
import { BedDouble, Landmark, Moon, ShieldAlert, SkipForward, Sunrise } from 'lucide-react';
import { SleepCutsceneHud } from '../types/game';

interface SleepCutsceneOverlayProps {
  cutscene: SleepCutsceneHud;
  houseName: string | null;
  dayCount: number;
  formattedTime: string;
  probationDaysLeft: number;
  onSkip: () => void;
}

const SLEEP_STEPS: { id: SleepCutsceneHud['phase']; label: string }[] = [
  { id: 'LYING_DOWN', label: '1. Getting Into Bed' },
  { id: 'NIGHT_REST', label: '2. Deep Night Rest' },
  { id: 'MORNING_WAKE', label: '3. Morning Wake-Up' },
];

export const SleepCutsceneOverlay: React.FC<SleepCutsceneOverlayProps> = ({
  cutscene,
  houseName,
  dayCount,
  formattedTime,
  probationDaysLeft,
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

  const isJail = cutscene.location === 'JAIL_BUNK';
  const stepIndex =
    cutscene.phase === 'LYING_DOWN' ? 1 : cutscene.phase === 'NIGHT_REST' ? 2 : 3;
  const veilOpacity =
    cutscene.phase === 'NIGHT_REST' ? 0.56 : cutscene.phase === 'LYING_DOWN' ? 0.22 : 0.14;

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
      {/* Soft atmospheric night-to-dawn scrim (never blocks 3D bed & room view) */}
      <div
        className="fixed inset-0 transition-opacity duration-500 pointer-events-none"
        style={{
          backgroundColor: isJail ? '#040812' : '#09060c',
          opacity: veilOpacity,
        }}
      />

      {/* Top Cutscene Header */}
      <div
        className={`relative pointer-events-auto mx-auto w-full max-w-3xl bg-[#0B0E14]/94 border shadow-2xl px-4 py-3 flex flex-col gap-2.5 ${
          isJail ? 'border-sky-500/70' : 'border-amber-500/70'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {cutscene.phase === 'MORNING_WAKE' ? (
              <Sunrise
                className={`w-5 h-5 shrink-0 ${isJail ? 'text-sky-300' : 'text-amber-300'}`}
              />
            ) : cutscene.phase === 'NIGHT_REST' ? (
              <Moon
                className={`w-5 h-5 shrink-0 ${isJail ? 'text-sky-300' : 'text-amber-300'}`}
              />
            ) : (
              <BedDouble
                className={`w-5 h-5 shrink-0 ${isJail ? 'text-sky-400' : 'text-amber-400'}`}
              />
            )}
            <div>
              <div
                className={`font-display text-sm sm:text-base font-extrabold tracking-wider uppercase ${
                  isJail ? 'text-sky-300' : 'text-amber-300'
                }`}
              >
                {cutscene.title}
              </div>
              <div className="text-[11px] font-mono-num text-slate-300">
                {isJail ? 'Central Jail Cell' : houseName ?? 'Apna Ghar Bedroom'} · Day {dayCount}{' '}
                · {formattedTime} · {cutscene.stageLabel}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-[#0B0E14] text-xs font-display font-extrabold uppercase tracking-wider cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Wake Up Now [Space]</span>
          </button>
        </div>

        {/* 3-Phase Sleep Cycle Indicator */}
        <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono-num">
          {SLEEP_STEPS.map((st, idx) => {
            const active = stepIndex === idx + 1;
            const done = stepIndex > idx + 1;
            return (
              <div
                key={st.id}
                className={`px-2 py-1 border text-center truncate ${
                  active
                    ? isJail
                      ? 'bg-sky-500/25 border-sky-400 text-sky-200 font-bold'
                      : 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold'
                    : done
                      ? 'bg-emerald-950/75 border-emerald-500/60 text-emerald-300'
                      : 'bg-slate-900/90 border-slate-700 text-slate-500'
                }`}
              >
                {st.label}
              </div>
            );
          })}
        </div>

        <div className="w-full h-1.5 bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${
              isJail ? 'bg-sky-400' : 'bg-amber-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, cutscene.progressPct))}%` }}
          />
        </div>
      </div>

      {/* Bottom Subtitle & Economy / Probation Status */}
      <div className="relative pointer-events-auto mx-auto w-full max-w-2xl bg-[#0B0E14]/94 border border-slate-700 shadow-2xl px-4 py-3 flex flex-col items-center gap-1.5 text-center">
        <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
          {cutscene.subtitle}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono-num">
          {probationDaysLeft > 0 ? (
            <span className="flex items-center gap-1 text-red-300">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>
                Court Probation Active ({probationDaysLeft}d remaining) · Royal Bank Interest Frozen
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-300">
              <Landmark className="w-3.5 h-3.5" />
              <span>Royal Bank Savings &amp; FD Daily Interest Settling</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
