import React, { useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, CreditCard, Landmark, ReceiptText, Wallet, X } from 'lucide-react';
import {
  AtmLandmarkHud,
  BankAccountHudState,
  SAVINGS_ANNUAL_RATE,
  formatRs,
  formatRsExact,
} from '../types/game';
import { FictionalCashTray } from './FictionalCash';

interface AtmModalProps {
  atm: AtmLandmarkHud;
  cash: number;
  bank: BankAccountHudState;
  onTransaction: (
    account: 'SAVINGS' | 'FD',
    action: 'DEPOSIT' | 'WITHDRAW',
    amount: number,
  ) => { ok: boolean; message: string; amount: number };
  onClose: () => void;
}

const PRESET_AMOUNTS = [500, 1000, 5000, 10000, 25000];

export const AtmModal: React.FC<AtmModalProps> = ({
  atm,
  cash,
  bank,
  onTransaction,
  onClose,
}) => {
  const [amountInput, setAmountInput] = useState('5000');
  const [statusBanner, setStatusBanner] = useState<{ ok: boolean; text: string } | null>(null);
  const [cashAnim, setCashAnim] = useState<{
    direction: 'dispense' | 'insert';
    amount: number;
    key: number;
    label: string;
  } | null>(null);
  const [showStatement, setShowStatement] = useState(false);

  const parsedAmount = Math.max(0, Math.floor(Number(amountInput) || 0));

  const runAtmAction = (action: 'DEPOSIT' | 'WITHDRAW', customAmount?: number) => {
    const amt = customAmount ?? parsedAmount;
    const res = onTransaction('SAVINGS', action, amt);
    setStatusBanner({ ok: res.ok, text: res.message });
    if (res.ok && res.amount > 0) {
      setCashAnim((prev) => ({
        direction: action === 'WITHDRAW' ? 'dispense' : 'insert',
        amount: res.amount,
        key: (prev?.key ?? 0) + 1,
        label:
          action === 'WITHDRAW'
            ? `ATM Dispensed ${formatRs(res.amount)} to Wallet`
            : `ATM Accepted ${formatRs(res.amount)} into Savings`,
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#06090F]/88 p-4">
      <div className="w-full max-w-2xl bg-[#0E141F] border-2 border-cyan-500/60 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* ATM Bezel Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#080C14] border-b border-cyan-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-950 border border-cyan-400/70 flex items-center justify-center text-cyan-300">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold tracking-wider text-cyan-100 uppercase">
                {atm.name}
              </h2>
              <p className="text-[11px] font-mono-num text-cyan-400">
                ROYAL BANK OF BHARAT · 24×7 SELF-SERVICE CASH TERMINAL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close ATM"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Account & Wallet Live Balances */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-[#090D15] border border-slate-800">
              <div className="flex items-center gap-1.5 text-[10px] font-mono-num text-slate-400 uppercase">
                <Landmark className="w-3.5 h-3.5 text-cyan-400" />
                <span>Savings Balance ({(SAVINGS_ANNUAL_RATE * 100).toFixed(1)}% p.a.)</span>
              </div>
              <div className="text-lg font-mono-num font-bold text-cyan-300 mt-1">
                {formatRsExact(bank.savingsTotal)}
              </div>
              <div className="text-[10px] font-mono-num text-emerald-400 mt-0.5">
                +{formatRsExact(bank.savingsInterest)} accrued interest
              </div>
            </div>

            <div className="p-3 bg-[#090D15] border border-slate-800">
              <div className="flex items-center gap-1.5 text-[10px] font-mono-num text-slate-400 uppercase">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cash In Wallet</span>
              </div>
              <div
                className={`text-lg font-mono-num font-bold mt-1 ${
                  cash < 0 ? 'text-red-400' : 'text-emerald-300'
                }`}
              >
                {formatRs(cash)}
              </div>
              <div className="text-[10px] font-mono-num text-slate-400 mt-0.5">
                {bank.calendarDate}
              </div>
            </div>

            <div className="p-3 bg-[#090D15] border border-slate-800 flex flex-col justify-between">
              <div className="text-[10px] font-mono-num text-slate-400 uppercase">
                Fixed Deposit (Branch Only)
              </div>
              <div className="text-base font-mono-num font-bold text-amber-300">
                {formatRsExact(bank.fdTotal)}
              </div>
              <button
                type="button"
                onClick={() => setShowStatement((s) => !s)}
                className="mt-1 inline-flex items-center gap-1 text-[11px] font-mono-num text-cyan-300 hover:text-cyan-200 underline cursor-pointer w-fit"
              >
                <ReceiptText className="w-3.5 h-3.5" />
                <span>{showStatement ? 'Hide Mini-Statement' : 'Check Balance / Statement'}</span>
              </button>
            </div>
          </div>

          {/* Amount Keypad / Presets */}
          <div className="p-3.5 bg-[#090D15] border border-slate-800 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="atm-amount-input"
                className="text-xs font-display font-bold tracking-wider text-slate-200 uppercase"
              >
                Enter Amount (₹)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_AMOUNTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmountInput(String(p))}
                    className={`px-2 py-1 text-[11px] font-mono-num border cursor-pointer transition-colors ${
                      parsedAmount === p
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-[#121926] border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {formatRs(p)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="atm-amount-input"
                type="number"
                min={1}
                step={100}
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#06090F] border border-cyan-500/40 text-base font-mono-num text-white focus:outline-none focus:border-cyan-400"
                placeholder="Enter Rupee Amount"
              />
              <button
                type="button"
                onClick={() => runAtmAction('WITHDRAW')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#07100B] text-xs font-display font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowUpFromLine className="w-4 h-4" />
                <span>Withdraw Cash</span>
              </button>
              <button
                type="button"
                onClick={() => runAtmAction('DEPOSIT')}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-[#061018] text-xs font-display font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Deposit Cash</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-num text-slate-400">
              <button
                type="button"
                disabled={bank.savingsTotal < 1}
                onClick={() => runAtmAction('WITHDRAW', Math.ceil(bank.savingsTotal))}
                className="text-emerald-300 hover:text-emerald-200 disabled:text-slate-600 underline cursor-pointer disabled:cursor-not-allowed"
              >
                Withdraw Full Savings ({formatRsExact(bank.savingsTotal)})
              </button>
              <button
                type="button"
                disabled={cash <= 0}
                onClick={() => runAtmAction('DEPOSIT', Math.floor(cash))}
                className="text-cyan-300 hover:text-cyan-200 disabled:text-slate-600 underline cursor-pointer disabled:cursor-not-allowed"
              >
                Deposit All Wallet Cash ({formatRs(Math.max(0, cash))})
              </button>
            </div>
          </div>

          {statusBanner && (
            <div
              className={`px-3.5 py-2 border text-xs font-mono-num ${
                statusBanner.ok
                  ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200'
                  : 'bg-red-950/50 border-red-500/60 text-red-200'
              }`}
            >
              {statusBanner.text}
            </div>
          )}

          {/* Fictional Currency Note Dispenser Animation */}
          <FictionalCashTray
            amount={cashAnim?.amount ?? 0}
            direction={cashAnim?.direction ?? null}
            animKey={cashAnim?.key ?? 0}
            label={cashAnim?.label}
          />

          {/* Mini Statement */}
          {showStatement && (
            <div className="p-3 bg-[#090D15] border border-slate-800 flex flex-col gap-2">
              <div className="text-[11px] font-display font-bold tracking-wider text-cyan-300 uppercase">
                ATM Mini-Statement (Recent Entries)
              </div>
              {bank.passbook.length === 0 ? (
                <div className="text-xs text-slate-500 py-2">
                  No bank transactions recorded yet. Deposit cash to start earning 2.5% p.a. interest!
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-800/80 max-h-36 overflow-y-auto text-[11px] font-mono-num">
                  {bank.passbook.slice(0, 6).map((row) => (
                    <div key={row.id} className="py-1.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-slate-400">Day {row.day} · </span>
                        <span className="text-slate-200 truncate">{row.note}</span>
                      </div>
                      <div className="shrink-0 text-right">
                        <span
                          className={
                            row.kind === 'WITHDRAW'
                              ? 'text-amber-300 font-semibold'
                              : 'text-emerald-300 font-semibold'
                          }
                        >
                          {row.kind === 'WITHDRAW' ? '-' : '+'}
                          {formatRsExact(row.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
