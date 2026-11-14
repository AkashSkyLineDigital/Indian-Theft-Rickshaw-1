import React, { useEffect } from 'react';
import { Banknote, Gavel, Landmark, Scale, ShieldAlert, SkipForward } from 'lucide-react';
import { CourtroomState, formatRs } from '../types/game';

interface CourtroomOverlayProps {
  courtroom: CourtroomState;
  cash: number;
  bankSavings: number;
  onAdvanceDialogue: () => void;
  onSkipArguments: () => void;
  onPayBail: (source: 'cash' | 'bank') => void;
  onEnterJail: () => void;
}

export const CourtroomOverlay: React.FC<CourtroomOverlayProps> = ({
  courtroom,
  cash,
  bankSavings,
  onAdvanceDialogue,
  onSkipArguments,
  onPayBail,
  onEnterJail,
}) => {
  const currentTurn =
    courtroom.dialogueTurns[
      Math.min(courtroom.dialogueIndex, Math.max(0, courtroom.dialogueTurns.length - 1))
    ];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        if (!courtroom.argumentsFinished) {
          e.preventDefault();
          onAdvanceDialogue();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [courtroom.argumentsFinished, onAdvanceDialogue]);

  const roleColors =
    currentTurn?.speakerRole === 'judge'
      ? 'bg-amber-500 text-[#0B0E14] border-amber-300'
      : currentTurn?.speakerRole === 'inspector'
        ? 'bg-sky-600 text-white border-sky-400'
        : 'bg-purple-600 text-white border-purple-400';

  const canPayCash = cash >= courtroom.totalDue;
  const canPayBank = bankSavings >= courtroom.totalDue;

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-3 sm:p-5">
      {/* Top Judicial Banner */}
      <div className="pointer-events-auto mx-auto w-full max-w-4xl bg-[#0B0E14]/92 border border-amber-500/60 shadow-2xl px-4 py-3 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-display text-sm sm:text-base font-extrabold tracking-wider text-amber-300 uppercase">
                District &amp; Sessions Court — Busted Hearing
              </div>
              <div className="text-[11px] font-mono-num text-slate-300">
                Arrest Cause: {courtroom.arrestReason}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-red-950/90 border border-red-500/70 text-xs font-mono-num font-bold text-red-200">
              {courtroom.starsAtArrest}★ OFFENSE
            </span>
            {!courtroom.argumentsFinished && (
              <button
                type="button"
                onClick={onSkipArguments}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-mono-num text-slate-200 cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5 text-amber-300" />
                <span>Skip to Verdict</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-400 font-mono-num uppercase">Charges:</span>
          {courtroom.charges.map((ch, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-200 font-medium"
            >
              {ch}
            </span>
          ))}
          {courtroom.confiscated.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-950/80 border border-amber-500/50 text-amber-200 font-mono-num">
              Seized/Escrow: {courtroom.confiscated.join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Live Argument OR Final Verdict Panel (center left open for Judge/Vakil/Kathgara) */}
      <div className="pointer-events-auto mx-auto w-full max-w-3xl">
        {!courtroom.argumentsFinished && currentTurn ? (
          <div className="bg-[#0B0E14]/94 border-2 border-amber-500/75 shadow-2xl p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 border text-[11px] font-mono-num font-bold uppercase ${roleColors}`}>
                  {currentTurn.title}
                </span>
                <span className="text-sm font-display font-bold text-slate-100">
                  {currentTurn.speakerName}
                </span>
              </div>
              <span className="text-xs font-mono-num text-slate-400">
                Argument {courtroom.dialogueIndex + 1} / {courtroom.dialogueTurns.length}
              </span>
            </div>

            <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
              “{currentTurn.text}”
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
              <span className="text-[11px] font-mono-num text-slate-400">
                Standing inside Kathgara (Witness Box)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onSkipArguments}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono-num text-slate-200 cursor-pointer"
                >
                  Skip to Verdict
                </button>
                <button
                  type="button"
                  onClick={onAdvanceDialogue}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#0B0E14] text-xs font-display font-extrabold uppercase tracking-wider cursor-pointer"
                >
                  {courtroom.dialogueIndex + 1 >= courtroom.dialogueTurns.length
                    ? 'Hear Verdict [Space]'
                    : 'Next Argument [Space]'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`bg-[#0B0E14]/95 border-2 shadow-2xl p-4 sm:p-5 flex flex-col gap-3 ${
              courtroom.verdictKind === 'NO_BAIL' ? 'border-red-500' : 'border-emerald-500/80'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Gavel
                  className={`w-5 h-5 ${
                    courtroom.verdictKind === 'NO_BAIL' ? 'text-red-400' : 'text-amber-400'
                  }`}
                />
                <span className="font-display text-base sm:text-lg font-extrabold tracking-wide text-slate-100 uppercase">
                  {courtroom.verdictKind === 'NO_BAIL'
                    ? 'Zamanat Kharij! Seedha Central Jail'
                    : courtroom.verdictKind === 'HIGH_BAIL'
                      ? 'Conditional High Bail Granted'
                      : 'Bail Granted (Zamanat Manzoor)'}
                </span>
              </div>
              <span className="text-xs font-mono-num text-slate-400">
                Sentence Option: {courtroom.jailDays} Din
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {courtroom.verdictHeadline}
            </p>

            {courtroom.verdictKind !== 'NO_BAIL' ? (
              <>
                <div className="grid grid-cols-3 gap-2 bg-[#121826] border border-slate-800 p-3 text-xs font-mono-num">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Bail Bond</div>
                    <div className="text-sm font-bold text-amber-300">
                      {formatRs(courtroom.bailAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Vakil Fee</div>
                    <div className="text-sm font-bold text-purple-300">
                      {formatRs(courtroom.lawyerFee)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Total Payable</div>
                    <div className="text-sm font-bold text-emerald-300">
                      {formatRs(courtroom.totalDue)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-num text-slate-300">
                  <span>Wallet Cash: <strong className="text-emerald-300">{formatRs(cash)}</strong></span>
                  <span>
                    Royal Bank Savings:{' '}
                    <strong className="text-sky-300">{formatRs(bankSavings)}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={!canPayCash}
                    onClick={() => onPayBail('cash')}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold uppercase cursor-pointer ${
                      canPayCash
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-[#0B0E14]'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Pay Cash Bail</span>
                  </button>

                  <button
                    type="button"
                    disabled={!canPayBank}
                    onClick={() => onPayBail('bank')}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold uppercase cursor-pointer ${
                      canPayBank
                        ? 'bg-sky-500 hover:bg-sky-400 text-[#0B0E14]'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <Landmark className="w-4 h-4" />
                    <span>Royal Bank Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={onEnterJail}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-amber-950/90 hover:bg-amber-900 border border-amber-500/70 text-amber-200 text-xs font-bold uppercase cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Custody ({courtroom.jailDays} Din Jail)</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="text-xs font-mono-num text-red-300">
                  4–5★ Non-Bailable Custody · Escrowed licensed weapons will return upon release.
                </div>
                <button
                  type="button"
                  onClick={onEnterJail}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-display font-extrabold uppercase tracking-wider cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Enter Bharat Central Jail ({courtroom.jailDays} Din)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
