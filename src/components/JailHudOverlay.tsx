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
    const pad = 10;
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
    ctx.lineWidth = 2.5;
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
      { wx: JAIL_CX - 8.5, wz: JAIL_CZ - 0.3, color: '#10b981', label: '2' },
      { wx: JAIL_CX, wz: JAIL_CZ - 12.7, color: '#f59e0b', label: '3' },
      { wx: JAIL_CX + 18.2, wz: JAIL_CZ - 7.5, color: '#ef4444', label: '4' },
    ];
    for (const s of stations) {
      const [sx, sy] = toPt(s.wx, s.wz);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0b0e14';
      ctx.font = 'bold 7px sans-serif';
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
      ctx.arc(ix, iy, inm.ally || inm.rival ? 4.2 : 2.8, 0, Math.PI * 2);
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
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(gx, gy, 3.6, 0, Math.PI * 2);
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
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4.5, 5);
    ctx.lineTo(0, 2.5);
    ctx.lineTo(-4.5, 5);
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
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-3 sm:p-4 overflow-hidden">
      {/* 3D World Floating Station, Ally & Rival Labels */}
      {worldLabels.map((lbl) => (
        <button
          key={lbl.id}
          type="button"
          onClick={(e) => handleLabelClick(e, lbl.jailStation, lbl.rivalId)}
          style={{
            transform: `translate3d(${lbl.screenX}px, ${lbl.screenY}px, 0) translate(-50%, -100%)`,
          }}
          className={`absolute top-0 left-0 pointer-events-auto px-2 py-1 bg-[#0B0E14]/92 hover:bg-[#171E2C] border text-center shadow-lg cursor-pointer ${
            lbl.jailStation === 'BUNK'
              ? 'border-sky-400/80 text-sky-200'
              : lbl.jailStation === 'TOILET'
                ? 'border-cyan-400/80 text-cyan-200'
                : lbl.jailStation === 'WORKSHOP'
                  ? 'border-emerald-400/80 text-emerald-200'
                  : lbl.jailStation === 'INMATE_ALLY'
                    ? 'border-purple-400/85 text-purple-200'
                    : lbl.jailStation === 'INMATE_RIVAL'
                      ? 'border-red-500 text-red-200'
                      : lbl.jailStation === 'WARDEN'
                        ? 'border-amber-400/80 text-amber-200'
                        : 'border-red-400/85 text-red-200'
          }`}
        >
          <div className="text-[10px] font-display font-bold leading-tight">{lbl.title}</div>
          <div className="text-[9px] font-mono-num opacity-90">{lbl.subtitle}</div>
        </button>
      ))}

      {/* Top Row: Left Jail Radar, Center Daily Schedule Clock, Right Action Menu */}
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        {/* Top-Left Sentence HUD + Live Jail Yard Map */}
        <div className="flex flex-col gap-2">
          <div className="pointer-events-auto w-72 sm:w-84 bg-[#0B0E14]/94 border border-slate-700/90 shadow-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-xs font-extrabold tracking-wider text-amber-400 uppercase">
                Bharat Central Jail
              </span>
              <span className="text-[11px] font-mono-num text-slate-300">
                Day {timeOfDay.dayCount} · {timeOfDay.formattedTime}
              </span>
            </div>

            <div className="flex items-stretch gap-2.5">
              <div className="shrink-0 flex flex-col items-center gap-1">
                <canvas
                  ref={mapRef}
                  width={120}
                  height={120}
                  className="border border-slate-700 bg-[#090d14]"
                />
                <span className="text-[9px] font-mono-num text-slate-400">
                  1:Bunk T:WC 2:Work 4:Gate
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-between gap-1.5 text-[11px] font-mono-num">
                <div className="bg-[#121826] border border-slate-800 px-2 py-1.5">
                  <div className="text-[9px] text-slate-400 uppercase">Sentence Left</div>
                  <div className="font-bold text-amber-300">
                    {jail.remainingDays.toFixed(2)}d ({jail.remainingHoursLabel})
                  </div>
                </div>
                <div className="bg-[#121826] border border-slate-800 px-2 py-1 flex justify-between">
                  <span className="text-slate-400">Arrest:</span>
                  <strong className="text-red-300">{jail.starsAtArrest}★</strong>
                </div>
                <div className="bg-[#121826] border border-slate-800 px-2 py-1 flex justify-between">
                  <span className="text-slate-400">Cash:</span>
                  <strong className="text-emerald-300">{formatRs(cash)}</strong>
                </div>
                <div className="bg-[#121826] border border-slate-800 px-2 py-1 flex justify-between">
                  <span className="text-slate-400">Bank:</span>
                  <strong className="text-sky-300">{formatRs(bankSavings)}</strong>
                </div>
              </div>
            </div>

            {jail.escrowedWeaponsCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-sky-950/55 border border-sky-500/40 text-[10px] font-mono-num text-sky-200">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                <span>
                  {jail.escrowedWeaponsCount} licensed gun(s) held in escrow — returned on release!
                </span>
              </div>
            )}

            {jail.distractionActiveSec > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-purple-950/90 border border-purple-400 text-[11px] font-mono-num font-bold text-purple-100">
                <Megaphone className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                <span>
                  CHHOTU DISTRACTION ACTIVE ({jail.distractionActiveSec}s) — RUN TO EAST GATE [4/E]!
                </span>
              </div>
            )}

            {jail.spottedByGuard && (
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-red-950/95 border border-red-500 text-[11px] font-mono-num font-bold text-red-200 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>GUARD CONE WATCHING EAST GATE! Wait or use Chhotu Distraction [5]!</span>
              </div>
            )}

            {busy && (
              <div className="flex flex-col gap-1 bg-[#121826] border border-amber-500/60 p-2">
                <div className="flex items-center justify-between text-[11px] font-mono-num text-amber-200 font-bold">
                  <span>
                    {jail.activeTaskKind === 'WORK'
                      ? 'Carpentry / Gardening Shift...'
                      : 'Picking Gate / Grate Lock...'}
                  </span>
                  <span>{Math.round(jail.activeTaskPct)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-75 ${
                      jail.activeTaskKind === 'ESCAPE' ? 'bg-red-500' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, jail.activeTaskPct))}%` }}
                  />
                </div>
              </div>
            )}

            {jail.rivals.length > 0 && (
              <div className="border-t border-slate-800 pt-1.5 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px] font-mono-num text-red-300 font-bold uppercase">
                  <span className="flex items-center gap-1">
                    <Swords className="w-3 h-3" /> Inmate Rivalry
                  </span>
                  <span className="text-[9px] text-slate-400">[Click/J] Fight · [6/B] Bribe</span>
                </div>
                {jail.rivals.map((rv) => (
                  <div
                    key={rv.id}
                    className={`flex items-center justify-between gap-2 px-2 py-1 border text-[10px] font-mono-num ${
                      rv.chasing
                        ? 'bg-red-950/85 border-red-500 text-red-100'
                        : rv.bribed
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                          : rv.defeated
                            ? 'bg-slate-900/70 border-slate-800 text-slate-400'
                            : 'bg-[#121826] border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="min-w-0 truncate">
                      <span className="font-bold">{rv.name}</span>
                      <span className="ml-1.5 text-[9px] opacity-85">
                        {rv.defeated
                          ? 'KO'
                          : rv.bribed
                            ? 'Truce'
                            : rv.chasing
                              ? `CHASING ${rv.hp}/${rv.maxHp}`
                              : `${rv.hp}/${rv.maxHp} HP`}
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
                          className="px-1.5 py-0.5 bg-red-700 hover:bg-red-600 text-white font-bold text-[9px] cursor-pointer"
                        >
                          Punch
                        </button>
                        <button
                          type="button"
                          disabled={cash < rv.bribeCost}
                          onClick={(e) => {
                            e.currentTarget.blur();
                            onBribeRival(rv.id);
                          }}
                          className="px-1.5 py-0.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-[#0B0E14] font-bold text-[9px] cursor-pointer"
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
              <div className="text-[11px] text-slate-200 leading-snug border-t border-slate-800 pt-1.5">
                {jail.statusBanner}
              </div>
            )}
          </div>

          {/* Live Toasts inside Jail */}
          {toasts.length > 0 && (
            <div className="flex flex-col gap-1 max-w-xs">
              {toasts.map((t) => (
                <div
                  key={t.id}
                  className={`px-3 py-1.5 border text-xs font-medium shadow-md ${
                    t.tone === 'cash'
                      ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
                      : t.tone === 'warn'
                        ? 'bg-red-950/95 border-red-500 text-red-200'
                        : 'bg-slate-900/95 border-slate-600 text-slate-100'
                  }`}
                >
                  {t.text}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top-Center Daily Prison Schedule Timeline */}
        <div className="hidden md:flex flex-col items-center gap-1.5 max-w-md bg-[#0B0E14]/92 border border-slate-700/90 px-3 py-2 shadow-xl">
          <div className="grid grid-cols-3 gap-1.5 w-full text-[10px] font-mono-num">
            <div
              className={`px-2 py-1 border text-center ${
                isWorkShift
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div>06:00–17:00</div>
              <div>WORK SHIFT</div>
            </div>
            <div
              className={`px-2 py-1 border text-center ${
                isFreeYard
                  ? 'bg-amber-950/90 border-amber-400 text-amber-200 font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div>17:00–20:30</div>
              <div>FREE YARD</div>
            </div>
            <div
              className={`px-2 py-1 border text-center ${
                isNightLockup
                  ? 'bg-sky-950/90 border-sky-400 text-sky-200 font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div>20:30–06:00</div>
              <div>NIGHT LOCKUP</div>
            </div>
          </div>
          <div className="text-[10px] text-center text-slate-200 leading-snug">{jail.scheduleSub}</div>
        </div>

        {/* Top-Right Controls & Living Prison Actions */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleFirstPerson();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 border text-xs font-mono-num cursor-pointer ${
                firstPerson
                  ? 'bg-sky-600 hover:bg-sky-500 border-sky-400 text-white'
                  : 'bg-[#0B0E14]/94 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{firstPerson ? 'FPV ON (C)' : 'FPV (C)'}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenSettings();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0B0E14]/94 hover:bg-slate-800 border border-slate-700 text-xs font-mono-num text-slate-200 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>MENU (ESC)</span>
            </button>
          </div>

          <div className="w-64 sm:w-74 bg-[#0B0E14]/94 border border-slate-700/90 shadow-xl p-2.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <span className="text-[10px] font-display font-bold tracking-wider text-slate-200 uppercase">
                Daily Routine &amp; Escape
              </span>
              <span className="text-[9px] font-mono-num text-slate-400">Click / Drag to look</span>
            </div>

            {/* 1. Sleep Night on Bunk Bed (+FD Interest) & Cell Toilet */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                disabled={busy}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onSleepNight();
                }}
                className="col-span-2 flex items-center gap-2 px-2 py-1.5 bg-sky-900/75 hover:bg-sky-800 border border-sky-500/60 text-left text-xs text-sky-100 cursor-pointer disabled:opacity-50"
              >
                <BedDouble className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                <div>
                  <div className="font-bold text-[11px]">[1] Sleep Night (-1d)</div>
                  <div className="text-[9px] text-sky-300">+Calendar Day &amp; FD Interest</div>
                </div>
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onUseToilet();
                }}
                className="flex flex-col items-center justify-center px-1.5 py-1.5 bg-cyan-950/75 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-100 cursor-pointer disabled:opacity-50"
              >
                <Droplets className="w-3.5 h-3.5 text-cyan-300" />
                <span className="text-[10px] font-bold">Toilet</span>
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
              className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-emerald-900/75 hover:bg-emerald-800 border border-emerald-500/60 text-left text-xs text-emerald-100 cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <Hammer className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <div>
                  <div className="font-bold text-[11px]">
                    [2] Workshop Kaam ({jail.workCount} done)
                  </div>
                  <div className="text-[9px] text-emerald-300">
                    Carpentry/Garden: +{formatRs(JAIL_WORK_WAGE_INR)} &amp; -50% Saza
                  </div>
                </div>
              </div>
              {jail.workShiftDoneToday && (
                <span className="text-[9px] font-mono-num px-1 bg-emerald-500/20 border border-emerald-400/50 text-emerald-200">
                  SHIFT OK
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
              className={`flex items-center justify-between gap-2 px-2.5 py-1.5 border text-left text-xs cursor-pointer disabled:opacity-50 ${
                isFreeYard
                  ? 'bg-purple-900/85 hover:bg-purple-800 border-purple-400 text-purple-100'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-purple-500/40 text-purple-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Megaphone className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                <div>
                  <div className="font-bold text-[11px]">[5] Chhotu Guard Distraction</div>
                  <div className="text-[9px] text-purple-300">
                    {jail.distractionActiveSec > 0
                      ? `Active: ${jail.distractionActiveSec}s left — run to East Gate!`
                      : jail.distractionCooldownSec > 0
                        ? `Cooldown: ${jail.distractionCooldownSec}s`
                        : isFreeYard
                          ? 'Free Yard Window! Pulls guards away for 14s'
                          : 'Best used during 17:00–20:30 Free Yard Hour'}
                  </div>
                </div>
              </div>
            </button>

            {/* 3. Bribe Jailer */}
            <div className="bg-amber-950/55 border border-amber-500/50 p-2 flex flex-col gap-1">
              <div className="text-[11px] font-bold text-amber-200 flex items-center justify-between">
                <span>[3] Bribe Jailer Mahendra</span>
                <span className="font-mono-num text-amber-300">{formatRs(jail.wardenBribeCost)}</span>
              </div>
              <div className="text-[9px] text-amber-300/90">
                23:30 Night North Gate exit · 35% chance of 2★
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  disabled={busy || !canBribeCash}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onBribeWarden('cash');
                  }}
                  className={`flex items-center justify-center gap-1 py-1 text-[10px] font-bold uppercase cursor-pointer ${
                    canBribeCash && !busy
                      ? 'bg-amber-500 hover:bg-amber-400 text-[#0B0E14]'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Banknote className="w-3 h-3" />
                  <span>Pay Cash</span>
                </button>
                <button
                  type="button"
                  disabled={busy || !canBribeBank}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onBribeWarden('bank');
                  }}
                  className={`flex items-center justify-center gap-1 py-1 text-[10px] font-bold uppercase cursor-pointer ${
                    canBribeBank && !busy
                      ? 'bg-sky-500 hover:bg-sky-400 text-[#0B0E14]'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Landmark className="w-3 h-3" />
                  <span>Bank Transfer</span>
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
              className={`flex items-center justify-between gap-2 px-2.5 py-1.5 border text-left text-xs cursor-pointer disabled:opacity-50 ${
                atEastGate
                  ? 'bg-red-700 hover:bg-red-600 border-red-300 text-white animate-pulse'
                  : 'bg-red-950/85 hover:bg-red-900 border-red-500/70 text-red-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-red-300 shrink-0" />
                <div>
                  <div className="font-bold text-[11px]">
                    {atEastGate ? '[4] PICK GATE / GRATE NOW!' : '[4] Prison Break (East Gate / Grate)'}
                  </div>
                  <div className="text-[9px] text-red-200">
                    {atEastGate
                      ? 'Hold lockpick while cones are away -> 3★!'
                      : 'Free Yard [17:00–20:30] + Distraction -> Safe Escape'}
                  </div>
                </div>
              </div>
              <ShieldAlert className="w-3.5 h-3.5 text-red-300 shrink-0" />
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={(e) => {
                e.currentTarget.blur();
                onSkipSentence();
              }}
              className="flex items-center justify-center gap-1.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-mono-num text-slate-300 cursor-pointer disabled:opacity-50"
            >
              <Clock className="w-3 h-3 text-sky-400" />
              <span>Serve Full Sentence Fast-Forward (+FD Interest)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Inmate Tip Bubble, Prompt & Controls Strip */}
      <div className="flex flex-col items-center gap-2">
        {jail.nearInmateDialogue && (
          <div className="max-w-lg px-3.5 py-2 bg-[#0B0E14]/95 border border-purple-400/70 shadow-xl flex items-start gap-2">
            <MessageSquareText className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
            <div className="text-xs leading-snug">
              <span className="font-bold text-purple-300">{jail.nearInmateDialogue.name}: </span>
              <span className="text-slate-100">{jail.nearInmateDialogue.text}</span>
            </div>
          </div>
        )}
        {stationPrompt && (
          <div className="px-4 py-2 bg-[#0B0E14]/95 border-2 border-amber-400 text-xs sm:text-sm font-mono-num font-bold text-amber-200 shadow-lg text-center">
            {stationPrompt}
          </div>
        )}
        {!isTouchHud && (
          <div className="px-3 py-1 bg-[#0B0E14]/90 border border-slate-700/80 text-[11px] font-mono-num text-slate-300">
            WASD Walk · Click Lock / Drag Look · [Space] Jump · [LMB/J] Fight · [6/B] Bribe Rival · [E] Action · [1-5] Quick · [C] FPV
          </div>
        )}
      </div>
    </div>
  );
};
