import React from 'react';
import { Check, X } from 'lucide-react';
import { WEAPONS, WeaponId, formatRs } from '../types/game';
import { WeaponIcon } from './WeaponIcon';

interface ShopConfirmModalProps {
  weaponId: WeaponId;
  cash: number;
  owned: boolean;
  ammoCount: number;
  onConfirmBuy: () => void;
  onEquip: () => void;
  onCancel: () => void;
}

export const ShopConfirmModal: React.FC<ShopConfirmModalProps> = ({
  weaponId,
  cash,
  owned,
  ammoCount,
  onConfirmBuy,
  onEquip,
  onCancel,
}) => {
  const spec = WEAPONS[weaponId];
  const cost = owned ? spec.ammoPrice : spec.price;
  const canAfford = cash >= cost;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#070A10]/75 p-4">
      <div className="w-full max-w-md bg-[#101520] border border-amber-500/60 shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono-num text-amber-400 uppercase tracking-wider">
              Pankaj Ammunation Display Claim
            </span>
            <h3 className="font-display text-xl font-bold text-slate-100 mt-0.5">
              {spec.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel Purchase"
            className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-[#0B0E14] border border-slate-800 flex items-center justify-between gap-4">
          <WeaponIcon weaponId={weaponId} className="w-28 h-12 shrink-0" />
          <div className="text-right font-mono-num text-xs">
            <div className="text-slate-300">{spec.caliber} · {spec.scopeLabel}</div>
            <div className="text-amber-400 font-semibold mt-0.5">
              DMG {spec.damage * spec.pellets} · RNG {spec.range}m
            </div>
            {owned && (
              <div className="text-emerald-400 mt-0.5">
                Owned ({ammoCount}/{spec.maxAmmo} rds)
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {owned
            ? `Claim an additional ${spec.ammoPackSize}-round magazine pack for ${formatRs(spec.ammoPrice)}?`
            : `Do you want to claim and purchase ${spec.name} for ${formatRs(spec.price)}?`}
        </p>

        <div className="flex items-center justify-between text-xs font-mono-num py-2 border-y border-slate-800">
          <span className="text-slate-400">YOUR BALANCE</span>
          <span className={canAfford ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
            {formatRs(cash)}
          </span>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          {owned && (
            <button
              type="button"
              onClick={() => {
                onEquip();
                onCancel();
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold cursor-pointer"
            >
              Equip Now
            </button>
          )}
          <button
            type="button"
            disabled={!canAfford || (owned && ammoCount >= spec.maxAmmo)}
            onClick={() => {
              onConfirmBuy();
              onCancel();
            }}
            className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-[#0B0E14] text-xs font-bold cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>
              {owned
                ? `Claim Ammo (${formatRs(spec.ammoPrice)})`
                : `Claim & Buy (${formatRs(spec.price)})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
