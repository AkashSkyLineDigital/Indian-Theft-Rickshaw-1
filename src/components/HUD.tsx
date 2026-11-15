import React, { useEffect, useRef, useState } from 'react';
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

  // Briefly expand detailed weapon readout only when switching weapons
  const prevWeaponRef = useRef<WeaponId>(hud.activeWeapon);
  const [weaponExpanded, setWeaponExpanded] = useState(false);

  // Auto-hide bottom keybind hint strip once the player moves or enters a vehicle
  const spawnPosRef = useRef<{ x: number; z: number } | null>(null);
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    if (!spawnPosRef.current) {
      spawnPosRef.current = { x: hud.playerX, z: hud.playerZ };
      return;
    }
    if (hasMoved) return;
    const dist = Math.hypot(hud.playerX - spawnPosRef.current.x, hud.playerZ - spawnPosRef.current.z);
    if (dist > 0.6 || hud.inVehicle) {
      setHasMoved(true);
    }
  }, [hud.playerX, hud.playerZ, hud.inVehicle, hasMoved]);

  useEffect(() => {
    if (prevWeaponRef.current === hud.activeWeapon) return;
    prevWeaponRef.current = hud.activeWeapon;
    setWeaponExpanded(true);
    const id = window.setTimeout(() => setWeaponExpanded(false), 2600);
    return () => window.clearTimeout(id);
  }, [hud.activeWeapon]);

  const TimeIcon =
    hud.timeOfDay.phaseLabel === 'MORNING'
      ? Sunrise
      : hud.timeOfDay.phaseLabel === 'NOON'
        ? Sun
        : hud.timeOfDay.phaseLabel === 'EVENING'
          ? Sunset
          : Moon;

  return (
    <>
      {/* Layer 1 (z-[5]): 3D Scope Reticles & Floating World Labels — strictly below HUD panels */}
      <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
        {canFirearm && hud.adsActive && activeSpec.scopeType === 'holo_2x' && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[min(72vw,340px)] h-[min(72vw,340px)] rounded-full border-4 border-slate-900 shadow-[0_0_0_9999px_rgba(4,6,10,0.82)] relative flex items-center justify-center">
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

        {canFirearm && (hud.firstPerson || hud.adsActive) && (!hud.adsActive || activeSpec.scopeType === 'iron') && (
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

        {/* Subtle Center Crosshair Dot shown ONLY in First-Person View (never in default back view) */}
        {!inCutscene && hud.firstPerson && hud.pointerLocked && !canFirearm && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-1.5 h-1.5 rounded-full bg-white/85 ring-1 ring-black/65 shadow-[0_0_4px_rgba(0,0,0,0.95)]" />
          </div>
        )}

        {/* World-projected Building Signs & Nearest Interactable Station Tags */}
        {!inCutscene &&
          hud.worldLabels.map((lbl) => {
            if (lbl.isBuildingSign) {
              return (
                <div
                  key={lbl.id}
                  style={{
                    transform: `translate3d(${lbl.screenX}px, ${lbl.screenY}px, 0) translate(-50%, -100%)`,
                  }}
                  className="absolute top-0 left-0 pointer-events-none px-2 py-1 hud-glass-subtle rounded-md shadow-md flex items-center gap-1.5"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: lbl.signAccent ?? '#f59e0b' }}
                  />
                  <div className="flex flex-col leading-tight hud-text-shadow">
                    <span className="text-[10px] font-display font-bold tracking-wide text-slate-100 whitespace-nowrap">
                      {lbl.title}
                    </span>
                    {lbl.subtitle && (
                      <span className="text-[9px] font-mono-num text-amber-300/95 whitespace-nowrap">
                        {lbl.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            const accentColor =
              lbl.homeStation === 'PUJA'
                ? 'border-amber-400/70 text-amber-300'
                : lbl.homeStation === 'BED'
                  ? 'border-emerald-400/70 text-emerald-300'
                  : lbl.homeStation === 'WARDROBE'
                    ? 'border-sky-400/70 text-sky-300'
                    : lbl.isBanker
                      ? 'border-sky-400/70 text-sky-300'
                      : lbl.isLicenseOfficer
                        ? 'border-purple-400/70 text-purple-300'
                        : 'border-amber-400/70 text-amber-300';

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
                className={`absolute top-0 left-0 pointer-events-auto px-2 py-1 hud-glass-subtle hover:bg-[rgba(24,30,42,0.62)] rounded-md text-center shadow-md cursor-pointer transition-colors ${
                  lbl.isClosest ? accentColor : 'border-white/[0.14]'
                }`}
              >
                <div className="text-[10px] font-display font-bold text-slate-100 leading-tight whitespace-nowrap hud-text-shadow">
                  {lbl.title}
                </div>
                {lbl.isClosest && lbl.subtitle && (
                  <div className={`text-[9px] font-mono-num whitespace-nowrap hud-text-shadow ${accentColor}`}>
                    {lbl.subtitle}
                  </div>
                )}
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
              className="absolute top-0 left-0 pointer-events-none flex flex-col items-center gap-0.5"
            >
              <div className="px-2 py-0.5 bg-red-950/75 backdrop-blur-md border border-red-400/70 rounded text-[10px] font-mono-num font-bold text-red-100 flex items-center gap-1.5 shadow-md whitespace-nowrap hud-text-shadow">
                <PhoneCall className="w-3 h-3 text-amber-300 animate-pulse" />
                <span>CALLING 100 · {hud.witnessAlert.remainingSec.toFixed(1)}s</span>
              </div>
              <div className="w-24 h-1 bg-black/50 rounded-full overflow-hidden">
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
                <div className="px-1.5 py-0.5 hud-glass-subtle rounded text-[10px] font-mono-num text-slate-100 whitespace-nowrap hud-text-shadow">
                  {npc.name} · {npc.hp}/{npc.maxHp}
                </div>
                <div className="w-20 h-1.5 bg-black/55 border border-white/15 rounded-full overflow-hidden">
                  <div
                    className={npc.isPolice ? 'h-full bg-sky-400' : 'h-full bg-red-500'}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>

      {/* Layer 2 (z-20): Main Translucent Game-Native HUD */}
      <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
        {/* Darshan / Prayer Respectful UI Animation */}
        {!inCutscene && hud.prayerAnim && (
          <div className="fixed inset-x-0 top-16 flex justify-center pointer-events-none z-20 px-4">
            <div
              className={`px-5 py-3 hud-glass rounded-xl shadow-xl flex items-center gap-3.5 max-w-md ${
                hud.prayerAnim.kind === 'mosque'
                  ? 'border-emerald-400/55 text-emerald-100'
                  : 'border-amber-400/55 text-amber-100'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border sacred-halo shrink-0 ${
                  hud.prayerAnim.kind === 'mosque'
                    ? 'border-emerald-400/80 bg-emerald-500/20 text-emerald-300'
                    : 'border-amber-400/80 bg-amber-500/20 text-amber-300'
                }`}
              >
                <span className="text-lg font-bold">
                  {hud.prayerAnim.kind === 'mosque' ? '☪' : 'ॐ'}
                </span>
              </div>
              <div className="flex flex-col gap-1 min-w-0 flex-1 hud-text-shadow">
                <div className="font-display text-xs font-bold tracking-wider uppercase text-amber-300">
                  {hud.prayerAnim.title}
                </div>
                <div className="text-xs text-slate-100 leading-snug">
                  {hud.prayerAnim.subtitle}
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full mt-0.5 overflow-hidden">
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
            <div className="fixed inset-x-0 top-0 h-12 bg-gradient-to-b from-black/75 to-transparent pointer-events-none" />
            <div className="fixed inset-x-0 bottom-0 hud-glass border-x-0 border-b-0 flex items-center justify-between px-4 sm:px-6 py-3 pointer-events-auto">
              <div className="flex flex-col hud-text-shadow">
                <span className="font-display text-base sm:text-lg font-bold tracking-wider text-[#FBBF24]">
                  {hud.mission.cutsceneBanner || 'MISSION SUCCESSFUL'}
                </span>
                <span className="text-xs text-slate-200">
                  24 rescued Indian street dogs released — look out for friendly dogs around the city!
                </span>
              </div>
              <button
                type="button"
                onClick={onSkipCutscene}
                className="px-4 py-2 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0E1118] text-xs font-display font-bold tracking-wider rounded-md cursor-pointer shrink-0"
              >
                CONTINUE
              </button>
            </div>
          </>
        )}

        {/* Top-Left Borderless Header, Clock, Waypoint & Alerts */}
        {!inCutscene && (
          <div className="absolute top-[clamp(8px,2vw,16px)] left-[clamp(8px,2vw,16px)] flex flex-col gap-1 max-w-[46vw] sm:max-w-xs">
            <div className="flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <span className="font-display font-bold text-[clamp(11px,2.4vw,14px)] tracking-wider text-[#FBBF24] truncate">
                INDIAN THEFT RICKSHAW
              </span>
              <span className="hidden sm:inline text-white/40">·</span>
              <span className="hidden sm:inline text-[11px] font-mono-num font-semibold text-slate-100 shrink-0">
                KILLS {hud.kills}
              </span>
            </div>

            {/* Borderless Day-Noon-Midnight Clock Strip */}
            <div className="flex flex-wrap items-center gap-1.5 text-[clamp(10px,2vw,11px)] font-mono-num self-start drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <TimeIcon
                className={`w-3.5 h-3.5 shrink-0 ${
                  hud.timeOfDay.phaseLabel === 'MIDNIGHT'
                    ? 'text-sky-300'
                    : hud.timeOfDay.phaseLabel === 'EVENING'
                      ? 'text-orange-400'
                      : 'text-amber-400'
                }`}
              />
              <span className="font-bold text-white">{hud.timeOfDay.formattedTime}</span>
              <span className="text-white/40">·</span>
              <span className="text-[#FBBF24] font-semibold">{hud.timeOfDay.phaseLabel}</span>
              <span className="hidden sm:inline text-white/40">·</span>
              <span className="hidden sm:inline text-slate-100">DAY {hud.timeOfDay.dayCount}</span>
              <span className="hidden md:inline text-white/40">·</span>
              <span className="hidden md:inline text-[#38BDF8] font-medium">{hud.bank.calendarDate}</span>
            </div>

            {/* Active GPS Waypoint */}
            {hud.waypoint?.active && (
              <div className="pointer-events-auto flex items-center justify-between gap-2.5 px-2.5 py-1.5 hud-glass border-amber-400/45 rounded-lg max-w-xs shadow-md hud-text-shadow">
                <div className="flex items-center gap-2 min-w-0">
                  <Navigation
                    style={{ transform: `rotate(${hud.waypoint.bearingDeg}deg)` }}
                    className="w-3.5 h-3.5 text-[#FBBF24] shrink-0 transition-transform duration-100"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-semibold text-amber-200 truncate">
                      {hud.waypoint.label}
                    </span>
                    <span className="text-[10px] font-mono-num text-slate-200">
                      GPS: {hud.waypoint.distanceMeters}m
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClearWaypoint}
                  title="Clear Waypoint (Backspace)"
                  className="p-1 bg-white/10 hover:bg-red-500/40 rounded text-slate-200 hover:text-white cursor-pointer shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Blessed Status Buff */}
            {hud.blessedRemainingSec > 0 && (
              <div className="px-2.5 py-1.5 hud-glass border-amber-400/45 rounded-lg max-w-xs flex flex-col gap-1 hud-text-shadow">
                <div className="flex items-center justify-between text-[10px] font-mono-num text-amber-200">
                  <span className="flex items-center gap-1 font-bold">
                    <Sparkles className="w-3 h-3 text-[#FBBF24]" />
                    BLESSED · +HP &amp; STAMINA
                  </span>
                  <span className="font-bold text-[#FBBF24]">{hud.blessedRemainingSec}s</span>
                </div>
                <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F59E0B] transition-all duration-150"
                    style={{
                      width: `${Math.max(0, Math.min(100, (hud.blessedRemainingSec / Math.max(1, hud.blessedTotalSec)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {hud.mission.active && (
              <div className="px-3 py-2 hud-glass border-sky-400/45 rounded-lg max-w-xs flex flex-col gap-1 hud-text-shadow">
                <div className="flex items-center justify-between text-[11px] font-mono-num">
                  <span className="text-[#38BDF8] font-bold tracking-wider">POLICE DOG RESCUE</span>
                  <span className="text-[#FBBF24] font-bold">
                    {formatTimer(hud.mission.timeRemainingSec)}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-100 leading-snug">
                  {hud.mission.objectiveText}
                </div>
                <div className="text-[10px] font-mono-num text-slate-300">
                  GPS Target: {hud.mission.distanceMeters}m away
                </div>
              </div>
            )}

            {hud.witnessAlert && (
              <div className="px-2.5 py-1.5 bg-red-950/65 backdrop-blur-md border border-red-400/50 rounded-lg max-w-xs flex flex-col gap-1 hud-text-shadow">
                <div className="flex items-center justify-between text-[10px] font-mono-num text-red-100">
                  <span className="flex items-center gap-1.5 font-bold">
                    <PhoneCall className="w-3 h-3 text-[#FBBF24] animate-pulse" />
                    WITNESS CALLING 100
                  </span>
                  <span className="font-bold text-[#FBBF24]">{hud.witnessAlert.remainingSec.toFixed(1)}s</span>
                </div>
                <div className="text-[10px] text-slate-100">
                  {hud.witnessAlert.npcName} ({hud.witnessAlert.reason})
                </div>
                <div className="w-full h-1 bg-black/45 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F59E0B] transition-all duration-100"
                    style={{
                      width: `${Math.max(0, Math.min(100, ((hud.witnessAlert.totalSec - hud.witnessAlert.remainingSec) / Math.max(0.1, hud.witnessAlert.totalSec)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {hud.policeWarning && (
              <div className="pointer-events-auto px-2.5 py-2 bg-red-950/65 backdrop-blur-md border border-red-400/50 rounded-lg text-xs font-medium text-red-100 max-w-xs flex flex-col gap-1.5 hud-text-shadow">
                <span>{hud.policeWarning}</span>
                {hud.wantedLevel >= 1 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={onSurrender}
                      className="px-2 py-1 bg-sky-600/85 hover:bg-sky-500 rounded text-white text-[10px] font-mono-num font-bold cursor-pointer"
                    >
                      [Hold H] Surrender
                    </button>
                    {hud.streetBribe?.available && (
                      <button
                        type="button"
                        onClick={onOfferStreetBribe}
                        className="px-2 py-1 bg-[#F59E0B] hover:bg-[#FBBF24] rounded text-[#0E1118] text-[10px] font-mono-num font-bold cursor-pointer"
                      >
                        [B] Chai-Paani {formatRs(hud.streetBribe.amount)}
                      </button>
                    )}
                  </div>
                )}
                {hud.surrenderHoldPct > 0 && (
                  <div className="flex flex-col gap-0.5 pt-0.5">
                    <span className="text-[10px] font-mono-num text-sky-200 font-bold">
                      SURRENDERING... {hud.surrenderHoldPct}%
                    </span>
                    <div className="w-full h-1 bg-black/45 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#38BDF8] transition-all duration-75"
                        style={{ width: `${hud.surrenderHoldPct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Top-Right: Minimal Translucent Shortcut Pills + Borderless Vitals Cluster */}
        {!inCutscene && (
          <div className="absolute top-[clamp(8px,2vw,16px)] right-[clamp(8px,2vw,16px)] flex flex-col items-end gap-2 max-w-[52vw] sm:max-w-none">
            {/* Desktop Minimal Translucent Pill Action Bar */}
            <div className="hidden sm:flex items-center gap-1 pointer-events-auto flex-wrap justify-end">
              {!hud.inVehicle && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onToggleFirstPerson();
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] ${
                    hud.firstPerson
                      ? 'bg-sky-500/75 border border-sky-300/70 text-white backdrop-blur-sm'
                      : 'bg-black/25 hover:bg-black/45 border border-white/10 text-slate-100 backdrop-blur-sm'
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
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] ${
                    hud.adsActive
                      ? 'bg-[#F59E0B] border border-amber-200 text-[#0E1118]'
                      : 'bg-black/25 hover:bg-black/45 border border-amber-400/30 text-[#FBBF24] backdrop-blur-sm'
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
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] ${
                    hud.helmetOn
                      ? 'bg-emerald-500/75 border border-emerald-300/70 text-white backdrop-blur-sm'
                      : 'bg-black/25 hover:bg-black/45 border border-amber-400/30 text-[#FBBF24] backdrop-blur-sm'
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
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] ${
                  hud.micState.active
                    ? 'bg-red-500/80 border border-red-300 text-white backdrop-blur-sm'
                    : 'bg-black/25 hover:bg-black/45 border border-white/10 text-emerald-300 backdrop-blur-sm'
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
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/25 hover:bg-black/45 border border-white/10 text-[#38BDF8] text-[11px] font-semibold backdrop-blur-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
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
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/25 hover:bg-black/45 border border-white/10 text-slate-100 text-[11px] font-semibold backdrop-blur-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
              >
                <Disc className="w-3.5 h-3.5 text-[#FBBF24]" />
                <span>Wheel (Q)</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onOpenPhone();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/25 hover:bg-black/45 border border-white/10 text-[#38BDF8] text-[11px] font-semibold backdrop-blur-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
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
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/25 hover:bg-black/45 border border-white/10 text-[#FBBF24] text-[11px] font-semibold backdrop-blur-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Shastra (B)</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onOpenSettings();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/25 hover:bg-black/45 border border-white/10 text-slate-100 text-[11px] font-semibold backdrop-blur-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
            </div>

            {/* Mobile Compact Action Pills */}
            <div className="flex sm:hidden items-center gap-1 pointer-events-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onOpenPhone();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/25 hover:bg-black/45 border border-white/10 text-[#38BDF8] text-[10px] font-semibold backdrop-blur-sm cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
              >
                <Smartphone className="w-3 h-3" />
                <span>PHONE</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onOpenShop();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/25 hover:bg-black/45 border border-white/10 text-[#FBBF24] text-[10px] font-semibold backdrop-blur-sm cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
              >
                <ShoppingBag className="w-3 h-3" />
                <span>GUNS</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onOpenSettings();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/25 hover:bg-black/45 border border-white/10 text-slate-100 text-[10px] font-semibold backdrop-blur-sm cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
              >
                <Settings className="w-3 h-3" />
                <span>MENU</span>
              </button>
            </div>

            {/* Borderless Floating Vitals Cluster (No Outer Card Box) */}
            <div className="w-[clamp(164px,42vw,230px)] flex flex-col items-end gap-1.5">
              {/* Row 1: Crisp Saffron-Gold Cash & 5 Wanted Stars */}
              <div className="w-full flex items-center justify-end gap-2.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                <span
                  className={`font-mono-num text-[clamp(1rem,3vw,1.28rem)] font-extrabold tracking-tight leading-none ${
                    hud.cash < 0 ? 'text-[#EF4444]' : 'text-[#FBBF24]'
                  }`}
                >
                  {formatRs(hud.cash)}
                </span>
                <div className="flex items-center gap-0.5 shrink-0" aria-label={`Wanted level ${hud.wantedLevel} of 5`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= hud.wantedLevel
                          ? 'fill-[#EF4444] text-[#EF4444] drop-shadow-[0_0_6px_rgba(239,68,68,0.85)]'
                          : 'text-white/25'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {hud.wantedLevel > 0 && hud.wantedTierTitle && (
                <div className="w-full flex items-center justify-end gap-1.5 text-[10px] font-mono-num leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  <span className="font-bold text-[#EF4444] uppercase truncate">{hud.wantedTierTitle}</span>
                  {hud.wantedNextHint && (
                    <span className="text-amber-200/95 truncate">{hud.wantedNextHint}</span>
                  )}
                </div>
              )}

              {(hud.bank.savingsTotal > 0 || hud.bank.fdTotal > 0 || hud.probationDaysLeft > 0) && (
                <div className="w-full flex items-center justify-end gap-2 text-[10px] font-mono-num text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-none">
                  {(hud.bank.savingsTotal > 0 || hud.bank.fdTotal > 0) && (
                    <span className="truncate">
                      Bank <strong className="text-[#FBBF24]">{formatRsExact(hud.bank.savingsTotal + hud.bank.fdTotal)}</strong>
                    </span>
                  )}
                  {hud.probationDaysLeft > 0 && (
                    <span className="text-orange-300 font-bold shrink-0">
                      PROB {hud.probationDaysLeft}D
                    </span>
                  )}
                </div>
              )}

              {/* Slim 6px Health, Stamina & Armor Bars */}
              <div className="w-full flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-[6px] bg-black/45 border border-white/15 rounded-full overflow-hidden shadow-sm">
                    <div
                      className={`h-full rounded-full transition-all duration-150 ${
                        hpPct > 35 ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
                      }`}
                      style={{ width: `${hpPct}%` }}
                    />
                  </div>
                  <span className="w-7 text-right text-[10px] font-mono-num font-bold text-[#22C55E] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] leading-none">
                    {hud.hp}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-[6px] bg-black/45 border border-white/15 rounded-full overflow-hidden shadow-sm">
                    <div
                      className={`h-full rounded-full transition-all duration-100 ${
                        staminaPct > 22 ? 'bg-[#38BDF8]' : 'bg-[#F59E0B]'
                      }`}
                      style={{ width: `${staminaPct}%` }}
                    />
                  </div>
                  <span className="w-7 text-right text-[10px] font-mono-num font-bold text-[#38BDF8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] leading-none">
                    {hud.stamina}
                  </span>
                </div>

                {hud.armor > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-[6px] bg-black/45 border border-white/15 rounded-full overflow-hidden shadow-sm">
                      <div
                        className="h-full bg-indigo-400 rounded-full transition-all duration-150"
                        style={{ width: `${hud.armor}%` }}
                      />
                    </div>
                    <span className="w-7 text-right text-[10px] font-mono-num font-bold text-indigo-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] leading-none flex items-center justify-end gap-0.5">
                      <Shield className="w-2.5 h-2.5" />
                      {hud.armor}
                    </span>
                  </div>
                )}
              </div>

              {/* Compact 1-5 Weapon Slot Strip + Medkit Pill */}
              <div className="w-full flex items-center justify-end gap-1.5 pt-0.5 pointer-events-auto">
                <div className="grid grid-cols-5 gap-1 flex-1">
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
                        className={`h-6 rounded-full text-[10px] font-mono-num backdrop-blur-sm border transition-colors ${
                          active
                            ? 'bg-[#F59E0B] border-amber-200 text-[#0E1118] font-extrabold cursor-pointer shadow'
                            : owned
                              ? 'bg-black/30 hover:bg-black/50 border-white/15 text-slate-100 cursor-pointer'
                              : 'bg-black/20 border-white/5 text-white/25 cursor-not-allowed'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={hud.medkits <= 0 || hud.hp >= hud.maxHp}
                  onClick={onUseMedkit}
                  title="Use Medkit (H)"
                  className={`flex items-center gap-1 px-2 h-6 rounded-full text-[10px] font-mono-num font-bold backdrop-blur-sm border transition-colors shrink-0 ${
                    hud.medkits > 0 && hud.hp < hud.maxHp
                      ? 'bg-[#22C55E] hover:bg-emerald-400 border-emerald-200 text-[#0E1118] cursor-pointer'
                      : 'bg-black/30 border-white/15 text-slate-200/80 cursor-default'
                  }`}
                >
                  <HeartPulse className="w-3 h-3" />
                  <span>
                    {hud.medkits}/{MAX_MEDKITS}
                  </span>
                </button>
              </div>

              {/* Compact 1-line Weapon & Ammo Status (Expands briefly on weapon switch) */}
              <div className="w-full flex items-center justify-between gap-2 text-[10px] font-mono-num drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                <span className="font-semibold text-white truncate">{activeSpec.shortName}</span>
                <span className="text-[#FBBF24] font-bold shrink-0">
                  {hud.activeWeapon === 'fists' ? 'MELEE' : `${hud.ammo[hud.activeWeapon]} RDS`}
                </span>
              </div>

              {weaponExpanded && (
                <div className="w-full px-2 py-1 bg-black/35 backdrop-blur-sm border border-white/10 rounded-lg flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[9px] font-mono-num text-slate-200 truncate">
                      {activeSpec.caliber}
                    </span>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono-num font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      <span className={hud.hasGunLicense ? 'text-[#22C55E]' : 'text-slate-400'}>
                        {hud.hasGunLicense ? 'ARMS OK' : 'NO ARMS'}
                      </span>
                      <span className="text-white/25">·</span>
                      <span className={hud.hasDrivingLicense ? 'text-[#38BDF8]' : 'text-slate-400'}>
                        {hud.hasDrivingLicense ? 'DL OK' : 'NO DL'}
                      </span>
                      {hud.hasHelmet && (
                        <>
                          <span className="text-white/25">·</span>
                          <span className={hud.helmetOn ? 'text-[#FBBF24]' : 'text-slate-400'}>
                            {hud.helmetOn ? 'HELMET' : 'NO HELM'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <WeaponIcon weaponId={hud.activeWeapon} className="w-12 h-6 shrink-0" />
                </div>
              )}
            </div>

            {/* Toast Feed */}
            <div className="flex flex-col items-end gap-1 mt-0.5">
              {toasts.map((t) => (
                <div
                  key={t.id}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-num font-semibold hud-glass hud-text-shadow ${
                    t.tone === 'cash'
                      ? 'border-emerald-400/50 text-emerald-300'
                      : t.tone === 'warn'
                        ? 'border-red-400/50 text-red-200'
                        : t.tone === 'cheat'
                          ? 'border-amber-400/50 text-[#FBBF24]'
                          : 'text-slate-100'
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
          <div className="absolute bottom-[clamp(8px,2vw,16px)] left-[clamp(8px,2vw,16px)] flex flex-col gap-1.5">
            {hud.inVehicle && (
              <div className="px-2.5 py-1 hud-glass rounded-lg flex items-center justify-between gap-2 text-[clamp(9px,2vw,11px)] hud-text-shadow">
                <span className="font-semibold text-slate-100 truncate max-w-[76px] sm:max-w-[116px]">
                  {hud.vehicleName}
                </span>
                <span className="font-mono-num font-bold text-[#FBBF24] whitespace-nowrap">
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

        {/* Bottom-Center: Mic Bar, Chai Dialogue, Subtitles, Context Prompt & Ultra-Compact Hint Strip */}
        {!inCutscene && (
          <div className="absolute bottom-[clamp(8px,2vw,16px)] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 max-w-[92vw] pointer-events-none">
            {(hud.micState.active || hud.micState.status) && !hud.chaiPrompt && (
              <div
                className={`pointer-events-auto px-3.5 py-2 hud-glass rounded-xl shadow-lg flex items-center gap-3 hud-text-shadow ${
                  hud.micState.active ? 'border-red-400/70 text-white' : 'border-sky-400/50 text-sky-100'
                }`}
              >
                <Mic className={`w-4 h-4 shrink-0 ${hud.micState.active ? 'text-[#EF4444]' : 'text-[#38BDF8]'}`} />
                {hud.micState.active && (
                  <div className="flex items-end gap-0.5 h-3.5 shrink-0">
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                      <span
                        key={i}
                        style={{ animationDelay: `${i * 0.09}s` }}
                        className="w-1 h-full bg-[#EF4444] mic-eq-bar"
                      />
                    ))}
                  </div>
                )}
                <div className="flex flex-col text-xs">
                  <span className="font-mono-num font-bold">
                    {hud.micState.active ? 'MIC ON · LISTENING (hi-IN)' : 'VOICE MIC'}
                  </span>
                  {hud.micState.status && (
                    <span className="text-[11px] text-slate-200">{hud.micState.status}</span>
                  )}
                  {hud.micState.transcript && (
                    <span className="text-[11px] font-mono-num text-[#FBBF24]">
                      Suna: &ldquo;{hud.micState.transcript}&rdquo;
                    </span>
                  )}
                </div>
                {hud.micState.active && (
                  <button
                    type="button"
                    onClick={onStartMicReply}
                    className="px-2 py-1 bg-white/15 hover:bg-white/25 rounded text-[10px] font-mono-num font-bold cursor-pointer"
                  >
                    STOP (V)
                  </button>
                )}
              </div>
            )}

            {hud.chaiPrompt && (
              <div className="pointer-events-auto w-96 max-w-full hud-glass border-amber-400/55 rounded-xl shadow-2xl p-3 flex flex-col gap-2 hud-text-shadow">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-display font-bold text-[#FBBF24] uppercase tracking-wider">
                    <Coffee className="w-4 h-4" />
                    <span>{hud.chaiPrompt.npcName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={onStartMicReply}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono-num font-bold cursor-pointer transition-colors ${
                      hud.chaiPrompt.micListening || hud.micState.active
                        ? 'bg-[#EF4444] text-white'
                        : 'bg-white/10 hover:bg-white/20 text-[#38BDF8]'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{hud.chaiPrompt.micListening || hud.micState.active ? 'Listening... (V)' : '[V] Mic Reply'}</span>
                  </button>
                </div>
                <div className="text-sm font-semibold text-white">
                  &ldquo;{hud.chaiPrompt.line}&rdquo;
                </div>
                {(hud.chaiPrompt.micListening || hud.micState.active) && (
                  <div className="flex items-center justify-between px-2.5 py-1 bg-red-500/20 border border-red-400/50 rounded-md">
                    <div className="flex items-end gap-0.5 h-3.5">
                      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                        <span
                          key={i}
                          style={{ animationDelay: `${i * 0.09}s` }}
                          className="w-1 h-full bg-[#EF4444] mic-eq-bar"
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono-num text-red-100">
                      {hud.micState.transcript ? `Suna: "${hud.micState.transcript}"` : 'MIC ON · Boliye...'}
                    </span>
                  </div>
                )}
                {hud.chaiPrompt.micStatus && (
                  <div className="text-[11px] font-mono-num text-[#38BDF8] bg-sky-500/15 border border-sky-400/35 rounded px-2 py-1">
                    {hud.chaiPrompt.micStatus}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onReplyChai(true)}
                    className="px-3 py-2 bg-[#22C55E] hover:bg-emerald-400 rounded-lg text-[#0E1118] text-xs font-mono-num font-bold cursor-pointer transition-colors"
                  >
                    [1] Haan chal bhai
                  </button>
                  <button
                    type="button"
                    onClick={() => onReplyChai(false)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-slate-100 text-xs font-mono-num font-bold cursor-pointer transition-colors"
                  >
                    [2] Baad mein
                  </button>
                </div>
              </div>
            )}

            {hud.npcSubtitle && !hud.chaiPrompt && (
              <div className="px-3.5 py-1.5 hud-glass rounded-full text-xs text-slate-100 shadow-lg text-center hud-text-shadow">
                <span className="font-bold text-[#FBBF24] mr-1.5">{hud.npcSubtitle.speaker}:</span>
                <span>&ldquo;{hud.npcSubtitle.text}&rdquo;</span>
              </div>
            )}

            {hud.policeInspection && (
              <div className="pointer-events-auto w-[400px] max-w-full hud-glass border-sky-400/60 rounded-xl shadow-2xl p-3 flex flex-col gap-2 hud-text-shadow">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-display font-bold text-[#38BDF8] uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4 text-[#FBBF24]" />
                    <span>{hud.policeInspection.officerName}</span>
                  </div>
                  <span className="text-[11px] font-mono-num font-bold text-[#FBBF24]">
                    {hud.policeInspection.timeRemainingSec}s
                  </span>
                </div>
                <div className="text-xs font-semibold text-white">
                  {hud.policeInspection.promptText}
                </div>
                {hud.policeInspection.phase === 'ASKING' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onRespondLicenseCheck(true)}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono-num font-bold cursor-pointer transition-colors ${
                        hud.policeInspection.hasGunLicense
                          ? 'bg-[#22C55E] hover:bg-emerald-400 text-[#0E1118]'
                          : 'bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0E1118]'
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
                      className="px-3 py-2 bg-[#EF4444]/85 hover:bg-[#EF4444] rounded-lg text-white text-xs font-mono-num font-bold cursor-pointer transition-colors"
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
                className="pointer-events-auto px-3.5 py-1.5 hud-glass hover:bg-[rgba(24,30,42,0.62)] border-amber-400/55 rounded-full text-xs font-semibold text-[#FBBF24] shadow-lg text-center cursor-pointer transition-colors hud-text-shadow"
              >
                {hud.nearPrompt}
              </button>
            )}

            {showControlsStrip && !hasMoved && (
              <div className="hidden sm:block px-3 py-1 bg-black/35 backdrop-blur-sm border border-white/10 rounded-full text-[10px] font-mono-num text-slate-200/90 whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {hud.pointerLocked
                  ? 'L Helmet · C FPV · X/RMB Scope · E Interact · M Map · V Mic · Q Wheel · F Vehicle'
                  : 'Click Look · WASD Move · L Helmet · C FPV · X Scope · E Action · M Map · Q Wheel · F Car'}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
