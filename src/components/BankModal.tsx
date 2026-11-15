import React, { useEffect, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BookOpen,
  CalendarDays,
  Clock,
  Landmark,
  Percent,
  ShieldCheck,
  Siren,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import {
  BANK_BAILOUT_GRANT_INR,
  BankAccountHudState,
  FD_ANNUAL_RATE,
  MISSION_REWARD_INR,
  SAVINGS_ANNUAL_RATE,
  TimeOfDayHud,
  formatRs,
  formatRsExact,
} from '../types/game';
import { FictionalCashTray } from './FictionalCash';

interface BankModalProps {
  fromDebtBailout: boolean;
  cash: number;
  bank: BankAccountHudState;
  timeOfDay: TimeOfDayHud;
  missionActive: boolean;
  probationDaysLeft?: number;
  onTransaction: (
    account: 'SAVINGS' | 'FD',
    action: 'DEPOSIT' | 'WITHDRAW',
    amount: number,
  ) => { ok: boolean; message: string; amount: number };
  onStartMission: () => void;
  onClose: () => void;
}

type BankTab = 'accounts' | 'passbook' | 'mission';

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000];

export const BankModal: React.FC<BankModalProps> = ({
  fromDebtBailout,
  cash,
  bank,
  timeOfDay,
  missionActive,
  probationDaysLeft = 0,
  onTransaction,
  onStartMission,
  onClose,
}) => {
  const [tab, setTab] = useState<BankTab>(fromDebtBailout ? 'mission' : 'accounts');
  const [savingsInput, setSavingsInput] = useState('5000');
  const [fdInput, setFdInput] = useState('10000');
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [cashAnim, setCashAnim] = useState<{
    direction: 'dispense' | 'insert';
    amount: number;
    key: number;
    label: string;
  } | null>(null);

  useEffect(() => {
    if (fromDebtBailout) setTab('mission');
  }, [fromDebtBailout]);

  const handleBankTx = (
    account: 'SAVINGS' | 'FD',
    action: 'DEPOSIT' | 'WITHDRAW',
    rawStr: string,
    overrideAmount?: number,
  ) => {
    const amt = overrideAmount ?? Math.floor(Number(rawStr) || 0);
    const res = onTransaction(account, action, amt);
    setFeedback({ ok: res.ok, text: res.message });
    if (res.ok && res.amount > 0) {
      setCashAnim((prev) => ({
        direction: action === 'WITHDRAW' ? 'dispense' : 'insert',
        amount: res.amount,
        key: (prev?.key ?? 0) + 1,
        label:
          action === 'WITHDRAW'
            ? `Branch Payout: ${formatRs(res.amount)} (${account === 'SAVINGS' ? 'Savings' : 'Fixed Deposit'})`
            : `Branch Deposit: ${formatRs(res.amount)} into ${account === 'SAVINGS' ? 'Savings' : 'Fixed Deposit'}`,
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#070A10]/88 p-3 sm:p-4">
      <div className="w-full max-w-4xl bg-[#101520] border border-amber-500/60 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header with Uncopyrighted Geometric Crest */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0B0E14] border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-emerald-950 border border-amber-500/70 flex items-center justify-center text-amber-400 shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-base sm:text-lg font-bold tracking-wider text-slate-100 truncate">
                ROYAL BANK OF INDIA · BRANCH &amp; TREASURY
              </h2>
              <p className="text-[11px] font-mono-num text-amber-400 truncate">
                FICTIONAL CIVIC BANK · SAVINGS 2.5% P.A. · FIXED DEPOSIT 4.0% P.A.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Bank"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Calendar, Clock & Tabs Bar */}
        <div className="px-5 py-2.5 bg-[#0D121C] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTab('accounts')}
              className={`px-3 py-1.5 text-xs font-display font-bold tracking-wider uppercase border cursor-pointer transition-colors ${
                tab === 'accounts'
                  ? 'bg-amber-500 text-[#0B0E14] border-amber-400'
                  : 'bg-[#121826] text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              Savings &amp; FD
            </button>
            <button
              type="button"
              onClick={() => setTab('passbook')}
              className={`px-3 py-1.5 text-xs font-display font-bold tracking-wider uppercase border cursor-pointer transition-colors flex items-center gap-1.5 ${
                tab === 'passbook'
                  ? 'bg-amber-500 text-[#0B0E14] border-amber-400'
                  : 'bg-[#121826] text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Passbook ({bank.passbook.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('mission')}
              className={`px-3 py-1.5 text-xs font-display font-bold tracking-wider uppercase border cursor-pointer transition-colors flex items-center gap-1.5 ${
                tab === 'mission'
                  ? 'bg-sky-500 text-[#071018] border-sky-400'
                  : 'bg-[#121826] text-sky-300 border-slate-700 hover:border-sky-500/60'
              }`}
            >
              <Siren className="w-3.5 h-3.5" />
              <span>Police Mission</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono-num">
            <span className="flex items-center gap-1 text-sky-300">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>
                {bank.calendarDate} (Day {timeOfDay.dayCount}) · {timeOfDay.formattedTime}
              </span>
            </span>
            <span className="flex items-center gap-1 text-emerald-300 font-bold">
              <Wallet className="w-3.5 h-3.5" />
              <span>Wallet: {formatRs(cash)}</span>
            </span>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {tab === 'accounts' && (
            <>
              {probationDaysLeft > 0 && (
                <div className="px-3.5 py-2.5 bg-orange-950/75 border border-orange-500/70 text-xs font-mono-num text-orange-100">
                  COURT PROBATION ORDER: Royal Bank Savings &amp; FD interest is frozen for{' '}
                  <strong>{probationDaysLeft}</strong> remaining day(s). Principal deposits &amp;
                  withdrawals remain open.
                </div>
              )}
              {/* Account Summary Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#0B0E14] border border-cyan-500/40">
                  <div className="text-[10px] font-mono-num text-cyan-300 uppercase">
                    Normal Savings Balance
                  </div>
                  <div className="text-lg font-mono-num font-bold text-white mt-0.5">
                    {formatRsExact(bank.savingsTotal)}
                  </div>
                  <div className="text-[10px] font-mono-num text-slate-400">
                    2.5% p.a. ({((SAVINGS_ANNUAL_RATE / 365) * 100).toFixed(4)}%/day)
                  </div>
                </div>
                <div className="p-3 bg-[#0B0E14] border border-amber-500/40">
                  <div className="text-[10px] font-mono-num text-amber-300 uppercase">
                    Fixed Deposit (FD) Value
                  </div>
                  <div className="text-lg font-mono-num font-bold text-white mt-0.5">
                    {formatRsExact(bank.fdTotal)}
                  </div>
                  <div className="text-[10px] font-mono-num text-slate-400">
                    4.0% p.a. ({((FD_ANNUAL_RATE / 365) * 100).toFixed(4)}%/day)
                  </div>
                </div>
                <div className="p-3 bg-[#0B0E14] border border-emerald-500/40">
                  <div className="text-[10px] font-mono-num text-emerald-300 uppercase">
                    Lifetime Interest Earned
                  </div>
                  <div className="text-lg font-mono-num font-bold text-emerald-400 mt-0.5">
                    +{formatRsExact(bank.totalInterestEarned)}
                  </div>
                  <div className="text-[10px] font-mono-num text-slate-400">
                    Pro-rated daily · Instant withdrawal
                  </div>
                </div>
              </div>

              {/* Dual Deposit/Withdraw Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Normal Savings Account */}
                <div className="p-4 bg-[#0B0E14] border border-slate-700/90 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-display font-bold tracking-wider text-cyan-300 uppercase">
                        Normal Savings Account
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Compounded daily · Accessible at any Street ATM
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-500/50 text-[11px] font-mono-num font-bold text-cyan-300 flex items-center gap-1">
                      <Percent className="w-3 h-3" /> 2.5% p.a.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-num bg-[#070A10] p-2.5 border border-slate-800">
                    <div>
                      <div className="text-slate-400">Principal</div>
                      <div className="text-slate-100 font-semibold">
                        {formatRsExact(bank.savingsPrincipal)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Pro-Rated Interest</div>
                      <div className="text-emerald-400 font-semibold">
                        +{formatRsExact(bank.savingsInterest)}
                      </div>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-800/80 flex justify-between">
                      <span className="text-slate-400">Est. Yield / In-Game Day:</span>
                      <span className="text-cyan-300 font-semibold">
                        +{formatRsExact(bank.savingsDailyRate)}/day
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setSavingsInput(String(amt))}
                        className="px-2 py-1 text-[10px] font-mono-num bg-[#141C2B] hover:bg-[#1B263B] border border-slate-700 text-slate-200 cursor-pointer"
                      >
                        {formatRs(amt)}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    min={1}
                    step={100}
                    value={savingsInput}
                    onChange={(e) => setSavingsInput(e.target.value)}
                    aria-label="Savings Amount"
                    className="w-full px-3 py-2 bg-[#070A10] border border-slate-700 text-sm font-mono-num text-white focus:outline-none focus:border-cyan-400"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleBankTx('SAVINGS', 'DEPOSIT', savingsInput)}
                      className="py-2 bg-cyan-500 hover:bg-cyan-400 text-[#071018] text-xs font-display font-bold tracking-wider uppercase flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" /> Deposit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBankTx('SAVINGS', 'WITHDRAW', savingsInput)}
                      className="py-2 bg-emerald-500 hover:bg-emerald-400 text-[#07100B] text-xs font-display font-bold tracking-wider uppercase flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ArrowUpFromLine className="w-3.5 h-3.5" /> Withdraw
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={bank.savingsTotal < 1}
                    onClick={() =>
                      handleBankTx('SAVINGS', 'WITHDRAW', savingsInput, Math.ceil(bank.savingsTotal))
                    }
                    className="text-[11px] font-mono-num text-cyan-300 hover:text-cyan-200 disabled:text-slate-600 underline text-left cursor-pointer disabled:cursor-not-allowed"
                  >
                    Withdraw Full Savings + Accrued Interest ({formatRsExact(bank.savingsTotal)})
                  </button>
                </div>

                {/* Fixed Deposit (FD) Account */}
                <div className="p-4 bg-[#0B0E14] border border-slate-700/90 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-display font-bold tracking-wider text-amber-300 uppercase">
                        Fixed Deposit (FD) Term Vault
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Higher 4.0% yield · Pro-rated to exact day on withdrawal
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-950 border border-amber-500/50 text-[11px] font-mono-num font-bold text-amber-300 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> 4.0% p.a.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-num bg-[#070A10] p-2.5 border border-slate-800">
                    <div>
                      <div className="text-slate-400">FD Principal</div>
                      <div className="text-slate-100 font-semibold">
                        {formatRsExact(bank.fdPrincipal)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Pro-Rated FD Interest</div>
                      <div className="text-emerald-400 font-semibold">
                        +{formatRsExact(bank.fdInterest)}
                      </div>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-800/80 flex justify-between">
                      <span className="text-slate-400">
                        {bank.fdOpenedDay ? `Opened Day ${bank.fdOpenedDay} · Yield:` : 'Est. Yield / Day:'}
                      </span>
                      <span className="text-amber-300 font-semibold">
                        +{formatRsExact(bank.fdDailyRate)}/day
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setFdInput(String(amt))}
                        className="px-2 py-1 text-[10px] font-mono-num bg-[#141C2B] hover:bg-[#1B263B] border border-slate-700 text-slate-200 cursor-pointer"
                      >
                        {formatRs(amt)}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    min={1}
                    step={100}
                    value={fdInput}
                    onChange={(e) => setFdInput(e.target.value)}
                    aria-label="Fixed Deposit Amount"
                    className="w-full px-3 py-2 bg-[#070A10] border border-slate-700 text-sm font-mono-num text-white focus:outline-none focus:border-amber-400"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleBankTx('FD', 'DEPOSIT', fdInput)}
                      className="py-2 bg-amber-500 hover:bg-amber-400 text-[#0B0E14] text-xs font-display font-bold tracking-wider uppercase flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" /> Open / Top-Up FD
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBankTx('FD', 'WITHDRAW', fdInput)}
                      className="py-2 bg-emerald-500 hover:bg-emerald-400 text-[#07100B] text-xs font-display font-bold tracking-wider uppercase flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ArrowUpFromLine className="w-3.5 h-3.5" /> Redeem
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={bank.fdTotal < 1}
                    onClick={() =>
                      handleBankTx('FD', 'WITHDRAW', fdInput, Math.ceil(bank.fdTotal))
                    }
                    className="text-[11px] font-mono-num text-amber-300 hover:text-amber-200 disabled:text-slate-600 underline text-left cursor-pointer disabled:cursor-not-allowed"
                  >
                    Break &amp; Redeem Full FD + Interest ({formatRsExact(bank.fdTotal)})
                  </button>
                </div>
              </div>

              {feedback && (
                <div
                  className={`px-3.5 py-2 border text-xs font-mono-num ${
                    feedback.ok
                      ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200'
                      : 'bg-red-950/50 border-red-500/60 text-red-200'
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              <FictionalCashTray
                amount={cashAnim?.amount ?? 0}
                direction={cashAnim?.direction ?? null}
                animKey={cashAnim?.key ?? 0}
                label={cashAnim?.label}
              />
            </>
          )}

          {tab === 'passbook' && (
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-[#0B0E14] border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono-num">
                <div>
                  <span className="text-slate-400">ACCOUNT HOLDER: </span>
                  <span className="text-white font-bold">CITIZEN · ROYAL BANK OF INDIA</span>
                </div>
                <div className="text-emerald-400 font-bold">
                  Savings {formatRsExact(bank.savingsTotal)} · FD {formatRsExact(bank.fdTotal)}
                </div>
              </div>

              <div className="border border-slate-800 bg-[#0B0E14] overflow-x-auto max-h-[340px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-[11px] font-mono-num">
                  <thead className="bg-[#070A10] text-slate-400 uppercase sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Day / Time</th>
                      <th className="py-2 px-3">Acct</th>
                      <th className="py-2 px-3">Particulars</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                      <th className="py-2 px-3 text-right">Acct Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {bank.passbook.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No passbook transactions yet. Deposit into Savings (2.5% p.a.) or Fixed
                          Deposit (4.0% p.a.) — daily pro-rated interest appears automatically as
                          in-game days pass!
                        </td>
                      </tr>
                    ) : (
                      bank.passbook.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-900/50">
                          <td className="py-2 px-3 text-slate-300 whitespace-nowrap">
                            Day {row.day} · {row.timeLabel}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-bold ${
                                row.account === 'FD'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                  : row.account === 'ATM'
                                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                                    : 'bg-sky-950 text-sky-300 border border-sky-500/40'
                              }`}
                            >
                              {row.account}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-200">{row.note}</td>
                          <td
                            className={`py-2 px-3 text-right font-bold whitespace-nowrap ${
                              row.kind === 'WITHDRAW'
                                ? 'text-amber-300'
                                : row.kind === 'INTEREST'
                                  ? 'text-emerald-300'
                                  : 'text-cyan-300'
                            }`}
                          >
                            {row.kind === 'WITHDRAW' ? '-' : '+'}
                            {formatRsExact(row.amount)}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-100 whitespace-nowrap">
                            {formatRsExact(row.balanceAfter)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'mission' && (
            <div className="flex flex-col gap-4">
              {fromDebtBailout ? (
                <div className="p-4 bg-emerald-950/45 border border-emerald-500/50 flex flex-col gap-1.5">
                  <div className="text-xs font-mono-num font-bold text-emerald-400 uppercase tracking-wider">
                    Debt Relief Notice · -₹50,000 Threshold Reached
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    Bank Officer: &ldquo;Your wallet hit -₹50,000. Under our Police Cooperation
                    Program, your debt has been reset to <strong className="text-white">₹0</strong>{' '}
                    and you have been credited an extra{' '}
                    <strong className="text-emerald-400">{formatRs(BANK_BAILOUT_GRANT_INR)}</strong>{' '}
                    advance. Help the police rescue street dogs from the compound!&rdquo;
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-[#0B0E14] border border-slate-800 flex flex-col gap-1.5">
                  <div className="text-xs font-mono-num font-bold text-sky-400 uppercase tracking-wider">
                    Special Police Rescue Contract
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Bank Officer: &ldquo;Police intelligence tracked 5 armed Dog Mafia guards
                    holding 24 Indian street dogs inside the North-East compound van. Work solo
                    with our assigned patrol car and sidearms to free them.&rdquo;
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#0B0E14] border border-slate-800 flex items-center gap-2.5">
                  <Siren className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <div className="text-slate-400">Assigned Gear</div>
                    <div className="text-slate-100 font-semibold">Police Car + Pistol &amp; SMG</div>
                  </div>
                </div>
                <div className="p-3 bg-[#0B0E14] border border-slate-800 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-slate-400">Time Limit</div>
                    <div className="text-slate-100 font-semibold">20:00 Minutes (Auto-Reset)</div>
                  </div>
                </div>
                <div className="p-3 bg-[#0B0E14] border border-slate-800 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <div className="text-slate-400">Hostiles</div>
                    <div className="text-slate-100 font-semibold">5 Light-Armed Guards (Easy)</div>
                  </div>
                </div>
                <div className="p-3 bg-[#0B0E14] border border-slate-800 flex flex-col justify-center">
                  <div className="text-slate-400">Completion Reward</div>
                  <div className="text-emerald-400 font-mono-num font-bold">
                    +{formatRs(MISSION_REWARD_INR)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  {fromDebtBailout ? 'Leave Desk' : 'Close Branch'}
                </button>
                <button
                  type="button"
                  onClick={onStartMission}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-[#0B0E14] text-xs font-display font-bold tracking-wider cursor-pointer"
                >
                  {missionActive ? 'RESTART DOG RESCUE MISSION' : 'ACCEPT & START MISSION'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
