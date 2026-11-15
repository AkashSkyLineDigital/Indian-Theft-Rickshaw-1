import React, { useState } from 'react';
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
} from 'lucide-react';
import { GameSettings } from '../types/game';
import { soundEngine } from '../engine/audio';

interface SettingsModalProps {
  settings: GameSettings;
  openedFromTitle?: boolean;
  onUpdateSettings: (next: GameSettings) => void;
  onResume: () => void;
  onResetCity: () => void;
  onResetFullGame: () => void;
  onApplyCheat: (code: string) => { ok: boolean; message: string };
}

type TabId = 'audio' | 'controls' | 'display' | 'cheats';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  openedFromTitle = false,
  onUpdateSettings,
  onResume,
  onResetCity,
  onResetFullGame,
  onApplyCheat,
}) => {
  const [tab, setTab] = useState<TabId>('audio');
  const [cheatInput, setCheatInput] = useState('');
  const [cheatFeedback, setCheatFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmFullReset, setConfirmFullReset] = useState(false);

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
                    Unique offline voices for citizens, enforcers &amp; dealers.
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
                    Royal Bank briefings &amp; mission narrator cues.
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
                    Expressive synth character blips paired with speech.
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
                      <span className="text-slate-200 font-medium">Button Size</span>
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
                      <span className="text-slate-200 font-medium">Touch Opacity</span>
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
                  ['WASD', 'Move / Steer'],
                  ['Shift / Space', 'Sprint / Jump'],
                  ['Click / J', 'Lock Look & Fire'],
                  ['X / RMB', 'Scope / Aim'],
                  ['C / L', 'FPV / ISI Helmet'],
                  ['E / F', 'Interact / Vehicle'],
                  ['M / P / Q', 'Map / Phone / Wheel'],
                  ['B / H / V / Esc', 'Shop / Heal / Mic / Pause'],
                ].map(([key, action]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10"
                  >
                    <span className="font-mono-num text-[#FBBF24] font-bold shrink-0">{key}</span>
                    <span className="text-slate-300 text-right truncate">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'display' && (
            <div className="flex flex-col gap-3">
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
                  placeholder="Enter code (e.g. PAISABARSAO)..."
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
                  ['PAISABARSAO', '+₹21,00,000, Full HP & Armor'],
                  ['SHASTRA100', 'All Firearms + Max Ammo'],
                  ['NOCHALLAN', 'Clear Wanted Level'],
                  ['VIPPASS', 'Toggle Never Wanted'],
                ].map(([code, desc]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setCheatInput(code)}
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
