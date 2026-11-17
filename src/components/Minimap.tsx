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
  inVehicle?: boolean;
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
  inVehicle = false,
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
    const scale = inVehicle ? 1.08 : 1.28; // Slightly wider zoom when driving for earlier turn awareness

    // When seated inside a vehicle, activate Heading-Up Satnav rotation (+playerYaw)
    // so left/right turns rotate the world around the car's nose.
    const mapRot = inVehicle ? playerYaw : 0;
    const cosR = Math.cos(mapRot);
    const sinR = Math.sin(mapRot);

    // Helper: world (x, z) -> canvas (cx, cy)
    const toCanvas = (wx: number, wz: number): [number, number] => {
      const dx = (wx - playerX) * scale;
      const dz = (wz - playerZ) * scale;
      return [
        half + (dx * cosR - dz * sinR),
        half + (dx * sinR + dz * cosR),
      ];
    };

    // Deep tactical asphalt background
    ctx.fillStyle = '#0f141e';
    ctx.fillRect(0, 0, size, size);

    // Rotated layer for grid blocks, roads, chowks, and GPS routes
    ctx.save();
    if (mapRot !== 0) {
      ctx.translate(half, half);
      ctx.rotate(mapRot);
      ctx.translate(-half, -half);
    }

    const toLocal = (wx: number, wz: number): [number, number] => [
      half + (wx - playerX) * scale,
      half + (wz - playerZ) * scale,
    ];

    const cullBound = size * 0.88; // Generous cull radius for rotated view

    // City blocks
    ctx.strokeStyle = '#293347';
    ctx.lineWidth = 1;
    for (const bx of CITY_BLOCK_CENTERS) {
      for (const bz of CITY_BLOCK_CENTERS) {
        const [cx, cy] = toLocal(bx, bz);
        const bw = 42 * scale;
        if (
          cx + bw / 2 < half - cullBound ||
          cx - bw / 2 > half + cullBound ||
          cy + bw / 2 < half - cullBound ||
          cy - bw / 2 > half + cullBound
        ) {
          continue;
        }
        const isColony = Math.abs(bx) >= 150 || Math.abs(bz) >= 150;
        let fill = isColony ? '#17202e' : '#1b2230';
        let stroke = '#293347';
        if (bx === -150 && bz === 150) {
          fill = '#2a1820';
          stroke = '#ef4444';
        } else if (bx === -30 && bz === 30) {
          fill = '#2d1822';
          stroke = '#f43f5e';
        } else if (bx === -30 && bz === -90) {
          fill = '#132d38';
          stroke = '#0ea5e9';
        } else if (bx === 30 && bz === -30) {
          fill = '#2c2214';
          stroke = '#f59e0b';
        } else if (bx === 30 && bz === 90) {
          fill = '#2b2415';
          stroke = '#fbbf24';
        } else if (bx === -90 && bz === 90) {
          fill = '#251a3a';
          stroke = '#a855f7';
        } else if (bx === -90 && bz === -30) {
          fill = '#122e26';
          stroke = '#10b981';
        } else if (bx === 30 && bz === 30) {
          fill = '#2e1d12';
          stroke = '#f97316';
        }
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.fillRect(cx - bw / 2, cy - bw / 2, bw, bw);
        ctx.strokeRect(cx - bw / 2, cy - bw / 2, bw, bw);
      }
    }

    // Road centerlines
    ctx.strokeStyle = 'rgba(217, 155, 38, 0.28)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (const rc of CITY_ROAD_CENTERS) {
      const [rx] = toLocal(rc, 0);
      if (rx >= half - cullBound && rx <= half + cullBound) {
        ctx.beginPath();
        ctx.moveTo(rx, half - cullBound);
        ctx.lineTo(rx, half + cullBound);
        ctx.stroke();
      }

      const [, ry] = toLocal(0, rc);
      if (ry >= half - cullBound && ry <= half + cullBound) {
        ctx.beginPath();
        ctx.moveTo(half - cullBound, ry);
        ctx.lineTo(half + cullBound, ry);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    // Chowk roundabouts
    for (const chowk of CHOWK_ROUNDABOUTS) {
      const [rx, ry] = toLocal(chowk.x, chowk.z);
      const rPx = Math.max(3, chowk.radius * scale);
      if (
        rx + rPx < half - cullBound ||
        rx - rPx > half + cullBound ||
        ry + rPx < half - cullBound ||
        ry - rPx > half + cullBound
      ) {
        continue;
      }
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
        const [rx, ry] = toLocal(pt.x, pt.z);
        if (idx === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      });
      ctx.stroke();
      ctx.restore();
    }

    // Active Custom/Preset GPS Waypoint Polyline (Glowing Amber Halo + Dashed Core)
    if (waypoint?.active && waypoint.routePoints.length >= 2) {
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.34)';
      ctx.lineWidth = 6.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      waypoint.routePoints.forEach((pt, idx) => {
        const [rx, ry] = toLocal(pt.x, pt.z);
        if (idx === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      });
      ctx.stroke();

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.6;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      waypoint.routePoints.forEach((pt, idx) => {
        const [rx, ry] = toLocal(pt.x, pt.z);
        if (idx === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    ctx.restore(); // End rotated ground layer — blips & arrows below render upright!

    // Blips (drawn upright at rotated screen coordinates)
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
        ctx.fillRect(bx - 3.5, by - 3.5, 7, 7);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(bx, by, 2.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === 'gunshop') {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(bx - 5.5, by - 5.5, 11, 11);
        ctx.fillStyle = '#0b0e14';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('G', bx, by + 0.5);
      } else if (b.type === 'hospital') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(bx - 5.5, by - 5.5, 11, 11);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', bx, by + 0.5);
      } else if (b.type === 'bank') {
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(bx - 5.5, by - 5.5, 11, 11);
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
        ctx.fillRect(bx - 5.5, by - 5.5, 11, 11);
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
        ctx.fillRect(bx - 5.5, by - 5.5, 11, 11);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ॐ', bx, by + 0.5);
      } else if (b.type === 'mosque') {
        ctx.fillStyle = '#059669';
        ctx.fillRect(bx - 5.5, by - 5.5, 11, 11);
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
        ctx.fillRect(bx - 5.5, by - 5.5, 11, 11);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('L', bx, by + 0.5);
      } else if (b.type === 'court') {
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(bx - 5.5, by - 5.5, 11, 11);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚖', bx, by + 0.5);
      } else if (b.type === 'jail') {
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.2;
        ctx.fillRect(bx - 5.5, by - 5.5, 11, 11);
        ctx.strokeRect(bx - 5.5, by - 5.5, 11, 11);
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
        ctx.fillRect(bx - 2.3, by - 2.3, 4.6, 4.6);
      } else if (b.type === 'enforcer') {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(203, 213, 225, 0.42)';
        ctx.beginPath();
        ctx.arc(bx, by, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Waypoint destination marker (clamped cleanly to radar border with directional arrow if distant)
    if (waypoint?.active) {
      const [wxRaw, wyRaw] = toCanvas(waypoint.x, waypoint.z);
      const margin = 12;
      const offScreen =
        wxRaw < margin || wxRaw > size - margin || wyRaw < margin || wyRaw > size - margin;
      const dx = wxRaw - half;
      const dy = wyRaw - half;
      const edgeScale = offScreen
        ? (half - margin) / Math.max(Math.abs(dx), Math.abs(dy), 1)
        : 1;
      const wx = offScreen ? half + dx * edgeScale : wxRaw;
      const wy = offScreen ? half + dy * edgeScale : wyRaw;

      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(wx, wy, 7.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#0b0e14';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(wx, wy, 4.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (offScreen) {
        const ang = Math.atan2(dy, dx);
        ctx.translate(wx, wy);
        ctx.rotate(ang);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(11, 0);
        ctx.lineTo(5, -3.5);
        ctx.lineTo(5, 3.5);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Dynamic Compass North Indicator inside canvas when in Heading-Up Vehicle Mode
    if (inVehicle) {
      const rEdge = half - 14;
      const nx = half + Math.sin(playerYaw) * rEdge;
      const ny = half - Math.cos(playerYaw) * rEdge;
      ctx.save();
      ctx.fillStyle = 'rgba(11, 14, 20, 0.88)';
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(nx, ny, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('N', nx, ny + 0.5);
      ctx.restore();
    }

    // Player / Vehicle directional arrow at center:
    // Points straight UP in vehicle Heading-Up mode, or rotates by -playerYaw on foot.
    ctx.save();
    ctx.translate(half, half);
    if (!inVehicle) {
      ctx.rotate(-playerYaw);
    }

    ctx.fillStyle = inVehicle ? 'rgba(56, 189, 248, 0.18)' : 'rgba(245, 158, 11, 0.14)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-15, -34);
    ctx.lineTo(15, -34);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = inVehicle ? '#38bdf8' : '#f59e0b';
    ctx.strokeStyle = '#0b0e14';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(6.8, 7);
    ctx.lineTo(0, 3.5);
    ctx.lineTo(-6.8, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }, [playerX, playerZ, playerYaw, inVehicle, wantedLevel, blips, routePoints, waypoint]);

  return (
    <button
      type="button"
      onClick={onExpand}
      title="Open Full City Map (M)"
      className="relative w-[clamp(78px,min(23vw,24vh),160px)] h-[clamp(78px,min(23vw,24vh),160px)] rounded-xl bg-[rgba(14,17,24,0.65)] border border-white/[0.16] hover:border-amber-400/70 shadow-xl overflow-hidden pointer-events-auto cursor-pointer text-left block transition-colors"
    >
      <canvas ref={canvasRef} width={176} height={176} className="block w-full h-full opacity-95" />
      {!inVehicle && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 px-1.5 rounded bg-black/50 text-[clamp(8px,1.6vw,10px)] font-display font-bold tracking-wider text-[#FBBF24] hud-text-shadow">
          N
        </div>
      )}
      {inVehicle && (
        <div className="absolute top-1 left-1 px-1.5 rounded bg-sky-950/85 border border-sky-400/40 text-[clamp(7px,1.4vw,8.5px)] font-mono-num font-bold tracking-wider text-sky-300 hud-text-shadow">
          SATNAV
        </div>
      )}
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
