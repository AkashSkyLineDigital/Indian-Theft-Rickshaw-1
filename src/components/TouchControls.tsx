import React, { useRef, useState } from 'react';
import {
  ArrowUp,
  Car,
  Crosshair,
  Disc,
  Eye,
  HardHat,
  HeartPulse,
  Map as MapIcon,
  Mic,
  Settings,
  Smartphone,
  Zap,
  ZoomIn,
} from 'lucide-react';

interface TouchControlsProps {
  inJail?: boolean;
  inVehicle: boolean;
  canUseMedkit: boolean;
  micListening: boolean;
  firstPerson: boolean;
  adsActive: boolean;
  canAds: boolean;
  hasHelmet: boolean;
  helmetOn: boolean;
  isBike: boolean;
  contextLabel: string | null;
  onMove: (x: number, y: number) => void;
  onSprint: (active: boolean) => void;
  onCameraDelta: (dx: number, dy: number) => void;
  onAttack: () => void;
  onJump: () => void;
  onEnterExit: () => void;
  onUseMedkit: () => void;
  onContextAction: () => void;
  onToggleMic: () => void;
  onToggleFirstPerson: () => void;
  onToggleAds: () => void;
  onToggleHelmet: () => void;
  onOpenMap: () => void;
  onOpenWheel: () => void;
  onOpenPhone: () => void;
  onOpenSettings: () => void;
  canSurrender?: boolean;
  canStreetBribe?: boolean;
  onSurrender?: () => void;
  onOfferStreetBribe?: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  inJail = false,
  inVehicle,
  canUseMedkit,
  micListening,
  firstPerson,
  adsActive,
  canAds,
  hasHelmet,
  helmetOn,
  isBike,
  contextLabel,
  onMove,
  onSprint,
  onCameraDelta,
  onAttack,
  onJump,
  onEnterExit,
  onUseMedkit,
  onContextAction,
  onToggleMic,
  onToggleFirstPerson,
  onToggleAds,
  onToggleHelmet,
  onOpenMap,
  onOpenWheel,
  onOpenPhone,
  onOpenSettings,
  canSurrender,
  canStreetBribe,
  onSurrender,
  onOfferStreetBribe,
}) => {
  const padRef = useRef<HTMLDivElement | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const lookTouchRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const stickTouchId = useRef<number | null>(null);

  const updateStick = (clientX: number, clientY: number) => {
    const pad = padRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width * 0.38;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    setKnob({ x: dx, y: dy });
    // +X = right, +Y = forward (-dy on screen)
    onMove(dx / maxR, -dy / maxR);
  };

  return (
    <div className="fixed inset-0 z-15 pointer-events-none select-none">
      {/* Right-half touch camera drag surface */}
      <div
        className="absolute inset-y-0 right-0 w-1/2 pointer-events-auto"
        onTouchStart={(e) => {
          if (e.target !== e.currentTarget) return;
          const t = e.changedTouches[0];
          if (t) lookTouchRef.current = { id: t.identifier, x: t.clientX, y: t.clientY };
        }}
        onTouchMove={(e) => {
          const ref = lookTouchRef.current;
          if (!ref) return;
          for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            if (t.identifier === ref.id) {
              onCameraDelta(t.clientX - ref.x, t.clientY - ref.y);
              ref.x = t.clientX;
              ref.y = t.clientY;
            }
          }
        }}
        onTouchEnd={(e) => {
          const ref = lookTouchRef.current;
          if (!ref) return;
          for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === ref.id) {
              lookTouchRef.current = null;
            }
          }
        }}
      />

      {/* Left Virtual Analog Joystick (above minimap) */}
      <div
        ref={padRef}
        className="absolute bottom-52 left-6 w-32 h-32 rounded-full bg-[#101520]/80 border-2 border-slate-500/70 flex items-center justify-center pointer-events-auto touch-none"
        onTouchStart={(e) => {
          const t = e.changedTouches[0];
          if (!t) return;
          stickTouchId.current = t.identifier;
          updateStick(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          if (stickTouchId.current === null) return;
          for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            if (t.identifier === stickTouchId.current) {
              updateStick(t.clientX, t.clientY);
            }
          }
        }}
        onTouchEnd={() => {
          stickTouchId.current = null;
          setKnob({ x: 0, y: 0 });
          onMove(0, 0);
        }}
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse') {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            updateStick(e.clientX, e.clientY);
          }
        }}
        onPointerMove={(e) => {
          if (e.pointerType === 'mouse' && e.buttons === 1) {
            updateStick(e.clientX, e.clientY);
          }
        }}
        onPointerUp={(e) => {
          if (e.pointerType === 'mouse') {
            setKnob({ x: 0, y: 0 });
            onMove(0, 0);
          }
        }}
      >
        <div
          style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
          className="w-12 h-12 rounded-full bg-amber-500 border-2 border-[#0B0E14] shadow-lg"
        />
      </div>

      {/* Right-Side Touch Action Cluster */}
      <div className="absolute bottom-24 right-5 flex flex-col items-end gap-3 pointer-events-auto">
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {canStreetBribe && onOfferStreetBribe && (
            <button
              type="button"
              onClick={onOfferStreetBribe}
              className="px-3 h-11 rounded-full bg-amber-500 border border-[#0B0E14] flex items-center justify-center text-[#0B0E14] text-[11px] font-bold active:scale-95 shadow-lg"
            >
              BRIBE ₹3K
            </button>
          )}
          {canSurrender && onSurrender && (
            <button
              type="button"
              onClick={onSurrender}
              className="px-3 h-11 rounded-full bg-sky-600 border border-sky-200 flex items-center justify-center text-white text-[11px] font-bold active:scale-95 shadow-lg"
            >
              SURRENDER
            </button>
          )}
          {contextLabel && (
            <button
              type="button"
              onClick={onContextAction}
              className="px-3.5 h-12 rounded-full bg-amber-500 border border-[#0B0E14] flex items-center justify-center text-[#0B0E14] text-xs font-bold active:scale-95 shadow-lg"
            >
              {contextLabel}
            </button>
          )}
          {canUseMedkit && (
            <button
              type="button"
              onClick={onUseMedkit}
              className="w-11 h-11 rounded-full bg-emerald-600/90 border border-emerald-300 flex items-center justify-center text-white active:scale-95"
              aria-label="Use Medkit"
            >
              <HeartPulse className="w-5 h-5" />
            </button>
          )}
          {!inVehicle && (
            <button
              type="button"
              onClick={onToggleFirstPerson}
              className={`w-11 h-11 rounded-full border flex flex-col items-center justify-center active:scale-95 ${
                firstPerson
                  ? 'bg-sky-600 border-sky-300 text-white'
                  : 'bg-[#141A26]/90 border-slate-600 text-slate-200'
              }`}
              aria-label="First Person View"
            >
              <Eye className="w-4 h-4" />
              <span className="text-[8px] font-bold">FPV</span>
            </button>
          )}
          {!inVehicle && canAds && (
            <button
              type="button"
              onClick={onToggleAds}
              className={`w-11 h-11 rounded-full border flex flex-col items-center justify-center active:scale-95 ${
                adsActive
                  ? 'bg-amber-500 border-amber-200 text-[#0B0E14]'
                  : 'bg-[#141A26]/90 border-amber-500/70 text-amber-300'
              }`}
              aria-label="Toggle Scope"
            >
              <ZoomIn className="w-4 h-4" />
              <span className="text-[8px] font-bold">AIM</span>
            </button>
          )}
          {(hasHelmet || isBike) && (
            <button
              type="button"
              onClick={onToggleHelmet}
              className={`w-11 h-11 rounded-full border flex flex-col items-center justify-center active:scale-95 ${
                helmetOn
                  ? 'bg-emerald-600 border-emerald-300 text-white'
                  : 'bg-[#141A26]/90 border-amber-500/70 text-amber-300'
              }`}
              aria-label="Toggle Helmet"
            >
              <HardHat className="w-4 h-4" />
              <span className="text-[8px] font-bold">HELM</span>
            </button>
          )}
          {!inJail && (
            <>
              <button
                type="button"
                onClick={onToggleMic}
                className={`w-11 h-11 rounded-full border flex items-center justify-center active:scale-95 ${
                  micListening
                    ? 'bg-red-600 border-red-300 text-white'
                    : 'bg-[#141A26]/90 border-emerald-500/70 text-emerald-300'
                }`}
                aria-label="Voice Mic"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onOpenMap}
                className="w-11 h-11 rounded-full bg-[#141A26]/90 border border-sky-500/70 flex items-center justify-center text-sky-300 active:scale-95"
                aria-label="City Map"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-11 h-11 rounded-full bg-[#141A26]/90 border border-slate-600 flex items-center justify-center text-slate-200 active:scale-95"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          {!inJail && (
            <>
              <button
                type="button"
                onClick={onOpenPhone}
                className="w-11 h-11 rounded-full bg-[#141A26]/90 border border-slate-600 flex items-center justify-center text-sky-400 active:scale-95"
                aria-label="Phone"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onOpenWheel}
                className="w-11 h-11 rounded-full bg-[#141A26]/90 border border-amber-500/70 flex items-center justify-center text-amber-400 active:scale-95"
                aria-label="Weapon Wheel"
              >
                <Disc className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onTouchStart={() => onSprint(true)}
            onTouchEnd={() => onSprint(false)}
            onMouseDown={() => onSprint(true)}
            onMouseUp={() => onSprint(false)}
            className="w-13 h-13 rounded-full bg-[#141A26]/90 border border-slate-600 flex flex-col items-center justify-center text-slate-200 active:bg-amber-500 active:text-[#0B0E14]"
          >
            <Zap className="w-4 h-4" />
            <span className="text-[9px] font-bold">RUN</span>
          </button>
          {!inVehicle && (
            <button
              type="button"
              onClick={onJump}
              className="w-13 h-13 rounded-full bg-[#141A26]/90 border border-emerald-500/70 flex flex-col items-center justify-center text-emerald-300 active:scale-95"
            >
              <ArrowUp className="w-4 h-4" />
              <span className="text-[9px] font-bold">JUMP</span>
            </button>
          )}
          {!inJail && (
            <button
              type="button"
              onClick={onEnterExit}
              className="w-13 h-13 rounded-full bg-[#141A26]/90 border border-sky-500/70 flex flex-col items-center justify-center text-sky-300 active:scale-95"
            >
              <Car className="w-4 h-4" />
              <span className="text-[9px] font-bold">{inVehicle ? 'EXIT' : 'CAR'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onAttack}
            className="w-16 h-16 rounded-full bg-red-600/90 border-2 border-red-400 flex flex-col items-center justify-center text-white shadow-xl active:scale-95"
          >
            <Crosshair className="w-5 h-5" />
            <span className="text-[10px] font-bold">{inJail ? 'PUNCH' : 'FIRE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
