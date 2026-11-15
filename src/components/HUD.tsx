import React from 'react';
import {
  Coffee,
  Crosshair,
  Disc,
  Eye,
  HardHat,
  HeartPulse,
  Map as MapIcon,
  Mic,
  Moon,
  Navigation,
  PhoneCall,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Sunrise,
  Sunset,
  X,
  Zap,
} from 'lucide-react';
import {
  FloatingToast,
  HudSnapshot,
  MAX_MEDKITS,
  WEAPON_ORDER,
  WEAPONS,
  WeaponId,
  formatRs,
  formatRsExact,
} from '../types/game';
import { Minimap } from './Minimap';
import { WeaponIcon } from './WeaponIcon';

interface HUDProps {
  hud: HudSnapshot;
  toasts: FloatingToast[];
  showControlsStrip: boolean;
  onOpenSettings: () => void;
  onOpenShop: () => void;
  onOpenPhone: () => void;
  onOpenWheel: () => void;
  onOpenMap: () => void;
  onClickDisplayLabel: (weaponId: WeaponId) => void;
  onClickDealerLabel: () => void;
  onClickBankerLabel: () => void;
  onClickLicenseOfficerLabel: () => void;
  onRespondLicenseCheck: (showLicense: boolean) => void;
  onUseMedkit: () => void;
  onSkipCutscene: () => void;
  onSelectWeapon: (id: WeaponId) => void;
  onReplyChai: (accept: boolean) => void;
  onStartMicReply: () => void;
  onToggleFirstPerson: () => void;
  onToggleAds: () => void;
  onToggleHelmet: () => void;
  onContextInteract: () => void;
  onClearWaypoint: () => void;
  onOfferStreetBribe: () => void;
  onSurrender: () => void;
  onClickHomeStation?: (station: 'PUJA' | 'BED' | 'WARDROBE') => void;
}

