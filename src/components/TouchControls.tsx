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
  Hand,
  HardHat,
  HeartPulse,
  Lightbulb,
  Map as MapIcon,
  Mic,
  Radio,
  Settings,
  Smartphone,
  Volume2,
  Zap,
  ZoomIn,
} from 'lucide-react';
import {
  CameraViewMode,
  CustomHudConfig,
  DEFAULT_CUSTOM_HUD,
  HudControlId,
  HudElementConfig,
} from '../types/game';

interface TouchControlsProps {
  inJail?: boolean;
  inVehicle: boolean;
  isChopper?: boolean;
  headlightsOn?: boolean;
  canUseMedkit: boolean;
  micListening: boolean;
  voiceMicEnabled?: boolean;
  firstPerson: boolean;
  cameraMode?: CameraViewMode;
  adsActive: boolean;
  canAds: boolean;
  hasHelmet: boolean;
  helmetOn: boolean;
  isBike: boolean;
  contextLabel: string | null;
  buttonScale?: number;
  opacity?: number;
  movementStyle?: 'joystick' | 'dpad';
  customHud?: CustomHudConfig;
  onMove: (x: number, y: number) => void;
  onSprint: (active: boolean) => void;
  onCameraDelta: (dx: number, dy: number) => void;
  onAttack: () => void;
  onAttackHeld?: (held: boolean) => void;
  onJump: () => void;
  onEnterExit: () => void;
  onUseMedkit: () => void;
  onContextAction: () => void;
  onToggleMic: () => void;
  onToggleFirstPerson: () => void;
  onToggleHeadlights?: () => void;
  onChopperAltitude?: (ascend: boolean, descend: boolean) => void;
  onToggleAds: () => void;
  onSetAds?: (active: boolean) => void;
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
  isChopper = false,
  headlightsOn = true,
  canUseMedkit,
  micListening,
  voiceMicEnabled = false,
  firstPerson,
  cameraMode = 'third_far',
  adsActive,
  canAds,
  hasHelmet,
  helmetOn,
  isBike,
  contextLabel,
  buttonScale = 1,
  opacity = 0.9,
  movementStyle = 'joystick',
  customHud,
  onMove,
  onSprint,
  onCameraDelta,
  onAttack,
  onAttackHeld,
  onJump,
  onEnterExit,
  onUseMedkit,
  onContextAction,
  onToggleMic,
  onToggleFirstPerson,
  onToggleHeadlights,
  onChopperAltitude,
  onToggleAds,
  onSetAds,
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
  const hudElements = customHud?.elements ?? DEFAULT_CUSTOM_HUD.elements;
  const chopperClimbRef = useRef({ asc: false, desc: false });
  const [chopperClimbVisual, setChopperClimbVisual] = useState({ asc: false, desc: false });

  // Store callback props in refs so re-renders from HUD updates NEVER reset active touch holds
  const onMoveRef = useRef(onMove);
  const onSprintRef = useRef(onSprint);
  const onCameraDeltaRef = useRef(onCameraDelta);
  const onAttackHeldRef = useRef(onAttackHeld);
  const onSetAdsRef = useRef(onSetAds);

  onMoveRef.current = onMove;
  onSprintRef.current = onSprint;
  onCameraDeltaRef.current = onCameraDelta;
  onAttackHeldRef.current = onAttackHeld;
  onSetAdsRef.current = onSetAds;

  const padRef = useRef<HTMLDivElement | null>(null);
  const dpadRef = useRef<HTMLDivElement | null>(null);

