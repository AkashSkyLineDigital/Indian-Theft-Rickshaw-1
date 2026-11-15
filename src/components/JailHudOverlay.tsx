import React, { useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Banknote,
  BedDouble,
  Clock,
  Droplets,
  Eye,
  Hammer,
  KeyRound,
  Landmark,
  Megaphone,
  MessageSquareText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Swords,
} from 'lucide-react';
import {
  FloatingToast,
  JAIL_WORK_WAGE_INR,
  JailHudState,
  TimeOfDayHud,
  WorldLabelHud,
  formatRs,
} from '../types/game';

interface JailHudOverlayProps {
  jail: JailHudState;
  cash: number;
  bankSavings: number;
  firstPerson: boolean;
  timeOfDay: TimeOfDayHud;
  toasts: FloatingToast[];
  worldLabels: WorldLabelHud[];
  isTouchHud: boolean;
  pointerLocked?: boolean;
  onSleepNight: () => void;
  onUseToilet: () => void;
  onSkipSentence: () => void;
  onPerformWork: () => void;
  onTriggerDistraction: () => void;
  onBribeWarden: (source: 'cash' | 'bank') => void;
  onBribeRival: (rivalId?: string) => void;
  onAttack: () => void;
  onToggleFirstPerson: () => void;
  onStartPrisonBreak: () => void;
  onOpenSettings: () => void;
}

const JAIL_CX = -150;
const JAIL_CZ = 150;

