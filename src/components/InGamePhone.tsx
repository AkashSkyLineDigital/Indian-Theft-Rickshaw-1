import React, { useState } from 'react';
import {
  ArrowLeft,
  Car,
  Coffee,
  Crosshair,
  Disc,
  Eye,
  Hand,
  HardHat,
  HeartPulse,
  Map as MapIcon,
  Mic,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Smartphone,
  Terminal,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  BRIBE_PRICE_INR,
  ChaiDialoguePrompt,
  GameSettings,
  MAX_MEDKITS,
  MicHudState,
  PoliceInspectionHud,
  STREET_BRIBE_INR,
  WaypointHudState,
  formatRs,
} from '../types/game';

interface InGamePhoneProps {
  cash: number;
  wantedLevel: number;
  hp: number;
  maxHp: number;
  medkits: number;
  inVehicle: boolean;
  firstPerson: boolean;
  adsActive: boolean;
  waypoint: WaypointHudState | null;
  chaiPrompt: ChaiDialoguePrompt | null;
  micState: MicHudState;
  hasGunLicense: boolean;
  hasDrivingLicense: boolean;
  hasHelmet: boolean;
  helmetOn: boolean;
  policeInspection?: PoliceInspectionHud | null;
  settings: GameSettings;
  onUpdateSettings: (next: GameSettings) => void;
  onOpenFullSettings: () => void;
  onOpenArmory: () => void;
  onOpenMap: () => void;
  onClearWaypoint: () => void;
  onToggleMic: () => void;
  onToggleFirstPerson: () => void;
  onToggleAds: () => void;
  onToggleHelmet: () => void;
  onReplyChai: (accept: boolean) => void;
  onRespondLicenseCheck?: (showLicense: boolean) => void;
  onInteract: () => void;
  onUseMedkit: () => void;
  onOpenWheel: () => void;
  onEnterExitVehicle: () => void;
  onBribePolice: () => void;
  streetBribe?: { available: boolean; officerName: string; amount: number } | null;
  onOfferStreetBribe?: () => void;
  onSurrender?: () => void;
  onApplyCheat: (code: string) => { ok: boolean; message: string };
  onClose: () => void;
}

type PhoneScreen = 'home' | 'cheats';

