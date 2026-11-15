import React, { useEffect } from 'react';
import {
  Banknote,
  Briefcase,
  CheckCircle2,
  Gavel,
  Landmark,
  Scale,
  Shield,
  ShieldAlert,
  SkipForward,
  Volume2,
} from 'lucide-react';
import { CourtroomState, formatRs } from '../types/game';

interface CourtroomOverlayProps {
  courtroom: CourtroomState;
  cash: number;
  bankSavings: number;
  onAdvanceDialogue: () => void;
  onSkipArguments: () => void;
  onPayBail: (source: 'cash' | 'bank') => void;
  onEnterJail: () => void;
  onRequestInterimBail: () => void;
}

const SPEAKER_PROFILES = [
  {
    role: 'judge' as const,
    label: 'Hon. Judge S.K. Deshmukh',
    activePill: 'bg-[#F59E0B] text-[#0E1118] border-amber-200 font-bold',
    idlePill: 'bg-white/[0.05] text-amber-200/75 border-white/10',
    badgeClass: 'bg-[#F59E0B] text-[#0E1118]',
    panelBorder: 'border-amber-400/60',
  },
  {
    role: 'lawyer' as const,
    label: 'Adv. Meera Sharma',
    activePill: 'bg-purple-500 text-white border-purple-200 font-bold',
    idlePill: 'bg-white/[0.05] text-purple-200/75 border-white/10',
    badgeClass: 'bg-purple-500 text-white',
    panelBorder: 'border-purple-400/60',
  },
  {
    role: 'inspector' as const,
    label: 'Inspector Vijay Rathore',
    activePill: 'bg-[#38BDF8] text-[#0E1118] border-sky-200 font-bold',
    idlePill: 'bg-white/[0.05] text-sky-200/75 border-white/10',
    badgeClass: 'bg-[#38BDF8] text-[#0E1118]',
    panelBorder: 'border-sky-400/60',
  },
];

