import React, { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { WEAPON_ORDER, WEAPONS, WeaponId, formatRs } from '../types/game';
import { WeaponIcon } from './WeaponIcon';

interface WeaponWheelProps {
  activeWeapon: WeaponId;
  ownedWeapons: WeaponId[];
  ammo: Record<WeaponId, number>;
  onSelect: (id: WeaponId) => void;
  onClose: () => void;
}

export const WeaponWheel: React.FC<WeaponWheelProps> = ({
  activeWeapon,
  ownedWeapons,
  ammo,
  onSelect,
  onClose,
}) => {
  const [hovered, setHovered] = useState<WeaponId>(activeWeapon);
  const [virtualPos, setVirtualPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPointerLocked, setIsPointerLocked] = useState<boolean>(
    () => typeof document !== 'undefined' && Boolean(document.pointerLockElement),
  );

  const initialWeaponRef = useRef<WeaponId>(activeWeapon);
  const hoveredRef = useRef<WeaponId>(activeWeapon);
  const ownedRef = useRef<WeaponId[]>(ownedWeapons);
  const onSelectRef = useRef(onSelect);
  const virtualRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const selectedByClickRef = useRef(false);
  const hasMovedSliceRef = useRef(false);

  hoveredRef.current = hovered;
  ownedRef.current = ownedWeapons;
  onSelectRef.current = onSelect;

  // Track mouse angle both when pointer is locked (movementX/Y virtual radial cursor)
  // and when unlocked (clientX/clientY from screen center), so pointer lock never drops on Q!
  useEffect(() => {
    const onLockChange = () => {
      setIsPointerLocked(Boolean(document.pointerLockElement));
    };

    const onMove = (e: MouseEvent) => {
      let dx = 0;
      let dy = 0;

      if (document.pointerLockElement) {
        let nx = virtualRef.current.x + (e.movementX || 0);
        let ny = virtualRef.current.y + (e.movementY || 0);
        const len = Math.hypot(nx, ny);
        if (len > 155) {
          nx = (nx / len) * 155;
          ny = (ny / len) * 155;
        }
        virtualRef.current = { x: nx, y: ny };
        setVirtualPos({ x: nx, y: ny });
        dx = nx;
        dy = ny;
        if (Math.hypot(dx, dy) < 24) return;
      } else {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        dx = e.clientX - cx;
        dy = e.clientY - cy;
        if (Math.hypot(dx, dy) < 38) return;
      }

      // Angle starting at top (-PI/2) going clockwise
      let angle = Math.atan2(dy, dx) + Math.PI / 2;
      if (angle < 0) angle += Math.PI * 2;
      const slice = (Math.PI * 2) / WEAPON_ORDER.length;
      const index = Math.floor(((angle + slice / 2) % (Math.PI * 2)) / slice);
      const wid = WEAPON_ORDER[index];
      if (wid && ownedRef.current.includes(wid)) {
        if (hoveredRef.current !== wid) {
          hasMovedSliceRef.current = true;
        }
        hoveredRef.current = wid;
        setHovered(wid);
      }
    };

    document.addEventListener('pointerlockchange', onLockChange);
    window.addEventListener('mousemove', onMove);
    return () => {
      document.removeEventListener('pointerlockchange', onLockChange);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  // Equip chosen weapon once when wheel closes/unmounts only if user actually changed slice
  useEffect(() => {
    return () => {
      if (
        !selectedByClickRef.current &&
        hasMovedSliceRef.current &&
        hoveredRef.current !== initialWeaponRef.current &&
        ownedRef.current.includes(hoveredRef.current)
      ) {
        onSelectRef.current(hoveredRef.current);
      }
    };
  }, []);

  const spec = WEAPONS[hovered];
  const radius = 152;

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-[#06090F]/55 select-none p-2"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          onClose();
        }
      }}
    >
      <div className="relative w-[390px] h-[390px] flex items-center justify-center scale-[0.76] xs:scale-[0.88] sm:scale-100">
        {/* Outer radial ring */}
        <div className="absolute inset-4 rounded-full border-2 border-slate-700/60 bg-[#0B0E14]/70 pointer-events-none" />

        {/* Virtual radial cursor indicator when mouse pointer lock stays active */}
        {isPointerLocked && Math.hypot(virtualPos.x, virtualPos.y) > 8 && (
          <div
            className="absolute w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-[#0B0E14] shadow-[0_0_10px_rgba(245,158,11,0.9)] pointer-events-none z-20"
            style={{
              transform: `translate(${virtualPos.x}px, ${virtualPos.y}px)`,
            }}
          />
        )}

        {/* Center weapon detail hub */}
        <div className="relative z-10 w-36 h-36 rounded-full bg-[#101520] border-2 border-amber-500/70 flex flex-col items-center justify-center text-center p-3 shadow-2xl">
          <WeaponIcon weaponId={hovered} className="w-16 h-8 mb-1" />
          <div className="font-display text-xs font-bold text-slate-100 leading-tight">
            {spec.shortName}
          </div>
          <div className="text-[10px] font-mono-num text-amber-400 mt-0.5">
            {hovered === 'fists'
              ? 'MELEE · 26 DMG'
              : `${ammo[hovered] ?? 0} RDS · ${spec.caliber}`}
          </div>
          <div className="text-[9px] text-slate-400 mt-1">
            {isPointerLocked ? 'Move Mouse · Release Q' : 'Tap Slot or Release Q'}
          </div>
        </div>

        {/* 5 Radial Weapon Slots */}
        {WEAPON_ORDER.map((wid, idx) => {
          const angle = -Math.PI / 2 + (idx * Math.PI * 2) / WEAPON_ORDER.length;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const owned = ownedWeapons.includes(wid);
          const isSelected = hovered === wid;
          const wSpec = WEAPONS[wid];

          return (
            <button
              key={wid}
              type="button"
              onMouseEnter={() => {
                if (owned) {
                  if (hoveredRef.current !== wid) hasMovedSliceRef.current = true;
                  hoveredRef.current = wid;
                  setHovered(wid);
                }
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.blur();
                if (!owned) return;
                selectedByClickRef.current = true;
                hoveredRef.current = wid;
                setHovered(wid);
                onSelect(wid);
                onClose();
              }}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
              className={`absolute w-28 h-24 -ml-14 -mt-12 flex flex-col items-center justify-center gap-1 p-2 border transition-transform duration-100 ${
                isSelected
                  ? 'bg-amber-500/25 border-amber-400 scale-105 cursor-pointer shadow-lg'
                  : owned
                    ? 'bg-[#111622]/95 border-slate-600/80 hover:border-amber-400/70 cursor-pointer'
                    : 'bg-[#0B0E14]/85 border-slate-800/80 opacity-60 cursor-not-allowed'
              }`}
            >
              <WeaponIcon weaponId={wid} className="w-14 h-7" />
              <span className="text-[11px] font-semibold text-slate-100 leading-none">
                {wSpec.shortName}
              </span>
              {owned ? (
                <span className="text-[10px] font-mono-num text-emerald-400">
                  {wid === 'fists' ? 'READY' : `${ammo[wid] ?? 0} RDS`}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-mono-num text-amber-400">
                  <Lock className="w-2.5 h-2.5" />
                  {formatRs(wSpec.price)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
