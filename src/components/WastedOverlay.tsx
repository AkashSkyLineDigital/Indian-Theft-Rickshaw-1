import React from 'react';
import { RotateCcw } from 'lucide-react';
import { BANK_DEBT_TRIGGER_INR, DEATH_FEE_INR, formatRs } from '../types/game';

interface WastedOverlayProps {
  reason: string;
  kills: number;
  cash: number;
  onRespawn: () => void;
}

export const WastedOverlay: React.FC<WastedOverlayProps> = ({
  reason,
  kills,
  cash,
  onRespawn,
}) => {
  const projectedBalance = cash - DEATH_FEE_INR;
  const triggersBankBailout = projectedBalance <= BANK_DEBT_TRIGGER_INR;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#090507]/80 p-6">
      <div className="max-w-md w-full bg-[#101520] border border-red-500/50 p-7 flex flex-col items-center text-center gap-5 shadow-2xl">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-5xl font-bold tracking-widest text-red-500">
            WASTED
          </h2>
          <p className="text-sm text-slate-300">{reason || 'Neutralized in the line of fire.'}</p>
        </div>

        <div className="w-full grid grid-cols-2 gap-3 py-3 border-y border-slate-800 text-xs">
          <div className="flex flex-col">
            <span className="text-slate-400">HOSPITAL FEE</span>
            <span className="font-mono-num text-lg font-bold text-red-400">
              -{formatRs(DEATH_FEE_INR)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400">BALANCE AFTER</span>
            <span
              className={`font-mono-num text-lg font-bold ${
                projectedBalance < 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {triggersBankBailout ? '₹10,000 (Bailout)' : formatRs(projectedBalance)}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 -mt-2 leading-relaxed">
          {triggersBankBailout
            ? `Debt reached -₹50,000! You will report to Royal Bank Of India, debt resets to ₹0 with +₹10,000 advance for a Police Rescue Mission. (${kills} kills & all guns kept.)`
            : `All weapons, ammo, medkits, and stats (${kills} kills) remain intact.`}
        </p>

        <button
          type="button"
          onClick={onRespawn}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-display font-bold text-sm tracking-wider transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{triggersBankBailout ? 'Report to Royal Bank Of India' : 'Respawn at Hospital'}</span>
        </button>
      </div>
    </div>
  );
};