export const CourtroomOverlay: React.FC<CourtroomOverlayProps> = ({
  courtroom,
  cash,
  bankSavings,
  onAdvanceDialogue,
  onSkipArguments,
  onPayBail,
  onEnterJail,
  onRequestInterimBail,
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

  const activeRole = courtroom.argumentsFinished ? 'judge' : (currentTurn?.speakerRole ?? 'judge');
  const activeProfile =
    SPEAKER_PROFILES.find((p) => p.role === activeRole) ?? SPEAKER_PROFILES[0];

  const canPayCash = cash >= courtroom.totalDue;
  const canPayBank = bankSavings >= courtroom.totalDue;

  const legalStageIndex = courtroom.argumentsFinished ? 3 : 2;
  const argCount = Math.max(1, courtroom.dialogueTurns.length);
  const argPct = courtroom.argumentsFinished
    ? 100
    : Math.round(((courtroom.dialogueIndex + 1) / argCount) * 100);

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-2 sm:p-4 overflow-hidden">
      {/* Compact Docked Top Banner (<= 22vh so center 55%+ stays open for 3D Bench, Vakil & Kathgara) */}
      <div className="pointer-events-auto mx-auto w-full max-w-4xl max-h-[22vh] overflow-y-auto hud-glass rounded-xl shadow-xl px-3 py-2 flex flex-col gap-1.5 shrink-0 hud-text-shadow">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <Scale className="w-4 h-4 text-[#FBBF24] shrink-0" />
            <div className="min-w-0">
              <span className="font-display text-xs sm:text-sm font-bold tracking-wider text-[#FBBF24] uppercase">
                District &amp; Sessions Court
              </span>
              <span className="hidden sm:inline text-white/35 mx-1.5">·</span>
              <span className="block sm:inline text-[10px] font-mono-num text-slate-200 truncate">
                {courtroom.arrestReason}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2 py-0.5 bg-red-500/25 border border-red-400/60 rounded text-[10px] font-mono-num font-bold text-red-200">
              {courtroom.starsAtArrest}★
            </span>
            <span
              className={`px-2 py-0.5 rounded border text-[10px] font-mono-num font-bold uppercase ${
                courtroom.verdictKind === 'NO_BAIL'
                  ? 'bg-red-500/25 border-red-400/60 text-red-200'
                  : courtroom.verdictKind === 'CONDITIONAL_INTERIM_BAIL'
                    ? 'bg-orange-500/25 border-orange-400/60 text-orange-200'
                    : courtroom.verdictKind === 'HIGH_BAIL'
                      ? 'bg-amber-500/25 border-amber-400/60 text-amber-200'
                      : 'bg-emerald-500/25 border-emerald-400/60 text-emerald-200'
              }`}
            >
              {courtroom.verdictKind === 'NO_BAIL'
                ? courtroom.hasFatalCharge
                  ? 'Sec 103 BNS · Non-Bailable'
                  : 'Non-Bailable'
                : courtroom.verdictKind === 'CONDITIONAL_INTERIM_BAIL'
                  ? 'Strict Interim Bail'
                  : courtroom.verdictKind === 'HIGH_BAIL'
                    ? 'High Bail'
                    : 'Bailable'}
            </span>
            {!courtroom.argumentsFinished && (
              <button
                type="button"
                onClick={onSkipArguments}
                className="flex items-center gap-1 px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-[10px] font-mono-num text-slate-100 cursor-pointer"
              >
                <SkipForward className="w-3 h-3 text-[#FBBF24]" />
                <span>Skip</span>
              </button>
            )}
          </div>
        </div>

        {/* Slim Progress + 3-Speaker Strip */}
        <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono-num">
          {[
            { num: 1, title: '1. FIR & Charges' },
            {
              num: 2,
              title: `2. Arguments (${Math.min(courtroom.dialogueIndex + 1, argCount)}/${argCount})`,
            },
            { num: 3, title: '3. Verdict' },
          ].map((step) => {
            const done = legalStageIndex > step.num;
            const current = legalStageIndex === step.num;
            return (
              <div
                key={step.num}
                className={`px-2 py-0.5 rounded border flex items-center justify-between gap-1 ${
                  current
                    ? 'bg-amber-500/20 border-amber-400/60 text-[#FBBF24] font-bold'
                    : done
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                      : 'bg-white/[0.04] border-white/10 text-slate-300/70'
                }`}
              >
                <span className="truncate">{step.title}</span>
                {done && <CheckCircle2 className="w-3 h-3 text-[#22C55E] shrink-0" />}
              </div>
            );
          })}
        </div>

        <div className="w-full h-1 bg-black/45 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#F59E0B] transition-all duration-300"
            style={{ width: `${argPct}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1 flex-wrap">
            {SPEAKER_PROFILES.map((sp) => {
              const isActive = activeRole === sp.role;
              return (
                <div
                  key={sp.role}
                  className={`px-2 py-0.5 rounded border flex items-center gap-1 text-[10px] transition-colors ${
                    isActive ? sp.activePill : sp.idlePill
                  }`}
                >
                  {sp.role === 'judge' ? (
                    <Gavel className="w-3 h-3 shrink-0" />
                  ) : sp.role === 'lawyer' ? (
                    <Briefcase className="w-3 h-3 shrink-0" />
                  ) : (
                    <Shield className="w-3 h-3 shrink-0" />
                  )}
                  <span className="truncate max-w-[140px]">{sp.label}</span>
                  {isActive && <Volume2 className="w-3 h-3 shrink-0" />}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1 text-[10px]">
            {courtroom.charges.map((ch, i) => {
              const isFatal = ch.includes('103 BNS');
              return (
                <span
                  key={i}
                  className={`px-1.5 py-0.5 rounded border font-mono-num ${
                    isFatal
                      ? 'bg-red-500/25 border-red-400/60 text-red-100 font-bold'
                      : 'bg-white/[0.06] border-white/15 text-slate-200'
                  }`}
                >
                  {ch}
                </span>
              );
            })}
            {courtroom.confiscated.length > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-400/40 text-amber-200 font-mono-num">
                Escrow: {courtroom.confiscated.join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sleek Bottom Subtitle / Verdict Action Bar */}
      <div className="pointer-events-auto mx-auto w-full max-w-3xl shrink-0">
        {!courtroom.argumentsFinished && currentTurn ? (
          <div
            className={`bg-[rgba(14,17,24,0.56)] backdrop-blur-[10px] border ${activeProfile.panelBorder} rounded-xl shadow-2xl px-4 py-3 flex flex-col gap-2 hud-text-shadow`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono-num font-extrabold uppercase ${activeProfile.badgeClass}`}
                >
                  {currentTurn.title}
                </span>
                <span className="text-sm font-display font-bold text-white">
                  {currentTurn.speakerName}
                </span>
              </div>
              <span className="text-[11px] font-mono-num font-bold text-[#FBBF24]">
                {courtroom.dialogueIndex + 1} / {courtroom.dialogueTurns.length}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-100 leading-snug font-medium">
              &ldquo;{currentTurn.text}&rdquo;
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
              <span className="text-[10px] font-mono-num text-slate-300/85">
                Kathgara · Auto-advances when voice ends
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onSkipArguments}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[11px] font-mono-num text-slate-100 cursor-pointer"
                >
                  Skip to Verdict
                </button>
                <button
                  type="button"
                  onClick={onAdvanceDialogue}
                  className="px-4 py-1.5 bg-[#F59E0B] hover:bg-[#FBBF24] rounded-lg text-[#0E1118] text-[11px] font-display font-extrabold uppercase tracking-wider cursor-pointer"
                >
                  {courtroom.dialogueIndex + 1 >= courtroom.dialogueTurns.length
                    ? 'Hear Verdict [Space]'
                    : 'Next [Space]'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`bg-[rgba(14,17,24,0.60)] backdrop-blur-[10px] border rounded-xl shadow-2xl p-3 sm:p-4 flex flex-col gap-2.5 hud-text-shadow ${
              courtroom.verdictKind === 'NO_BAIL'
                ? 'border-red-400/70'
                : courtroom.verdictKind === 'CONDITIONAL_INTERIM_BAIL'
                  ? 'border-orange-400/70'
                  : 'border-emerald-400/70'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Gavel
                  className={`w-4 h-4 ${
                    courtroom.verdictKind === 'NO_BAIL'
                      ? 'text-[#EF4444]'
                      : courtroom.verdictKind === 'CONDITIONAL_INTERIM_BAIL'
                        ? 'text-orange-300'
                        : 'text-[#FBBF24]'
                  }`}
                />
                <span className="font-display text-sm sm:text-base font-extrabold tracking-wide text-white uppercase">
                  {courtroom.verdictKind === 'NO_BAIL'
                    ? 'Zamanat Kharij! Judicial Custody (Central Jail)'
                    : courtroom.verdictKind === 'CONDITIONAL_INTERIM_BAIL'
                      ? 'Strict Conditional Interim Bail (Not Acquitted)'
                      : courtroom.verdictKind === 'HIGH_BAIL'
                        ? 'Conditional High Bail Granted'
                        : 'Bail Granted (Zamanat Manzoor)'}
                </span>
              </div>
              <span className="text-[11px] font-mono-num text-slate-200">
                Sentence: {courtroom.jailDays} Din
              </span>
            </div>

            <p className="text-xs text-slate-100 leading-snug">{courtroom.verdictHeadline}</p>

            {courtroom.verdictKind === 'CONDITIONAL_INTERIM_BAIL' && (
              <div className="px-2.5 py-1.5 bg-orange-500/15 border border-orange-400/45 rounded-lg text-[10px] font-mono-num text-orange-100">
                CONDITIONS: Weapons Confiscated · Arms License Revoked · 3-Day Probation (Bank Interest Frozen)
              </div>
            )}

            {courtroom.verdictKind !== 'NO_BAIL' ? (
              <>
                <div
                  className={`grid gap-2 bg-white/[0.05] border border-white/10 rounded-lg p-2.5 text-xs font-mono-num ${
                    courtroom.victimCompensation > 0 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'
                  }`}
                >
                  <div>
                    <div className="text-[9px] text-slate-300 uppercase">
                      {courtroom.verdictKind === 'CONDITIONAL_INTERIM_BAIL' ? 'Heavy Bond' : 'Bail Bond'}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-[#EAB308]">
                      {formatRs(courtroom.bailAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-300 uppercase">
                      {courtroom.verdictKind === 'CONDITIONAL_INTERIM_BAIL' ? 'Sr. Advocate' : 'Vakil Fee'}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-purple-300">
                      {formatRs(courtroom.lawyerFee)}
                    </div>
                  </div>
                  {courtroom.victimCompensation > 0 && (
                    <div>
                      <div className="text-[9px] text-slate-300 uppercase">Relief Fund</div>
                      <div className="text-xs sm:text-sm font-bold text-orange-300">
                        {formatRs(courtroom.victimCompensation)}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-[9px] text-slate-300 uppercase">Total Due</div>
                    <div className="text-xs sm:text-sm font-bold text-[#22C55E]">
                      {formatRs(courtroom.totalDue)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-num text-slate-200">
                  <span>
                    Cash: <strong className="text-[#EAB308]">{formatRs(cash)}</strong>
                  </span>
                  <span>
                    Royal Bank Savings: <strong className="text-[#38BDF8]">{formatRs(bankSavings)}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    disabled={!canPayCash}
                    onClick={() => onPayBail('cash')}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase cursor-pointer ${
                      canPayCash
                        ? 'bg-[#22C55E] hover:bg-emerald-400 text-[#0E1118]'
                        : 'bg-white/[0.06] text-white/30 cursor-not-allowed'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Pay Cash Bail</span>
                  </button>

                  <button
                    type="button"
                    disabled={!canPayBank}
                    onClick={() => onPayBail('bank')}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase cursor-pointer ${
                      canPayBank
                        ? 'bg-[#38BDF8] hover:bg-sky-300 text-[#0E1118]'
                        : 'bg-white/[0.06] text-white/30 cursor-not-allowed'
                    }`}
                  >
                    <Landmark className="w-3.5 h-3.5" />
                    <span>Royal Bank Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={onEnterJail}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 rounded-lg text-amber-200 text-xs font-bold uppercase cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Custody ({courtroom.jailDays} Din)</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                {courtroom.interimBailEligible &&
                  !courtroom.interimBailApplied &&
                  courtroom.interimBailBreakdown && (
                    <div className="bg-white/[0.05] border border-amber-400/45 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="font-display font-bold text-[#FBBF24] uppercase">
                          Path B: Senior Advocate Self-Defense Interim Bail Plea
                        </span>
                        <span className="text-[10px] font-mono-num text-slate-200">
                          Bond {formatRs(courtroom.interimBailBreakdown.heavyBond)} + Vakil{' '}
                          {formatRs(courtroom.interimBailBreakdown.seniorAdvocateFee)} + Relief{' '}
                          {formatRs(courtroom.interimBailBreakdown.victimCompensation)} ={' '}
                          <strong className="text-[#FBBF24]">
                            {formatRs(courtroom.interimBailBreakdown.total)}
                          </strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={onRequestInterimBail}
                        className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#F59E0B] hover:bg-[#FBBF24] rounded-lg text-[#0E1118] text-xs font-display font-extrabold uppercase cursor-pointer"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Hire Senior Advocate</span>
                      </button>
                    </div>
                  )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <div className="text-[11px] font-mono-num text-red-200">
                    {courtroom.hasFatalCharge
                      ? `Section 103 BNS (${courtroom.fatalitiesCount} Fatalit${courtroom.fatalitiesCount > 1 ? 'ies' : 'y'}) · Remanded to Central Jail.`
                      : '4–5★ Non-Bailable Custody · Escorted to Bharat Central Jail.'}
                  </div>
                  <button
                    type="button"
                    onClick={onEnterJail}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#EF4444] hover:bg-red-400 rounded-lg text-white text-xs font-display font-extrabold uppercase tracking-wider cursor-pointer shrink-0"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Board Jail Van ({courtroom.jailDays} Din)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
