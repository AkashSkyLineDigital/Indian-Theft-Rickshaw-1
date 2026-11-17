import React, { useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Car,
  Check,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Disc,
  Eye,
  EyeOff,
  Grid,
  Hand,
  HardHat,
  HeartPulse,
  Map as MapIcon,
  Mic,
  Radio,
  RotateCcw,
  Settings,
  Sliders,
  Smartphone,
  Volume2,
  X,
  Zap,
  ZoomIn,
} from 'lucide-react';
import {
  CustomHudConfig,
  GameSettings,
  HUD_CONTROL_META,
  HudControlId,
  HudElementConfig,
  HudLayoutPresetId,
  createHudPresetElements,
} from '../types/game';

interface HudEditorModalProps {
  settings: GameSettings;
  onSave: (nextSettings: GameSettings) => void;
  onClose: () => void;
}

const FOOT_IDS: HudControlId[] = [
  'move',
  'fire',
  'jump',
  'sprint',
  'ads',
  'fpv',
  'wheel',
  'vehicle',
  'interact',
  'medkit',
  'helmet',
  'bribe',
  'map',
  'phone',
  'radio',
  'mic',
  'settings',
];

const DRIVE_IDS: HudControlId[] = [
  'steer',
  'gas',
  'brake',
  'horn',
  'vehicle',
  'interact',
  'medkit',
  'helmet',
  'bribe',
  'map',
  'phone',
  'radio',
  'mic',
  'settings',
];

