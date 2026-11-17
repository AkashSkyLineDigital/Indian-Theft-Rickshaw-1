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
  Search,
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
  CityLocationPreset,
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

interface LandmarkFootprint {
  id: string;
  shortLabel: string;
  bx: number;
  bz: number;
  w: number;
  d: number;
  fillTop: string;
  fillSideA: string;
  fillSideB: string;
  heightM: number;
  accent: string;
  pinX: number;
  pinZ: number;
  badge: string;
  badgeFg: string;
  shape?: 'compound' | 'temple' | 'mosque' | 'cross' | 'default';
}

const LANDMARK_FOOTPRINTS: LandmarkFootprint[] = [
  {
    id: 'home',
    shortLabel: 'My Home',
    bx: 30,
    bz: 90,
    w: 35,
    d: 35,
    fillTop: '#4a3816',
    fillSideA: '#31250e',
    fillSideB: '#241b0a',
    heightM: 14,
    accent: '#fbbf24',
    pinX: 30,
    pinZ: 109.5,
    badge: 'H',
    badgeFg: '#0b0e14',
  },
  {
    id: 'pankaj-armory',
    shortLabel: 'Gun Shop',
    bx: 30,
    bz: -30,
    w: 34,
    d: 32,
    fillTop: '#4c3214',
    fillSideA: '#33210d',
    fillSideB: '#251709',
    heightM: 16,
    accent: '#f59e0b',
    pinX: 30,
    pinZ: -14,
    badge: 'G',
    badgeFg: '#0b0e14',
  },
  {
    id: 'royal-bank',
    shortLabel: 'Royal Bank',
    bx: -30,
    bz: -90,
    w: 38,
    d: 34,
    fillTop: '#123e4a',
    fillSideA: '#0b2931',
    fillSideB: '#071d23',
    heightM: 26,
    accent: '#0ea5e9',
    pinX: -30,
    pinZ: -74,
    badge: 'B',
    badgeFg: '#0b0e14',
  },
  {
    id: 'hospital',
    shortLabel: 'Hospital',
    bx: -30,
    bz: 30,
    w: 40,
    d: 38,
    fillTop: '#4e1d26',
    fillSideA: '#341219',
    fillSideB: '#240c11',
    heightM: 24,
    accent: '#ef4444',
    pinX: -30,
    pinZ: 14,
    badge: '+',
    badgeFg: '#ffffff',
    shape: 'cross',
  },
  {
    id: 'ram-mandir',
    shortLabel: 'Ram Mandir',
    bx: 30,
    bz: 30,
    w: 36,
    d: 34,
    fillTop: '#522c14',
    fillSideA: '#361c0c',
    fillSideB: '#261408',
    heightM: 22,
    accent: '#f97316',
    pinX: 19,
    pinZ: 30,
    badge: 'ॐ',
    badgeFg: '#ffffff',
    shape: 'temple',
  },
  {
    id: 'krishna-mandir',
    shortLabel: 'Krishna Mandir',
    bx: 90,
    bz: -30,
    w: 35,
    d: 33,
    fillTop: '#523815',
    fillSideA: '#37250d',
    fillSideB: '#271a09',
    heightM: 21,
    accent: '#fb923c',
    pinX: 90,
    pinZ: -18,
    badge: 'ॐ',
    badgeFg: '#ffffff',
    shape: 'temple',
  },
  {
    id: 'noor-masjid',
    shortLabel: 'Noor Masjid',
    bx: -90,
    bz: -30,
    w: 36,
    d: 34,
    fillTop: '#134234',
    fillSideA: '#0b2b22',
    fillSideB: '#081f18',
    heightM: 22,
    accent: '#10b981',
    pinX: -90,
    pinZ: -18,
    badge: '☪',
    badgeFg: '#ffffff',
    shape: 'mosque',
  },
  {
    id: 'dm-office',
    shortLabel: 'DM & RTO',
    bx: -90,
    bz: 30,
    w: 36,
    d: 34,
    fillTop: '#2c224d',
    fillSideA: '#1d1633',
    fillSideB: '#140f24',
    heightM: 20,
    accent: '#8b5cf6',
    pinX: -90,
    pinZ: 46,
    badge: 'L',
    badgeFg: '#ffffff',
  },
  {
    id: 'district-court',
    shortLabel: 'District Court',
    bx: -90,
    bz: 90,
    w: 40,
    d: 38,
    fillTop: '#382154',
    fillSideA: '#251538',
    fillSideB: '#190e26',
    heightM: 24,
    accent: '#a855f7',
    pinX: -90,
    pinZ: 108,
    badge: '⚖',
    badgeFg: '#ffffff',
  },
  {
    id: 'central-jail',
    shortLabel: 'Thana & Jail',
    bx: -150,
    bz: 150,
    w: 42,
    d: 42,
    fillTop: '#291b22',
    fillSideA: '#1b1116',
    fillSideB: '#120b0f',
    heightM: 18,
    accent: '#ef4444',
    pinX: -150,
    pinZ: 176,
    badge: 'T',
    badgeFg: '#ffffff',
    shape: 'compound',
  },
  {
    id: 'laxmi-medical',
    shortLabel: 'Kirana Bazaar',
    bx: 90,
    bz: 30,
    w: 36,
    d: 34,
    fillTop: '#1e3a3a',
    fillSideA: '#132626',
    fillSideB: '#0c1a1a',
    heightM: 16,
    accent: '#2dd4bf',
    pinX: 90,
    pinZ: 46,
    badge: 'K',
    badgeFg: '#0b0e14',
  },
  {
    id: 'azad-nagar',
    shortLabel: 'Azad Nagar',
    bx: -210,
    bz: 30,
    w: 40,
    d: 36,
    fillTop: '#243044',
    fillSideA: '#161e2b',
    fillSideB: '#101620',
    heightM: 12,
    accent: '#60a5fa',
    pinX: -210,
    pinZ: 16,
    badge: 'R',
    badgeFg: '#0b0e14',
  },
  {
    id: 'shanti-vihar',
    shortLabel: 'Shanti Vihar',
    bx: 210,
    bz: -30,
    w: 40,
    d: 36,
    fillTop: '#243044',
    fillSideA: '#161e2b',
    fillSideB: '#101620',
    heightM: 12,
    accent: '#60a5fa',
    pinX: 210,
    pinZ: -16,
    badge: 'R',
    badgeFg: '#0b0e14',
  },
];

