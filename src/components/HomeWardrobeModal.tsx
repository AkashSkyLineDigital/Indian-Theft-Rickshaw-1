import React from 'react';
import { ArrowLeftRight, Heart, Shield, Shirt, X } from 'lucide-react';
import { MAX_MEDKITS, PLAYER_OUTFITS, PlayerOutfitId, WEAPON_ORDER, WEAPONS, WeaponId } from '../types/game';
import { WeaponIcon } from './WeaponIcon';

interface HomeWardrobeModalProps {
  houseName: string;
  currentOutfit: PlayerOutfitId;
  ownedWeapons: WeaponId[];
  wardrobeWeapons: WeaponId[];
  playerArmor: number;
  wardrobeArmor: number;
  playerMedkits: number;
  wardrobeMedkits: number;
  onSelectOutfit: (outfit: PlayerOutfitId) => void;
  onStoreWeapon: (id: WeaponId) => void;
  onRetrieveWeapon: (id: WeaponId) => void;
  onStoreArmor: () => void;
  onRetrieveArmor: () => void;
  onStoreMedkit: () => void;
  onRetrieveMedkit: () => void;
  onClose: () => void;
}

const OUTFIT_IDS: PlayerOutfitId[] = ['default', 'kurta', 'jacket'];

export const HomeWardrobeModal: React.FC<HomeWardrobeModalProps> = ({
  houseName,
  currentOutfit,
  ownedWeapons,
  wardrobeWeapons,
  playerArmor,
  wardrobeArmor,
  playerMedkits,
  wardrobeMedkits,
  onSelectOutfit,
  onStoreWeapon,
  onRetrieveWeapon,
  onStoreArmor,
  onRetrieveArmor,
  onStoreMedkit,
  onRetrieveMedkit,
  onClose,
}) => {
  const carryFirearms = ownedWeapons.filter((w) => w !== 'fists');
  const storedFirearms = WEAPON_ORDER.filter((w) => w !== 'fists' && wardrobeWeapons.includes(w));

  return (
    <div className="fixed inset-0 z-50 bg-[#06090F]/85 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#101520] border border-sky-500/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-3.5 bg-[#151D2B] border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shirt className="w-5 h-5 text-sky-400" />
            <div>
              <div className="text-[10px] font-mono-num uppercase tracking-widest text-amber-400 font-bold">
                {houseName} · Home Almirah & Locker
              </div>
              <h2 className="font-display text-base font-bold text-slate-100">
                Outfits & Legal Gear Wardrobe
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-[#0B0E14] border border-slate-700 hover:border-slate-500 text-slate-300 cursor-pointer"
            aria-label="Close wardrobe"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex flex-col gap-5">
          {/* Outfit Selector */}
          <div className="flex flex-col gap-2">
            <div className="text-[11px] font-mono-num uppercase tracking-wider text-sky-300 font-bold">
              Choose Outfit (Almirah Kapde)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {OUTFIT_IDS.map((oid) => {
                const spec = PLAYER_OUTFITS[oid];
                const active = currentOutfit === oid;
                return (
                  <button
                    key={oid}
                    type="button"
                    onClick={() => onSelectOutfit(oid)}
                    className={`p-3 border text-left transition-colors cursor-pointer ${
                      active
                        ? 'bg-sky-500/20 border-sky-400 text-white'
                        : 'bg-[#141B29] border-slate-700/80 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-xs font-bold">{spec.label}</span>
                      {active && (
                        <span className="text-[9px] font-mono-num uppercase px-1.5 py-0.5 bg-sky-400 text-[#0B0E14] font-bold">
                          Wearing
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{spec.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Armor & Medkits Locker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-[#141B29] border border-slate-700/80 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-sky-300">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Body Armor
                </span>
                <span className="font-mono-num text-slate-200">
                  Carry: {Math.round(playerArmor)} · Locker: {wardrobeArmor}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={playerArmor <= 0 || wardrobeArmor >= 100}
                  onClick={onStoreArmor}
                  className="px-2.5 py-1.5 bg-[#0B0E14] border border-slate-700 hover:border-amber-400 disabled:opacity-40 text-[11px] font-mono-num font-bold text-amber-300 cursor-pointer"
                >
                  Store in Locker
                </button>
                <button
                  type="button"
                  disabled={wardrobeArmor <= 0 || playerArmor >= 100}
                  onClick={onRetrieveArmor}
                  className="px-2.5 py-1.5 bg-[#0B0E14] border border-slate-700 hover:border-emerald-400 disabled:opacity-40 text-[11px] font-mono-num font-bold text-emerald-300 cursor-pointer"
                >
                  Wear from Locker
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#141B29] border border-slate-700/80 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4" /> First-Aid Medkits
                </span>
                <span className="font-mono-num text-slate-200">
                  Carry: {playerMedkits} · Locker: {wardrobeMedkits}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={playerMedkits <= 0 || wardrobeMedkits >= MAX_MEDKITS}
                  onClick={onStoreMedkit}
                  className="px-2.5 py-1.5 bg-[#0B0E14] border border-slate-700 hover:border-amber-400 disabled:opacity-40 text-[11px] font-mono-num font-bold text-amber-300 cursor-pointer"
                >
                  Store 1 Medkit
                </button>
                <button
                  type="button"
                  disabled={wardrobeMedkits <= 0 || playerMedkits >= MAX_MEDKITS}
                  onClick={onRetrieveMedkit}
                  className="px-2.5 py-1.5 bg-[#0B0E14] border border-slate-700 hover:border-emerald-400 disabled:opacity-40 text-[11px] font-mono-num font-bold text-emerald-300 cursor-pointer"
                >
                  Take 1 Medkit
                </button>
              </div>
            </div>
          </div>

          {/* Weapons Safe Locker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-[#141B29] border border-slate-700/80 flex flex-col gap-2">
              <div className="text-[11px] font-mono-num uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5" /> On Person (Carry)
              </div>
              {carryFirearms.length === 0 ? (
                <div className="text-xs text-slate-500 py-2">Koi firearm carry nahi kar rahe.</div>
              ) : (
                carryFirearms.map((wid) => (
                  <div
                    key={wid}
                    className="flex items-center justify-between gap-2 p-2 bg-[#0B0E14] border border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <WeaponIcon weaponId={wid} className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-semibold text-slate-200">{WEAPONS[wid].shortName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onStoreWeapon(wid)}
                      className="px-2 py-1 bg-amber-500/20 border border-amber-500/60 hover:bg-amber-500/30 text-[10px] font-mono-num font-bold text-amber-200 cursor-pointer"
                    >
                      Store Safe
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-[#141B29] border border-slate-700/80 flex flex-col gap-2">
              <div className="text-[11px] font-mono-num uppercase tracking-wider text-emerald-300 font-bold flex items-center gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5" /> Wardrobe Locker (Safe)
              </div>
              {storedFirearms.length === 0 ? (
                <div className="text-xs text-slate-500 py-2">Locker khali hai.</div>
              ) : (
                storedFirearms.map((wid) => (
                  <div
                    key={wid}
                    className="flex items-center justify-between gap-2 p-2 bg-[#0B0E14] border border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <WeaponIcon weaponId={wid} className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-slate-200">{WEAPONS[wid].shortName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRetrieveWeapon(wid)}
                      className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/60 hover:bg-emerald-500/30 text-[10px] font-mono-num font-bold text-emerald-200 cursor-pointer"
                    >
                      Equip
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
