import React, { useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Banknote,
  Clock,
  Hammer,
  KeyRound,
  Landmark,
  Settings,
  ShieldAlert,
  ShieldCheck,
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
  timeOfDay: TimeOfDayHud;
  toasts: FloatingToast[];
  worldLabels: WorldLabelHud[];
  isTouchHud: boolean;
  onSkipSentence: () => void;
  onPerformWork: () => void;
  onBribeWarden: (source: 'cash' | 'bank') => void;
  onStartPrisonBreak: () => void;
  onOpenSettings: () => void;
}

const JAIL_CX = -150;
const JAIL_CZ = 150;

export const JailHudOverlay: React.FC<JailHudOverlayProps> = ({
  jail,
  cash,
  bankSavings,
  timeOfDay,
  toasts,
  worldLabels,
  isTouchHud,
  onSkipSentence,
  onPerformWork,
  onBribeWarden,
  onStartPrisonBreak,
  onOpenSettings,
}) => {
  const mapRef = useRef<HTMLCanvasElement | null>(null);
  const canBribeCash = cash >= jail.wardenBribeCost;
  const canBribeBank = bankSavings >= jail.wardenBribeCost;
  const busy = jail.activeTaskKind !== 'NONE';
  const atEastGate = jail.nearStation === 'ESCAPE_GATE';

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
    ctx.fillStyle = '#182232';
    ctx.fillRect(x0, z0, x1 - x0, z1 - z0);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x0, z0, x1 - x0, z1 - z0);

    // 4 Stations: Bunk (Blue), Workshop (Green), Warden (Amber), East Gate (Red)
    const stations: { wx: number; wz: number; color: string; label: string }[] = [
      { wx: JAIL_CX - 11.2, wz: JAIL_CZ, color: '#38bdf8', label: '1' },
      { wx: JAIL_CX - 6.5, wz: JAIL_CZ + 9.4, color: '#10b981', label: '2' },
      { wx: JAIL_CX, wz: JAIL_CZ - 12.2, color: '#f59e0b', label: '3' },
      { wx: JAIL_CX + 18.2, wz: JAIL_CZ, color: '#ef4444', label: '4' },
    ];
    for (const s of stations) {
      const [sx, sy] = toPt(s.wx, s.wz);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(sx, sy, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0b0e14';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.label, sx, sy + 0.5);
    }

    // Patrolling guards & live vision cones
    for (const g of jail.guards) {
      const [gx, gy] = toPt(g.x, g.z);
      const coneLen = 7.8 * scale;
      const fwdAngle = Math.atan2(-Math.sin(g.yaw), -Math.cos(g.yaw));
      const canvasAngle = fwdAngle - Math.PI / 2;

      ctx.save();
      ctx.fillStyle = g.alerted ? 'rgba(239, 68, 68, 0.36)' : 'rgba(254, 240, 138, 0.28)';
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.arc(gx, gy, coneLen, canvasAngle - Math.PI / 5, canvasAngle + Math.PI / 5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#0b0e14';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(gx, gy, 3.8, 0, Math.PI * 2);
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
  }, [jail]);

  const handleLabelClick = (station?: 'BUNK' | 'WORKSHOP' | 'WARDEN' | 'ESCAPE_GATE') => {
    if (station === 'BUNK') onSkipSentence();
    else if (station === 'WORKSHOP') onPerformWork();
    else if (station === 'ESCAPE_GATE') onStartPrisonBreak();
    else if (station === 'WARDEN') {
      if (canBribeCash) onBribeWarden('cash');
      else onBribeWarden('bank');
    }
  };

  const stationPrompt =
    jail.nearStation === 'BUNK'
      ? '[E] Cell Bunk — Skip Remaining Sentence (+Bank Interest & 0★ Release)'
      : jail.nearStation === 'WORKSHOP'
        ? `[E] Jail Workshop — Start Shift (+${formatRs(JAIL_WORK_WAGE_INR)} & Cut 50% Sentence)`
        : jail.nearStation === 'WARDEN'
          ? `[E] Jailer Mahendra — Bribe ${formatRs(jail.wardenBribeCost)} for 23:30 Night Exit`
          : jail.nearStation === 'ESCAPE_GATE'
            ? '[E] Weak East Gate — Pick Lock Now! (Watch Guard Vision Cone!)'
            : null;

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-3 sm:p-4 overflow-hidden">
      {/* 3D World Floating Station Labels */}
      {worldLabels.map((lbl) => (
        <button
          key={lbl.id}
          type="button"
          onClick={() => handleLabelClick(lbl.jailStation)}
          style={{
            transform: `translate3d(${lbl.screenX}px, ${lbl.screenY}px, 0) translate(-50%, -100%)`,
          }}
          className={`absolute top-0 left-0 pointer-events-auto px-2 py-1 bg-[#0B0E14]/92 hover:bg-[#171E2C] border text-center shadow-lg cursor-pointer ${
            lbl.jailStation === 'BUNK'
              ? 'border-sky-400/80 text-sky-200'
              : lbl.jailStation === 'WORKSHOP'
                ? 'border-emerald-400/80 text-emerald-200'
                : lbl.jailStation === 'WARDEN'
                  ? 'border-amber-400/80 text-amber-200'
                  : 'border-red-400/85 text-red-200'
          }`}
        >
          <div className="text-[10px] font-display font-bold leading-tight">{lbl.title}</div>
          <div className="text-[9px] font-mono-num opacity-90">{lbl.subtitle}</div>
        </button>
      ))}

      {/* Top Row: Left Sentence + Tactical Yard Map & Right 4 Exit Options */}
      <div className="flex items-start justify-between gap-3">
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
              {/* Mini Jail Yard Radar */}
              <div className="shrink-0 flex flex-col items-center gap-1">
                <canvas
                  ref={mapRef}
                  width={116}
                  height={116}
                  className="border border-slate-700 bg-[#090d14]"
                />
                <span className="text-[9px] font-mono-num text-slate-400">
                  1:Bunk 2:Work 3:Bribe 4:Gate
                </span>
              </div>

              {/* Sentence & Balance Metrics */}
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

            {jail.spottedByGuard && (
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-red-950/95 border border-red-500 text-[11px] font-mono-num font-bold text-red-200 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>GUARD CONE WATCHING EAST GATE! Wait for yellow cone to turn!</span>
              </div>
            )}

            {busy && (
              <div className="flex flex-col gap-1 bg-[#121826] border border-amber-500/60 p-2">
                <div className="flex items-center justify-between text-[11px] font-mono-num text-amber-200 font-bold">
                  <span>
                    {jail.activeTaskKind === 'WORK'
                      ? 'Workshop Shift in Progress...'
                      : 'Picking East Gate Lock...'}
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

        {/* Top-Right Controls & 4 Clear Exit Paths */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0B0E14]/94 hover:bg-slate-800 border border-slate-700 text-xs font-mono-num text-slate-200 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>MENU (ESC)</span>
          </button>

          <div className="w-64 sm:w-72 bg-[#0B0E14]/94 border border-slate-700/90 shadow-xl p-2.5 flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <span className="text-[10px] font-display font-bold tracking-wider text-slate-200 uppercase">
                How To Exit Jail (Keys 1–4)
              </span>
              <span className="text-[9px] font-mono-num text-slate-400">Drag screen to look</span>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={onSkipSentence}
              className="flex items-center justify-between gap-2 px-2.5 py-2 bg-sky-900/75 hover:bg-sky-800 border border-sky-500/60 text-left text-xs text-sky-100 cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                <div>
                  <div className="font-bold">[1] Skip Sentence (Cell Bunk)</div>
                  <div className="text-[10px] text-sky-300">Fast-forward days + Bank Interest · 0★</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={onPerformWork}
              className="flex items-center justify-between gap-2 px-2.5 py-2 bg-emerald-900/75 hover:bg-emerald-800 border border-emerald-500/60 text-left text-xs text-emerald-100 cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <Hammer className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <div>
                  <div className="font-bold">[2] Workshop Kaam ({jail.workCount} done)</div>
                  <div className="text-[10px] text-emerald-300">
                    +{formatRs(JAIL_WORK_WAGE_INR)} cash &amp; cuts sentence 50%
                  </div>
                </div>
              </div>
            </button>

            <div className="bg-amber-950/55 border border-amber-500/50 p-2 flex flex-col gap-1.5">
              <div className="text-[11px] font-bold text-amber-200 flex items-center justify-between">
                <span>[3] Bribe Jailer Mahendra</span>
                <span className="font-mono-num text-amber-300">{formatRs(jail.wardenBribeCost)}</span>
              </div>
              <div className="text-[10px] text-amber-300/90">
                23:30 Night North Gate exit · 35% chance of 2★
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  disabled={busy || !canBribeCash}
                  onClick={() => onBribeWarden('cash')}
                  className={`flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold uppercase cursor-pointer ${
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
                  onClick={() => onBribeWarden('bank')}
                  className={`flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold uppercase cursor-pointer ${
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

            <button
              type="button"
              disabled={busy}
              onClick={onStartPrisonBreak}
              className={`flex items-center justify-between gap-2 px-2.5 py-2 border text-left text-xs cursor-pointer disabled:opacity-50 ${
                atEastGate
                  ? 'bg-red-700 hover:bg-red-600 border-red-300 text-white animate-pulse'
                  : 'bg-red-950/85 hover:bg-red-900 border-red-500/70 text-red-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-red-300 shrink-0" />
                <div>
                  <div className="font-bold">
                    {atEastGate ? '[4] PICK EAST GATE LOCK NOW!' : '[4] Prison Break (East Gate)'}
                  </div>
                  <div className="text-[10px] text-red-200">
                    {atEastGate
                      ? 'Hold 3.0s while guard cone is away -> 3★!'
                      : 'Walk to Red Dot (4) on map, then press E'}
                  </div>
                </div>
              </div>
              <ShieldAlert className="w-3.5 h-3.5 text-red-300 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Prompt & Controls Strip */}
      <div className="flex flex-col items-center gap-2">
        {stationPrompt && (
          <div className="px-4 py-2 bg-[#0B0E14]/95 border-2 border-amber-400 text-xs sm:text-sm font-mono-num font-bold text-amber-200 shadow-lg">
            {stationPrompt}
          </div>
        )}
        {!isTouchHud && (
          <div className="px-3 py-1 bg-[#0B0E14]/90 border border-slate-700/80 text-[11px] font-mono-num text-slate-300">
            WASD Walk · Hold Left-Click + Drag (or ←/→) to Look · [E] Station Action · Keys [1-4] Quick Options · [C] First Person
          </div>
        )}
      </div>
    </div>
  );
};
