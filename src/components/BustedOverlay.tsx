import React from 'react';
import { RotateCcw, ShieldAlert } from 'lucide-react';
import {
  BANK_DEBT_TRIGGER_INR,
  COURT_BAIL_FEE_INR,
  formatRs,
} from '../types/game';

interface BustedOverlayProps {
  reason: string;
  confiscated: string[];
  hasGunLicense: boolean;
  cash: number;
  onRespawn: () => void;
}

export const BustedOverlay: React.FC<BustedOverlayProps> = ({
  reason,
  confiscated,
  hasGunLicense,
  cash,
  onRespawn,
}) => {
  const projectedBalance = cash - COURT_BAIL_FEE_INR;
  const triggersBankBailout = projectedBalance <= BANK_DEBT_TRIGGER_INR;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#060911]/85 p-6">
      <div className="max-w-md w-full bg-[#101520] border border-sky-500/60 p-7 flex flex-col items-center text-center gap-5 shadow-2xl">
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2 text-sky-400">
            <ShieldAlert className="w-7 h-7" />
            <h2 className="font-display text-5xl font-bold tracking-widest text-sky-400">
              BUSTED
            </h2>
          </div>
          <p className="text-sm text-slate-300">
            {reason || 'Police ne aapko giraftar karke Thana / Court bhej diya.'}
          </p>
        </div>

        <div className="w-full grid grid-cols-2 gap-3 py-3 border-y border-slate-800 text-xs">
          <div className="flex flex-col">
            <span className="text-slate-400">THANA / COURT BAIL</span>
            <span className="font-mono-num text-lg font-bold text-amber-400">
              -{formatRs(COURT_BAIL_FEE_INR)}
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

        <div className="w-full text-left bg-[#0B0E14] border border-slate-800 p-3 text-xs space-y-1.5">
          {confiscated.length > 0 ? (
            <div className="text-red-300 font-medium">
              Unlicensed Weapons Confiscated: {confiscated.join(', ')}
            </div>
          ) : hasGunLicense ? (
            <div className="text-emerald-300 font-medium">
              Valid Arms License Verified — Firearms Returned at Bail Counter.
            </div>
          ) : (
            <div className="text-slate-300 font-medium">
              No Illegal Firearms Found — Bare Fists Released.
            </div>
          )}
          <div className="text-[11px] text-slate-400 leading-relaxed">
            Royal Bank Savings, Fixed Deposits, in-game Day/Time, and parked vehicles remain untouched.
          </div>
        </div>

        <button
          type="button"
          onClick={onRespawn}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-display font-bold text-sm tracking-wider transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>
            {triggersBankBailout ? 'Report to Royal Bank Of India' : 'Release Outside Thana / Court'}
          </span>
        </button>
      </div>
    </div>
  );
};