export const InGamePhone: React.FC<InGamePhoneProps> = ({
  cash,
  wantedLevel,
  hp,
  maxHp,
  medkits,
  inVehicle,
  firstPerson,
  adsActive,
  waypoint,
  chaiPrompt,
  micState,
  hasGunLicense,
  hasDrivingLicense,
  hasHelmet,
  helmetOn,
  policeInspection,
  settings,
  onUpdateSettings,
  onOpenFullSettings,
  onOpenArmory,
  onOpenMap,
  onClearWaypoint,
  onToggleMic,
  onToggleFirstPerson,
  onToggleAds,
  onToggleHelmet,
  onReplyChai,
  onRespondLicenseCheck,
  onInteract,
  onUseMedkit,
  onOpenWheel,
  onEnterExitVehicle,
  onBribePolice,
  streetBribe,
  onOfferStreetBribe,
  onSurrender,
  onApplyCheat,
  onClose,
}) => {
  const [screen, setScreen] = useState<PhoneScreen>('home');
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleDial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    const res = onApplyCheat(code);
    setFeedback(res.message);
    if (res.ok) setCode('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-30 w-80 max-h-[86vh] bg-[#0B0E14] border-2 border-slate-600/90 shadow-2xl flex flex-col overflow-hidden pointer-events-auto">
      {/* Phone Status Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#141A26] border-b border-slate-800 text-[11px] font-mono-num shrink-0">
        <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
          <Smartphone className="w-3.5 h-3.5" />
          <span>ITR OS · PHONE</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Phone"
          className="text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Balance, Permits & Wanted Header */}
      <div className="px-3.5 py-2 bg-[#0F141E] border-b border-slate-800/80 flex items-center justify-between gap-1 text-xs shrink-0">
        <span className={`font-mono-num font-bold ${cash < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
          {formatRs(cash)}
        </span>
        <div className="flex items-center gap-1">
          <span
            className={`px-1 py-0.5 text-[9px] font-mono-num font-bold border ${
              hasGunLicense
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            {hasGunLicense ? 'ARMS' : 'NO ARMS'}
          </span>
          <span
            className={`px-1 py-0.5 text-[9px] font-mono-num font-bold border ${
              hasDrivingLicense
                ? 'bg-sky-950/60 border-sky-500/60 text-sky-300'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            {hasDrivingLicense ? 'DL' : 'NO DL'}
          </span>
        </div>
        <span className="font-mono-num text-slate-400">
          {wantedLevel}★
        </span>
      </div>

      {screen === 'home' ? (
        <div className="p-3 overflow-y-auto flex flex-col gap-2">
          {policeInspection && policeInspection.phase === 'ASKING' && onRespondLicenseCheck && (
            <div className="p-2.5 bg-sky-950/60 border border-sky-400/80 flex flex-col gap-1.5">
              <div className="text-[11px] font-display font-bold text-sky-300">
                {policeInspection.officerName}: &ldquo;License dikhao!&rdquo;
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onRespondLicenseCheck(true)}
                  className="py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono-num font-bold cursor-pointer"
                >
                  [E] Show License
                </button>
                <button
                  type="button"
                  onClick={() => onRespondLicenseCheck(false)}
                  className="py-1.5 bg-red-900 hover:bg-red-800 text-red-100 text-[10px] font-mono-num font-bold cursor-pointer"
                >
                  [R] Refuse
                </button>
              </div>
            </div>
          )}
          {/* Active Mic Status Bar Inside Phone */}
          {(micState.active || micState.status) && (
            <div
              className={`p-2.5 border text-xs flex flex-col gap-1.5 ${
                micState.active
                  ? 'bg-red-950/60 border-red-500/80 text-red-100'
                  : 'bg-sky-950/50 border-sky-500/50 text-sky-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-mono-num font-bold text-[11px]">
                  <Mic className={`w-3.5 h-3.5 ${micState.active ? 'text-red-400' : 'text-sky-400'}`} />
                  <span>{micState.active ? 'MIC ON · LISTENING' : 'VOICE MIC'}</span>
                </div>
                {micState.active && (
                  <div className="flex items-end gap-0.5 h-3.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        style={{ animationDelay: `${i * 0.11}s` }}
                        className="w-1 h-full bg-red-400 mic-eq-bar"
                      />
                    ))}
                  </div>
                )}
              </div>
              {micState.status && (
                <div className="text-[11px] leading-snug text-slate-200">{micState.status}</div>
              )}
              {micState.transcript && (
                <div className="text-[11px] font-mono-num text-amber-300">
                  Suna: &ldquo;{micState.transcript}&rdquo;
                </div>
              )}
            </div>
          )}

          {/* Active Chai Dialogue Quick Actions */}
          {chaiPrompt && (
            <div className="p-2.5 bg-[#141A26] border border-amber-500/70 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-display font-bold text-amber-400">
                <Coffee className="w-3.5 h-3.5" />
                <span>{chaiPrompt.npcName}: &ldquo;{chaiPrompt.line}&rdquo;</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onReplyChai(true)}
                  className="py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-mono-num font-bold cursor-pointer"
                >
                  [1] Haan chal
                </button>
                <button
                  type="button"
                  onClick={() => onReplyChai(false)}
                  className="py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-[11px] font-mono-num font-bold cursor-pointer"
                >
                  [2] Baad mein
                </button>
              </div>
            </div>
          )}

          {/* Primary Action Grid: Every Core Mechanic & Keybind */}
          {waypoint?.active && (
            <button
              type="button"
              onClick={onClearWaypoint}
              className="flex items-center justify-between px-3 py-2 bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/70 text-xs text-amber-200 cursor-pointer"
            >
              <span className="truncate font-semibold">GPS: {waypoint.label} ({waypoint.distanceMeters}m)</span>
              <span className="font-mono-num font-bold text-red-300 ml-2 shrink-0">CLEAR</span>
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenMap}
              className="flex flex-col items-center justify-center gap-1 p-2.5 bg-[#141A26] hover:bg-[#1E2638] border border-sky-500/40 text-slate-100 cursor-pointer transition-colors"
            >
              <MapIcon className="w-4 h-4 text-sky-400" />
              <span className="text-[11px] font-semibold">Map &amp; GPS (M)</span>
            </button>

            <button
              type="button"
              onClick={onToggleMic}
              className={`flex flex-col items-center justify-center gap-1 p-2.5 border cursor-pointer transition-colors ${
                micState.active
                  ? 'bg-red-600/90 hover:bg-red-500 border-red-400 text-white'
                  : 'bg-[#141A26] hover:bg-[#1E2638] border-slate-700/80 text-slate-100'
              }`}
            >
              <Mic className={`w-4 h-4 ${micState.active ? 'text-white' : 'text-emerald-400'}`} />
              <span className="text-[11px] font-semibold">
                {micState.active ? 'Stop Mic (V)' : 'Voice Mic (V)'}
              </span>
            </button>

            <button
              type="button"
              onClick={onInteract}
              className="flex flex-col items-center justify-center gap-1 p-2.5 bg-[#141A26] hover:bg-[#1E2638] border border-slate-700/80 text-slate-100 cursor-pointer transition-colors"
            >
              <Hand className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-semibold">Interact / Dog (E)</span>
            </button>

            <button
              type="button"
              onClick={onUseMedkit}
              disabled={medkits <= 0 || hp >= maxHp}
              className="flex flex-col items-center justify-center gap-1 p-2.5 bg-[#141A26] hover:bg-[#1E2638] disabled:opacity-45 border border-slate-700/80 text-slate-100 cursor-pointer transition-colors"
            >
              <HeartPulse className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-semibold">
                Medkit (H) {medkits}/{MAX_MEDKITS}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenWheel}
              className="flex flex-col items-center justify-center gap-1 p-2.5 bg-[#141A26] hover:bg-[#1E2638] border border-slate-700/80 text-slate-100 cursor-pointer transition-colors"
            >
              <Disc className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-semibold">Weapon Wheel (Q)</span>
            </button>

            <button
              type="button"
              onClick={onEnterExitVehicle}
              className="flex flex-col items-center justify-center gap-1 p-2.5 bg-[#141A26] hover:bg-[#1E2638] border border-slate-700/80 text-slate-100 cursor-pointer transition-colors"
            >
              <Car className="w-4 h-4 text-sky-400" />
              <span className="text-[11px] font-semibold">
                {inVehicle ? 'Exit Vehicle (F)' : 'Enter / Ride (F)'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenArmory}
              className="flex flex-col items-center justify-center gap-1 p-2.5 bg-[#141A26] hover:bg-[#1E2638] border border-slate-700/80 text-slate-100 cursor-pointer transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-semibold">Pankaj Armory (B)</span>
            </button>

            <button
              type="button"
              onClick={onToggleFirstPerson}
              className={`flex flex-col items-center justify-center gap-1 p-2.5 border cursor-pointer transition-colors ${
                firstPerson
                  ? 'bg-sky-600/85 border-sky-400 text-white'
                  : 'bg-[#141A26] hover:bg-[#1E2638] border-slate-700/80 text-slate-100'
              }`}
            >
              <Eye className={`w-4 h-4 ${firstPerson ? 'text-white' : 'text-sky-400'}`} />
              <span className="text-[11px] font-semibold">1st Person (C)</span>
            </button>

            <button
              type="button"
              onClick={onToggleAds}
              className={`flex flex-col items-center justify-center gap-1 p-2.5 border cursor-pointer transition-colors ${
                adsActive
                  ? 'bg-amber-500/90 border-amber-300 text-[#0B0E14]'
                  : 'bg-[#141A26] hover:bg-[#1E2638] border-slate-700/80 text-slate-100'
              }`}
            >
              <Crosshair className={`w-4 h-4 ${adsActive ? 'text-[#0B0E14]' : 'text-amber-400'}`} />
              <span className="text-[11px] font-semibold">Scope / Aim (X)</span>
            </button>

            <button
              type="button"
              onClick={onOpenFullSettings}
              className="flex flex-col items-center justify-center gap-1 p-2.5 bg-[#141A26] hover:bg-[#1E2638] border border-slate-700/80 text-slate-100 cursor-pointer transition-colors"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-semibold">Settings (Esc)</span>
            </button>

            <button
              type="button"
              onClick={() => setScreen('cheats')}
              className="flex flex-col items-center justify-center gap-1 p-2.5 bg-[#141A26] hover:bg-[#1E2638] border border-slate-700/80 text-slate-100 cursor-pointer transition-colors"
            >
              <Terminal className="w-4 h-4 text-sky-400" />
              <span className="text-[11px] font-semibold">Dial Cheats</span>
            </button>

            {streetBribe?.available && onOfferStreetBribe ? (
              <button
                type="button"
                onClick={onOfferStreetBribe}
                className="flex flex-col items-center justify-center gap-1 p-2.5 bg-amber-950/75 hover:bg-amber-900/80 border border-amber-400/80 text-amber-200 cursor-pointer transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-amber-300" />
                <span className="text-[11px] font-semibold">
                  Chai-Paani ({formatRs(STREET_BRIBE_INR)})
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onBribePolice}
                className="flex flex-col items-center justify-center gap-1 p-2.5 bg-[#141A26] hover:bg-[#1E2638] border border-slate-700/80 text-slate-100 cursor-pointer transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span className="text-[11px] font-semibold">Bribe ({formatRs(BRIBE_PRICE_INR)})</span>
              </button>
            )}

            {wantedLevel >= 1 && onSurrender && (
              <button
                type="button"
                onClick={onSurrender}
                className="col-span-2 flex items-center justify-center gap-2 p-2 bg-sky-900/75 hover:bg-sky-800 border border-sky-400/80 text-sky-100 cursor-pointer transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-sky-300" />
                <span className="text-[11px] font-semibold">Surrender to Police (Hold H)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onToggleHelmet}
              className={`col-span-2 flex items-center justify-center gap-2 p-2 border cursor-pointer transition-colors ${
                helmetOn
                  ? 'bg-emerald-900/70 border-emerald-400 text-emerald-100'
                  : 'bg-[#141A26] hover:bg-[#1E2638] border-slate-700/80 text-slate-100'
              }`}
            >
              <HardHat className={`w-4 h-4 ${helmetOn ? 'text-emerald-300' : 'text-amber-400'}`} />
              <span className="text-[11px] font-semibold">
                {!hasHelmet ? 'Helmet: Buy at DM Office (L)' : helmetOn ? 'Helmet ON — Take Off (L)' : 'Wear ISI Helmet (L)'}
              </span>
            </button>
          </div>

          {/* Audio & Controls Quick Switches */}
          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...settings,
                policeVoiceEnabled: !settings.policeVoiceEnabled,
              })
            }
            className="flex items-center justify-between px-3 py-2 bg-[#141A26] hover:bg-[#1E2638] border border-slate-700/80 text-xs cursor-pointer"
          >
            <span className="flex items-center gap-2 text-slate-200 font-medium">
              {settings.policeVoiceEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
              Police Voice
            </span>
            <span className="font-mono-num font-bold text-amber-400">
              {settings.policeVoiceEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...settings,
                npcVoiceEnabled: !settings.npcVoiceEnabled,
              })
            }
            className="flex items-center justify-between px-3 py-2 bg-[#141A26] hover:bg-[#1E2638] border border-slate-700/80 text-xs cursor-pointer"
          >
            <span className="text-slate-200 font-medium">NPC Voices</span>
            <span className="font-mono-num font-bold text-emerald-400">
              {settings.npcVoiceEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...settings,
                gameVoiceEnabled: !settings.gameVoiceEnabled,
              })
            }
            className="flex items-center justify-between px-3 py-2 bg-[#141A26] hover:bg-[#1E2638] border border-slate-700/80 text-xs cursor-pointer"
          >
            <span className="text-slate-200 font-medium">In-Game Voice</span>
            <span className="font-mono-num font-bold text-sky-400">
              {settings.gameVoiceEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...settings,
                retroVoiceBlips: !settings.retroVoiceBlips,
              })
            }
            className="flex items-center justify-between px-3 py-2 bg-[#141A26] hover:bg-[#1E2638] border border-slate-700/80 text-xs cursor-pointer"
          >
            <span className="text-slate-200 font-medium">Retro Voice Blips</span>
            <span className="font-mono-num font-bold text-amber-400">
              {settings.retroVoiceBlips ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...settings,
                touchControls: settings.touchControls === 'on' ? 'auto' : 'on',
              })
            }
            className="flex items-center justify-between px-3 py-2 bg-[#141A26] hover:bg-[#1E2638] border border-slate-700/80 text-xs cursor-pointer"
          >
            <span className="text-slate-200 font-medium">Touchscreen HUD</span>
            <span className="font-mono-num font-bold text-sky-400 uppercase">
              {settings.touchControls}
            </span>
          </button>
        </div>
      ) : (
        <div className="p-3.5 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              setScreen('home');
              setFeedback(null);
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <form onSubmit={handleDial} className="flex flex-col gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="HESOYAM / LXGIWYL"
              className="px-3 py-2 bg-[#141A26] border border-slate-700 focus:border-amber-500 outline-none font-mono-num text-xs uppercase text-slate-100"
            />
            <button
              type="submit"
              className="py-2 bg-amber-500 hover:bg-amber-400 text-[#0B0E14] font-bold text-xs cursor-pointer"
            >
              Execute Code
            </button>
          </form>

          {feedback && (
            <div className="text-[11px] text-emerald-300 bg-emerald-950/50 border border-emerald-500/40 p-2">
              {feedback}
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono-num">
            {['HESOYAM', 'LXGIWYL', 'AEZAKMI', 'ASNAEB'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCode(c)}
                className="py-1.5 bg-[#141A26] hover:bg-slate-800 border border-slate-700 text-amber-400 cursor-pointer"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
