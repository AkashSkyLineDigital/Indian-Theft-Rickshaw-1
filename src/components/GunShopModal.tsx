import React from 'react';
import { HeartPulse, Shield, X } from 'lucide-react';
import {
  ARMOR_PRICE_INR,
  MAX_MEDKITS,
  MEDKIT_HEAL_AMOUNT,
  MEDKIT_PRICE_INR,
  WEAPON_ORDER,
  WEAPONS,
  WeaponId,
  formatRs,
} from '../types/game';
import { WeaponIcon } from './WeaponIcon';

interface GunShopModalProps {
  cash: number;
  hp: number;
  maxHp: number;
  armor: number;
  medkits: number;
  ownedWeapons: WeaponId[];
  activeWeapon: WeaponId;
  ammo: Record<WeaponId, number>;
  onBuyWeaponOrAmmo: (id: WeaponId) => void;
  onEquipWeapon: (id: WeaponId) => void;
  onBuyArmor: () => void;
  onBuyMedkit: () => void;
  onUseMedkit: () => void;
  onClose: () => void;
}

export const GunShopModal: React.FC<GunShopModalProps> = ({
  cash,
  hp,
  maxHp,
  armor,
  medkits,
  ownedWeapons,
  activeWeapon,
  ammo,
  onBuyWeaponOrAmmo,
  onEquipWeapon,
  onBuyArmor,
  onBuyMedkit,
  onUseMedkit,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#070A10]/85 p-4">
      <div className="w-full max-w-4xl bg-[#101520] border border-slate-700/80 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0B0E14] border-b border-slate-800">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-xl font-bold tracking-wider text-slate-100">
              PANKAJ AMMUNATION &amp; ARMORY
            </h2>
            <span
              className={`font-mono-num text-sm font-bold ${
                cash < 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              BALANCE {formatRs(cash)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Armory"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gear & Weapons Catalog */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          {/* Tactical Vest + Medkit Supply Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 bg-[#0B0E14] border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-sky-950/50 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-100">Kevlar Tactical Vest</div>
                  <div className="text-xs text-slate-400">
                    Absorbs 70% gunfire damage · Armor: {armor}/100
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onBuyArmor}
                disabled={armor >= 100 || cash < ARMOR_PRICE_INR}
                className="px-3.5 py-2 text-xs font-mono-num font-bold bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                {armor >= 100 ? 'FULL' : `BUY ${formatRs(ARMOR_PRICE_INR)}`}
              </button>
            </div>

            <div className="p-4 bg-[#0B0E14] border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-100">Field Medkit</div>
                  <div className="text-xs text-slate-400">
                    Restores +{MEDKIT_HEAL_AMOUNT} HP (Press H) · Bag: {medkits}/{MAX_MEDKITS}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {medkits > 0 && hp < maxHp && (
                  <button
                    type="button"
                    onClick={onUseMedkit}
                    className="px-2.5 py-2 text-xs font-mono-num font-bold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 cursor-pointer"
                  >
                    USE
                  </button>
                )}
                <button
                  type="button"
                  onClick={onBuyMedkit}
                  disabled={medkits >= MAX_MEDKITS || cash < MEDKIT_PRICE_INR}
                  className="px-3.5 py-2 text-xs font-mono-num font-bold bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  {medkits >= MAX_MEDKITS ? 'MAX' : `BUY ${formatRs(MEDKIT_PRICE_INR)}`}
                </button>
              </div>
            </div>
          </div>

          {/* Firearms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {WEAPON_ORDER.filter((w) => w !== 'fists').map((wid) => {
              const spec = WEAPONS[wid];
              const owned = ownedWeapons.includes(wid);
              const equipped = activeWeapon === wid;
              const currentAmmo = ammo[wid] ?? 0;

              return (
                <div
                  key={wid}
                  className={`p-4 bg-[#0B0E14] border flex flex-col justify-between gap-3 ${
                    equipped ? 'border-amber-500/80' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-100">{spec.name}</div>
                      <div className="text-[11px] font-mono-num text-amber-400 mt-0.5">
                        {spec.caliber} · DMG {spec.damage * spec.pellets} · RNG {spec.range}m · {spec.scopeLabel}
                      </div>
                    </div>
                    <WeaponIcon weaponId={wid} className="w-24 h-11 shrink-0" />
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{spec.description}</p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    {owned ? (
                      <>
                        <span className="text-xs font-mono-num text-slate-300">
                          AMMO {currentAmmo}/{spec.maxAmmo}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onBuyWeaponOrAmmo(wid)}
                            disabled={currentAmmo >= spec.maxAmmo || cash < spec.ammoPrice}
                            className="px-3 py-1.5 text-xs font-mono-num font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-emerald-400 border border-slate-700 cursor-pointer"
                          >
                            +{spec.ammoPackSize} RDS ({formatRs(spec.ammoPrice)})
                          </button>
                          <button
                            type="button"
                            onClick={() => onEquipWeapon(wid)}
                            disabled={equipped}
                            className={`px-3.5 py-1.5 text-xs font-bold cursor-pointer ${
                              equipped
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                                : 'bg-amber-500 hover:bg-amber-400 text-[#0B0E14]'
                            }`}
                          >
                            {equipped ? 'EQUIPPED' : 'EQUIP'}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-mono-num text-slate-500">LOCKED</span>
                        <button
                          type="button"
                          onClick={() => onBuyWeaponOrAmmo(wid)}
                          disabled={cash < spec.price}
                          className="px-4 py-2 text-xs font-mono-num font-bold bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-[#0B0E14] transition-colors cursor-pointer"
                        >
                          PURCHASE {formatRs(spec.price)}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
