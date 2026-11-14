import React, { useEffect, useRef } from 'react';
import { Map as MapIcon, MapPin, Navigation, Trash2, X } from 'lucide-react';
import {
  CHOWK_ROUNDABOUTS,
  CITY_BLOCK_CENTERS,
  CITY_LOCATIONS,
  CITY_ROAD_CENTERS,
  HudSnapshot,
} from '../types/game';

interface CityMapModalProps {
  hud: HudSnapshot;
  onSetWaypoint: (x: number, z: number, label: string) => void;
  onClearWaypoint: () => void;
  onClose: () => void;
}

export const CityMapModal: React.FC<CityMapModalProps> = ({
  hud,
  onSetWaypoint,
  onClearWaypoint,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const half = size / 2;
    const scale = (size - 32) / 680;

    ctx.fillStyle = '#0c111a';
    ctx.fillRect(0, 0, size, size);

    const toCanvas = (wx: number, wz: number): [number, number] => [
      half + wx * scale,
      half + wz * scale,
    ];

    // Road grid bands
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = Math.max(6, 16 * scale);
    for (const rc of CITY_ROAD_CENTERS) {
      const [rx] = toCanvas(rc, 0);
      ctx.beginPath();
      ctx.moveTo(rx, 16);
      ctx.lineTo(rx, size - 16);
      ctx.stroke();

      const [, ry] = toCanvas(0, rc);
      ctx.beginPath();
      ctx.moveTo(16, ry);
      ctx.lineTo(size - 16, ry);
      ctx.stroke();
    }

    // 100 City blocks (Downtown + Residential Colonies)
    for (const bx of CITY_BLOCK_CENTERS) {
      for (const bz of CITY_BLOCK_CENTERS) {
        const [cx, cy] = toCanvas(bx, bz);
        const bw = 42 * scale;
        const isColony = Math.abs(bx) >= 150 || Math.abs(bz) >= 150;
        ctx.fillStyle =
          bx === 30 && bz === -30
            ? '#2e2413'
            : bx === -30 && bz === -90
              ? '#0e282d'
              : bx === -30 && bz === 30
                ? '#2d161b'
                : bx === 30 && bz === 30
                  ? '#361f12'
                  : bx === 90 && bz === -30
                    ? '#362612'
                    : bx === -90 && bz === -30
                      ? '#102d24'
                      : bx === -30 && bz === -30
                        ? '#192b1d'
                        : bx === 90 && bz === 90
                          ? '#261a38'
                          : bx === -90 && bz === 90
                            ? '#241736'
                            : bx === -150 && bz === 150
                              ? '#29161a'
                              : isColony
                                ? '#161e2b'
                                : '#1b2230';
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 1;
        ctx.fillRect(cx - bw / 2, cy - bw / 2, bw, bw);
        ctx.strokeRect(cx - bw / 2, cy - bw / 2, bw, bw);
      }
    }

    // Road dashed centerlines
    ctx.strokeStyle = 'rgba(217, 155, 38, 0.32)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (const rc of CITY_ROAD_CENTERS) {
      const [rx] = toCanvas(rc, 0);
      ctx.beginPath();
      ctx.moveTo(rx, 16);
      ctx.lineTo(rx, size - 16);
      ctx.stroke();

      const [, ry] = toCanvas(0, rc);
      ctx.beginPath();
      ctx.moveTo(16, ry);
      ctx.lineTo(size - 16, ry);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Chowk roundabouts
    for (const chowk of CHOWK_ROUNDABOUTS) {
      const [rx, ry] = toCanvas(chowk.x, chowk.z);
      const rPx = Math.max(3.5, chowk.radius * scale);
      ctx.fillStyle = '#263347';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(rx, ry, rPx, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Active Mission GPS Route (Cyan)
    if (hud.mission.routePoints && hud.mission.routePoints.length >= 2) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      hud.mission.routePoints.forEach((pt, idx) => {
        const [rx, ry] = toCanvas(pt.x, pt.z);
        if (idx === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      });
      ctx.stroke();
      ctx.restore();
    }

    // Player Custom / Preset GPS Waypoint Route (Bright Amber)
    if (hud.waypoint?.active && hud.waypoint.routePoints.length >= 2) {
      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3.2;
      ctx.lineJoin = 'round';
      ctx.setLineDash([7, 4]);
      ctx.beginPath();
      hud.waypoint.routePoints.forEach((pt, idx) => {
        const [rx, ry] = toCanvas(pt.x, pt.z);
        if (idx === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // All Blips
    for (const b of hud.blips) {
      const [bx, by] = toCanvas(b.x, b.z);
      if (b.type === 'traffic_light') {
        const col =
          b.signalState === 'GREEN'
            ? '#22c55e'
            : b.signalState === 'YELLOW'
              ? '#facc15'
              : '#ef4444';
        ctx.fillStyle = '#0b0e14';
        ctx.fillRect(bx - 5, by - 5, 10, 10);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === 'gunshop') {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(bx - 7, by - 7, 14, 14);
        ctx.fillStyle = '#0b0e14';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('G', bx, by + 0.5);
      } else if (b.type === 'hospital') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(bx - 7, by - 7, 14, 14);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', bx, by + 0.5);
      } else if (b.type === 'bank') {
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(bx - 7, by - 7, 14, 14);
        ctx.fillStyle = '#0b0e14';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('B', bx, by + 0.5);
      } else if (b.type === 'atm') {
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(bx - 6, by - 6, 12, 12);
        ctx.fillStyle = '#0b0e14';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('₹', bx, by + 0.5);
      } else if (b.type === 'rescue_van') {
        ctx.fillStyle = '#10b981';
        ctx.fillRect(bx - 7, by - 7, 14, 14);
        ctx.fillStyle = '#0b0e14';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('V', bx, by + 0.5);
      } else if (b.type === 'mission_enemy') {
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (b.type === 'chai') {
        ctx.fillStyle = '#d97706';
        ctx.fillRect(bx - 6, by - 6, 12, 12);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('C', bx, by + 0.5);
      } else if (b.type === 'golgappa') {
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(bx - 6, by - 6, 12, 12);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('P', bx, by + 0.5);
      } else if (b.type === 'temple') {
        ctx.fillStyle = '#f97316';
        ctx.fillRect(bx - 7, by - 7, 14, 14);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ॐ', bx, by + 0.5);
      } else if (b.type === 'mosque') {
        ctx.fillStyle = '#059669';
        ctx.fillRect(bx - 7, by - 7, 14, 14);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☪', bx, by + 0.5);
      } else if (b.type === 'dm_office') {
        ctx.fillStyle = '#7c3aed';
        ctx.fillRect(bx - 7, by - 7, 14, 14);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('L', bx, by + 0.5);
      } else if (b.type === 'court') {
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(bx - 7, by - 7, 14, 14);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚖', bx, by + 0.5);
      } else if (b.type === 'jail') {
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.fillRect(bx - 7, by - 7, 14, 14);
        ctx.strokeRect(bx - 7, by - 7, 14, 14);
        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('J', bx, by + 0.5);
      } else if (b.type === 'chopper') {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx, by, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx - 6, by - 6);
        ctx.lineTo(bx + 6, by + 6);
        ctx.moveTo(bx + 6, by - 6);
        ctx.lineTo(bx - 6, by + 6);
        ctx.stroke();
      } else if (b.type === 'army') {
        ctx.fillStyle = '#4d7c0f';
        ctx.fillRect(bx - 4.5, by - 4.5, 9, 9);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx - 4.5, by - 4.5, 9, 9);
      } else if (b.type === 'dog') {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(bx, by, 3.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === 'traffic_cop') {
        ctx.fillStyle = '#a3e635';
        ctx.strokeStyle = '#0b0e14';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bx, by, 3.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (b.type === 'police_car') {
        ctx.fillStyle = hud.wantedLevel > 0 ? '#3b82f6' : '#64748b';
        ctx.fillRect(bx - 4, by - 4, 8, 8);
      } else if (b.type === 'police_officer') {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === 'vehicle') {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(bx - 3, by - 3, 6, 6);
      }
    }

    // Active GPS Waypoint Target Pin
    if (hud.waypoint?.active) {
      const [wx, wy] = toCanvas(hud.waypoint.x, hud.waypoint.z);
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(wx, wy, 11, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(wx, wy, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Player Marker
    const [px, py] = toCanvas(hud.playerX, hud.playerZ);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-hud.playerYaw);

    ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-16, -34);
    ctx.lineTo(16, -34);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#0b0e14';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(7, 8);
    ctx.lineTo(0, 4);
    ctx.lineTo(-7, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }, [hud]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const half = canvas.width / 2;
    const scale = (canvas.width - 32) / 680;
    const worldX = Math.max(-330, Math.min(330, Math.round((clickX - half) / scale)));
    const worldZ = Math.max(-330, Math.min(330, Math.round((clickY - half) / scale)));

    // Snap label to closest known preset if clicked nearby (~20m), otherwise Custom Pin
    const nearbyPreset = CITY_LOCATIONS.find(
      (loc) => Math.hypot(loc.x - worldX, loc.z - worldZ) < 20,
    );
    if (nearbyPreset) {
      onSetWaypoint(nearbyPreset.x, nearbyPreset.z, nearbyPreset.label);
    } else {
      onSetWaypoint(worldX, worldZ, `Pin (${worldX}, ${worldZ})`);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#070A10]/88 p-4 pointer-events-auto">
      <div className="w-full max-w-4xl bg-[#101520] border border-slate-700/90 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        <div className="flex items-center justify-between px-5 py-3 bg-[#0B0E14] border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <MapIcon className="w-4 h-4 text-amber-400" />
            <h2 className="font-display text-base font-bold tracking-wider text-slate-100">
              CITY GPS &amp; TACTICAL MAP
            </h2>
            <span className="text-[11px] font-mono-num text-slate-400">
              POS ({Math.round(hud.playerX)}, {Math.round(hud.playerZ)})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hud.waypoint?.active && (
              <button
                type="button"
                onClick={onClearWaypoint}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-xs font-mono-num text-red-200 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>CLEAR GPS</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono-num text-slate-200 cursor-pointer"
            >
              <span>CLOSE (M)</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-[1fr_250px] gap-4 bg-[#0D111A] overflow-y-auto">
          <div className="flex flex-col items-center gap-3">
            <canvas
              ref={canvasRef}
              width={520}
              height={520}
              onClick={handleCanvasClick}
              title="Click anywhere on map to set GPS waypoint"
              className="w-full max-w-[490px] aspect-square border border-slate-700/80 bg-[#0c111a] cursor-crosshair"
            />
            <div className="text-[11px] font-mono-num text-slate-400 text-center">
              Click anywhere on the map or choose a destination on the right to set your GPS route.
            </div>
          </div>

          {/* Quick Destinations & Active Waypoint Panel */}
          <div className="flex flex-col gap-3">
            <div className="p-3 bg-[#121826] border border-slate-700/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-display font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" /> ACTIVE GPS
                </span>
                {hud.waypoint?.active && (
                  <button
                    type="button"
                    onClick={onClearWaypoint}
                    className="text-[10px] font-mono-num text-red-300 hover:text-red-200 underline cursor-pointer"
                  >
                    Turn Off
                  </button>
                )}
              </div>
              {hud.waypoint?.active ? (
                <div className="text-xs text-slate-100 font-semibold">
                  <div>{hud.waypoint.label}</div>
                  <div className="text-[11px] font-mono-num text-sky-300 mt-0.5">
                    {hud.waypoint.distanceMeters}m away · Follow yellow GPS line
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400">No destination set.</div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="text-[11px] font-display font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400" /> CITY DESTINATIONS
              </div>
              <div className="flex flex-col gap-1.5 max-h-[340px] overflow-y-auto pr-1">
                {CITY_LOCATIONS.map((loc) => {
                  const selected = hud.waypoint?.label === loc.label;
                  const dist = Math.round(Math.hypot(loc.x - hud.playerX, loc.z - hud.playerZ));
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => onSetWaypoint(loc.x, loc.z, loc.label)}
                      className={`flex items-center justify-between gap-2 px-2.5 py-2 border text-left transition-colors cursor-pointer ${
                        selected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-[#121826] hover:bg-[#192235] border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 shrink-0 flex items-center justify-center text-[10px] font-bold ${
                            loc.id === 'dm-office' || loc.id === 'district-court'
                              ? 'bg-purple-600 text-white'
                              : loc.id === 'central-jail'
                                ? 'bg-red-700 text-white'
                                : loc.category === 'sacred'
                                  ? loc.id === 'noor-masjid'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-orange-500 text-white'
                                  : loc.category === 'service'
                                    ? 'bg-sky-500 text-[#0B0E14]'
                                    : 'bg-amber-500 text-[#0B0E14]'
                          }`}
                        >
                          {loc.badge}
                        </span>
                        <span className="text-xs font-medium truncate">{loc.label}</span>
                      </div>
                      <span className="text-[10px] font-mono-num text-slate-400 shrink-0">
                        {dist}m
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