  const stickPointerId = useRef<number | null>(null);
  const stickCenterRef = useRef<{ x: number; y: number } | null>(null);
  const dpadPointerId = useRef<number | null>(null);
  const lookPointerRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const firePointerRef = useRef<{ id: number; x: number; y: number } | null>(null);

  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [floatingOffset, setFloatingOffset] = useState({ x: 0, y: 0 });
  const [sprintActive, setSprintActive] = useState(false);
  const [cruiseGas, setCruiseGas] = useState(false);
  const [fireHeldVisual, setFireHeldVisual] = useState(false);

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
  });

  const syncDigitalAxes = (vehicleMode: boolean, cruise = cruiseGas) => {
    const m = digitalMoveRef.current;
    if (vehicleMode) {
      const steer = (m.steerRight ? 1 : 0) - (m.steerLeft ? 1 : 0);
      const gasPressed = m.gas || cruise;
      const throttle = (gasPressed ? 1 : 0) - (m.rev ? 1 : 0);
      onMoveRef.current(steer, throttle);
    } else {
      const mx = (m.right ? 1 : 0) - (m.left ? 1 : 0);
      const my = (m.up ? 1 : 0) - (m.down ? 1 : 0);
      const len = Math.hypot(mx, my);
      if (len > 1) {
        onMoveRef.current(mx / len, my / len);
      } else {
        onMoveRef.current(mx, my);
      }
    }
  };

  // Reset only when switching between On-Foot <-> Vehicle or Joystick <-> D-Pad
  useEffect(() => {
    stickPointerId.current = null;
    stickCenterRef.current = null;
    dpadPointerId.current = null;
    firePointerRef.current = null;
    setKnob({ x: 0, y: 0 });
    setFloatingOffset({ x: 0, y: 0 });
    setSprintActive(false);
    setCruiseGas(false);
    setFireHeldVisual(false);
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
    });
    onMoveRef.current(0, 0);
    onSprintRef.current(false);
    onAttackHeldRef.current?.(false);
  }, [inVehicle, movementStyle]);

  // Clear stuck held inputs on unmount
  useEffect(() => {
    return () => {
      onMoveRef.current(0, 0);
      onSprintRef.current(false);
      onAttackHeldRef.current?.(false);
    };
  }, []);

  const setDigitalKey = (
    key: keyof typeof digitalMoveRef.current,
    pressed: boolean,
    vehicleMode: boolean,
  ) => {
    if (digitalMoveRef.current[key] === pressed) return;
    digitalMoveRef.current[key] = pressed;
    setActiveVisual((prev) => ({ ...prev, [key]: pressed }));
    if (key === 'rev' && pressed && cruiseGas) {
      setCruiseGas(false);
      syncDigitalAxes(vehicleMode, false);
      return;
    }
    syncDigitalAxes(vehicleMode);
  };

  const updateStickFromPointer = (clientX: number, clientY: number) => {
    const pad = padRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const baseCx = stickCenterRef.current?.x ?? rect.left + rect.width / 2;
    const baseCy = stickCenterRef.current?.y ?? rect.top + rect.height / 2;
    const maxR = Math.max(28, rect.width * 0.4);
    let dx = clientX - baseCx;
    let dy = clientY - baseCy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    setKnob({ x: dx, y: dy });
    onMoveRef.current(dx / maxR, -dy / maxR);
  };

  const updateDpadFromPointer = (clientX: number, clientY: number) => {
    const box = dpadRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dead = rect.width * 0.08;
    const up = dy < -dead;
    const down = dy > dead;
    const left = dx < -dead;
    const right = dx > dead;

    digitalMoveRef.current.up = up;
    digitalMoveRef.current.down = down;
    digitalMoveRef.current.left = left;
    digitalMoveRef.current.right = right;
    setActiveVisual((prev) => ({ ...prev, up, down, left, right }));
    syncDigitalAxes(false);
  };

  const releaseDpad = () => {
    dpadPointerId.current = null;
    digitalMoveRef.current.up = false;
    digitalMoveRef.current.down = false;
    digitalMoveRef.current.left = false;
    digitalMoveRef.current.right = false;
    setActiveVisual((prev) => ({ ...prev, up: false, down: false, left: false, right: false }));
    onMoveRef.current(0, 0);
  };

  const bindHoldPointer = (
    key: keyof typeof digitalMoveRef.current,
    vehicleMode: boolean,
  ) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setDigitalKey(key, true, vehicleMode);
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDigitalKey(key, false, vehicleMode);
    },
    onPointerCancel: () => setDigitalKey(key, false, vehicleMode),
    onLostPointerCapture: () => setDigitalKey(key, false, vehicleMode),
  });

  const globalScale = Math.max(0.7, Math.min(1.35, buttonScale));
  const globalOpacity = Math.max(0.35, Math.min(1, opacity));

  const getEl = (id: HudControlId): HudElementConfig =>
    hudElements[id] ?? DEFAULT_CUSTOM_HUD.elements[id];

  const getSlotStyle = (el: HudElementConfig): React.CSSProperties => {
    const s = Math.max(0.55, Math.min(1.85, el.scale * globalScale));
    const op = Math.max(0.2, Math.min(1, el.opacity * globalOpacity));
    return {
      left: `${el.xPct}%`,
      top: `${el.yPct}%`,
      transform: `translate(-50%, -50%) scale(${s})`,
      opacity: op,
    };
  };

  const moveCfg = getEl('move');
  const fireCfg = getEl('fire');
  const jumpCfg = getEl('jump');
  const sprintCfg = getEl('sprint');
  const vehicleCfg = getEl('vehicle');
  const adsCfg = getEl('ads');
  const fpvCfg = getEl('fpv');
  const wheelCfg = getEl('wheel');
  const medkitCfg = getEl('medkit');
  const interactCfg = getEl('interact');
  const helmetCfg = getEl('helmet');
  const mapCfg = getEl('map');
  const phoneCfg = getEl('phone');
  const radioCfg = getEl('radio');
  const micCfg = getEl('mic');
  const settingsCfg = getEl('settings');
  const steerCfg = getEl('steer');
  const gasCfg = getEl('gas');
  const brakeCfg = getEl('brake');
  const hornCfg = getEl('horn');
  const bribeCfg = getEl('bribe');

  return (
    <div className="fixed inset-0 z-[25] pointer-events-none select-none touch-none overflow-hidden">
      {/* Full-screen background camera drag surface behind all HUD buttons */}
      <div
        className="absolute inset-0 pointer-events-auto touch-none"
        onPointerDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (lookPointerRef.current !== null) return;
          e.preventDefault();
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // ignore
          }
          lookPointerRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
        }}
        onPointerMove={(e) => {
          const ref = lookPointerRef.current;
          if (!ref || e.pointerId !== ref.id) return;
          onCameraDeltaRef.current(e.clientX - ref.x, e.clientY - ref.y);
          ref.x = e.clientX;
          ref.y = e.clientY;
        }}
        onPointerUp={(e) => {
          if (lookPointerRef.current?.id === e.pointerId) {
            lookPointerRef.current = null;
          }
        }}
        onPointerCancel={(e) => {
          if (lookPointerRef.current?.id === e.pointerId) {
            lookPointerRef.current = null;
          }
        }}
        onLostPointerCapture={(e) => {
          if (lookPointerRef.current?.id === e.pointerId) {
            lookPointerRef.current = null;
          }
        }}
      />

      {/* MOVEMENT: On-Foot Joystick / D-Pad */}
      {!inVehicle && moveCfg.visible && (
        <div
          style={getSlotStyle(moveCfg)}
          className="absolute pointer-events-auto touch-none"
        >
          {movementStyle === 'dpad' ? (
            <div
              ref={dpadRef}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dpadPointerId.current = e.pointerId;
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                  // ignore
                }
                updateDpadFromPointer(e.clientX, e.clientY);
              }}
              onPointerMove={(e) => {
                if (dpadPointerId.current !== e.pointerId) return;
                updateDpadFromPointer(e.clientX, e.clientY);
              }}
              onPointerUp={(e) => {
                if (dpadPointerId.current !== e.pointerId) return;
                e.preventDefault();
                releaseDpad();
              }}
              onPointerCancel={(e) => {
                if (dpadPointerId.current === e.pointerId) releaseDpad();
              }}
              onLostPointerCapture={(e) => {
                if (dpadPointerId.current === e.pointerId) releaseDpad();
              }}
              className="grid grid-cols-3 gap-1 w-[124px] h-[124px] p-1.5 rounded-2xl bg-[#0B0E14]/75 border border-slate-500/75 shadow-xl touch-none cursor-pointer"
            >
              <div />
              <div
                aria-label="Move Forward"
                className={`rounded-lg border flex items-center justify-center pointer-events-none ${
                  activeVisual.up
                    ? 'bg-amber-500 border-amber-200 text-[#0B0E14]'
                    : 'bg-[#141A26]/95 border-slate-600 text-slate-100'
                }`}
              >
                <ArrowUp className="w-5 h-5" />
              </div>
              <div />
              <div
                aria-label="Move Left"
                className={`rounded-lg border flex items-center justify-center pointer-events-none ${
                  activeVisual.left
                    ? 'bg-amber-500 border-amber-200 text-[#0B0E14]'
                    : 'bg-[#141A26]/95 border-slate-600 text-slate-100'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </div>
              <div className="rounded-full bg-slate-800/70 border border-slate-600/60 pointer-events-none" />
              <div
                aria-label="Move Right"
                className={`rounded-lg border flex items-center justify-center pointer-events-none ${
                  activeVisual.right
                    ? 'bg-amber-500 border-amber-200 text-[#0B0E14]'
                    : 'bg-[#141A26]/95 border-slate-600 text-slate-100'
                }`}
              >
                <ArrowRight className="w-5 h-5" />
              </div>
              <div />
              <div
                aria-label="Move Backward"
                className={`rounded-lg border flex items-center justify-center pointer-events-none ${
                  activeVisual.down
                    ? 'bg-amber-500 border-amber-200 text-[#0B0E14]'
                    : 'bg-[#141A26]/95 border-slate-600 text-slate-100'
                }`}
              >
                <ArrowDown className="w-5 h-5" />
              </div>
              <div />
            </div>
          ) : (
            <div
              ref={padRef}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                stickPointerId.current = e.pointerId;
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                  // ignore
                }
                const rect = e.currentTarget.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                if (moveCfg.mode === 'floating') {
                  const maxShift = rect.width * 0.28;
                  const ox = Math.max(-maxShift, Math.min(maxShift, e.clientX - centerX));
                  const oy = Math.max(-maxShift, Math.min(maxShift, e.clientY - centerY));
                  stickCenterRef.current = { x: centerX + ox, y: centerY + oy };
                  setFloatingOffset({ x: ox, y: oy });
                } else {
                  stickCenterRef.current = { x: centerX, y: centerY };
                  setFloatingOffset({ x: 0, y: 0 });
                }
                updateStickFromPointer(e.clientX, e.clientY);
              }}
              onPointerMove={(e) => {
                if (stickPointerId.current !== e.pointerId) return;
                updateStickFromPointer(e.clientX, e.clientY);
              }}
              onPointerUp={(e) => {
                if (stickPointerId.current !== e.pointerId) return;
                e.preventDefault();
                stickPointerId.current = null;
                stickCenterRef.current = null;
                setKnob({ x: 0, y: 0 });
                setFloatingOffset({ x: 0, y: 0 });
                onMoveRef.current(0, 0);
              }}
              onPointerCancel={(e) => {
                if (stickPointerId.current !== e.pointerId) return;
                stickPointerId.current = null;
                stickCenterRef.current = null;
                setKnob({ x: 0, y: 0 });
                setFloatingOffset({ x: 0, y: 0 });
                onMoveRef.current(0, 0);
              }}
              onLostPointerCapture={(e) => {
                if (stickPointerId.current !== e.pointerId) return;
                stickPointerId.current = null;
                stickCenterRef.current = null;
                setKnob({ x: 0, y: 0 });
                setFloatingOffset({ x: 0, y: 0 });
                onMoveRef.current(0, 0);
              }}
              className="w-[116px] h-[116px] rounded-full bg-[#101520]/82 border-2 border-slate-400/75 flex items-center justify-center touch-none shadow-xl cursor-pointer relative"
            >
              <div
                style={{
                  transform: `translate(${floatingOffset.x + knob.x}px, ${floatingOffset.y + knob.y}px)`,
                }}
                className="w-11 h-11 rounded-full bg-amber-500 border-2 border-[#0B0E14] shadow-lg pointer-events-none"
              />
            </div>
          )}
        </div>
      )}

      {/* DRIVING: Steering Paddles */}
      {inVehicle && steerCfg.visible && (
        <div
          style={getSlotStyle(steerCfg)}
          className="absolute pointer-events-auto touch-none"
        >
          <div className="flex items-center gap-2 bg-[#0B0E14]/78 p-1.5 rounded-2xl border border-slate-500/80 shadow-xl">
            <button
              type="button"
              aria-label="Steer Left"
              {...bindHoldPointer('steerLeft', true)}
              className={`w-[58px] h-[54px] rounded-xl border-2 flex flex-col items-center justify-center transition-colors cursor-pointer touch-none ${
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
              className={`w-[58px] h-[54px] rounded-xl border-2 flex flex-col items-center justify-center transition-colors cursor-pointer touch-none ${
                activeVisual.steerRight
                  ? 'bg-amber-500 border-amber-200 text-[#0B0E14]'
                  : 'bg-[#141A26]/95 border-slate-500/80 text-slate-100'
              }`}
            >
              <ArrowRight className="w-6 h-6" />
              <span className="text-[9px] font-mono-num font-bold">RIGHT</span>
            </button>
          </div>
        </div>
      )}

      {/* DRIVING: Gas Pedal */}
      {inVehicle && gasCfg.visible && (
        <div style={getSlotStyle(gasCfg)} className="absolute pointer-events-auto touch-none">
          {gasCfg.mode === 'toggle' ? (
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const next = !cruiseGas;
                setCruiseGas(next);
                syncDigitalAxes(true, next);
              }}
              className={`w-16 h-20 rounded-2xl border-2 flex flex-col items-center justify-center shadow-xl cursor-pointer touch-none ${
                cruiseGas
                  ? 'bg-emerald-400 border-emerald-100 text-[#07100B]'
                  : 'bg-emerald-600/95 border-emerald-300 text-white'
              }`}
            >
              <ArrowUp className="w-6 h-6" />
              <span className="text-[10px] font-mono-num font-extrabold">
                {cruiseGas ? 'CRUISE' : 'GAS'}
              </span>
            </button>
          ) : (
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
          )}
        </div>
      )}

      {/* DRIVING: Brake / Reverse */}
      {inVehicle && brakeCfg.visible && (
        <div style={getSlotStyle(brakeCfg)} className="absolute pointer-events-auto touch-none">
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
            <span className="text-[9px] font-mono-num font-bold">BRAKE</span>
          </button>
        </div>
      )}

      {/* DRIVING: Horn + Headlights + Chopper Ascend/Descend */}
      {inVehicle && onHorn && hornCfg.visible && (
        <div style={getSlotStyle(hornCfg)} className="absolute pointer-events-auto touch-none flex flex-col items-center gap-1.5">
          {isChopper && onChopperAltitude && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  chopperClimbRef.current.asc = true;
                  setChopperClimbVisual({ ...chopperClimbRef.current });
                  onChopperAltitude(true, chopperClimbRef.current.desc);
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  chopperClimbRef.current.asc = false;
                  setChopperClimbVisual({ ...chopperClimbRef.current });
                  onChopperAltitude(false, chopperClimbRef.current.desc);
                }}
                onPointerCancel={() => {
                  chopperClimbRef.current.asc = false;
                  setChopperClimbVisual({ ...chopperClimbRef.current });
                  onChopperAltitude(false, chopperClimbRef.current.desc);
                }}
                className={`w-11 h-11 rounded-full border-2 flex flex-col items-center justify-center shadow-lg cursor-pointer touch-none ${
                  chopperClimbVisual.asc
                    ? 'bg-sky-400 border-white text-slate-950'
                    : 'bg-[#141A26]/95 border-sky-400/80 text-sky-200'
                }`}
                aria-label="Chopper Ascend"
              >
                <ArrowUp className="w-4 h-4" />
                <span className="text-[7px] font-bold leading-none">UP</span>
              </button>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  chopperClimbRef.current.desc = true;
                  setChopperClimbVisual({ ...chopperClimbRef.current });
                  onChopperAltitude(chopperClimbRef.current.asc, true);
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  chopperClimbRef.current.desc = false;
                  setChopperClimbVisual({ ...chopperClimbRef.current });
                  onChopperAltitude(chopperClimbRef.current.asc, false);
                }}
                onPointerCancel={() => {
                  chopperClimbRef.current.desc = false;
                  setChopperClimbVisual({ ...chopperClimbRef.current });
                  onChopperAltitude(chopperClimbRef.current.asc, false);
                }}
                className={`w-11 h-11 rounded-full border-2 flex flex-col items-center justify-center shadow-lg cursor-pointer touch-none ${
                  chopperClimbVisual.desc
                    ? 'bg-amber-400 border-white text-slate-950'
                    : 'bg-[#141A26]/95 border-amber-400/80 text-amber-200'
                }`}
                aria-label="Chopper Descend"
              >
                <ArrowDown className="w-4 h-4" />
                <span className="text-[7px] font-bold leading-none">DOWN</span>
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            {onToggleHeadlights && (
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleHeadlights();
                }}
                className={`w-11 h-11 rounded-full border-2 flex flex-col items-center justify-center active:scale-95 shadow-lg cursor-pointer touch-none ${
                  headlightsOn
                    ? 'bg-amber-400/95 border-amber-200 text-slate-950'
                    : 'bg-[#141A26]/95 border-slate-500 text-slate-300'
                }`}
                aria-label="Toggle Headlights"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span className="text-[7px] font-bold leading-none mt-0.5">LITE</span>
              </button>
            )}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onHorn();
              }}
              className="w-12 h-12 rounded-full bg-[#141A26]/95 border-2 border-amber-400/80 flex flex-col items-center justify-center text-amber-300 active:scale-95 shadow-lg cursor-pointer touch-none"
            >
              <Volume2 className="w-4 h-4" />
              <span className="text-[8px] font-bold">HORN</span>
            </button>
          </div>
        </div>
      )}

      {/* ON-FOOT: Fire / Punch (supports Drag-Aim + Auto-Fire, Hold, or Tap) */}
      {!inVehicle && fireCfg.visible && (
        <div style={getSlotStyle(fireCfg)} className="absolute pointer-events-auto touch-none">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (fireCfg.mode === 'tap') {
                onAttack();
                return;
              }
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {
                // ignore
              }
              firePointerRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
              setFireHeldVisual(true);
              if (onAttackHeldRef.current) {
                onAttackHeldRef.current(true);
              } else {
                onAttack();
              }
            }}
            onPointerMove={(e) => {
              const ref = firePointerRef.current;
              if (!ref || e.pointerId !== ref.id) return;
              if (fireCfg.mode !== 'hold') {
                onCameraDeltaRef.current(e.clientX - ref.x, e.clientY - ref.y);
              }
              ref.x = e.clientX;
              ref.y = e.clientY;
            }}
            onPointerUp={(e) => {
              if (firePointerRef.current?.id === e.pointerId) {
                e.preventDefault();
                firePointerRef.current = null;
                setFireHeldVisual(false);
                onAttackHeldRef.current?.(false);
              }
            }}
            onPointerCancel={(e) => {
              if (firePointerRef.current?.id === e.pointerId) {
                firePointerRef.current = null;
                setFireHeldVisual(false);
                onAttackHeldRef.current?.(false);
              }
            }}
            onLostPointerCapture={(e) => {
              if (firePointerRef.current?.id === e.pointerId) {
                firePointerRef.current = null;
                setFireHeldVisual(false);
                onAttackHeldRef.current?.(false);
              }
            }}
            className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center shadow-xl cursor-pointer touch-none transition-transform ${
              fireHeldVisual
                ? 'bg-red-500 border-white text-white scale-95'
                : 'bg-red-600/95 border-red-300 text-white active:scale-95'
            }`}
          >
            <Crosshair className="w-5 h-5" />
            <span className="text-[9px] font-bold">{inJail ? 'PUNCH' : 'FIRE'}</span>
          </button>
        </div>
      )}

      {/* ON-FOOT: Jump */}
      {!inVehicle && jumpCfg.visible && (
        <div style={getSlotStyle(jumpCfg)} className="absolute pointer-events-auto touch-none">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onJump();
            }}
            className="w-12 h-12 rounded-full bg-[#141A26]/95 border-2 border-emerald-500/80 flex flex-col items-center justify-center text-emerald-300 active:scale-95 shadow-lg cursor-pointer touch-none"
          >
            <ArrowUp className="w-4 h-4" />
            <span className="text-[8px] font-bold">JUMP</span>
          </button>
        </div>
      )}

      {/* ON-FOOT: Sprint (supports Hold or Tap Toggle) */}
      {!inVehicle && sprintCfg.visible && (
        <div style={getSlotStyle(sprintCfg)} className="absolute pointer-events-auto touch-none">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (sprintCfg.mode === 'toggle') {
                const next = !sprintActive;
                setSprintActive(next);
                onSprintRef.current(next);
                return;
              }
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {
                // ignore
              }
              setSprintActive(true);
              onSprintRef.current(true);
            }}
            onPointerUp={(e) => {
              if (sprintCfg.mode === 'toggle') return;
              e.preventDefault();
              e.stopPropagation();
              setSprintActive(false);
              onSprintRef.current(false);
            }}
            onPointerCancel={() => {
              if (sprintCfg.mode === 'toggle') return;
              setSprintActive(false);
              onSprintRef.current(false);
            }}
            onLostPointerCapture={() => {
              if (sprintCfg.mode === 'toggle') return;
              setSprintActive(false);
              onSprintRef.current(false);
            }}
            className={`w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center cursor-pointer touch-none shadow-lg ${
              sprintActive
                ? 'bg-amber-500 border-amber-200 text-[#0B0E14]'
                : 'bg-[#141A26]/95 border-slate-500 text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span className="text-[8px] font-bold">{sprintActive ? 'RUN ON' : 'RUN'}</span>
          </button>
        </div>
      )}

      {/* Enter / Exit Vehicle */}
      {!inJail && vehicleCfg.visible && (
        <div style={getSlotStyle(vehicleCfg)} className="absolute pointer-events-auto touch-none">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEnterExit();
            }}
            className={`w-12 h-12 rounded-full bg-[#141A26]/95 border-2 flex flex-col items-center justify-center active:scale-95 shadow-lg cursor-pointer touch-none ${
              inVehicle ? 'border-sky-300 text-sky-200' : 'border-sky-500/80 text-sky-300'
            }`}
          >
            <Car className="w-4 h-4" />
            <span className="text-[8px] font-bold">{inVehicle ? 'EXIT' : 'CAR'}</span>
          </button>
        </div>
      )}

      {/* Scope / Aim (supports Tap Toggle or Hold) */}
      {!inVehicle && canAds && adsCfg.visible && (
        <div style={getSlotStyle(adsCfg)} className="absolute pointer-events-auto touch-none">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (adsCfg.mode === 'hold' && onSetAdsRef.current) {
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                  // ignore
                }
                onSetAdsRef.current(true);
              } else {
                onToggleAds();
              }
            }}
            onPointerUp={(e) => {
              if (adsCfg.mode === 'hold' && onSetAdsRef.current) {
                e.preventDefault();
                e.stopPropagation();
                onSetAdsRef.current(false);
              }
            }}
            onPointerCancel={() => {
              if (adsCfg.mode === 'hold' && onSetAdsRef.current) {
                onSetAdsRef.current(false);
              }
            }}
            onLostPointerCapture={() => {
              if (adsCfg.mode === 'hold' && onSetAdsRef.current) {
                onSetAdsRef.current(false);
              }
            }}
            className={`w-11 h-11 rounded-full border-2 flex flex-col items-center justify-center active:scale-95 cursor-pointer touch-none shadow-lg ${
              adsActive
                ? 'bg-amber-500 border-amber-200 text-[#0B0E14]'
                : 'bg-[#141A26]/95 border-amber-500/75 text-amber-300'
            }`}
            aria-label="Toggle Scope"
          >
            <ZoomIn className="w-4 h-4" />
            <span className="text-[7px] font-bold leading-none mt-0.5">AIM</span>
          </button>
        </div>
      )}

      {/* Camera View Cycle (3P Far / 3P Close / 1st Person Cockpit) */}
      {fpvCfg.visible && (
        <div style={getSlotStyle(fpvCfg)} className="absolute pointer-events-auto touch-none">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFirstPerson();
            }}
            className={`w-10 h-10 rounded-full border flex flex-col items-center justify-center active:scale-95 cursor-pointer touch-none shadow-md ${
              firstPerson
                ? 'bg-sky-600 border-sky-300 text-white'
                : cameraMode === 'third_close'
                  ? 'bg-amber-500 border-amber-200 text-slate-950'
                  : 'bg-[#141A26]/95 border-slate-500 text-slate-200'
            }`}
            aria-label="Cycle Camera View"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[7px] font-bold leading-none mt-0.5">
              {firstPerson ? 'FPV' : cameraMode === 'third_close' ? '3P+' : 'CAM'}
            </span>
          </button>
        </div>
      )}

      {/* Weapon Wheel */}
      {!inJail && !inVehicle && wheelCfg.visible && (
        <div style={getSlotStyle(wheelCfg)} className="absolute pointer-events-auto touch-none">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenWheel();
            }}
            className="w-11 h-11 rounded-full bg-[#141A26]/95 border border-amber-500/75 flex flex-col items-center justify-center text-amber-400 active:scale-95 cursor-pointer touch-none shadow-md"
            aria-label="Weapon Wheel"
          >
            <Disc className="w-4 h-4" />
            <span className="text-[7px] font-bold leading-none mt-0.5">GUNS</span>
          </button>
        </div>
      )}

      {/* Medkit */}
      {canUseMedkit && medkitCfg.visible && (
        <div style={getSlotStyle(medkitCfg)} className="absolute pointer-events-auto touch-none">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onUseMedkit();
            }}
            className="w-11 h-11 rounded-full bg-emerald-600/95 border border-emerald-300 flex flex-col items-center justify-center text-white active:scale-95 cursor-pointer touch-none shadow-lg"
            aria-label="Use Medkit"
          >
            <HeartPulse className="w-4 h-4" />
            <span className="text-[7px] font-bold leading-none mt-0.5">HEAL</span>
          </button>
        </div>
      )}

      {/* Helmet Toggle */}
      {(hasHelmet || isBike) && helmetCfg.visible && (
        <div style={getSlotStyle(helmetCfg)} className="absolute pointer-events-auto touch-none">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleHelmet();
            }}
            className={`w-10 h-10 rounded-full border flex flex-col items-center justify-center active:scale-95 cursor-pointer touch-none shadow-md ${
              helmetOn
                ? 'bg-emerald-600 border-emerald-300 text-white'
                : 'bg-[#141A26]/95 border-amber-500/70 text-amber-300'
            }`}
            aria-label="Toggle Helmet"
          >
            <HardHat className="w-3.5 h-3.5" />
            <span className="text-[7px] font-bold leading-none mt-0.5">HELM</span>
          </button>
        </div>
      )}

      {/* Contextual Action Button */}
      {contextLabel && interactCfg.visible && (
        <div style={getSlotStyle(interactCfg)} className="absolute pointer-events-auto touch-none">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onContextAction();
            }}
            className="px-3.5 h-11 rounded-full bg-amber-500 border-2 border-[#0B0E14] flex items-center gap-1.5 justify-center text-[#0B0E14] text-[11px] font-extrabold active:scale-95 shadow-xl cursor-pointer touch-none whitespace-nowrap"
          >
            <Hand className="w-3.5 h-3.5" />
            <span>{contextLabel}</span>
          </button>
        </div>
      )}

      {/* Police Bribe / Surrender Alert Cluster */}
      {(canStreetBribe || canSurrender) && bribeCfg.visible && (
        <div style={getSlotStyle(bribeCfg)} className="absolute pointer-events-auto touch-none">
          <div className="flex items-center gap-1.5">
            {canStreetBribe && onOfferStreetBribe && (
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOfferStreetBribe();
                }}
                className="px-2.5 h-10 rounded-full bg-amber-500 border border-[#0B0E14] flex items-center justify-center text-[#0B0E14] text-[10px] font-bold active:scale-95 shadow-lg cursor-pointer touch-none whitespace-nowrap"
              >
                BRIBE ₹3K
              </button>
            )}
            {canSurrender && onSurrender && (
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSurrender();
                }}
                className="px-2.5 h-10 rounded-full bg-sky-600 border border-sky-200 flex items-center justify-center text-white text-[10px] font-bold active:scale-95 shadow-lg cursor-pointer touch-none whitespace-nowrap"
              >
                SURRENDER
              </button>
            )}
          </div>
        </div>
      )}

      {/* Utility Strip Buttons (Individually Placeable!) */}
      {!inJail && radioCfg.visible && onRadio && (
        <div style={getSlotStyle(radioCfg)} className="absolute pointer-events-auto touch-none">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRadio();
            }}
            className="w-10 h-10 rounded-full bg-[#141A26]/95 border border-cyan-500/70 flex flex-col items-center justify-center text-cyan-300 active:scale-95 cursor-pointer touch-none shadow-md"
            aria-label="Police Radio Chatter"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="text-[7px] font-bold leading-none mt-0.5">RADIO</span>
          </button>
        </div>
      )}

      {!inJail && voiceMicEnabled && micCfg.visible && (
        <div style={getSlotStyle(micCfg)} className="absolute pointer-events-auto touch-none">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleMic();
            }}
            className={`w-10 h-10 rounded-full border flex flex-col items-center justify-center active:scale-95 cursor-pointer touch-none shadow-md ${
              micListening
                ? 'bg-red-600 border-red-300 text-white'
                : 'bg-[#141A26]/95 border-emerald-500/70 text-emerald-300'
            }`}
            aria-label="Voice Mic"
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="text-[7px] font-bold leading-none mt-0.5">MIC</span>
          </button>
        </div>
      )}

      {!inJail && mapCfg.visible && (
        <div style={getSlotStyle(mapCfg)} className="absolute pointer-events-auto touch-none">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenMap();
            }}
            className="w-10 h-10 rounded-full bg-[#141A26]/95 border border-sky-500/70 flex flex-col items-center justify-center text-sky-300 active:scale-95 cursor-pointer touch-none shadow-md"
            aria-label="City Map"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="text-[7px] font-bold leading-none mt-0.5">MAP</span>
          </button>
        </div>
      )}

      {!inJail && phoneCfg.visible && (
        <div style={getSlotStyle(phoneCfg)} className="absolute pointer-events-auto touch-none">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenPhone();
            }}
            className="w-10 h-10 rounded-full bg-[#141A26]/95 border border-slate-500 flex flex-col items-center justify-center text-sky-400 active:scale-95 cursor-pointer touch-none shadow-md"
            aria-label="Phone"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="text-[7px] font-bold leading-none mt-0.5">PHONE</span>
          </button>
        </div>
      )}

      {/* Settings Button (Always visible so player can never lock themselves out) */}
      <div style={getSlotStyle({ ...settingsCfg, visible: true })} className="absolute pointer-events-auto touch-none">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenSettings();
          }}
          className="w-10 h-10 rounded-full bg-[#141A26]/95 border border-slate-500 flex flex-col items-center justify-center text-slate-200 active:scale-95 cursor-pointer touch-none shadow-md"
          aria-label="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="text-[7px] font-bold leading-none mt-0.5">SET</span>
        </button>
      </div>
    </div>
  );
};
