import React, { useEffect, useRef, useState } from 'react';
import {
  Coffee,
  Crosshair,
  Disc,
  Eye,
  Gauge,
  HardHat,
  HeartPulse,
  Lightbulb,
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
} from 'lucide-react';
import {
  DEFAULT_KEYBINDS,
  FloatingToast,
  HudSnapshot,
  KeybindActionId,
  KeybindMap,
  MAX_MEDKITS,
  WEAPON_ORDER,
  WEAPONS,
  WeaponId,
  formatKeyCode,
  formatRs,
  formatRsExact,
} from '../types/game';
import { Minimap } from './Minimap';
import { WeaponIcon } from './WeaponIcon';

interface HUDProps {
  hud: HudSnapshot;
  toasts: FloatingToast[];
  showControlsStrip: boolean;
  isTouchHud?: boolean;
  voiceMicEnabled?: boolean;
  keybinds?: KeybindMap;
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
  onToggleHeadlights?: () => void;
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
  isTouchHud = false,
  voiceMicEnabled = false,
  keybinds = DEFAULT_KEYBINDS,
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
  onToggleHeadlights,
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

        {/* Top Responsive Row: Left Title/Clock/Alerts + Right Compact Action Pills & Vitals */}
        {!inCutscene && (
          <div className="fixed inset-x-0 top-0 p-[clamp(6px,1.8vw,16px)] flex items-start justify-between gap-2 pointer-events-none">
            {/* Top-Left Borderless Header, Clock, Waypoint & Alerts */}
            <div className="flex flex-col gap-1 min-w-0 flex-1 max-w-[48vw] sm:max-w-[38vw] lg:max-w-xs">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                <span className="font-display font-bold text-[clamp(10px,2.3vw,14px)] tracking-wider text-[#FBBF24] truncate">
                  INDIAN THEFT RICKSHAW
                </span>
                <span className="hidden md:inline text-white/40">·</span>
                <span className="hidden md:inline text-[11px] font-mono-num font-semibold text-slate-100 shrink-0">
                  KILLS {hud.kills}
                </span>
              </div>

              {/* Borderless Clock & Calendar Date Strip */}
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[clamp(9px,1.9vw,11px)] font-mono-num self-start drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] max-w-full">
                <TimeIcon
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${
                    hud.timeOfDay.phaseLabel === 'MIDNIGHT'
                      ? 'text-sky-300'
                      : hud.timeOfDay.phaseLabel === 'EVENING'
                        ? 'text-orange-400'
                        : 'text-amber-400'
                  }`}
                />
                <span className="font-bold text-white">{hud.timeOfDay.formattedTime}</span>
                <span className="text-white/40">·</span>
                <span className="text-[#FBBF24] font-semibold hidden xs:inline sm:inline">
                  {hud.timeOfDay.phaseLabel}
                </span>
                <span className="text-white/40 hidden xs:inline sm:inline">·</span>
                <span className="text-[#38BDF8] font-medium truncate">{hud.bank.calendarDate}</span>
              </div>

              {/* Active GPS Waypoint */}
              {hud.waypoint?.active && (
                <div className="pointer-events-auto flex items-center justify-between gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 hud-glass border-amber-400/45 rounded-lg max-w-xs shadow-md hud-text-shadow">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <Navigation
                      style={{ transform: `rotate(${hud.waypoint.bearingDeg}deg)` }}
                      className="w-3.5 h-3.5 text-[#FBBF24] shrink-0 transition-transform duration-100"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] sm:text-[11px] font-semibold text-amber-200 truncate">
                        {hud.waypoint.label}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-mono-num text-slate-200">
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
                <div className="px-2.5 sm:px-3 py-1.5 sm:py-2 hud-glass border-sky-400/45 rounded-lg max-w-xs flex flex-col gap-1 hud-text-shadow">
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono-num">
                    <span className="text-[#38BDF8] font-bold tracking-wider">POLICE DOG RESCUE</span>
                    <span className="text-[#FBBF24] font-bold">
                      {formatTimer(hud.mission.timeRemainingSec)}
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-medium text-slate-100 leading-snug">
                    {hud.mission.objectiveText}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono-num text-slate-300">
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
                <div className="pointer-events-auto px-2.5 py-2 bg-red-950/65 backdrop-blur-md border border-red-400/50 rounded-lg text-[11px] sm:text-xs font-medium text-red-100 max-w-xs flex flex-col gap-1.5 hud-text-shadow">
                  <span>{hud.policeWarning}</span>
                  {hud.wantedLevel >= 1 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={onSurrender}
                        className="px-2 py-1 bg-sky-600/85 hover:bg-sky-500 rounded text-white text-[10px] font-mono-num font-bold cursor-pointer"
                      >
                        [Hold {formatKeyCode(keybinds.surrender)}] Surrender
                      </button>
                      {hud.streetBribe?.available && (
                        <button
                          type="button"
                          onClick={onOfferStreetBribe}
                          className="px-2 py-1 bg-[#F59E0B] hover:bg-[#FBBF24] rounded text-[#0E1118] text-[10px] font-mono-num font-bold cursor-pointer"
                        >
                          [{formatKeyCode(keybinds.shop)}] Chai-Paani {formatRs(hud.streetBribe.amount)}
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

            {/* Top-Right: Adaptive Translucent Shortcut Pills + Borderless Vitals Cluster */}
            <div className="flex flex-col items-end gap-1.5 sm:gap-2 min-w-0 max-w-[50vw] sm:max-w-[58vw] lg:max-w-[62vw] shrink-0">
              {/* Desktop / Tablet Action Bar: auto-shortens on narrow screens so it NEVER hides left title/menu */}
              <div className="hidden sm:flex items-center gap-1 pointer-events-auto flex-wrap justify-end">
                <button
                  type="button"
                  title={`Cycle Camera (${formatKeyCode(keybinds.camera)})`}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onToggleFirstPerson();
                  }}
                  className={`flex items-center gap-1 px-1.5 lg:px-2.5 py-1 rounded-full text-[10px] lg:text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] ${
                    hud.cameraMode === 'first_person'
                      ? 'bg-sky-500/80 border border-sky-300/75 text-white backdrop-blur-sm'
                      : hud.cameraMode === 'third_close'
                        ? 'bg-indigo-500/70 border border-indigo-300/70 text-white backdrop-blur-sm'
                        : 'bg-black/25 hover:bg-black/45 border border-white/10 text-slate-100 backdrop-blur-sm'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">
                    {hud.cameraMode === 'first_person'
                      ? `FPV (${formatKeyCode(keybinds.camera)})`
                      : hud.cameraMode === 'third_close'
                        ? `3P Close (${formatKeyCode(keybinds.camera)})`
                        : `3P Far (${formatKeyCode(keybinds.camera)})`}
                  </span>
                  <span className="hidden md:inline xl:hidden">
                    {hud.cameraMode === 'first_person'
                      ? 'FPV'
                      : hud.cameraMode === 'third_close'
                        ? '3P+'
                        : 'Cam'}
                  </span>
                </button>
                {canFirearm && (
                  <button
                    type="button"
                    title={`Scope (${formatKeyCode(keybinds.scope)})`}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onToggleAds();
                    }}
                    className={`flex items-center gap-1 px-1.5 lg:px-2.5 py-1 rounded-full text-[10px] lg:text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] ${
                      hud.adsActive
                        ? 'bg-[#F59E0B] border border-amber-200 text-[#0E1118]'
                        : 'bg-black/25 hover:bg-black/45 border border-amber-400/30 text-[#FBBF24] backdrop-blur-sm'
                    }`}
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline">
                      {hud.adsActive
                        ? `Scoped (${formatKeyCode(keybinds.scope)})`
                        : `Scope (${formatKeyCode(keybinds.scope)})`}
                    </span>
                    <span className="hidden md:inline xl:hidden">
                      {hud.adsActive ? 'ADS' : 'Scope'}
                    </span>
                  </button>
                )}
                {(hud.hasHelmet || hud.currentVehicleKind === 'bike') && (
                  <button
                    type="button"
                    title={`Toggle Helmet (${formatKeyCode(keybinds.helmet)})`}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onToggleHelmet();
                    }}
                    className={`flex items-center gap-1 px-1.5 lg:px-2.5 py-1 rounded-full text-[10px] lg:text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] ${
                      hud.helmetOn
                        ? 'bg-emerald-500/75 border border-emerald-300/70 text-white backdrop-blur-sm'
                        : 'bg-black/25 hover:bg-black/45 border border-amber-400/30 text-[#FBBF24] backdrop-blur-sm'
                    }`}
                  >
                    <HardHat className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline">
                      {hud.helmetOn
                        ? `Helmet ON (${formatKeyCode(keybinds.helmet)})`
                        : `Helmet (${formatKeyCode(keybinds.helmet)})`}
                    </span>
                  </button>
                )}
                {voiceMicEnabled && (
                  <button
                    type="button"
                    title={`Voice Mic (${formatKeyCode(keybinds.mic)})`}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onStartMicReply();
                    }}
                    className={`flex items-center gap-1 px-1.5 lg:px-2.5 py-1 rounded-full text-[10px] lg:text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] ${
                      hud.micState.active
                        ? 'bg-red-500/80 border border-red-300 text-white backdrop-blur-sm'
                        : 'bg-black/25 hover:bg-black/45 border border-white/10 text-emerald-300 backdrop-blur-sm'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline">
                      {hud.micState.active
                        ? `Mic ON (${formatKeyCode(keybinds.mic)})`
                        : `Mic (${formatKeyCode(keybinds.mic)})`}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  title={`3D City Map (${formatKeyCode(keybinds.map)})`}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onOpenMap();
                  }}
                  className="flex items-center gap-1 px-1.5 lg:px-2.5 py-1 rounded-full bg-black/25 hover:bg-black/45 border border-white/10 text-[#38BDF8] text-[10px] lg:text-[11px] font-semibold backdrop-blur-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Map ({formatKeyCode(keybinds.map)})</span>
                  <span className="hidden md:inline xl:hidden">Map</span>
                </button>
                <button
                  type="button"
                  title={`Weapon Wheel (${formatKeyCode(keybinds.wheel)})`}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onOpenWheel();
                  }}
                  className="flex items-center gap-1 px-1.5 lg:px-2.5 py-1 rounded-full bg-black/25 hover:bg-black/45 border border-white/10 text-slate-100 text-[10px] lg:text-[11px] font-semibold backdrop-blur-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
                >
                  <Disc className="w-3.5 h-3.5 text-[#FBBF24]" />
                  <span className="hidden xl:inline">Wheel ({formatKeyCode(keybinds.wheel)})</span>
                </button>
                <button
                  type="button"
                  title={`Smartphone (${formatKeyCode(keybinds.phone)})`}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onOpenPhone();
                  }}
                  className="flex items-center gap-1 px-1.5 lg:px-2.5 py-1 rounded-full bg-black/25 hover:bg-black/45 border border-white/10 text-[#38BDF8] text-[10px] lg:text-[11px] font-semibold backdrop-blur-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Phone ({formatKeyCode(keybinds.phone)})</span>
                  <span className="hidden md:inline xl:hidden">Phone</span>
                </button>
                <button
                  type="button"
                  title={`Shastra Armory (${formatKeyCode(keybinds.shop)})`}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onOpenShop();
                  }}
                  className="flex items-center gap-1 px-1.5 lg:px-2.5 py-1 rounded-full bg-black/25 hover:bg-black/45 border border-white/10 text-[#FBBF24] text-[10px] lg:text-[11px] font-semibold backdrop-blur-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Shastra ({formatKeyCode(keybinds.shop)})</span>
                  <span className="hidden md:inline xl:hidden">Shop</span>
                </button>
                <button
                  type="button"
                  title="Settings & Keybinds"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onOpenSettings();
                  }}
                  className="flex items-center gap-1 px-1.5 lg:px-2.5 py-1 rounded-full bg-black/25 hover:bg-black/45 border border-white/10 text-slate-100 text-[10px] lg:text-[11px] font-semibold backdrop-blur-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Settings</span>
                </button>
              </div>

              {/* Ultra-Compact Mobile Action Pills (< 640px when Touch HUD is off): icon-only + crisp spacing */}
              {!isTouchHud && (
                <div className="flex sm:hidden items-center gap-1 flex-wrap justify-end pointer-events-auto">
                  <button
                    type="button"
                    aria-label="Camera"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onToggleFirstPerson();
                    }}
                    className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 border border-white/15 text-slate-100 backdrop-blur-sm cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Phone"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onOpenPhone();
                    }}
                    className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 border border-white/15 text-[#38BDF8] backdrop-blur-sm cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Shop"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onOpenShop();
                    }}
                    className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 border border-white/15 text-[#FBBF24] backdrop-blur-sm cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Settings"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onOpenSettings();
                    }}
                    className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 border border-white/15 text-slate-100 backdrop-blur-sm cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            {/* Borderless Floating Vitals Cluster (No Outer Card Box) */}
            <div className="w-[clamp(176px,44vw,258px)] flex flex-col items-end gap-1.5">
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

              {/* Dedicated Full-Width 5-Slot Weapon Bar (Uses onPointerDown + blur so it never steals focus or freezes) */}
              <div className="w-full grid grid-cols-5 gap-1 pt-0.5 pointer-events-auto select-none">
                {WEAPON_ORDER.map((wid, idx) => {
                  const owned = hud.ownedWeapons.includes(wid);
                  const active = hud.activeWeapon === wid;
                  const slotAction = `weapon${idx + 1}` as KeybindActionId;
                  const keyLabel = formatKeyCode(keybinds[slotAction]);
                  const wAmmo = hud.ammo[wid] ?? 0;
                  return (
                    <button
                      key={wid}
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.blur();
                        onSelectWeapon(wid);
                      }}
                      title={
                        owned
                          ? `${WEAPONS[wid].name} (${keyLabel})`
                          : `${WEAPONS[wid].name} — Locked (Visit Shastra Armory)`
                      }
                      className={`relative h-8 rounded-lg flex flex-col items-center justify-center px-0.5 backdrop-blur-sm border transition-all touch-none ${
                        active
                          ? 'bg-[#F59E0B] border-amber-200 text-[#0E1118] font-extrabold cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.45)]'
                          : owned
                            ? 'bg-black/45 hover:bg-black/65 border-white/20 text-slate-100 cursor-pointer active:scale-95'
                            : 'bg-black/25 border-white/10 text-white/35 cursor-pointer opacity-70'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-1 text-[8px] font-mono-num leading-none ${
                          active ? 'text-[#0E1118]/80 font-extrabold' : 'text-slate-400'
                        }`}
                      >
                        {keyLabel}
                      </span>
                      <WeaponIcon weaponId={wid} className="w-6 h-3.5 mt-1" />
                      {owned && wid !== 'fists' && (
                        <span
                          className={`text-[7.5px] font-mono-num leading-none ${
                            active ? 'text-[#0E1118] font-bold' : 'text-amber-300/90'
                          }`}
                        >
                          {wAmmo}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Clean Fixed-Height Active Weapon & Medkit Quick-Use Row */}
              <div className="w-full flex items-center justify-between gap-1.5 text-[10px] font-mono-num pointer-events-auto">
                <div className="flex items-center gap-1.5 min-w-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                  <span className="font-semibold text-white truncate">{activeSpec.shortName}</span>
                  <span className="text-[#FBBF24] font-bold shrink-0">
                    {hud.activeWeapon === 'fists' ? 'MELEE' : `${hud.ammo[hud.activeWeapon]} RDS`}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={hud.medkits <= 0 || hud.hp >= hud.maxHp}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.blur();
                    if (hud.medkits > 0 && hud.hp < hud.maxHp) {
                      onUseMedkit();
                    }
                  }}
                  title={`Use Medkit (${formatKeyCode(keybinds.medkit)})`}
                  className={`flex items-center gap-1 px-2 h-5 rounded-full text-[9.5px] font-mono-num font-bold backdrop-blur-sm border transition-colors shrink-0 ${
                    hud.medkits > 0 && hud.hp < hud.maxHp
                      ? 'bg-[#22C55E] hover:bg-emerald-400 border-emerald-200 text-[#0E1118] cursor-pointer'
                      : 'bg-black/35 border-white/15 text-slate-300/80 cursor-default'
                  }`}
                >
                  <HeartPulse className="w-2.5 h-2.5" />
                  <span>
                    {hud.medkits}/{MAX_MEDKITS}
                  </span>
                </button>
              </div>

              {weaponExpanded && (
                <div className="w-full px-2 py-1 bg-black/45 backdrop-blur-sm border border-white/15 rounded-lg flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[9px] font-mono-num text-amber-200 truncate font-semibold">
                      {activeSpec.caliber} · {activeSpec.scopeLabel}
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
          </div>
        )}

        {/* Bottom-Left: Tactical Minimap & Compact Vehicle Instrument Cluster */}
        {!inCutscene && (
          <div className="absolute bottom-[clamp(8px,2vw,16px)] left-[clamp(8px,2vw,16px)] flex flex-col gap-1.5">
            {hud.inVehicle && (
              <div className="w-[clamp(144px,34vw,224px)] px-2.5 py-1.5 hud-glass border-amber-400/35 rounded-xl flex flex-col gap-1 hud-text-shadow pointer-events-auto">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Gauge className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
                    <span className="font-semibold text-[clamp(9px,2vw,11px)] text-slate-100 truncate">
                      {hud.vehicleName}
                    </span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono-num font-extrabold shrink-0 ${
                      hud.vehicleGear === 'R'
                        ? 'bg-red-500/80 text-white'
                        : hud.vehicleGear === 'FLY'
                          ? 'bg-sky-500/80 text-white'
                          : hud.vehicleGear === 'P'
                            ? 'bg-slate-700 text-slate-200'
                            : 'bg-emerald-500/80 text-slate-950'
                    }`}
                  >
                    {hud.vehicleGear}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {/* Live Analog Speedometer Arc */}
                  <div className="flex items-center gap-1.5">
                    <svg viewBox="0 0 64 38" className="w-11 h-7 shrink-0 overflow-visible">
                      <path
                        d="M 8 32 A 24 24 0 0 1 56 32"
                        fill="none"
                        stroke="rgba(255,255,255,0.16)"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 8 32 A 24 24 0 0 1 56 32"
                        fill="none"
                        stroke={hud.vehicleSpeedKmh > 120 ? '#EF4444' : '#FBBF24'}
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeDasharray="75.4"
                        strokeDashoffset={
                          75.4 * (1 - Math.min(1, hud.vehicleSpeedKmh / (hud.currentVehicleKind === 'chopper' ? 180 : 160)))
                        }
                      />
                      <g
                        transform={`translate(32, 32) rotate(${
                          -90 + Math.min(180, (hud.vehicleSpeedKmh / (hud.currentVehicleKind === 'chopper' ? 180 : 160)) * 180)
                        })`}
                      >
                        <line x1="0" y1="0" x2="0" y2="-19" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" />
                        <circle cx="0" cy="0" r="3" fill="#FBBF24" />
                      </g>
                    </svg>
                    <div className="flex flex-col leading-none">
                      <span className="font-mono-num font-extrabold text-[clamp(12px,2.8vw,16px)] text-[#FBBF24]">
                        {hud.vehicleSpeedKmh}
                      </span>
                      <span className="text-[8px] font-mono-num text-slate-300">KM/H</span>
                    </div>
                  </div>

                  {/* Animated Steering Wheel + Headlights + Altitude */}
                  <div className="flex items-center gap-1.5">
                    <div
                      title="Steering Angle"
                      className="w-6 h-6 rounded-full border border-white/20 bg-black/40 flex items-center justify-center shrink-0"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        style={{ transform: `rotate(${Math.round(hud.vehicleSteer * 55)}deg)` }}
                        className="w-4 h-4 text-slate-200 transition-transform duration-75"
                      >
                        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
                        <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" />
                        <line x1="12" y1="12" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
                        <circle cx="12" cy="12" r="2" fill="#FBBF24" />
                      </svg>
                    </div>
                    {onToggleHeadlights && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.currentTarget.blur();
                          onToggleHeadlights();
                        }}
                        title="Toggle Headlights"
                        className={`px-1.5 py-1 rounded-md border text-[9px] font-mono-num font-bold flex items-center gap-0.5 cursor-pointer transition-colors ${
                          hud.vehicleHeadlightsOn
                            ? 'bg-amber-400/85 border-amber-200 text-slate-950'
                            : 'bg-black/40 border-white/15 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <Lightbulb className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Fuel Gauge & Chopper Altitude Row */}
                <div className="flex items-center gap-2 text-[9px] font-mono-num">
                  <span className="text-slate-300 shrink-0">FUEL</span>
                  <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-200 ${
                        hud.vehicleFuelPct > 25 ? 'bg-emerald-400' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.max(4, Math.min(100, hud.vehicleFuelPct))}%` }}
                    />
                  </div>
                  <span className="text-slate-200 font-bold w-7 text-right">{Math.round(hud.vehicleFuelPct)}%</span>
                  {hud.currentVehicleKind === 'chopper' && (
                    <span className="px-1 py-0.5 rounded bg-sky-500/30 border border-sky-400/50 text-sky-200 font-bold">
                      ALT {hud.vehicleAltitudeM}m
                    </span>
                  )}
                </div>
              </div>
            )}
            <Minimap
              playerX={hud.playerX}
              playerZ={hud.playerZ}
              playerYaw={hud.playerYaw}
              inVehicle={hud.inVehicle}
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
                    STOP ({formatKeyCode(keybinds.mic)})
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
                  {voiceMicEnabled && (
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
                      <span>
                        {hud.chaiPrompt.micListening || hud.micState.active
                          ? `Listening... (${formatKeyCode(keybinds.mic)})`
                          : `[${formatKeyCode(keybinds.mic)}] Mic Reply`}
                      </span>
                    </button>
                  )}
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
                        [{formatKeyCode(keybinds.interact)}] {hud.policeInspection.hasGunLicense ? 'Show License & Holster' : 'Admit No License'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRespondLicenseCheck(false)}
                      className="px-3 py-2 bg-[#EF4444]/85 hover:bg-[#EF4444] rounded-lg text-white text-xs font-mono-num font-bold cursor-pointer transition-colors"
                    >
                      [{formatKeyCode(keybinds.radio)}] Refuse / Resist
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

            {/* Desktop FPV Cockpit Dashboard Strip when driving/flying in First-Person View */}
            {!isTouchHud && hud.inVehicle && hud.cameraMode === 'first_person' && (
              <div className="hidden sm:flex items-center gap-4 px-4 py-2 hud-glass border-amber-400/45 rounded-2xl shadow-2xl pointer-events-auto hud-text-shadow">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-mono-num text-slate-400 uppercase">SPEED</span>
                  <span className="text-lg font-mono-num font-extrabold text-[#FBBF24] leading-none">
                    {hud.vehicleSpeedKmh}
                    <span className="text-[10px] font-normal text-slate-300 ml-0.5">km/h</span>
                  </span>
                </div>
                <div className="h-7 w-px bg-white/15" />
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-mono-num text-slate-400 uppercase">GEAR</span>
                  <span className="text-sm font-mono-num font-extrabold text-emerald-300 leading-none">
                    {hud.vehicleGear}
                  </span>
                </div>
                <div className="h-7 w-px bg-white/15" />
                <div className="flex items-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    style={{ transform: `rotate(${Math.round(hud.vehicleSteer * 58)}deg)` }}
                    className="w-6 h-6 text-slate-100 transition-transform duration-75"
                  >
                    <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
                    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" />
                    <line x1="12" y1="12" x2="12" y2="21.5" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="2.2" fill="#FBBF24" />
                  </svg>
                  <div className="flex flex-col text-[10px] font-mono-num leading-tight">
                    <span className="text-slate-300">FUEL {Math.round(hud.vehicleFuelPct)}%</span>
                    {hud.currentVehicleKind === 'chopper' ? (
                      <span className="text-sky-300 font-bold">
                        ALT {hud.vehicleAltitudeM}m ({formatKeyCode(keybinds.jump)}/{formatKeyCode(keybinds.sprint)})
                      </span>
                    ) : (
                      <span className="text-amber-200/90">
                        {formatKeyCode(keybinds.horn)} Horn · {formatKeyCode(keybinds.camera)} Cam
                      </span>
                    )}
                  </div>
                </div>
                {onToggleHeadlights && (
                  <button
                    type="button"
                    onClick={onToggleHeadlights}
                    className={`px-2 py-1 rounded-lg border text-[10px] font-mono-num font-bold flex items-center gap-1 cursor-pointer ${
                      hud.vehicleHeadlightsOn
                        ? 'bg-amber-400 border-amber-200 text-slate-950'
                        : 'bg-white/10 border-white/15 text-slate-200'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{hud.vehicleHeadlightsOn ? 'LIGHTS ON' : 'LIGHTS'}</span>
                  </button>
                )}
              </div>
            )}

            {showControlsStrip && !hasMoved && (
              <div className="hidden sm:block px-3 py-1 bg-black/35 backdrop-blur-sm border border-white/10 rounded-full text-[10px] font-mono-num text-slate-200/90 whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {`${formatKeyCode(keybinds.moveForward)}${formatKeyCode(keybinds.moveLeft)}${formatKeyCode(keybinds.moveBackward)}${formatKeyCode(keybinds.moveRight)} Move · ${formatKeyCode(keybinds.camera)} Cam · ${formatKeyCode(keybinds.horn)} Horn · ${formatKeyCode(keybinds.helmet)} Helmet · ${formatKeyCode(keybinds.medkit)} Medkit · ${formatKeyCode(keybinds.interact)} Action · ${formatKeyCode(keybinds.map)} Map · ${formatKeyCode(keybinds.phone)} Phone · ${formatKeyCode(keybinds.vehicle)} Vehicle`}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
