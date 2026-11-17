import React, { useEffect, useState } from 'react';
import {
  Volume2,
  Sliders,
  Monitor,
  Terminal,
  Play,
  RotateCcw,
  Trash2,
  X,
  VolumeX,
  Mic,
  LayoutGrid,
  Keyboard,
  Users,
  Car,
} from 'lucide-react';
import {
  DEFAULT_KEYBINDS,
  DensityLevel,
  GameSettings,
  HudLayoutPresetId,
  KEYBIND_META,
  KeybindActionId,
  createHudPresetElements,
  formatKeyCode,
} from '../types/game';
import { soundEngine } from '../engine/audio';

interface SettingsModalProps {
  settings: GameSettings;
  openedFromTitle?: boolean;
  onUpdateSettings: (next: GameSettings) => void;
  onOpenHudEditor: () => void;
  onResume: () => void;
  onResetCity: () => void;
  onResetFullGame: () => void;
  onApplyCheat: (code: string) => { ok: boolean; message: string };
}

type TabId = 'audio' | 'controls' | 'keybinds' | 'display' | 'cheats';

const DENSITY_OPTIONS: { id: DensityLevel; label: string; desc: string }[] = [
  { id: 'low', label: 'Low', desc: 'Light' },
  { id: 'medium', label: 'Medium', desc: 'Balanced' },
  { id: 'high', label: 'High', desc: 'Bustling' },
  { id: 'ultra', label: 'Ultra', desc: 'Mega City' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  openedFromTitle = false,
  onUpdateSettings,
  onOpenHudEditor,
  onResume,
  onResetCity,
  onResetFullGame,
  onApplyCheat,
}) => {
  const [tab, setTab] = useState<TabId>('audio');
  const [cheatInput, setCheatInput] = useState('');
  const [cheatFeedback, setCheatFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmFullReset, setConfirmFullReset] = useState(false);
  const [listeningAction, setListeningAction] = useState<KeybindActionId | null>(null);

  useEffect(() => {
    if (!listeningAction) return;
    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape') {
        setListeningAction(null);
        return;
      }
      soundEngine.playUiClick();
      onUpdateSettings({
        ...settings,
        keybinds: {
          ...settings.keybinds,
          [listeningAction]: e.code,
        },
      });
      setListeningAction(null);
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [listeningAction, settings, onUpdateSettings]);

  const handleCheatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cheatInput.trim()) return;
    const res = onApplyCheat(cheatInput);
    setCheatFeedback({ ok: res.ok, text: res.message });
    if (res.ok) setCheatInput('');
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/55 backdrop-blur-sm p-2.5 sm:p-4 pointer-events-auto">
      <div className="w-full max-w-xl max-h-[88vh] bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.75)] flex flex-col overflow-hidden">
        {/* Console Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] shadow-[0_0_8px_#F59E0B] shrink-0" />
            <h2 className="font-display text-[clamp(0.95rem,2.8vw,1.15rem)] font-bold tracking-wider text-white truncate">
              {openedFromTitle ? 'GAME SETTINGS' : 'PAUSE MENU'}
            </h2>
            <span className="hidden xs:inline text-[10px] font-mono-num uppercase tracking-wider text-[#FBBF24]/90">
              {openedFromTitle ? 'Title' : 'Paused'}
            </span>
          </div>
          <button
            type="button"
            onClick={onResume}
            aria-label={openedFromTitle ? 'Back to Title' : 'Resume Game'}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Console Pill Tabs */}
        <div className="px-3 sm:px-5 py-2.5 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto shrink-0">
          {(
            [
              { id: 'audio', label: 'Audio', icon: Volume2 },
              { id: 'controls', label: 'Controls', icon: Sliders },
              { id: 'keybinds', label: 'Keybinds', icon: Keyboard },
              { id: 'display', label: 'Display', icon: Monitor },
              { id: 'cheats', label: 'Cheats', icon: Terminal },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  soundEngine.playUiClick();
                  setListeningAction(null);
                  setTab(item.id);
                }}
                className={`flex-1 min-w-[78px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#F59E0B] text-slate-950 shadow-[0_0_16px_rgba(245,158,11,0.35)]'
                    : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Console Body */}
        <div className="p-3.5 sm:p-5 flex flex-col gap-3.5 overflow-y-auto min-h-0 flex-1">
          {tab === 'audio' && (
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200 font-medium">Master Volume</span>
                    <span className="font-mono-num font-bold text-[#FBBF24]">
                      {Math.round(settings.masterVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={settings.masterVolume}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, masterVolume: parseFloat(e.target.value) })
                    }
                    className="game-slider w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200 font-medium">Combat &amp; Siren SFX</span>
                    <span className="font-mono-num font-bold text-[#FBBF24]">
                      {Math.round(settings.sfxVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={settings.sfxVolume}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, sfxVolume: parseFloat(e.target.value) })
                    }
                    className="game-slider w-full"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {settings.policeVoiceEnabled ? (
                      <Volume2 className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-slate-100">Police Voice</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Hindi officer pursuit warnings &amp; courtroom dialogue.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      soundEngine.speakPoliceLine('kill', 'Ruk saale bola tha na... ab bhugat!')
                    }
                    disabled={!settings.policeVoiceEnabled}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/10 hover:bg-white/20 disabled:opacity-35 text-slate-200 cursor-pointer"
                  >
                    Test
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        policeVoiceEnabled: !settings.policeVoiceEnabled,
                      })
                    }
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                      settings.policeVoiceEnabled
                        ? 'bg-[#F59E0B] text-slate-950'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {settings.policeVoiceEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {settings.npcVoiceEnabled ? (
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-slate-100">
                      NPC Voices (Street &amp; Armory)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Hindi speech uses local OS voices offline or retro synth cadence if none installed.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      soundEngine.speakNpcLine('citizen', 7, 'Kaisa hai bhai? Chal chai piyega?')
                    }
                    disabled={!settings.npcVoiceEnabled}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/10 hover:bg-white/20 disabled:opacity-35 text-slate-200 cursor-pointer"
                  >
                    Test
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        npcVoiceEnabled: !settings.npcVoiceEnabled,
                      })
                    }
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                      settings.npcVoiceEnabled
                        ? 'bg-[#F59E0B] text-slate-950'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {settings.npcVoiceEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {settings.gameVoiceEnabled ? (
                      <Volume2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-slate-100">
                      In-Game &amp; Mission Voice
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Royal Bank briefings &amp; mission narrator cues (synth fallback offline).
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      soundEngine.speakNpcLine(
                        'banker',
                        777,
                        'Royal Bank Of India mein aapka swagat hai.',
                      )
                    }
                    disabled={!settings.gameVoiceEnabled}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/10 hover:bg-white/20 disabled:opacity-35 text-slate-200 cursor-pointer"
                  >
                    Test
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        gameVoiceEnabled: !settings.gameVoiceEnabled,
                      })
                    }
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                      settings.gameVoiceEnabled
                        ? 'bg-[#F59E0B] text-slate-950'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {settings.gameVoiceEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-semibold text-slate-100">
                    Retro Synth Voice Blips
                  </span>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Expressive offline synth character blips paired with speech.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      retroVoiceBlips: !settings.retroVoiceBlips,
                    })
                  }
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
                    settings.retroVoiceBlips
                      ? 'bg-[#F59E0B] text-slate-950'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {settings.retroVoiceBlips ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Mic
                      className={`w-3.5 h-3.5 shrink-0 ${
                        settings.voiceMicEnabled ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    />
                    <span className="text-xs font-semibold text-slate-100">
                      Voice Mic Commands (Online Only)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Optional hands-free speech shortcuts. Keep OFF to never ask mic permission.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      voiceMicEnabled: !settings.voiceMicEnabled,
                    })
                  }
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
                    settings.voiceMicEnabled
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {settings.voiceMicEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}

          {tab === 'controls' && (
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-200 font-medium">Camera Sensitivity</span>
                  <span className="font-mono-num font-bold text-[#FBBF24]">
                    {settings.mouseSensitivity.toFixed(1)}×
                  </span>
                </div>
                <input
                  type="range"
                  min={0.3}
                  max={2.0}
                  step={0.1}
                  value={settings.mouseSensitivity}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, mouseSensitivity: parseFloat(e.target.value) })
                  }
                  className="game-slider w-full"
                />
              </div>

              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/12 to-sky-500/10 border border-amber-400/35 flex flex-col gap-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-display font-bold text-[#FBBF24] flex items-center gap-1.5">
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Custom HUD Editor (Free Fire Mode)</span>
                    </div>
                    <div className="text-[11px] text-slate-300 leading-snug mt-0.5">
                      Drag every button anywhere, resize, hide/show, set opacity &amp; working modes (Hold/Toggle/Drag-Aim/Floating Stick).
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playUiClick();
                      onOpenHudEditor();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-slate-950 text-xs font-extrabold tracking-wide cursor-pointer shrink-0 shadow-[0_0_16px_rgba(245,158,11,0.35)]"
                  >
                    Customize HUD
                  </button>
                </div>

                <div className="border-t border-white/10 pt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-300 font-medium">Quick Layout Preset</span>
                  <div className="flex items-center gap-1 bg-black/35 p-1 rounded-full border border-white/10">
                    {(
                      [
                        { id: 'classic', label: 'Classic' },
                        { id: 'two_thumb', label: '2-Thumb' },
                        { id: 'claw_4f', label: '4-Finger' },
                      ] as const
                    ).map((p) => {
                      const active = (settings.customHud?.preset ?? 'classic') === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            soundEngine.playUiClick();
                            const presetId: Exclude<HudLayoutPresetId, 'custom'> = p.id;
                            onUpdateSettings({
                              ...settings,
                              customHud: {
                                preset: presetId,
                                elements: createHudPresetElements(presetId),
                              },
                            });
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase cursor-pointer whitespace-nowrap ${
                            active
                              ? 'bg-[#F59E0B] text-slate-950'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                    {settings.customHud?.preset === 'custom' && (
                      <span className="px-2 py-0.5 text-[10px] font-mono-num font-bold text-sky-300">
                        Custom
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-100">Touch Controls</div>
                    <div className="text-[11px] text-slate-400">
                      Auto-detects touchscreens or force Mobile / Desktop mode.
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-black/35 p-1 rounded-full border border-white/10 self-start sm:self-auto shrink-0">
                    {(
                      [
                        { id: 'auto', label: 'Auto' },
                        { id: 'on', label: 'Touch' },
                        { id: 'off', label: 'KB+M' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onUpdateSettings({ ...settings, touchControls: opt.id })}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase cursor-pointer whitespace-nowrap ${
                          settings.touchControls === opt.id
                            ? 'bg-[#F59E0B] text-slate-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-100">On-Foot Pad Style</div>
                    <div className="text-[11px] text-slate-400">
                      360° analog thumbstick or crisp 4-way D-Pad.
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-black/35 p-1 rounded-full border border-white/10 self-start sm:self-auto shrink-0">
                    {(
                      [
                        { id: 'joystick', label: 'Joystick' },
                        { id: 'dpad', label: 'D-Pad' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          onUpdateSettings({ ...settings, touchMovementStyle: opt.id })
                        }
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase cursor-pointer whitespace-nowrap ${
                          (settings.touchMovementStyle ?? 'joystick') === opt.id
                            ? 'bg-sky-400 text-slate-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-200 font-medium">Global Scale</span>
                      <span className="font-mono-num text-[#FBBF24]">
                        {Math.round((settings.touchButtonScale ?? 1) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.75}
                      max={1.35}
                      step={0.05}
                      value={settings.touchButtonScale ?? 1}
                      onChange={(e) =>
                        onUpdateSettings({
                          ...settings,
                          touchButtonScale: parseFloat(e.target.value),
                        })
                      }
                      className="game-slider w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-200 font-medium">Global Opacity</span>
                      <span className="font-mono-num text-[#FBBF24]">
                        {Math.round((settings.touchOpacity ?? 0.9) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.45}
                      max={1.0}
                      step={0.05}
                      value={settings.touchOpacity ?? 0.9}
                      onChange={(e) =>
                        onUpdateSettings({
                          ...settings,
                          touchOpacity: parseFloat(e.target.value),
                        })
                      }
                      className="game-slider w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                {[
                  [
                    `${formatKeyCode(settings.keybinds.moveForward)}${formatKeyCode(settings.keybinds.moveLeft)}${formatKeyCode(settings.keybinds.moveBackward)}${formatKeyCode(settings.keybinds.moveRight)}`,
                    'Move / Steer',
                  ],
                  [
                    `${formatKeyCode(settings.keybinds.sprint)} / ${formatKeyCode(settings.keybinds.jump)}`,
                    'Sprint / Jump / Chopper',
                  ],
                  [`Click / ${formatKeyCode(settings.keybinds.attack)}`, 'Lock Look & Fire'],
                  [`${formatKeyCode(settings.keybinds.scope)} / RMB`, 'Scope / Aim'],
                  [
                    `${formatKeyCode(settings.keybinds.camera)} / ${formatKeyCode(settings.keybinds.helmet)}`,
                    '3P/FPV Cam / Helmet',
                  ],
                  [
                    `${formatKeyCode(settings.keybinds.interact)} / ${formatKeyCode(settings.keybinds.vehicle)}`,
                    'Interact / Vehicle',
                  ],
                  [
                    `${formatKeyCode(settings.keybinds.map)} / ${formatKeyCode(settings.keybinds.phone)} / ${formatKeyCode(settings.keybinds.wheel)}`,
                    'Map / Phone / Wheel',
                  ],
                  [
                    `${formatKeyCode(settings.keybinds.shop)} / ${formatKeyCode(settings.keybinds.medkit)} / ${formatKeyCode(settings.keybinds.horn)}`,
                    'Shop / Medkit / Horn',
                  ],
                ].map(([key, action]) => (
                  <div
                    key={action}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10"
                  >
                    <span className="font-mono-num text-[#FBBF24] font-bold shrink-0">{key}</span>
                    <span className="text-slate-300 text-right truncate">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'keybinds' && (
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="text-xs font-display font-bold text-[#FBBF24]">
                    Minecraft-Style Key Bindings
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Tap any binding slot and press a keyboard key to re-map. Esc cancels capture.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playUiClick();
                    setListeningAction(null);
                    onUpdateSettings({ ...settings, keybinds: { ...DEFAULT_KEYBINDS } });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-slate-200 cursor-pointer shrink-0 min-h-[36px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              {(['Movement', 'Vehicle & Camera', 'Combat & Survival', 'City & Jail'] as const).map(
                (category) => {
                  const items = KEYBIND_META.filter((m) => m.category === category);
                  return (
                    <div
                      key={category}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-2"
                    >
                      <div className="text-[11px] font-display font-bold uppercase tracking-wider text-sky-300">
                        {category}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {items.map((item) => {
                          const code = settings.keybinds[item.id];
                          const isListening = listeningAction === item.id;
                          const isJailKey = item.id.startsWith('jail');
                          const hasConflict = KEYBIND_META.some(
                            (other) =>
                              other.id !== item.id &&
                              other.id.startsWith('jail') === isJailKey &&
                              settings.keybinds[other.id] === code,
                          );
                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-black/30 border border-white/10"
                            >
                              <span className="text-[11px] text-slate-200 truncate">
                                {item.label}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  soundEngine.playUiClick();
                                  setListeningAction(isListening ? null : item.id);
                                }}
                                className={`min-w-[68px] min-h-[32px] px-2.5 py-1 rounded-md font-mono-num text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                                  isListening
                                    ? 'bg-[#F59E0B] text-slate-950 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                                    : hasConflict
                                      ? 'bg-red-950/70 border border-red-400/70 text-red-200 hover:bg-red-900/80'
                                      : 'bg-white/10 hover:bg-white/20 border border-white/15 text-[#FBBF24]'
                                }`}
                              >
                                {isListening ? 'Press Key...' : formatKeyCode(code)}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}

          {tab === 'display' && (
            <div className="flex flex-col gap-3">
              {/* Scalable NPC & AI Traffic Density */}
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>NPC Pedestrian Density</span>
                    </div>
                    <span className="text-[11px] font-mono-num font-bold text-[#FBBF24] uppercase">
                      {settings.npcDensity}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {DENSITY_OPTIONS.map((opt) => {
                      const active = settings.npcDensity === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            soundEngine.playUiClick();
                            onUpdateSettings({ ...settings, npcDensity: opt.id });
                          }}
                          className={`py-2 px-1 rounded-xl border text-center cursor-pointer transition-all ${
                            active
                              ? 'bg-[#F59E0B] border-amber-200 text-slate-950 font-bold'
                              : 'bg-black/35 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="text-[11px] leading-tight">{opt.label}</div>
                          <div className={`text-[9px] ${active ? 'text-slate-800' : 'text-slate-400'}`}>
                            {opt.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-2.5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
                      <Car className="w-3.5 h-3.5 text-sky-400" />
                      <span>AI Traffic Vehicle Density</span>
                    </div>
                    <span className="text-[11px] font-mono-num font-bold text-sky-300 uppercase">
                      {settings.trafficDensity}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {DENSITY_OPTIONS.map((opt) => {
                      const active = settings.trafficDensity === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            soundEngine.playUiClick();
                            onUpdateSettings({ ...settings, trafficDensity: opt.id });
                          }}
                          className={`py-2 px-1 rounded-xl border text-center cursor-pointer transition-all ${
                            active
                              ? 'bg-sky-400 border-sky-200 text-slate-950 font-bold'
                              : 'bg-black/35 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="text-[11px] leading-tight">{opt.label}</div>
                          <div className={`text-[9px] ${active ? 'text-slate-800' : 'text-slate-400'}`}>
                            {opt.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-100">Dynamic Shadows</div>
                  <div className="text-[11px] text-slate-400">
                    Real-time directional shadows for buildings, vehicles &amp; NPCs.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({ ...settings, shadowsEnabled: !settings.shadowsEnabled })
                  }
                  className={`px-3.5 py-1 rounded-full text-xs font-bold cursor-pointer shrink-0 ${
                    settings.shadowsEnabled
                      ? 'bg-[#F59E0B] text-slate-950'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {settings.shadowsEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-100">Bottom Keybind Hint</div>
                  <div className="text-[11px] text-slate-400">
                    Show initial keybind reminder until you begin moving.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      showControlsStrip: !settings.showControlsStrip,
                    })
                  }
                  className={`px-3.5 py-1 rounded-full text-xs font-bold cursor-pointer shrink-0 ${
                    settings.showControlsStrip
                      ? 'bg-[#F59E0B] text-slate-950'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {settings.showControlsStrip ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}

          {tab === 'cheats' && (
            <div className="flex flex-col gap-3">
              <form onSubmit={handleCheatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={cheatInput}
                  onChange={(e) => setCheatInput(e.target.value)}
                  placeholder="Enter code (e.g. COPTER, AUTO, PAISABARSAO)..."
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-black/45 border border-white/15 focus:border-[#F59E0B] outline-none font-mono-num text-xs uppercase text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-slate-950 font-bold text-xs transition-colors cursor-pointer shrink-0"
                >
                  Activate
                </button>
              </form>

              {cheatFeedback && (
                <div
                  className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                    cheatFeedback.ok
                      ? 'bg-emerald-950/60 border-emerald-400/50 text-emerald-200'
                      : 'bg-red-950/60 border-red-400/50 text-red-200'
                  }`}
                >
                  {cheatFeedback.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  ['COPTER', 'Spawn Garuda Chopper'],
                  ['AUTO', 'Spawn Auto-Rickshaw'],
                  ['BIKE', 'Spawn Sports Bike + Helmet'],
                  ['CAR', 'Spawn Civilian Sedan'],
                  ['POLICE', 'Spawn Police Patrol SUV'],
                  ['PAISABARSAO', '+₹21,00,000, Full HP & Armor'],
                  ['SHASTRA100', 'All Firearms + Max Ammo'],
                  ['NOCHALLAN', 'Clear Wanted Level'],
                  ['VIPPASS', 'Toggle Never Wanted'],
                ].map(([code, desc]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setCheatInput(code);
                      const res = onApplyCheat(code);
                      setCheatFeedback({ ok: res.ok, text: res.message });
                    }}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 text-left cursor-pointer transition-colors"
                  >
                    <span className="font-mono-num font-bold text-[#FBBF24]">{code}</span>
                    <span className="text-[11px] text-slate-300 truncate">{desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Console Footer Action Bar */}
        <div className="px-3.5 sm:px-5 py-3 border-t border-white/10 bg-black/30 shrink-0">
          {!confirmFullReset ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onResetCity}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.07] hover:bg-white/[0.14] border border-white/10 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Respawn</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmFullReset(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/50 hover:bg-red-900/70 border border-red-500/35 text-red-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset Data</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onResume}
                className="flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-[#F59E0B] hover:bg-[#FBBF24] text-slate-950 text-xs font-bold tracking-wide transition-colors cursor-pointer shadow-[0_0_18px_rgba(245,158,11,0.3)]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{openedFromTitle ? 'Back' : 'Resume'}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-red-950/60 border border-red-500/50">
              <span className="text-xs text-red-100 font-semibold">
                Wipe save, cash, house &amp; settings?
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setConfirmFullReset(false)}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmFullReset(false);
                    onResetFullGame();
                  }}
                  className="px-3 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
                >
                  Confirm Wipe
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
