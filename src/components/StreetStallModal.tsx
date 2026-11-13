import React from 'react';
import { Coffee, HeartPulse, Sparkles, UtensilsCrossed, X, Zap } from 'lucide-react';
import {
  STREET_STALL_MENUS,
  StreetStallHudInfo,
  StreetStallMenuItem,
  formatRs,
} from '../types/game';

interface StreetStallModalProps {
  stall: StreetStallHudInfo;
  cash: number;
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  onBuyItem: (stallId: string, item: StreetStallMenuItem) => void;
  onClose: () => void;
}

export const StreetStallModal: React.FC<StreetStallModalProps> = ({
  stall,
  cash,
  hp,
  maxHp,
  stamina,
  maxStamina,
  onBuyItem,
  onClose,
}) => {
  const menu = STREET_STALL_MENUS[stall.kind] ?? STREET_STALL_MENUS.chai;
  const isChai = stall.kind === 'chai';
  const isGolgappa = stall.kind === 'golgappa';

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#070A10]/85 p-4 pointer-events-auto">
      <div className="w-full max-w-lg bg-[#101520] border border-amber-500/60 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#0B0E14] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 flex items-center justify-center border ${
                isChai
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-400'
                  : isGolgappa
                    ? 'bg-rose-950/60 border-rose-500/50 text-rose-400'
                    : 'bg-orange-950/60 border-orange-500/50 text-orange-400'
              }`}
            >
              {isChai ? (
                <Coffee className="w-5 h-5" />
              ) : (
                <UtensilsCrossed className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="font-display text-lg font-bold tracking-wider text-slate-100">
                {stall.name.toUpperCase()}
              </h2>
              <p className="text-xs text-amber-400">
                {stall.vendorName} ·{' '}
                {isChai
                  ? 'Garma-garam Kulhad Chai'
                  : isGolgappa
                    ? 'Teekha-Meetha Pani Puri Corner'
                    : 'Fresh Samosa, Tikki & Lassi'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Stall Menu"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-5 py-2.5 bg-[#0D121B] border-b border-slate-800/80 flex items-center justify-between text-xs font-mono-num">
          <span className={cash < 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
            BALANCE {formatRs(cash)}
          </span>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
              {hp}/{maxHp}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {stamina}/{maxStamina}
            </span>
          </div>
        </div>

        {/* Vendor Greeting */}
        <div className="px-5 pt-4 pb-1 text-xs text-slate-300 italic">
          &ldquo;Aaiye bhai sahab! Kya lagaaun aapke liye? Bilkul taaza aur swadisht bana hai.&rdquo;
        </div>

        {/* Menu List */}
        <div className="p-5 flex flex-col gap-3">
          {menu.map((item) => {
            const canAfford = cash >= item.price;
            return (
              <div
                key={item.id}
                className="p-3.5 bg-[#0B0E14] border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-100">{item.name}</span>
                    <span className="text-xs text-amber-400 font-medium">({item.hindiName})</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">{item.description}</p>
                  <div className="flex items-center gap-3 text-[11px] font-mono-num text-emerald-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> +{item.hpGain} HP
                    </span>
                    {item.restoreStamina && <span>+Full Stamina</span>}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canAfford}
                  onClick={() => onBuyItem(stall.id, item)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-[#0B0E14] text-xs font-mono-num font-bold cursor-pointer shrink-0 transition-colors"
                >
                  BUY {formatRs(item.price)}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0B0E14] border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            Done (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
