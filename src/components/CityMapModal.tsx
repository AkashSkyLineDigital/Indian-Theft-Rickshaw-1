import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Compass,
  Crosshair,
  Map as MapIcon,
  MapPin,
  Navigation,
  RotateCcw,
  RotateCw,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
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

interface ProjectedPoint {
  sx: number;
  sy: number;
  depth: number;
}

function getBlockMeta(bx: number, bz: number): {
  fillTop: string;
  fillSideA: string;
  fillSideB: string;
  heightM: number;
  accent?: string;
} {
  const isColony = Math.abs(bx) >= 150 || Math.abs(bz) >= 150;
  // Deterministic urban variation for realistic 3D skyline silhouette
  const hash = Math.abs(Math.sin(bx * 0.13 + bz * 0.29));
  const baseH = isColony ? 8 + hash * 8 : 13 + hash * 15;

  if (bx === 30 && bz === -30) {
    return { fillTop: '#453418', fillSideA: '#2d210f', fillSideB: '#21180a', heightM: 18, accent: '#f59e0b' };
  }
  if (bx === -30 && bz === -90) {
    return { fillTop: '#133a42', fillSideA: '#0b252b', fillSideB: '#071b20', heightM: 28, accent: '#0ea5e9' };
  }
  if (bx === -30 && bz === 30) {
    return { fillTop: '#451d25', fillSideA: '#2d1218', fillSideB: '#200c11', heightM: 24, accent: '#ef4444' };
  }
  if (bx === 30 && bz === 30) {
    return { fillTop: '#4d2c16', fillSideA: '#331d0e', fillSideB: '#26150a', heightM: 22, accent: '#f97316' };
  }
  if (bx === 90 && bz === -30) {
    return { fillTop: '#4f3817', fillSideA: '#35250e', fillSideB: '#261b09', heightM: 22, accent: '#fb923c' };
  }
  if (bx === -90 && bz === -30) {
    return { fillTop: '#143d30', fillSideA: '#0c2920', fillSideB: '#081d17', heightM: 22, accent: '#10b981' };
  }
  if (bx === -90 && bz === 90) {
    return { fillTop: '#33204d', fillSideA: '#211433', fillSideB: '#180f26', heightM: 26, accent: '#a855f7' };
  }
  if (bx === -150 && bz === 150) {
    return { fillTop: '#3c1d22', fillSideA: '#271216', fillSideB: '#1c0c0f', heightM: 20, accent: '#f87171' };
  }
  if (bx === 30 && bz === 90) {
    return { fillTop: '#433314', fillSideA: '#2c210c', fillSideB: '#1f1708', heightM: 16, accent: '#fbbf24' };
  }
  if (isColony) {
    return { fillTop: '#1d2838', fillSideA: '#131b27', fillSideB: '#0e141e', heightM: baseH };
  }
  return { fillTop: '#232e42', fillSideA: '#161e2c', fillSideB: '#101723', heightM: baseH };
}

