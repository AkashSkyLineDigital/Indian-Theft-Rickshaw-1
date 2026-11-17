import React, { useEffect, useRef } from 'react';
import {
  CHOWK_ROUNDABOUTS,
  CITY_BLOCK_CENTERS,
  CITY_ROAD_CENTERS,
  MinimapBlip,
  WaypointHudState,
} from '../types/game';

interface MinimapProps {
  playerX: number;
  playerZ: number;
  playerYaw: number;
  wantedLevel: number;
  blips: MinimapBlip[];
  routePoints?: { x: number; z: number }[];
  waypoint?: WaypointHudState | null;
  onExpand?: () => void;
}

export const Minimap: React.FC<MinimapProps> = React.memo(({
  playerX,
  playerZ,
  playerYaw,
  wantedLevel,
  blips,
  routePoints,
  waypoint,
  onExpand,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const half = size / 2;
    const scale = 1.25; // pixels per world meter

    // Deep tactical asphalt background
    ctx.fillStyle = '#0f141e';
    ctx.fillRect(0, 0, size, size);

    // Helper: world (x, z) -> canvas (cx, cy) with North (-Z) UP and East (+X) RIGHT
    const toCanvas = (wx: number, wz: number): [number, number] => [
      half + (wx - playerX) * scale,
      half + (wz - playerZ) * scale,
    ];

    // City blocks (downtown & outer residential colonies)
    ctx.strokeStyle = '#293347';
    ctx.lineWidth = 1;
    for (const bx of CITY_BLOCK_CENTERS) {
      for (const bz of CITY_BLOCK_CENTERS) {
        const [cx, cy] = toCanvas(bx, bz);
        const bw = 42 * scale;
        if (cx + bw / 2 < -4 || cx - bw / 2 > size + 4 || cy + bw / 2 < -4 || cy - bw / 2 > size + 4) {
          continue;
        }
        const isColony = Math.abs(bx) >= 150 || Math.abs(bz) >= 150;
        ctx.fillStyle = isColony ? '#17202e' : '#1b2230';
        ctx.fillRect(cx - bw / 2, cy - bw / 2, bw, bw);
        ctx.strokeRect(cx - bw / 2, cy - bw / 2, bw, bw);
      }
    }

    // Road centerlines
    ctx.strokeStyle = 'rgba(217, 155, 38, 0.28)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (const rc of CITY_ROAD_CENTERS) {
      const [rx] = toCanvas(rc, 0);
      if (rx >= -4 && rx <= size + 4) {
        ctx.beginPath();
        ctx.moveTo(rx, 0);
        ctx.lineTo(rx, size);
        ctx.stroke();
      }

      const [, ry] = toCanvas(0, rc);
      if (ry >= -4 && ry <= size + 4) {
        ctx.beginPath();
        ctx.moveTo(0, ry);
        ctx.lineTo(size, ry);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    // Chowk roundabouts
    for (const chowk of CHOWK_ROUNDABOUTS) {
      const [rx, ry] = toCanvas(chowk.x, chowk.z);
      const rPx = Math.max(3, chowk.radius * scale);
      if (rx + rPx < -4 || rx - rPx > size + 4 || ry + rPx < -4 || ry - rPx > size + 4) continue;
      ctx.fillStyle = '#243042';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(rx, ry, rPx, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Active Mission GPS Route Polyline
    if (routePoints && routePoints.length >= 2) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      routePoints.forEach((pt, idx) => {
        const [rx, ry] = toCanvas(pt.x, pt.z);
        if (idx === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      });
      ctx.stroke();
      ctx.restore();
    }

    // Active Custom/Preset GPS Waypoint Polyline (Glowing Amber Halo + Dashed Core)
    if (waypoint?.active && waypoint.routePoints.length >= 2) {
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.30)';
      ctx.lineWidth = 6.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      waypoint.routePoints.forEach((pt, idx) => {
        const [rx, ry] = toCanvas(pt.x, pt.z);
        if (idx === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      });
      ctx.stroke();

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.6;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      waypoint.routePoints.forEach((pt, idx) => {
        const [rx, ry] = toCanvas(pt.x, pt.z);
        if (idx === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Blips
    for (const b of blips) {
      const [bx, by] = toCanvas(b.x, b.z);
      if (bx < -10 || bx > size + 10 || by < -10 || by > size + 10) continue;

      if (b.type === 'traffic_light') {
        const col =
          b.signalState === 'GREEN'
            ? '#22c55e'
            : b.signalState === 'YELLOW'
              ? '#facc15'
              : '#ef4444';
        ctx.fillStyle = '#0b0e14';
        ctx.fillRect(bx - 4, by - 4, 8, 8);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(bx, by, 2.7, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === 'gunshop') {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(bx - 5, by - 5, 10, 10);
        ctx.fillStyle = '#0b0e14';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('G', bx, by + 0.5);
      } else if (b.type === 'hospital') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(bx - 5, by - 5, 10, 10);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', bx, by + 0.5);
      } else if (b.type === 'bank') {
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(bx - 5, by - 5, 10, 10);
        ctx.fillStyle = '#0b0e14';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('B', bx, by + 0.5);
      } else if (b.type === 'atm') {
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(bx - 4.5, by - 4.5, 9, 9);
        ctx.fillStyle = '#0b0e14';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('₹', bx, by + 0.5);
      } else if (b.type === 'rescue_van') {
        ctx.fillStyle = '#10b981';
        ctx.fillRect(bx - 5, by - 5, 10, 10);
        ctx.fillStyle = '#0b0e14';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('V', bx, by + 0.5);
      } else if (b.type === 'mission_enemy') {
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bx, by, 3.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (b.type === 'chai') {
        ctx.fillStyle = '#d97706';
        ctx.fillRect(bx - 4.5, by - 4.5, 9, 9);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('C', bx, by + 0.5);
      } else if (b.type === 'golgappa') {
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(bx - 4.5, by - 4.5, 9, 9);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('P', bx, by + 0.5);
      } else if (b.type === 'temple') {
        ctx.fillStyle = '#f97316';
        ctx.fillRect(bx - 5, by - 5, 10, 10);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ॐ', bx, by + 0.5);
      } else if (b.type === 'mosque') {
        ctx.fillStyle = '#059669';
        ctx.fillRect(bx - 5, by - 5, 10, 10);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☪', bx, by + 0.5);
      } else if (b.type === 'home') {
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 1.2;
        ctx.fillRect(bx - 6, by - 6, 12, 12);
        ctx.strokeRect(bx - 6, by - 6, 12, 12);
        ctx.fillStyle = '#0b0e14';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('H', bx, by + 0.5);
      } else if (b.type === 'dog') {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(bx, by, 2.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === 'dm_office') {
        ctx.fillStyle = '#7c3aed';
        ctx.fillRect(bx - 5, by - 5, 10, 10);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('L', bx, by + 0.5);
      } else if (b.type === 'court') {
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(bx - 5, by - 5, 10, 10);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚖', bx, by + 0.5);
      } else if (b.type === 'jail') {
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.2;
        ctx.fillRect(bx - 5, by - 5, 10, 10);
        ctx.strokeRect(bx - 5, by - 5, 10, 10);
        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('J', bx, by + 0.5);
      } else if (b.type === 'chopper') {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx - 5, by - 5);
        ctx.lineTo(bx + 5, by + 5);
        ctx.moveTo(bx + 5, by - 5);
        ctx.lineTo(bx - 5, by + 5);
        ctx.stroke();
      } else if (b.type === 'army') {
        ctx.fillStyle = '#4d7c0f';
        ctx.fillRect(bx - 3.5, by - 3.5, 7, 7);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx - 3.5, by - 3.5, 7, 7);
      } else if (b.type === 'pickup') {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === 'police_car') {
        ctx.fillStyle = wantedLevel > 0 ? '#3b82f6' : '#64748b';
        ctx.fillRect(bx - 3.5, by - 3.5, 7, 7);
        if (wantedLevel > 0) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(bx - 4.5, by - 4.5, 9, 9);
        }
      } else if (b.type === 'traffic_cop') {
        ctx.fillStyle = '#a3e635';
        ctx.strokeStyle = '#0b0e14';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bx, by, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (b.type === 'police_officer') {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === 'vehicle') {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(bx - 2.5, by - 2.5, 5, 5);
      } else if (b.type === 'enforcer') {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(203, 213, 225, 0.5)';
        ctx.beginPath();
        ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Waypoint destination marker (clamped to radar edge with glow ring if distant)
    if (waypoint?.active) {
      const [wxRaw, wyRaw] = toCanvas(waypoint.x, waypoint.z);
      const wx = Math.max(10, Math.min(size - 10, wxRaw));
      const wy = Math.max(10, Math.min(size - 10, wyRaw));
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(wx, wy, 7.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#0b0e14';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(wx, wy, 4.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Player directional arrow at center.
    ctx.save();
    ctx.translate(half, half);
    ctx.rotate(-playerYaw);

    ctx.fillStyle = 'rgba(245, 158, 11, 0.14)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-14, -32);
    ctx.lineTo(14, -32);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#0b0e14';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6.5, 7);
    ctx.lineTo(0, 3.5);
    ctx.lineTo(-6.5, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }, [playerX, playerZ, playerYaw, wantedLevel, blips, routePoints, waypoint]);

  return (
    <button
      type="button"
      onClick={onExpand}
      title="Open Full City Map (M)"
      className="relative w-[clamp(74px,min(22vw,24vh),156px)] h-[clamp(74px,min(22vw,24vh),156px)] rounded-xl bg-[rgba(14,17,24,0.65)] border border-white/[0.16] hover:border-amber-400/70 shadow-xl overflow-hidden pointer-events-auto cursor-pointer text-left block transition-colors"
    >
      <canvas ref={canvasRef} width={176} height={176} className="block w-full h-full opacity-95" />
      <div className="absolute top-1 left-1/2 -translate-x-1/2 px-1.5 rounded bg-black/50 text-[clamp(8px,1.6vw,10px)] font-display font-bold tracking-wider text-[#FBBF24] hud-text-shadow">
        N
      </div>
      <div className="absolute top-1 right-1 px-1.5 rounded bg-black/50 text-[clamp(7px,1.5vw,9px)] font-mono-num font-bold text-[#38BDF8] hud-text-shadow">
        MAP
      </div>
      <div className="hidden sm:flex absolute bottom-1 left-2 right-2 items-center justify-between text-[9px] font-mono-num text-slate-300/85 pointer-events-none hud-text-shadow">
        <span>H:Home</span>
        <span>G:Gun</span>
        <span>B:Bank</span>
        <span>+:Med</span>
      </div>
    </button>
  );
});