export const JailHudOverlay: React.FC<JailHudOverlayProps> = ({
  jail,
  cash,
  bankSavings,
  firstPerson,
  timeOfDay,
  toasts,
  worldLabels,
  isTouchHud,
  pointerLocked = false,
  onSleepNight,
  onUseToilet,
  onSkipSentence,
  onPerformWork,
  onTriggerDistraction,
  onBribeWarden,
  onBribeRival,
  onAttack,
  onToggleFirstPerson,
  onStartPrisonBreak,
  onOpenSettings,
}) => {
  const mapRef = useRef<HTMLCanvasElement | null>(null);
  const canBribeCash = cash >= jail.wardenBribeCost;
  const canBribeBank = bankSavings >= jail.wardenBribeCost;
  const busy = jail.activeTaskKind !== 'NONE';
  const atEastGate = jail.nearStation === 'ESCAPE_GATE';
  const isWorkShift = jail.schedulePhase === 'WORK_SHIFT';
  const isFreeYard = jail.schedulePhase === 'FREE_YARD';
  const isNightLockup = jail.schedulePhase === 'NIGHT_LOCKUP';

  useEffect(() => {
    const canvas = mapRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const pad = 8;
    const span = 44;
    const scale = (size - pad * 2) / span;
    const toPt = (wx: number, wz: number): [number, number] => [
      size / 2 + (wx - JAIL_CX) * scale,
      size / 2 + (wz - JAIL_CZ) * scale,
    ];

    ctx.fillStyle = '#090d14';
    ctx.fillRect(0, 0, size, size);

    // Courtyard floor (42x42)
    const [x0, z0] = toPt(JAIL_CX - 21, JAIL_CZ - 21);
    const [x1, z1] = toPt(JAIL_CX + 21, JAIL_CZ + 21);
    ctx.fillStyle = isNightLockup ? '#111827' : '#182232';
    ctx.fillRect(x0, z0, x1 - x0, z1 - z0);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(x0, z0, x1 - x0, z1 - z0);

    // Barracks Cell block footprint on West side
    const [cx0, cz0] = toPt(JAIL_CX - 19.6, JAIL_CZ - 7.5 - 5.0);
    const [cx1, cz1] = toPt(JAIL_CX - 13.1, JAIL_CZ - 7.5 + 5.0);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx0, cz0, cx1 - cx0, cz1 - cz0);
    ctx.strokeStyle = isNightLockup ? '#f59e0b' : '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx0, cz0, cx1 - cx0, cz1 - cz0);

    // Stations: Bunk (Blue), Toilet (Cyan T), Workshop (Green), Warden (Amber), East Gate (Red)
    const stations: { wx: number; wz: number; color: string; label: string }[] = [
      { wx: JAIL_CX - 16.4, wz: JAIL_CZ - 7.5 - 2.1, color: '#38bdf8', label: '1' },
      { wx: JAIL_CX - 16.8, wz: JAIL_CZ - 7.5 + 3.2, color: '#22d3ee', label: 'T' },
      { wx: JAIL_CX - 8.5, wz: JAIL_CZ - 0.3, color: '#22c55e', label: '2' },
      { wx: JAIL_CX, wz: JAIL_CZ - 12.7, color: '#f59e0b', label: '3' },
      { wx: JAIL_CX + 18.2, wz: JAIL_CZ - 7.5, color: '#ef4444', label: '4' },
    ];
    for (const s of stations) {
      const [sx, sy] = toPt(s.wx, s.wz);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0b0e14';
      ctx.font = 'bold 6px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.label, sx, sy + 0.5);
    }

    // Fellow Inmates (Ally = purple, Rivals = red/emerald/slate, Others = cyan)
    for (const inm of jail.inmates) {
      const [ix, iy] = toPt(inm.x, inm.z);
      ctx.fillStyle = inm.rival
        ? inm.defeated
          ? '#64748b'
          : inm.bribed
            ? '#22c55e'
            : '#ef4444'
        : inm.ally
          ? '#a855f7'
          : '#38bdf8';
      ctx.strokeStyle = '#0b0e14';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ix, iy, inm.ally || inm.rival ? 3.5 : 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Patrolling guards & live vision cones
    const coneRange = jail.distractionActiveSec > 0 ? 4.4 : isFreeYard ? 5.9 : 7.8;
    for (const g of jail.guards) {
      const [gx, gy] = toPt(g.x, g.z);
      const coneLen = coneRange * scale;
      const fwdAngle = Math.atan2(-Math.sin(g.yaw), -Math.cos(g.yaw));
      const canvasAngle = fwdAngle - Math.PI / 2;

      ctx.save();
      ctx.fillStyle = g.alerted
        ? 'rgba(239, 68, 68, 0.38)'
        : jail.distractionActiveSec > 0
          ? 'rgba(56, 189, 248, 0.3)'
          : 'rgba(254, 240, 138, 0.26)';
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.arc(gx, gy, coneLen, canvasAngle - Math.PI / 5, canvasAngle + Math.PI / 5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#0b0e14';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(gx, gy, 3.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Player marker
    const [px, py] = toPt(jail.playerX, jail.playerZ);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-jail.playerYaw);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0b0e14';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(3.8, 4.2);
    ctx.lineTo(0, 2);
    ctx.lineTo(-3.8, 4.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }, [jail, isFreeYard, isNightLockup]);

  const handleLabelClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    station?:
      | 'BUNK'
      | 'TOILET'
      | 'WORKSHOP'
      | 'WARDEN'
      | 'ESCAPE_GATE'
      | 'INMATE_ALLY'
      | 'INMATE_RIVAL',
    rivalId?: string,
  ) => {
    e.currentTarget.blur();
    if (station === 'BUNK') onSleepNight();
    else if (station === 'TOILET') onUseToilet();
    else if (station === 'WORKSHOP') onPerformWork();
    else if (station === 'INMATE_ALLY') onTriggerDistraction();
    else if (station === 'INMATE_RIVAL') onBribeRival(rivalId);
    else if (station === 'ESCAPE_GATE') onStartPrisonBreak();
    else if (station === 'WARDEN') {
      if (canBribeCash) onBribeWarden('cash');
      else onBribeWarden('bank');
    }
  };

  const stationPrompt =
    jail.nearRival && !jail.nearRival.defeated && !jail.nearRival.bribed
      ? `RIVAL ${jail.nearRival.name} (${jail.nearRival.hp}/${jail.nearRival.maxHp} HP) — [Click / J] Fight · Move >9.5m Avoid · [E / 6 / B] Bribe ${formatRs(jail.nearRival.bribeCost)}`
      : jail.nearStation === 'BUNK'
        ? '[E] Cell Bunk — Sleep Night (Next Morning + Royal Bank FD/Savings Interest)'
        : jail.nearStation === 'TOILET'
          ? '[E] Cell Toilet — Freshen Up (+35 Stamina & +10 HP)'
          : jail.nearStation === 'WORKSHOP'
            ? `[E] Jail Workshop — Carpentry & Gardening (+${formatRs(JAIL_WORK_WAGE_INR)} & Cut 50% Saza)`
            : jail.nearStation === 'INMATE_ALLY'
              ? '[E / 5] Chhotu Mechanic — Start Guard Distraction (Best in Free Yard Hour!)'
              : jail.nearStation === 'WARDEN'
                ? `[E] Jailer Mahendra — Bribe ${formatRs(jail.wardenBribeCost)} for 23:30 Night Exit`
                : jail.nearStation === 'ESCAPE_GATE'
                  ? '[E] Weak East Gate & Drainage Grate — Pick Lock Now!'
                  : null;

  return (
    <>
      {/* Subtle Center Crosshair Dot shown ONLY in First-Person View inside Central Jail */}
      {firstPerson && pointerLocked && (
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[15]">
          <div className="w-1.5 h-1.5 rounded-full bg-white/85 ring-1 ring-black/65 shadow-[0_0_4px_rgba(0,0,0,0.95)]" />
        </div>
      )}

      {/* Layer 1 (z-[5]): 3D Floating World Labels strictly behind Jail HUD Sidebars */}
      <div className="fixed inset-0 z-[5] pointer-events-none overflow-hidden">
        {worldLabels.map((lbl) => {
          const accent =
            lbl.jailStation === 'BUNK'
              ? 'border-sky-400/70 text-[#38BDF8]'
              : lbl.jailStation === 'TOILET'
                ? 'border-cyan-400/70 text-cyan-300'
                : lbl.jailStation === 'WORKSHOP'
                  ? 'border-emerald-400/70 text-[#22C55E]'
                  : lbl.jailStation === 'INMATE_ALLY'
                    ? 'border-purple-400/70 text-purple-300'
                    : lbl.jailStation === 'INMATE_RIVAL'
                      ? 'border-red-400/75 text-[#EF4444]'
                      : lbl.jailStation === 'WARDEN'
                        ? 'border-amber-400/70 text-[#FBBF24]'
                        : 'border-red-400/70 text-red-300';

          return (
            <button
              key={lbl.id}
              type="button"
              onClick={(e) => handleLabelClick(e, lbl.jailStation, lbl.rivalId)}
              style={{
                transform: `translate3d(${lbl.screenX}px, ${lbl.screenY}px, 0) translate(-50%, -100%)`,
              }}
              className={`absolute top-0 left-0 pointer-events-auto px-2 py-0.5 hud-glass-subtle hover:bg-[rgba(24,30,42,0.65)] rounded-md text-center shadow-md cursor-pointer transition-colors ${
                lbl.isClosest ? accent : 'border-white/[0.14]'
              }`}
            >
              <div className="text-[10px] font-display font-bold text-slate-100 leading-tight whitespace-nowrap hud-text-shadow">
                {lbl.title}
              </div>
              {lbl.isClosest && lbl.subtitle && (
                <div className={`text-[9px] font-mono-num whitespace-nowrap hud-text-shadow ${accent}`}>
                  {lbl.subtitle}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Layer 2 (z-20): Compact Translucent Jail HUD Sidebars & Top Safe-Area Shift Bar */}
      <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between px-2.5 pb-2.5 pt-[max(14px,env(safe-area-inset-top))] sm:px-4 sm:pb-4 overflow-hidden">
        {/* Top Row: Compact Left Sidebar (~30% narrower), Top-Center Schedule Ribbon, Compact Right Actions (~30% narrower) */}
        <div className="flex items-start justify-between gap-2">
          {/* Top-Left Compact Sentence HUD + Radar + Rivalry */}
          <div className="flex flex-col gap-1.5">
            <div className="pointer-events-auto w-[min(39vw,210px)] sm:w-[234px] max-h-[60vh] overflow-y-auto hud-glass-jail rounded-xl shadow-xl p-2 sm:p-2.5 flex flex-col gap-1.5 hud-text-shadow">
              <div className="flex items-center justify-between gap-1">
                <span className="font-display text-[10px] sm:text-[11px] font-extrabold tracking-wider text-[#FBBF24] uppercase truncate">
                  Central Jail
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono-num text-slate-200 shrink-0">
                  D{timeOfDay.dayCount} · {timeOfDay.formattedTime}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-1.5">
                <div className="shrink-0 flex flex-col items-center gap-0.5 self-center sm:self-auto">
                  <canvas
                    ref={mapRef}
                    width={96}
                    height={96}
                    className="w-[74px] h-[74px] sm:w-[86px] sm:h-[86px] rounded border border-white/15 bg-[#090d14]/85"
                  />
                  <span className="hidden sm:inline text-[8px] font-mono-num text-slate-300/80">
                    1:Bed T:WC 2:Work 4:Gate
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-between gap-1 text-[10px] font-mono-num">
                  <div className="bg-white/[0.05] border border-white/10 rounded px-1.5 py-1">
                    <div className="text-[8px] text-slate-300/80 uppercase">Sentence</div>
                    <div className="font-bold text-[#FBBF24] leading-tight">
                      {jail.remainingDays.toFixed(2)}d ({jail.remainingHoursLabel})
                    </div>
                  </div>
                  <div className="bg-white/[0.05] border border-white/10 rounded px-1.5 py-0.5 flex justify-between">
                    <span className="text-slate-300/80">Stars</span>
                    <strong className="text-[#EF4444]">{jail.starsAtArrest}★</strong>
                  </div>
                  <div className="bg-white/[0.05] border border-white/10 rounded px-1.5 py-0.5 flex justify-between">
                    <span className="text-slate-300/80">Cash</span>
                    <strong className="text-[#EAB308]">{formatRs(cash)}</strong>
                  </div>
                  <div className="bg-white/[0.05] border border-white/10 rounded px-1.5 py-0.5 flex justify-between">
                    <span className="text-slate-300/80">Bank</span>
                    <strong className="text-[#38BDF8]">{formatRs(bankSavings)}</strong>
                  </div>
                </div>
              </div>

              {jail.escrowedWeaponsCount > 0 && (
                <div className="flex items-center gap-1 px-1.5 py-1 bg-sky-500/15 border border-sky-400/35 rounded text-[9px] font-mono-num text-sky-200">
                  <ShieldCheck className="w-3 h-3 text-[#38BDF8] shrink-0" />
                  <span className="leading-tight">
                    {jail.escrowedWeaponsCount} licensed gun(s) held in escrow
                  </span>
                </div>
              )}

              {jail.distractionActiveSec > 0 && (
                <div className="flex items-center gap-1 px-1.5 py-1 bg-purple-500/25 border border-purple-400/60 rounded text-[10px] font-mono-num font-bold text-purple-100">
                  <Megaphone className="w-3 h-3 text-purple-200 shrink-0" />
                  <span className="leading-tight">
                    CHHOTU ACTIVE ({jail.distractionActiveSec}s) — RUN TO GATE [4]!
                  </span>
                </div>
              )}

              {jail.spottedByGuard && (
                <div className="flex items-center gap-1 px-1.5 py-1 bg-red-500/25 border border-red-400/65 rounded text-[10px] font-mono-num font-bold text-red-100 animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-[#EF4444] shrink-0" />
                  <span className="leading-tight">CONE ON EAST GATE! Use Distraction [5]</span>
                </div>
              )}

              {busy && (
                <div className="flex flex-col gap-1 bg-white/[0.06] border border-amber-400/45 rounded p-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono-num text-[#FBBF24] font-bold">
                    <span>
                      {jail.activeTaskKind === 'WORK' ? 'Workshop Shift...' : 'Picking Lock...'}
                    </span>
                    <span>{Math.round(jail.activeTaskPct)}%</span>
                  </div>
                  <div className="w-full h-1 bg-black/45 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-75 ${
                        jail.activeTaskKind === 'ESCAPE' ? 'bg-[#EF4444]' : 'bg-[#22C55E]'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, jail.activeTaskPct))}%` }}
                    />
                  </div>
                </div>
              )}

              {jail.rivals.length > 0 && (
                <div className="border-t border-white/10 pt-1.5 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[9px] font-mono-num text-[#EF4444] font-bold uppercase">
                    <span className="flex items-center gap-1">
                      <Swords className="w-3 h-3" /> Rivalry
                    </span>
                    <span className="text-[8px] text-slate-300/80">[J] Hit · [6] Bribe</span>
                  </div>
                  {jail.rivals.map((rv) => (
                    <div
                      key={rv.id}
                      className={`flex items-center justify-between gap-1 px-1.5 py-1 rounded border text-[9px] font-mono-num ${
                        rv.chasing
                          ? 'bg-red-500/25 border-red-400/60 text-red-100'
                          : rv.bribed
                            ? 'bg-emerald-500/15 border-emerald-400/45 text-emerald-200'
                            : rv.defeated
                              ? 'bg-white/[0.04] border-white/10 text-slate-400'
                              : 'bg-white/[0.05] border-white/10 text-slate-100'
                      }`}
                    >
                      <div className="min-w-0 truncate">
                        <span className="font-bold">{rv.name}</span>
                        <span className="ml-1 text-[8px] opacity-85">
                          {rv.defeated
                            ? 'KO'
                            : rv.bribed
                              ? 'Truce'
                              : rv.chasing
                                ? `CHASE ${rv.hp}/${rv.maxHp}`
                                : `${rv.hp}/${rv.maxHp}`}
                        </span>
                      </div>
                      {!rv.defeated && !rv.bribed && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.currentTarget.blur();
                              onAttack();
                            }}
                            className="px-1.5 py-0.5 bg-[#EF4444] hover:bg-red-400 rounded text-white font-bold text-[8px] cursor-pointer"
                          >
                            Hit
                          </button>
                          <button
                            type="button"
                            disabled={cash < rv.bribeCost}
                            onClick={(e) => {
                              e.currentTarget.blur();
                              onBribeRival(rv.id);
                            }}
                            className="px-1.5 py-0.5 bg-[#F59E0B] hover:bg-[#FBBF24] disabled:bg-white/10 disabled:text-white/30 rounded text-[#0E1118] font-bold text-[8px] cursor-pointer"
                          >
                            {formatRs(rv.bribeCost)}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {jail.statusBanner && (
                <div className="text-[10px] text-slate-100 leading-snug border-t border-white/10 pt-1">
                  {jail.statusBanner}
                </div>
              )}
            </div>

            {toasts.length > 0 && (
              <div className="flex flex-col gap-1 max-w-[234px]">
                {toasts.map((t) => (
                  <div
                    key={t.id}
                    className={`px-2.5 py-1 hud-glass rounded-lg text-[11px] font-medium hud-text-shadow ${
                      t.tone === 'cash'
                        ? 'border-emerald-400/50 text-[#22C55E]'
                        : t.tone === 'warn'
                          ? 'border-red-400/50 text-red-200'
                          : 'text-slate-100'
                    }`}
                  >
                    {t.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top-Center Daily Prison Schedule Timeline (Safe-Area Padded, Translucent) */}
          <div className="hidden md:flex flex-col items-center gap-1 max-w-md hud-glass-jail rounded-xl px-2.5 py-1.5 shadow-lg hud-text-shadow mt-0.5">
            <div className="grid grid-cols-3 gap-1.5 w-full text-[9px] font-mono-num">
              <div
                className={`px-2 py-0.5 rounded border text-center ${
                  isWorkShift
                    ? 'bg-emerald-500/20 border-emerald-400/60 text-[#22C55E] font-bold'
                    : 'bg-white/[0.04] border-white/10 text-slate-300/70'
                }`}
              >
                <div>06:00–17:00</div>
                <div>WORK SHIFT</div>
              </div>
              <div
                className={`px-2 py-0.5 rounded border text-center ${
                  isFreeYard
                    ? 'bg-amber-500/20 border-amber-400/60 text-[#FBBF24] font-bold'
                    : 'bg-white/[0.04] border-white/10 text-slate-300/70'
                }`}
              >
                <div>17:00–20:30</div>
                <div>FREE YARD</div>
              </div>
              <div
                className={`px-2 py-0.5 rounded border text-center ${
                  isNightLockup
                    ? 'bg-sky-500/20 border-sky-400/60 text-[#38BDF8] font-bold'
                    : 'bg-white/[0.04] border-white/10 text-slate-300/70'
                }`}
              >
                <div>20:30–06:00</div>
                <div>NIGHT LOCKUP</div>
              </div>
            </div>
            <div className="text-[10px] text-center text-slate-100 leading-tight">{jail.scheduleSub}</div>
          </div>

          {/* Top-Right Compact Controls & Routine Actions (~30% narrower) */}
          <div className="pointer-events-auto flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onToggleFirstPerson();
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono-num cursor-pointer hud-text-shadow ${
                  firstPerson
                    ? 'bg-[#38BDF8] text-[#0E1118] font-bold'
                    : 'hud-glass-subtle hover:bg-[rgba(24,30,42,0.58)] text-slate-100'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>{firstPerson ? 'FPV ON' : 'FPV (C)'}</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onOpenSettings();
                }}
                className="flex items-center gap-1 px-2.5 py-1 hud-glass-subtle hover:bg-[rgba(24,30,42,0.58)] rounded-full text-[11px] font-mono-num text-slate-100 cursor-pointer hud-text-shadow"
              >
                <Settings className="w-3 h-3 text-[#FBBF24]" />
                <span>MENU</span>
              </button>
            </div>

            <div className="w-[min(39vw,196px)] sm:w-[214px] max-h-[58vh] overflow-y-auto hud-glass-jail rounded-xl shadow-xl p-2 flex flex-col gap-1.5 hud-text-shadow">
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <span className="text-[9px] font-display font-bold tracking-wider text-[#FBBF24] uppercase truncate">
                  Routine &amp; Escape
                </span>
              </div>

              {/* 1. Sleep Night & Toilet */}
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  disabled={busy}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onSleepNight();
                  }}
                  className="col-span-2 flex items-center gap-1.5 px-2 py-1.5 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/45 rounded-lg text-left text-sky-100 cursor-pointer disabled:opacity-50"
                >
                  <BedDouble className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold text-[10px] leading-tight truncate">[1] Sleep (-1d)</div>
                    <div className="text-[8px] text-sky-200/85 truncate">+Day &amp; FD</div>
                  </div>
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onUseToilet();
                  }}
                  className="flex flex-col items-center justify-center px-1 py-1 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 rounded-lg text-cyan-100 cursor-pointer disabled:opacity-50"
                >
                  <Droplets className="w-3 h-3 text-cyan-300" />
                  <span className="text-[9px] font-bold">Toilet</span>
                </button>
              </div>

              {/* 2. Workshop Shift */}
              <button
                type="button"
                disabled={busy || isNightLockup}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onPerformWork();
                }}
                className="flex items-center justify-between gap-1.5 px-2 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/45 rounded-lg text-left text-emerald-100 cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Hammer className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold text-[10px] truncate">[2] Work ({jail.workCount})</div>
                    <div className="text-[8px] text-emerald-200/85 truncate">
                      +{formatRs(JAIL_WORK_WAGE_INR)} &amp; -50% Saza
                    </div>
                  </div>
                </div>
                {jail.workShiftDoneToday && (
                  <span className="text-[8px] font-mono-num px-1 bg-emerald-500/25 rounded text-emerald-200 shrink-0">
                    OK
                  </span>
                )}
              </button>

              {/* 5. Inmate Ally Distraction */}
              <button
                type="button"
                disabled={busy || isNightLockup || jail.distractionActiveSec > 0 || jail.distractionCooldownSec > 0}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onTriggerDistraction();
                }}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-left cursor-pointer disabled:opacity-50 ${
                  isFreeYard
                    ? 'bg-purple-500/25 hover:bg-purple-500/35 border-purple-400/65 text-purple-100'
                    : 'bg-white/[0.06] hover:bg-white/[0.12] border-purple-400/35 text-purple-200'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-[10px] truncate">[5] Chhotu Distract</div>
                  <div className="text-[8px] text-purple-200/85 truncate">
                    {jail.distractionActiveSec > 0
                      ? `Active ${jail.distractionActiveSec}s!`
                      : jail.distractionCooldownSec > 0
                        ? `Cooldown ${jail.distractionCooldownSec}s`
                        : isFreeYard
                          ? 'Free Yard! Pulls guards 14s'
                          : 'Best 17:00–20:30 Yard'}
                  </div>
                </div>
              </button>

              {/* 3. Bribe Jailer */}
              <div className="bg-amber-500/12 border border-amber-400/40 rounded-lg p-1.5 flex flex-col gap-1">
                <div className="text-[10px] font-bold text-amber-200 flex items-center justify-between gap-1">
                  <span className="truncate">[3] Bribe Jailer</span>
                  <span className="font-mono-num text-[#FBBF24] shrink-0">{formatRs(jail.wardenBribeCost)}</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    disabled={busy || !canBribeCash}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onBribeWarden('cash');
                    }}
                    className={`flex items-center justify-center gap-1 py-1 rounded text-[9px] font-bold uppercase cursor-pointer ${
                      canBribeCash && !busy
                        ? 'bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0E1118]'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    <Banknote className="w-2.5 h-2.5" />
                    <span>Cash</span>
                  </button>
                  <button
                    type="button"
                    disabled={busy || !canBribeBank}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onBribeWarden('bank');
                    }}
                    className={`flex items-center justify-center gap-1 py-1 rounded text-[9px] font-bold uppercase cursor-pointer ${
                      canBribeBank && !busy
                        ? 'bg-[#38BDF8] hover:bg-sky-300 text-[#0E1118]'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    <Landmark className="w-2.5 h-2.5" />
                    <span>Bank</span>
                  </button>
                </div>
              </div>

              {/* 4. Weak East Gate / Grate Escape */}
              <button
                type="button"
                disabled={busy || isNightLockup}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onStartPrisonBreak();
                }}
                className={`flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg border text-left cursor-pointer disabled:opacity-50 ${
                  atEastGate
                    ? 'bg-[#EF4444]/85 hover:bg-red-500 border-red-200 text-white animate-pulse'
                    : 'bg-red-500/20 hover:bg-red-500/30 border-red-400/50 text-red-100'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <KeyRound className="w-3.5 h-3.5 text-red-200 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold text-[10px] truncate">
                      {atEastGate ? '[4] PICK LOCK NOW!' : '[4] Prison Break'}
                    </div>
                    <div className="text-[8px] text-red-100/85 truncate">
                      {atEastGate ? 'Hold while cones clear' : 'East Gate · Free Yard'}
                    </div>
                  </div>
                </div>
                <ShieldAlert className="w-3 h-3 text-red-200 shrink-0" />
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onSkipSentence();
                }}
                className="flex items-center justify-center gap-1 py-1 bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 rounded-lg text-[9px] font-mono-num text-slate-200 cursor-pointer disabled:opacity-50"
              >
                <Clock className="w-2.5 h-2.5 text-[#38BDF8]" />
                <span className="truncate">Fast-Forward Sentence</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Inmate Tip Bubble, Prompt & Compact Controls Strip */}
        <div className="flex flex-col items-center gap-1.5 hud-text-shadow">
          {jail.nearInmateDialogue && (
            <div className="max-w-lg px-3.5 py-1.5 hud-glass border-purple-400/50 rounded-xl shadow-lg flex items-start gap-2">
              <MessageSquareText className="w-3.5 h-3.5 text-purple-300 shrink-0 mt-0.5" />
              <div className="text-xs leading-snug">
                <span className="font-bold text-purple-300">{jail.nearInmateDialogue.name}: </span>
                <span className="text-slate-100">{jail.nearInmateDialogue.text}</span>
              </div>
            </div>
          )}
          {stationPrompt && (
            <div className="px-3.5 py-1.5 hud-glass border-amber-400/60 rounded-full text-[11px] sm:text-xs font-mono-num font-bold text-[#FBBF24] shadow-lg text-center">
              {stationPrompt}
            </div>
          )}
          {!isTouchHud && (
            <div className="hidden sm:block px-3 py-0.5 hud-glass-subtle rounded-full text-[10px] font-mono-num text-slate-200/85">
              WASD Walk · Drag Look · [Space] Jump · [LMB/J] Fight · [6/B] Bribe · [E] Action · [1-5] Quick · [C] FPV
            </div>
          )}
        </div>
      </div>
    </>
  );
};