function formatTimer(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const HUD: React.FC<HUDProps> = ({
  hud,
  toasts,
  showControlsStrip,
  onOpenSettings,
  onOpenShop,
  onOpenPhone,
  onOpenWheel,
  onOpenMap,
  onClickDisplayLabel,
  onClickDealerLabel,
  onClickBankerLabel,
  onClickLicenseOfficerLabel,
  onRespondLicenseCheck,
  onUseMedkit,
  onSkipCutscene,
  onSelectWeapon,
  onReplyChai,
  onStartMicReply,
  onToggleFirstPerson,
  onToggleAds,
  onToggleHelmet,
  onContextInteract,
  onClearWaypoint,
  onOfferStreetBribe,
  onSurrender,
  onClickHomeStation,
}) => {
  const activeSpec = WEAPONS[hud.activeWeapon];
  const hpPct = Math.max(0, Math.min(100, (hud.hp / hud.maxHp) * 100));
  const staminaPct = Math.max(0, Math.min(100, (hud.stamina / Math.max(1, hud.maxStamina)) * 100));
  const inCutscene = hud.mission.phase === 'CUTSCENE';
  const canFirearm = !inCutscene && !hud.inVehicle && hud.activeWeapon !== 'fists';
  const reticleColor = hud.targetInCrosshair ? 'bg-red-500' : 'bg-amber-400';

  const TimeIcon =
    hud.timeOfDay.phaseLabel === 'MORNING'
      ? Sunrise
      : hud.timeOfDay.phaseLabel === 'NOON'
        ? Sun
        : hud.timeOfDay.phaseLabel === 'EVENING'
          ? Sunset
          : Moon;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Scope & Aim-Down-Sights Overlay */}
      {canFirearm && hud.adsActive && activeSpec.scopeType === 'holo_2x' && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[340px] h-[340px] rounded-full border-4 border-slate-900 shadow-[0_0_0_9999px_rgba(4,6,10,0.82)] relative flex items-center justify-center">
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-slate-200/35" />
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-slate-200/35" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
            <div className="absolute bottom-5 text-[10px] font-mono-num font-bold tracking-widest text-amber-300/90">
              {activeSpec.scopeLabel}
            </div>
          </div>
        </div>
      )}

      {canFirearm && hud.adsActive && activeSpec.scopeType === 'red_dot' && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-28 h-28 rounded-full border-2 border-emerald-400/70 bg-emerald-950/10 relative flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <span className="absolute -bottom-5 text-[9px] font-mono-num font-bold text-emerald-300 whitespace-nowrap">
              {activeSpec.scopeLabel}
            </span>
          </div>
        </div>
      )}

      {canFirearm && hud.adsActive && activeSpec.scopeType === 'spread' && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-amber-400/80 relative flex items-center justify-center">
            <div className={`w-1.5 h-1.5 rounded-full ${reticleColor}`} />
            <span className="absolute -bottom-5 text-[9px] font-mono-num font-bold text-amber-300 whitespace-nowrap">
              {activeSpec.scopeLabel}
            </span>
          </div>
        </div>
      )}

      {/* Center Crosshair reticle when on foot with firearm */}
      {canFirearm && (!hud.adsActive || activeSpec.scopeType === 'iron') && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-90">
          <div className={hud.adsActive ? 'w-3.5 h-3.5 relative' : 'w-5 h-5 relative'}>
            <div className={`absolute left-1/2 top-0 w-0.5 h-1.5 -translate-x-1/2 ${reticleColor}`} />
            <div className={`absolute left-1/2 bottom-0 w-0.5 h-1.5 -translate-x-1/2 ${reticleColor}`} />
            <div className={`absolute top-1/2 left-0 h-0.5 w-1.5 -translate-y-1/2 ${reticleColor}`} />
            <div className={`absolute top-1/2 right-0 h-0.5 w-1.5 -translate-y-1/2 ${reticleColor}`} />
            <div className={`absolute left-1/2 top-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full ${reticleColor}`} />
          </div>
        </div>
      )}

      {/* Darshan / Prayer Respectful UI Animation */}
      {!inCutscene && hud.prayerAnim && (
        <div className="fixed inset-x-0 top-20 flex justify-center pointer-events-none z-20 px-4">
          <div
            className={`px-6 py-4 bg-[#0B0E14]/94 border-2 shadow-2xl flex items-center gap-4 max-w-md ${
              hud.prayerAnim.kind === 'mosque'
                ? 'border-emerald-400/85 text-emerald-100'
                : 'border-amber-400/90 text-amber-100'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 sacred-halo shrink-0 ${
                hud.prayerAnim.kind === 'mosque'
                  ? 'border-emerald-400 bg-emerald-950/80 text-emerald-300'
                  : 'border-amber-400 bg-amber-950/80 text-amber-300'
              }`}
            >
              <span className="text-xl font-bold">
                {hud.prayerAnim.kind === 'mosque' ? '☪' : 'ॐ'}
              </span>
            </div>
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="font-display text-sm font-bold tracking-wider uppercase">
                {hud.prayerAnim.title}
              </div>
              <div className="text-xs text-slate-200 leading-snug">
                {hud.prayerAnim.subtitle}
              </div>
              <div className="w-full h-1 bg-slate-800 mt-1 overflow-hidden">
                <div
                  className={
                    hud.prayerAnim.kind === 'mosque' ? 'h-full bg-emerald-400' : 'h-full bg-amber-400'
                  }
                  style={{ width: `${hud.prayerAnim.progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cutscene Celebration Overlay */}
      {inCutscene && (
        <>
          <div className="fixed inset-x-0 top-0 h-14 bg-black/90" />
          <div className="fixed inset-x-0 bottom-0 h-16 bg-black/90 flex items-center justify-between px-6 pointer-events-auto">
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-wider text-emerald-400">
                {hud.mission.cutsceneBanner || 'MISSION SUCCESSFUL'}
              </span>
              <span className="text-xs text-slate-300">
                24 rescued Indian street dogs released — look out for friendly dogs around the city!
              </span>
            </div>
            <button
              type="button"
              onClick={onSkipCutscene}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#0B0E14] text-xs font-display font-bold tracking-wider cursor-pointer"
            >
              CONTINUE
            </button>
          </div>
        </>
      )}

      {/* World-projected Building Signs, Home Stations, Gun Shop, DM License Office & Royal Bank Tags */}
      {!inCutscene &&
        hud.worldLabels.map((lbl) => {
          if (lbl.isBuildingSign) {
            return (
              <div
                key={lbl.id}
                style={{
                  transform: `translate3d(${lbl.screenX}px, ${lbl.screenY}px, 0) translate(-50%, -100%)`,
                  borderColor: lbl.signAccent ?? '#f59e0b',
                }}
                className="absolute top-0 left-0 pointer-events-none px-2.5 py-1 bg-[#0B0E14]/94 border-l-4 border border-slate-700/90 shadow-lg flex items-center gap-1.5"
              >
                <span
                  className="w-2 h-2 shrink-0"
                  style={{ backgroundColor: lbl.signAccent ?? '#f59e0b' }}
                />
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] font-display font-bold tracking-wide text-slate-100 whitespace-nowrap">
                    {lbl.title}
                  </span>
                  {lbl.subtitle && (
                    <span className="text-[9px] font-mono-num text-amber-300 whitespace-nowrap">
                      {lbl.subtitle}
                    </span>
                  )}
                </div>
              </div>
            );
          }

          return (
            <button
              key={lbl.id}
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                if (lbl.homeStation && onClickHomeStation) {
                  onClickHomeStation(lbl.homeStation);
                } else if (lbl.isBanker) onClickBankerLabel();
                else if (lbl.isLicenseOfficer) onClickLicenseOfficerLabel();
                else if (lbl.isDealer) onClickDealerLabel();
                else if (lbl.weaponId) onClickDisplayLabel(lbl.weaponId);
              }}
              style={{
                transform: `translate3d(${lbl.screenX}px, ${lbl.screenY}px, 0) translate(-50%, -100%)`,
              }}
              className={`absolute top-0 left-0 pointer-events-auto px-2.5 py-1 bg-[#0B0E14]/92 hover:bg-[#171E2C] border text-center shadow-lg cursor-pointer transition-colors ${
                lbl.homeStation === 'PUJA'
                  ? 'border-amber-400/90'
                  : lbl.homeStation === 'BED'
                    ? 'border-emerald-400/85'
                    : lbl.homeStation === 'WARDROBE'
                      ? 'border-sky-400/85'
                      : lbl.isBanker
                        ? 'border-sky-400/80'
                        : lbl.isLicenseOfficer
                          ? 'border-purple-400/85'
                          : 'border-amber-500/75'
              }`}
            >
              <div className="text-[11px] font-display font-bold text-slate-100 leading-tight whitespace-nowrap">
                {lbl.title}
              </div>
              <div
                className={`text-[10px] font-mono-num whitespace-nowrap ${
                  lbl.homeStation === 'PUJA'
                    ? 'text-amber-300'
                    : lbl.homeStation === 'BED'
                      ? 'text-emerald-300'
                      : lbl.homeStation === 'WARDROBE'
                        ? 'text-sky-300'
                        : lbl.isBanker
                          ? 'text-sky-300'
                          : lbl.isLicenseOfficer
                            ? 'text-purple-300'
                            : 'text-amber-400'
                }`}
              >
                {lbl.subtitle}
              </div>
            </button>
          );
        })}

      {/* World-projected Witness Phone Call Alert */}
      {!inCutscene &&
        hud.witnessAlert &&
        hud.witnessAlert.screenX !== undefined &&
        hud.witnessAlert.screenY !== undefined && (
          <div
            style={{
              transform: `translate3d(${hud.witnessAlert.screenX}px, ${hud.witnessAlert.screenY}px, 0) translate(-50%, -100%)`,
            }}
            className="absolute top-0 left-0 pointer-events-none flex flex-col items-center gap-0.5 z-20"
          >
            <div className="px-2 py-1 bg-red-950/95 border border-red-400 text-[10px] font-mono-num font-bold text-red-100 flex items-center gap-1.5 shadow-lg whitespace-nowrap">
              <PhoneCall className="w-3 h-3 text-amber-300 animate-pulse" />
              <span>CALLING 100 · {hud.witnessAlert.remainingSec.toFixed(1)}s</span>
            </div>
            <div className="w-24 h-1 bg-slate-900 border border-red-500/70 overflow-hidden">
              <div
                className="h-full bg-amber-400"
                style={{
                  width: `${Math.max(0, Math.min(100, ((hud.witnessAlert.totalSec - hud.witnessAlert.remainingSec) / Math.max(0.1, hud.witnessAlert.totalSec)) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}

      {/* World-projected floating NPC HP bars when damaged */}
      {!inCutscene &&
        hud.damagedNpcs.map((npc) => {
          const pct = Math.max(0, Math.min(100, (npc.hp / npc.maxHp) * 100));
          return (
            <div
              key={npc.id}
              style={{
                transform: `translate3d(${npc.screenX}px, ${npc.screenY}px, 0) translate(-50%, -100%)`,
              }}
              className="absolute top-0 left-0 pointer-events-none flex flex-col items-center gap-0.5"
            >
              <div className="px-1.5 py-0.5 bg-[#0B0E14]/90 border border-slate-700/80 text-[10px] font-mono-num text-slate-200 whitespace-nowrap">
                {npc.name} · {npc.hp}/{npc.maxHp}
              </div>
              <div className="w-20 h-1.5 bg-slate-900 border border-slate-700/80 overflow-hidden">
                <div
                  className={npc.isPolice ? 'h-full bg-blue-500' : 'h-full bg-red-500'}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}

      {/* Top-Left Title, Clock, Waypoint, Blessed Status, Mission Status & Wanted Status */}
      {!inCutscene && (
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-3.5 py-2 bg-[#111622]/95 border border-slate-700/70">
            <span className="font-display font-bold text-sm tracking-wider text-slate-100">
              INDIAN THEFT RICKSHAW
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs font-mono-num text-slate-400">
              KILLS {hud.kills}
            </span>
          </div>

          {/* Day-Noon-Midnight Clock Badge */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#111622]/95 border border-slate-700/70 text-xs font-mono-num self-start">
            <TimeIcon
              className={`w-3.5 h-3.5 ${
                hud.timeOfDay.phaseLabel === 'MIDNIGHT'
                  ? 'text-sky-300'
                  : hud.timeOfDay.phaseLabel === 'EVENING'
                    ? 'text-orange-400'
                    : 'text-amber-400'
              }`}
            />
            <span className="font-bold text-slate-100">{hud.timeOfDay.formattedTime}</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-300 font-semibold">{hud.timeOfDay.phaseLabel}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">DAY {hud.timeOfDay.dayCount}</span>
            <span className="text-slate-600">·</span>
            <span className="text-cyan-300">{hud.bank.calendarDate}</span>
          </div>

          {/* Active Map GPS Waypoint Pill */}
          {hud.waypoint?.active && (
            <div className="pointer-events-auto flex items-center justify-between gap-3 px-3 py-2 bg-[#101928]/95 border border-amber-400/80 max-w-xs shadow-lg">
              <div className="flex items-center gap-2 min-w-0">
                <Navigation
                  style={{ transform: `rotate(${hud.waypoint.bearingDeg}deg)` }}
                  className="w-4 h-4 text-amber-400 shrink-0 transition-transform duration-100"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-amber-200 truncate">
                    {hud.waypoint.label}
                  </span>
                  <span className="text-[10px] font-mono-num text-slate-300">
                    GPS: {hud.waypoint.distanceMeters}m away
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClearWaypoint}
                title="Clear Waypoint (Backspace)"
                className="p-1 bg-slate-800 hover:bg-red-900/80 border border-slate-600 text-slate-300 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Blessed Status Buff Indicator */}
          {hud.blessedRemainingSec > 0 && (
            <div className="px-3 py-1.5 bg-amber-950/85 border border-amber-400/75 max-w-xs flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px] font-mono-num text-amber-200">
                <span className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  BLESSED · +HP &amp; STAMINA
                </span>
                <span className="font-bold text-amber-300">{hud.blessedRemainingSec}s</span>
              </div>
              <div className="w-full h-1 bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-150"
                  style={{
                    width: `${Math.max(0, Math.min(100, (hud.blessedRemainingSec / Math.max(1, hud.blessedTotalSec)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}

          {hud.mission.active && (
            <div className="px-3.5 py-2.5 bg-[#0F172A]/95 border border-sky-500/70 max-w-xs flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px] font-mono-num">
                <span className="text-sky-300 font-bold tracking-wider">POLICE DOG RESCUE</span>
                <span className="text-amber-400 font-bold">
                  {formatTimer(hud.mission.timeRemainingSec)}
                </span>
              </div>
              <div className="text-xs font-medium text-slate-100 leading-snug">
                {hud.mission.objectiveText}
              </div>
              <div className="text-[11px] font-mono-num text-slate-400">
                GPS Target: {hud.mission.distanceMeters}m away (follow cyan line)
              </div>
            </div>
          )}

          {hud.witnessAlert && (
            <div className="px-3 py-2 bg-red-950/92 border border-red-500/80 max-w-xs flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px] font-mono-num text-red-200">
                <span className="flex items-center gap-1.5 font-bold">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  WITNESS CALLING POLICE (100)
                </span>
                <span className="font-bold text-amber-300">{hud.witnessAlert.remainingSec.toFixed(1)}s</span>
              </div>
              <div className="text-[11px] text-slate-200">
                {hud.witnessAlert.npcName} ({hud.witnessAlert.reason})
              </div>
              <div className="w-full h-1 bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-100"
                  style={{
                    width: `${Math.max(0, Math.min(100, ((hud.witnessAlert.totalSec - hud.witnessAlert.remainingSec) / Math.max(0.1, hud.witnessAlert.totalSec)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}

          {hud.policeWarning && (
            <div className="pointer-events-auto px-3 py-2 bg-red-950/92 border border-red-500/70 text-xs font-medium text-red-100 max-w-xs flex flex-col gap-1.5">
              <span>{hud.policeWarning}</span>
              {hud.wantedLevel >= 1 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={onSurrender}
                    className="px-2 py-1 bg-sky-700 hover:bg-sky-600 text-white text-[10px] font-mono-num font-bold cursor-pointer"
                  >
                    [Hold H] Surrender
                  </button>
                  {hud.streetBribe?.available && (
                    <button
                      type="button"
                      onClick={onOfferStreetBribe}
                      className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-[#0B0E14] text-[10px] font-mono-num font-bold cursor-pointer"
                    >
                      [B] Chai-Paani {formatRs(hud.streetBribe.amount)}
                    </button>
                  )}
                </div>
              )}
              {hud.surrenderHoldPct > 0 && (
                <div className="flex flex-col gap-0.5 pt-0.5">
                  <span className="text-[10px] font-mono-num text-sky-300 font-bold">
                    SURRENDERING... {hud.surrenderHoldPct}%
                  </span>
                  <div className="w-full h-1.5 bg-slate-900 overflow-hidden">
                    <div
                      className="h-full bg-sky-400 transition-all duration-75"
                      style={{ width: `${hud.surrenderHoldPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Top-Right: Health, Armor, Medkits, Cash, Wanted Stars, Weapon & Actions */}
      {!inCutscene && (
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2.5">
          <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap justify-end">
            {!hud.inVehicle && (
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onToggleFirstPerson();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-2 border text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  hud.firstPerson
                    ? 'bg-sky-600 hover:bg-sky-500 border-sky-400 text-white'
                    : 'bg-[#141A26]/95 hover:bg-[#1C2434] border-slate-600/70 text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{hud.firstPerson ? 'FPV ON (C)' : 'FPV (C)'}</span>
              </button>
            )}
            {canFirearm && (
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onToggleAds();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-2 border text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  hud.adsActive
                    ? 'bg-amber-500 hover:bg-amber-400 border-amber-300 text-[#0B0E14]'
                    : 'bg-[#141A26]/95 hover:bg-[#1C2434] border-amber-500/40 text-amber-300'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>{hud.adsActive ? 'Scoped (X)' : 'Scope (X)'}</span>
              </button>
            )}
            {(hud.hasHelmet || hud.currentVehicleKind === 'bike') && (
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onToggleHelmet();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-2 border text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  hud.helmetOn
                    ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white'
                    : 'bg-[#141A26]/95 hover:bg-[#1C2434] border-amber-500/50 text-amber-300'
                }`}
              >
                <HardHat className="w-3.5 h-3.5" />
                <span>{hud.helmetOn ? 'Helmet ON (L)' : 'Helmet (L)'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onStartMicReply();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-2 border text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                hud.micState.active
                  ? 'bg-red-600 hover:bg-red-500 border-red-400 text-white'
                  : 'bg-[#141A26]/95 hover:bg-[#1C2434] border-emerald-500/40 text-emerald-300'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{hud.micState.active ? 'Mic ON (V)' : 'Mic (V)'}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenMap();
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 bg-[#141A26]/95 hover:bg-[#1C2434] border border-sky-500/40 text-sky-300 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map (M)</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenWheel();
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 bg-[#141A26]/95 hover:bg-[#1C2434] border border-slate-600/70 text-slate-100 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              <Disc className="w-3.5 h-3.5 text-amber-400" />
              <span>Wheel (Q)</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenPhone();
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 bg-[#141A26]/95 hover:bg-[#1C2434] border border-sky-500/40 text-sky-300 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone (P)</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenShop();
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 bg-[#141A26]/95 hover:bg-[#1C2434] border border-amber-500/40 text-amber-400 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Pankaj Guns (B)</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenSettings();
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 bg-[#141A26]/95 hover:bg-[#1C2434] border border-slate-600/70 text-slate-100 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings (Esc)</span>
            </button>
          </div>

          {/* Tactical Player Status Card */}
          <div className="w-64 bg-[#111622]/95 border border-slate-700/75 p-3 flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between">
              <span
                className={`font-mono-num text-xl font-bold ${
                  hud.cash < 0 ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {formatRs(hud.cash)}
              </span>
              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-1" aria-label={`Wanted level ${hud.wantedLevel} of 5`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= hud.wantedLevel
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                {hud.wantedLevel > 0 && hud.wantedTierTitle && (
                  <span className="text-[10px] font-mono-num font-bold text-red-300 text-right">
                    {hud.wantedTierTitle}
                  </span>
                )}
                {hud.wantedLevel > 0 && hud.wantedNextHint && (
                  <span className="text-[9px] font-mono-num text-amber-200/90 text-right leading-tight max-w-[165px]">
                    {hud.wantedNextHint}
                  </span>
                )}
              </div>
            </div>

            {(hud.bank.savingsTotal > 0 || hud.bank.fdTotal > 0) && (
              <div className="flex items-center justify-between text-[11px] font-mono-num px-2 py-1 bg-cyan-950/35 border border-cyan-500/35 text-cyan-200">
                <span>BANK (SAV+FD)</span>
                <span className="font-bold">
                  {formatRsExact(hud.bank.savingsTotal + hud.bank.fdTotal)}
                </span>
              </div>
            )}

            {hud.probationDaysLeft > 0 && (
              <div className="flex items-center justify-between text-[10px] font-mono-num px-2 py-1 bg-orange-950/75 border border-orange-500/60 text-orange-200">
                <span>PROBATION · INT FROZEN</span>
                <span className="font-bold">{hud.probationDaysLeft}D LEFT</span>
              </div>
            )}

            {/* Health Bar */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-mono-num text-slate-300">
                <span>HEALTH</span>
                <span>
                  {hud.hp} / {hud.maxHp}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-900 border border-slate-700/70 overflow-hidden">
                <div
                  className={`h-full transition-all duration-150 ${
                    hpPct > 35 ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${hpPct}%` }}
                />
              </div>
            </div>

            {/* Stamina Bar (Sprint with Shift) */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-mono-num text-amber-300">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" /> STAMINA
                </span>
                <span>{hud.stamina} / {hud.maxStamina}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 border border-slate-700/70 overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${
                    staminaPct > 22 ? 'bg-amber-400' : 'bg-orange-600'
                  }`}
                  style={{ width: `${staminaPct}%` }}
                />
              </div>
            </div>

            {/* Armor Bar */}
            {hud.armor > 0 && (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono-num text-sky-300">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" /> ARMOR
                  </span>
                  <span>{hud.armor} / 100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 border border-slate-700/70 overflow-hidden">
                  <div
                    className="h-full bg-sky-400 transition-all duration-150"
                    style={{ width: `${hud.armor}%` }}
                  />
                </div>
              </div>
            )}

            {/* Medkit Row */}
            <div className="flex items-center justify-between text-[11px] font-mono-num pointer-events-auto">
              <span className="flex items-center gap-1 text-emerald-300">
                <HeartPulse className="w-3.5 h-3.5" /> MEDKITS {hud.medkits}/{MAX_MEDKITS}
              </span>
              <button
                type="button"
                disabled={hud.medkits <= 0 || hud.hp >= hud.maxHp}
                onClick={onUseMedkit}
                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold cursor-pointer"
              >
                HEAL (H)
              </button>
            </div>

            {/* Active Weapon Display + Arms / Driving / Helmet Badges */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-xs font-semibold text-slate-100">{activeSpec.shortName}</span>
                  <span
                    className={`px-1 py-0.2 text-[9px] font-mono-num font-bold border ${
                      hud.hasGunLicense
                        ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    {hud.hasGunLicense ? 'ARMS OK' : 'NO ARMS'}
                  </span>
                  <span
                    className={`px-1 py-0.2 text-[9px] font-mono-num font-bold border ${
                      hud.hasDrivingLicense
                        ? 'bg-sky-950/70 border-sky-500/60 text-sky-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    {hud.hasDrivingLicense ? 'DL OK' : 'NO DL'}
                  </span>
                  {hud.hasHelmet && (
                    <span
                      className={`px-1 py-0.2 text-[9px] font-mono-num font-bold border ${
                        hud.helmetOn
                          ? 'bg-amber-950/80 border-amber-400/70 text-amber-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      {hud.helmetOn ? 'HELMET' : 'NO HELM'}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono-num text-slate-400">
                  {hud.activeWeapon === 'fists'
                    ? 'MELEE'
                    : `${hud.ammo[hud.activeWeapon]} RDS · ${activeSpec.caliber}`}
                </span>
              </div>
              <WeaponIcon weaponId={hud.activeWeapon} className="w-16 h-8 shrink-0" />
            </div>

            {/* Quick Weapon Selector Bar (1-5) */}
            <div className="grid grid-cols-5 gap-1 pointer-events-auto">
              {WEAPON_ORDER.map((wid, idx) => {
                const owned = hud.ownedWeapons.includes(wid);
                const active = hud.activeWeapon === wid;
                return (
                  <button
                    key={wid}
                    type="button"
                    disabled={!owned}
                    onClick={() => onSelectWeapon(wid)}
                    title={`${WEAPONS[wid].name} (${idx + 1})`}
                    className={`py-1 text-[11px] font-mono-num border transition-colors ${
                      active
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold cursor-pointer'
                        : owned
                          ? 'bg-slate-900/90 border-slate-700 text-slate-300 hover:border-slate-500 cursor-pointer'
                          : 'bg-slate-950/60 border-slate-800/70 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toast Feed */}
          <div className="flex flex-col items-end gap-1.5 mt-1">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`px-3 py-1.5 text-xs font-mono-num font-semibold border ${
                  t.tone === 'cash'
                    ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-300'
                    : t.tone === 'warn'
                      ? 'bg-red-950/95 border-red-500/60 text-red-200'
                      : t.tone === 'cheat'
                        ? 'bg-amber-950/95 border-amber-400/70 text-amber-300'
                        : 'bg-[#111622]/95 border-slate-600/70 text-slate-200'
                }`}
              >
                {t.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom-Left: Tactical Minimap & Vehicle Telemetry */}
      {!inCutscene && (
        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
          {hud.inVehicle && (
            <div className="px-3 py-1.5 bg-[#111622]/95 border border-slate-700/80 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 truncate max-w-[110px]">
                {hud.vehicleName}
              </span>
              <span className="font-mono-num font-bold text-amber-400">
                {hud.vehicleSpeedKmh} KM/H
              </span>
            </div>
          )}
          <Minimap
            playerX={hud.playerX}
            playerZ={hud.playerZ}
            playerYaw={hud.playerYaw}
            wantedLevel={hud.wantedLevel}
            blips={hud.blips}
            routePoints={hud.mission.routePoints}
            waypoint={hud.waypoint}
            onExpand={onOpenMap}
          />
        </div>
      )}

      {/* Bottom-Center: Live Mic Bar, Interactive Chai Dialogue, Hindi NPC Subtitles, Context Prompt & Controls Strip */}
      {!inCutscene && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 max-w-[92vw]">
          {(hud.micState.active || hud.micState.status) && !hud.chaiPrompt && (
            <div
              className={`pointer-events-auto px-4 py-2 border-2 shadow-xl flex items-center gap-3 ${
                hud.micState.active
                  ? 'bg-[#1a0b0e]/95 border-red-500 text-white'
                  : 'bg-[#0B0E14]/95 border-sky-500/70 text-sky-200'
              }`}
            >
              <Mic className={`w-4 h-4 shrink-0 ${hud.micState.active ? 'text-red-400' : 'text-sky-400'}`} />
              {hud.micState.active && (
                <div className="flex items-end gap-0.5 h-4 shrink-0">
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <span
                      key={i}
                      style={{ animationDelay: `${i * 0.09}s` }}
                      className="w-1 h-full bg-red-400 mic-eq-bar"
                    />
                  ))}
                </div>
              )}
              <div className="flex flex-col text-xs">
                <span className="font-mono-num font-bold">
                  {hud.micState.active ? 'MIC ON · LISTENING (hi-IN)' : 'VOICE MIC'}
                </span>
                {hud.micState.status && (
                  <span className="text-[11px] text-slate-300">{hud.micState.status}</span>
                )}
                {hud.micState.transcript && (
                  <span className="text-[11px] font-mono-num text-amber-300">
                    Suna: &ldquo;{hud.micState.transcript}&rdquo;
                  </span>
                )}
              </div>
              {hud.micState.active && (
                <button
                  type="button"
                  onClick={onStartMicReply}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[10px] font-mono-num font-bold cursor-pointer"
                >
                  STOP (V)
                </button>
              )}
            </div>
          )}

          {hud.chaiPrompt && (
            <div className="pointer-events-auto w-96 max-w-full bg-[#101520]/96 border-2 border-amber-500/80 shadow-2xl p-3 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-display font-bold text-amber-400 uppercase tracking-wider">
                  <Coffee className="w-4 h-4" />
                  <span>{hud.chaiPrompt.npcName}</span>
                </div>
                <button
                  type="button"
                  onClick={onStartMicReply}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono-num font-bold border cursor-pointer transition-colors ${
                    hud.chaiPrompt.micListening || hud.micState.active
                      ? 'bg-red-600 border-red-400 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-sky-300'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{hud.chaiPrompt.micListening || hud.micState.active ? 'Listening... (V)' : '[V] Mic Reply'}</span>
                </button>
              </div>
              <div className="text-sm font-semibold text-slate-100">
                &ldquo;{hud.chaiPrompt.line}&rdquo;
              </div>
              {(hud.chaiPrompt.micListening || hud.micState.active) && (
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-red-950/60 border border-red-500/60">
                  <div className="flex items-end gap-0.5 h-3.5">
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                      <span
                        key={i}
                        style={{ animationDelay: `${i * 0.09}s` }}
                        className="w-1 h-full bg-red-400 mic-eq-bar"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono-num text-red-200">
                    {hud.micState.transcript ? `Suna: "${hud.micState.transcript}"` : 'MIC ON · Boliye...'}
                  </span>
                </div>
              )}
              {hud.chaiPrompt.micStatus && (
                <div className="text-[11px] font-mono-num text-sky-300 bg-sky-950/50 border border-sky-500/40 px-2 py-1">
                  {hud.chaiPrompt.micStatus}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onReplyChai(true)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono-num font-bold cursor-pointer transition-colors"
                >
                  [1] Haan chal bhai
                </button>
                <button
                  type="button"
                  onClick={() => onReplyChai(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-mono-num font-bold cursor-pointer transition-colors"
                >
                  [2] Baad mein
                </button>
              </div>
            </div>
          )}

          {hud.npcSubtitle && !hud.chaiPrompt && (
            <div className="px-4 py-1.5 bg-[#0B0E14]/94 border border-slate-600/80 text-xs text-slate-100 shadow-lg text-center">
              <span className="font-bold text-amber-400 mr-1.5">{hud.npcSubtitle.speaker}:</span>
              <span>&ldquo;{hud.npcSubtitle.text}&rdquo;</span>
            </div>
          )}

          {hud.policeInspection && (
            <div className="pointer-events-auto w-[410px] max-w-full bg-[#101624]/96 border-2 border-sky-400/90 shadow-2xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-display font-bold text-sky-300 uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>{hud.policeInspection.officerName}</span>
                </div>
                <span className="text-[11px] font-mono-num font-bold text-amber-300">
                  {hud.policeInspection.timeRemainingSec}s
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-100">
                {hud.policeInspection.promptText}
              </div>
              {hud.policeInspection.phase === 'ASKING' && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onRespondLicenseCheck(true)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono-num font-bold cursor-pointer transition-colors ${
                      hud.policeInspection.hasGunLicense
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-amber-700 hover:bg-amber-600 text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>
                      [E] {hud.policeInspection.hasGunLicense ? 'Show License & Holster' : 'Admit No License'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRespondLicenseCheck(false)}
                    className="px-3 py-2 bg-red-900/90 hover:bg-red-800 border border-red-500/70 text-red-100 text-xs font-mono-num font-bold cursor-pointer transition-colors"
                  >
                    [R] Refuse / Resist
                  </button>
                </div>
              )}
            </div>
          )}

          {hud.nearPrompt && !hud.policeInspection && (
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onContextInteract();
              }}
              className="pointer-events-auto px-4 py-2 bg-[#141A26]/95 hover:bg-[#1E2638] border border-amber-500/70 text-xs font-semibold text-amber-300 shadow-lg text-center cursor-pointer transition-colors"
            >
              {hud.nearPrompt}
            </button>
          )}
          {showControlsStrip && (
            <div className="px-3.5 py-1.5 bg-[#0B0E14]/90 border border-slate-800 text-[11px] font-mono-num text-slate-400 whitespace-nowrap">
              {hud.pointerLocked
                ? '360° Locked · L Helmet · C FPV · X/RMB Scope · E Interact · M Map/GPS · V Mic · Q Wheel · F Car/Bike'
                : 'Click View 360° · WASD Move · L Helmet · C FPV · X/RMB Scope · E Interact · M Map/GPS · V Mic · Q Wheel · F Car/Bike'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
