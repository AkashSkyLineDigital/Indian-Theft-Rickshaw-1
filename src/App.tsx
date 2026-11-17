import { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCw, X } from 'lucide-react';
import { AtmModal } from './components/AtmModal';
import { BankModal } from './components/BankModal';
import { BustedOverlay } from './components/BustedOverlay';
import { CityMapModal } from './components/CityMapModal';
import { CourtroomOverlay } from './components/CourtroomOverlay';
import { CustodyCutsceneOverlay } from './components/CustodyCutsceneOverlay';
import { GunShopModal } from './components/GunShopModal';
import { HomeWardrobeModal } from './components/HomeWardrobeModal';
import { HouseNamingModal } from './components/HouseNamingModal';
import { HUD } from './components/HUD';
import { HudEditorModal } from './components/HudEditorModal';
import { InGamePhone } from './components/InGamePhone';
import { JailHudOverlay } from './components/JailHudOverlay';
import { LicenseOfficeModal } from './components/LicenseOfficeModal';
import { LicenseRevokedModal } from './components/LicenseRevokedModal';
import { SettingsModal } from './components/SettingsModal';
import { ShopConfirmModal } from './components/ShopConfirmModal';
import { SleepCutsceneOverlay } from './components/SleepCutsceneOverlay';
import { StreetStallModal } from './components/StreetStallModal';
import { TitleScreen } from './components/TitleScreen';
import { TouchControls } from './components/TouchControls';
import { WastedOverlay } from './components/WastedOverlay';
import { WeaponWheel } from './components/WeaponWheel';
import { GameEngine } from './engine/GameEngine';
import {
  AtmLandmarkHud,
  DAYS_PER_YEAR,
  DEFAULT_SETTINGS,
  FD_ANNUAL_RATE,
  FloatingToast,
  GameMode,
  GameSettings,
  HudSnapshot,
  SAVINGS_ANNUAL_RATE,
  STARTING_CASH_INR,
  StreetStallHudInfo,
  WeaponId,
  formatInGameDate,
  normalizeSettings,
} from './types/game';

const SETTINGS_STORAGE_KEY = 'itr_settings_v1';

function loadSavedSettings(): GameSettings {
  try {
    const raw =
      localStorage.getItem(SETTINGS_STORAGE_KEY) ?? localStorage.getItem('san_verde_settings_v1');
    if (!raw) return normalizeSettings(DEFAULT_SETTINGS);
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return normalizeSettings(DEFAULT_SETTINGS);
  }
}

const INITIAL_HUD: HudSnapshot = {
  hp: 100,
  maxHp: 100,
  armor: 0,
  stamina: 100,
  maxStamina: 100,
  medkits: 0,
  cash: STARTING_CASH_INR,
  wantedLevel: 0,
  wantedTierTitle: '',
  wantedNextHint: null,
  wantedCooldownPct: 0,
  hasGunLicense: false,
  hasDrivingLicense: false,
  hasHelmet: false,
  helmetOn: false,
  activeWeapon: 'fists',
  ownedWeapons: ['fists'],
  ammo: { fists: 0, pistol: 0, smg: 0, shotgun: 0, rifle: 0 },
  inVehicle: false,
  currentVehicleKind: null,
  vehicleName: '',
  vehicleSpeedKmh: 0,
  vehicleSteer: 0,
  vehicleGear: 'N',
  vehicleHeadlightsOn: true,
  vehicleFuelPct: 100,
  vehicleAltitudeM: 0,
  playerX: 0,
  playerZ: 8,
  playerYaw: 0,
  pointerLocked: false,
  firstPerson: false,
  cameraMode: 'third_far',
  adsActive: false,
  targetInCrosshair: false,
  nearPrompt: null,
  nearGunShop: false,
  nearBank: false,
  nearLicenseOffice: false,
  nearThanaDesk: false,
  nearRescueVan: false,
  nearDogAction: null,
  nearStall: null,
  nearAtm: null,
  nearSacredPlace: null,
  witnessAlert: null,
  policeInspection: null,
  chaiPrompt: null,
  micState: {
    active: false,
    mode: null,
    status: null,
    transcript: null,
  },
  npcSubtitle: null,
  policeWarning: null,
  wastedReason: '',
  bustedReason: '',
  bustedConfiscated: [],
  policeNonLethalArrest: false,
  surrenderHoldPct: 0,
  streetBribe: null,
  kills: 0,
  blips: [],
  damagedNpcs: [],
  worldLabels: [],
  mission: {
    active: false,
    phase: 'NONE',
    timeRemainingSec: 0,
    enemiesRemaining: 0,
    enemiesTotal: 5,
    targetX: 150,
    targetZ: -150,
    distanceMeters: 0,
    routePoints: [],
    objectiveText: '',
    cutsceneBanner: null,
  },
  timeOfDay: {
    minutesOfDay: 480,
    formattedTime: '08:00 AM',
    phaseLabel: 'MORNING',
    dayCount: 1,
  },
  waypoint: null,
  blessedRemainingSec: 0,
  blessedTotalSec: 45,
  prayerAnim: null,
  bank: {
    savingsPrincipal: 0,
    savingsInterest: 0,
    savingsTotal: 0,
    savingsDailyRate: SAVINGS_ANNUAL_RATE / DAYS_PER_YEAR,
    fdPrincipal: 0,
    fdInterest: 0,
    fdTotal: 0,
    fdDailyRate: FD_ANNUAL_RATE / DAYS_PER_YEAR,
    fdOpenedDay: null,
    totalInterestEarned: 0,
    calendarDate: formatInGameDate(1),
    passbook: [],
  },
  courtroom: null,
  custodyCutscene: null,
  sleepCutscene: null,
  probationDaysLeft: 0,
  licenseRevokedPrompt: null,
  jail: null,
  houseName: null,
  needsHouseNaming: false,
  homePos: { x: 30, z: 109.5 },
  nearHomeStation: null,
  playerOutfit: 'default',
  wardrobe: {
    weapons: [],
    armor: 0,
    medkits: 0,
  },
};