const LANDMARK_BY_BLOCK = new Map<string, LandmarkFootprint>(
  LANDMARK_FOOTPRINTS.map((fp) => [`${fp.bx},${fp.bz}`, fp]),
);

const STREET_LABELS: { x: number; z: number; text: string; axis: 'h' | 'v' }[] = [
  { x: 60, z: 0, text: 'CENTRAL CHOWK MARG', axis: 'h' },
  { x: 0, z: -60, text: 'ROYAL BANK ROAD', axis: 'v' },
  { x: -120, z: 60, text: 'THANA & COURT MARG', axis: 'h' },
  { x: 60, z: 60, text: 'MANDIR ROAD', axis: 'h' },
  { x: -60, z: 0, text: 'HOSPITAL AVENUE', axis: 'v' },
];

function getBlockMeta(bx: number, bz: number): {
  w: number;
  d: number;
  fillTop: string;
  fillSideA: string;
  fillSideB: string;
  heightM: number;
  accent?: string;
  footprint?: LandmarkFootprint;
} {
  const fp = LANDMARK_BY_BLOCK.get(`${bx},${bz}`);
  if (fp) {
    return {
      w: fp.w,
      d: fp.d,
      fillTop: fp.fillTop,
      fillSideA: fp.fillSideA,
      fillSideB: fp.fillSideB,
      heightM: fp.heightM,
      accent: fp.accent,
      footprint: fp,
    };
  }
  const isColony = Math.abs(bx) >= 150 || Math.abs(bz) >= 150;
  const hash = Math.abs(Math.sin(bx * 0.13 + bz * 0.29));
  const baseH = isColony ? 8 + hash * 7 : 12 + hash * 14;
  return {
    w: 39,
    d: 39,
    fillTop: isColony ? '#1a2434' : '#202b3d',
    fillSideA: '#141c29',
    fillSideB: '#0f1520',
    heightM: baseH,
  };
}

