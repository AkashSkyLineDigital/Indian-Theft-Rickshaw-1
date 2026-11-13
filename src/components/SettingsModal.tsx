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
  onUpdateSettings: (next: GameSettings) => void;
  onResume: () => void;
  onResetCity: () => void;
  onResetFullGame: () => void;
  onApplyCheat: (code: string) => { ok: boolean; message: string };
}

type TabId = 'audio' | 'controls' | 'display' | 'cheats';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
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
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#070A10]/85 p-4">
      <div className="w-full max-w-4xl max-h-[92vh] bg-[#101520] border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Pause Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0B0E14] border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-xl font-bold tracking-wider text-slate-100">
              GAME PAUSED
            </h2>
            <span className="text-xs font-mono-num text-amber-400">
              SIMULATION FROZEN
            </span>
          </div>
          <button
            type="button"
            onClick={onResume}
            aria-label="Resume Game"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main 2-Column Game Menu */}
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] flex-1 min-h-0 overflow-hidden">
          {/* Left Navigation Rail */}
          <div className="bg-[#0D111A] border-b md:border-b-0 md:border-r border-slate-800 p-3 flex flex-col gap-1.5">
            {(
              [
                { id: 'audio', label: 'Audio & Voice', icon: Volume2 },
                { id: 'controls', label: 'Controls', icon: Sliders },
                { id: 'display', label: 'Display', icon: Monitor },
                { id: 'cheats', label: 'Cheat Terminal', icon: Terminal },
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
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-colors text-left cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-amber-500 text-[#0B0E14] font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="mt-auto pt-4 border-t border-slate-800 flex flex-col gap-2">
              <button
                type="button"
                onClick={onResume}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Game</span>
              </button>
              <button
                type="button"
                onClick={onResetCity}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reposition Spawn</span>
              </button>

              {!confirmFullReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmFullReset(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs font-medium border border-red-800/70 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset All Data</span>
                </button>
              ) : (
                <div className="p-2 bg-red-950/80 border border-red-500/70 flex flex-col gap-1.5">
                  <span className="text-[11px] text-red-200 font-semibold text-center">
                    Wipe save, cash, guns & settings?
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmFullReset(false);
                        onResetFullGame();
                      }}
                      className="py-1.5 bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmFullReset(false)}
                      className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel Content */}
          <div className="p-6 flex flex-col gap-6 bg-[#101520] overflow-y-auto min-h-0">
            {tab === 'audio' && (
              <>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-100">
                    Audio & Police Voice
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure combat acoustics, sirens, and officer voice taunts.
                  </p>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-200 font-medium">Master Volume</span>
                      <span className="font-mono-num text-amber-400">
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

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-200 font-medium">Combat & Siren SFX</span>
                      <span className="font-mono-num text-amber-400">
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

                  <div className="p-4 bg-[#0B0E14] border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {settings.policeVoiceEnabled ? (
                          <Volume2 className="w-4 h-4 text-amber-400" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-slate-500" />
                        )}
                        <span className="text-sm font-semibold text-slate-100">
                          Police Voice
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Officers speak slow, calm taunts when pursuing or neutralizing you.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => soundEngine.speakPoliceLine('kill', 'Ruk saale bola tha na... ab bhugat!')}
                        disabled={!settings.policeVoiceEnabled}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 cursor-pointer"
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
                        className={`px-4 py-1.5 text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                          settings.policeVoiceEnabled
                            ? 'bg-amber-500 text-[#0B0E14]'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {settings.policeVoiceEnabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0B0E14] border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {settings.npcVoiceEnabled ? (
                          <Volume2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-slate-500" />
                        )}
                        <span className="text-sm font-semibold text-slate-100">
                          NPC Voices (Street &amp; Armory)
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Unique offline local voice profiles for citizens, enforcers, and the arms dealer.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => soundEngine.speakNpcLine('citizen', 7, 'Kaisa hai bhai? Chal chai piyega?')}
                        disabled={!settings.npcVoiceEnabled}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 cursor-pointer"
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
                        className={`px-4 py-1.5 text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                          settings.npcVoiceEnabled
                            ? 'bg-amber-500 text-[#0B0E14]'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {settings.npcVoiceEnabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0B0E14] border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {settings.gameVoiceEnabled ? (
                          <Volume2 className="w-4 h-4 text-sky-400" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-slate-500" />
                        )}
                        <span className="text-sm font-semibold text-slate-100">
                          In-Game &amp; Mission Voice
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Royal Bank Of India officer briefings and mission narrator announcements.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => soundEngine.speakNpcLine('banker', 777, 'Royal Bank Of India mein aapka swagat hai.')}
                        disabled={!settings.gameVoiceEnabled}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 cursor-pointer"
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
                        className={`px-4 py-1.5 text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                          settings.gameVoiceEnabled
                            ? 'bg-amber-500 text-[#0B0E14]'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {settings.gameVoiceEnabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0B0E14] border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-slate-100">
                        Retro Synth Voice Blips
                      </span>
                      <p className="text-xs text-slate-400">
                        Undertale-style Web Audio synth character blips paired with offline local voices.
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
                      className={`px-4 py-1.5 text-xs font-bold tracking-wide transition-colors cursor-pointer shrink-0 ${
                        settings.retroVoiceBlips
                          ? 'bg-amber-500 text-[#0B0E14]'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {settings.retroVoiceBlips ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {tab === 'controls' && (
              <>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-100">
                    Controls & Camera
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tune camera orbit speed and review field bindings.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-200 font-medium">Camera Sensitivity</span>
                    <span className="font-mono-num text-amber-400">
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

                <div className="p-4 bg-[#0B0E14] border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-100">
                      Phone Touchscreen Controls
                    </div>
                    <div className="text-xs text-slate-400">
                      Virtual thumbstick and action buttons for mobile or tablet play.
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-[#141A26] p-1 border border-slate-700">
                    {(['auto', 'on', 'off'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => onUpdateSettings({ ...settings, touchControls: opt })}
                        className={`px-3 py-1 text-xs font-bold uppercase cursor-pointer ${
                          settings.touchControls === opt
                            ? 'bg-amber-500 text-[#0B0E14]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  {[
                    ['W / S / A / D', 'Move / Steer Vehicle'],
                    ['Hold Shift', 'Sprint (Uses Stamina)'],
                    ['Space', 'Jump (On Foot)'],
                    ['C', 'First-Person View (FPV)'],
                    ['X / Right Click', 'Gun Scope / Aim (ADS)'],
                    ['E', 'Stall · Darshan · Dua · Dog'],
                    ['V / 1 / 2', 'Voice Mic / Chai Reply'],
                    ['M / Backspace', 'GPS Map / Clear Waypoint'],
                    ['Hold Q', 'GTA 5 Weapon Wheel'],
                    ['Left Click / J', '360° Camera & Fire'],
                    ['F / H / P', 'Vehicle / Medkit / Phone'],
                    ['B / Esc', 'Pankaj Ammunation / Pause'],
                  ].map(([key, action]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between px-3 py-2 bg-[#0B0E14] border border-slate-800"
                    >
                      <span className="font-mono-num text-amber-400 font-semibold">{key}</span>
                      <span className="text-slate-300">{action}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === 'display' && (
              <>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-100">
                    Display & HUD
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Adjust rendering shadows and viewport HUD density.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="p-4 bg-[#0B0E14] border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-100">Dynamic Shadows</div>
                      <div className="text-xs text-slate-400">
                        Real-time directional shadows for buildings, vehicles, and characters.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSettings({ ...settings, shadowsEnabled: !settings.shadowsEnabled })
                      }
                      className={`px-4 py-1.5 text-xs font-bold cursor-pointer ${
                        settings.shadowsEnabled
                          ? 'bg-amber-500 text-[#0B0E14]'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {settings.shadowsEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-4 bg-[#0B0E14] border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-100">Bottom Controls Hint</div>
                      <div className="text-xs text-slate-400">
                        Display compact keybind reminder along the bottom edge.
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
                      className={`px-4 py-1.5 text-xs font-bold cursor-pointer ${
                        settings.showControlsStrip
                          ? 'bg-amber-500 text-[#0B0E14]'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {settings.showControlsStrip ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {tab === 'cheats' && (
              <>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-100">
                    Cheat Terminal
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Firearms are expensive in Indian Theft Rickshaw. Enter classic codes if you want instant firepower.
                  </p>
                </div>

                <form onSubmit={handleCheatSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={cheatInput}
                    onChange={(e) => setCheatInput(e.target.value)}
                    placeholder="Enter cheat code (e.g. HESOYAM)..."
                    className="flex-1 px-3.5 py-2.5 bg-[#0B0E14] border border-slate-700 focus:border-amber-500 outline-none font-mono-num text-sm uppercase text-slate-100"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-[#0B0E14] font-bold text-sm transition-colors cursor-pointer"
                  >
                    Activate
                  </button>
                </form>

                {cheatFeedback && (
                  <div
                    className={`px-3.5 py-2 text-xs font-medium border ${
                      cheatFeedback.ok
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        : 'bg-red-950/60 border-red-500/50 text-red-300'
                    }`}
                  >
                    {cheatFeedback.text}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {[
                    ['HESOYAM', '+₹21,00,000, Full Health & Armor'],
                    ['LXGIWYL', 'Unlock All Firearms + Full Ammo'],
                    ['AEZAKMI', 'Toggle Never Wanted Mode'],
                    ['ASNAEB', 'Clear Current Wanted Level'],
                  ].map(([code, desc]) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setCheatInput(code)}
                      className="flex items-center justify-between px-3 py-2.5 bg-[#0B0E14] hover:bg-slate-900 border border-slate-800 text-left cursor-pointer transition-colors"
                    >
                      <span className="font-mono-num font-bold text-amber-400">{code}</span>
                      <span className="text-slate-400">{desc}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