export const HudEditorModal: React.FC<HudEditorModalProps> = ({
  settings,
  onSave,
  onClose,
}) => {
  const [draftHud, setDraftHud] = useState<CustomHudConfig>(() => ({
    preset: settings.customHud.preset,
    elements: { ...settings.customHud.elements },
  }));
  const [movementStyle, setMovementStyle] = useState<'joystick' | 'dpad'>(
    settings.touchMovementStyle ?? 'joystick',
  );
  const [viewContext, setViewContext] = useState<'foot' | 'drive'>('foot');
  const [selectedId, setSelectedId] = useState<HudControlId>('fire');
  const [showGrid, setShowGrid] = useState(true);
  const [snapGrid, setSnapGrid] = useState(false);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    id: HudControlId;
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startXPct: number;
    startYPct: number;
  } | null>(null);

  const visibleIds = (viewContext === 'foot' ? FOOT_IDS : DRIVE_IDS).filter(
    (id) => id !== 'mic' || settings.voiceMicEnabled,
  );

  const selectedEl = draftHud.elements[selectedId];
  const selectedMeta = HUD_CONTROL_META[selectedId];

  const updateElement = (id: HudControlId, patch: Partial<HudElementConfig>) => {
    setDraftHud((prev) => ({
      preset: 'custom',
      elements: {
        ...prev.elements,
        [id]: {
          ...prev.elements[id],
          ...patch,
          visible: HUD_CONTROL_META[id].lockVisible
            ? true
            : patch.visible ?? prev.elements[id].visible,
        },
      },
    }));
  };

  const applyPreset = (preset: Exclude<HudLayoutPresetId, 'custom'>) => {
    setDraftHud({
      preset,
      elements: createHudPresetElements(preset),
    });
  };

  const resetSingleControl = (id: HudControlId) => {
    const fallbackPreset =
      draftHud.preset === 'custom' ? 'classic' : draftHud.preset;
    const fresh = createHudPresetElements(fallbackPreset)[id];
    updateElement(id, fresh);
  };

  const handleSave = () => {
    onSave({
      ...settings,
      touchMovementStyle: movementStyle,
      customHud: draftHud,
    });
    onClose();
  };

  const renderControlGlyph = (id: HudControlId) => {
    const el = draftHud.elements[id];
    if (id === 'move') {
      if (movementStyle === 'dpad') {
        return (
          <div className="grid grid-cols-3 gap-0.5 w-[112px] h-[112px] p-1.5 rounded-2xl bg-[#0B0E14]/85 border-2 border-current shadow-xl pointer-events-none">
            <div />
            <div className="rounded bg-[#141A26] border border-slate-500 flex items-center justify-center">
              <ArrowUp className="w-4 h-4" />
            </div>
            <div />
            <div className="rounded bg-[#141A26] border border-slate-500 flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <div className="rounded-full bg-slate-700" />
            <div className="rounded bg-[#141A26] border border-slate-500 flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </div>
            <div />
            <div className="rounded bg-[#141A26] border border-slate-500 flex items-center justify-center">
              <ArrowDown className="w-4 h-4" />
            </div>
            <div />
          </div>
        );
      }
      return (
        <div className="w-[108px] h-[108px] rounded-full bg-[#101520]/85 border-2 border-current flex flex-col items-center justify-center shadow-xl pointer-events-none relative">
          <div className="w-10 h-10 rounded-full bg-amber-500 border-2 border-[#0B0E14]" />
          <span className="absolute -bottom-4 text-[9px] font-mono-num font-bold text-amber-300 bg-black/75 px-1.5 rounded">
            {el.mode === 'floating' ? 'FLOAT' : 'FIXED'}
          </span>
        </div>
      );
    }

    if (id === 'steer') {
      return (
        <div className="flex items-center gap-1.5 bg-[#0B0E14]/85 p-1.5 rounded-2xl border-2 border-current shadow-xl pointer-events-none">
          <div className="w-12 h-11 rounded-lg bg-[#141A26] border border-slate-500 flex flex-col items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[8px] font-bold">L</span>
          </div>
          <div className="w-12 h-11 rounded-lg bg-[#141A26] border border-slate-500 flex flex-col items-center justify-center">
            <ArrowRight className="w-4 h-4" />
            <span className="text-[8px] font-bold">R</span>
          </div>
        </div>
      );
    }

    if (id === 'gas') {
      return (
        <div className="w-14 h-18 rounded-2xl bg-emerald-600/90 border-2 border-emerald-200 flex flex-col items-center justify-center text-white shadow-xl pointer-events-none">
          <ArrowUp className="w-5 h-5" />
          <span className="text-[9px] font-mono-num font-extrabold">
            {el.mode === 'toggle' ? 'CRUISE' : 'GAS'}
          </span>
        </div>
      );
    }

    if (id === 'brake') {
      return (
        <div className="w-13 h-13 rounded-2xl bg-red-950/90 border-2 border-red-400 flex flex-col items-center justify-center text-red-200 shadow-lg pointer-events-none">
          <ArrowDown className="w-4 h-4" />
          <span className="text-[8px] font-bold">BRAKE</span>
        </div>
      );
    }

    if (id === 'fire') {
      return (
        <div className="w-16 h-16 rounded-full bg-red-600/95 border-2 border-red-200 flex flex-col items-center justify-center text-white shadow-xl pointer-events-none">
          <Crosshair className="w-5 h-5" />
          <span className="text-[9px] font-bold">FIRE</span>
        </div>
      );
    }

    if (id === 'interact') {
      return (
        <div className="px-3 h-10 rounded-full bg-amber-500 border-2 border-[#0B0E14] flex items-center gap-1 text-[#0B0E14] text-[10px] font-extrabold shadow-lg pointer-events-none whitespace-nowrap">
          <Hand className="w-3.5 h-3.5" />
          <span>ACTION</span>
        </div>
      );
    }

    if (id === 'bribe') {
      return (
        <div className="px-2.5 h-9 rounded-full bg-sky-700/95 border border-sky-200 flex items-center justify-center text-white text-[9px] font-bold shadow-lg pointer-events-none whitespace-nowrap">
          BRIBE / SURRENDER
        </div>
      );
    }

    const iconMap: Partial<Record<HudControlId, React.ReactNode>> = {
      jump: <ArrowUp className="w-4 h-4 text-emerald-300" />,
      sprint: <Zap className="w-4 h-4 text-amber-300" />,
      vehicle: <Car className="w-4 h-4 text-sky-300" />,
      ads: <ZoomIn className="w-4 h-4 text-amber-300" />,
      fpv: <Eye className="w-3.5 h-3.5 text-slate-200" />,
      wheel: <Disc className="w-4 h-4 text-amber-400" />,
      medkit: <HeartPulse className="w-4 h-4 text-emerald-300" />,
      helmet: <HardHat className="w-3.5 h-3.5 text-amber-300" />,
      map: <MapIcon className="w-3.5 h-3.5 text-sky-300" />,
      phone: <Smartphone className="w-3.5 h-3.5 text-sky-400" />,
      radio: <Radio className="w-3.5 h-3.5 text-cyan-300" />,
      mic: <Mic className="w-3.5 h-3.5 text-emerald-300" />,
      settings: <Settings className="w-3.5 h-3.5 text-slate-200" />,
      horn: <Volume2 className="w-4 h-4 text-amber-300" />,
    };

    return (
      <div className="w-11 h-11 rounded-full bg-[#141A26]/95 border border-slate-400/80 flex flex-col items-center justify-center text-slate-100 shadow-lg pointer-events-none">
        {iconMap[id]}
        <span className="text-[7px] font-bold leading-none mt-0.5">
          {HUD_CONTROL_META[id].shortLabel}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] select-none touch-none overflow-hidden flex flex-col">
      {/* Top Toolbar */}
      <div className="relative z-30 bg-slate-950/92 border-b border-white/15 px-2.5 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Sliders className="w-4 h-4 text-[#FBBF24] shrink-0" />
          <span className="font-display text-xs sm:text-sm font-bold tracking-wider text-white truncate">
            CUSTOM HUD EDITOR
          </span>
        </div>

        {/* Context & Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center bg-black/45 p-0.5 rounded-full border border-white/10">
            <button
              type="button"
              onClick={() => {
                setViewContext('foot');
                setSelectedId('fire');
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                viewContext === 'foot'
                  ? 'bg-[#F59E0B] text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              On-Foot
            </button>
            <button
              type="button"
              onClick={() => {
                setViewContext('drive');
                setSelectedId('gas');
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                viewContext === 'drive'
                  ? 'bg-sky-400 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Driving
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-black/45 p-0.5 rounded-full border border-white/10">
            {(
              [
                { id: 'classic', label: 'Classic' },
                { id: 'two_thumb', label: '2-Thumb' },
                { id: 'claw_4f', label: '4-Finger' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer ${
                  draftHud.preset === p.id
                    ? 'bg-white/20 text-[#FBBF24]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowGrid((v) => !v)}
            title="Toggle Grid"
            className={`px-2 py-1 rounded-full text-[10px] font-semibold border cursor-pointer flex items-center gap-1 ${
              showGrid
                ? 'bg-white/15 border-amber-400/50 text-amber-200'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <Grid className="w-3 h-3" />
            <span className="hidden sm:inline">Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setSnapGrid((v) => !v)}
            className={`px-2 py-1 rounded-full text-[10px] font-semibold border cursor-pointer ${
              snapGrid
                ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-200'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            Snap {snapGrid ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => applyPreset('classic')}
            title="Reset All to Classic"
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-semibold cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 rounded-full bg-red-950/70 hover:bg-red-900 border border-red-400/40 text-red-200 text-[10px] font-bold cursor-pointer flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Cancel</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1 rounded-full bg-[#F59E0B] hover:bg-[#FBBF24] text-slate-950 text-[10px] font-extrabold cursor-pointer flex items-center gap-1 shadow-lg"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Interactive Drag Canvas */}
      <div ref={canvasRef} className="relative flex-1 w-full overflow-hidden touch-none">
        {/* Optional Alignment Grid */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px)',
              backgroundSize: '5% 5%',
            }}
          />
        )}

        {/* Safe-zone Ghost Guides (so user avoids overlapping Minimap & Vitals) */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded border border-dashed border-white/25 bg-black/30 text-[9px] font-mono-num text-slate-300/75 pointer-events-none">
          Clock &amp; Alerts Area
        </div>
        <div className="absolute top-2 right-2 w-[clamp(130px,30vw,200px)] h-16 rounded border border-dashed border-white/25 bg-black/30 flex items-center justify-center text-[9px] font-mono-num text-slate-300/75 pointer-events-none">
          Cash · HP · Weapons
        </div>
        <div className="absolute bottom-2 left-2 w-[clamp(74px,min(22vw,24vh),140px)] h-[clamp(74px,min(22vw,24vh),140px)] rounded-xl border border-dashed border-amber-400/40 bg-black/35 flex items-center justify-center text-[9px] font-mono-num text-amber-200/80 pointer-events-none">
          Minimap
        </div>

        {/* Draggable HUD Control Nodes */}
        {visibleIds.map((id) => {
          const el = draftHud.elements[id];
          const isSelected = selectedId === id;
          const finalScale = Math.max(0.6, Math.min(1.65, el.scale));
          const visualOpacity = el.visible ? el.opacity : 0.28;

          return (
            <div
              key={id}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedId(id);
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                  // ignore
                }
                dragStateRef.current = {
                  id,
                  pointerId: e.pointerId,
                  startClientX: e.clientX,
                  startClientY: e.clientY,
                  startXPct: el.xPct,
                  startYPct: el.yPct,
                };
              }}
              onPointerMove={(e) => {
                const drag = dragStateRef.current;
                if (!drag || drag.id !== id || drag.pointerId !== e.pointerId) return;
                const box = canvasRef.current?.getBoundingClientRect();
                if (!box || box.width <= 0 || box.height <= 0) return;
                const dxPct = ((e.clientX - drag.startClientX) / box.width) * 100;
                const dyPct = ((e.clientY - drag.startClientY) / box.height) * 100;
                let nx = Math.max(4, Math.min(96, drag.startXPct + dxPct));
                let ny = Math.max(6, Math.min(94, drag.startYPct + dyPct));
                if (snapGrid) {
                  nx = Math.round(nx / 2) * 2;
                  ny = Math.round(ny / 2) * 2;
                } else {
                  nx = Math.round(nx * 10) / 10;
                  ny = Math.round(ny * 10) / 10;
                }
                updateElement(id, { xPct: nx, yPct: ny });
              }}
              onPointerUp={(e) => {
                if (dragStateRef.current?.pointerId === e.pointerId) {
                  dragStateRef.current = null;
                }
              }}
              onPointerCancel={(e) => {
                if (dragStateRef.current?.pointerId === e.pointerId) {
                  dragStateRef.current = null;
                }
              }}
              style={{
                left: `${el.xPct}%`,
                top: `${el.yPct}%`,
                transform: `translate(-50%, -50%) scale(${finalScale})`,
                opacity: visualOpacity,
              }}
              className={`absolute touch-none cursor-grab active:cursor-grabbing p-1 rounded-2xl transition-shadow ${
                isSelected
                  ? 'z-20 ring-2 ring-[#FBBF24] bg-amber-500/15 shadow-[0_0_24px_rgba(251,191,36,0.45)]'
                  : 'z-10 hover:ring-1 hover:ring-white/40'
              } ${!el.visible ? 'border border-dashed border-red-400/75' : ''}`}
            >
              {renderControlGlyph(id)}
              {!el.visible && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1 bg-red-600 text-[8px] font-mono-num font-bold text-white rounded pointer-events-none">
                  OFF
                </span>
              )}
            </div>
          );
        })}

        {/* Floating Collapsible Control Inspector (Center-Top so thumbs can still drag bottom corners) */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 w-[min(94vw,380px)] bg-slate-950/92 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
          <div className="px-3 py-2 bg-white/[0.04] border-b border-white/10 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[11px] font-display font-bold text-[#FBBF24] truncate">
                {selectedMeta.label}
              </div>
              <div className="text-[9px] font-mono-num text-slate-400">
                X {Math.round(selectedEl.xPct)}% · Y {Math.round(selectedEl.yPct)}% · Size {Math.round(selectedEl.scale * 100)}%
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => resetSingleControl(selectedId)}
                title="Reset Selected Button"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setInspectorCollapsed((v) => !v)}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-semibold cursor-pointer flex items-center gap-0.5"
              >
                {inspectorCollapsed ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {!inspectorCollapsed && (
            <div className="p-3 flex flex-col gap-2.5 text-xs">
              {/* Mobile Preset Switcher (visible on < md screens where toolbar hides presets) */}
              <div className="flex md:hidden items-center justify-between gap-1.5">
                <span className="text-[10px] text-slate-400 font-semibold">Preset</span>
                <div className="flex items-center gap-1">
                  {(
                    [
                      { id: 'classic', label: 'Classic' },
                      { id: 'two_thumb', label: '2-Thumb' },
                      { id: 'claw_4f', label: '4-Finger' },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                        draftHud.preset === p.id
                          ? 'bg-[#F59E0B] text-slate-950'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size & Opacity Sliders */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-300">Size</span>
                    <span className="font-mono-num font-bold text-[#FBBF24]">
                      {Math.round(selectedEl.scale * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.6}
                    max={1.65}
                    step={0.05}
                    value={selectedEl.scale}
                    onChange={(e) =>
                      updateElement(selectedId, { scale: parseFloat(e.target.value) })
                    }
                    className="game-slider w-full"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-300">Opacity</span>
                    <span className="font-mono-num font-bold text-[#FBBF24]">
                      {Math.round(selectedEl.opacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.25}
                    max={1.0}
                    step={0.05}
                    value={selectedEl.opacity}
                    onChange={(e) =>
                      updateElement(selectedId, { opacity: parseFloat(e.target.value) })
                    }
                    className="game-slider w-full"
                  />
                </div>
              </div>

              {/* Visibility + Fine Position Nudge */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <button
                  type="button"
                  disabled={selectedMeta.lockVisible}
                  onClick={() =>
                    updateElement(selectedId, { visible: !selectedEl.visible })
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border cursor-pointer disabled:opacity-50 ${
                    selectedEl.visible
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                      : 'bg-red-500/20 border-red-400/50 text-red-200'
                  }`}
                >
                  {selectedEl.visible ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>{selectedMeta.lockVisible ? 'Always Visible' : 'Visible'}</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Nudge Left"
                    onClick={() =>
                      updateElement(selectedId, { xPct: Math.max(4, selectedEl.xPct - 1) })
                    }
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    aria-label="Nudge Up"
                    onClick={() =>
                      updateElement(selectedId, { yPct: Math.max(6, selectedEl.yPct - 1) })
                    }
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    aria-label="Nudge Down"
                    onClick={() =>
                      updateElement(selectedId, { yPct: Math.min(94, selectedEl.yPct + 1) })
                    }
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    aria-label="Nudge Right"
                    onClick={() =>
                      updateElement(selectedId, { xPct: Math.min(96, selectedEl.xPct + 1) })
                    }
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 cursor-pointer"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Pad Style when Movement Pad is selected */}
              {selectedId === 'move' && (
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                  <span className="text-[10px] text-slate-300 font-semibold">Pad Type</span>
                  <div className="flex items-center gap-1">
                    {(
                      [
                        { id: 'joystick', label: 'Joystick' },
                        { id: 'dpad', label: 'D-Pad' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMovementStyle(opt.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                          movementStyle === opt.id
                            ? 'bg-sky-400 text-slate-950'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Working Mode Selector (when supported by selected button) */}
              {selectedMeta.modes && selectedMeta.modes.length > 0 && (
                <div className="flex flex-col gap-1 pt-1 border-t border-white/10">
                  <span className="text-[10px] text-slate-300 font-semibold">
                    Button Working Mode
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedMeta.modes.map((m) => {
                      const active =
                        (selectedEl.mode ?? selectedMeta.modes![0].id) === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => updateElement(selectedId, { mode: m.id })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                            active
                              ? 'bg-[#F59E0B] text-slate-950'
                              : 'bg-white/10 hover:bg-white/15 text-slate-200'
                          }`}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-slate-400 leading-snug">
                    {
                      selectedMeta.modes.find(
                        (m) => m.id === (selectedEl.mode ?? selectedMeta.modes![0].id),
                      )?.hint
                    }
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
