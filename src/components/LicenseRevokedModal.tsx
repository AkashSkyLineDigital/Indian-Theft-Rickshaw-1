import React from 'react';
import { Banknote, Landmark, MapPin, ShieldAlert } from 'lucide-react';
import { LicenseRevokedPromptHud, formatRs } from '../types/game';

interface LicenseRevokedModalProps {
  prompt: LicenseRevokedPromptHud;
  cash: number;
  bankSavings: number;
  onRenewAtThana: (source: 'cash' | 'bank') => void;
  onVisitDmLater: () => void;
}

export const LicenseRevokedModal: React.FC<LicenseRevokedModalProps> = ({
  prompt,
  cash,
  bankSavings,
  onRenewAtThana,
  onVisitDmLater,
}) => {
  const canCash = cash >= prompt.urgentFee;
  const canBank = bankSavings >= prompt.urgentFee;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4">
      <div className="max-w-lg w-full bg-[#0E131D] border-2 border-red-500/80 shadow-2xl p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-red-950/90 border border-red-500/70 text-red-300 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-mono-num font-bold text-red-400 uppercase tracking-wider">
              Bharat Thana No. 4 · License Suspension Notice ({prompt.starsAtArrest}★ Case)
            </div>
            <h2 className="font-display text-lg sm:text-xl font-extrabold text-white mt-0.5">
              Arms License Radd / Suspend Ho Gaya Hai!
            </h2>
          </div>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed bg-[#141B29] border border-slate-700/80 p-3.5">
          “Aapka Arms License {prompt.starsAtArrest}★ case ke karan radd/expire ho gaya hai! Kya
          aap ise abhi yahin renew karna chahte hain ya DM Office jaakar?”
        </p>

        <div className="grid grid-cols-2 gap-2.5 text-xs font-mono-num">
          <div className="bg-[#121826] border border-amber-500/50 p-3">
            <div className="text-[10px] text-amber-300 uppercase">Option A · Urgent Thana Desk</div>
            <div className="text-base font-extrabold text-amber-200 mt-0.5">
              {formatRs(prompt.urgentFee)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Instant renewal yahin counter par</div>
          </div>
          <div className="bg-[#121826] border border-sky-500/50 p-3">
            <div className="text-[10px] text-sky-300 uppercase">Option B · DM Office Later</div>
            <div className="text-base font-extrabold text-sky-200 mt-0.5">
              {formatRs(prompt.standardFee)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Standard fee · GPS route set</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-num text-slate-300">
          <span>
            Cash: <strong className="text-emerald-300">{formatRs(cash)}</strong>
          </span>
          <span>
            Royal Bank Savings: <strong className="text-sky-300">{formatRs(bankSavings)}</strong>
          </span>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!canCash}
              onClick={() => onRenewAtThana('cash')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-display font-extrabold uppercase cursor-pointer ${
                canCash
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-[#0B0E14]'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Renew Now (Cash {formatRs(prompt.urgentFee)})</span>
            </button>

            <button
              type="button"
              disabled={!canBank}
              onClick={() => onRenewAtThana('bank')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-display font-extrabold uppercase cursor-pointer ${
                canBank
                  ? 'bg-sky-500 hover:bg-sky-400 text-[#0B0E14]'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>Renew via Royal Bank</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onVisitDmLater}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 text-xs font-display font-bold uppercase tracking-wider cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-sky-400" />
            <span>Visit DM / Licensing Office Later (Set GPS Waypoint)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
