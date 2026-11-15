import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Car,
  Crosshair,
  Disc,
  Eye,
  HardHat,
  HeartPulse,
  Map as MapIcon,
  Mic,
  Radio,
  Settings,
  Smartphone,
  Volume2,
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
  buttonScale?: number;
  opacity?: number;
  movementStyle?: 'joystick' | 'dpad';
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
  onRadio?: () => void;
  onHorn?: () => void;
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
  buttonScale = 1,
  opacity = 0.9,
  movementStyle = 'joystick',
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
  onRadio,
  onHorn,
  canSurrender,
  canStreetBribe,
  onSurrender,
  onOfferStreetBribe,
}) => {
  const padRef = useRef<HTMLDivElement | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const lookTouchRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const stickTouchId = useRef<number | null>(null);

  // Independent multi-touch digital states for D-Pad & Driving Paddles
  const digitalMoveRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    gas: false,
    rev: false,
    steerLeft: false,
    steerRight: false,
  });

  const [activeVisual, setActiveVisual] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
    gas: false,
    rev: false,
    steerLeft: false,
    steerRight: false,
    sprint: false,
  });

  const syncDigitalAxes = (vehicleMode: boolean) => {
    const m = digitalMoveRef.current;
    if (vehicleMode) {
      const steer = (m.steerRight ? 1 : 0) - (m.steerLeft ? 1 : 0);
      const throttle = (m.gas ? 1 : 0) - (m.rev ? 1 : 0);
      onMove(steer, throttle);
    } else {
      const mx = (m.right ? 1 : 0) - (m.left ? 1 : 0);
      const my = (m.up ? 1 : 0) - (m.down ? 1 : 0);
      const len = Math.hypot(mx, my);
      if (len > 1) {
        onMove(mx / len, my / len);
      } else {
        onMove(mx, my);
      }
    }
  };

  // Clear stuck holds whenever player enters/exits a vehicle or changes movement style
  useEffect(() => {
    stickTouchId.current = null;
    setKnob({ x: 0, y: 0 });
    digitalMoveRef.current = {
      up: false,
      down: false,
      left: false,
      right: false,
      gas: false,
      rev: false,
      steerLeft: false,
      steerRight: false,
    };
    setActiveVisual({
      up: false,
      down: false,
      left: false,
      right: false,
      gas: false,
      rev: false,
      steerLeft: false,
      steerRight: false,
      sprint: false,
    });
    onMove(0, 0);
    onSprint(false);
  }, [inVehicle, movementStyle, onMove, onSprint]);

  const setDigitalKey = (
    key: keyof typeof digitalMoveRef.current,
    pressed: boolean,
    vehicleMode: boolean,
  ) => {
    if (digitalMoveRef.current[key] === pressed) return;
    digitalMoveRef.current[key] = pressed;
    setActiveVisual((prev) => ({ ...prev, [key]: pressed }));
    syncDigitalAxes(vehicleMode);
  };

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
    onMove(dx / maxR, -dy / maxR);
  };

  const clampedScale = Math.max(0.72, Math.min(1.35, buttonScale));
  const clampedOpacity = Math.max(0.4, Math.min(1, opacity));

  const bindHoldPointer = (
    key: keyof typeof digitalMoveRef.current,
    vehicleMode: boolean,
  ) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setDigitalKey(key, true, vehicleMode);
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setDigitalKey(key, false, vehicleMode);
    },
    onPointerCancel: () => setDigitalKey(key, false, vehicleMode),
    onLostPointerCapture: () => setDigitalKey(key, false, vehicleMode),
  });

  return (
    <div
      className="fixed inset-0 z-15 pointer-events-none select-none touch-none"
      style={{ opacity: clampedOpacity }}
    >
      {/* Right-half touch camera drag surface */}
      <div
        className="absolute inset-y-0 right-0 w-1/2 pointer-events-auto touch-none"
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

      {/* LEFT SIDE MOVEMENT CLUSTER (Positioned cleanly above responsive minimap) */}
      <div
        className="absolute bottom-[clamp(118px,26vw,206px)] left-[clamp(10px,2.5vw,24px)] pointer-events-auto touch-none"
        style={{
          transform: `scale(${clampedScale})`,
          transformOrigin: 'bottom left',
        }}
      >
        {inVehicle ? (
          /* DRIVING MODE: Left & Right Steering Paddles */
          <div className="flex items-center gap-2.5 bg-[#0B0E14]/75 p-2 rounded-2xl border border-slate-600/80 shadow-xl">
            <button
              type="button"
              aria-label="Steer Left"
              {...bindHoldPointer('steerLeft', true)}
              className={`w-[clamp(56px,13vw,68px)] h-[clamp(52px,11vw,62px)] rounded-xl border-2 flex flex-col items-center justify-center transition-colors cursor-pointer touch-none ${
                activeVisual.steerLeft
                  ? 'bg-amber-500 border-amber-200 text-[#0B0E14]'
                  : 'bg-[#141A26]/95 border-slate-500/80 text-slate-100'
              }`}
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-[9px] font-mono-num font-bold">LEFT</span>
            </button>
            <button
              type="button"
              aria-label="Steer Right"
              {...bindHoldPointer('steerRight', true)}
              className={`w-[clamp(56px,13vw,68px)] h-[clamp(52px,11vw,62px)] rounded-xl border-2 flex flex-col items-center justify-center transition-colors cursor-pointer touch-none ${
                activeVisual.steerRight
                  ? 'bg-amber-500 border-amber-200 text-[#0B0E14]'
                  : 'bg-[#141A26]/95 border-slate-500/80 text-slate-100'
              }`}
            >
              <ArrowRight className="w-6 h-6" />
              <span className="text-[9px] font-mono-num font-bold">RIGHT</span>
            </button>
          </div>
        ) : movementStyle === 'dpad' ? (
          /* ON-FOOT MODE: 4-Way D-Pad */
          <div className="grid grid-cols-3 gap-1 w-[clamp(116px,26vw,138px)] h-[clamp(116px,26vw,138px)] p-1.5 rounded-2xl bg-[#0B0E14]/75 border border-slate-600/80 shadow-xl">
            <div />
            <button
              type="button"
              aria-label="Move Forward"
              {...bindHoldPointer('up', false)}
              className={`rounded-lg border flex items-center justify-center touch-none ${
                activeVisual.up
                  ? 'bg-amber-500 border-amber-200 text-[#0B0E14]'
                  : 'bg-[#141A26]/95 border-slate-600 text-slate-100'
              }`}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <div />
            <button
              type="button"
              aria-label="Move Left"
              {...bindHoldPointer('left', false)}
              className={`rounded-lg border flex items-center justify-center touch-none ${
                activeVisual.left
                  ? 'bg-amber-500 border-amber-200 text-[#0B0E14]'
                  : 'bg-[#141A26]/95 border-slate-600 text-slate-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="rounded-full bg-slate-800/70 border border-slate-700/60" />
            <button
              type="button"
              aria-label="Move Right"
              {...bindHoldPointer('right', false)}
              className={`rounded-lg border flex items-center justify-center touch-none ${
                activeVisual.right
                  ? 'bg-amber-500 border-amber-200 text-[#0B0E14]'
                  : 'bg-[#141A26]/95 border-slate-600 text-slate-100'
              }`}
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div />
            <button
              type="button"
              aria-label="Move Backward"
              {...bindHoldPointer('down', false)}
              className={`rounded-lg border flex items-center justify-center touch-none ${
                activeVisual.down
                  ? 'bg-amber-500 border-amber-200 text-[#0B0E14]'
                  : 'bg-[#141A26]/95 border-slate-600 text-slate-100'
              }`}
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <div />
          </div>
        ) : (
          /* ON-FOOT MODE: Virtual Analog Thumbstick */
          <div
            ref={padRef}
            className="w-[clamp(104px,24vw,128px)] h-[clamp(104px,24vw,128px)] rounded-full bg-[#101520]/82 border-2 border-slate-500/75 flex items-center justify-center pointer-events-auto touch-none shadow-xl"
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
            onTouchCancel={() => {
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
              className="w-11 h-11 rounded-full bg-amber-500 border-2 border-[#0B0E14] shadow-lg"
            />
          </div>
        )}
      </div>

      {/* RIGHT-SIDE TOUCH ACTION CLUSTER */}
      <div
        className="absolute bottom-[clamp(14px,3vw,26px)] right-[clamp(10px,2.5vw,20px)] flex flex-col items-end gap-2.5 pointer-events-auto max-w-[66vw]"
        style={{
          transform: `scale(${clampedScale})`,
          transformOrigin: 'bottom right',
        }}
      >
        {/* Contextual & Secondary Utility Row */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {canStreetBribe && onOfferStreetBribe && (
            <button
              type="button"
              onClick={onOfferStreetBribe}
              className="px-2.5 h-10 rounded-full bg-amber-500 border border-[#0B0E14] flex items-center justify-center text-[#0B0E14] text-[10px] font-bold active:scale-95 shadow-lg cursor-pointer"
            >
              BRIBE ₹3K
            </button>
          )}
          {canSurrender && onSurrender && (
            <button
              type="button"
              onClick={onSurrender}
              className="px-2.5 h-10 rounded-full bg-sky-600 border border-sky-200 flex items-center justify-center text-white text-[10px] font-bold active:scale-95 shadow-lg cursor-pointer"
            >
              SURRENDER
            </button>
          )}
          {contextLabel && (
            <button
              type="button"
              onClick={onContextAction}
              className="px-3 h-10 rounded-full bg-amber-500 border border-[#0B0E14] flex items-center justify-center text-[#0B0E14] text-[11px] font-bold active:scale-95 shadow-lg cursor-pointer"
            >
              {contextLabel}
            </button>
          )}
          {canUseMedkit && (
            <button
              type="button"
              onClick={onUseMedkit}
              className="w-10 h-10 rounded-full bg-emerald-600/95 border border-emerald-300 flex items-center justify-center text-white active:scale-95 cursor-pointer"
              aria-label="Use Medkit"
            >
              <HeartPulse className="w-4 h-4" />
            </button>
          )}
          {!inVehicle && (
            <button
              type="button"
              onClick={onToggleFirstPerson}
              className={`w-10 h-10 rounded-full border flex flex-col items-center justify-center active:scale-95 cursor-pointer ${
                firstPerson
                  ? 'bg-sky-600 border-sky-300 text-white'
                  : 'bg-[#141A26]/95 border-slate-600 text-slate-200'
              }`}
              aria-label="First Person View"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="text-[7px] font-bold leading-none mt-0.5">FPV</span>
            </button>
          )}
          {!inVehicle && canAds && (
            <button
              type="button"
              onClick={onToggleAds}
              className={`w-10 h-10 rounded-full border flex flex-col items-center justify-center active:scale-95 cursor-pointer ${
                adsActive
                  ? 'bg-amber-500 border-amber-200 text-[#0B0E14]'
                  : 'bg-[#141A26]/95 border-amber-500/70 text-amber-300'
              }`}
              aria-label="Toggle Scope"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span className="text-[7px] font-bold leading-none mt-0.5">AIM</span>
            </button>
          )}
          {(hasHelmet || isBike) && (
            <button
              type="button"
              onClick={onToggleHelmet}
              className={`w-10 h-10 rounded-full border flex flex-col items-center justify-center active:scale-95 cursor-pointer ${
                helmetOn
                  ? 'bg-emerald-600 border-emerald-300 text-white'
                  : 'bg-[#141A26]/95 border-amber-500/70 text-amber-300'
              }`}
              aria-label="Toggle Helmet"
            >
              <HardHat className="w-3.5 h-3.5" />
              <span className="text-[7px] font-bold leading-none mt-0.5">HELM</span>
            </button>
          )}
          {!inJail && onRadio && (
            <button
              type="button"
              onClick={onRadio}
              className="w-10 h-10 rounded-full bg-[#141A26]/95 border border-cyan-500/70 flex flex-col items-center justify-center text-cyan-300 active:scale-95 cursor-pointer"
              aria-label="Police Radio Chatter"
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="text-[7px] font-bold leading-none mt-0.5">RADIO</span>
            </button>
          )}
          {!inJail && (
            <>
              <button
                type="button"
                onClick={onToggleMic}
                className={`w-10 h-10 rounded-full border flex flex-col items-center justify-center active:scale-95 cursor-pointer ${
                  micListening
                    ? 'bg-red-600 border-red-300 text-white'
                    : 'bg-[#141A26]/95 border-emerald-500/70 text-emerald-300'
                }`}
                aria-label="Voice Mic"
              >
                <Mic className="w-3.5 h-3.5" />
                <span className="text-[7px] font-bold leading-none mt-0.5">MIC</span>
              </button>
              <button
                type="button"
                onClick={onOpenMap}
                className="w-10 h-10 rounded-full bg-[#141A26]/95 border border-sky-500/70 flex flex-col items-center justify-center text-sky-300 active:scale-95 cursor-pointer"
                aria-label="City Map"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span className="text-[7px] font-bold leading-none mt-0.5">MAP</span>
              </button>
              <button
                type="button"
                onClick={onOpenPhone}
                className="w-10 h-10 rounded-full bg-[#141A26]/95 border border-slate-600 flex flex-col items-center justify-center text-sky-400 active:scale-95 cursor-pointer"
                aria-label="Phone"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[7px] font-bold leading-none mt-0.5">OS</span>
              </button>
              {!inVehicle && (
                <button
                  type="button"
                  onClick={onOpenWheel}
                  className="w-10 h-10 rounded-full bg-[#141A26]/95 border border-amber-500/70 flex flex-col items-center justify-center text-amber-400 active:scale-95 cursor-pointer"
                  aria-label="Weapon Wheel"
                >
                  <Disc className="w-3.5 h-3.5" />
                  <span className="text-[7px] font-bold leading-none mt-0.5">GUNS</span>
                </button>
              )}
            </>
          )}
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-full bg-[#141A26]/95 border border-slate-600 flex flex-col items-center justify-center text-slate-200 active:scale-95 cursor-pointer"
            aria-label="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="text-[7px] font-bold leading-none mt-0.5">SET</span>
          </button>
        </div>

        {/* PRIMARY ERGONOMIC ACTION PAD: Auto-Switches On-Foot <-> Driving Mode */}
        {inVehicle ? (
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={onEnterExit}
              className="w-12 h-12 rounded-full bg-[#141A26]/95 border-2 border-sky-400/80 flex flex-col items-center justify-center text-sky-300 active:scale-95 shadow-lg cursor-pointer"
            >
              <Car className="w-4 h-4" />
              <span className="text-[8px] font-bold">EXIT</span>
            </button>
            {onHorn && (
              <button
                type="button"
                onClick={onHorn}
                className="w-12 h-12 rounded-full bg-[#141A26]/95 border-2 border-amber-400/80 flex flex-col items-center justify-center text-amber-300 active:scale-95 shadow-lg cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span className="text-[8px] font-bold">HORN</span>
              </button>
            )}
            <button
              type="button"
              {...bindHoldPointer('rev', true)}
              className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center shadow-lg cursor-pointer touch-none ${
                activeVisual.rev
                  ? 'bg-red-500 border-red-200 text-white'
                  : 'bg-red-950/90 border-red-400/80 text-red-200'
              }`}
            >
              <ArrowDown className="w-5 h-5" />
              <span className="text-[9px] font-mono-num font-bold">BRAKE/REV</span>
            </button>
            <button
              type="button"
              {...bindHoldPointer('gas', true)}
              className={`w-16 h-20 rounded-2xl border-2 flex flex-col items-center justify-center shadow-xl cursor-pointer touch-none ${
                activeVisual.gas
                  ? 'bg-emerald-400 border-emerald-100 text-[#07100B]'
                  : 'bg-emerald-600/95 border-emerald-300 text-white'
              }`}
            >
              <ArrowUp className="w-6 h-6" />
              <span className="text-[11px] font-mono-num font-extrabold">GAS</span>
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                  // ignore
                }
                setActiveVisual((p) => ({ ...p, sprint: true }));
                onSprint(true);
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                setActiveVisual((p) => ({ ...p, sprint: false }));
                onSprint(false);
              }}
              onPointerCancel={() => {
                setActiveVisual((p) => ({ ...p, sprint: false }));
                onSprint(false);
              }}
              onLostPointerCapture={() => {
                setActiveVisual((p) => ({ ...p, sprint: false }));
                onSprint(false);
              }}
              className={`w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center cursor-pointer touch-none ${
                activeVisual.sprint
                  ? 'bg-amber-500 border-amber-200 text-[#0B0E14]'
                  : 'bg-[#141A26]/95 border-slate-500 text-slate-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span className="text-[8px] font-bold">RUN</span>
            </button>
            <button
              type="button"
              onClick={onJump}
              className="w-12 h-12 rounded-full bg-[#141A26]/95 border-2 border-emerald-500/80 flex flex-col items-center justify-center text-emerald-300 active:scale-95 cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
              <span className="text-[8px] font-bold">JUMP</span>
            </button>
            {!inJail && (
              <button
                type="button"
                onClick={onEnterExit}
                className="w-12 h-12 rounded-full bg-[#141A26]/95 border-2 border-sky-500/80 flex flex-col items-center justify-center text-sky-300 active:scale-95 cursor-pointer"
              >
                <Car className="w-4 h-4" />
                <span className="text-[8px] font-bold">CAR</span>
              </button>
            )}
            <button
              type="button"
              onClick={onAttack}
              className="w-15 h-15 rounded-full bg-red-600/95 border-2 border-red-300 flex flex-col items-center justify-center text-white shadow-xl active:scale-95 cursor-pointer"
            >
              <Crosshair className="w-5 h-5" />
              <span className="text-[9px] font-bold">{inJail ? 'PUNCH' : 'FIRE'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