export const CityMapModal: React.FC<CityMapModalProps> = ({
  hud,
  onSetWaypoint,
  onClearWaypoint,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [view3D, setView3D] = useState(true);
  const [zoom, setZoom] = useState(1.18);
  const [pan, setPan] = useState<{ x: number; z: number }>(() => ({
    x: Math.max(-240, Math.min(240, hud.playerX * 0.45)),
    z: Math.max(-240, Math.min(240, hud.playerZ * 0.45)),
  }));
  const [rotationDeg, setRotationDeg] = useState(-22);
  const [pulsePhase, setPulsePhase] = useState(0);

  const dragRef = useRef<{
    active: boolean;
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    movedPx: number;
  }>({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    movedPx: 0,
  });

  // Gentle animation pulse for 3D waypoint beacon & GPS route chevrons
  useEffect(() => {
    let raf = 0;
    const tick = (t: number) => {
      setPulsePhase((t * 0.003) % (Math.PI * 2));
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  const transformParams = useMemo(() => {
    const theta = (rotationDeg * Math.PI) / 180;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const tiltY = view3D ? 0.64 : 1.0;
    const elevScale = view3D ? 0.72 : 0;
    return { cosT, sinT, tiltY, elevScale };
  }, [rotationDeg, view3D]);

  const projectPoint = useCallback(
    (wx: number, wz: number, elevM = 0, size = 560): ProjectedPoint => {
      const half = size / 2;
      const scale = ((size - 40) / 680) * zoom;
      const dx = wx - pan.x;
      const dz = wz - pan.z;
      const rx = dx * transformParams.cosT - dz * transformParams.sinT;
      const rz = dx * transformParams.sinT + dz * transformParams.cosT;
      return {
        sx: half + rx * scale,
        sy: half + rz * scale * transformParams.tiltY - elevM * scale * transformParams.elevScale,
        depth: rz,
      };
    },
    [pan.x, pan.z, transformParams, zoom],
  );

  const unprojectGround = useCallback(
    (sx: number, sy: number, size = 560): { wx: number; wz: number } => {
      const half = size / 2;
      const scale = ((size - 40) / 680) * zoom;
      const rx = (sx - half) / scale;
      const rz = (sy - half) / (scale * transformParams.tiltY);
      const dx = rx * transformParams.cosT + rz * transformParams.sinT;
      const dz = -rx * transformParams.sinT + rz * transformParams.cosT;
      return {
        wx: pan.x + dx,
        wz: pan.z + dz,
      };
    },
    [pan.x, pan.z, transformParams, zoom],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const scale = ((size - 40) / 680) * zoom;

    // Tactical sky/ground gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, size);
    bgGrad.addColorStop(0, '#070b14');
    bgGrad.addColorStop(1, '#0e1624');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // Subtle city boundary base plate
    const c1 = projectPoint(-335, -335, 0, size);
    const c2 = projectPoint(335, -335, 0, size);
    const c3 = projectPoint(335, 335, 0, size);
    const c4 = projectPoint(-335, 335, 0, size);
    ctx.fillStyle = '#0c121e';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(c1.sx, c1.sy);
    ctx.lineTo(c2.sx, c2.sy);
    ctx.lineTo(c3.sx, c3.sy);
    ctx.lineTo(c4.sx, c4.sy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Road grid polygons/lines
    ctx.lineCap = 'butt';
    ctx.strokeStyle = '#1b2638';
    ctx.lineWidth = Math.max(4, 15.5 * scale);
    for (const rc of CITY_ROAD_CENTERS) {
      const vA = projectPoint(rc, -325, 0, size);
      const vB = projectPoint(rc, 325, 0, size);
      ctx.beginPath();
      ctx.moveTo(vA.sx, vA.sy);
      ctx.lineTo(vB.sx, vB.sy);
      ctx.stroke();

      const hA = projectPoint(-325, rc, 0, size);
      const hB = projectPoint(325, rc, 0, size);
      ctx.beginPath();
      ctx.moveTo(hA.sx, hA.sy);
      ctx.lineTo(hB.sx, hB.sy);
      ctx.stroke();
    }

    // Road amber centerlines
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.30)';
    ctx.lineWidth = Math.max(1, 1.1 * zoom);
    ctx.setLineDash([5, 5]);
    for (const rc of CITY_ROAD_CENTERS) {
      const vA = projectPoint(rc, -320, 0, size);
      const vB = projectPoint(rc, 320, 0, size);
      ctx.beginPath();
      ctx.moveTo(vA.sx, vA.sy);
      ctx.lineTo(vB.sx, vB.sy);
      ctx.stroke();

      const hA = projectPoint(-320, rc, 0, size);
      const hB = projectPoint(320, rc, 0, size);
      ctx.beginPath();
      ctx.moveTo(hA.sx, hA.sy);
      ctx.lineTo(hB.sx, hB.sy);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Chowk roundabouts on ground plane
    for (const chowk of CHOWK_ROUNDABOUTS) {
      const center = projectPoint(chowk.x, chowk.z, 0, size);
      const rx = Math.max(3.5, chowk.radius * scale);
      const ry = rx * transformParams.tiltY;
      ctx.fillStyle = '#253247';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(center.sx, center.sy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // 3D Extruded City Blocks sorted back-to-front by rotated depth
    const sortedBlocks: { bx: number; bz: number; depth: number }[] = [];
    for (const bx of CITY_BLOCK_CENTERS) {
      for (const bz of CITY_BLOCK_CENTERS) {
        const p = projectPoint(bx, bz, 0, size);
        sortedBlocks.push({ bx, bz, depth: p.depth });
      }
    }
    sortedBlocks.sort((a, b) => a.depth - b.depth);

    const halfBlock = 20.5;
    for (const { bx, bz } of sortedBlocks) {
      const meta = getBlockMeta(bx, bz);
      const corners: [number, number][] = [
        [bx - halfBlock, bz - halfBlock],
        [bx + halfBlock, bz - halfBlock],
        [bx + halfBlock, bz + halfBlock],
        [bx - halfBlock, bz + halfBlock],
      ];
      const basePts = corners.map(([cx, cz]) => projectPoint(cx, cz, 0, size));

      if (view3D) {
        const topPts = corners.map(([cx, cz]) => projectPoint(cx, cz, meta.heightM, size));

        // Draw any side face whose bottom edge is facing towards the camera (higher average depth than block center)
        const centerDepth = projectPoint(bx, bz, 0, size).depth;
        for (let i = 0; i < 4; i++) {
          const j = (i + 1) % 4;
          const edgeDepth = (basePts[i].depth + basePts[j].depth) * 0.5;
          if (edgeDepth >= centerDepth - 0.1) {
            ctx.fillStyle = i % 2 === 0 ? meta.fillSideA : meta.fillSideB;
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(basePts[i].sx, basePts[i].sy);
            ctx.lineTo(basePts[j].sx, basePts[j].sy);
            ctx.lineTo(topPts[j].sx, topPts[j].sy);
            ctx.lineTo(topPts[i].sx, topPts[i].sy);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        }

        // Roof cap
        ctx.fillStyle = meta.fillTop;
        ctx.strokeStyle = meta.accent ? `${meta.accent}99` : 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = meta.accent ? 1.2 : 0.8;
        ctx.beginPath();
        ctx.moveTo(topPts[0].sx, topPts[0].sy);
        ctx.lineTo(topPts[1].sx, topPts[1].sy);
        ctx.lineTo(topPts[2].sx, topPts[2].sy);
        ctx.lineTo(topPts[3].sx, topPts[3].sy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = meta.fillTop;
        ctx.strokeStyle = meta.accent ? `${meta.accent}99` : '#2d3748';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(basePts[0].sx, basePts[0].sy);
        ctx.lineTo(basePts[1].sx, basePts[1].sy);
        ctx.lineTo(basePts[2].sx, basePts[2].sy);
        ctx.lineTo(basePts[3].sx, basePts[3].sy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // Active Mission GPS Route (Cyan Glow)
    if (hud.mission.routePoints && hud.mission.routePoints.length >= 2) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.30)';
      ctx.lineWidth = 7;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      hud.mission.routePoints.forEach((pt, idx) => {
        const p = projectPoint(pt.x, pt.z, 1, size);
        if (idx === 0) ctx.moveTo(p.sx, p.sy);
        else ctx.lineTo(p.sx, p.sy);
      });
      ctx.stroke();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      hud.mission.routePoints.forEach((pt, idx) => {
        const p = projectPoint(pt.x, pt.z, 1, size);
        if (idx === 0) ctx.moveTo(p.sx, p.sy);
        else ctx.lineTo(p.sx, p.sy);
      });
      ctx.stroke();
      ctx.restore();
    }

    // Player Custom / Preset GPS Waypoint Route (Glowing Amber Trail)
    if (hud.waypoint?.active && hud.waypoint.routePoints.length >= 2) {
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.32)';
      ctx.lineWidth = 7.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      hud.waypoint.routePoints.forEach((pt, idx) => {
        const p = projectPoint(pt.x, pt.z, 1.5, size);
        if (idx === 0) ctx.moveTo(p.sx, p.sy);
        else ctx.lineTo(p.sx, p.sy);
      });
      ctx.stroke();

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 5]);
      ctx.lineDashOffset = -pulsePhase * 6;
      ctx.beginPath();
      hud.waypoint.routePoints.forEach((pt, idx) => {
        const p = projectPoint(pt.x, pt.z, 1.5, size);
        if (idx === 0) ctx.moveTo(p.sx, p.sy);
        else ctx.lineTo(p.sx, p.sy);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // All City Blips (elevated slightly with vertical anchor stems in 3D mode)
    const drawPinBadge = (
      wx: number,
      wz: number,
      bg: string,
      fg: string,
      glyph: string,
      pinSize = 13,
      border?: string,
    ) => {
      const ground = projectPoint(wx, wz, 0, size);
      const pin = projectPoint(wx, wz, view3D ? 16 : 0, size);
      if (view3D) {
        ctx.strokeStyle = 'rgba(255,255,255,0.28)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ground.sx, ground.sy);
        ctx.lineTo(pin.sx, pin.sy);
        ctx.stroke();
      }
      ctx.fillStyle = bg;
      ctx.fillRect(pin.sx - pinSize / 2, pin.sy - pinSize / 2, pinSize, pinSize);
      if (border) {
        ctx.strokeStyle = border;
        ctx.lineWidth = 1.3;
        ctx.strokeRect(pin.sx - pinSize / 2, pin.sy - pinSize / 2, pinSize, pinSize);
      }
      ctx.fillStyle = fg;
      ctx.font = `bold ${Math.max(8, Math.round(pinSize * 0.72))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(glyph, pin.sx, pin.sy + 0.5);
    };

    for (const b of hud.blips) {
      if (b.type === 'traffic_light') {
        const col =
          b.signalState === 'GREEN'
            ? '#22c55e'
            : b.signalState === 'YELLOW'
              ? '#facc15'
              : '#ef4444';
        const p = projectPoint(b.x, b.z, 2, size);
        ctx.fillStyle = '#0b0e14';
        ctx.fillRect(p.sx - 4, p.sy - 4, 8, 8);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 2.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === 'gunshop') {
        drawPinBadge(b.x, b.z, '#f59e0b', '#0b0e14', 'G', 14);
      } else if (b.type === 'hospital') {
        drawPinBadge(b.x, b.z, '#dc2626', '#ffffff', '+', 14);
      } else if (b.type === 'bank') {
        drawPinBadge(b.x, b.z, '#0ea5e9', '#0b0e14', 'B', 14);
      } else if (b.type === 'atm') {
        drawPinBadge(b.x, b.z, '#06b6d4', '#0b0e14', '₹', 12);
      } else if (b.type === 'rescue_van') {
        drawPinBadge(b.x, b.z, '#10b981', '#0b0e14', 'V', 14);
      } else if (b.type === 'mission_enemy') {
        const p = projectPoint(b.x, b.z, 6, size);
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (b.type === 'chai') {
        drawPinBadge(b.x, b.z, '#d97706', '#ffffff', 'C', 12);
      } else if (b.type === 'golgappa') {
        drawPinBadge(b.x, b.z, '#e11d48', '#ffffff', 'P', 12);
      } else if (b.type === 'temple') {
        drawPinBadge(b.x, b.z, '#f97316', '#ffffff', 'ॐ', 14);
      } else if (b.type === 'mosque') {
        drawPinBadge(b.x, b.z, '#059669', '#ffffff', '☪', 14);
      } else if (b.type === 'home') {
        drawPinBadge(b.x, b.z, '#f59e0b', '#0b0e14', 'H', 16, '#fef3c7');
      } else if (b.type === 'dm_office') {
        drawPinBadge(b.x, b.z, '#7c3aed', '#ffffff', 'L', 14);
      } else if (b.type === 'court') {
        drawPinBadge(b.x, b.z, '#a855f7', '#ffffff', '⚖', 14);
      } else if (b.type === 'jail') {
        drawPinBadge(b.x, b.z, '#1e293b', '#fca5a5', 'J', 14, '#ef4444');
      } else if (b.type === 'chopper') {
        const p = projectPoint(b.x, b.z, 18, size);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p.sx - 6, p.sy - 6);
        ctx.lineTo(p.sx + 6, p.sy + 6);
        ctx.moveTo(p.sx + 6, p.sy - 6);
        ctx.lineTo(p.sx - 6, p.sy + 6);
        ctx.stroke();
      } else if (b.type === 'army') {
        const p = projectPoint(b.x, b.z, 3, size);
        ctx.fillStyle = '#4d7c0f';
        ctx.fillRect(p.sx - 4.5, p.sy - 4.5, 9, 9);
      } else if (b.type === 'dog') {
        const p = projectPoint(b.x, b.z, 2, size);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 3.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === 'traffic_cop') {
        const p = projectPoint(b.x, b.z, 3, size);
        ctx.fillStyle = '#a3e635';
        ctx.strokeStyle = '#0b0e14';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (b.type === 'police_car') {
        const p = projectPoint(b.x, b.z, 3, size);
        ctx.fillStyle = hud.wantedLevel > 0 ? '#3b82f6' : '#64748b';
        ctx.fillRect(p.sx - 4, p.sy - 4, 8, 8);
      } else if (b.type === 'police_officer') {
        const p = projectPoint(b.x, b.z, 3, size);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 3.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === 'vehicle') {
        const p = projectPoint(b.x, b.z, 2, size);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(p.sx - 2.6, p.sy - 2.6, 5.2, 5.2);
      }
    }

    // Active Glowing 3D Waypoint Beacon Pillar
    if (hud.waypoint?.active) {
      const base = projectPoint(hud.waypoint.x, hud.waypoint.z, 0, size);
      const top = projectPoint(hud.waypoint.x, hud.waypoint.z, view3D ? 44 : 0, size);
      const ringR = 8 + Math.sin(pulsePhase) * 3.5;

      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(base.sx, base.sy, ringR, ringR * transformParams.tiltY, 0, 0, Math.PI * 2);
      ctx.stroke();

      if (view3D) {
        const beamGrad = ctx.createLinearGradient(base.sx, base.sy, top.sx, top.sy);
        beamGrad.addColorStop(0, 'rgba(251, 191, 36, 0.95)');
        beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0.15)');
        ctx.strokeStyle = beamGrad;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(base.sx, base.sy);
        ctx.lineTo(top.sx, top.sy);
        ctx.stroke();
      }

      // Beacon diamond
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#0b0e14';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(top.sx, top.sy - 8);
      ctx.lineTo(top.sx + 6.5, top.sy);
      ctx.lineTo(top.sx, top.sy + 8);
      ctx.lineTo(top.sx - 6.5, top.sy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(11, 14, 20, 0.85)';
      ctx.fillRect(top.sx - 24, top.sy - 25, 48, 13);
      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${hud.waypoint.distanceMeters}m`, top.sx, top.sy - 18.5);
      ctx.restore();
    }

    // Player Marker rotated in map space
    const pGround = projectPoint(hud.playerX, hud.playerZ, 2, size);
    const mapHeadingRad = -hud.playerYaw + (rotationDeg * Math.PI) / 180;
    ctx.save();
    ctx.translate(pGround.sx, pGround.sy);
    ctx.rotate(mapHeadingRad);

    ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-15, -32);
    ctx.lineTo(15, -32);
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

    // Dynamic Compass North Indicator (Top-Left inside canvas)
    ctx.save();
    ctx.translate(32, 32);
    ctx.fillStyle = 'rgba(11, 14, 20, 0.82)';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.rotate((rotationDeg * Math.PI) / 180);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(4, -2);
    ctx.lineTo(-4, -2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', 0, 7);
    ctx.restore();
  }, [hud, projectPoint, pulsePhase, rotationDeg, transformParams.tiltY, view3D, zoom]);

  const placeWaypointAtClientPos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * canvas.width;
    const sy = ((clientY - rect.top) / rect.height) * canvas.height;
    const { wx, wz } = unprojectGround(sx, sy, canvas.width);
    const worldX = Math.max(-330, Math.min(330, Math.round(wx)));
    const worldZ = Math.max(-330, Math.min(330, Math.round(wz)));

    const homeDest = {
      id: 'home',
      label: hud.houseName ? `${hud.houseName} (My Home)` : 'Apna Ghar (My Home)',
      category: 'sacred' as const,
      x: hud.homePos?.x ?? 30,
      z: hud.homePos?.z ?? 109.5,
      badge: 'H',
    };
    const allDestinations = [homeDest, ...CITY_LOCATIONS];
    const nearbyPreset = allDestinations.find(
      (loc) => Math.hypot(loc.x - worldX, loc.z - worldZ) < 22,
    );
    if (nearbyPreset) {
      onSetWaypoint(nearbyPreset.x, nearbyPreset.z, nearbyPreset.label);
    } else {
      onSetWaypoint(worldX, worldZ, `Pin (${worldX}, ${worldZ})`);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      movedPx: 0,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== e.pointerId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dxPx = ((e.clientX - dragRef.current.lastX) / rect.width) * canvas.width;
    const dyPx = ((e.clientY - dragRef.current.lastY) / rect.height) * canvas.height;
    dragRef.current.movedPx += Math.hypot(e.clientX - dragRef.current.lastX, e.clientY - dragRef.current.lastY);
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;

    const scale = ((canvas.width - 40) / 680) * zoom;
    const rx = -dxPx / scale;
    const rz = -dyPx / (scale * transformParams.tiltY);
    const dwx = rx * transformParams.cosT + rz * transformParams.sinT;
    const dwz = -rx * transformParams.sinT + rz * transformParams.cosT;

    setPan((prev) => ({
      x: Math.max(-320, Math.min(320, prev.x + dwx)),
      z: Math.max(-320, Math.min(320, prev.z + dwz)),
    }));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== e.pointerId) return;
    dragRef.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    if (dragRef.current.movedPx <= 6) {
      placeWaypointAtClientPos(e.clientX, e.clientY);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    setZoom((z) => Math.max(0.65, Math.min(3.6, Number((z * factor).toFixed(2)))));
  };

  const destinations = [
    {
      id: 'home',
      label: hud.houseName ? `${hud.houseName} (My Home)` : 'Apna Ghar (My Home)',
      category: 'sacred' as const,
      x: hud.homePos?.x ?? 30,
      z: hud.homePos?.z ?? 109.5,
      badge: 'H',
    },
    ...CITY_LOCATIONS,
  ];

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#070A10]/88 p-2 sm:p-4 pointer-events-auto">
      <div className="w-full max-w-5xl bg-[#101520] border border-slate-700/90 shadow-2xl flex flex-col overflow-hidden max-h-[94vh]">
        <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-2.5 bg-[#0B0E14] border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <MapIcon className="w-4 h-4 text-amber-400 shrink-0" />
            <h2 className="font-display text-[clamp(0.85rem,2.4vw,1rem)] font-bold tracking-wider text-slate-100 truncate">
              3D TACTICAL CITY GPS
            </h2>
            <span className="text-[10px] sm:text-[11px] font-mono-num text-slate-400">
              POS ({Math.round(hud.playerX)}, {Math.round(hud.playerZ)})
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {hud.waypoint?.active && (
              <button
                type="button"
                onClick={onClearWaypoint}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-[11px] font-mono-num text-red-200 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CLEAR GPS</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-mono-num text-slate-200 cursor-pointer"
            >
              <span>CLOSE</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-2.5 sm:p-4 grid grid-cols-1 md:grid-cols-[1fr_260px] gap-3 bg-[#0D111A] overflow-y-auto">
          <div className="flex flex-col items-center gap-2">
            {/* Touch-Friendly 3D Map Controls Bar */}
            <div className="w-full max-w-[min(92vw,560px)] flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setView3D((v) => !v)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded border text-[10px] font-mono-num font-bold cursor-pointer ${
                    view3D
                      ? 'bg-sky-500/25 border-sky-400 text-sky-200'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>{view3D ? '3D VIEW' : '2D TOP'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3.6, Number((z * 1.2).toFixed(2))))}
                  aria-label="Zoom In"
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.65, Number((z * 0.82).toFixed(2))))}
                  aria-label="Zoom Out"
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setRotationDeg((r) => r - 30)}
                  aria-label="Rotate Left"
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setRotationDeg((r) => r + 30)}
                  aria-label="Rotate Right"
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setPan({ x: hud.playerX, z: hud.playerZ });
                    setZoom(1.45);
                  }}
                  className="flex items-center gap-1 px-2 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-[10px] font-mono-num font-bold text-amber-200 cursor-pointer"
                >
                  <Crosshair className="w-3 h-3" />
                  <span>MY POS</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPan({ x: 0, z: 0 });
                    setZoom(1.05);
                    setRotationDeg(0);
                  }}
                  className="flex items-center gap-1 px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-mono-num text-slate-200 cursor-pointer"
                >
                  <Compass className="w-3 h-3" />
                  <span>NORTH</span>
                </button>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={560}
              height={560}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
              style={{ touchAction: 'none' }}
              title="Tap/click anywhere to drop a 3D GPS beacon · Drag to pan · Scroll to zoom"
              className="w-full max-w-[min(92vw,560px)] aspect-square border border-slate-700/80 bg-[#080c14] cursor-crosshair select-none rounded-lg"
            />
            <div className="text-[10px] sm:text-[11px] font-mono-num text-slate-400 text-center">
              Tap/click anywhere on the city to drop a 3D GPS Beacon · Drag to pan · Zoom {zoom.toFixed(1)}×
            </div>
          </div>

          {/* Quick Destinations & Active Waypoint Panel */}
          <div className="flex flex-col gap-2.5">
            <div className="p-3 bg-[#121826] border border-slate-700/80 rounded-lg flex flex-col gap-1.5">
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
                    {hud.waypoint.distanceMeters}m away · Follow glowing route
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400">Tap the 3D map or select a landmark below.</div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="text-[11px] font-display font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400" /> CITY DESTINATIONS
              </div>
              <div className="flex flex-col gap-1.5 max-h-[340px] overflow-y-auto pr-1">
                {destinations.map((loc) => {
                  const selected = hud.waypoint?.label === loc.label;
                  const dist = Math.round(Math.hypot(loc.x - hud.playerX, loc.z - hud.playerZ));
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        onSetWaypoint(loc.x, loc.z, loc.label);
                        setPan({ x: loc.x * 0.65, z: loc.z * 0.65 });
                      }}
                      className={`flex items-center justify-between gap-2 px-2.5 py-2 border rounded text-left transition-colors cursor-pointer ${
                        selected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-[#121826] hover:bg-[#192235] border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded shrink-0 flex items-center justify-center text-[10px] font-bold ${
                            loc.id === 'home'
                              ? 'bg-amber-400 text-[#0B0E14]'
                              : loc.id === 'dm-office' || loc.id === 'district-court'
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