export default function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const toastIdRef = useRef(1);
  const settingsOriginRef = useRef<'TITLE' | 'PLAYING' | 'JAIL'>('TITLE');

  const [mode, setMode] = useState<GameMode>('TITLE');
  const [shopOpen, setShopOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phoneMinimized, setPhoneMinimized] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [confirmGunId, setConfirmGunId] = useState<WeaponId | null>(null);
  const [activeStall, setActiveStall] = useState<StreetStallHudInfo | null>(null);
  const [activeAtm, setActiveAtm] = useState<AtmLandmarkHud | null>(null);
  const [licenseOfficeOpen, setLicenseOfficeOpen] = useState(false);
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const [bankModal, setBankModal] = useState<{ open: boolean; fromDebtBailout: boolean }>({
    open: false,
    fromDebtBailout: false,
  });
  const [settings, setSettings] = useState<GameSettings>(loadSavedSettings);
  const [hudEditorOpen, setHudEditorOpen] = useState(false);
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [toasts, setToasts] = useState<FloatingToast[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isNarrowPortrait, setIsNarrowPortrait] = useState(false);
  const [rotateHintDismissed, setRotateHintDismissed] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);

  useEffect(() => {
    const updateViewportFlags = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);
      setIsNarrowPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 540);
    };
    updateViewportFlags();
    window.addEventListener('resize', updateViewportFlags);
    window.addEventListener('orientationchange', updateViewportFlags);
    return () => {
      window.removeEventListener('resize', updateViewportFlags);
      window.removeEventListener('orientationchange', updateViewportFlags);
    };
  }, []);

  const pushToast = useCallback((toast: Omit<FloatingToast, 'id'>) => {
    const id = toastIdRef.current++;
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const handleOpenShop = useCallback(() => {
    engineRef.current?.setWeaponWheelOpen(false);
    setPhoneOpen(false);
    setMapOpen(false);
    setConfirmGunId(null);
    setActiveStall(null);
    setActiveAtm(null);
    setLicenseOfficeOpen(false);
    setBankModal({ open: false, fromDebtBailout: false });
    setShopOpen(true);
    engineRef.current?.setMode('PAUSED');
  }, []);

  const handleToggleMap = useCallback(() => {
    setMapOpen((prev) => {
      const next = !prev;
      if (next) {
        engineRef.current?.setWeaponWheelOpen(false);
        if (phoneOpen && !phoneMinimized) {
          setPhoneMinimized(true);
        }
        engineRef.current?.releasePointerLock();
      } else {
        engineRef.current?.requestPointerLock();
      }
      return next;
    });
  }, [phoneOpen, phoneMinimized]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let engine: GameEngine | null = null;
    try {
      engine = new GameEngine(el, {
        onHudUpdate: (snapshot) => setHud(snapshot),
        onModeChange: (nextMode) => {
          setMode(nextMode);
          if (nextMode !== 'PAUSED') {
            setShopOpen(false);
            setConfirmGunId(null);
            setActiveStall(null);
            setActiveAtm(null);
            setLicenseOfficeOpen(false);
            setWardrobeOpen(false);
            setHudEditorOpen(false);
            setBankModal({ open: false, fromDebtBailout: false });
          }
          if (nextMode !== 'PLAYING') {
            setWheelOpen(false);
            setPhoneOpen(false);
            setPhoneMinimized(false);
            setMapOpen(false);
          }
        },
        onToast: pushToast,
        onWeaponWheelChange: (open) => setWheelOpen(open),
        onShopDisplayClick: (weaponId) => {
          setMapOpen(false);
          setPhoneOpen(false);
          setActiveStall(null);
          setActiveAtm(null);
          setLicenseOfficeOpen(false);
          setConfirmGunId(weaponId);
          engineRef.current?.setMode('PAUSED');
        },
        onShopDealerClick: () => {
          setMapOpen(false);
          setPhoneOpen(false);
          setActiveStall(null);
          setActiveAtm(null);
          setLicenseOfficeOpen(false);
          setShopOpen(true);
          engineRef.current?.setMode('PAUSED');
        },
        onBankPrompt: (fromDebtBailout) => {
          setMapOpen(false);
          setPhoneOpen(false);
          setActiveStall(null);
          setActiveAtm(null);
          setLicenseOfficeOpen(false);
          setBankModal({ open: true, fromDebtBailout });
          engineRef.current?.setMode('PAUSED');
        },
        onOpenStall: (stall) => {
          setMapOpen(false);
          setPhoneOpen(false);
          setShopOpen(false);
          setConfirmGunId(null);
          setActiveAtm(null);
          setLicenseOfficeOpen(false);
          setActiveStall(stall);
          engineRef.current?.setMode('PAUSED');
        },
        onOpenAtm: (atm) => {
          setMapOpen(false);
          setPhoneOpen(false);
          setShopOpen(false);
          setConfirmGunId(null);
          setActiveStall(null);
          setLicenseOfficeOpen(false);
          setBankModal({ open: false, fromDebtBailout: false });
          setActiveAtm(atm);
          engineRef.current?.setMode('PAUSED');
        },
        onOpenLicenseOffice: () => {
          setMapOpen(false);
          setPhoneOpen(false);
          setShopOpen(false);
          setConfirmGunId(null);
          setActiveStall(null);
          setActiveAtm(null);
          setWardrobeOpen(false);
          setBankModal({ open: false, fromDebtBailout: false });
          setLicenseOfficeOpen(true);
          engineRef.current?.setMode('PAUSED');
        },
        onOpenWardrobe: () => {
          setMapOpen(false);
          setPhoneOpen(false);
          setShopOpen(false);
          setConfirmGunId(null);
          setActiveStall(null);
          setActiveAtm(null);
          setLicenseOfficeOpen(false);
          setBankModal({ open: false, fromDebtBailout: false });
          setWardrobeOpen(true);
          engineRef.current?.setMode('PAUSED');
        },
        onToggleMap: handleToggleMap,
        onOpenShopShortcut: handleOpenShop,
      });
      engine.updateSettings(settings);
      engineRef.current = engine;
      setEngineError(null);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'WebGL 3D engine could not initialize in this browser context.';
      setEngineError(msg);
      engineRef.current = null;
    }

    return () => {
      engine?.dispose();
      engineRef.current = null;
    };
    // Mount WebGL canvas strictly once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync settings to engine & localStorage
  const handleUpdateSettings = useCallback((next: GameSettings) => {
    setSettings(next);
    engineRef.current?.updateSettings(next);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage quota errors
    }
  }, []);

  // Keyboard shortcuts for Armory (B), Phone (P), and Esc closing open Phone/Map overlays
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }
      if (e.code === 'Escape' && mode === 'PAUSED' && settingsOriginRef.current === 'TITLE') {
        e.stopImmediatePropagation();
        engineRef.current?.setMode('TITLE');
        return;
      }
      if (e.code === 'Escape' && mode === 'PLAYING' && (mapOpen || (phoneOpen && !phoneMinimized))) {
        e.stopImmediatePropagation();
        setMapOpen(false);
        setPhoneOpen(false);
        setPhoneMinimized(false);
        engineRef.current?.requestPointerLock();
        return;
      }
      const kb = settings.keybinds;
      if (e.code === kb.shop) {
        if (mode === 'PLAYING' && !shopOpen && !confirmGunId) {
          if (engineRef.current?.isStreetBribeAvailable()) {
            engineRef.current.offerStreetBribe();
            return;
          }
          handleOpenShop();
        } else if (shopOpen) {
          setShopOpen(false);
          engineRef.current?.setMode('PLAYING');
        }
      } else if (e.code === kb.phone) {
        if (mode === 'PLAYING') {
          if (!phoneOpen || phoneMinimized) {
            engineRef.current?.setWeaponWheelOpen(false);
            setMapOpen(false);
            setPhoneOpen(true);
            setPhoneMinimized(false);
            engineRef.current?.releasePointerLock();
          } else {
            setPhoneOpen(false);
            setPhoneMinimized(false);
            engineRef.current?.requestPointerLock();
          }
        }
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [mode, shopOpen, confirmGunId, mapOpen, phoneOpen, phoneMinimized, handleOpenShop, settings.keybinds.shop, settings.keybinds.phone]);

  const handleOpenSettings = () => {
    engineRef.current?.setWeaponWheelOpen(false);
    settingsOriginRef.current =
      mode === 'TITLE' ? 'TITLE' : mode === 'JAIL' || hud.jail?.active ? 'JAIL' : 'PLAYING';
    setShopOpen(false);
    setConfirmGunId(null);
    setActiveStall(null);
    setActiveAtm(null);
    setLicenseOfficeOpen(false);
    setWardrobeOpen(false);
    setBankModal({ open: false, fromDebtBailout: false });
    setPhoneOpen(false);
    setPhoneMinimized(false);
    setMapOpen(false);
    engineRef.current?.setMode('PAUSED');
  };

  const handleResumeFromSettings = () => {
    if (settingsOriginRef.current === 'TITLE') {
      engineRef.current?.setMode('TITLE');
      return;
    }
    engineRef.current?.setMode(hud.jail?.active ? 'JAIL' : 'PLAYING');
  };

  const handleCloseShop = () => {
    setShopOpen(false);
    engineRef.current?.setMode('PLAYING');
  };

  const handleCloseConfirmGun = () => {
    setConfirmGunId(null);
    engineRef.current?.setMode('PLAYING');
  };

  const handleCloseStall = () => {
    setActiveStall(null);
    engineRef.current?.setMode('PLAYING');
  };

  const handleCloseAtm = () => {
    setActiveAtm(null);
    engineRef.current?.setMode('PLAYING');
  };

  const handleCloseBankModal = () => {
    setBankModal({ open: false, fromDebtBailout: false });
    engineRef.current?.setMode('PLAYING');
  };

  const handleCloseLicenseOffice = () => {
    setLicenseOfficeOpen(false);
    engineRef.current?.setMode('PLAYING');
  };

  const handleCloseWardrobe = () => {
    setWardrobeOpen(false);
    engineRef.current?.setMode('PLAYING');
  };

  const handleStartMission = () => {
    setBankModal({ open: false, fromDebtBailout: false });
    engineRef.current?.startDogRescueMission();
  };

  const handleResetFullGame = () => {
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      localStorage.removeItem('san_verde_settings_v1');
      localStorage.removeItem('itr_save_v1');
    } catch {
      // ignore
    }
    const fresh = { ...DEFAULT_SETTINGS };
    setSettings(fresh);
    engineRef.current?.resetFullGame();
    pushToast({ text: 'All game data & settings reset to default', tone: 'info' });
  };

  const showTouchHud =
    (mode === 'PLAYING' || mode === 'JAIL') &&
    hud.mission.phase !== 'CUTSCENE' &&
    !wheelOpen &&
    (!phoneOpen || phoneMinimized) &&
    !mapOpen &&
    (settings.touchControls === 'on' || (settings.touchControls === 'auto' && isTouchDevice));

  return (
    <div className="relative w-full h-full bg-[#0B0E14] overflow-hidden">
      {/* Isolated WebGL Viewport */}
      <div ref={mountRef} className="w-full h-full" />

      {engineError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0E14]/95 p-6">
          <div className="max-w-md w-full bg-[#121722] border border-red-500/50 p-6 shadow-2xl space-y-4">
            <h2 className="font-display text-xl font-bold text-red-400">
              3D Graphics Startup Error
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Indian Theft Rickshaw could not initialize WebGL graphics ({engineError}). Try
              reloading or resetting saved browser data.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#0B0E14] text-xs font-bold uppercase cursor-pointer"
              >
                Reload Game
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem('itr_save_v1');
                    localStorage.removeItem(SETTINGS_STORAGE_KEY);
                  } catch {
                    // ignore
                  }
                  window.location.reload();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold uppercase cursor-pointer"
              >
                Reset Save & Reload
              </button>
            </div>
          </div>
        </div>
      )}

      {!engineError && mode === 'TITLE' && (
        <TitleScreen
          onStart={() => {
            settingsOriginRef.current = 'PLAYING';
            engineRef.current?.startGame();
          }}
          onOpenSettings={handleOpenSettings}
        />
      )}

      {!engineError && mode === 'PLAYING' && (
        <HUD
          hud={hud}
          toasts={toasts}
          showControlsStrip={settings.showControlsStrip && !showTouchHud}
          isTouchHud={showTouchHud}
          voiceMicEnabled={settings.voiceMicEnabled}
          keybinds={settings.keybinds}
          onOpenSettings={handleOpenSettings}
          onOpenShop={handleOpenShop}
          onOpenPhone={() => {
            setMapOpen(false);
            if (!phoneOpen || phoneMinimized) {
              engineRef.current?.setWeaponWheelOpen(false);
              setPhoneOpen(true);
              setPhoneMinimized(false);
              engineRef.current?.releasePointerLock();
            } else {
              setPhoneOpen(false);
              setPhoneMinimized(false);
              engineRef.current?.requestPointerLock();
            }
          }}
          onOpenWheel={() => engineRef.current?.setWeaponWheelOpen(!wheelOpen)}
          onOpenMap={handleToggleMap}
          onClickDisplayLabel={(wid) => {
            setConfirmGunId(wid);
            engineRef.current?.setMode('PAUSED');
          }}
          onClickDealerLabel={handleOpenShop}
          onClickBankerLabel={() => {
            setBankModal({ open: true, fromDebtBailout: false });
            engineRef.current?.setMode('PAUSED');
          }}
          onClickLicenseOfficerLabel={() => {
            setLicenseOfficeOpen(true);
            engineRef.current?.setMode('PAUSED');
          }}
          onRespondLicenseCheck={(show) => engineRef.current?.respondToLicenseCheck(show)}
          onUseMedkit={() => engineRef.current?.useMedkit()}
          onSkipCutscene={() => engineRef.current?.skipCutscene()}
          onSelectWeapon={(id) => engineRef.current?.equipWeapon(id)}
          onReplyChai={(accept) => engineRef.current?.replyToChai(accept)}
          onStartMicReply={() => engineRef.current?.toggleOrStartMic()}
          onToggleFirstPerson={() => engineRef.current?.toggleFirstPerson()}
          onToggleHeadlights={() => engineRef.current?.toggleVehicleHeadlights()}
          onToggleAds={() => engineRef.current?.toggleAds()}
          onToggleHelmet={() => engineRef.current?.toggleHelmet()}
          onContextInteract={() => engineRef.current?.triggerContextAction()}
          onClearWaypoint={() => engineRef.current?.clearWaypoint()}
          onOfferStreetBribe={() => engineRef.current?.offerStreetBribe()}
          onSurrender={() => engineRef.current?.triggerManualSurrender()}
          onClickHomeStation={(station) => {
            if (station === 'PUJA') engineRef.current?.prayAtHomePuja();
            else if (station === 'BED') engineRef.current?.sleepAtHomeBed();
            else if (station === 'WARDROBE') {
              setWardrobeOpen(true);
              engineRef.current?.setMode('PAUSED');
            }
          }}
        />
      )}

      {!engineError && showTouchHud && (
        <TouchControls
          inJail={mode === 'JAIL'}
          inVehicle={mode === 'PLAYING' && hud.inVehicle}
          isChopper={mode === 'PLAYING' && hud.currentVehicleKind === 'chopper'}
          headlightsOn={hud.vehicleHeadlightsOn}
          canUseMedkit={mode === 'PLAYING' && hud.medkits > 0 && hud.hp < hud.maxHp}
          micListening={mode === 'PLAYING' && hud.micState.active}
          voiceMicEnabled={settings.voiceMicEnabled}
          firstPerson={hud.firstPerson}
          cameraMode={hud.cameraMode}
          adsActive={mode === 'PLAYING' && hud.adsActive}
          canAds={mode === 'PLAYING' && hud.activeWeapon !== 'fists'}
          hasHelmet={mode === 'PLAYING' && hud.hasHelmet}
          helmetOn={mode === 'PLAYING' && hud.helmetOn}
          isBike={mode === 'PLAYING' && hud.currentVehicleKind === 'bike'}
          buttonScale={settings.touchButtonScale ?? 1}
          opacity={settings.touchOpacity ?? 0.9}
          movementStyle={settings.touchMovementStyle ?? 'joystick'}
          customHud={settings.customHud}
          contextLabel={
            mode === 'JAIL'
              ? hud.jail?.nearStation === 'BUNK'
                ? 'SLEEP'
                : hud.jail?.nearStation === 'TOILET'
                  ? 'TOILET'
                  : hud.jail?.nearStation === 'WORKSHOP'
                    ? 'JAIL WORK'
                    : hud.jail?.nearStation === 'INMATE_ALLY'
                      ? 'DISTRACT'
                      : hud.jail?.nearStation === 'WARDEN'
                        ? 'WARDEN'
                        : hud.jail?.nearStation === 'ESCAPE_GATE'
                          ? 'ESCAPE'
                          : null
              : hud.policeInspection?.phase === 'ASKING'
                ? 'LICENSE'
                : hud.nearRescueVan
                  ? 'OPEN VAN'
                  : hud.nearDogAction === 'pet'
                    ? 'PET DOG'
                    : hud.nearDogAction === 'sit'
                      ? 'SIT DOG'
                      : hud.nearDogAction === 'follow'
                        ? 'CALL DOG'
                        : hud.nearAtm
                          ? 'ATM'
                          : hud.nearStall
                            ? 'ORDER'
                            : hud.nearSacredPlace
                              ? hud.nearSacredPlace.kind === 'mosque'
                                ? 'DUA'
                                : 'DARSHAN'
                              : hud.nearThanaDesk
                                ? 'THANA DESK'
                                : hud.nearLicenseOffice
                                  ? 'LICENSE'
                                  : hud.nearBank
                                    ? 'BANK'
                                    : null
          }
          onMove={(x, y) => engineRef.current?.setTouchMove(x, y)}
          onSprint={(active) => engineRef.current?.setTouchSprint(active)}
          onCameraDelta={(dx, dy) => engineRef.current?.addCameraDelta(dx, dy)}
          onAttack={() => engineRef.current?.triggerAttack()}
          onAttackHeld={(held) => engineRef.current?.setTouchAttackHeld(held)}
          onJump={() => engineRef.current?.triggerJump()}
          onEnterExit={() => engineRef.current?.triggerEnterExit()}
          onUseMedkit={() => engineRef.current?.useMedkit()}
          onContextAction={() => engineRef.current?.triggerContextAction()}
          onToggleMic={() => engineRef.current?.toggleOrStartMic()}
          onToggleFirstPerson={() => engineRef.current?.toggleFirstPerson()}
          onToggleAds={() => engineRef.current?.toggleAds()}
          onSetAds={(active) => engineRef.current?.setAds(active)}
          onToggleHelmet={() => engineRef.current?.toggleHelmet()}
          onOpenMap={handleToggleMap}
          onOpenWheel={() => engineRef.current?.setWeaponWheelOpen(true)}
          onOpenPhone={() => {
            if (mode !== 'PLAYING') return;
            engineRef.current?.setWeaponWheelOpen(false);
            engineRef.current?.releasePointerLock();
            setMapOpen(false);
            setPhoneOpen(true);
            setPhoneMinimized(false);
          }}
          onOpenSettings={handleOpenSettings}
          onRadio={() => engineRef.current?.triggerRadioChatter()}
          onHorn={() => engineRef.current?.triggerVehicleHorn()}
          onToggleHeadlights={() => engineRef.current?.toggleVehicleHeadlights()}
          onChopperAltitude={(asc, desc) => engineRef.current?.setChopperAltitudeInput(asc, desc)}
          canSurrender={mode === 'PLAYING' && hud.wantedLevel >= 1}
          canStreetBribe={mode === 'PLAYING' && Boolean(hud.streetBribe?.available)}
          onSurrender={() => engineRef.current?.triggerManualSurrender()}
          onOfferStreetBribe={() => engineRef.current?.offerStreetBribe()}
        />
      )}

      {/* Clean, dismissible portrait mobile orientation hint */}
      {!engineError && isTouchDevice && isNarrowPortrait && !rotateHintDismissed && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 bg-[#0B0E14]/95 border border-amber-500/80 shadow-xl flex items-center gap-2 max-w-[92vw]">
          <RotateCw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] font-mono-num text-amber-100 whitespace-nowrap">
            Rotate to Landscape for Best View
          </span>
          <button
            type="button"
            onClick={() => setRotateHintDismissed(true)}
            aria-label="Dismiss rotate hint"
            className="p-0.5 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {!engineError && mode === 'PLAYING' && wheelOpen && (
        <WeaponWheel
          activeWeapon={hud.activeWeapon}
          ownedWeapons={hud.ownedWeapons}
          ammo={hud.ammo}
          onSelect={(id) => engineRef.current?.equipWeapon(id)}
          onClose={() => {
            engineRef.current?.setWeaponWheelOpen(false);
            engineRef.current?.requestPointerLock();
          }}
        />
      )}

      {!engineError && mode === 'PLAYING' && mapOpen && (
        <CityMapModal
          hud={hud}
          onSetWaypoint={(x, z, label) => engineRef.current?.setWaypoint(x, z, label)}
          onClearWaypoint={() => engineRef.current?.clearWaypoint()}
          onClose={() => {
            setMapOpen(false);
            engineRef.current?.requestPointerLock();
          }}
        />
      )}

      {!engineError && mode === 'PLAYING' && phoneOpen && (
        <InGamePhone
          cash={hud.cash}
          wantedLevel={hud.wantedLevel}
          hp={hud.hp}
          maxHp={hud.maxHp}
          medkits={hud.medkits}
          kills={hud.kills}
          probationDaysLeft={hud.probationDaysLeft}
          houseName={hud.houseName}
          homePos={hud.homePos}
          timeOfDay={hud.timeOfDay}
          bank={hud.bank}
          inVehicle={hud.inVehicle}
          playerX={hud.playerX}
          playerZ={hud.playerZ}
          playerYaw={hud.playerYaw}
          blips={hud.blips}
          firstPerson={hud.firstPerson}
          adsActive={hud.adsActive}
          waypoint={hud.waypoint}
          chaiPrompt={hud.chaiPrompt}
          micState={hud.micState}
          hasGunLicense={hud.hasGunLicense}
          hasDrivingLicense={hud.hasDrivingLicense}
          hasHelmet={hud.hasHelmet}
          helmetOn={hud.helmetOn}
          policeInspection={hud.policeInspection}
          settings={settings}
          minimized={phoneMinimized}
          onMinimize={() => {
            setPhoneMinimized(true);
            engineRef.current?.requestPointerLock();
          }}
          onRestore={() => {
            setPhoneMinimized(false);
            engineRef.current?.releasePointerLock();
          }}
          onUpdateSettings={handleUpdateSettings}
          onOpenFullSettings={handleOpenSettings}
          onOpenArmory={handleOpenShop}
          onOpenMap={() => {
            engineRef.current?.setWeaponWheelOpen(false);
            setPhoneMinimized(true);
            setMapOpen(true);
          }}
          onSetWaypoint={(x, z, label) => engineRef.current?.setWaypoint(x, z, label)}
          onClearWaypoint={() => engineRef.current?.clearWaypoint()}
          onBankTransaction={(acc, act, amt) =>
            engineRef.current?.bankTransaction(acc, act, amt, true) ?? {
              ok: false,
              message: 'Royal Bank mobile link offline',
            }
          }
          onCaptureSnapshot={() => engineRef.current?.captureSnapshotDataUrl() ?? null}
          onRadio={() => engineRef.current?.triggerRadioChatter()}
          onToggleMic={() => engineRef.current?.toggleOrStartMic()}
          onToggleFirstPerson={() => engineRef.current?.toggleFirstPerson()}
          onToggleAds={() => engineRef.current?.toggleAds()}
          onToggleHelmet={() => engineRef.current?.toggleHelmet()}
          onReplyChai={(accept) => engineRef.current?.replyToChai(accept)}
          onRespondLicenseCheck={(show) => engineRef.current?.respondToLicenseCheck(show)}
          onInteract={() => {
            setPhoneOpen(false);
            setPhoneMinimized(false);
            engineRef.current?.triggerContextAction();
          }}
          onUseMedkit={() => engineRef.current?.useMedkit()}
          onOpenWheel={() => {
            setPhoneMinimized(true);
            engineRef.current?.setWeaponWheelOpen(true);
          }}
          onEnterExitVehicle={() => {
            setPhoneOpen(false);
            setPhoneMinimized(false);
            engineRef.current?.triggerEnterExit();
          }}
          onBribePolice={() => engineRef.current?.bribePolice()}
          streetBribe={hud.streetBribe}
          onOfferStreetBribe={() => {
            setPhoneOpen(false);
            setPhoneMinimized(false);
            engineRef.current?.offerStreetBribe();
          }}
          onSurrender={() => {
            setPhoneOpen(false);
            setPhoneMinimized(false);
            engineRef.current?.triggerManualSurrender();
          }}
          onApplyCheat={(code) =>
            engineRef.current?.applyCheat(code) ?? { ok: false, message: 'Engine not ready' }
          }
          onClose={() => {
            setPhoneOpen(false);
            setPhoneMinimized(false);
            engineRef.current?.requestPointerLock();
          }}
        />
      )}

      {!engineError &&
        mode === 'PAUSED' &&
        !hudEditorOpen &&
        !shopOpen &&
        !confirmGunId &&
        !bankModal.open &&
        !activeStall &&
        !activeAtm &&
        !licenseOfficeOpen &&
        !wardrobeOpen && (
          <SettingsModal
            settings={settings}
            openedFromTitle={settingsOriginRef.current === 'TITLE'}
            onUpdateSettings={handleUpdateSettings}
            onOpenHudEditor={() => setHudEditorOpen(true)}
            onResume={handleResumeFromSettings}
            onResetCity={() => engineRef.current?.resetCity()}
            onResetFullGame={handleResetFullGame}
            onApplyCheat={(code) =>
              engineRef.current?.applyCheat(code) ?? { ok: false, message: 'Engine not ready' }
            }
          />
        )}

      {!engineError && mode === 'PAUSED' && hudEditorOpen && (
        <HudEditorModal
          settings={settings}
          onSave={(next) => {
            handleUpdateSettings(next);
            pushToast({ text: 'Custom HUD layout saved', tone: 'info' });
          }}
          onClose={() => setHudEditorOpen(false)}
        />
      )}

      {!engineError && shopOpen && (
        <GunShopModal
          cash={hud.cash}
          hp={hud.hp}
          maxHp={hud.maxHp}
          armor={hud.armor}
          medkits={hud.medkits}
          ownedWeapons={hud.ownedWeapons}
          activeWeapon={hud.activeWeapon}
          ammo={hud.ammo}
          onBuyWeaponOrAmmo={(id) => engineRef.current?.buyWeaponOrAmmo(id)}
          onEquipWeapon={(id) => engineRef.current?.equipWeapon(id)}
          onBuyArmor={() => engineRef.current?.buyArmor()}
          onBuyMedkit={() => engineRef.current?.buyMedkit()}
          onUseMedkit={() => engineRef.current?.useMedkit()}
          onClose={handleCloseShop}
        />
      )}

      {!engineError && confirmGunId && (
        <ShopConfirmModal
          weaponId={confirmGunId}
          cash={hud.cash}
          owned={hud.ownedWeapons.includes(confirmGunId)}
          ammoCount={hud.ammo[confirmGunId] ?? 0}
          onConfirmBuy={() => engineRef.current?.buyWeaponOrAmmo(confirmGunId)}
          onEquip={() => engineRef.current?.equipWeapon(confirmGunId)}
          onCancel={handleCloseConfirmGun}
        />
      )}

      {!engineError && activeStall && (
        <StreetStallModal
          stall={activeStall}
          cash={hud.cash}
          hp={hud.hp}
          maxHp={hud.maxHp}
          stamina={hud.stamina}
          maxStamina={hud.maxStamina}
          onBuyItem={(stallId, item) => {
            engineRef.current?.buyStallItem(stallId, item);
          }}
          onClose={handleCloseStall}
        />
      )}

      {!engineError && activeAtm && (
        <AtmModal
          atm={activeAtm}
          cash={hud.cash}
          bank={hud.bank}
          onTransaction={(acc, act, amt) =>
            engineRef.current?.bankTransaction(acc, act, amt, true) ?? {
              ok: false,
              message: 'ATM link offline',
              amount: 0,
            }
          }
          onClose={handleCloseAtm}
        />
      )}

      {!engineError && bankModal.open && (
        <BankModal
          fromDebtBailout={bankModal.fromDebtBailout}
          cash={hud.cash}
          bank={hud.bank}
          timeOfDay={hud.timeOfDay}
          missionActive={hud.mission.active}
          probationDaysLeft={hud.probationDaysLeft}
          onTransaction={(acc, act, amt) =>
            engineRef.current?.bankTransaction(acc, act, amt, false) ?? {
              ok: false,
              message: 'Branch teller offline',
              amount: 0,
            }
          }
          onStartMission={handleStartMission}
          onClose={handleCloseBankModal}
        />
      )}

      {!engineError && licenseOfficeOpen && (
        <LicenseOfficeModal
          cash={hud.cash}
          hasGunLicense={hud.hasGunLicense}
          hasDrivingLicense={hud.hasDrivingLicense}
          hasHelmet={hud.hasHelmet}
          helmetOn={hud.helmetOn}
          onPayFee={() =>
            engineRef.current?.payLicenseFee() ?? { ok: false, message: 'DM Office counter offline' }
          }
          onGrantLicense={() => engineRef.current?.grantGunLicense()}
          onPayDrivingFee={() =>
            engineRef.current?.payDrivingLicenseFee() ?? {
              ok: false,
              message: 'DM RTO counter offline',
            }
          }
          onGrantDrivingLicense={() => engineRef.current?.grantDrivingLicense()}
          onBuyHelmet={() =>
            engineRef.current?.buyHelmet() ?? { ok: false, message: 'DM Helmet counter offline' }
          }
          onToggleHelmet={() => engineRef.current?.toggleHelmet()}
          onClose={handleCloseLicenseOffice}
        />
      )}

      {!engineError && mode === 'WASTED' && (
        <WastedOverlay
          reason={hud.wastedReason}
          kills={hud.kills}
          cash={hud.cash}
          onRespawn={() => engineRef.current?.respawnAtHospital()}
        />
      )}

      {!engineError && mode === 'BUSTED' && (
        <BustedOverlay
          reason={hud.bustedReason}
          confiscated={hud.bustedConfiscated}
          hasGunLicense={hud.hasGunLicense}
          cash={hud.cash}
          onRespawn={() => engineRef.current?.respawnAtThana()}
        />
      )}

      {!engineError && mode === 'CUSTODY' && hud.custodyCutscene && (
        <CustodyCutsceneOverlay
          cutscene={hud.custodyCutscene}
          onSkip={() => engineRef.current?.skipCustodyCutscene()}
        />
      )}

      {!engineError && mode === 'SLEEP' && hud.sleepCutscene && (
        <SleepCutsceneOverlay
          cutscene={hud.sleepCutscene}
          houseName={hud.houseName}
          dayCount={hud.timeOfDay.dayCount}
          calendarDate={hud.bank.calendarDate}
          formattedTime={hud.timeOfDay.formattedTime}
          probationDaysLeft={hud.probationDaysLeft}
          onSkip={() => engineRef.current?.skipSleepCutscene()}
        />
      )}

      {!engineError && mode === 'COURTROOM' && hud.courtroom && (
        <CourtroomOverlay
          courtroom={hud.courtroom}
          cash={hud.cash}
          bankSavings={hud.bank.savingsTotal}
          onAdvanceDialogue={() => engineRef.current?.advanceCourtroomDialogue()}
          onSkipArguments={() => engineRef.current?.skipCourtroomArguments()}
          onPayBail={(source) => engineRef.current?.payCourtroomBail(source)}
          onEnterJail={() => engineRef.current?.enterCentralJailFromCourt()}
          onRequestInterimBail={() => engineRef.current?.applySeniorAdvocateInterimBail()}
        />
      )}

      {!engineError && wardrobeOpen && (
        <HomeWardrobeModal
          houseName={hud.houseName ?? 'Apna Ghar'}
          currentOutfit={hud.playerOutfit}
          ownedWeapons={hud.ownedWeapons}
          wardrobeWeapons={hud.wardrobe.weapons}
          playerArmor={hud.armor}
          wardrobeArmor={hud.wardrobe.armor}
          playerMedkits={hud.medkits}
          wardrobeMedkits={hud.wardrobe.medkits}
          onSelectOutfit={(outfit) => engineRef.current?.setPlayerOutfit(outfit)}
          onStoreWeapon={(id) => engineRef.current?.storeWardrobeWeapon(id)}
          onRetrieveWeapon={(id) => engineRef.current?.retrieveWardrobeWeapon(id)}
          onStoreArmor={() => engineRef.current?.storeWardrobeArmor()}
          onRetrieveArmor={() => engineRef.current?.retrieveWardrobeArmor()}
          onStoreMedkit={() => engineRef.current?.storeWardrobeMedkit()}
          onRetrieveMedkit={() => engineRef.current?.retrieveWardrobeMedkit()}
          onClose={handleCloseWardrobe}
        />
      )}

      {!engineError && mode === 'PLAYING' && hud.needsHouseNaming && (
        <HouseNamingModal
          onConfirmName={(houseName) => {
            engineRef.current?.setHouseName(houseName);
            engineRef.current?.requestPointerLock();
          }}
        />
      )}

      {!engineError && mode === 'PLAYING' && hud.licenseRevokedPrompt?.active && (
        <LicenseRevokedModal
          prompt={hud.licenseRevokedPrompt}
          cash={hud.cash}
          bankSavings={hud.bank.savingsTotal}
          onRenewAtThana={(source) => {
            engineRef.current?.renewLicenseAtThana(source);
            engineRef.current?.requestPointerLock();
          }}
          onVisitDmLater={() => {
            engineRef.current?.dismissLicenseRevokedToDm();
            engineRef.current?.requestPointerLock();
          }}
        />
      )}

      {!engineError && mode === 'JAIL' && hud.jail && (
        <JailHudOverlay
          jail={hud.jail}
          cash={hud.cash}
          bankSavings={hud.bank.savingsTotal}
          firstPerson={hud.firstPerson}
          timeOfDay={hud.timeOfDay}
          toasts={toasts}
          worldLabels={hud.worldLabels}
          isTouchHud={showTouchHud}
          pointerLocked={hud.pointerLocked}
          onSleepNight={() => engineRef.current?.jailSleepNight()}
          onUseToilet={() => engineRef.current?.jailUseToilet()}
          onSkipSentence={() => engineRef.current?.jailSkipSentence()}
          onPerformWork={() => engineRef.current?.jailPerformWork()}
          onTriggerDistraction={() => engineRef.current?.jailTriggerInmateDistraction()}
          onBribeWarden={(source) => engineRef.current?.jailBribeWarden(source)}
          onBribeRival={(rivalId) => engineRef.current?.jailBribeRival(rivalId)}
          onAttack={() => engineRef.current?.triggerAttack()}
          onToggleFirstPerson={() => engineRef.current?.toggleFirstPerson()}
          onStartPrisonBreak={() => engineRef.current?.jailStartPrisonBreak()}
          onOpenSettings={handleOpenSettings}
        />
      )}
    </div>
  );
}
