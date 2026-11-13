import React, { useMemo } from 'react';
import { formatRs } from '../types/game';

interface FictionalCashTrayProps {
  amount: number;
  direction: 'dispense' | 'insert' | null;
  animKey: number;
  label?: string;
}

interface NoteSpec {
  value: number;
  bg: string;
  border: string;
  accent: string;
  badge: string;
  sealColor: string;
}

const FICTIONAL_NOTES: NoteSpec[] = [
  {
    value: 2000,
    bg: 'from-fuchsia-950 via-purple-900 to-indigo-950',
    border: 'border-fuchsia-400/75',
    accent: 'text-fuchsia-200',
    badge: 'MM',
    sealColor: 'border-fuchsia-300 text-fuchsia-200',
  },
  {
    value: 500,
    bg: 'from-slate-800 via-stone-700 to-slate-900',
    border: 'border-amber-400/75',
    accent: 'text-amber-200',
    badge: 'D',
    sealColor: 'border-amber-300 text-amber-200',
  },
  {
    value: 100,
    bg: 'from-indigo-950 via-violet-900 to-slate-900',
    border: 'border-violet-400/75',
    accent: 'text-violet-200',
    badge: 'C',
    sealColor: 'border-violet-300 text-violet-200',
  },
  {
    value: 50,
    bg: 'from-cyan-950 via-teal-900 to-slate-900',
    border: 'border-cyan-400/75',
    accent: 'text-cyan-200',
    badge: 'L',
    sealColor: 'border-cyan-300 text-cyan-200',
  },
  {
    value: 10,
    bg: 'from-amber-950 via-orange-900 to-stone-900',
    border: 'border-orange-400/75',
    accent: 'text-orange-200',
    badge: 'X',
    sealColor: 'border-orange-300 text-orange-200',
  },
];

function breakDownNotes(rawAmount: number): NoteSpec[] {
  let rem = Math.max(0, Math.round(rawAmount));
  if (rem === 0) return [];
  const picked: NoteSpec[] = [];
  for (const spec of FICTIONAL_NOTES) {
    while (rem >= spec.value && picked.length < 5) {
      picked.push(spec);
      rem -= spec.value;
    }
  }
  if (picked.length === 0) {
    picked.push(FICTIONAL_NOTES[FICTIONAL_NOTES.length - 1]);
  }
  return picked;
}

export const FictionalCashTray: React.FC<FictionalCashTrayProps> = ({
  amount,
  direction,
  animKey,
  label,
}) => {
  const notes = useMemo(() => breakDownNotes(amount), [amount]);

  return (
    <div className="bg-[#080B10] border border-slate-700/90 p-3 flex flex-col gap-2">
      {/* Dispenser Slot Lip */}
      <div className="flex items-center justify-between text-[10px] font-mono-num text-slate-400">
        <span className="uppercase tracking-wider">Fictional Bharat Mudra Cash Tray</span>
        <span className="text-sky-400 font-semibold">SPECIMEN · NON-REAL CURRENCY</span>
      </div>
      <div className="h-2.5 bg-[#040608] border border-slate-700 shadow-inner relative overflow-hidden">
        <div
          className={`h-full w-1/2 mx-auto transition-colors duration-300 ${
            direction === 'dispense'
              ? 'bg-emerald-400/80'
              : direction === 'insert'
                ? 'bg-sky-400/80'
                : 'bg-slate-700/40'
          }`}
        />
      </div>

      {direction && notes.length > 0 ? (
        <div
          key={animKey}
          className={`relative min-h-[82px] flex flex-col items-center justify-center pt-1 ${
            direction === 'dispense' ? 'animate-cash-dispense' : 'animate-cash-insert'
          }`}
        >
          <div className="flex flex-wrap items-center justify-center gap-2 w-full">
            {notes.map((n, idx) => (
              <div
                key={`${n.value}-${idx}`}
                className={`relative w-40 h-20 bg-gradient-to-br ${n.bg} border ${n.border} px-2.5 py-1.5 flex flex-col justify-between shadow-lg select-none overflow-hidden`}
              >
                {/* Decorative geometric guilloche rings */}
                <div className="absolute -right-5 -bottom-5 w-16 h-16 rounded-full border border-white/15 pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono-num tracking-widest text-white/75 uppercase">
                    Royal Bharat Mudra
                  </span>
                  <span className={`text-xs font-mono-num font-bold ${n.accent}`}>
                    ₹{n.value}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 my-auto">
                  <div
                    className={`w-7 h-7 rounded-full border ${n.sealColor} flex items-center justify-center text-[10px] font-display font-bold bg-black/25`}
                  >
                    {n.badge}
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-display font-bold tracking-wider text-white/90">
                      FICTIONAL NOTE
                    </div>
                    <div className="text-[8px] font-mono-num text-white/60">
                      GAME CREDITS ONLY
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[8px] font-mono-num text-white/65">
                  <span>RBI-SIM {String(1042 + idx * 17)}</span>
                  <span>SPECIMEN</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[11px] font-mono-num font-bold text-emerald-300">
            {label ??
              (direction === 'dispense'
                ? `Dispensed ${formatRs(amount)} in Fictional Notes`
                : `Inserted ${formatRs(amount)} into Cash Slot`)}
          </div>
        </div>
      ) : (
        <div className="min-h-[64px] flex items-center justify-center text-[11px] font-mono-num text-slate-500 border border-dashed border-slate-800">
          {direction === null
            ? 'Select Withdraw or Deposit to activate the cash dispenser slot.'
            : 'Processing...'}
        </div>
      )}
    </div>
  );
};