function getCompassDir(dx: number, dz: number): string {
  const deg = ((Math.atan2(dx, -dz) * 180) / Math.PI + 360) % 360;
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export const CityMapModal: React.FC<CityMapModalProps> = ({
  hud,
  onSetWaypoint,
  onClearWaypoint,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Crisp 2D Top-Down Navigation by default so roads, intersections, and footprints align 1:1
  const [view3D, setView3D] = useState(false);
  const [followHeading, setFollowHeading] = useState(hud.inVehicle);
  const [zoom, setZoom] = useState(1.22);
  const [pan, setPan] = useState<{ x: number; z: number }>(() => ({
    x: Math.max(-240, Math.min(240, hud.playerX * 0.5)),
    z: Math.max(-240, Math.min(240, hud.playerZ * 0.5)),
  }));
  const [manualRotationDeg, setManualRotationDeg] = useState(0);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'service' | 'sacred' | 'food'>('all');
  const [hoveredTarget, setHoveredTarget] = useState<{
    label: string;
    wx: number;
    wz: number;
  } | null>(null);

  // Exact screen-space rendered hit targets so clicking/tapping a landmark icon or building NEVER misses
  const renderedTargetsRef = useRef<
    {
      id: string;
      label: string;
      wx: number;
      wz: number;
      sx: number;
      sy: number;
      hitR: number;
      footprintBox?: { bx: number; bz: number; hw: number; hd: number };
    }[]
  >([]);

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

  const effectiveRotationDeg = followHeading ? (hud.playerYaw * 180) / Math.PI : manualRotationDeg;

  useEffect(() => {
    if (followHeading) {
      setPan({ x: hud.playerX, z: hud.playerZ });
    }
  }, [followHeading, hud.playerX, hud.playerZ]);

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
    const theta = (effectiveRotationDeg * Math.PI) / 180;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const tiltY = view3D ? 0.66 : 1.0;
    const elevScale = view3D ? 0.65 : 0;
    return { cosT, sinT, tiltY, elevScale };
  }, [effectiveRotationDeg, view3D]);

  const projectPoint = useCallback(
    (wx: number, wz: number, elevM = 0, size = 600): ProjectedPoint => {
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
    (sx: number, sy: number, size = 600): { wx: number; wz: number } => {
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

  const allDestinations: CityLocationPreset[] = useMemo(
    () => [
      {
        id: 'home',
        label: hud.houseName ? `${hud.houseName} (My Home)` : 'Apna Ghar (My Home)',
        category: 'sacred',
        x: hud.homePos?.x ?? 30,
        z: hud.homePos?.z ?? 109.5,
        badge: 'H',
      },
      ...CITY_LOCATIONS,
    ],
    [hud.houseName, hud.homePos],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const scale = ((size - 40) / 680) * zoom;
    const hitTargets: typeof renderedTargetsRef.current = [];

    // Ground background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, size);
    bgGrad.addColorStop(0, '#070b14');
    bgGrad.addColorStop(1, '#0d1523');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // City boundary base plate
    const c1 = projectPoint(-335, -335, 0, size);
    const c2 = projectPoint(335, -335, 0, size);
    const c3 = projectPoint(335, 335, 0, size);
    const c4 = projectPoint(-335, 335, 0, size);
    ctx.fillStyle = '#0c121e';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(c1.sx, c1.sy);
    ctx.lineTo(c2.sx, c2.sy);
    ctx.lineTo(c3.sx, c3.sy);
    ctx.lineTo(c4.sx, c4.sy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Road grid asphalt
    ctx.lineCap = 'butt';
    ctx.strokeStyle = '#1e2b3e';
    ctx.lineWidth = Math.max(6, 17.5 * scale);
    for (const rc of CITY_ROAD_CENTERS) {
      const vA = projectPoint(rc, -328, 0, size);
      const vB = projectPoint(rc, 328, 0, size);
      ctx.beginPath();
      ctx.moveTo(vA.sx, vA.sy);
      ctx.lineTo(vB.sx, vB.sy);
      ctx.stroke();

      const hA = projectPoint(-328, rc, 0, size);
      const hB = projectPoint(328, rc, 0, size);
      ctx.beginPath();
      ctx.moveTo(hA.sx, hA.sy);
      ctx.lineTo(hB.sx, hB.sy);
      ctx.stroke();
    }

    // Crisp road centerlines
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.34)';
    ctx.lineWidth = Math.max(1, 1.15 * zoom);
    ctx.setLineDash([6, 6]);
    for (const rc of CITY_ROAD_CENTERS) {
      const vA = projectPoint(rc, -322, 0, size);
      const vB = projectPoint(rc, 322, 0, size);
      ctx.beginPath();
      ctx.moveTo(vA.sx, vA.sy);
      ctx.lineTo(vB.sx, vB.sy);
      ctx.stroke();

      const hA = projectPoint(-322, rc, 0, size);
      const hB = projectPoint(322, rc, 0, size);
      ctx.beginPath();
      ctx.moveTo(hA.sx, hA.sy);
      ctx.lineTo(hB.sx, hB.sy);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Street Names for effortless way-finding
    if (zoom >= 0.95) {
      ctx.save();
      ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
      ctx.font = `600 ${Math.max(7.5, Math.min(10, Math.round(7.5 * zoom)))}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const sl of STREET_LABELS) {
        const p = projectPoint(sl.x, sl.z, 0, size);
        ctx.save();
        ctx.translate(p.sx, p.sy);
        const angle =
          ((sl.axis === 'v' ? -Math.PI / 2 : 0) + (effectiveRotationDeg * Math.PI) / 180) %
          (Math.PI * 2);
        // Keep street text right-side-up
        const uprightAngle =
          Math.cos(angle) < 0 ? angle + Math.PI : angle;
        ctx.rotate(uprightAngle);
        ctx.fillText(sl.text, 0, 0);
        ctx.restore();
      }
      ctx.restore();
    }

    // Chowk roundabouts
    for (const chowk of CHOWK_ROUNDABOUTS) {
      const center = projectPoint(chowk.x, chowk.z, 0, size);
      const rx = Math.max(5, chowk.radius * scale);
      const ry = rx * transformParams.tiltY;
      ctx.fillStyle = '#253348';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(center.sx, center.sy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // City Blocks & True-to-Scale Landmark Compounds
    const sortedBlocks: { bx: number; bz: number; depth: number }[] = [];
    for (const bx of CITY_BLOCK_CENTERS) {
      for (const bz of CITY_BLOCK_CENTERS) {
        const p = projectPoint(bx, bz, 0, size);
        sortedBlocks.push({ bx, bz, depth: p.depth });
      }
    }
    sortedBlocks.sort((a, b) => a.depth - b.depth);

    for (const { bx, bz } of sortedBlocks) {
      const meta = getBlockMeta(bx, bz);
      const hw = meta.w / 2;
      const hd = meta.d / 2;
      const corners: [number, number][] = [
        [bx - hw, bz - hd],
        [bx + hw, bz - hd],
        [bx + hw, bz + hd],
        [bx - hw, bz + hd],
      ];
      const basePts = corners.map(([cx, cz]) => projectPoint(cx, cz, 0, size));

      if (view3D) {
        const topPts = corners.map(([cx, cz]) => projectPoint(cx, cz, meta.heightM, size));
        const centerDepth = projectPoint(bx, bz, 0, size).depth;
        for (let i = 0; i < 4; i++) {
          const j = (i + 1) % 4;
          const edgeDepth = (basePts[i].depth + basePts[j].depth) * 0.5;
          if (edgeDepth >= centerDepth - 0.1) {
            ctx.fillStyle = i % 2 === 0 ? meta.fillSideA : meta.fillSideB;
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
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
        ctx.fillStyle = meta.fillTop;
        ctx.strokeStyle = meta.accent ? `${meta.accent}cc` : 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = meta.accent ? 1.5 : 0.8;
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
        ctx.strokeStyle = meta.accent ? `${meta.accent}cc` : '#2d3a4f';
        ctx.lineWidth = meta.accent ? 1.8 : 0.9;
        ctx.beginPath();
        ctx.moveTo(basePts[0].sx, basePts[0].sy);
        ctx.lineTo(basePts[1].sx, basePts[1].sy);
        ctx.lineTo(basePts[2].sx, basePts[2].sy);
        ctx.lineTo(basePts[3].sx, basePts[3].sy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Architectural roof details so landmark buildings look distinct & proportional
        if (meta.footprint) {
          const c = projectPoint(bx, bz, 0, size);
          if (meta.footprint.shape === 'cross') {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
            const rLen = Math.max(5, 9 * scale);
            const rThick = Math.max(2, 3.2 * scale);
            ctx.fillRect(c.sx - rLen, c.sy - rThick, rLen * 2, rThick * 2);
            ctx.fillRect(c.sx - rThick, c.sy - rLen, rThick * 2, rLen * 2);
          } else if (meta.footprint.shape === 'temple' || meta.footprint.shape === 'mosque') {
            ctx.strokeStyle = meta.footprint.accent;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(c.sx, c.sy, Math.max(4, 8 * scale), 0, Math.PI * 2);
            ctx.stroke();
          } else if (meta.footprint.shape === 'compound') {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
            ctx.setLineDash([3, 3]);
            const inner = 13 * scale;
            ctx.strokeRect(c.sx - inner, c.sy - inner, inner * 2, inner * 2);
            ctx.setLineDash([]);
          }
        }
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

    // Player Waypoint GPS Route (Glowing Amber Trail along Streets)
    if (hud.waypoint?.active && hud.waypoint.routePoints.length >= 2) {
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.34)';
      ctx.lineWidth = 8.5;
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
      ctx.lineWidth = 3.2;
      ctx.setLineDash([8, 5]);
      ctx.lineDashOffset = -pulsePhase * 7;
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

    // Minor dynamic blips (traffic lights only when zoomed in, vehicles, cops, ATMs)
    for (const b of hud.blips) {
      if (b.type === 'traffic_light') {
        if (zoom < 1.25) continue;
        const col =
          b.signalState === 'GREEN'
            ? '#22c55e'
            : b.signalState === 'YELLOW'
              ? '#facc15'
              : '#ef4444';
        const p = projectPoint(b.x, b.z, 2, size);
        ctx.fillStyle = '#0b0e14';
        ctx.fillRect(p.sx - 3.5, p.sy - 3.5, 7, 7);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 2.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === 'atm' && zoom >= 1.1) {
        const p = projectPoint(b.x, b.z, 2, size);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(p.sx - 5.5, p.sy - 5.5, 11, 11);
        ctx.fillStyle = '#0b0e14';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('₹', p.sx, p.sy + 0.5);
      } else if (b.type === 'mission_enemy') {
        const p = projectPoint(b.x, b.z, 6, size);
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (b.type === 'rescue_van') {
        const p = projectPoint(b.x, b.z, 6, size);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(p.sx - 7, p.sy - 7, 14, 14);
        ctx.fillStyle = '#0b0e14';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('V', p.sx, p.sy + 0.5);
      } else if (b.type === 'chopper') {
        const p = projectPoint(b.x, b.z, 18, size);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 7.5, 0, Math.PI * 2);
        ctx.stroke();
      } else if (b.type === 'police_car') {
        const p = projectPoint(b.x, b.z, 3, size);
        ctx.fillStyle = hud.wantedLevel > 0 ? '#3b82f6' : '#64748b';
        ctx.fillRect(p.sx - 3.5, p.sy - 3.5, 7, 7);
      } else if (b.type === 'vehicle' && zoom >= 1.15) {
        const p = projectPoint(b.x, b.z, 2, size);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.72)';
        ctx.fillRect(p.sx - 2.5, p.sy - 2.5, 5, 5);
      }
    }

    // Crisp, Sized Landmark Badges + Non-Overlapping Text Labels
    const labelBoxes: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const pinScale = Math.max(0.95, Math.min(1.45, zoom * 0.92));

    for (const loc of allDestinations) {
      const fp = LANDMARK_FOOTPRINTS.find((f) => f.id === loc.id);
      const anchorX = fp ? fp.bx : loc.x;
      const anchorZ = fp ? fp.bz : loc.z;
      const elev = view3D ? (fp ? fp.heightM + 8 : 12) : 0;
      const ground = projectPoint(anchorX, anchorZ, 0, size);
      const pin = projectPoint(anchorX, anchorZ, elev, size);

      const isSelected = hud.waypoint?.active && hud.waypoint.label === loc.label;
      const isHovered = hoveredTarget?.label === loc.label;

      if (view3D) {
        ctx.strokeStyle = 'rgba(255,255,255,0.28)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ground.sx, ground.sy);
        ctx.lineTo(pin.sx, pin.sy);
        ctx.stroke();
      }

      const bg =
        loc.id === 'home'
          ? '#f59e0b'
          : loc.id === 'hospital'
            ? '#dc2626'
            : loc.id === 'royal-bank'
              ? '#0ea5e9'
              : loc.id === 'pankaj-armory'
                ? '#f59e0b'
                : loc.id === 'central-jail'
                  ? '#1e293b'
                  : loc.id === 'dm-office' || loc.id === 'district-court'
                    ? '#7c3aed'
                    : loc.id === 'noor-masjid'
                      ? '#059669'
                      : loc.category === 'sacred'
                        ? '#f97316'
                        : loc.category === 'food'
                          ? '#d97706'
                          : '#38bdf8';
      const fg =
        loc.id === 'home' || loc.id === 'pankaj-armory' || loc.id === 'royal-bank'
          ? '#0b0e14'
          : '#ffffff';

      const isMinorFood = loc.category === 'food' && loc.id !== 'ganga-dhaba';
      const badgeSize = Math.round((isMinorFood ? 15 : 19) * pinScale);

      if (isSelected || isHovered) {
        ctx.save();
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#38bdf8';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(pin.sx, pin.sy, badgeSize * 0.85, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.fillStyle = bg;
      ctx.strokeStyle = isSelected ? '#fef3c7' : '#0b0e14';
      ctx.lineWidth = isSelected ? 2 : 1.5;
      ctx.beginPath();
      ctx.roundRect(pin.sx - badgeSize / 2, pin.sy - badgeSize / 2, badgeSize, badgeSize, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = fg;
      ctx.font = `bold ${Math.max(9, Math.round(badgeSize * 0.62))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(loc.badge, pin.sx, pin.sy + 0.5);

      const shortName = fp?.shortLabel ?? loc.label.split('(')[0].trim();
      if (!isMinorFood || zoom >= 1.45 || isSelected || isHovered) {
        ctx.font = 'bold 9.5px sans-serif';
        const tw = ctx.measureText(shortName).width + 8;
        const th = 14;
        const lx = pin.sx - tw / 2;
        const ly = pin.sy + badgeSize / 2 + 3;
        const overlaps = labelBoxes.some(
          (b) => lx < b.x2 && lx + tw > b.x1 && ly < b.y2 && ly + th > b.y1,
        );
        if (!overlaps || isSelected || isHovered) {
          labelBoxes.push({ x1: lx, y1: ly, x2: lx + tw, y2: ly + th });
          ctx.fillStyle = isSelected ? 'rgba(245, 158, 11, 0.92)' : 'rgba(11, 14, 20, 0.85)';
          ctx.beginPath();
          ctx.roundRect(lx, ly, tw, th, 3);
          ctx.fill();
          ctx.fillStyle = isSelected ? '#0b0e14' : '#e2e8f0';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(shortName, pin.sx, ly + th / 2 + 0.5);
        }
      }

      hitTargets.push({
        id: loc.id,
        label: loc.label,
        wx: loc.x,
        wz: loc.z,
        sx: pin.sx,
        sy: pin.sy,
        hitR: Math.max(18, badgeSize * 0.95),
        footprintBox: fp
          ? { bx: fp.bx, bz: fp.bz, hw: fp.w / 2 + 2, hd: fp.d / 2 + 2 }
          : undefined,
      });
    }

    renderedTargetsRef.current = hitTargets;

    // Active Glowing 3D Waypoint Beacon Pillar
    if (hud.waypoint?.active) {
      const base = projectPoint(hud.waypoint.x, hud.waypoint.z, 0, size);
      const top = projectPoint(hud.waypoint.x, hud.waypoint.z, view3D ? 42 : 0, size);
      const ringR = 10 + Math.sin(pulsePhase) * 3.5;

      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
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

      ctx.fillStyle = 'rgba(11, 14, 20, 0.9)';
      ctx.fillRect(top.sx - 26, top.sy - 26, 52, 14);
      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 9.5px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${hud.waypoint.distanceMeters}m`, top.sx, top.sy - 19);
      ctx.restore();
    }

    // Player / Vehicle Marker rotated in map space
    const pGround = projectPoint(hud.playerX, hud.playerZ, 2, size);
    const mapHeadingRad = -hud.playerYaw + (effectiveRotationDeg * Math.PI) / 180;
    ctx.save();
    ctx.translate(pGround.sx, pGround.sy);
    ctx.rotate(mapHeadingRad);

    ctx.fillStyle = hud.inVehicle ? 'rgba(56, 189, 248, 0.25)' : 'rgba(245, 158, 11, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-16, -34);
    ctx.lineTo(16, -34);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = hud.inVehicle ? '#38bdf8' : '#f59e0b';
    ctx.strokeStyle = '#0b0e14';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(7.5, 8);
    ctx.lineTo(0, 4);
    ctx.lineTo(-7.5, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Dynamic Compass North Indicator (Top-Left inside canvas)
    ctx.save();
    ctx.translate(32, 32);
    ctx.fillStyle = 'rgba(11, 14, 20, 0.85)';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.rotate((effectiveRotationDeg * Math.PI) / 180);
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
  }, [
    allDestinations,
    effectiveRotationDeg,
    hoveredTarget?.label,
    hud,
    projectPoint,
    pulsePhase,
    transformParams.tiltY,
    view3D,
    zoom,
  ]);

  const resolveMapHitAtClient = (
    clientX: number,
    clientY: number,
  ): { wx: number; wz: number; label: string; isLandmark: boolean } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * canvas.width;
    const sy = ((clientY - rect.top) / rect.height) * canvas.height;

    // 1. Direct screen-space hit-test on rendered landmark pins (works reliably in both 2D & 3D!)
    let bestPin: (typeof renderedTargetsRef.current)[number] | null = null;
    let bestDist = Infinity;
    for (const t of renderedTargetsRef.current) {
      const d = Math.hypot(sx - t.sx, sy - t.sy);
      if (d <= t.hitR && d < bestDist) {
        bestDist = d;
        bestPin = t;
      }
    }
    if (bestPin) {
      return { wx: bestPin.wx, wz: bestPin.wz, label: bestPin.label, isLandmark: true };
    }

    // 2. Ground projection check against scaled landmark building footprints & proximity
    const { wx, wz } = unprojectGround(sx, sy, canvas.width);
    const worldX = Math.max(-330, Math.min(330, Math.round(wx)));
    const worldZ = Math.max(-330, Math.min(330, Math.round(wz)));

    for (const t of renderedTargetsRef.current) {
      if (t.footprintBox) {
        const b = t.footprintBox;
        if (Math.abs(worldX - b.bx) <= b.hw && Math.abs(worldZ - b.bz) <= b.hd) {
          return { wx: t.wx, wz: t.wz, label: t.label, isLandmark: true };
        }
      }
    }

    const nearbyPreset = allDestinations.find(
      (loc) => Math.hypot(loc.x - worldX, loc.z - worldZ) < 22,
    );
    if (nearbyPreset) {
      return { wx: nearbyPreset.x, wz: nearbyPreset.z, label: nearbyPreset.label, isLandmark: true };
    }

    return { wx: worldX, wz: worldZ, label: `Pin (${worldX}, ${worldZ})`, isLandmark: false };
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
    if (!dragRef.current.active) {
      const hit = resolveMapHitAtClient(e.clientX, e.clientY);
      setHoveredTarget(hit ? { label: hit.label, wx: hit.wx, wz: hit.wz } : null);
      return;
    }
    if (dragRef.current.pointerId !== e.pointerId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dxPx = ((e.clientX - dragRef.current.lastX) / rect.width) * canvas.width;
    const dyPx = ((e.clientY - dragRef.current.lastY) / rect.height) * canvas.height;
    dragRef.current.movedPx += Math.hypot(
      e.clientX - dragRef.current.lastX,
      e.clientY - dragRef.current.lastY,
    );
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;

    if (dragRef.current.movedPx > 4 && followHeading) {
      setFollowHeading(false);
    }

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
    if (dragRef.current.movedPx <= 7) {
      const hit = resolveMapHitAtClient(e.clientX, e.clientY);
      if (hit) {
        onSetWaypoint(hit.wx, hit.wz, hit.label);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.14 : 0.88;
    setZoom((z) => Math.max(0.65, Math.min(3.8, Number((z * factor).toFixed(2)))));
  };

  const filteredDestinations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allDestinations.filter((loc) => {
      if (categoryFilter !== 'all' && loc.category !== categoryFilter) return false;
      if (q && !loc.label.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allDestinations, categoryFilter, searchQuery]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#070A10]/88 p-2 sm:p-4 pointer-events-auto">
      <div className="w-full max-w-5xl bg-[#101520] border border-slate-700/90 shadow-2xl flex flex-col overflow-hidden max-h-[94vh] rounded-xl">
        <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-2.5 bg-[#0B0E14] border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <MapIcon className="w-4 h-4 text-amber-400 shrink-0" />
            <h2 className="font-display text-[clamp(0.85rem,2.4vw,1rem)] font-bold tracking-wider text-slate-100 truncate">
              BHARATPUR GPS NAVIGATION
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
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-500/60 rounded text-[11px] font-mono-num text-red-200 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CLEAR GPS</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[11px] font-mono-num text-slate-200 cursor-pointer"
            >
              <span>CLOSE</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-2.5 sm:p-4 grid grid-cols-1 md:grid-cols-[1fr_285px] gap-3 bg-[#0D111A] overflow-y-auto">
          <div className="flex flex-col items-center gap-2">
            {/* Tactical Navigation Controls */}
            <div className="w-full max-w-[min(92vw,600px)] flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setView3D((v) => !v)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded border text-[10px] font-mono-num font-bold cursor-pointer ${
                    view3D
                      ? 'bg-sky-500/25 border-sky-400 text-sky-200'
                      : 'bg-emerald-500/20 border-emerald-400/60 text-emerald-200'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>{view3D ? '3D VIEW' : '2D NAV'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFollowHeading((f) => !f);
                    if (followHeading) setManualRotationDeg(0);
                  }}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded border text-[10px] font-mono-num font-bold cursor-pointer ${
                    followHeading
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                  title="Auto-rotate map with your vehicle turns"
                >
                  <Navigation className="w-3 h-3" />
                  <span>{followHeading ? 'AUTO TURN' : 'FIXED'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3.8, Number((z * 1.22).toFixed(2))))}
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
                  onClick={() => {
                    setFollowHeading(false);
                    setManualRotationDeg((r) => r - 30);
                  }}
                  aria-label="Rotate Left"
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFollowHeading(false);
                    setManualRotationDeg((r) => r + 30);
                  }}
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
                    setZoom(1.55);
                  }}
                  className="flex items-center gap-1 px-2 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-[10px] font-mono-num font-bold text-amber-200 cursor-pointer"
                >
                  <Crosshair className="w-3 h-3" />
                  <span>MY POS</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFollowHeading(false);
                    setPan({ x: 0, z: 0 });
                    setZoom(1.02);
                    setManualRotationDeg(0);
                  }}
                  className="flex items-center gap-1 px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-mono-num text-slate-200 cursor-pointer"
                >
                  <Compass className="w-3 h-3" />
                  <span>FULL CITY</span>
                </button>
              </div>
            </div>

            <div className="relative w-full max-w-[min(92vw,600px)]">
              <canvas
                ref={canvasRef}
                width={600}
                height={600}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={() => setHoveredTarget(null)}
                onWheel={handleWheel}
                style={{ touchAction: 'none' }}
                title="Tap/click any building or road to set your GPS destination"
                className="w-full aspect-square border border-slate-700/80 bg-[#080c14] cursor-crosshair select-none rounded-lg"
              />
              {hoveredTarget && (
                <div className="absolute bottom-2 left-2 right-2 pointer-events-none flex justify-center">
                  <div className="px-2.5 py-1 rounded-full bg-slate-950/90 border border-sky-400/50 text-[10px] font-mono-num text-sky-200 shadow-lg">
                    Tap to navigate: <strong className="text-amber-300">{hoveredTarget.label}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[10px] sm:text-[11px] font-mono-num text-slate-400 text-center">
              Tap any building landmark or street to set GPS · Drag to pan · Zoom {zoom.toFixed(1)}×
            </div>
          </div>

          {/* Searchable Landmarks Directory & Active Waypoint Panel */}
          <div className="flex flex-col gap-2.5 min-h-0">
            <div className="p-3 bg-[#121826] border border-slate-700/80 rounded-lg flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-display font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" /> ACTIVE ROUTE
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
                    {hud.waypoint.distanceMeters}m ({getCompassDir(hud.waypoint.x - hud.playerX, hud.waypoint.z - hud.playerZ)}) · Follow glowing road trail
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400">Tap any building on the map or pick below.</div>
              )}
            </div>

            <div className="flex flex-col gap-2 flex-1 min-h-0">
              <div className="text-[11px] font-display font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400" /> CITY LANDMARKS ({filteredDestinations.length})
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Hospital, Bank, Jail, Shop..."
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-[#090d14] border border-slate-700 focus:border-amber-400 outline-none text-xs text-slate-100 placeholder:text-slate-500"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="grid grid-cols-4 gap-1">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'service', label: 'City' },
                    { id: 'sacred', label: 'Sacred' },
                    { id: 'food', label: 'Food' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`py-1 rounded text-[10px] font-mono-num font-bold border cursor-pointer transition-colors ${
                      categoryFilter === cat.id
                        ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                        : 'bg-[#121826] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto pr-1">
                {filteredDestinations.map((loc) => {
                  const selected = hud.waypoint?.label === loc.label;
                  const dist = Math.round(Math.hypot(loc.x - hud.playerX, loc.z - hud.playerZ));
                  const dir = getCompassDir(loc.x - hud.playerX, loc.z - hud.playerZ);
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        setFollowHeading(false);
                        onSetWaypoint(loc.x, loc.z, loc.label);
                        setPan({ x: loc.x, z: loc.z });
                        setZoom((z) => Math.max(1.35, z));
                      }}
                      className={`flex items-center justify-between gap-2 px-2.5 py-2 border rounded-lg text-left transition-colors cursor-pointer ${
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
                              : loc.id === 'hospital'
                                ? 'bg-red-600 text-white'
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
                        {dist}m {dir}
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
