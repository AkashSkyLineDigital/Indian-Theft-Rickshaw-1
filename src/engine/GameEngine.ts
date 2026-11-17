import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  ARMOR_PRICE_INR,
  AtmLandmarkHud,
  BANK_BAILOUT_GRANT_INR,
  BANK_DEBT_TRIGGER_INR,
  BRIBE_PRICE_INR,
  BankAccountHudState,
  CHOWK_ROUNDABOUTS,
  CITY_ROAD_CENTERS,
  COURT_BAIL_FEE_INR,
  CameraViewMode,
  CourtroomDialogueTurn,
  CourtroomState,
  CourtroomVerdictKind,
  CustodyCutsceneHud,
  CustodyPhase,
  DAYS_PER_YEAR,
  DEATH_FEE_INR,
  DEFAULT_SETTINGS,
  DRIVING_LICENSE_FEE_INR,
  DamagedNpcHud,
  DensityLevel,
  FD_ANNUAL_RATE,
  FloatingToast,
  GUN_LICENSE_FEE_INR,
  GameMode,
  GameSettings,
  HELMET_PRICE_INR,
  HIGH_BAIL_3_STAR_INR,
  HudSnapshot,
  JAIL_WARDEN_BRIBE_HIGH_INR,
  JAIL_WARDEN_BRIBE_LOW_INR,
  JAIL_WORK_WAGE_INR,
  JailHudState,
  JailRivalInfo,
  JailSchedulePhase,
  KeybindActionId,
  LAWYER_FEE_1_2_INR,
  LAWYER_FEE_3_INR,
  LicenseRevokedPromptHud,
  MAX_MEDKITS,
  MEDKIT_HEAL_AMOUNT,
  MEDKIT_PRICE_INR,
  MISSION_REWARD_INR,
  MISSION_TIME_LIMIT_SEC,
  MinimapBlip,
  MissionHudState,
  MissionPhase,
  NO_DL_FINE_INR,
  NO_HELMET_FINE_INR,
  PLAYER_OUTFITS,
  PassbookEntry,
  PlayerOutfitId,
  PoliceInspectionHud,
  PrayerAnimHud,
  SAVINGS_ANNUAL_RATE,
  SavedGameState,
  STARTING_CASH_INR,
  STREET_BRIBE_INR,
  SleepCutsceneHud,
  SleepCutsceneLocation,
  StreetStallHudInfo,
  StreetStallMenuItem,
  TimeOfDayHud,
  TimePhase,
  URGENT_THANA_LICENSE_RENEWAL_INR,
  VehicleKind,
  WANTED_TIER_TITLES,
  WEAPON_ORDER,
  WEAPONS,
  WORLD_LIMIT_METERS,
  WaypointHudState,
  WeaponId,
  WitnessAlertHud,
  WorldLabelHud,
  formatInGameDate,
  formatRs,
  formatRsExact,
} from '../types/game';
import { soundEngine } from './audio';
import { pickAmbientActorLine, pickHindiLine } from './hindiDialogues';
import {
  AtmInfo,
  BuildingCollider,
  BuildingSignInfo,
  CentralJailRig,
  ChaiStallInfo,
  CircleCollider,
  CourtComplexRig,
  CourtroomStageRig,
  DogRig,
  HelicopterRig,
  HumanoidRig,
  IndianFamilyHouseRig,
  InteriorLightSpot,
  RescueVanRig,
  SacredLandmarkInfo,
  ShopDealerInfo,
  ShopDisplayGun,
  TrafficSignalRig,
  VehicleRig,
  WaypointBeaconRig,
  buildCityEnvironment,
  createDistrictCourtroomStage,
  createHumanoidModel,
  createIndianDogModel,
  createPoliceChopperModel,
  createPrisonerVan,
  createRescueVanModel,
  createRoadblockBarricade,
  createVehicleModel,
  createWaypointBeacon,
  createWeaponModel,
} from './models';

interface NpcEntity {
  id: number;
  name: string;
  rig: HumanoidRig;
  x: number;
  z: number;
  yaw: number;
  vx: number;
  vz: number;
  hp: number;
  maxHp: number;
  knockbackResist: number;
  walkPhase: number;
  staggerTimer: number;
  wanderTimer: number;
  targetYaw: number;
  isEnforcer: boolean;
  isPolice: boolean;
  isTrafficPolice?: boolean;
  isBeatCop?: boolean;
  isSwat?: boolean;
  isCommando?: boolean;
  isArmy?: boolean;
  lawTier?: 1 | 2 | 3 | 4 | 5;
  weaponKind?: WeaponId;
  isPandit?: boolean;
  isImam?: boolean;
  landmarkKind?: 'ram_mandir' | 'krishna_mandir' | 'mosque' | 'market';
  homeX?: number;
  homeZ?: number;
  homeYaw?: number;
  isMissionEnemy?: boolean;
  hostile: boolean;
  aggressiveOnHit: boolean;
  fireCooldown: number;
  meleeCooldown: number;
  punchAnimTimer: number;
  dead: boolean;
  deathTimer: number;
  alertedTimer: number;
  greetCooldown: number;
  chaiCompanionTarget: ChaiStallInfo | null;
  bribeRefused?: boolean;
}

type DogBehavior = 'ROAM' | 'FOLLOW' | 'SIT';

interface DogEntity {
  id: number;
  rig: DogRig;
  x: number;
  y: number;
  z: number;
  yaw: number;
  targetYaw: number;
  speed: number;
  phase: number;
  wanderTimer: number;
  barkCooldown: number;
  isCutscene: boolean;
  behavior: DogBehavior;
  hp: number;
  maxHp: number;
  dead: boolean;
  deathTimer: number;
  hitCooldown: number;
}

type PoliceCarState = 'PATROL' | 'APPROACH' | 'STOPPED_DISMOUNTED' | 'TACTICAL_INTERCEPT';

interface VehicleEntity {
  id: number;
  name: string;
  kind: VehicleKind;
  rig: VehicleRig;
  x: number;
  y?: number;
  z: number;
  yaw: number;
  speed: number;
  maxSpeed: number;
  massFactor: number;
  hp: number;
  maxHp: number;
  destroyed: boolean;
  smokeTimer: number;
  wreckTimer: number;
  hitCooldowns: Map<number, number>;
  occupiedByPlayer: boolean;
  aiEnabled: boolean;
  aiDisabled: boolean;
  hasAiRider?: boolean;
  playerClaimed?: boolean;
  isStarterParked?: boolean;
  isDynamicTraffic?: boolean;
  aiHornCooldown?: number;
  origX: number;
  origZ: number;
  origYaw: number;
  origSpeed: number;
  origWasStarter: boolean;
  origColor?: number;
  origAxis: 'x' | 'z';
  origDir: 1 | -1;
  origRoadCenter: number;
  isTacticalReinforcement?: boolean;
  unitTier?: 1 | 2 | 3 | 4 | 5;
  policeState: PoliceCarState;
  maxOfficers: 1 | 2;
  spawnedOfficerIds: number[];
  dismountCooldown: number;
  stopCooldown: number;
  patrolAxis: 'x' | 'z';
  patrolDir: 1 | -1;
  patrolRoadCenter: number;
}

interface ExplosionEffect {
  fireball: THREE.Mesh;
  shockwave: THREE.Mesh;
  age: number;
  maxAge: number;
}

interface SmokePuffEffect {
  mesh: THREE.Mesh;
  vy: number;
  age: number;
  maxAge: number;
}

interface CashPickup {
  id: number;
  mesh: THREE.Group;
  x: number;
  z: number;
  amount: number;
  age: number;
}

interface BulletTrace {
  line: THREE.Line;
  ttl: number;
}

export interface EngineCallbacks {
  onHudUpdate: (snapshot: HudSnapshot) => void;
  onModeChange: (mode: GameMode) => void;
  onToast: (toast: Omit<FloatingToast, 'id'>) => void;
  onWeaponWheelChange: (open: boolean) => void;
  onShopDisplayClick: (weaponId: WeaponId) => void;
  onShopDealerClick: () => void;
  onBankPrompt: (fromDebtBailout: boolean) => void;
  onOpenStall?: (stall: StreetStallHudInfo) => void;
  onOpenAtm?: (atm: AtmLandmarkHud) => void;
  onOpenLicenseOffice?: () => void;
  onOpenWardrobe?: () => void;
  onToggleMap: () => void;
  onOpenShopShortcut?: () => void;
}

const WORLD_LIMIT = WORLD_LIMIT_METERS;
const SAVE_STORAGE_KEY = 'itr_save_v1';
const CURRENCY_VERSION = 2;

const INDIAN_CITIZEN_NAMES = [
  'Ramesh Verma',
  'Suresh Yadav',
  'Amit Sharma',
  'Priya Nair',
  'Kavita Joshi',
  'Vikram Patel',
  'Deepak Tiwari',
  'Anjali Gupta',
  'Rohan Deshmukh',
  'Manoj Kulkarni',
  'Neha Kapoor',
  'Arjun Chauhan',
  'Sanjay Mehta',
  'Pooja Mishra',
  'Karan Malhotra',
  'Sunita Iyer',
];

const INDIAN_ENFORCER_NAMES = [
  'Bunty Don',
  'Kallu Dada',
  'Shankar Bhai',
  'Rocky Pehelwan',
  'Babloo Ustad',
  'Vicky Shooter',
];

const INDIAN_POLICE_NAMES = [
  'Inspector Vijay Rathore',
  'SI Vikram Singh',
  'Constable Harish Rawat',
  'Constable Dinesh Tomar',
  'ASI Rajeshwar Dubey',
  'SI Pradeep Negi',
];

const INDIAN_TRAFFIC_COP_NAMES = [
  'Havaldar Rakesh Mishra',
  'Havaldar Mohan Shukla',
  'ASI Satpal Yadav',
  'Havaldar Mahendra Pal',
  'Havaldar Kamlesh Sahu',
  'ASI Devendra Chauhan',
  'Havaldar Omprakash',
  'Havaldar Sunil Sharma',
  'ASI Gajendra Negi',
];

function pickName(pool: string[], seed: number): string {
  return pool[Math.abs(seed) % pool.length];
}

function getLeftHandLaneCoord(roadCenter: number, axis: 'x' | 'z', dir: 1 | -1): number {
  const lane = 3.4;
  if (axis === 'z') {
    return dir === -1 ? roadCenter - lane : roadCenter + lane;
  }
  return dir === 1 ? roadCenter - lane : roadCenter + lane;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function normalizeAngle(a: number): number {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

const TIME_LIGHT_STOPS: {
  min: number;
  sky: number;
  sun: number;
  sunInt: number;
  hemi: number;
  hemiInt: number;
  fog: number;
  lamp: number;
  exp: number;
}[] = [
  { min: 0, sky: 0x09101d, sun: 0x6488ea, sunInt: 0.58, hemi: 0x3b4d78, hemiInt: 0.42, fog: 0.0046, lamp: 1.85, exp: 0.96 },
  { min: 300, sky: 0x162038, sun: 0x8ea4d8, sunInt: 0.65, hemi: 0x52648f, hemiInt: 0.48, fog: 0.0044, lamp: 1.5, exp: 0.99 },
  { min: 420, sky: 0xd98a5f, sun: 0xffd2a0, sunInt: 1.45, hemi: 0xfdcba0, hemiInt: 0.68, fog: 0.0038, lamp: 0.55, exp: 1.08 },
  { min: 540, sky: 0x5c9ce0, sun: 0xffefd2, sunInt: 1.95, hemi: 0xaad4ff, hemiInt: 0.82, fog: 0.0032, lamp: 0.1, exp: 1.14 },
  { min: 760, sky: 0x4ba0ea, sun: 0xfff8ea, sunInt: 2.25, hemi: 0xc2e2ff, hemiInt: 0.92, fog: 0.0029, lamp: 0.05, exp: 1.18 },
  { min: 990, sky: 0x66a3dd, sun: 0xffe9c7, sunInt: 1.9, hemi: 0xb0d3f5, hemiInt: 0.82, fog: 0.0032, lamp: 0.15, exp: 1.14 },
  { min: 1110, sky: 0xc96c45, sun: 0xfb923c, sunInt: 1.35, hemi: 0xf09d6c, hemiInt: 0.64, fog: 0.0039, lamp: 1.1, exp: 1.06 },
  { min: 1200, sky: 0x181c30, sun: 0x7c8cc4, sunInt: 0.72, hemi: 0x4a5580, hemiInt: 0.48, fog: 0.0045, lamp: 1.75, exp: 0.98 },
  { min: 1440, sky: 0x09101d, sun: 0x6488ea, sunInt: 0.58, hemi: 0x3b4d78, hemiInt: 0.42, fog: 0.0046, lamp: 1.85, exp: 0.96 },
];

const COLLIDER_CELL_SIZE = 60;

function lerpAngle(current: number, target: number, alpha: number): number {
  const diff = normalizeAngle(target - current);
  return normalizeAngle(current + diff * alpha);
}

export class GameEngine {
  private container: HTMLElement;
  private callbacks: EngineCallbacks;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private sunLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private rimLight!: THREE.DirectionalLight;
  private nightEmissiveMats: THREE.MeshStandardMaterial[] = [];
  private lastLampIntensity = -1;
  private isSoftwareGl = false;

  private frameId = 0;
  private lastTime = 0;
  private hudAccum = 0;
  private saveAccum = 0;
  private lastNpcSpeechAt = 0;
  private disposed = false;

  private mode: GameMode = 'TITLE';
  private settings: GameSettings = { ...DEFAULT_SETTINGS };

  // World & Spatial Optimization
  private colliders: BuildingCollider[] = [];
  private colliderGrid = new Map<string, BuildingCollider[]>();
  private readonly _visitedColliders = new Set<BuildingCollider>();
  private disabledColliders = new Set<BuildingCollider>();
  private circleColliders: CircleCollider[] = [];
  private gunShopPos = new THREE.Vector3(30, 0, -14);
  private hospitalPos = new THREE.Vector3(-30, 0, 14);
  private bankPos = new THREE.Vector3(-30, 0, -74);
  private licenseOfficePos = new THREE.Vector3(-90, 0, 46);
  private courtExitPos = new THREE.Vector3(-90, 0, 108);
  private mafiaYardPos = new THREE.Vector3(150, 0, -150);
  private roadCenters: number[] = [-300, -240, -180, -120, -60, 0, 60, 120, 180, 240, 300];
  private shopDisplays: ShopDisplayGun[] = [];
  private shopDealer: ShopDealerInfo | null = null;
  private bankClerk: ShopDealerInfo | null = null;
  private licenseOfficer: ShopDealerInfo | null = null;
  private chaiStalls: ChaiStallInfo[] = [];
  private sacredPlaces: SacredLandmarkInfo[] = [];
  private atms: AtmInfo[] = [];
  private sacredBlessCooldown = 0;
  private trafficSignals: TrafficSignalRig[] = [];
  private signalStateCache = new Map<string, { ns: string; ew: string }>();
  private interiorLightSpots: InteriorLightSpot[] = [];
  private interiorLight!: THREE.PointLight;
  private jailRig: CentralJailRig | null = null;
  private courtRig: CourtComplexRig | null = null;
  private homeRig: IndianFamilyHouseRig | null = null;
  private buildingSigns: BuildingSignInfo[] = [];
  private courtroomStage: CourtroomStageRig | null = null;
  private prisonerVan: VehicleRig | null = null;
  private custodyCutscene: {
    phase: CustodyPhase;
    timer: number;
    duration: number;
    stepIndex: number;
    title: string;
    subtitle: string;
    stepLabel: string;
    startX: number;
    startZ: number;
    endX: number;
    endZ: number;
  } | null = null;
  private pendingLicenseRevocation = 0;
  private licenseRevokedPrompt: LicenseRevokedPromptHud | null = null;
  private thanaPrisonerActiveCount = 0;
  private thanaPrisonerShuffleTimer = 42;
  private thanaChatterCooldown = 3.2;
  private thanaAmbientBubbleTimer = 4.5;
  private courtAmbientBubbleTimer = 5.5;
  private signalTime = 0;
  private redLightViolations = 0;
  private challanCooldown = 0;
  private trafficFineStrikes = 0;
  private signalJumpCooldowns = new Map<string, number>();
  private shopInteractMeshes: THREE.Mesh[] = [];

  // Arms License, Driving License, Helmet, Witness Phone Alerts & 5-Star Escalation
  private hasGunLicense = false;
  private hasDrivingLicense = false;
  private hasHelmet = false;
  private helmetOn = false;
  private licenseGraceTimer = 0;
  private brandishExposeTimer = 0;
  private civilianKillsInSpree = 0;
  private policeKilledCount = 0;
  private swatKilledCount = 0;
  private commandoKilledCount = 0;
  private policeVehiclesDestroyed = 0;
  private crimeUnlicensedWeapon = false;
  private crimeTrafficViolations = 0;
  private crimeRecklessDriving = false;
  private crimeVehicleTheftCount = 0;
  private crimeStolePoliceCar = false;
  private crimeCivilianAssaults = 0;
  private enforcementSpawnCooldown = 0;
  private activeWitness: {
    npcId: number;
    npcName: string;
    reason: 'brandishing' | 'gunfire' | 'assault' | 'murder' | 'vehicle_theft';
    remaining: number;
    duration: number;
    beepAccum: number;
  } | null = null;
  private policeInspection: {
    officerId: number;
    officerName: string;
    phase: 'APPROACHING' | 'ASKING';
    timer: number;
    reason: 'brandishing' | 'gunfire';
  } | null = null;
  private chopper: {
    rig: HelicopterRig;
    x: number;
    y: number;
    z: number;
    angle: number;
    fireCooldown: number;
  } | null = null;
  private roadblocks: THREE.Group[] = [];

  // Day-Noon-Midnight Time Cycle & Localized Sacred Schedule
  private gameMinutes = 480; // 08:00 AM Morning
  private dayCount = 1;
  private probationDaysLeft = 0;
  private readonly timeSpeedMinPerSec = 16; // 90s full 24h cycle
  private lastAartiSlot = -1;
  private lastAzaanSlot = -1;
  private sleepCutscene: {
    location: SleepCutsceneLocation;
    returnMode: 'PLAYING' | 'JAIL';
    timer: number;
    duration: number;
    startMinutes: number;
    targetMinutes: number;
    daySettled: boolean;
    interestGain: number;
    remainingAfterWake: number;
    title: string;
    subtitle: string;
  } | null = null;

  // Fictional Banking & Pro-Rated Daily Interest Economy
  private savingsPrincipal = 0;
  private savingsInterest = 0;
  private fdPrincipal = 0;
  private fdInterest = 0;
  private fdOpenedDay: number | null = null;
  private totalInterestEarned = 0;
  private lastCompoundDay = 480 / 1440;
  private passbook: PassbookEntry[] = [];
  private nextPassbookId = 1;

  // Map GPS Waypoint & 3D Beacon
  private waypoint: { x: number; z: number; label: string } | null = null;
  private waypointBeacon: WaypointBeaconRig | null = null;

  // Darshan / Prayer Animation & Blessed Buff
  private blessedTimer = 0;
  private readonly blessedTotalSec = 45;
  private prayerAnim: {
    kind: 'ram_mandir' | 'krishna_mandir' | 'mosque';
    placeName: string;
    title: string;
    subtitle: string;
    remaining: number;
    duration: number;
  } | null = null;

  // Personal Indian Family House, Custom Nameplate & Wardrobe
  private hasSavedGame = false;
  private houseName: string | null = null;
  private playerOutfit: PlayerOutfitId = 'default';
  private wardrobeWeapons: Set<WeaponId> = new Set();
  private wardrobeArmor = 0;
  private wardrobeMedkits = 0;
  private pujaCooldown = 0;

  // Player state (yaw = 0 faces North -Z)
  private playerRig!: HumanoidRig;
  private playerX = 30;
  private playerY = 0;
  private playerVy = 0;
  private playerZ = 110.6;
  private playerYaw = 0;
  private camYaw = 0;
  private camPitch = 0.34;
  private cameraMode: CameraViewMode = 'third_far';
  private firstPerson = false;
  private adsActive = false;
  private currentFov = 62;
  private targetInCrosshair = false;
  private fpWeaponGroup: THREE.Group | null = null;
  private vehicleSteerVisual = 0;
  private vehicleHeadlightsOn = true;
  private vehicleFuelMap = new Map<number, number>();
  private chopperAscendTouch = false;
  private chopperDescendTouch = false;
  private playerHp = 100;
  private playerMaxHp = 100;
  private playerArmor = 0;
  private playerStamina = 100;
  private playerMaxStamina = 100;
  private staminaExhausted = false;
  private playerMedkits = 0;
  private playerCash = STARTING_CASH_INR;
  private wantedLevel = 0;
  private wantedDecayTimer = 0;
  private noPoliceCheat = false;
  private kills = 0;
  private wastedReason = '';
  private wastedLock = false;
  private bustedLock = false;
  private bustedReason = '';
  private bustedConfiscated: string[] = [];
  private playerShotAtPolice = false;
  private surrenderHolding = false;
  private surrenderHoldTimer = 0;
  private corneredArrestTimer = 0;

  // Player combat & animation
  private ownedWeapons: Set<WeaponId> = new Set(['fists']);
  private activeWeapon: WeaponId = 'fists';
  private ammo: Record<WeaponId, number> = {
    fists: 0,
    pistol: 0,
    smg: 0,
    shotgun: 0,
    rifle: 0,
  };
  private weaponMesh: THREE.Group | null = null;
  private fireCooldown = 0;
  private punchAnimTimer = 0;
  private walkPhase = 0;
  private playerSpeed = 0;
  private currentVehicle: VehicleEntity | null = null;
  private weaponWheelOpen = false;

  // Mission & Street Dogs State
  private missionPhase: MissionPhase = 'NONE';
  private missionTimer = 0;
  private missionEnemiesTotal = 5;
  private missionPoliceCarId: number | null = null;
  private rescueVan: RescueVanRig | null = null;
  private rescueVanPos = new THREE.Vector3(150, 0, -156);
  private cutsceneTime = 0;
  private cutsceneDuration = 7.8;
  private cutsceneBarkStep = 0;
  private heldDogRig: DogRig | null = null;
  private dogsRescuedUnlocked = false;

  // Social Hindi NPC dialogue & subtitles
  private globalGreetCooldown = 0;
  private npcSubtitle: { speaker: string; text: string; ttl: number } | null = null;
  private activeChaiPrompt: {
    npcId: number;
    npcName: string;
    line: string;
    micListening: boolean;
    micStatus: string | null;
    ttl: number;
  } | null = null;
  private speechRecognition: { abort?: () => void; stop?: () => void } | null = null;
  private micState: {
    active: boolean;
    mode: 'chai' | 'command' | null;
    status: string | null;
    transcript: string | null;
    timer: number;
  } = { active: false, mode: null, status: null, transcript: null, timer: 0 };
  private micClearStatusTimer = 0;
  private pointerLocked = false;
  private pointerLockBlocked = false;
  private pointerLockProbeId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // Entities
  private nextEntityId = 1;
  private npcs: NpcEntity[] = [];
  private streetDogs: DogEntity[] = [];
  private cutsceneDogs: DogEntity[] = [];
  private vehicles: VehicleEntity[] = [];
  private pickups: CashPickup[] = [];
  private traces: BulletTrace[] = [];
  private explosions: ExplosionEffect[] = [];
  private smokePuffs: SmokePuffEffect[] = [];

  // Input state
  private keys = new Set<string>();
  private mouseDownLeft = false;
  private mouseDragging = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private hasMousePos = false;
  private touchMoveX = 0;
  private touchMoveY = 0;
  private touchSprint = false;
  private touchAttackHeld = false;

  // Courtroom & Central Jail Interactive State
  private courtroomState: CourtroomState | null = null;
  private courtDialogueTimer = 0;
  private courtGavelTimer = 0;
  private jailState: {
    starsAtArrest: number;
    sentenceDaysTotal: number;
    remainingDays: number;
    wardenBribeCost: number;
    workCount: number;
    activeTaskKind: 'NONE' | 'WORK' | 'ESCAPE';
    taskTimer: number;
    taskDuration: number;
    taskStartX: number;
    taskStartZ: number;
    spottedByGuard: boolean;
    statusBanner: string | null;
    spotCooldown: number;
    lastSchedulePhase: JailSchedulePhase;
    workShiftDoneToday: boolean;
    workSkipWarnTimer: number;
    distractionTimer: number;
    distractionCooldown: number;
    toiletCooldown: number;
    nearInmateDialogue: { name: string; text: string } | null;
    nearStation: 'BUNK' | 'TOILET' | 'WORKSHOP' | 'WARDEN' | 'ESCAPE_GATE' | 'INMATE_ALLY' | 'INMATE_RIVAL' | null;
  } | null = null;
  private jailEscrowedWeapons: WeaponId[] = [];
  private jailEscrowedAmmo: Partial<Record<WeaponId, number>> = {};

  // Reusable math helpers (zero GC in render loop)
  private readonly _proj = new THREE.Vector3();
  private readonly _camTarget = new THREE.Vector3();
  private readonly _camDesired = new THREE.Vector3();
  private readonly _raycaster = new THREE.Raycaster();
  private readonly _ndc = new THREE.Vector2();
  private readonly _tmpColorA = new THREE.Color();
  private readonly _tmpColorB = new THREE.Color();

  constructor(container: HTMLElement, callbacks: EngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.loadSavedGameState();
    this.initRendererAndScene();
    this.populateWorld();
    this.bindEvents();
    this.lastTime = performance.now();
    this.loop();
    this.emitHudSnapshot();
  }

  private loadSavedGameState(): void {
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      if (!raw) return;
      this.hasSavedGame = true;
      const saved = JSON.parse(raw) as Partial<SavedGameState>;
      if (typeof saved.houseName === 'string' && saved.houseName.trim().length > 0) {
        this.houseName = saved.houseName.trim().slice(0, 28);
      }
      if (saved.playerOutfit && saved.playerOutfit in PLAYER_OUTFITS) {
        this.playerOutfit = saved.playerOutfit;
      }
      if (Array.isArray(saved.wardrobeWeapons)) {
        const validW = saved.wardrobeWeapons.filter((w): w is WeaponId => w !== 'fists' && WEAPON_ORDER.includes(w));
        this.wardrobeWeapons = new Set(validW);
      }
      if (typeof saved.wardrobeArmor === 'number' && Number.isFinite(saved.wardrobeArmor)) {
        this.wardrobeArmor = clamp(Math.floor(saved.wardrobeArmor), 0, 100);
      }
      if (typeof saved.wardrobeMedkits === 'number' && Number.isFinite(saved.wardrobeMedkits)) {
        this.wardrobeMedkits = clamp(Math.floor(saved.wardrobeMedkits), 0, MAX_MEDKITS);
      }
      if (typeof saved.cash === 'number' && Number.isFinite(saved.cash)) {
        // Migrate legacy USD save balances (~85 INR per USD) while allowing negative debt
        this.playerCash =
          saved.currencyVersion === CURRENCY_VERSION
            ? Math.floor(saved.cash)
            : Math.floor(saved.cash * 85);
      }
      if (typeof saved.kills === 'number' && Number.isFinite(saved.kills)) {
        this.kills = Math.max(0, Math.floor(saved.kills));
      }
      if (typeof saved.hp === 'number' && Number.isFinite(saved.hp)) {
        this.playerHp = saved.hp > 0 ? clamp(saved.hp, 1, this.playerMaxHp) : this.playerMaxHp;
      }
      if (typeof saved.armor === 'number' && Number.isFinite(saved.armor)) {
        this.playerArmor = clamp(saved.armor, 0, 100);
      }
      if (typeof saved.medkits === 'number' && Number.isFinite(saved.medkits)) {
        this.playerMedkits = clamp(Math.floor(saved.medkits), 0, MAX_MEDKITS);
      }
      if (typeof saved.dogsRescuedUnlocked === 'boolean') {
        this.dogsRescuedUnlocked = saved.dogsRescuedUnlocked;
      }
      if (typeof saved.hasGunLicense === 'boolean') {
        this.hasGunLicense = saved.hasGunLicense;
      }
      if (typeof saved.hasDrivingLicense === 'boolean') {
        this.hasDrivingLicense = saved.hasDrivingLicense;
      }
      if (typeof saved.hasHelmet === 'boolean') {
        this.hasHelmet = saved.hasHelmet;
      }
      if (typeof saved.helmetOn === 'boolean') {
        this.helmetOn = saved.helmetOn && this.hasHelmet;
      }
      if (Array.isArray(saved.ownedWeapons)) {
        const valid = saved.ownedWeapons.filter((w): w is WeaponId => WEAPON_ORDER.includes(w));
        this.ownedWeapons = new Set(['fists', ...valid]);
      }
      if (saved.activeWeapon && this.ownedWeapons.has(saved.activeWeapon)) {
        this.activeWeapon = saved.activeWeapon;
      }
      if (saved.ammo && typeof saved.ammo === 'object') {
        for (const wid of WEAPON_ORDER) {
          const val = saved.ammo[wid];
          if (typeof val === 'number' && Number.isFinite(val)) {
            this.ammo[wid] = Math.max(0, Math.floor(val));
          }
        }
      }
      if (typeof saved.playerX === 'number' && Number.isFinite(saved.playerX) && typeof saved.playerZ === 'number' && Number.isFinite(saved.playerZ)) {
        this.playerX = clamp(saved.playerX, -WORLD_LIMIT, WORLD_LIMIT);
        this.playerZ = clamp(saved.playerZ, -WORLD_LIMIT, WORLD_LIMIT);
      }
      if (typeof saved.playerYaw === 'number' && Number.isFinite(saved.playerYaw)) {
        this.playerYaw = saved.playerYaw;
        this.camYaw = saved.playerYaw;
      }
      if (typeof saved.gameMinutes === 'number' && Number.isFinite(saved.gameMinutes)) {
        this.gameMinutes = ((saved.gameMinutes % 1440) + 1440) % 1440;
      }
      if (typeof saved.dayCount === 'number' && Number.isFinite(saved.dayCount)) {
        this.dayCount = Math.max(1, Math.floor(saved.dayCount));
      }
      if (typeof saved.probationDaysLeft === 'number' && Number.isFinite(saved.probationDaysLeft)) {
        this.probationDaysLeft = Math.max(0, Math.floor(saved.probationDaysLeft));
      }
      if (typeof saved.pendingLicenseRevocation === 'number' && Number.isFinite(saved.pendingLicenseRevocation)) {
        this.pendingLicenseRevocation = Math.max(0, Math.floor(saved.pendingLicenseRevocation));
      }
      if (saved.licenseRevokedPrompt && saved.licenseRevokedPrompt.active) {
        this.licenseRevokedPrompt = {
          active: true,
          starsAtArrest: Math.max(3, Math.floor(saved.licenseRevokedPrompt.starsAtArrest || 3)),
          urgentFee: URGENT_THANA_LICENSE_RENEWAL_INR,
          standardFee: GUN_LICENSE_FEE_INR,
        };
      }
      if (Array.isArray(saved.jailEscrowedWeapons)) {
        this.jailEscrowedWeapons = saved.jailEscrowedWeapons.filter(
          (w): w is WeaponId => w !== 'fists' && WEAPON_ORDER.includes(w),
        );
      }
      if (saved.jailEscrowedAmmo && typeof saved.jailEscrowedAmmo === 'object') {
        const restoredAmmo: Partial<Record<WeaponId, number>> = {};
        for (const wid of WEAPON_ORDER) {
          if (wid === 'fists') continue;
          const v = saved.jailEscrowedAmmo[wid];
          if (typeof v === 'number' && Number.isFinite(v)) {
            restoredAmmo[wid] = Math.max(0, Math.floor(v));
          }
        }
        this.jailEscrowedAmmo = restoredAmmo;
      }
      if (saved.jailSentence && typeof saved.jailSentence.remainingDays === 'number' && saved.jailSentence.remainingDays > 0) {
        const js = saved.jailSentence;
        const phase = this.getJailSchedulePhase(this.gameMinutes);
        const meta = this.getJailScheduleMeta(phase);
        this.pendingLicenseRevocation = Math.max(
          this.pendingLicenseRevocation,
          Math.max(0, Math.floor(js.pendingLicenseRevocation || 0)),
        );
        const stars = Math.max(1, Math.min(5, Math.floor(js.starsAtArrest || 2)));
        const sentenceDaysTotal = Math.max(1, Math.floor(js.sentenceDaysTotal || 2));
        this.jailState = {
          starsAtArrest: stars,
          sentenceDaysTotal,
          remainingDays: Math.max(0.1, Number(js.remainingDays)),
          wardenBribeCost:
            typeof js.wardenBribeCost === 'number' && Number.isFinite(js.wardenBribeCost)
              ? Math.max(1000, Math.floor(js.wardenBribeCost))
              : stars >= 4
                ? JAIL_WARDEN_BRIBE_HIGH_INR
                : JAIL_WARDEN_BRIBE_LOW_INR,
          workCount: Math.max(0, Math.floor(js.workCount || 0)),
          activeTaskKind: 'NONE',
          taskTimer: 0,
          taskDuration: 1,
          taskStartX: this.playerX,
          taskStartZ: this.playerZ,
          spottedByGuard: false,
          nearStation: null,
          statusBanner: `Saza Jaari: ${Number(js.remainingDays).toFixed(1)} Din · ${meta.title}`,
          spotCooldown: 0,
          lastSchedulePhase: phase,
          workShiftDoneToday: Boolean(js.workShiftDoneToday),
          workSkipWarnTimer: 0,
          distractionTimer: 0,
          distractionCooldown: 0,
          toiletCooldown: 0,
          nearInmateDialogue: null,
        };
      }
      if (saved.bank && typeof saved.bank === 'object') {
        if (typeof saved.bank.savingsPrincipal === 'number' && Number.isFinite(saved.bank.savingsPrincipal)) {
          this.savingsPrincipal = Math.max(0, saved.bank.savingsPrincipal);
        }
        if (typeof saved.bank.savingsInterest === 'number' && Number.isFinite(saved.bank.savingsInterest)) {
          this.savingsInterest = Math.max(0, saved.bank.savingsInterest);
        }
        if (typeof saved.bank.fdPrincipal === 'number' && Number.isFinite(saved.bank.fdPrincipal)) {
          this.fdPrincipal = Math.max(0, saved.bank.fdPrincipal);
        }
        if (typeof saved.bank.fdInterest === 'number' && Number.isFinite(saved.bank.fdInterest)) {
          this.fdInterest = Math.max(0, saved.bank.fdInterest);
        }
        if (typeof saved.bank.fdOpenedDay === 'number' || saved.bank.fdOpenedDay === null) {
          this.fdOpenedDay = saved.bank.fdOpenedDay ?? null;
        }
        if (typeof saved.bank.totalInterestEarned === 'number' && Number.isFinite(saved.bank.totalInterestEarned)) {
          this.totalInterestEarned = Math.max(0, saved.bank.totalInterestEarned);
        }
        if (typeof saved.bank.lastCompoundDay === 'number' && Number.isFinite(saved.bank.lastCompoundDay)) {
          this.lastCompoundDay = Math.max(0, saved.bank.lastCompoundDay);
        } else {
          this.lastCompoundDay = this.getTotalGameDays();
        }
        if (Array.isArray(saved.bank.passbook)) {
          this.passbook = saved.bank.passbook.slice(0, 50);
          const maxPid = this.passbook.reduce((acc, e) => Math.max(acc, e.id || 0), 0);
          this.nextPassbookId = maxPid + 1;
        }
      } else {
        this.lastCompoundDay = this.getTotalGameDays();
      }
    } catch {
      // ignore corrupted save
    }
  }

  private saveGameState(): void {
    try {
      const payload: SavedGameState = {
        currencyVersion: CURRENCY_VERSION,
        cash: this.playerCash,
        kills: this.kills,
        hp: Math.ceil(this.playerHp),
        armor: Math.ceil(this.playerArmor),
        medkits: this.playerMedkits,
        ownedWeapons: Array.from(this.ownedWeapons),
        activeWeapon: this.activeWeapon,
        ammo: { ...this.ammo },
        playerX: Math.round(this.playerX * 100) / 100,
        playerZ: Math.round(this.playerZ * 100) / 100,
        playerYaw: Math.round(this.playerYaw * 1000) / 1000,
        dogsRescuedUnlocked: this.dogsRescuedUnlocked,
        hasGunLicense: this.hasGunLicense,
        hasDrivingLicense: this.hasDrivingLicense,
        hasHelmet: this.hasHelmet,
        helmetOn: this.helmetOn,
        houseName: this.houseName ?? undefined,
        playerOutfit: this.playerOutfit,
        wardrobeWeapons: Array.from(this.wardrobeWeapons),
        wardrobeArmor: this.wardrobeArmor,
        wardrobeMedkits: this.wardrobeMedkits,
        gameMinutes: Math.round(this.gameMinutes),
        dayCount: this.dayCount,
        probationDaysLeft: this.probationDaysLeft,
        pendingLicenseRevocation: this.pendingLicenseRevocation,
        licenseRevokedPrompt: this.licenseRevokedPrompt ? { ...this.licenseRevokedPrompt } : null,
        jailEscrowedWeapons: [...this.jailEscrowedWeapons],
        jailEscrowedAmmo: { ...this.jailEscrowedAmmo },
        jailSentence: this.jailState
          ? {
              starsAtArrest: this.jailState.starsAtArrest,
              sentenceDaysTotal: this.jailState.sentenceDaysTotal,
              remainingDays: this.jailState.remainingDays,
              wardenBribeCost: this.jailState.wardenBribeCost,
              workCount: this.jailState.workCount,
              workShiftDoneToday: this.jailState.workShiftDoneToday,
              pendingLicenseRevocation: this.pendingLicenseRevocation,
            }
          : null,
        bank: {
          savingsPrincipal: this.savingsPrincipal,
          savingsInterest: this.savingsInterest,
          fdPrincipal: this.fdPrincipal,
          fdInterest: this.fdInterest,
          fdOpenedDay: this.fdOpenedDay,
          totalInterestEarned: this.totalInterestEarned,
          lastCompoundDay: this.lastCompoundDay,
          passbook: this.passbook.slice(0, 50),
        },
      };
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore quota/private mode errors
    }
  }

  private detectSoftwareGl(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const probe = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!probe) return true;
      const ext = probe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
      const gpu = String(probe.getParameter(param));
      probe.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      return true;
    }
  }

  private initRendererAndScene(): void {
    this.isSoftwareGl = this.detectSoftwareGl();

    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1;
    const maxDpr = isMobile ? 1.25 : 1.5;
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: !this.isSoftwareGl && !isMobile,
        powerPreference: 'high-performance',
      });
    } catch {
      this.renderer = new THREE.WebGLRenderer({ antialias: false });
    }
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, maxDpr));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl && this.settings.shadowsEnabled;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.setSize(this.container.clientWidth || window.innerWidth, this.container.clientHeight || window.innerHeight);

    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.touchAction = 'none';
    this.container.appendChild(this.renderer.domElement);

    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
    });

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x161f2e);
    this.scene.fog = new THREE.FogExp2(0x161f2e, 0.0048);

    // Studio Environment Reflection (guarded for low-feature WebGL contexts)
    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch {
      // Continue safely without PMREM reflections
    }

    const aspect = (this.container.clientWidth || window.innerWidth) / Math.max(1, this.container.clientHeight || window.innerHeight);
    this.camera = new THREE.PerspectiveCamera(62, aspect, 0.12, 420);
    this.scene.add(this.camera);

    // Warm/Cool 3-point outdoor Day-Noon-Midnight lighting rig
    this.hemiLight = new THREE.HemisphereLight(0x9ec5ff, 0x3b352f, 0.72);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xffe6bd, 1.85);
    this.sunLight.position.set(55, 90, 45);
    this.sunLight.castShadow = !this.isSoftwareGl && this.settings.shadowsEnabled;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 220;
    const d = 65;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.normalBias = 0.02;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    this.rimLight = new THREE.DirectionalLight(0x60a5fa, 0.45);
    this.rimLight.position.set(-60, 40, -60);
    this.scene.add(this.rimLight);

    // Single pooled dynamic PointLight for interiors & Courtroom stage
    this.interiorLight = new THREE.PointLight(0xffedd5, 0, 28, 1.4);
    this.scene.add(this.interiorLight);

    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    const env = buildCityEnvironment(this.scene, maxAniso);
    this.colliders = env.colliders;
    this.buildColliderGrid();
    this.circleColliders = env.circleColliders;
    this.gunShopPos = env.gunShopPos;
    this.hospitalPos = env.hospitalPos;
    this.bankPos = env.bankPos;
    this.licenseOfficePos = env.licenseOfficePos;
    this.courtExitPos = env.courtExitPos;
    this.mafiaYardPos = env.mafiaYardPos;
    this.roadCenters = env.roadCenters;
    this.shopDisplays = env.shopDisplays;
    this.shopDealer = env.shopDealer;
    this.bankClerk = env.bankClerk;
    this.licenseOfficer = env.licenseOfficer;
    this.chaiStalls = env.chaiStalls;
    this.sacredPlaces = env.sacredPlaces;
    this.atms = env.atms;
    this.trafficSignals = env.trafficSignals;
    this.nightEmissiveMats = env.nightEmissiveMats;
    this.interiorLightSpots = env.interiorLightSpots;
    this.jailRig = env.jailRig;
    if (this.jailRig) {
      this.disabledColliders.add(this.jailRig.cellGateCollider);
    }
    this.courtRig = env.courtRig;
    this.homeRig = env.homeRig;
    this.buildingSigns = env.buildingSigns;
    if (this.homeRig) {
      this.homeRig.updateNameplate(this.houseName ?? 'Apna Ghar');
    }
    if (this.houseName) {
      const homeSign = this.buildingSigns.find((s) => s.id === 'sign-home');
      if (homeSign) homeSign.title = this.houseName;
    }
    this.courtroomStage = createDistrictCourtroomStage(this.scene);
    this.randomizeThanaPrisoners(true);
    this.shopInteractMeshes = [
      ...this.shopDisplays.map((d) => d.hitMesh),
      ...(this.shopDealer ? [this.shopDealer.hitMesh] : []),
      ...(this.bankClerk ? [this.bankClerk.hitMesh] : []),
      ...(this.licenseOfficer ? [this.licenseOfficer.hitMesh] : []),
      ...this.chaiStalls.map((s) => s.hitMesh).filter((m): m is THREE.Mesh => Boolean(m)),
      ...this.atms.map((a) => a.hitMesh),
    ];

    this.waypointBeacon = createWaypointBeacon();
    this.scene.add(this.waypointBeacon.root);
    this.applyTimeOfDayLighting();
  }

  private buildColliderGrid(): void {
    this.colliderGrid.clear();
    for (const c of this.colliders) {
      const gx0 = Math.floor(c.minX / COLLIDER_CELL_SIZE);
      const gx1 = Math.floor(c.maxX / COLLIDER_CELL_SIZE);
      const gz0 = Math.floor(c.minZ / COLLIDER_CELL_SIZE);
      const gz1 = Math.floor(c.maxZ / COLLIDER_CELL_SIZE);
      for (let gx = gx0; gx <= gx1; gx++) {
        for (let gz = gz0; gz <= gz1; gz++) {
          const key = `${gx},${gz}`;
          let bucket = this.colliderGrid.get(key);
          if (!bucket) {
            bucket = [];
            this.colliderGrid.set(key, bucket);
          }
          bucket.push(c);
        }
      }
    }
  }

  private populateWorld(): void {
    // Player character (olive tactical jacket, dark jeans, sunglasses facing -Z)
    this.playerRig = createHumanoidModel({
      shirtColor: 0x2f4f3e,
      pantsColor: 0x1e293b,
      skinColor: 0xc68b67,
      isPlayer: true,
    });
    this.applyPlayerOutfit(this.playerOutfit);
    if (this.jailState && this.jailRig) {
      const phase = this.getJailSchedulePhase(this.gameMinutes);
      this.disabledColliders.delete(this.jailRig.mainGateCollider);
      this.disabledColliders.delete(this.jailRig.northGateCollider);
      this.disabledColliders.delete(this.jailRig.eastGateCollider);
      if (phase === 'NIGHT_LOCKUP') {
        this.disabledColliders.delete(this.jailRig.cellGateCollider);
        this.jailRig.cellGateDoor.position.z = 150 - 7.5;
        this.playerX = this.jailRig.cellInsidePos.x;
        this.playerY = 0.24;
        this.playerZ = this.jailRig.cellInsidePos.z;
      } else {
        this.disabledColliders.add(this.jailRig.cellGateCollider);
        this.jailRig.cellGateDoor.position.z = 150 - 7.5 - 3.0;
        this.playerX = this.jailRig.yardCenter.x;
        this.playerY = 0.24;
        this.playerZ = this.jailRig.yardCenter.z;
      }
      this.ownedWeapons = new Set(['fists']);
      this.activeWeapon = 'fists';
    } else if (!this.hasSavedGame && this.homeRig) {
      this.playerX = this.homeRig.spawnPos.x;
      this.playerY = 0;
      this.playerZ = this.homeRig.spawnPos.z;
      this.playerYaw = 0;
      this.camYaw = 0;
    }
    this.playerRig.helmetMesh.visible = !this.jailState && this.hasHelmet && this.helmetOn;
    this.playerRig.root.position.set(this.playerX, this.playerY, this.playerZ);
    this.playerRig.root.rotation.y = this.playerYaw;
    this.scene.add(this.playerRig.root);
    this.refreshPlayerWeaponMesh();

    // Spawn dedicated Hindu Pandits, Temple Devotees, Mosque Imam & Mosque Visitors below, and dynamic NPCs via rebalanceAmbientPopulation()

    // Spawn dedicated Hindu Pandits, Temple Devotees, Mosque Imam & Mosque Visitors
    this.spawnSacredAndLandmarkNpcs();

    // Spawn 3 iconic Indian Auto-Rickshaws: starter parked cleanly inside Auto Stand bay (7.5, 14.0) off intersection + 2 in left-hand lanes
    const parkedYaw = 0;
    const parkedRig = createVehicleModel('rickshaw');
    parkedRig.root.position.set(7.5, 0, 14.0);
    parkedRig.root.rotation.y = parkedYaw;
    this.scene.add(parkedRig.root);
    this.vehicles.push({
      id: this.nextEntityId++,
      name: 'Auto-Rickshaw',
      kind: 'rickshaw',
      rig: parkedRig,
      x: 7.5,
      z: 14.0,
      yaw: parkedYaw,
      speed: 0,
      maxSpeed: 18,
      massFactor: 0.85,
      hp: 115,
      maxHp: 115,
      destroyed: false,
      smokeTimer: 0,
      wreckTimer: 0,
      hitCooldowns: new Map(),
      occupiedByPlayer: false,
      aiEnabled: false,
      aiDisabled: false,
      isStarterParked: true,
      origX: 7.5,
      origZ: 14.0,
      origYaw: parkedYaw,
      origSpeed: 0,
      origWasStarter: true,
      origAxis: 'z',
      origDir: -1,
      origRoadCenter: 0,
      policeState: 'PATROL',
      maxOfficers: 1,
      spawnedOfficerIds: [],
      dismountCooldown: 0,
      stopCooldown: 0,
      patrolAxis: 'z',
      patrolDir: -1,
      patrolRoadCenter: 0,
    });

    // Spawn 2 parked Starter Indian Motorcycles + 3 Roaming Street Motorcycles
    const parkedBikes = [
      { x: -7.2, z: 13.5, yaw: 0, color: 0xb91c1c, name: 'Bharat Chetak 100' },
      { x: -84.0, z: 48.0, yaw: Math.PI / 2, color: 0x1d4ed8, name: 'Toofan 180 Moto' },
    ];
    for (const pb of parkedBikes) {
      const rig = createVehicleModel('bike', pb.color);
      if (rig.riderRig) rig.riderRig.root.visible = false;
      rig.root.position.set(pb.x, 0, pb.z);
      rig.root.rotation.y = pb.yaw;
      this.scene.add(rig.root);
      this.vehicles.push({
        id: this.nextEntityId++,
        name: pb.name,
        kind: 'bike',
        rig,
        x: pb.x,
        z: pb.z,
        yaw: pb.yaw,
        speed: 0,
        maxSpeed: 28,
        massFactor: 0.58,
        hp: 95,
        maxHp: 95,
        destroyed: false,
        smokeTimer: 0,
        wreckTimer: 0,
        hitCooldowns: new Map(),
        occupiedByPlayer: false,
        aiEnabled: false,
        aiDisabled: false,
        hasAiRider: false,
        isStarterParked: true,
        origX: pb.x,
        origZ: pb.z,
        origYaw: pb.yaw,
        origSpeed: 0,
        origWasStarter: true,
        origColor: pb.color,
        origAxis: 'z',
        origDir: -1,
        origRoadCenter: 0,
        policeState: 'PATROL',
        maxOfficers: 1,
        spawnedOfficerIds: [],
        dismountCooldown: 0,
        stopCooldown: 0,
        patrolAxis: 'z',
        patrolDir: -1,
        patrolRoadCenter: 0,
      });
    }

    const roamingBikes: { rc: number; along: number; axis: 'x' | 'z'; dir: 1 | -1; color: number }[] = [
      { rc: 0, along: 34, axis: 'x', dir: 1, color: 0x0f172a },
      { rc: 60, along: -24, axis: 'z', dir: -1, color: 0xb45309 },
      { rc: -120, along: 22, axis: 'x', dir: -1, color: 0x991b1b },
    ];
    roamingBikes.forEach((rb) => {
      const rig = createVehicleModel('bike', rb.color);
      if (rig.riderRig) {
        rig.riderRig.root.visible = true;
        rig.riderRig.helmetMesh.visible = true;
      }
      const laneCoord = getLeftHandLaneCoord(rb.rc, rb.axis, rb.dir);
      const vx = rb.axis === 'z' ? laneCoord : rb.along;
      const vz = rb.axis === 'z' ? rb.along : laneCoord;
      const yaw = rb.axis === 'z' ? (rb.dir === 1 ? Math.PI : 0) : rb.dir === 1 ? -Math.PI / 2 : Math.PI / 2;
      rig.root.position.set(vx, 0, vz);
      rig.root.rotation.y = yaw;
      this.scene.add(rig.root);
      this.vehicles.push({
        id: this.nextEntityId++,
        name: 'Indian Street Bike',
        kind: 'bike',
        rig,
        x: vx,
        z: vz,
        yaw,
        speed: 8.2,
        maxSpeed: 28,
        massFactor: 0.58,
        hp: 95,
        maxHp: 95,
        destroyed: false,
        smokeTimer: 0,
        wreckTimer: 0,
        hitCooldowns: new Map(),
        occupiedByPlayer: false,
        aiEnabled: true,
        aiDisabled: false,
        hasAiRider: true,
        origX: vx,
        origZ: vz,
        origYaw: yaw,
        origSpeed: 8.2,
        origWasStarter: false,
        origColor: rb.color,
        origAxis: rb.axis,
        origDir: rb.dir,
        origRoadCenter: rb.rc,
        policeState: 'PATROL',
        maxOfficers: 1,
        spawnedOfficerIds: [],
        dismountCooldown: 0,
        stopCooldown: 0,
        patrolAxis: rb.axis,
        patrolDir: rb.dir,
        patrolRoadCenter: rb.rc,
      });
    });

    const roamingRickshaws = [
      { rc: 0, along: -26, axis: 'z' as const, dir: 1 as const },
      { rc: -60, along: 28, axis: 'x' as const, dir: 1 as const },
      { rc: 120, along: -34, axis: 'x' as const, dir: -1 as const },
    ];
    roamingRickshaws.forEach((rsp) => {
      const rig = createVehicleModel('rickshaw');
      const laneCoord = getLeftHandLaneCoord(rsp.rc, rsp.axis, rsp.dir);
      const vx = rsp.axis === 'z' ? laneCoord : rsp.along;
      const vz = rsp.axis === 'z' ? rsp.along : laneCoord;
      const yaw = rsp.axis === 'z' ? (rsp.dir === 1 ? Math.PI : 0) : rsp.dir === 1 ? -Math.PI / 2 : Math.PI / 2;
      rig.root.position.set(vx, 0, vz);
      rig.root.rotation.y = yaw;
      this.scene.add(rig.root);
      this.vehicles.push({
        id: this.nextEntityId++,
        name: 'Auto-Rickshaw',
        kind: 'rickshaw',
        rig,
        x: vx,
        z: vz,
        yaw,
        speed: 6.5,
        maxSpeed: 18,
        massFactor: 0.85,
        hp: 115,
        maxHp: 115,
        destroyed: false,
        smokeTimer: 0,
        wreckTimer: 0,
        hitCooldowns: new Map(),
        occupiedByPlayer: false,
        aiEnabled: true,
        aiDisabled: false,
        origX: vx,
        origZ: vz,
        origYaw: yaw,
        origSpeed: 6.5,
        origWasStarter: false,
        origAxis: rsp.axis,
        origDir: rsp.dir,
        origRoadCenter: rsp.rc,
        policeState: 'PATROL',
        maxOfficers: 1,
        spawnedOfficerIds: [],
        dismountCooldown: 0,
        stopCooldown: 0,
        patrolAxis: rsp.axis,
        patrolDir: rsp.dir,
        patrolRoadCenter: rsp.rc,
      });
    });

    // Spawn 8 civilian cars across central & outer colony avenues in left-hand lanes
    const carColors = [0x991b1b, 0x1e40af, 0xb45309, 0x334155, 0x065f46, 0x7c2d12, 0xf8fafc, 0x475569];
    const spawnRoads = [
      { rc: -60, along: -24, axis: 'z' as const, dir: 1 as const },
      { rc: 0, along: -42, axis: 'z' as const, dir: -1 as const },
      { rc: 60, along: 26, axis: 'z' as const, dir: 1 as const },
      { rc: 0, along: 24, axis: 'x' as const, dir: 1 as const },
      { rc: 60, along: -28, axis: 'x' as const, dir: -1 as const },
      { rc: -60, along: 36, axis: 'x' as const, dir: 1 as const },
      { rc: -180, along: -30, axis: 'z' as const, dir: 1 as const },
      { rc: 180, along: 28, axis: 'x' as const, dir: -1 as const },
    ];
    spawnRoads.forEach((sp, idx) => {
      const kind = idx % 2 === 0 ? 'muscle' : 'sedan';
      const color = carColors[idx];
      const rig = createVehicleModel(kind, color);
      const laneCoord = getLeftHandLaneCoord(sp.rc, sp.axis, sp.dir);
      const vx = sp.axis === 'z' ? laneCoord : sp.along;
      const vz = sp.axis === 'z' ? sp.along : laneCoord;
      const yaw = sp.axis === 'z' ? (sp.dir === 1 ? Math.PI : 0) : sp.dir === 1 ? -Math.PI / 2 : Math.PI / 2;
      rig.root.position.set(vx, 0, vz);
      rig.root.rotation.y = yaw;
      this.scene.add(rig.root);
      const maxHp = kind === 'muscle' ? 200 : 170;
      this.vehicles.push({
        id: this.nextEntityId++,
        name: kind === 'muscle' ? 'Desi GT Coupe' : 'Premier Sedan',
        kind,
        rig,
        x: vx,
        z: vz,
        yaw,
        speed: 7.2,
        maxSpeed: kind === 'muscle' ? 25 : 20,
        massFactor: kind === 'muscle' ? 1.15 : 1.0,
        hp: maxHp,
        maxHp,
        destroyed: false,
        smokeTimer: 0,
        wreckTimer: 0,
        hitCooldowns: new Map(),
        occupiedByPlayer: false,
        aiEnabled: true,
        aiDisabled: false,
        origX: vx,
        origZ: vz,
        origYaw: yaw,
        origSpeed: 7.2,
        origWasStarter: false,
        origColor: color,
        origAxis: sp.axis,
        origDir: sp.dir,
        origRoadCenter: sp.rc,
        policeState: 'PATROL',
        maxOfficers: 1,
        spawnedOfficerIds: [],
        dismountCooldown: 0,
        stopCooldown: 0,
        patrolAxis: sp.axis,
        patrolDir: sp.dir,
        patrolRoadCenter: sp.rc,
      });
    });

    // 4 White/Blue Police Vajra Patrol SUVs in left-hand lanes (capped at 1 or 2 officers)
    const copSpawns = [
      { rc: 60, along: -18, axis: 'x' as const, dir: 1 as const },
      { rc: -60, along: -36, axis: 'z' as const, dir: 1 as const },
      { rc: 60, along: -40, axis: 'z' as const, dir: -1 as const },
      { rc: -120, along: -28, axis: 'x' as const, dir: -1 as const },
    ];
    copSpawns.forEach((sp, idx) => {
      const rig = createVehicleModel('police');
      const laneCoord = getLeftHandLaneCoord(sp.rc, sp.axis, sp.dir);
      const vx = sp.axis === 'z' ? laneCoord : sp.along;
      const vz = sp.axis === 'z' ? sp.along : laneCoord;
      const yaw = sp.axis === 'z' ? (sp.dir === 1 ? Math.PI : 0) : sp.dir === 1 ? -Math.PI / 2 : Math.PI / 2;
      rig.root.position.set(vx, 0, vz);
      rig.root.rotation.y = yaw;
      this.scene.add(rig.root);
      this.vehicles.push({
        id: this.nextEntityId++,
        name: 'Police Vajra SUV',
        kind: 'police',
        rig,
        x: vx,
        z: vz,
        yaw,
        speed: 7.8,
        maxSpeed: 23,
        massFactor: 1.25,
        hp: 220,
        maxHp: 220,
        destroyed: false,
        smokeTimer: 0,
        wreckTimer: 0,
        hitCooldowns: new Map(),
        occupiedByPlayer: false,
        aiEnabled: true,
        aiDisabled: false,
        origX: vx,
        origZ: vz,
        origYaw: yaw,
        origSpeed: 7.8,
        origWasStarter: false,
        origAxis: sp.axis,
        origDir: sp.dir,
        origRoadCenter: sp.rc,
        policeState: 'PATROL',
        maxOfficers: idx % 2 === 0 ? 2 : 1,
        spawnedOfficerIds: [],
        dismountCooldown: 0,
        stopCooldown: 0,
        patrolAxis: sp.axis,
        patrolDir: sp.dir,
        patrolRoadCenter: sp.rc,
        unitTier: 2,
      });
    });

    // Spawn 4 friendly Indian street dogs right away around the central blocks (10 total after rescue mission)
    this.spawnStreetDogs(this.dogsRescuedUnlocked ? 10 : 4);

    // Station standing Traffic Police at major intersections + 2 walking Beat Policemen
    this.spawnStandingTrafficPolice();

    // Scale civilian NPCs & dynamic AI traffic vehicles to configured density
    this.rebalanceAmbientPopulation();

    if (!this.isSoftwareGl) {
      try {
        this.renderer.compile(this.scene, this.camera);
      } catch {
        // Ignore shader precompile warnings
      }
    }
  }

  private spawnSacredAndLandmarkNpcs(): void {
    const spots: {
      name: string;
      x: number;
      z: number;
      yaw: number;
      variant: 'pandit' | 'temple_visitor' | 'imam' | 'mosque_visitor' | 'default';
      shirt: number;
      pants: number;
      isPandit?: boolean;
      isImam?: boolean;
      landmarkKind: 'ram_mandir' | 'krishna_mandir' | 'mosque';
    }[] = [
      // Shree Ram Mandir (30, 30) — Pandit & Traditional Devotees
      { name: 'Pandit Raghavendra Shastri', x: 25.5, z: 31.0, yaw: -Math.PI / 2, variant: 'pandit', shirt: 0xf97316, pants: 0xfef3c7, isPandit: true, landmarkKind: 'ram_mandir' },
      { name: 'Mohit Bhardwaj', x: 19.0, z: 29.0, yaw: -Math.PI / 2, variant: 'temple_visitor', shirt: 0xfef3c7, pants: 0xf8fafc, landmarkKind: 'ram_mandir' },
      { name: 'Rajesh Sharma', x: 20.5, z: 34.5, yaw: -Math.PI / 3, variant: 'temple_visitor', shirt: 0xfdba74, pants: 0xfef3c7, landmarkKind: 'ram_mandir' },
      { name: 'Ananya Tiwari', x: 23.0, z: 25.0, yaw: -Math.PI / 2, variant: 'temple_visitor', shirt: 0xfde68a, pants: 0xf8fafc, landmarkKind: 'ram_mandir' },
      // Shree Krishna Mandir (90, -30) — Pandit & Traditional Devotees
      { name: 'Pandit Gopalacharya', x: 89.5, z: -23.0, yaw: 0, variant: 'pandit', shirt: 0xfacc15, pants: 0xfef3c7, isPandit: true, landmarkKind: 'krishna_mandir' },
      { name: 'Keshav Agarwal', x: 87.0, z: -18.5, yaw: 0.3, variant: 'temple_visitor', shirt: 0xe0f2fe, pants: 0xf8fafc, landmarkKind: 'krishna_mandir' },
      { name: 'Nandini Kulkarni', x: 92.5, z: -19.0, yaw: -0.3, variant: 'temple_visitor', shirt: 0xfef08a, pants: 0xfef3c7, landmarkKind: 'krishna_mandir' },
      // Noor Masjid (-90, -30) — Imam & Traditional Mosque Visitors
      { name: 'Maulana Tariq Sahab', x: -90.0, z: -22.5, yaw: 0, variant: 'imam', shirt: 0xf8fafc, pants: 0xe2e8f0, isImam: true, landmarkKind: 'mosque' },
      { name: 'Faisal Siddiqui', x: -86.5, z: -18.0, yaw: 0.2, variant: 'mosque_visitor', shirt: 0xf8fafc, pants: 0xf1f5f9, landmarkKind: 'mosque' },
      { name: 'Zaid Qureshi', x: -93.5, z: -18.0, yaw: -0.2, variant: 'mosque_visitor', shirt: 0xecfdf5, pants: 0xf8fafc, landmarkKind: 'mosque' },
      { name: 'Imran Ansari', x: -84.0, z: -21.0, yaw: 0, variant: 'mosque_visitor', shirt: 0xe2e8f0, pants: 0xf1f5f9, landmarkKind: 'mosque' },
    ];

    for (const sp of spots) {
      const rig = createHumanoidModel({
        shirtColor: sp.shirt,
        pantsColor: sp.pants,
        skinColor: 0xc98b63,
        variant: sp.variant,
      });
      const pos = this.resolveCollisions(sp.x, sp.z, 0.45);
      rig.root.position.set(pos.x, 0, pos.z);
      rig.root.rotation.y = sp.yaw;
      this.scene.add(rig.root);

      this.npcs.push({
        id: this.nextEntityId++,
        name: sp.name,
        rig,
        x: pos.x,
        z: pos.z,
        yaw: sp.yaw,
        vx: 0,
        vz: 0,
        hp: 100,
        maxHp: 100,
        knockbackResist: 0.78,
        walkPhase: 0,
        staggerTimer: 0,
        wanderTimer: 4 + Math.random() * 4,
        targetYaw: sp.yaw,
        isEnforcer: false,
        isPolice: false,
        isPandit: sp.isPandit,
        isImam: sp.isImam,
        landmarkKind: sp.landmarkKind,
        homeX: pos.x,
        homeZ: pos.z,
        homeYaw: sp.yaw,
        hostile: false,
        aggressiveOnHit: false,
        fireCooldown: 1.5,
        meleeCooldown: 1.2,
        punchAnimTimer: 0,
        dead: false,
        deathTimer: 0,
        alertedTimer: 0,
        greetCooldown: 1.5 + Math.random() * 2,
        chaiCompanionTarget: null,
      });
    }
  }

  private spawnStandingTrafficPolice(): void {
    this.trafficSignals.forEach((sig, idx) => {
      const alreadyThere = this.npcs.some(
        (n) => !n.dead && n.isTrafficPolice && Math.hypot((n.homeX ?? n.x) - (sig.x + 10.6), (n.homeZ ?? n.z) - (sig.z + 10.6)) < 3,
      );
      if (alreadyThere) return;
      const hx = sig.x + 10.6;
      const hz = sig.z + 10.6;
      const yaw = Math.atan2(-(sig.x - hx), -(sig.z - hz));
      const rig = createHumanoidModel({
        shirtColor: 0xf1f5f9,
        pantsColor: 0x1e293b,
        skinColor: 0xd19a72,
        isPolice: true,
        isTrafficPolice: true,
      });
      const pos = this.resolveCollisions(hx, hz, 0.45);
      rig.root.position.set(pos.x, 0, pos.z);
      rig.root.rotation.y = yaw;
      this.scene.add(rig.root);

      this.npcs.push({
        id: this.nextEntityId++,
        name: pickName(INDIAN_TRAFFIC_COP_NAMES, idx),
        rig,
        x: pos.x,
        z: pos.z,
        yaw,
        vx: 0,
        vz: 0,
        hp: 130,
        maxHp: 130,
        knockbackResist: 0.8,
        walkPhase: 0,
        staggerTimer: 0,
        wanderTimer: 3,
        targetYaw: yaw,
        isEnforcer: false,
        isPolice: true,
        isTrafficPolice: true,
        homeX: pos.x,
        homeZ: pos.z,
        homeYaw: yaw,
        hostile: false,
        aggressiveOnHit: true,
        fireCooldown: 1.4,
        meleeCooldown: 1.0,
        punchAnimTimer: 0,
        dead: false,
        deathTimer: 0,
        alertedTimer: 0,
        greetCooldown: 999,
        chaiCompanionTarget: null,
      });
    });

    // 2 Calm walking Khaki Beat Policemen patrolling central sidewalks
    const beatCount = this.npcs.filter((n) => !n.dead && n.isBeatCop).length;
    const beatSpots: [number, number, string][] = [
      [-10.5, 22, 'Constable Balwant Singh'],
      [10.5, -34, 'Constable Ashok Pandey'],
    ];
    for (let i = beatCount; i < beatSpots.length; i++) {
      const [bx, bz, copName] = beatSpots[i];
      const rig = createHumanoidModel({
        shirtColor: 0xa1885f,
        pantsColor: 0x8b7355,
        skinColor: 0xc98b63,
        isPolice: true,
      });
      const pos = this.resolveCollisions(bx, bz, 0.45);
      rig.root.position.set(pos.x, 0, pos.z);
      this.scene.add(rig.root);
      this.npcs.push({
        id: this.nextEntityId++,
        name: copName,
        rig,
        x: pos.x,
        z: pos.z,
        yaw: 0,
        vx: 0,
        vz: 0,
        hp: 110,
        maxHp: 110,
        knockbackResist: 0.78,
        walkPhase: 0,
        staggerTimer: 0,
        wanderTimer: 3.5,
        targetYaw: i === 0 ? 0 : Math.PI,
        isEnforcer: false,
        isPolice: true,
        isBeatCop: true,
        lawTier: 1,
        weaponKind: 'pistol',
        hostile: false,
        aggressiveOnHit: true,
        fireCooldown: 1.5,
        meleeCooldown: 1.0,
        punchAnimTimer: 0,
        dead: false,
        deathTimer: 0,
        alertedTimer: 0,
        greetCooldown: 999,
        chaiCompanionTarget: null,
      });
    }
  }

  private spawnNpc(isEnforcer = false, customPos?: { x: number; z: number }): void {
    const outfitStyles: ('kurta' | 'saree' | 'salwar' | 'casual')[] = [
      'kurta',
      'saree',
      'salwar',
      'kurta',
      'casual',
      'saree',
    ];
    const outfitStyle = isEnforcer
      ? 'casual'
      : outfitStyles[Math.floor(Math.random() * outfitStyles.length)];
    const shirtPalette = isEnforcer
      ? [0x3b0764, 0x450a0a]
      : outfitStyle === 'saree'
        ? [0xe11d48, 0xd97706, 0x059669, 0x7c3aed, 0x0284c7]
        : outfitStyle === 'salwar'
          ? [0xdb2777, 0x0d9488, 0xea580c, 0x4f46e5]
          : outfitStyle === 'kurta'
            ? [0xf8fafc, 0xfef3c7, 0xfdba74, 0xe0f2fe, 0x94a3b8]
            : [0x334155, 0x475569, 0x1e3a5f, 0x57534e, 0x3f6212];
    const pantsPalette =
      outfitStyle === 'kurta'
        ? [0xf8fafc, 0xe2e8f0, 0x334155]
        : outfitStyle === 'salwar'
          ? [0xf8fafc, 0xfef3c7]
          : [0x1e2430, 0x334155];
    const rig = createHumanoidModel({
      shirtColor: shirtPalette[Math.floor(Math.random() * shirtPalette.length)],
      pantsColor: pantsPalette[Math.floor(Math.random() * pantsPalette.length)],
      skinColor: [0xe0b494, 0xc98b63, 0x8d5534][Math.floor(Math.random() * 3)],
      outfitStyle,
    });

    let sx = customPos?.x ?? 0;
    let sz = customPos?.z ?? 0;
    if (!customPos) {
      // Mix downtown chowks & expanded residential colony avenues
      const roadPool = Math.random() < 0.65 ? [-60, 0, 60] : [-240, -180, -120, 120, 180, 240];
      const rc = roadPool[Math.floor(Math.random() * roadPool.length)];
      const offset = (Math.random() > 0.5 ? 1 : -1) * 9.5;
      if (Math.random() > 0.5) {
        sx = rc + offset;
        sz = (Math.random() - 0.5) * 440;
      } else {
        sx = (Math.random() - 0.5) * 440;
        sz = rc + offset;
      }
      if (Math.hypot(sx - this.playerX, sz - this.playerZ) < 12) {
        sx += 18;
      }
    }

    const pos = this.resolveCollisions(sx, sz, 0.45);
    rig.root.position.set(pos.x, 0, pos.z);
    this.scene.add(rig.root);

    const id = this.nextEntityId++;
    const maxHp = isEnforcer ? 120 : 90;
    const aggressiveOnHit = isEnforcer || Math.random() < 0.42;
    this.npcs.push({
      id,
      name: isEnforcer ? pickName(INDIAN_ENFORCER_NAMES, id) : pickName(INDIAN_CITIZEN_NAMES, id),
      rig,
      x: pos.x,
      z: pos.z,
      yaw: Math.random() * Math.PI * 2 - Math.PI,
      vx: 0,
      vz: 0,
      hp: maxHp,
      maxHp,
      knockbackResist: isEnforcer ? 0.78 : 0.72,
      walkPhase: Math.random() * 6,
      staggerTimer: 0,
      wanderTimer: 2 + Math.random() * 4,
      targetYaw: Math.random() * Math.PI * 2 - Math.PI,
      isEnforcer,
      isPolice: false,
      hostile: false,
      aggressiveOnHit,
      fireCooldown: 0.9,
      meleeCooldown: 0.85,
      punchAnimTimer: 0,
      dead: false,
      deathTimer: 0,
      alertedTimer: 0,
      greetCooldown: 1 + Math.random() * 3,
      chaiCompanionTarget: null,
    });
  }

  private spawnPoliceOfficer(
    x: number,
    z: number,
    tier: 1 | 2 | 3 | 4 | 5 = 2,
    opts?: { beatCop?: boolean; hostile?: boolean },
  ): NpcEntity {
    const id = this.nextEntityId++;
    const isBeat = tier === 1 || opts?.beatCop;
    const isSwat = tier === 3;
    const isCommando = tier === 4;
    const isArmy = tier === 5;
    const variant = isSwat ? 'swat' : isCommando ? 'commando' : isArmy ? 'army' : 'default';
    const shirtColor = isBeat
      ? 0xa1885f
      : isSwat
        ? 0x0f172a
        : isCommando
          ? 0x111827
          : isArmy
            ? 0x365314
            : 0x1e3a8a;
    const pantsColor = isBeat ? 0x8b7355 : isArmy ? 0x3f4a32 : 0x0f172a;
    const rig = createHumanoidModel({
      shirtColor,
      pantsColor,
      skinColor: 0xd8a47f,
      isPolice: true,
      variant,
    });
    const weaponKind: WeaponId = isArmy || isCommando ? 'rifle' : isSwat ? 'smg' : tier === 2 && id % 2 === 0 ? 'smg' : 'pistol';
    const gun = createWeaponModel(weaponKind);
    gun.scale.setScalar(1.32);
    rig.weaponMount.add(gun);
    rig.rightArm.rotation.x = Math.PI / 2 - 0.12;

    const pos = this.resolveCollisions(x, z, 0.45);
    rig.root.position.set(pos.x, 0, pos.z);
    this.scene.add(rig.root);

    const hp = isArmy ? 260 : isCommando ? 215 : isSwat ? 165 : tier === 2 ? 135 : 105;
    const namePrefix = isArmy
      ? 'Army Jawan'
      : isCommando
        ? 'ATS Commando'
        : isSwat
          ? 'STF SWAT'
          : isBeat
            ? 'Beat Constable'
            : 'Officer';

    const officer: NpcEntity = {
      id,
      name: `${namePrefix} ${pickName(INDIAN_POLICE_NAMES, id).replace(/^(Inspector|SI|Constable|Havaldar)\s+/, '')}`,
      rig,
      x: pos.x,
      z: pos.z,
      yaw: Math.atan2(-(this.playerX - pos.x), -(this.playerZ - pos.z)),
      vx: 0,
      vz: 0,
      hp,
      maxHp: hp,
      knockbackResist: isArmy || isCommando ? 0.88 : isSwat ? 0.84 : 0.78,
      walkPhase: 0,
      staggerTimer: 0,
      wanderTimer: 0,
      targetYaw: 0,
      isEnforcer: false,
      isPolice: true,
      isBeatCop: isBeat,
      isSwat,
      isCommando,
      isArmy,
      lawTier: tier,
      weaponKind,
      hostile: opts?.hostile ?? true,
      aggressiveOnHit: true,
      fireCooldown: 1.5,
      meleeCooldown: 1.0,
      punchAnimTimer: 0,
      dead: false,
      deathTimer: 0,
      alertedTimer: 0,
      greetCooldown: 999,
      chaiCompanionTarget: null,
    };
    this.npcs.push(officer);
    return officer;
  }

  private bindEvents(): void {
    window.addEventListener('resize', this.handleResize);
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(this.container);
    }
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('blur', this.handleWindowBlur);
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);
    document.addEventListener('pointerlockerror', this.handlePointerLockError);
    this.renderer.domElement.addEventListener('mousedown', this.handleMouseDown);
    this.renderer.domElement.addEventListener('mouseleave', this.handleMouseLeave);
    this.renderer.domElement.addEventListener('contextmenu', this.handleContextMenu);
  }

  private handlePointerLockChange = (): void => {
    this.pointerLocked = document.pointerLockElement === this.renderer.domElement;
    if (this.pointerLocked) {
      this.pointerLockBlocked = false;
    } else {
      this.keys.clear();
      this.mouseDownLeft = false;
      this.mouseDragging = false;
    }
    if (this.pointerLockProbeId !== null) {
      window.clearTimeout(this.pointerLockProbeId);
      this.pointerLockProbeId = null;
    }
    this.hasMousePos = false;
    this.emitHudSnapshot();
  };

  private handlePointerLockError = (): void => {
    this.pointerLockBlocked = true;
    if (this.pointerLockProbeId !== null) {
      window.clearTimeout(this.pointerLockProbeId);
      this.pointerLockProbeId = null;
    }
  };

  private isCoarsePointerDevice(): boolean {
    return (
      typeof window !== 'undefined' &&
      Boolean(window.matchMedia?.('(pointer: coarse)').matches)
    );
  }

  private requestCanvasPointerLock(): void {
    if (
      this.isCoarsePointerDevice() ||
      (this.mode !== 'PLAYING' && this.mode !== 'JAIL') ||
      this.weaponWheelOpen ||
      this.houseName === null ||
      this.licenseRevokedPrompt?.active
    ) {
      return;
    }
    if (document.pointerLockElement === this.renderer.domElement) return;
    if (this.pointerLockProbeId !== null) {
      window.clearTimeout(this.pointerLockProbeId);
      this.pointerLockProbeId = null;
    }
    try {
      const res = this.renderer.domElement.requestPointerLock() as unknown as Promise<void> | undefined;
      if (res && typeof res.catch === 'function') {
        res.catch(() => {
          this.pointerLockBlocked = true;
        });
      }
      this.pointerLockProbeId = window.setTimeout(() => {
        this.pointerLockProbeId = null;
        if (
          (this.mode === 'PLAYING' || this.mode === 'JAIL') &&
          document.pointerLockElement !== this.renderer.domElement
        ) {
          this.pointerLockBlocked = true;
        }
      }, 280);
    } catch {
      this.pointerLockBlocked = true;
    }
  }

  public requestPointerLock(): void {
    if (this.isCoarsePointerDevice()) return;
    this.pointerLockBlocked = false;
    this.syncCanvasCursor();
    this.requestCanvasPointerLock();
  }

  public releasePointerLock(): void {
    try {
      if (document.pointerLockElement === this.renderer.domElement) {
        document.exitPointerLock();
      }
    } catch {
      // Ignore
    }
    this.syncCanvasCursor();
  }

  private syncCanvasCursor(): void {
    const isPlayingOrJail = this.mode === 'PLAYING' || this.mode === 'JAIL';
    this.renderer.domElement.style.cursor =
      isPlayingOrJail && !this.firstPerson ? 'none' : '';
  }

  public captureSnapshotDataUrl(): string | null {
    try {
      this.renderer.render(this.scene, this.camera);
      const src = this.renderer.domElement;
      const out = document.createElement('canvas');
      out.width = 256;
      out.height = 160;
      const ctx = out.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(src, 0, 0, out.width, out.height);
      return out.toDataURL('image/jpeg', 0.45);
    } catch {
      return null;
    }
  }

  private handleMouseLeave = (): void => {
    this.hasMousePos = false;
  };

  private handleWindowBlur = (): void => {
    this.hasMousePos = false;
    this.keys.clear();
    this.mouseDownLeft = false;
    this.mouseDragging = false;
    if (this.weaponWheelOpen) {
      this.weaponWheelOpen = false;
      this.callbacks.onWeaponWheelChange(false);
    }
  };

  private handleContextMenu = (e: MouseEvent): void => {
    e.preventDefault();
  };

  private handleResize = (): void => {
    if (this.disposed) return;
    const w = Math.max(1, this.container.clientWidth || window.innerWidth);
    const h = Math.max(1, this.container.clientHeight || window.innerHeight);
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1;
    const maxDpr = isMobile ? 1.5 : 2.0;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, maxDpr));
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private isActionKeyHeld(action: KeybindActionId): boolean {
    const bound = this.settings.keybinds[action];
    if (this.keys.has(bound)) return true;
    // Standard secondary bindings so Arrow keys always remain intuitive for movement alongside custom keybinds
    if (action === 'moveForward' && this.keys.has('ArrowUp')) return true;
    if (action === 'moveBackward' && this.keys.has('ArrowDown')) return true;
    if (action === 'moveLeft' && this.keys.has('ArrowLeft')) return true;
    if (action === 'moveRight' && this.keys.has('ArrowRight')) return true;
    if (action === 'sprint' && bound === 'ShiftLeft' && this.keys.has('ShiftRight')) return true;
    return false;
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    const code = e.code;
    const kb = this.settings.keybinds;
    // Ignore typing in input fields (like Cheat Terminal)
    if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      return;
    }

    if (code === 'Escape') {
      // Let Esc unlock pointer if locked, or pause/resume cleanly without breaking JAIL mode
      if ((this.mode === 'PLAYING' || this.mode === 'JAIL') && document.pointerLockElement !== this.renderer.domElement) {
        this.setMode('PAUSED');
      } else if (this.mode === 'PAUSED') {
        this.setMode(this.jailState ? 'JAIL' : 'PLAYING');
      }
      return;
    }

    if (this.mode === 'CUSTODY') {
      if (code === 'Space' || code === 'Enter') {
        e.preventDefault();
        this.skipCustodyCutscene();
      }
      return;
    }

    if (this.mode === 'SLEEP') {
      if (code === 'Space' || code === 'Enter') {
        e.preventDefault();
        this.skipSleepCutscene();
      }
      return;
    }

    if (this.mode === 'COURTROOM') {
      if (code === 'Space' || code === 'Enter') {
        e.preventDefault();
        this.advanceCourtroomDialogue();
      }
      return;
    }

    if (this.mode === 'JAIL') {
      this.keys.add(code);
      soundEngine.unlock();
      if (code === kb.interact) {
        this.triggerContextAction();
      } else if (code === kb.camera) {
        this.toggleFirstPerson();
      } else if (code === kb.medkit) {
        this.useMedkit();
      } else if (code === kb.jail1) {
        this.jailSleepNight();
      } else if (code === kb.jail2) {
        this.jailPerformWork();
      } else if (code === kb.jail3) {
        if (this.jailState) {
          const cost = this.jailState.wardenBribeCost;
          this.syncBankInterest(true);
          const sav = this.savingsPrincipal + this.savingsInterest;
          if (this.playerCash >= cost) this.jailBribeWarden('cash');
          else if (sav >= cost) this.jailBribeWarden('bank');
          else {
            this.callbacks.onToast({
              text: `Warden Bribe ke liye ${formatRs(cost)} Cash ya Bank Savings mein chahiye!`,
              tone: 'warn',
            });
          }
        }
      } else if (code === kb.jail4) {
        this.jailStartPrisonBreak();
      } else if (code === kb.jail5) {
        this.jailTriggerInmateDistraction();
      } else if (code === kb.jail6 || code === kb.shop) {
        this.jailBribeRival();
      } else if (code === kb.attack || code === 'Enter') {
        this.tryPlayerAttack();
      } else if (code === kb.jump) {
        e.preventDefault();
        this.triggerJump();
      }
      return;
    }

    if (this.mode !== 'PLAYING' || this.licenseRevokedPrompt?.active || this.houseName === null) return;

    this.keys.add(code);
    soundEngine.unlock();

    if (code === kb.map) {
      this.releasePointerLock();
      this.callbacks.onToggleMap();
      return;
    }

    if (code === 'Backspace' && this.waypoint) {
      e.preventDefault();
      this.clearWaypoint();
      return;
    }

    if (code === kb.camera) {
      this.toggleFirstPerson();
      return;
    }

    if (code === kb.scope) {
      this.toggleAds();
      return;
    }

    if (code === kb.mic) {
      this.toggleOrStartMic();
      return;
    }

    if (code === kb.wheel) {
      if (!this.weaponWheelOpen) {
        this.weaponWheelOpen = true;
        this.adsActive = false;
        this.mouseDownLeft = false;
        this.callbacks.onWeaponWheelChange(true);
      }
      return;
    }

    // Interactive Chai Tapri dialogue shortcuts take priority when prompt is visible
    if (this.activeChaiPrompt) {
      if (code === 'Digit1') {
        this.replyToChai(true);
        return;
      }
      if (code === 'Digit2') {
        this.replyToChai(false);
        return;
      }
    }

    if (this.policeInspection && this.policeInspection.phase === 'ASKING') {
      if (code === kb.interact) {
        this.respondToLicenseCheck(true);
        return;
      }
      if (code === kb.radio) {
        this.respondToLicenseCheck(false);
        return;
      }
    }

    if (code === kb.radio) {
      this.triggerRadioChatter();
    } else if (code === kb.horn && this.currentVehicle) {
      this.triggerVehicleHorn();
    } else if (code === kb.vehicle) {
      this.toggleVehicle();
    } else if (code === kb.helmet) {
      this.toggleHelmet();
    } else if (code === kb.medkit) {
      this.useMedkit();
    } else if (code === kb.surrender) {
      if (this.wantedLevel >= 1 && this.missionPhase === 'NONE') {
        if (!e.repeat) {
          this.surrenderHolding = true;
        }
      } else {
        this.useMedkit();
      }
    } else if (code === kb.interact) {
      this.triggerContextAction();
    } else if (code === kb.weapon1) {
      this.equipWeapon('fists');
    } else if (code === kb.weapon2) {
      this.equipWeapon('pistol');
    } else if (code === kb.weapon3) {
      this.equipWeapon('smg');
    } else if (code === kb.weapon4) {
      this.equipWeapon('shotgun');
    } else if (code === kb.weapon5) {
      this.equipWeapon('rifle');
    } else if (code === kb.jump && !this.currentVehicle) {
      e.preventDefault();
      this.triggerJump();
    } else if ((code === kb.attack || code === 'Enter') && !this.currentVehicle) {
      this.tryPlayerAttack();
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);
    const kb = this.settings.keybinds;
    if (e.code === kb.surrender && this.surrenderHolding) {
      const quickTap = this.surrenderHoldTimer < 0.28;
      this.surrenderHolding = false;
      this.surrenderHoldTimer = 0;
      if (quickTap && this.mode === 'PLAYING' && this.playerMedkits > 0 && this.playerHp < this.playerMaxHp) {
        this.useMedkit();
      }
    }
    if (e.code === kb.wheel && this.weaponWheelOpen) {
      this.weaponWheelOpen = false;
      this.callbacks.onWeaponWheelChange(false);
    }
  };

  private tryRaycastShopClick(clientX: number, clientY: number, isRightClick: boolean): boolean {
    const meshes = [...this.shopInteractMeshes];
    if (this.rescueVan) meshes.push(this.rescueVan.hitMesh);
    if (meshes.length === 0) return false;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this._ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this._ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this._raycaster.setFromCamera(this._ndc, this.camera);
    const hits = this._raycaster.intersectObjects(meshes, false);
    if (hits.length === 0) return false;

    const hit = hits[0];
    const action = hit.object.userData?.shopAction;
    const distToPlayer = Math.hypot(hit.point.x - this.playerX, hit.point.z - this.playerZ);

    if (action === 'van') {
      if (this.missionPhase === 'OPEN_VAN' && distToPlayer < 8.5) {
        this.beginRescueCutscene();
      } else if (this.missionPhase === 'ELIMINATE_MAFIA') {
        this.callbacks.onToast({ text: 'Pehle paanchon Dog Mafia gundon ko khatam karo!', tone: 'warn' });
      }
      return true;
    }

    if (action === 'stall') {
      const stallId = hit.object.userData?.stallId as string | undefined;
      const stall = this.chaiStalls.find((s) => s.id === stallId);
      if (stall) {
        if (distToPlayer > 11) {
          this.callbacks.onToast({ text: `${stall.name} ke paas aao order karne ke liye!`, tone: 'info' });
          return true;
        }
        soundEngine.playUiClick();
        this.adsActive = false;
        this.speakWithSubtitle(
          stall.vendorName,
          'citizen',
          808,
          `Aaiye bhai sahab! ${stall.name} par garma-garam nashta taiyaar hai.`,
          `आइए भाई साहब! ${stall.name} पर गरमा-गरम नाश्ता तैयार है।`,
        );
        this.releasePointerLock();
        this.callbacks.onOpenStall?.({
          id: stall.id,
          name: stall.name,
          kind: stall.kind,
          vendorName: stall.vendorName,
        });
        return true;
      }
    }

    if (action === 'atm') {
      const atmId = hit.object.userData?.atmId as string | undefined;
      const atm = this.atms.find((a) => a.id === atmId);
      if (atm) {
        if (distToPlayer > 11) {
          this.callbacks.onToast({ text: `${atm.name} ke paas aao ATM use karne ke liye!`, tone: 'info' });
          return true;
        }
        soundEngine.playAtmBeep();
        this.adsActive = false;
        this.syncBankInterest(false);
        this.releasePointerLock();
        this.callbacks.onOpenAtm?.({ id: atm.id, name: atm.name });
        return true;
      }
    }

    if (action === 'license_officer') {
      if (distToPlayer > 18) {
        this.callbacks.onToast({
          text: 'Arms License ke liye DM Arms Licensing Office ke andar aao!',
          tone: 'info',
        });
        return true;
      }
      soundEngine.playUiClick();
      this.adsActive = false;
      this.speakWithSubtitle(
        'Magistrate Clerk',
        'citizen',
        781,
        'DM Arms Licensing Office mein swagat hai. Niyam aur range test pass karke apna license banwayein.',
        'डीएम आर्म्स लाइसेंसिंग ऑफिस में स्वागत है। नियम और रेंज टेस्ट पास करके अपना लाइसेंस बनवाएँ।',
      );
      this.releasePointerLock();
      this.callbacks.onOpenLicenseOffice?.();
      return true;
    }

    if (action === 'banker') {
      if (distToPlayer > 18) {
        this.callbacks.onToast({ text: 'Officer se baat karne ke liye Royal Bank Of India ke andar aao!', tone: 'info' });
        return true;
      }
      soundEngine.playUiClick();
      this.adsActive = false;
      this.speakWithSubtitle(
        'Rajeev Malhotra',
        'banker',
        777,
        'Royal Bank Of India mein aapka swagat hai. Police ko ek mission mein madad chahiye.',
        'रॉयल बैंक ऑफ़ इंडिया में आपका स्वागत है। पुलिस को एक मिशन में आपकी मदद चाहिए।',
      );
      this.releasePointerLock();
      this.callbacks.onBankPrompt(false);
      return true;
    }

    if (distToPlayer > 16) {
      this.callbacks.onToast({ text: 'Kharidne ke liye Pankaj Shastra Bhandar ke aur paas jaao!', tone: 'info' });
      return true;
    }

    if (action === 'dealer') {
      soundEngine.playUiClick();
      this.adsActive = false;
      this.speakWithSubtitle(
        'Pankaj Bhai',
        'dealer',
        999,
        'Pankaj Shastra Bhandar mein swagat hai bhai! Asla dekho, daam saamne likha hai.',
        'पंकज शस्त्र भंडार में स्वागत है भाई! असला देखो, दाम सामने लिखा है।',
      );
      this.releasePointerLock();
      this.callbacks.onShopDealerClick();
      return true;
    }
    if (action === 'gun') {
      const weaponId = hit.object.userData?.weaponId as WeaponId | undefined;
      if (weaponId) {
        soundEngine.playUiClick();
        this.adsActive = false;
        this.speakWithSubtitle(
          'Pankaj Bhai',
          'dealer',
          999,
          'Tagda maal hai bhai! Lena hai kya?',
          'तगड़ा माल है भाई! लेना है क्या?',
        );
        this.releasePointerLock();
        this.callbacks.onShopDisplayClick(weaponId);
        return true;
      }
    }
    if (isRightClick) return false;
    return false;
  }

  private handleMouseDown = (e: MouseEvent): void => {
    if (
      (this.mode !== 'PLAYING' && this.mode !== 'JAIL') ||
      this.licenseRevokedPrompt?.active ||
      this.houseName === null
    ) {
      return;
    }
    if (this.weaponWheelOpen) {
      if (e.button === 0) {
        this.setWeaponWheelOpen(false);
      }
      return;
    }
    soundEngine.unlock();
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.hasMousePos = true;

    // Right-click or Left-click on Gun Shopkeeper NPC, 3D Display Gun, Bank, or Street Stall
    if (this.mode === 'PLAYING' && (e.button === 2 || e.button === 0)) {
      const handledShop = this.tryRaycastShopClick(e.clientX, e.clientY, e.button === 2);
      if (handledShop) return;
    }

    if (this.mode === 'PLAYING' && e.button === 2 && !this.currentVehicle && this.activeWeapon !== 'fists') {
      this.toggleAds();
      return;
    }

    if (e.button === 0) {
      const wasLocked = document.pointerLockElement === this.renderer.domElement;
      const isCoarseTouch = this.isCoarsePointerDevice();
      if (!wasLocked && !isCoarseTouch) {
        const prevBlocked = this.pointerLockBlocked;
        this.requestCanvasPointerLock();
        if (!prevBlocked) {
          // Consume this first click solely to lock desktop pointer without misfiring
          this.mouseDragging = true;
          return;
        }
      }
      this.mouseDragging = true;
      this.mouseDownLeft = true;
      if (!this.currentVehicle) {
        this.tryPlayerAttack();
      }
    } else if (e.button === 2) {
      this.mouseDragging = true;
    }
  };

  private handleMouseUp = (e: MouseEvent): void => {
    if (e.button === 0) this.mouseDownLeft = false;
    if (e.button === 0 || e.button === 2) this.mouseDragging = false;
  };

  private handleMouseMove = (e: MouseEvent): void => {
    if (
      (this.mode !== 'PLAYING' && this.mode !== 'JAIL') ||
      this.weaponWheelOpen ||
      this.houseName === null
    ) {
      return;
    }

    let dx = 0;
    let dy = 0;
    if (document.pointerLockElement === this.renderer.domElement) {
      dx = e.movementX || 0;
      dy = e.movementY || 0;
    } else {
      // Smooth click-and-drag fallback rotation when Pointer Lock is blocked by an iframe sandbox
      if (!this.mouseDragging && (e.buttons & 1) === 0 && (e.buttons & 2) === 0) {
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.hasMousePos = true;
        return;
      }
      if (!this.hasMousePos) {
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.hasMousePos = true;
        return;
      }
      dx = e.clientX - this.lastMouseX;
      dy = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;

      if (Math.hypot(dx, dy) > 120) return;
    }

    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return;

    const adsScale = this.adsActive ? 0.55 : 1.0;
    const sens = 0.0052 * this.settings.mouseSensitivity * adsScale;
    this.camYaw = normalizeAngle(this.camYaw - dx * sens);
    const minP = this.firstPerson ? -0.65 : 0.14;
    const maxP = this.firstPerson ? 0.65 : 0.92;
    this.camPitch = clamp(this.camPitch + dy * sens * 0.72, minP, maxP);
  };

  // --- Public UI & Touch Controls ---

  public setTouchMove(x: number, y: number): void {
    this.touchMoveX = clamp(x, -1, 1);
    this.touchMoveY = clamp(y, -1, 1);
  }

  public setTouchSprint(active: boolean): void {
    this.touchSprint = active;
  }

  public addCameraDelta(dx: number, dy: number): void {
    if (this.mode !== 'PLAYING' && this.mode !== 'JAIL') return;
    const adsScale = this.adsActive ? 0.55 : 1.0;
    const sens = 0.0055 * this.settings.mouseSensitivity * adsScale;
    this.camYaw = normalizeAngle(this.camYaw - dx * sens);
    const minP = this.firstPerson ? -0.65 : 0.14;
    const maxP = this.firstPerson ? 0.65 : 0.92;
    this.camPitch = clamp(this.camPitch + dy * sens * 0.75, minP, maxP);
  }

  private syncVehicleFirstPersonVisibility(): void {
    const v = this.currentVehicle;
    if (!v) return;
    const isFpv = this.cameraMode === 'first_person';
    if (v.rig.cabinMesh) {
      v.rig.cabinMesh.visible = !isFpv;
    }
    if (v.rig.cockpitGroup) {
      v.rig.cockpitGroup.visible = isFpv || v.kind === 'rickshaw' || v.kind === 'chopper';
    }
    if (v.rig.cabinGlassMat) {
      v.rig.cabinGlassMat.opacity = isFpv ? 0.14 : 0.34;
    }
    if (v.kind === 'bike') {
      this.playerRig.root.visible = !isFpv;
    }
  }

  public toggleFirstPerson(): void {
    if (this.mode !== 'PLAYING' && this.mode !== 'JAIL') return;
    const prevFp = this.firstPerson;
    this.cameraMode =
      this.cameraMode === 'third_far'
        ? 'third_close'
        : this.cameraMode === 'third_close'
          ? 'first_person'
          : 'third_far';
    this.firstPerson = this.cameraMode === 'first_person';
    if (this.firstPerson && !prevFp) {
      this.camPitch = clamp(this.camPitch - 0.28, -0.45, 0.45);
      if (this.currentVehicle) {
        this.camYaw = this.currentVehicle.yaw;
      }
    } else if (!this.firstPerson && prevFp) {
      this.camPitch = clamp(this.camPitch + 0.25, 0.16, 0.85);
    }
    this.playerRig.root.visible = !this.currentVehicle && !this.firstPerson;
    this.syncVehicleFirstPersonVisibility();
    this.refreshPlayerWeaponMesh();
    this.syncCanvasCursor();
    soundEngine.playUiClick();
    const keyLabel = this.settings.keybinds.camera.replace('Key', '');
    this.callbacks.onToast({
      text:
        this.cameraMode === 'third_close'
          ? '3rd-Person Close View'
          : this.cameraMode === 'first_person'
            ? this.currentVehicle
              ? `1st-Person Cockpit View (${keyLabel} to cycle)`
              : `1st-Person View ON (${keyLabel} to cycle)`
            : '3rd-Person Far View',
      tone: 'info',
    });
    this.emitHudSnapshot();
  }

  public toggleVehicleHeadlights(): void {
    if (this.mode !== 'PLAYING' || !this.currentVehicle) return;
    this.vehicleHeadlightsOn = !this.vehicleHeadlightsOn;
    soundEngine.playUiClick();
    this.callbacks.onToast({
      text: this.vehicleHeadlightsOn ? 'Headlights ON' : 'Headlights OFF',
      tone: 'info',
    });
    this.emitHudSnapshot();
  }

  public setChopperAltitudeInput(ascend: boolean, descend: boolean): void {
    this.chopperAscendTouch = ascend;
    this.chopperDescendTouch = descend;
  }

  public toggleAds(): void {
    if (this.mode !== 'PLAYING' || this.currentVehicle) return;
    if (this.activeWeapon === 'fists') {
      this.callbacks.onToast({ text: 'Scope use karne ke liye gun equip karo!', tone: 'info' });
      return;
    }
    this.adsActive = !this.adsActive;
    soundEngine.playUiClick();
    this.emitHudSnapshot();
  }

  public setAds(active: boolean): void {
    this.adsActive = active && !this.currentVehicle && this.activeWeapon !== 'fists';
    this.emitHudSnapshot();
  }

  public triggerAttack(): void {
    soundEngine.unlock();
    this.tryPlayerAttack();
  }

  public setTouchAttackHeld(held: boolean): void {
    this.touchAttackHeld = held;
    if (held) {
      soundEngine.unlock();
      this.tryPlayerAttack();
    }
  }

  public triggerJump(): void {
    const groundY = this.mode === 'JAIL' ? 0.24 : 0;
    if ((this.mode !== 'PLAYING' && this.mode !== 'JAIL') || this.currentVehicle || this.playerY > groundY + 0.05) {
      return;
    }
    soundEngine.unlock();
    this.playerVy = 8.4;
    soundEngine.playJump();
  }

  public triggerEnterExit(): void {
    soundEngine.unlock();
    this.toggleVehicle();
  }

  public triggerVehicleHorn(): void {
    if (this.mode !== 'PLAYING' || !this.currentVehicle) return;
    soundEngine.unlock();
    soundEngine.playCarHorn(this.currentVehicle.kind, 1.0);
    // Nearby calm pedestrians briefly glance or step clear
    for (const npc of this.npcs) {
      if (npc.dead || npc.isPolice || npc.landmarkKind) continue;
      const d = Math.hypot(npc.x - this.playerX, npc.z - this.playerZ);
      if (d < 9.5) {
        npc.targetYaw = Math.atan2(-(npc.x - this.playerX), -(npc.z - this.playerZ));
      }
    }
    // Nearby AI traffic responds with brief horn blasts
    for (const other of this.vehicles) {
      if (other.id === this.currentVehicle.id || other.destroyed || other.occupiedByPlayer || other.aiDisabled) continue;
      const d = Math.hypot(other.x - this.playerX, other.z - this.playerZ);
      if (d < 22 && (!other.aiHornCooldown || other.aiHornCooldown <= 0) && Math.random() < 0.45) {
        other.aiHornCooldown = 2.6 + Math.random() * 2.5;
        window.setTimeout(() => {
          if (!this.disposed && !other.destroyed) {
            soundEngine.playCarHorn(other.kind, clamp(1 - d / 36, 0.14, 0.62));
          }
        }, 180 + Math.random() * 260);
      }
    }
  }

  public triggerRadioChatter(): void {
    if (this.mode !== 'PLAYING') return;
    soundEngine.unlock();
    soundEngine.playPoliceRadioChatter();
    const line = pickHindiLine('thana_radio');
    this.speakWithSubtitle('Bharat Police Wireless', 'officer', 704, line.text, line.tts, 'normal');
  }

  public setWeaponWheelOpen(open: boolean): void {
    this.weaponWheelOpen = open;
    if (open) {
      this.adsActive = false;
      this.mouseDownLeft = false;
      this.touchAttackHeld = false;
    }
    this.callbacks.onWeaponWheelChange(open);
  }

  private findClosestStreetDog(maxDist: number): DogEntity | null {
    let best: DogEntity | null = null;
    let bestD = maxDist;
    for (const dog of this.streetDogs) {
      if (dog.dead) continue;
      const d = Math.hypot(dog.x - this.playerX, dog.z - this.playerZ);
      if (d < bestD) {
        bestD = d;
        best = dog;
      }
    }
    return best;
  }

  private findNearestStreetStall(maxDist: number): ChaiStallInfo | null {
    let best: ChaiStallInfo | null = null;
    let bestD = maxDist;
    for (const s of this.chaiStalls) {
      const d = Math.min(
        Math.hypot(s.approachX - this.playerX, s.approachZ - this.playerZ),
        Math.hypot(s.x - this.playerX, s.z - this.playerZ),
      );
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    return best;
  }

  private findNearestSacredPlace(maxDist: number): SacredLandmarkInfo | null {
    let best: SacredLandmarkInfo | null = null;
    let bestD = maxDist;
    for (const sp of this.sacredPlaces) {
      const d = Math.hypot(sp.x - this.playerX, sp.z - this.playerZ);
      if (d < bestD) {
        bestD = d;
        best = sp;
      }
    }
    return best;
  }

  private findNearestAtm(maxDist: number): AtmInfo | null {
    let best: AtmInfo | null = null;
    let bestD = maxDist;
    for (const a of this.atms) {
      const d = Math.hypot(a.approachX - this.playerX, a.approachZ - this.playerZ);
      const dBody = Math.hypot(a.x - this.playerX, a.z - this.playerZ);
      const minD = Math.min(d, dBody);
      if (minD < bestD) {
        bestD = minD;
        best = a;
      }
    }
    return best;
  }

  private getTotalGameDays(): number {
    return (this.dayCount - 1) + this.gameMinutes / 1440;
  }

  private recordPassbook(
    account: 'SAVINGS' | 'FD' | 'ATM',
    kind: 'DEPOSIT' | 'WITHDRAW' | 'INTEREST' | 'MISSION',
    amount: number,
    balanceAfter: number,
    note: string,
  ): void {
    const tod = this.getTimeOfDayHud();
    this.passbook.unshift({
      id: this.nextPassbookId++,
      day: this.dayCount,
      timeLabel: tod.formattedTime,
      account,
      kind,
      amount: Math.round(amount * 100) / 100,
      balanceAfter: Math.round(balanceAfter * 100) / 100,
      note,
    });
    if (this.passbook.length > 50) {
      this.passbook.length = 50;
    }
  }

  private syncBankInterest(settleFraction = false): void {
    const nowDays = this.getTotalGameDays();
    if (nowDays <= this.lastCompoundDay) return;

    // Probation freeze: advance compound marker without paying Savings or FD interest
    if (this.probationDaysLeft > 0) {
      this.lastCompoundDay = nowDays;
      return;
    }

    let elapsed = nowDays - this.lastCompoundDay;

    // Daily compounding for every full elapsed in-game day (Rate / 365 per day)
    let safety = 0;
    while (elapsed >= 1.0 && safety < 3650) {
      safety++;
      const savBase = this.savingsPrincipal + this.savingsInterest;
      const fdBase = this.fdPrincipal + this.fdInterest;
      const savDayInt = savBase > 0 ? savBase * (SAVINGS_ANNUAL_RATE / DAYS_PER_YEAR) : 0;
      const fdDayInt = fdBase > 0 ? fdBase * (FD_ANNUAL_RATE / DAYS_PER_YEAR) : 0;

      if (savDayInt > 0) {
        this.savingsInterest += savDayInt;
        this.totalInterestEarned += savDayInt;
      }
      if (fdDayInt > 0) {
        this.fdInterest += fdDayInt;
        this.totalInterestEarned += fdDayInt;
      }
      this.lastCompoundDay += 1.0;
      elapsed -= 1.0;

      const settledDay = Math.floor(this.lastCompoundDay) + 1;
      const settledDate = formatInGameDate(settledDay);
      if (savDayInt >= 0.01) {
        this.recordPassbook(
          'SAVINGS',
          'INTEREST',
          savDayInt,
          this.savingsPrincipal + this.savingsInterest,
          `${settledDate} Savings Interest (2.5% ÷ 365)`,
        );
      }
      if (fdDayInt >= 0.01) {
        this.recordPassbook(
          'FD',
          'INTEREST',
          fdDayInt,
          this.fdPrincipal + this.fdInterest,
          `${settledDate} FD Interest (4.0% ÷ 365)`,
        );
      }
    }

    // Pro-rate remaining fractional day cleanly right before any deposit/withdrawal/sleep/skip
    if (settleFraction && elapsed > 0.0001) {
      const savBase = this.savingsPrincipal + this.savingsInterest;
      const fdBase = this.fdPrincipal + this.fdInterest;
      const savFracInt = savBase > 0 ? savBase * (SAVINGS_ANNUAL_RATE / DAYS_PER_YEAR) * elapsed : 0;
      const fdFracInt = fdBase > 0 ? fdBase * (FD_ANNUAL_RATE / DAYS_PER_YEAR) * elapsed : 0;
      if (savFracInt > 0) {
        this.savingsInterest += savFracInt;
        this.totalInterestEarned += savFracInt;
      }
      if (fdFracInt > 0) {
        this.fdInterest += fdFracInt;
        this.totalInterestEarned += fdFracInt;
      }
      const curDate = formatInGameDate(this.dayCount);
      if (savFracInt >= 0.01) {
        this.recordPassbook(
          'SAVINGS',
          'INTEREST',
          savFracInt,
          this.savingsPrincipal + this.savingsInterest,
          `${curDate} Settled Savings Interest`,
        );
      }
      if (fdFracInt >= 0.01) {
        this.recordPassbook(
          'FD',
          'INTEREST',
          fdFracInt,
          this.fdPrincipal + this.fdInterest,
          `${curDate} Settled FD Interest (4.0% p.a.)`,
        );
      }
      this.lastCompoundDay = nowDays;
    }
  }

  public bankTransaction(
    account: 'SAVINGS' | 'FD',
    action: 'DEPOSIT' | 'WITHDRAW',
    rawAmount: number,
    viaAtm = false,
  ): { ok: boolean; message: string; amount: number } {
    this.syncBankInterest(true);
    const amount = Math.floor(rawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, message: 'Enter a valid positive amount.', amount: 0 };
    }

    if (action === 'DEPOSIT') {
      if (this.playerCash < amount) {
        this.callbacks.onToast({ text: `Wallet mein sirf ${formatRs(this.playerCash)} hai`, tone: 'warn' });
        return { ok: false, message: `Insufficient wallet cash (have ${formatRs(this.playerCash)}).`, amount: 0 };
      }
      this.playerCash -= amount;
      if (account === 'SAVINGS') {
        this.savingsPrincipal += amount;
        const total = this.savingsPrincipal + this.savingsInterest;
        this.recordPassbook(
          viaAtm ? 'ATM' : 'SAVINGS',
          'DEPOSIT',
          amount,
          total,
          viaAtm ? 'Cash Deposit via Street ATM' : 'Branch Savings Deposit (2.5% p.a.)',
        );
      } else {
        this.fdPrincipal += amount;
        if (this.fdOpenedDay === null) this.fdOpenedDay = this.dayCount;
        const total = this.fdPrincipal + this.fdInterest;
        this.recordPassbook(
          'FD',
          'DEPOSIT',
          amount,
          total,
          'Fixed Deposit Opened / Top-Up (4.0% p.a.)',
        );
      }
      soundEngine.playAtmCashDispense();
      this.saveGameState();
      this.emitHudSnapshot();
      return {
        ok: true,
        amount,
        message: `Deposited ${formatRs(amount)} into ${account === 'SAVINGS' ? 'Savings Account' : 'Fixed Deposit'}.`,
      };
    }

    // WITHDRAW (credits principal + pro-rated accrued interest)
    if (account === 'SAVINGS') {
      const total = this.savingsPrincipal + this.savingsInterest;
      if (total < 1) {
        return { ok: false, message: 'Savings account balance is ₹0.00.', amount: 0 };
      }
      const withdrawExact = Math.min(total, rawAmount);
      const payout = withdrawExact >= total - 0.5 ? Math.round(total) : Math.round(withdrawExact);
      const ratio = withdrawExact >= total - 0.5 ? 1 : Math.min(1, withdrawExact / total);
      const intPaid = this.savingsInterest * ratio;
      const prinPaid = this.savingsPrincipal * ratio;

      this.savingsInterest = Math.max(0, this.savingsInterest - intPaid);
      this.savingsPrincipal = Math.max(0, this.savingsPrincipal - prinPaid);
      if (ratio >= 0.9999) {
        this.savingsInterest = 0;
        this.savingsPrincipal = 0;
      }
      this.playerCash += payout;
      const remTotal = this.savingsPrincipal + this.savingsInterest;
      this.recordPassbook(
        viaAtm ? 'ATM' : 'SAVINGS',
        'WITHDRAW',
        payout,
        remTotal,
        intPaid >= 0.01
          ? `${viaAtm ? 'ATM' : 'Branch'} Withdraw (incl. ${formatRsExact(intPaid)} interest)`
          : `${viaAtm ? 'ATM' : 'Branch'} Cash Withdrawal`,
      );
      soundEngine.playAtmCashDispense();
      this.saveGameState();
      this.emitHudSnapshot();
      return {
        ok: true,
        amount: payout,
        message:
          intPaid >= 0.01
            ? `Withdrew ${formatRs(payout)} (includes ${formatRsExact(intPaid)} pro-rated interest).`
            : `Withdrew ${formatRs(payout)} from Savings.`,
      };
    } else {
      const total = this.fdPrincipal + this.fdInterest;
      if (total < 1) {
        return { ok: false, message: 'No active Fixed Deposit balance.', amount: 0 };
      }
      const withdrawExact = Math.min(total, rawAmount);
      const payout = withdrawExact >= total - 0.5 ? Math.round(total) : Math.round(withdrawExact);
      const ratio = withdrawExact >= total - 0.5 ? 1 : Math.min(1, withdrawExact / total);
      const intPaid = this.fdInterest * ratio;
      const prinPaid = this.fdPrincipal * ratio;

      this.fdInterest = Math.max(0, this.fdInterest - intPaid);
      this.fdPrincipal = Math.max(0, this.fdPrincipal - prinPaid);
      if (ratio >= 0.9999) {
        this.fdInterest = 0;
        this.fdPrincipal = 0;
        this.fdOpenedDay = null;
      }
      this.playerCash += payout;
      const remTotal = this.fdPrincipal + this.fdInterest;
      this.recordPassbook(
        'FD',
        'WITHDRAW',
        payout,
        remTotal,
        intPaid >= 0.01
          ? `FD Redemption (incl. ${formatRsExact(intPaid)} interest @ 4% p.a.)`
          : 'Fixed Deposit Withdrawal',
      );
      soundEngine.playAtmCashDispense();
      this.saveGameState();
      this.emitHudSnapshot();
      return {
        ok: true,
        amount: payout,
        message:
          intPaid >= 0.01
            ? `Redeemed ${formatRs(payout)} from FD (includes ${formatRsExact(intPaid)} interest).`
            : `Withdrew ${formatRs(payout)} from Fixed Deposit.`,
      };
    }
  }

  private getBankHudState(): BankAccountHudState {
    const nowDays = this.getTotalGameDays();
    const pendingFrac = this.probationDaysLeft > 0 ? 0 : Math.max(0, nowDays - this.lastCompoundDay);

    const savBase = this.savingsPrincipal + this.savingsInterest;
    const savPending = savBase * (SAVINGS_ANNUAL_RATE / DAYS_PER_YEAR) * pendingFrac;
    const savingsInterest = this.savingsInterest + savPending;
    const savingsTotal = this.savingsPrincipal + savingsInterest;
    const savingsDailyRate = savingsTotal * (SAVINGS_ANNUAL_RATE / DAYS_PER_YEAR);

    const fdBase = this.fdPrincipal + this.fdInterest;
    const fdPending = fdBase * (FD_ANNUAL_RATE / DAYS_PER_YEAR) * pendingFrac;
    const fdInterest = this.fdInterest + fdPending;
    const fdTotal = this.fdPrincipal + fdInterest;
    const fdDailyRate = fdTotal * (FD_ANNUAL_RATE / DAYS_PER_YEAR);

    return {
      savingsPrincipal: this.savingsPrincipal,
      savingsInterest,
      savingsTotal,
      savingsDailyRate,
      fdPrincipal: this.fdPrincipal,
      fdInterest,
      fdTotal,
      fdDailyRate,
      fdOpenedDay: this.fdOpenedDay,
      totalInterestEarned: this.totalInterestEarned + savPending + fdPending,
      calendarDate: formatInGameDate(this.dayCount),
      passbook: [...this.passbook],
    };
  }

  public buyStallItem(stallId: string, item: StreetStallMenuItem): boolean {
    if (this.playerCash < item.price) {
      this.callbacks.onToast({ text: `Need ${formatRs(item.price)} for ${item.name}`, tone: 'warn' });
      return false;
    }
    const stall = this.chaiStalls.find((s) => s.id === stallId);
    this.playerCash -= item.price;
    this.playerHp = Math.min(this.playerMaxHp, this.playerHp + item.hpGain);
    if (item.restoreStamina) {
      this.playerStamina = this.playerMaxStamina;
      this.staminaExhausted = false;
    }
    soundEngine.playCashPickup();
    this.speakWithSubtitle(
      stall?.vendorName ?? 'Vendor',
      'citizen',
      812,
      `Shukriya bhai! Garma-garam ${item.name} enjoy karo.`,
      `शुक्रिया भाई! गरमा-गरम ${item.name} एन्जॉय करो।`,
    );
    this.callbacks.onToast({
      text: `${item.name} (+${item.hpGain} HP & Stamina) · -${formatRs(item.price)}`,
      tone: 'cash',
    });
    this.saveGameState();
    this.emitHudSnapshot();
    return true;
  }

  public payLicenseFee(): { ok: boolean; message: string } {
    if (this.hasGunLicense) {
      return { ok: true, message: 'Aapke paas pehle se valid Arms License hai.' };
    }
    if (this.playerCash < GUN_LICENSE_FEE_INR) {
      this.callbacks.onToast({
        text: `Arms License application fee ${formatRs(GUN_LICENSE_FEE_INR)} chahiye!`,
        tone: 'warn',
      });
      return {
        ok: false,
        message: `Application fee ${formatRs(GUN_LICENSE_FEE_INR)} chahiye (abhi ${formatRs(this.playerCash)} hai).`,
      };
    }
    this.playerCash -= GUN_LICENSE_FEE_INR;
    soundEngine.playCashPickup();
    this.saveGameState();
    this.emitHudSnapshot();
    return {
      ok: true,
      message: `${formatRs(GUN_LICENSE_FEE_INR)} fee jama ho gayi. Ab safety & target range test poora karo!`,
    };
  }

  public grantGunLicense(): void {
    this.hasGunLicense = true;
    this.licenseGraceTimer = 25;
    soundEngine.playLicenseApproved();
    this.speakWithSubtitle(
      'Magistrate Office',
      'narrator',
      782,
      'Badhai ho! Aapka Bharat Arms License approve ho gaya hai. Ab aap kanooni taur par hathiyar rakh sakte hain.',
      'बधाई हो! आपका भारत आर्म्स लाइसेंस अप्रूव हो गया है। अब आप कानूनी तौर पर हथियार रख सकते हैं।',
      'high',
    );
    this.callbacks.onToast({
      text: 'VALID ARMS LICENSE ISSUED · Police check par [E] dabakar dikha sakte ho',
      tone: 'cash',
    });
    this.saveGameState();
    this.emitHudSnapshot();
  }

  public payDrivingLicenseFee(): { ok: boolean; message: string } {
    if (this.hasDrivingLicense) {
      return { ok: true, message: 'Aapke paas pehle se valid Bharat Driving License hai.' };
    }
    if (this.playerCash < DRIVING_LICENSE_FEE_INR) {
      this.callbacks.onToast({
        text: `Driving License fee ${formatRs(DRIVING_LICENSE_FEE_INR)} chahiye!`,
        tone: 'warn',
      });
      return {
        ok: false,
        message: `Driving License test fee ${formatRs(DRIVING_LICENSE_FEE_INR)} chahiye (abhi ${formatRs(this.playerCash)} hai).`,
      };
    }
    this.playerCash -= DRIVING_LICENSE_FEE_INR;
    soundEngine.playCashPickup();
    this.saveGameState();
    this.emitHudSnapshot();
    return {
      ok: true,
      message: `${formatRs(DRIVING_LICENSE_FEE_INR)} RTO fee jama ho gayi. Ab Traffic Rules aur Track Driving Test pass karo!`,
    };
  }

  public grantDrivingLicense(): void {
    this.hasDrivingLicense = true;
    this.trafficFineStrikes = 0;
    soundEngine.playLicenseApproved();
    this.speakWithSubtitle(
      'RTO Inspector',
      'narrator',
      784,
      'Shabash! Aapne RTO practical driving test pass kar liya. Aapka Bharat Driving License ban gaya!',
      'शाबाश! आपने ड्राइविंग टेस्ट पास कर लिया। आपका भारत ड्राइविंग लाइसेंस बन गया!',
    );
    this.callbacks.onToast({
      text: 'BHARAT DRIVING LICENSE (2W + LMV) ISSUED · Challan se bachav!',
      tone: 'cash',
    });
    this.saveGameState();
    this.emitHudSnapshot();
  }

  public buyHelmet(): { ok: boolean; message: string } {
    if (this.hasHelmet) {
      this.helmetOn = true;
      this.playerRig.helmetMesh.visible = true;
      this.emitHudSnapshot();
      return { ok: true, message: 'ISI Helmet pehle se kharida hua hai (Pehen liya).' };
    }
    if (this.playerCash < HELMET_PRICE_INR) {
      this.callbacks.onToast({
        text: `ISI Helmet ke liye ${formatRs(HELMET_PRICE_INR)} chahiye!`,
        tone: 'warn',
      });
      return {
        ok: false,
        message: `ISI Helmet ki keemat ${formatRs(HELMET_PRICE_INR)} hai (abhi ${formatRs(this.playerCash)} hai).`,
      };
    }
    this.playerCash -= HELMET_PRICE_INR;
    this.hasHelmet = true;
    this.helmetOn = true;
    this.playerRig.helmetMesh.visible = true;
    soundEngine.playCashPickup();
    this.callbacks.onToast({
      text: `ISI Helmet Kharida (-${formatRs(HELMET_PRICE_INR)}) · [L] se utaar/pehan sakte ho`,
      tone: 'cash',
    });
    this.saveGameState();
    this.emitHudSnapshot();
    return { ok: true, message: 'ISI Helmet kharida aur pehen liya! Bike crash safety +65% ON.' };
  }

  public toggleHelmet(): void {
    if (!this.hasHelmet) {
      this.callbacks.onToast({
        text: `Pehle DM/RTO Office se ISI Helmet kharido (${formatRs(HELMET_PRICE_INR)})!`,
        tone: 'warn',
      });
      return;
    }
    this.helmetOn = !this.helmetOn;
    this.playerRig.helmetMesh.visible = this.helmetOn;
    soundEngine.playUiClick();
    this.callbacks.onToast({
      text: this.helmetOn ? 'ISI Helmet PEHEN LIYA (Bike Crash Safety ON)' : 'ISI Helmet UTAAR DIYA',
      tone: 'info',
    });
    this.saveGameState();
    this.emitHudSnapshot();
  }

  public triggerContextAction(): void {
    if (this.mode === 'JAIL' && this.jailState) {
      soundEngine.unlock();
      if (this.jailState.nearStation === 'BUNK') {
        this.jailSleepNight();
      } else if (this.jailState.nearStation === 'TOILET') {
        this.jailUseToilet();
      } else if (this.jailState.nearStation === 'WORKSHOP') {
        this.jailPerformWork();
      } else if (this.jailState.nearStation === 'INMATE_ALLY') {
        this.jailTriggerInmateDistraction();
      } else if (this.jailState.nearStation === 'INMATE_RIVAL') {
        this.jailBribeRival();
      } else if (this.jailState.nearStation === 'ESCAPE_GATE') {
        this.jailStartPrisonBreak();
      } else if (this.jailState.nearStation === 'WARDEN') {
        const cost = this.jailState.wardenBribeCost;
        this.syncBankInterest(true);
        const savTotal = this.savingsPrincipal + this.savingsInterest;
        if (this.playerCash >= cost) {
          this.jailBribeWarden('cash');
        } else if (savTotal >= cost) {
          this.jailBribeWarden('bank');
        } else {
          this.callbacks.onToast({
            text: `Warden ko ${formatRs(cost)} chahiye (Cash: ${formatRs(this.playerCash)} · Bank: ${formatRsExact(savTotal)}). Workshop se kamaao ya Bunk se So kar din badhao!`,
            tone: 'warn',
          });
        }
      }
      return;
    }
    if (this.mode !== 'PLAYING') return;
    soundEngine.unlock();
    if (this.policeInspection && this.policeInspection.phase === 'ASKING') {
      this.respondToLicenseCheck(true);
      return;
    }
    if (this.missionPhase === 'OPEN_VAN' && this.rescueVan) {
      const distVan = Math.hypot(this.playerX - this.rescueVanPos.x, this.playerZ - (this.rescueVanPos.z + 2.6));
      if (distVan < 6.5) {
        this.beginRescueCutscene();
        return;
      }
    }
    if (!this.currentVehicle) {
      const nearDog = this.findClosestStreetDog(3.8);
      if (nearDog) {
        if (nearDog.behavior === 'ROAM') {
          nearDog.behavior = 'FOLLOW';
          nearDog.hp = Math.min(nearDog.maxHp, nearDog.hp + 15);
          soundEngine.playDogBark(nearDog.id);
          soundEngine.playCashPickup();
          this.callbacks.onToast({
            text: 'Kutta khush ho gaya! Ab tere peeche chalega ([E] Sit/Stay)',
            tone: 'info',
          });
        } else if (nearDog.behavior === 'FOLLOW') {
          nearDog.behavior = 'SIT';
          soundEngine.playUiClick();
          this.callbacks.onToast({
            text: 'Kutta wahin baith gaya! ([E] wapas bulao)',
            tone: 'info',
          });
        } else {
          nearDog.behavior = 'FOLLOW';
          soundEngine.playDogBark(nearDog.id);
          this.callbacks.onToast({
            text: 'Kutta phir se tere saath chal raha hai!',
            tone: 'info',
          });
        }
        this.emitHudSnapshot();
        return;
      }

      // Interactive Chai Tapri / Golgappa Stall / Chaat Corner
      const nearStall = this.findNearestStreetStall(4.5);
      if (nearStall) {
        soundEngine.playUiClick();
        this.adsActive = false;
        this.speakWithSubtitle(
          nearStall.vendorName,
          'citizen',
          808,
          `Aaiye bhai sahab! ${nearStall.name} par kya lagaaun?`,
          `आइए भाई साहब! ${nearStall.name} पर क्या लगाऊँ?`,
        );
        this.releasePointerLock();
        this.callbacks.onOpenStall?.({
          id: nearStall.id,
          name: nearStall.name,
          kind: nearStall.kind,
          vendorName: nearStall.vendorName,
        });
        return;
      }

      // Interactive Street 24x7 ATM Kiosks
      const nearAtm = this.findNearestAtm(4.8);
      if (nearAtm) {
        soundEngine.playAtmBeep();
        this.adsActive = false;
        this.syncBankInterest(false);
        this.releasePointerLock();
        this.callbacks.onOpenAtm?.({ id: nearAtm.id, name: nearAtm.name });
        return;
      }

      // Temple Darshan / Mosque Prayer & "Blessed" Buff
      const nearSacred = this.findNearestSacredPlace(14.5);
      if (nearSacred) {
        if (this.sacredBlessCooldown > 0) {
          this.callbacks.onToast({
            text: `${nearSacred.name}: Shanti aur aashirwad pehle se prapt hai.`,
            tone: 'info',
          });
          return;
        }
        this.sacredBlessCooldown = 10;
        this.blessedTimer = this.blessedTotalSec;
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + 12);
        this.playerStamina = Math.min(this.playerMaxStamina, this.playerStamina + 30);

        if (nearSacred.kind === 'mosque') {
          soundEngine.playUiClick();
          this.prayerAnim = {
            kind: 'mosque',
            placeName: nearSacred.name,
            title: 'Noor Masjid · Dua & Salaam',
            subtitle: 'Aman, sukoon aur barkat ki dua (+HP & Stamina Regen)',
            remaining: 3.4,
            duration: 3.4,
          };
          const line = pickHindiLine('sacred_mosque');
          this.speakWithSubtitle('Maulana Tariq Sahab', 'citizen', 501, line.text, line.tts);
          this.callbacks.onToast({ text: 'Noor Masjid · Blessed (45s HP & Stamina Regen)', tone: 'cash' });
        } else if (nearSacred.kind === 'ram_mandir') {
          soundEngine.playTempleBell();
          this.prayerAnim = {
            kind: 'ram_mandir',
            placeName: nearSacred.name,
            title: 'Shree Ram Darshan',
            subtitle: 'Jai Shree Ram! Prabhu Ram ki kripa se aap Blessed ho gaye (+HP & Stamina Regen)',
            remaining: 3.4,
            duration: 3.4,
          };
          const line = pickHindiLine('sacred_ram_mandir');
          this.speakWithSubtitle('Pandit Raghavendra Shastri', 'citizen', 502, line.text, line.tts);
          this.callbacks.onToast({ text: 'Shree Ram Mandir · Blessed (45s HP & Stamina Regen)', tone: 'cash' });
        } else {
          soundEngine.playTempleBell();
          this.prayerAnim = {
            kind: 'krishna_mandir',
            placeName: nearSacred.name,
            title: 'Shree Krishna Darshan',
            subtitle: 'Radhe Radhe! Prabhu Krishna ki kripa se aap Blessed ho gaye (+HP & Stamina Regen)',
            remaining: 3.4,
            duration: 3.4,
          };
          const line = pickHindiLine('sacred_krishna_mandir');
          this.speakWithSubtitle('Pandit Gopalacharya', 'citizen', 503, line.text, line.tts);
          this.callbacks.onToast({ text: 'Shree Krishna Mandir · Blessed (45s HP & Stamina Regen)', tone: 'cash' });
        }
        this.emitHudSnapshot();
        return;
      }

      // Bharat Police Thana No. 4 Duty Desk [E]
      if (this.jailRig) {
        const distThanaDesk = Math.hypot(
          this.playerX - this.jailRig.thanaDeskPos.x,
          this.playerZ - this.jailRig.thanaDeskPos.z,
        );
        if (distThanaDesk < 4.5) {
          soundEngine.playUiClick();
          soundEngine.playPoliceRadioChatter();
          this.adsActive = false;
          if (!this.hasGunLicense) {
            this.licenseRevokedPrompt = {
              active: true,
              starsAtArrest: Math.max(3, this.pendingLicenseRevocation || 3),
              urgentFee: URGENT_THANA_LICENSE_RENEWAL_INR,
              standardFee: GUN_LICENSE_FEE_INR,
            };
            this.releasePointerLock();
            this.speakWithSubtitle(
              'Thana Duty Officer',
              'inspector',
              701,
              'Aapka Arms License active nahi hai! Kya aap yahin Thana Desk par urgent renew karna chahte hain ya DM Office jaakar?',
              'आपका आर्म्स लाइसेंस एक्टिव नहीं है! क्या आप यहीं थाना डेस्क पर अर्जेंट रिन्यू करना चाहते हैं या डीएम ऑफिस जाकर?',
              'high',
            );
            this.emitHudSnapshot();
          } else {
            this.speakWithSubtitle(
              'Thana Duty Officer',
              'inspector',
              701,
              'Jai Hind! Bharat Thana No. 4 Duty Desk par sab control mein hai. Lockup aur patrolling jaari hai.',
              'जय हिंद! भारत थाना नंबर चार ड्यूटी डेस्क पर सब कंट्रोल में है। लॉकअप और पेट्रोलिंग जारी है।',
              'normal',
            );
            this.callbacks.onToast({
              text: 'Thana No. 4 Duty Desk: Aapka Arms License valid hai (FIR Clear)',
              tone: 'info',
            });
          }
          return;
        }
      }

      // District Magistrate & Arms Licensing Office
      const distLicense = Math.hypot(this.playerX - (-92), this.playerZ - 32);
      const distLicenseEntrance = Math.hypot(this.playerX - this.licenseOfficePos.x, this.playerZ - this.licenseOfficePos.z);
      if (distLicense < 16 || distLicenseEntrance < 6.5) {
        soundEngine.playUiClick();
        this.adsActive = false;
        this.speakWithSubtitle(
          'Magistrate Clerk',
          'clerk',
          781,
          'DM Arms Licensing Office mein swagat hai. Niyam aur range test pass karke apna license banwayein.',
          'डीएम आर्म्स लाइसेंसिंग ऑफिस में स्वागत है। नियम और रेंज टेस्ट पास करके अपना लाइसेंस बनवाएँ।',
          'high',
        );
        this.releasePointerLock();
        this.callbacks.onOpenLicenseOffice?.();
        return;
      }
    }

    // Personal Indian Family House Interior Stations (Puja Corner, Bedroom, Wardrobe)
    if (!this.currentVehicle && this.homeRig) {
      if (Math.hypot(this.playerX - this.homeRig.pujaPos.x, this.playerZ - this.homeRig.pujaPos.z) < 3.2) {
        this.prayAtHomePuja();
        return;
      }
      if (Math.hypot(this.playerX - this.homeRig.bedPos.x, this.playerZ - this.homeRig.bedPos.z) < 3.4) {
        this.sleepAtHomeBed();
        return;
      }
      if (Math.hypot(this.playerX - this.homeRig.wardrobePos.x, this.playerZ - this.homeRig.wardrobePos.z) < 3.4) {
        soundEngine.playUiClick();
        this.adsActive = false;
        this.releasePointerLock();
        this.callbacks.onOpenWardrobe?.();
        return;
      }
    }

    const distBank = Math.hypot(this.playerX - this.bankPos.x, this.playerZ - (this.bankPos.z - 8));
    if (!this.currentVehicle && distBank < 18) {
      soundEngine.playUiClick();
      this.adsActive = false;
      this.speakWithSubtitle(
        'Rajeev Malhotra',
        'banker',
        777,
        'Royal Bank Of India mein aapka swagat hai. Police ko rescue mission mein madad chahiye.',
        'रॉयल बैंक ऑफ़ इंडिया में आपका स्वागत है। पुलिस को रेस्क्यू मिशन में मदद चाहिए।',
        'high',
      );
      this.releasePointerLock();
      this.callbacks.onBankPrompt(false);
    }
  }

  public setHouseName(name: string): void {
    const clean = (name || 'Apna Ghar').trim().slice(0, 28) || 'Apna Ghar';
    this.houseName = clean;
    this.hasSavedGame = true;
    this.homeRig?.updateNameplate(clean);
    const homeSign = this.buildingSigns.find((s) => s.id === 'sign-home');
    if (homeSign) {
      homeSign.title = clean;
    }
    soundEngine.playCashPickup();
    this.callbacks.onToast({
      text: `Grah Pravesh Mubarak! Aapka ghar "${clean}" GPS Map par save ho gaya.`,
      tone: 'cash',
    });
    this.saveGameState();
    this.emitHudSnapshot();
  }

  private applyPlayerOutfit(outfit: PlayerOutfitId): void {
    if (!this.playerRig) return;
    const spec = PLAYER_OUTFITS[outfit] ?? PLAYER_OUTFITS.default;
    if (this.playerRig.shirtMat) {
      this.playerRig.shirtMat.color.setHex(spec.shirtHex);
    }
    if (this.playerRig.pantsMat) {
      this.playerRig.pantsMat.color.setHex(spec.pantsHex);
    }
    const isKurta = outfit === 'kurta';
    if (this.playerRig.kurtaHem) this.playerRig.kurtaHem.visible = isKurta;
    if (this.playerRig.kurtaPlacket) this.playerRig.kurtaPlacket.visible = isKurta;
    if (this.playerRig.beltMesh) this.playerRig.beltMesh.visible = !isKurta;
  }

  public setPlayerOutfit(outfit: PlayerOutfitId): void {
    if (!(outfit in PLAYER_OUTFITS)) return;
    this.playerOutfit = outfit;
    this.applyPlayerOutfit(outfit);
    soundEngine.playUiClick();
    this.callbacks.onToast({
      text: `Outfit Changed: ${PLAYER_OUTFITS[outfit].label}`,
      tone: 'info',
    });
    this.saveGameState();
    this.emitHudSnapshot();
  }

  public storeWardrobeWeapon(weaponId: WeaponId): boolean {
    if (weaponId === 'fists' || !this.ownedWeapons.has(weaponId)) return false;
    this.ownedWeapons.delete(weaponId);
    this.wardrobeWeapons.add(weaponId);
    if (this.activeWeapon === weaponId) {
      this.activeWeapon = 'fists';
      this.adsActive = false;
      this.refreshPlayerWeaponMesh();
    }
    soundEngine.playUiClick();
    this.callbacks.onToast({ text: `${WEAPONS[weaponId].shortName} Wardrobe mein store kiya`, tone: 'info' });
    this.saveGameState();
    this.emitHudSnapshot();
    return true;
  }

  public retrieveWardrobeWeapon(weaponId: WeaponId): boolean {
    if (weaponId === 'fists' || !this.wardrobeWeapons.has(weaponId)) return false;
    this.wardrobeWeapons.delete(weaponId);
    this.ownedWeapons.add(weaponId);
    soundEngine.playUiClick();
    this.callbacks.onToast({ text: `${WEAPONS[weaponId].shortName} Wardrobe se nikala`, tone: 'info' });
    this.saveGameState();
    this.emitHudSnapshot();
    return true;
  }

  public storeWardrobeArmor(): boolean {
    if (this.playerArmor <= 0) return false;
    const room = 100 - this.wardrobeArmor;
    if (room <= 0) return false;
    const move = Math.min(room, Math.floor(this.playerArmor));
    if (move <= 0) return false;
    this.playerArmor -= move;
    this.wardrobeArmor += move;
    soundEngine.playUiClick();
    this.callbacks.onToast({ text: `+${move} Armor Locker mein rakha`, tone: 'info' });
    this.saveGameState();
    this.emitHudSnapshot();
    return true;
  }

  public retrieveWardrobeArmor(): boolean {
    if (this.wardrobeArmor <= 0) return false;
    const room = 100 - Math.floor(this.playerArmor);
    if (room <= 0) return false;
    const move = Math.min(room, this.wardrobeArmor);
    this.wardrobeArmor -= move;
    this.playerArmor += move;
    soundEngine.playUiClick();
    this.callbacks.onToast({ text: `+${move} Armor pehen liya`, tone: 'info' });
    this.saveGameState();
    this.emitHudSnapshot();
    return true;
  }

  public storeWardrobeMedkit(): boolean {
    if (this.playerMedkits <= 0 || this.wardrobeMedkits >= MAX_MEDKITS) return false;
    this.playerMedkits -= 1;
    this.wardrobeMedkits += 1;
    soundEngine.playUiClick();
    this.callbacks.onToast({ text: '1 Medkit Wardrobe mein store kiya', tone: 'info' });
    this.saveGameState();
    this.emitHudSnapshot();
    return true;
  }

  public retrieveWardrobeMedkit(): boolean {
    if (this.wardrobeMedkits <= 0 || this.playerMedkits >= MAX_MEDKITS) return false;
    this.wardrobeMedkits -= 1;
    this.playerMedkits += 1;
    soundEngine.playUiClick();
    this.callbacks.onToast({ text: '1 Medkit Wardrobe se liya', tone: 'info' });
    this.saveGameState();
    this.emitHudSnapshot();
    return true;
  }

  public prayAtHomePuja(): void {
    if (this.pujaCooldown > 0) {
      this.callbacks.onToast({ text: 'Puja aashirwad abhi taaza hai — kuch der baad phir karein.', tone: 'info' });
      return;
    }
    this.pujaCooldown = 12;
    this.blessedTimer = this.blessedTotalSec;
    this.playerHp = Math.min(this.playerMaxHp, this.playerHp + 20);
    this.playerStamina = Math.min(this.playerMaxStamina, this.playerStamina + 35);
    soundEngine.playTempleBell();
    this.prayerAnim = {
      kind: 'ram_mandir',
      placeName: `${this.houseName ?? 'Apna Ghar'} · Puja Corner`,
      title: 'Ghar Aarti & Puja',
      subtitle: 'Shubh aashirwad! (+20 HP, Full Blessed Regen)',
      remaining: 3.0,
      duration: 3.0,
    };
    this.callbacks.onToast({ text: 'Home Puja Complete · Blessed (+HP & Stamina Regen)', tone: 'cash' });
    this.saveGameState();
    this.emitHudSnapshot();
  }

  public sleepAtHomeBed(): void {
    if (this.mode !== 'PLAYING' || this.sleepCutscene) return;
    this.startSleepCutscene('HOME_BED');
  }

  public bribePolice(): boolean {
    if (this.wantedLevel === 0) {
      this.callbacks.onToast({ text: 'Abhi koi police case active nahi hai.', tone: 'info' });
      return false;
    }
    if (this.playerCash < BRIBE_PRICE_INR) {
      this.callbacks.onToast({ text: `Police setting ke liye ${formatRs(BRIBE_PRICE_INR)} chahiye`, tone: 'warn' });
      return false;
    }
    this.playerCash -= BRIBE_PRICE_INR;
    this.clearWanted();
    soundEngine.playCashPickup();
    this.callbacks.onToast({ text: `${formatRs(BRIBE_PRICE_INR)} diye — Police case khatam!`, tone: 'info' });
    this.saveGameState();
    this.emitHudSnapshot();
    return true;
  }

  public isStreetBribeAvailable(): boolean {
    if (this.mode !== 'PLAYING' || this.wantedLevel < 1 || this.wantedLevel > 2 || this.playerShotAtPolice) {
      return false;
    }
    return this.npcs.some(
      (n) =>
        !n.dead &&
        n.isPolice &&
        !n.bribeRefused &&
        Math.hypot(n.x - this.playerX, n.z - this.playerZ) < 16,
    );
  }

  public offerStreetBribe(): boolean {
    if (this.wantedLevel < 1 || this.wantedLevel > 2) {
      this.callbacks.onToast({ text: 'Street setting sirf 1–2★ police par kaam karti hai.', tone: 'warn' });
      return false;
    }
    if (this.playerShotAtPolice) {
      this.callbacks.onToast({ text: 'Goli chalane ke baad police setting nahi legi!', tone: 'warn' });
      return false;
    }
    let nearestCop: NpcEntity | null = null;
    let bestD = 16;
    for (const n of this.npcs) {
      if (n.dead || !n.isPolice || n.bribeRefused) continue;
      const d = Math.hypot(n.x - this.playerX, n.z - this.playerZ);
      if (d < bestD) {
        bestD = d;
        nearestCop = n;
      }
    }
    if (!nearestCop) {
      this.callbacks.onToast({ text: 'Koi police officer rishwat ke liye paas nahi hai.', tone: 'warn' });
      return false;
    }
    if (this.playerCash < STREET_BRIBE_INR) {
      this.callbacks.onToast({ text: `Chai-paani ke liye ${formatRs(STREET_BRIBE_INR)} chahiye.`, tone: 'warn' });
      return false;
    }

    this.playerCash -= STREET_BRIBE_INR;
    const successChance = this.wantedLevel === 1 ? 0.58 : 0.45;
    if (Math.random() < successChance) {
      soundEngine.playCashPickup();
      const acceptLine = pickHindiLine('bribe_accept');
      this.speakWithSubtitle(
        nearestCop.name,
        'officer',
        nearestCop.id,
        acceptLine.text,
        acceptLine.tts,
      );
      this.clearWanted();
      this.callbacks.onToast({
        text: `${formatRs(STREET_BRIBE_INR)} Chai-paani accepted — Police case rafa-dafa!`,
        tone: 'cash',
      });
      this.saveGameState();
      this.emitHudSnapshot();
      return true;
    }

    // Backfire: honest officer refuses, flags bribeRefused, and escalates +1★
    nearestCop.bribeRefused = true;
    nearestCop.hostile = true;
    soundEngine.playPoliceWhistle();
    const refuseLine = pickHindiLine('bribe_refuse');
    this.speakWithSubtitle(
      nearestCop.name,
      'officer',
      nearestCop.id,
      refuseLine.text,
      refuseLine.tts,
    );
    this.setWantedLevelSafe(Math.min(3, this.wantedLevel + 1));
    this.callbacks.onToast({
      text: `${nearestCop.name} refused bribe! Wanted escalated (+1★)!`,
      tone: 'warn',
    });
    this.saveGameState();
    this.emitHudSnapshot();
    return false;
  }

  public triggerManualSurrender(): void {
    if (this.mode !== 'PLAYING' || this.wantedLevel < 1) return;
    this.triggerBusted('Aapne police ke saamne haath upar karke surrender kar diya!');
  }

  public setMode(next: GameMode): void {
    if (this.mode === next) return;
    const prevMode = this.mode;
    this.mode = next;
    this.keys.clear();
    this.mouseDownLeft = false;
    this.mouseDragging = false;
    this.hasMousePos = false;
    this.touchMoveX = 0;
    this.touchMoveY = 0;
    this.touchSprint = false;
    this.touchAttackHeld = false;
    this.surrenderHolding = false;
    this.surrenderHoldTimer = 0;
    if (next !== 'PLAYING' && next !== 'JAIL') {
      this.adsActive = false;
      this.releasePointerLock();
    } else if (prevMode === 'PAUSED' || prevMode === 'TITLE') {
      this.requestPointerLock();
    }
    this.syncCanvasCursor();
    if (this.weaponWheelOpen) {
      this.weaponWheelOpen = false;
      this.callbacks.onWeaponWheelChange(false);
    }
    soundEngine.setPaused(
      next !== 'PLAYING' &&
        next !== 'JAIL' &&
        next !== 'COURTROOM' &&
        next !== 'CUSTODY' &&
        next !== 'SLEEP',
    );
    if (
      next === 'PAUSED' ||
      next === 'WASTED' ||
      next === 'BUSTED' ||
      next === 'COURTROOM' ||
      next === 'CUSTODY' ||
      next === 'SLEEP'
    ) {
      soundEngine.setSirenActive(false);
      soundEngine.setChopperActive(false);
      this.saveGameState();
    }
    this.callbacks.onModeChange(next);
    this.emitHudSnapshot();
  }

  public startGame(): void {
    soundEngine.unlock();
    this.setMode(this.jailState ? 'JAIL' : 'PLAYING');
  }

  public updateSettings(next: GameSettings): void {
    this.settings = { ...next, keybinds: { ...next.keybinds } };
    soundEngine.updateSettings(this.settings);
    const shadows = !this.isSoftwareGl && this.settings.shadowsEnabled;
    this.renderer.shadowMap.enabled = shadows;
    this.sunLight.castShadow = shadows;
    this.renderer.shadowMap.needsUpdate = true;
    if (this.scene) {
      this.rebalanceAmbientPopulation();
    }
  }

  private getTargetNpcCap(density: DensityLevel): number {
    switch (density) {
      case 'low':
        return 18;
      case 'medium':
        return 34;
      case 'ultra':
        return 90;
      case 'high':
      default:
        return 58;
    }
  }

  private getTargetTrafficCap(density: DensityLevel): number {
    switch (density) {
      case 'low':
        return 14;
      case 'medium':
        return 26;
      case 'ultra':
        return 68;
      case 'high':
      default:
        return 44;
    }
  }

  private spawnAmbientTrafficVehicle(): void {
    const roll = Math.random();
    const kind: VehicleKind = roll < 0.34 ? 'rickshaw' : roll < 0.62 ? 'bike' : roll < 0.84 ? 'sedan' : 'muscle';
    const colors = [0x991b1b, 0x1e40af, 0xb45309, 0x334155, 0x065f46, 0x7c2d12, 0xf8fafc, 0x475569, 0x0f172a];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const rc = CITY_ROAD_CENTERS[Math.floor(Math.random() * CITY_ROAD_CENTERS.length)];
    const axis: 'x' | 'z' = Math.random() > 0.5 ? 'x' : 'z';
    const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
    let along = (Math.random() - 0.5) * 440;
    const laneCoord = getLeftHandLaneCoord(rc, axis, dir);
    let vx = axis === 'z' ? laneCoord : along;
    let vz = axis === 'z' ? along : laneCoord;
    if (Math.hypot(vx - this.playerX, vz - this.playerZ) < 22) {
      along = along > 0 ? along - 38 : along + 38;
      vx = axis === 'z' ? laneCoord : along;
      vz = axis === 'z' ? along : laneCoord;
    }
    const yaw = axis === 'z' ? (dir === 1 ? Math.PI : 0) : dir === 1 ? -Math.PI / 2 : Math.PI / 2;
    const rig = createVehicleModel(kind, color);
    if (kind === 'bike' && rig.riderRig) {
      rig.riderRig.root.visible = true;
      rig.riderRig.helmetMesh.visible = true;
    }
    const safe = this.resolveCollisions(vx, vz, kind === 'bike' ? 0.72 : kind === 'rickshaw' ? 1.2 : 1.5);
    rig.root.position.set(safe.x, 0, safe.z);
    rig.root.rotation.y = yaw;
    this.scene.add(rig.root);

    const maxHp = kind === 'bike' ? 95 : kind === 'rickshaw' ? 115 : kind === 'muscle' ? 200 : 170;
    const maxSpeed = kind === 'bike' ? 28 : kind === 'rickshaw' ? 18 : kind === 'muscle' ? 25 : 20;
    const cruise = kind === 'bike' ? 8.2 : kind === 'rickshaw' ? 6.5 : 7.5;
    const name =
      kind === 'bike'
        ? 'Indian Street Bike'
        : kind === 'rickshaw'
          ? 'Auto-Rickshaw'
          : kind === 'muscle'
            ? 'Desi GT Coupe'
            : 'Premier Sedan';

    this.vehicles.push({
      id: this.nextEntityId++,
      name,
      kind,
      rig,
      x: safe.x,
      z: safe.z,
      yaw,
      speed: cruise,
      maxSpeed,
      massFactor: kind === 'bike' ? 0.58 : kind === 'rickshaw' ? 0.85 : kind === 'muscle' ? 1.15 : 1.0,
      hp: maxHp,
      maxHp,
      destroyed: false,
      smokeTimer: 0,
      wreckTimer: 0,
      hitCooldowns: new Map(),
      occupiedByPlayer: false,
      aiEnabled: true,
      aiDisabled: false,
      hasAiRider: kind === 'bike',
      isDynamicTraffic: true,
      aiHornCooldown: 1 + Math.random() * 4,
      origX: safe.x,
      origZ: safe.z,
      origYaw: yaw,
      origSpeed: cruise,
      origWasStarter: false,
      origColor: color,
      origAxis: axis,
      origDir: dir,
      origRoadCenter: rc,
      policeState: 'PATROL',
      maxOfficers: 1,
      spawnedOfficerIds: [],
      dismountCooldown: 0,
      stopCooldown: 0,
      patrolAxis: axis,
      patrolDir: dir,
      patrolRoadCenter: rc,
    });
  }

  private rebalanceAmbientPopulation(): void {
    if (!this.scene) return;
    const npcCap = this.getTargetNpcCap(this.settings.npcDensity);
    const ambientNpcs = this.npcs.filter(
      (n) => !n.dead && !n.isPolice && !n.landmarkKind && !n.isMissionEnemy,
    );
    let ambientCount = ambientNpcs.length;
    if (ambientCount > npcCap) {
      let toRemoveCount = ambientCount - npcCap;
      const removedIds = new Set<number>();
      for (const n of ambientNpcs) {
        if (toRemoveCount <= 0) break;
        if (n.hostile) continue;
        if (Math.hypot(n.x - this.playerX, n.z - this.playerZ) < 18) continue;
        this.scene.remove(n.rig.root);
        removedIds.add(n.id);
        toRemoveCount--;
      }
      if (removedIds.size > 0) {
        this.npcs = this.npcs.filter((n) => !removedIds.has(n.id));
      }
    } else {
      while (ambientCount < npcCap) {
        this.spawnNpc(Math.random() < 0.2);
        ambientCount++;
      }
    }

    const trafficCap = this.getTargetTrafficCap(this.settings.trafficDensity);
    const ambientVehicles = this.vehicles.filter(
      (v) => !v.destroyed && !v.isStarterParked && !v.isTacticalReinforcement && !v.occupiedByPlayer && !v.playerClaimed,
    );
    let trafficCount = ambientVehicles.length;
    if (trafficCount > trafficCap) {
      let toDrop = trafficCount - trafficCap;
      const dropIds = new Set<number>();
      for (let i = ambientVehicles.length - 1; i >= 0 && toDrop > 0; i--) {
        const v = ambientVehicles[i];
        if (!v.isDynamicTraffic) continue;
        if (Math.hypot(v.x - this.playerX, v.z - this.playerZ) < 22) continue;
        this.scene.remove(v.rig.root);
        dropIds.add(v.id);
        toDrop--;
      }
      if (dropIds.size > 0) {
        this.vehicles = this.vehicles.filter((v) => !dropIds.has(v.id));
      }
    } else {
      let safety = 0;
      while (trafficCount < trafficCap && safety < 100) {
        safety++;
        this.spawnAmbientTrafficVehicle();
        trafficCount++;
      }
    }
  }

  public equipWeapon(id: WeaponId): void {
    if (!this.ownedWeapons.has(id)) return;
    if (this.activeWeapon === id) return;
    this.activeWeapon = id;
    if (id === 'fists') {
      this.adsActive = false;
      this.brandishExposeTimer = 0;
    }
    this.refreshPlayerWeaponMesh();
    soundEngine.playUiClick();
    this.saveGameState();
    this.emitHudSnapshot();
  }

  public buyWeaponOrAmmo(id: WeaponId): boolean {
    const spec = WEAPONS[id];
    if (id === 'fists') {
      this.equipWeapon('fists');
      return true;
    }

    if (!this.ownedWeapons.has(id)) {
      if (this.playerCash < spec.price) {
        this.callbacks.onToast({ text: `Need ${formatRs(spec.price)} for ${spec.shortName}`, tone: 'warn' });
        return false;
      }
      this.playerCash -= spec.price;
      this.ownedWeapons.add(id);
      this.ammo[id] = Math.min(spec.maxAmmo, this.ammo[id] + spec.ammoPackSize);
      this.activeWeapon = id;
      this.refreshPlayerWeaponMesh();
      soundEngine.playCashPickup();
      this.callbacks.onToast({ text: `Purchased ${spec.name}`, tone: 'info' });
      this.saveGameState();
      this.emitHudSnapshot();
      return true;
    } else {
      if (this.ammo[id] >= spec.maxAmmo) {
        this.callbacks.onToast({ text: `${spec.shortName} ammo is already full`, tone: 'info' });
        return false;
      }
      if (this.playerCash < spec.ammoPrice) {
        this.callbacks.onToast({ text: `Need ${formatRs(spec.ammoPrice)} for ammo`, tone: 'warn' });
        return false;
      }
      this.playerCash -= spec.ammoPrice;
      this.ammo[id] = Math.min(spec.maxAmmo, this.ammo[id] + spec.ammoPackSize);
      soundEngine.playCashPickup();
      this.callbacks.onToast({ text: `+${spec.ammoPackSize} rounds for ${spec.shortName}`, tone: 'info' });
      this.saveGameState();
      this.emitHudSnapshot();
      return true;
    }
  }

  public buyArmor(): boolean {
    if (this.playerArmor >= 100) {
      this.callbacks.onToast({ text: 'Tactical Armor is already full', tone: 'info' });
      return false;
    }
    if (this.playerCash < ARMOR_PRICE_INR) {
      this.callbacks.onToast({ text: `Need ${formatRs(ARMOR_PRICE_INR)} for Tactical Vest`, tone: 'warn' });
      return false;
    }
    this.playerCash -= ARMOR_PRICE_INR;
    this.playerArmor = 100;
    soundEngine.playCashPickup();
    this.callbacks.onToast({ text: 'Equipped Tactical Vest (+100 Armor)', tone: 'info' });
    this.saveGameState();
    this.emitHudSnapshot();
    return true;
  }

  public buyMedkit(): boolean {
    if (this.playerMedkits >= MAX_MEDKITS) {
      this.callbacks.onToast({ text: `Medkit pouch full (Max ${MAX_MEDKITS})`, tone: 'info' });
      return false;
    }
    if (this.playerCash < MEDKIT_PRICE_INR) {
      this.callbacks.onToast({ text: `Need ${formatRs(MEDKIT_PRICE_INR)} for Medkit`, tone: 'warn' });
      return false;
    }
    this.playerCash -= MEDKIT_PRICE_INR;
    this.playerMedkits++;
    soundEngine.playCashPickup();
    this.callbacks.onToast({ text: `Purchased Medkit (${this.playerMedkits}/${MAX_MEDKITS})`, tone: 'info' });
    this.saveGameState();
    this.emitHudSnapshot();
    return true;
  }

  public useMedkit(): boolean {
    if (this.playerMedkits <= 0) {
      this.callbacks.onToast({ text: 'No Medkits! Buy one at the Armory.', tone: 'warn' });
      return false;
    }
    if (this.playerHp >= this.playerMaxHp) {
      this.callbacks.onToast({ text: 'Health is already full.', tone: 'info' });
      return false;
    }
    this.playerMedkits--;
    this.playerHp = Math.min(this.playerMaxHp, this.playerHp + MEDKIT_HEAL_AMOUNT);
    soundEngine.playMedkitHeal();
    this.callbacks.onToast({ text: `Used Medkit (+${MEDKIT_HEAL_AMOUNT} HP)`, tone: 'cash' });
    this.saveGameState();
    this.emitHudSnapshot();
    return true;
  }

  private spawnCheatVehicle(kind: VehicleKind, name: string, color?: number): void {
    const fwdX = -Math.sin(this.playerYaw);
    const fwdZ = -Math.cos(this.playerYaw);
    const spawnDist = kind === 'chopper' ? 6.2 : 4.5;
    const rawX = this.playerX + fwdX * spawnDist;
    const rawZ = this.playerZ + fwdZ * spawnDist;
    const pos = this.resolveCollisions(rawX, rawZ, kind === 'chopper' ? 2.2 : 1.55);
    const yaw = normalizeAngle(this.playerYaw + Math.PI / 2);
    const rig = createVehicleModel(kind, color);
    if (kind === 'bike' && rig.riderRig) {
      rig.riderRig.root.visible = false;
    }
    rig.root.position.set(pos.x, 0, pos.z);
    rig.root.rotation.y = yaw;
    this.scene.add(rig.root);

    const maxHp = kind === 'chopper' ? 320 : kind === 'police' ? 220 : kind === 'bike' ? 95 : kind === 'rickshaw' ? 115 : 185;
    const maxSpeed = kind === 'chopper' ? 32 : kind === 'bike' ? 28 : kind === 'police' ? 24 : kind === 'rickshaw' ? 18 : 22;
    const id = this.nextEntityId++;
    this.vehicleFuelMap.set(id, 100);
    this.vehicles.push({
      id,
      name,
      kind,
      rig,
      x: pos.x,
      y: 0,
      z: pos.z,
      yaw,
      speed: 0,
      maxSpeed,
      massFactor: kind === 'chopper' ? 1.5 : kind === 'police' ? 1.25 : kind === 'bike' ? 0.58 : kind === 'rickshaw' ? 0.85 : 1.05,
      hp: maxHp,
      maxHp,
      destroyed: false,
      smokeTimer: 0,
      wreckTimer: 0,
      hitCooldowns: new Map(),
      occupiedByPlayer: false,
      aiEnabled: false,
      aiDisabled: true,
      isStarterParked: false,
      playerClaimed: true,
      origX: pos.x,
      origZ: pos.z,
      origYaw: yaw,
      origSpeed: 0,
      origWasStarter: false,
      origColor: color,
      origAxis: 'z',
      origDir: -1,
      origRoadCenter: 0,
      policeState: 'PATROL',
      maxOfficers: 1,
      spawnedOfficerIds: [],
      dismountCooldown: 0,
      stopCooldown: 0,
      patrolAxis: 'z',
      patrolDir: -1,
      patrolRoadCenter: 0,
    });
  }

  public applyCheat(rawCode: string): { ok: boolean; message: string } {
    const trimmed = rawCode.trim().toUpperCase();
    const numericAliases: Record<string, string> = {
      '8000': 'COPTER',
      '2000': 'AUTO',
      '3000': 'BIKE',
      '1000': 'CAR',
      '100': 'POLICE',
      '9110': 'PAISABARSAO',
      '7000': 'SHASTRA100',
      '0000': 'NOCHALLAN',
      '5555': 'VIPPASS',
    };
    const code = numericAliases[trimmed] ?? trimmed;
    if (code === 'PAISABARSAO') {
      this.playerCash += 2100000;
      this.playerHp = this.playerMaxHp;
      this.playerArmor = 100;
      this.callbacks.onToast({ text: `CHEAT: +${formatRs(2100000)}, Full HP & Armor`, tone: 'cheat' });
      soundEngine.playCashPickup();
      this.saveGameState();
      this.emitHudSnapshot();
      return { ok: true, message: `PAISABARSAO activated: +${formatRs(2100000)}, Full Health & Armor.` };
    }
    if (code === 'SHASTRA100') {
      for (const w of WEAPON_ORDER) {
        this.ownedWeapons.add(w);
        if (w !== 'fists') {
          this.ammo[w] = WEAPONS[w].maxAmmo;
        }
      }
      this.activeWeapon = 'rifle';
      this.refreshPlayerWeaponMesh();
      this.callbacks.onToast({ text: 'CHEAT: Full Armory Unlocked', tone: 'cheat' });
      soundEngine.playCashPickup();
      this.saveGameState();
      this.emitHudSnapshot();
      return { ok: true, message: 'SHASTRA100 activated: Full armory & ammunition unlocked.' };
    }
    if (code === 'VIPPASS') {
      this.noPoliceCheat = !this.noPoliceCheat;
      if (this.noPoliceCheat) {
        this.clearWanted();
      }
      this.callbacks.onToast({
        text: this.noPoliceCheat ? 'CHEAT: VIPPASS (Never Wanted ON)' : 'CHEAT: VIPPASS (Never Wanted OFF)',
        tone: 'cheat',
      });
      this.emitHudSnapshot();
      return {
        ok: true,
        message: this.noPoliceCheat ? 'VIPPASS activated: Police immunity enabled.' : 'VIPPASS disabled.',
      };
    }
    if (code === 'NOCHALLAN') {
      this.clearWanted();
      this.callbacks.onToast({ text: 'CHEAT: Wanted Level Cleared', tone: 'cheat' });
      this.emitHudSnapshot();
      return { ok: true, message: 'NOCHALLAN activated: Wanted stars cleared.' };
    }
    if (code === 'COPTER' || code === 'CHOPPER') {
      this.spawnCheatVehicle('chopper', 'Garuda Police Chopper');
      soundEngine.playCashPickup();
      this.callbacks.onToast({ text: 'CHEAT: Garuda Chopper spawned nearby!', tone: 'cheat' });
      this.emitHudSnapshot();
      return { ok: true, message: `${code} activated: Garuda Chopper spawned in front of you.` };
    }
    if (code === 'AUTO') {
      this.spawnCheatVehicle('rickshaw', 'Turbo Auto-Rickshaw');
      soundEngine.playCarHorn('rickshaw', 0.85);
      this.callbacks.onToast({ text: 'CHEAT: Auto-Rickshaw spawned!', tone: 'cheat' });
      this.emitHudSnapshot();
      return { ok: true, message: 'AUTO activated: Yellow/Green Auto-Rickshaw spawned ahead.' };
    }
    if (code === 'BIKE') {
      this.hasHelmet = true;
      this.helmetOn = true;
      this.playerRig.helmetMesh.visible = true;
      this.spawnCheatVehicle('bike', 'Toofan 180 Sports Bike', 0xdc2626);
      soundEngine.playCarHorn('bike', 0.85);
      this.callbacks.onToast({ text: 'CHEAT: Sports Bike + ISI Helmet spawned!', tone: 'cheat' });
      this.saveGameState();
      this.emitHudSnapshot();
      return { ok: true, message: 'BIKE activated: Sports motorcycle + ISI Helmet equipped.' };
    }
    if (code === 'CAR' || code === 'SEDAN') {
      this.spawnCheatVehicle('sedan', 'Premier Luxury Sedan', 0x1e40af);
      soundEngine.playCarHorn('sedan', 0.85);
      this.callbacks.onToast({ text: 'CHEAT: Premier Sedan spawned!', tone: 'cheat' });
      this.emitHudSnapshot();
      return { ok: true, message: `${code} activated: Civilian Sedan spawned nearby.` };
    }
    if (code === 'POLICE' || code === 'THANA') {
      this.spawnCheatVehicle('police', 'Bharat Police Vajra SUV');
      soundEngine.playCarHorn('police', 0.85);
      this.callbacks.onToast({ text: 'CHEAT: Police Patrol Cruiser spawned!', tone: 'cheat' });
      this.emitHudSnapshot();
      return { ok: true, message: `${code} activated: Bharat Police patrol SUV spawned nearby.` };
    }
    return {
      ok: false,
      message: 'Unknown code. Try COPTER, AUTO, BIKE, CAR, POLICE, PAISABARSAO, SHASTRA100, NOCHALLAN, VIPPASS.',
    };
  }

  private performPartialWorldCleanup(restoreHijackedVehicles: boolean): void {
    // Partial Reset Only: preserves Royal Bank balances/FDs, Day/Time, kills, licenses & distant NPCs.
    this.playerHp = this.playerMaxHp;
    this.playerStamina = this.playerMaxStamina;
    this.staminaExhausted = false;
    this.playerY = 0;
    this.playerVy = 0;
    this.surrenderHolding = false;
    this.surrenderHoldTimer = 0;
    this.corneredArrestTimer = 0;

    if (this.currentVehicle) {
      this.currentVehicle.occupiedByPlayer = false;
      this.currentVehicle.speed = 0;
      this.currentVehicle.rig.root.rotation.z = 0;
      this.currentVehicle = null;
    }
    this.playerRig.leftArm.rotation.x = 0;
    this.playerRig.rightArm.rotation.x = 0;
    this.playerRig.leftLeg.rotation.x = 0;
    this.playerRig.rightLeg.rotation.x = 0;
    this.playerRig.root.rotation.z = 0;
    this.playerRig.helmetMesh.visible = this.hasHelmet && this.helmetOn;
    this.playerRig.root.visible = !this.firstPerson;
    this.refreshPlayerWeaponMesh();

    this.clearWanted();

    for (const ex of this.explosions) {
      this.scene.remove(ex.fireball);
      this.scene.remove(ex.shockwave);
    }
    this.explosions = [];
    for (const sp of this.smokePuffs) {
      this.scene.remove(sp.mesh);
    }
    this.smokePuffs = [];

    const keptVehicles: VehicleEntity[] = [];
    for (const v of this.vehicles) {
      if (v.isTacticalReinforcement) {
        this.scene.remove(v.rig.root);
        continue;
      }
      if (restoreHijackedVehicles && (v.playerClaimed || v.aiDisabled)) {
        if (v.destroyed) {
          this.scene.remove(v.rig.root);
          v.rig = createVehicleModel(v.kind, v.origColor);
          this.scene.add(v.rig.root);
        }
        v.destroyed = false;
        v.hp = v.maxHp;
        v.smokeTimer = 0;
        v.wreckTimer = 0;
        v.x = v.origX;
        v.z = v.origZ;
        v.yaw = v.origYaw;
        v.speed = v.origSpeed;
        v.patrolAxis = v.origAxis;
        v.patrolDir = v.origDir;
        v.patrolRoadCenter = v.origRoadCenter;
        v.occupiedByPlayer = false;
        v.playerClaimed = false;
        v.aiDisabled = false;
        v.isStarterParked = v.origWasStarter;
        v.aiEnabled = !v.origWasStarter;
        v.policeState = 'PATROL';
        v.spawnedOfficerIds = [];
        if (v.kind === 'bike' && v.rig.riderRig) {
          const showAiRider = !v.origWasStarter;
          v.hasAiRider = showAiRider;
          v.rig.riderRig.root.visible = showAiRider;
          v.rig.riderRig.helmetMesh.visible = true;
        }
        v.rig.root.position.set(v.x, 0, v.z);
        v.rig.root.rotation.set(0, v.yaw, 0);
        keptVehicles.push(v);
        continue;
      }
      if (v.destroyed) {
        // Clear blasted wrecks off the roads
        this.scene.remove(v.rig.root);
        continue;
      }
      keptVehicles.push(v);
    }
    this.vehicles = keptVehicles;
  }

  private triggerBusted(reason: string): void {
    if (
      this.bustedLock ||
      this.wastedLock ||
      this.mode === 'COURTROOM' ||
      this.mode === 'JAIL' ||
      this.mode === 'CUSTODY'
    ) {
      return;
    }
    this.bustedLock = true;
    this.bustedReason = reason;
    this.bustedConfiscated = [];
    this.licenseRevokedPrompt = null;

    const starsAtArrest = clamp(Math.max(1, this.wantedLevel), 1, 5);
    if (this.hasGunLicense && starsAtArrest >= 3) {
      this.pendingLicenseRevocation = starsAtArrest;
    } else {
      this.pendingLicenseRevocation = 0;
    }

    const hadSwatOrArmyKills = this.swatKilledCount > 0 || this.commandoKilledCount > 0;
    const totalFatalities =
      this.civilianKillsInSpree +
      this.policeKilledCount +
      this.swatKilledCount +
      this.commandoKilledCount;
    const hasFatalCharge = totalFatalities > 0;

    const charges: string[] = [];
    if (hadSwatOrArmyKills) {
      charges.push('SWAT / Army jawan par ghatak hamla — Section 103 & Section 121 BNS [IPC 302 / 353]');
    }
    if (this.policeKilledCount > 0) {
      charges.push('On-duty Police Officer ki hatya — Section 103 & Section 121 BNS [IPC 302 / 353]');
    } else if (this.playerShotAtPolice) {
      charges.push('Police par hamla / Sarkari kaam mein badha — Section 121 BNS [IPC 353 / 332]');
    }
    if (this.civilianKillsInSpree > 0) {
      charges.push('Hatya / Aam nagrik ki jaan lena — Section 103 BNS [IPC 302]');
    }
    if (this.crimeCivilianAssaults > 0) {
      charges.push('Swechha se chot pahunchana (Assault) — Section 115 BNS [IPC 323]');
    }
    if (this.crimeStolePoliceCar || this.crimeVehicleTheftCount > 0) {
      charges.push('Gaadi / Sarkari Vahan Chori — Section 303 BNS [IPC 379]');
    }
    if (
      this.crimeRecklessDriving ||
      this.crimeTrafficViolations > 0 ||
      this.redLightViolations > 0 ||
      this.trafficFineStrikes > 0
    ) {
      charges.push('Rash Driving / Public Endangerment — Section 281 BNS [IPC 279]');
    }
    if (this.policeVehiclesDestroyed > 0) {
      charges.push('Sarkari Vahan ko nuksan — PDPP Act & Section 324 BNS');
    }
    if (this.crimeUnlicensedWeapon || (!this.hasGunLicense && this.ownedWeapons.size > 1)) {
      charges.push('Bina Valid Arms License hathiyar rakhna — Arms Act Sec 25');
    }
    if (charges.length === 0) {
      charges.push('Police nirdeshon ka ullanghan — Section 221 BNS [IPC 188]');
    }

    // Perform partial world cleanup before custody/courtroom entry (preserves Bank, Time & parked cars)
    this.performPartialWorldCleanup(false);

    if (!this.hasGunLicense || starsAtArrest >= 3 || hasFatalCharge) {
      const lost: string[] = [];
      for (const wid of WEAPON_ORDER) {
        if (wid === 'fists') continue;
        if (this.ownedWeapons.has(wid)) {
          lost.push(WEAPONS[wid].shortName);
          this.ammo[wid] = 0;
        }
      }
      this.bustedConfiscated = lost;
      if (!this.hasGunLicense) {
        this.ownedWeapons = new Set(['fists']);
        this.activeWeapon = 'fists';
        this.refreshPlayerWeaponMesh();
      }
    }

    soundEngine.playPoliceWhistle();

    if (!this.courtroomStage) {
      this.setMode('BUSTED');
      return;
    }

    let verdictKind: CourtroomVerdictKind = 'BAILABLE';
    let bailAmount = starsAtArrest === 1 ? COURT_BAIL_FEE_INR : 5000;
    let lawyerFee = LAWYER_FEE_1_2_INR;
    let victimCompensation = 0;
    let jailDays = 1;
    let verdictHeadline =
      'ZAMANAT MANZOOR (Bailable Offense under BNS — Court Warning & Standard Bail)';

    // Strict severity scaling: taking a human life (Section 103 BNS) is NEVER minor or routinely bailable
    const interimBailEligible =
      hasFatalCharge &&
      !hadSwatOrArmyKills &&
      totalFatalities <= 2 &&
      this.probationDaysLeft <= 0;

    const interimBailBreakdown = interimBailEligible
      ? {
          heavyBond: 75000 * totalFatalities,
          seniorAdvocateFee: 40000,
          victimCompensation: 50000 * totalFatalities,
          total: 75000 * totalFatalities + 40000 + 50000 * totalFatalities,
        }
      : undefined;

    if (hasFatalCharge) {
      verdictKind = 'NO_BAIL';
      bailAmount = 0;
      lawyerFee = 0;
      victimCompensation = 0;
      jailDays = clamp(
        2 + totalFatalities + (starsAtArrest >= 4 ? 1 : 0) + (this.probationDaysLeft > 0 ? 1 : 0),
        3,
        5,
      );
      verdictHeadline =
        'ZAMANAT KHARIJ! Kisi ki jaan lena koi mamuli baat nahi hai — Section 103 BNS [IPC 302] ek gambhir non-bailable apradh hai!';
    } else if (starsAtArrest >= 4 || hadSwatOrArmyKills) {
      verdictKind = 'NO_BAIL';
      bailAmount = 0;
      lawyerFee = 0;
      jailDays = 3;
      verdictHeadline = 'ZAMANAT KHARIJ! SEEDHA JAIL (Non-Bailable 4–5★ Offense under BNS)';
    } else if (starsAtArrest === 3) {
      verdictKind = 'HIGH_BAIL';
      bailAmount = HIGH_BAIL_3_STAR_INR;
      lawyerFee = LAWYER_FEE_3_INR;
      jailDays = 2;
      verdictHeadline = 'BHARI ZAMANAT YA JUDICIAL CUSTODY (Section 121 / 303 BNS)';
    }

    const primaryCharge = charges[0];
    const secondaryCharge = charges[1] ?? 'Lok-shanti bhang karne ka aarop (BNS)';
    const bailWords =
      bailAmount === COURT_BAIL_FEE_INR
        ? 'दो हज़ार पाँच सौ रुपये'
        : bailAmount === 5000
          ? 'पांच हज़ार रुपये'
          : 'अठारह हज़ार रुपये';
    const lawyerWords =
      lawyerFee === LAWYER_FEE_1_2_INR ? 'एक हज़ार पाँच सौ रुपये' : 'तीन हज़ार रुपये';
    const jailDayWords =
      jailDays === 1
        ? 'एक दिन'
        : jailDays === 2
          ? 'दो दिन'
          : jailDays === 3
            ? 'तीन दिन'
            : jailDays === 4
              ? 'चार दिन'
              : 'पांच दिन';

    const openLine = pickHindiLine('judge_open', { stars: starsAtArrest });
    const chargeLine = pickHindiLine('inspector_charge', {
      primary: primaryCharge,
      secondary: secondaryCharge,
    });
    const vakilLine = pickHindiLine(
      hasFatalCharge || verdictKind === 'NO_BAIL'
        ? 'vakil_serious'
        : verdictKind === 'BAILABLE'
          ? 'vakil_bailable'
          : 'vakil_high_bail',
    );
    const rebuttalLine = pickHindiLine(
      hasFatalCharge
        ? 'inspector_rebuttal_fatal'
        : verdictKind === 'NO_BAIL'
          ? 'inspector_rebuttal_serious'
          : 'inspector_rebuttal_normal',
      { fatalities: totalFatalities },
    );
    const orderLine = pickHindiLine(
      hasFatalCharge
        ? 'judge_order_fatal'
        : verdictKind === 'BAILABLE'
          ? 'judge_order_bail'
          : verdictKind === 'HIGH_BAIL'
            ? 'judge_order_high_bail'
            : 'judge_order_nobail',
      {
        bailRs: formatRs(bailAmount),
        lawyerRs: formatRs(lawyerFee),
        bailWords,
        lawyerWords,
        jailDays,
        jailDayWords,
        interimNote: interimBailEligible
          ? ' (Agar aap Senior Advocate rakhkar aatmaraksha sabit karna chahein to neeche sakht sharton par Conditional Interim Bail ka vikalp dekh sakte hain.)'
          : '',
      },
    );

    const dialogueTurns: CourtroomDialogueTurn[] = [
      {
        speakerRole: 'judge',
        speakerName: 'Hon. Judge S.K. Deshmukh',
        title: 'District & Sessions Judge',
        text: openLine.text,
        tts: openLine.tts,
      },
      {
        speakerRole: 'inspector',
        speakerName: 'Inspector Vijay Rathore',
        title: 'Arresting Officer · Bharat Police',
        text: chargeLine.text,
        tts: chargeLine.tts,
      },
      {
        speakerRole: 'lawyer',
        speakerName: 'Adv. Meera Sharma',
        title: 'Defense Vakil',
        text: vakilLine.text,
        tts: vakilLine.tts,
      },
      {
        speakerRole: 'inspector',
        speakerName: 'Inspector Vijay Rathore',
        title: 'Prosecution Rebuttal',
        text: rebuttalLine.text,
        tts: rebuttalLine.tts,
      },
      {
        speakerRole: 'judge',
        speakerName: 'Hon. Judge S.K. Deshmukh',
        title: 'Final Court Order',
        text: orderLine.text,
        tts: orderLine.tts,
      },
    ];

    this.courtroomState = {
      starsAtArrest,
      arrestReason: reason,
      charges,
      confiscated: this.bustedConfiscated,
      hasFatalCharge,
      fatalitiesCount: totalFatalities,
      verdictKind,
      verdictHeadline,
      bailAmount,
      lawyerFee,
      victimCompensation,
      totalDue: bailAmount + lawyerFee + victimCompensation,
      jailDays,
      interimBailEligible,
      interimBailApplied: false,
      interimBailBreakdown,
      dialogueIndex: 0,
      dialogueTurns,
      argumentsFinished: false,
    };
    this.courtDialogueTimer = 0;

    // Launch skippable Thana Lockup -> Police Van to Court cutscene
    this.startCustodyCutscene('THANA_LOCKUP');
  }

  private ensurePrisonerVan(x: number, z: number, yaw: number): void {
    if (!this.prisonerVan) {
      this.prisonerVan = createPrisonerVan();
      this.scene.add(this.prisonerVan.root);
    }
    this.prisonerVan.root.visible = true;
    this.prisonerVan.root.position.set(x, 0, z);
    this.prisonerVan.root.rotation.set(0, yaw, 0);
  }

  private removePrisonerVan(): void {
    if (this.prisonerVan) {
      this.scene.remove(this.prisonerVan.root);
      this.prisonerVan = null;
    }
  }

  private startCustodyCutscene(phase: CustodyPhase): void {
    soundEngine.stopPoliceVoice();
    this.adsActive = false;
    this.npcSubtitle = null;
    this.randomizeThanaPrisoners(false);

    if (phase === 'THANA_LOCKUP') {
      const cell = this.jailRig?.thanaLockupCellPos ?? new THREE.Vector3(-140.8, 0.28, 161.4);
      this.playerX = cell.x;
      this.playerY = cell.y;
      this.playerZ = cell.z;
      this.playerYaw = Math.PI;
      this.playerRig.helmetMesh.visible = false;
      this.playerRig.root.visible = true;
      this.playerRig.root.position.set(cell.x, cell.y, cell.z);
      this.playerRig.root.rotation.set(0, Math.PI, 0);
      if (this.weaponMesh) this.weaponMesh.visible = false;
      if (this.fpWeaponGroup) this.fpWeaponGroup.visible = false;
      this.resetThanaInspectorPose();
      this.ensurePrisonerVan(-150, 179.5, -Math.PI / 2);
      soundEngine.playJailDoorClang();
      soundEngine.playPoliceRadioChatter();

      const line =
        'Thana No. 4 Lockup mein aa gaye ho! Inspector Vijay aapki FIR file check kar rahe hain — ab Police Van mein baithkar District Court chalo.';
      const tts =
        'थाना नंबर चार लॉकअप में आ गए हो! इंस्पेक्टर विजय आपकी एफआईआर फाइल चेक कर रहे हैं — अब पुलिस वैन में बैठकर डिस्ट्रिक्ट कोर्ट चलो।';
      this.custodyCutscene = {
        phase,
        timer: 0,
        duration: 5.2,
        stepIndex: 1,
        title: 'BHARAT POLICE THANA NO. 4 · LOCKUP',
        subtitle: line,
        stepLabel: 'Step 1 of 4 · Inspector Arriving at Lockup Cell',
        startX: cell.x,
        startZ: cell.z,
        endX: cell.x,
        endZ: cell.z,
      };
      this.setMode('CUSTODY');
      soundEngine.speakNpcLine('inspector', 704, tts, 'high');
    } else if (phase === 'VAN_TO_COURT') {
      this.resetThanaInspectorPose();
      this.playerRig.root.visible = false;
      this.ensurePrisonerVan(-150, 180, -Math.PI / 2);
      soundEngine.playJailDoorClang();
      soundEngine.playPoliceRadioChatter();

      const line =
        'Police Van District Court ki taraf rawana ho gayi hai. Kathgare mein Judge sahab ke saamne apna paksh rakhna.';
      const tts =
        'पुलिस वैन डिस्ट्रिक्ट कोर्ट की तरफ रवाना हो गई है। कठघरे में जज साहब के सामने अपना पक्ष रखना।';
      this.custodyCutscene = {
        phase,
        timer: 0,
        duration: 4.6,
        stepIndex: 2,
        title: 'PRISONER VAN · ESCORT TO DISTRICT COURT',
        subtitle: line,
        stepLabel: 'Step 2 of 4 · Barred Police Van Transit → District Court',
        startX: -150,
        startZ: 180,
        endX: -90,
        endZ: 108,
      };
      this.setMode('CUSTODY');
      soundEngine.speakNpcLine('inspector', 705, tts, 'high');
    } else if (phase === 'VAN_TO_THANA_RELEASE') {
      this.playerRig.root.visible = false;
      this.ensurePrisonerVan(-90, 108, 0);
      soundEngine.playPoliceRadioChatter();

      const line =
        'Bail manzoor ho gayi hai! Police Van aapko wapas Bharat Police Thana No. 4 ke gate par chhodne ja rahi hai.';
      const tts =
        'बेल मंजूर हो गई है! पुलिस वैन आपको वापस भारत पुलिस थाना नंबर चार के गेट पर छोड़ने जा रही है।';
      this.custodyCutscene = {
        phase,
        timer: 0,
        duration: 4.0,
        stepIndex: 4,
        title: 'PRISONER VAN · RETURN TO THANA FOR RELEASE',
        subtitle: line,
        stepLabel: 'Step 4 of 4 · Escort Van → Bharat Thana No. 4 Release Gate',
        startX: -90,
        startZ: 108,
        endX: -150,
        endZ: 178,
      };
      this.setMode('CUSTODY');
      soundEngine.speakNpcLine('officer', 706, tts, 'high');
    } else {
      // VAN_TO_JAIL
      this.playerRig.root.visible = false;
      this.ensurePrisonerVan(-90, 108, 0);
      soundEngine.playPoliceWhistle();
      soundEngine.playPoliceRadioChatter();

      const line =
        'Court ke aadesh se Police Van aapko seedha Bharat Central Jail le ja rahi hai!';
      const tts =
        'कोर्ट के आदेश से पुलिस वैन आपको सीधा भारत सेंट्रल जेल ले जा रही है!';
      this.custodyCutscene = {
        phase,
        timer: 0,
        duration: 4.6,
        stepIndex: 4,
        title: 'PRISONER VAN · TRANSFER TO BHARAT CENTRAL JAIL',
        subtitle: line,
        stepLabel: 'Step 4 of 4 · Heavy Escort Van → Bharat Central Jail Compound',
        startX: -90,
        startZ: 108,
        endX: -150,
        endZ: 152,
      };
      this.setMode('CUSTODY');
      soundEngine.speakNpcLine('inspector', 707, tts, 'high');
    }
  }

  private resetThanaInspectorPose(): void {
    const insp = this.jailRig?.thanaInspectorActor;
    if (!insp) return;
    insp.x = insp.baseX;
    insp.z = insp.baseZ;
    insp.yaw = Math.PI;
    insp.rig.root.position.set(insp.baseX, 0.28, insp.baseZ);
    insp.rig.root.rotation.set(0, Math.PI, 0);
    insp.rig.leftLeg.rotation.x = 0;
    insp.rig.rightLeg.rotation.x = 0;
    insp.rig.leftArm.rotation.x = 0;
    insp.rig.rightArm.rotation.x = 0;
  }

  public skipCustodyCutscene(): void {
    const cc = this.custodyCutscene;
    if (!cc || this.mode !== 'CUSTODY') return;
    soundEngine.stopPoliceVoice();
    this.resetThanaInspectorPose();
    if (cc.phase === 'THANA_LOCKUP' || cc.phase === 'VAN_TO_COURT') {
      this.enterCourtroomFromCustody();
    } else if (cc.phase === 'VAN_TO_THANA_RELEASE') {
      this.finalizeThanaRelease();
    } else {
      this.finalizeEnterCentralJail();
    }
  }

  private enterCourtroomFromCustody(): void {
    this.custodyCutscene = null;
    this.resetThanaInspectorPose();
    this.removePrisonerVan();
    if (!this.courtroomStage || !this.courtroomState) {
      this.finalizeThanaRelease();
      return;
    }

    const kp = this.courtroomStage.kathgaraPos;
    this.playerX = kp.x;
    this.playerY = kp.y;
    this.playerZ = kp.z;
    this.playerYaw = 0;
    this.playerRig.root.visible = true;
    this.playerRig.helmetMesh.visible = false;
    if (this.weaponMesh) this.weaponMesh.visible = false;
    if (this.fpWeaponGroup) this.fpWeaponGroup.visible = false;
    this.playerRig.root.position.set(kp.x, kp.y, kp.z);
    this.playerRig.root.rotation.set(0, 0, 0);

    this.courtDialogueTimer = 0;
    this.courtGavelTimer = 0.55;
    this.setMode('COURTROOM');
    soundEngine.playCourtGavel();
    this.speakCurrentCourtTurn();
  }

  private triggerLicenseRevokedFlow(): void {
    const stars = Math.max(3, this.pendingLicenseRevocation || 3);
    this.pendingLicenseRevocation = 0;
    this.hasGunLicense = false;
    this.licenseRevokedPrompt = {
      active: true,
      starsAtArrest: stars,
      urgentFee: URGENT_THANA_LICENSE_RENEWAL_INR,
      standardFee: GUN_LICENSE_FEE_INR,
    };
    this.releasePointerLock();
    const msg =
      `Aapka Arms License ${stars}★ case ke karan radd/expire ho gaya hai! Kya aap ise abhi yahin renew karna chahte hain ya DM Office jaakar?`;
    const tts =
      `आपका आर्म्स लाइसेंस ${stars} स्टार केस के कारण रद्द या एक्सपायर हो गया है! क्या आप इसे अभी यहीं रिन्यू करना चाहते हैं या डीएम ऑफिस जाकर?`;
    this.speakWithSubtitle('Thana Duty Officer', 'inspector', 701, msg, tts, 'high');
    this.saveGameState();
    this.emitHudSnapshot();
  }

  private finalizeThanaRelease(): void {
    this.custodyCutscene = null;
    this.removePrisonerVan();
    this.courtroomState = null;
    this.bustedLock = false;

    const releasePos = this.jailRig?.releaseOutsidePos ?? new THREE.Vector3(-150, 0, 176.5);
    const safePos = this.resolveCollisions(releasePos.x, releasePos.z, 0.5);
    this.playerX = safePos.x;
    this.playerY = 0;
    this.playerZ = safePos.z;
    this.playerYaw = Math.PI;
    this.camYaw = Math.PI;
    this.playerRig.helmetMesh.visible = this.hasHelmet && this.helmetOn;
    this.playerRig.root.visible = !this.firstPerson;
    this.playerRig.root.position.set(this.playerX, 0, this.playerZ);
    this.playerRig.root.rotation.set(0, this.playerYaw, 0);
    this.refreshPlayerWeaponMesh();

    this.setMode('PLAYING');
    this.callbacks.onToast({
      text: 'Bharat Police Thana No. 4 ke baahar riha ho gaye (0★)!',
      tone: 'cash',
    });

    if (this.pendingLicenseRevocation > 0) {
      this.triggerLicenseRevokedFlow();
    } else {
      this.saveGameState();
      this.emitHudSnapshot();
    }
  }

  public renewLicenseAtThana(source: 'cash' | 'bank'): { ok: boolean; message: string } {
    const fee = URGENT_THANA_LICENSE_RENEWAL_INR;
    if (source === 'bank') {
      this.syncBankInterest(true);
      const bankSav = this.savingsPrincipal + this.savingsInterest;
      if (bankSav < fee) {
        this.callbacks.onToast({
          text: `Royal Bank Savings mein sirf ${formatRsExact(bankSav)} hai (${formatRs(fee)} chahiye)`,
          tone: 'warn',
        });
        return { ok: false, message: `Need ${formatRs(fee)} in Royal Bank Savings.` };
      }
      const ratio = fee / Math.max(0.01, bankSav);
      this.savingsInterest = Math.max(0, this.savingsInterest * (1 - ratio));
      this.savingsPrincipal = Math.max(0, this.savingsPrincipal * (1 - ratio));
      this.recordPassbook(
        'SAVINGS',
        'WITHDRAW',
        fee,
        this.savingsPrincipal + this.savingsInterest,
        'Thana Desk Urgent Arms License Renewal',
      );
    } else {
      if (this.playerCash < fee) {
        this.callbacks.onToast({
          text: `Wallet mein sirf ${formatRs(this.playerCash)} hai (${formatRs(fee)} chahiye)`,
          tone: 'warn',
        });
        return { ok: false, message: `Need ${formatRs(fee)} cash.` };
      }
      this.playerCash -= fee;
    }

    this.hasGunLicense = true;
    this.pendingLicenseRevocation = 0;
    this.licenseRevokedPrompt = null;
    this.licenseGraceTimer = 25;
    soundEngine.playLicenseApproved();
    this.speakWithSubtitle(
      'Thana Duty Officer',
      'inspector',
      701,
      'Aapka Arms License yahin Thana Desk par urgent renew ho gaya hai! Ab kanoon ka paalan karein.',
      'आपका आर्म्स लाइसेंस यहीं थाना डेस्क पर अर्जेंट रिन्यू हो गया है! अब कानून का पालन करें।',
      'high',
    );
    this.callbacks.onToast({
      text: `Arms License Renewed! -${formatRs(fee)} (${source === 'bank' ? 'Royal Bank' : 'Cash'})`,
      tone: 'cash',
    });
    this.saveGameState();
    this.emitHudSnapshot();
    return { ok: true, message: 'Arms License renewed at Thana Desk!' };
  }

  public dismissLicenseRevokedToDm(): void {
    this.licenseRevokedPrompt = null;
    this.hasGunLicense = false;
    this.pendingLicenseRevocation = 0;
    this.setWaypoint(-90, 46, 'DM Office (Arms & Driving License)');
    this.speakWithSubtitle(
      'Thana Duty Officer',
      'inspector',
      701,
      'Theek hai, DM Office ka raasta GPS par set kar diya hai. Wahan jaakar standard fee mein renew karwa lein.',
      'ठीक है, डीएम ऑफिस का रास्ता जीपीएस पर सेट कर दिया है। वहाँ जाकर स्टैंडर्ड फीस में रिन्यू करवा लें।',
      'normal',
    );
    this.callbacks.onToast({
      text: 'GPS Waypoint set to DM Office (-90, 46) for ₹25,000 standard license renewal',
      tone: 'info',
    });
    this.saveGameState();
    this.emitHudSnapshot();
  }

  private speakCurrentCourtTurn(): void {
    const cs = this.courtroomState;
    if (!cs) return;
    const turn = cs.dialogueTurns[cs.dialogueIndex];
    if (!turn) return;
    soundEngine.speakNpcLine(turn.speakerRole, cs.dialogueIndex + 300, turn.tts, 'high');
  }

  public advanceCourtroomDialogue(): void {
    const cs = this.courtroomState;
    if (!cs || cs.argumentsFinished) return;
    if (cs.dialogueIndex < cs.dialogueTurns.length - 1) {
      cs.dialogueIndex += 1;
      this.courtDialogueTimer = 0;
      if (cs.dialogueIndex === cs.dialogueTurns.length - 1) {
        cs.argumentsFinished = true;
        this.courtGavelTimer = 0.55;
        soundEngine.playCourtGavel();
      } else {
        soundEngine.playUiClick();
      }
      this.speakCurrentCourtTurn();
      this.emitHudSnapshot();
    } else {
      cs.argumentsFinished = true;
      this.courtGavelTimer = 0.55;
      soundEngine.playCourtGavel();
      this.emitHudSnapshot();
    }
  }

  public skipCourtroomArguments(): void {
    const cs = this.courtroomState;
    if (!cs) return;
    cs.dialogueIndex = cs.dialogueTurns.length - 1;
    cs.argumentsFinished = true;
    this.courtGavelTimer = 0.55;
    soundEngine.playCourtGavel();
    this.speakCurrentCourtTurn();
    this.emitHudSnapshot();
  }

  public applySeniorAdvocateInterimBail(): void {
    const cs = this.courtroomState;
    if (
      !cs ||
      cs.verdictKind !== 'NO_BAIL' ||
      !cs.interimBailEligible ||
      cs.interimBailApplied ||
      !cs.interimBailBreakdown
    ) {
      return;
    }
    const b = cs.interimBailBreakdown;
    cs.verdictKind = 'CONDITIONAL_INTERIM_BAIL';
    cs.interimBailApplied = true;
    cs.bailAmount = b.heavyBond;
    cs.lawyerFee = b.seniorAdvocateFee;
    cs.victimCompensation = b.victimCompensation;
    cs.totalDue = b.total;
    cs.verdictHeadline =
      'Aapko bari nahi kiya ja raha — sirf sakht sharton (All Weapons Confiscated, Arms License Revoked & 3-Day Bank Interest Freeze Probation) par Conditional Interim Bail di ja rahi hai!';
    this.courtGavelTimer = 0.55;
    soundEngine.playCourtGavel();
    soundEngine.speakNpcLine(
      'judge',
      309,
      'वरिष्ठ वकील की दलील सुनने के बाद चेतावनी: आपको बरी नहीं किया जा रहा! सिर्फ सख्त शर्तों, हथियार ज़ब्ती और बैंक प्रोबेशन के साथ अंतरिम ज़मानत दी जा रही है!',
      'high',
    );
    this.emitHudSnapshot();
  }

  public payCourtroomBail(source: 'cash' | 'bank'): { ok: boolean; message: string } {
    const cs = this.courtroomState;
    if (!cs || cs.verdictKind === 'NO_BAIL') {
      return { ok: false, message: 'Is case mein zamanat kharij hai — seedha jail!' };
    }
    const due = cs.totalDue;
    if (source === 'bank') {
      this.syncBankInterest(true);
      const bankSav = this.savingsPrincipal + this.savingsInterest;
      if (bankSav < due) {
        this.callbacks.onToast({
          text: `Royal Bank Savings mein sirf ${formatRsExact(bankSav)} hai (${formatRs(due)} chahiye)`,
          tone: 'warn',
        });
        return { ok: false, message: `Insufficient Royal Bank Savings balance (${formatRs(due)} required).` };
      }
      const ratio = due / Math.max(0.01, bankSav);
      this.savingsInterest = Math.max(0, this.savingsInterest * (1 - ratio));
      this.savingsPrincipal = Math.max(0, this.savingsPrincipal * (1 - ratio));
      this.recordPassbook(
        'SAVINGS',
        'WITHDRAW',
        due,
        this.savingsPrincipal + this.savingsInterest,
        cs.verdictKind === 'CONDITIONAL_INTERIM_BAIL'
          ? `Sec 103 BNS Conditional Interim Bail & Victim Relief (${cs.starsAtArrest}★)`
          : `Court Bail & Vakil Fee (${cs.starsAtArrest}★ Case)`,
      );
    } else {
      if (this.playerCash < due) {
        this.callbacks.onToast({
          text: `Wallet mein sirf ${formatRs(this.playerCash)} hai (${formatRs(due)} chahiye)`,
          tone: 'warn',
        });
        return { ok: false, message: `Insufficient cash (need ${formatRs(due)}).` };
      }
      this.playerCash -= due;
    }

    if (cs.verdictKind === 'CONDITIONAL_INTERIM_BAIL') {
      // Strict non-acquittal penalties: confiscate ALL weapons, revoke Arms License, freeze Bank interest 3 days
      const stripped: string[] = [];
      for (const wid of WEAPON_ORDER) {
        if (wid === 'fists') continue;
        if (this.ownedWeapons.has(wid)) stripped.push(WEAPONS[wid].shortName);
        this.ammo[wid] = 0;
      }
      this.ownedWeapons = new Set(['fists']);
      this.activeWeapon = 'fists';
      this.refreshPlayerWeaponMesh();
      this.hasGunLicense = false;
      this.pendingLicenseRevocation = 0;
      this.bustedConfiscated = stripped;
      this.probationDaysLeft = Math.max(this.probationDaysLeft, 3);
      this.lastCompoundDay = this.getTotalGameDays();
    }

    soundEngine.playCashPickup();
    this.saveGameState();
    this.callbacks.onToast({
      text:
        cs.verdictKind === 'CONDITIONAL_INTERIM_BAIL'
          ? `Interim Bail Paid (-${formatRs(due)}) · Weapons & License Confiscated · 3-Day Bank Interest Freeze!`
          : `Zamanat Manzoor! -${formatRs(due)} (${source === 'bank' ? 'Royal Bank' : 'Cash'}) · Van Thana Gate ja rahi hai`,
      tone: cs.verdictKind === 'CONDITIONAL_INTERIM_BAIL' ? 'warn' : 'cash',
    });
    this.startCustodyCutscene('VAN_TO_THANA_RELEASE');
    return { ok: true, message: `Paid ${formatRs(due)}. Police Van returning to Thana Gate!` };
  }

  public enterCentralJailFromCourt(): void {
    if (!this.courtroomState) return;
    this.startCustodyCutscene('VAN_TO_JAIL');
  }

  private getJailSchedulePhase(minutes: number): JailSchedulePhase {
    const m = ((minutes % 1440) + 1440) % 1440;
    if (m >= 360 && m < 1020) return 'WORK_SHIFT'; // 06:00 AM - 04:59 PM
    if (m >= 1020 && m < 1230) return 'FREE_YARD'; // 05:00 PM - 08:29 PM (Escape Window)
    return 'NIGHT_LOCKUP'; // 08:30 PM - 05:59 AM
  }

  private getJailScheduleMeta(phase: JailSchedulePhase): { title: string; sub: string } {
    if (phase === 'WORK_SHIFT') {
      return {
        title: '06:00–17:00 · WORK SHIFT (MASHAKKAT)',
        sub: 'Workshop [E] par carpentry/gardening kaam karo! Kaam chhodne par Guard warning bajegi.',
      };
    }
    if (phase === 'FREE_YARD') {
      return {
        title: '17:00–20:30 · FREE YARD HOUR (ESCAPE WINDOW)',
        sub: 'Low-security recreation! Chhotu [5/E] se Guard Distraction karao aur East Gate / Grate se bhaago!',
      };
    }
    return {
      title: '20:30–06:00 · NIGHT LOCKUP (BARRACKS BAND)',
      sub: 'Cell bars locked! Cell Toilet [E] use karo ya Bunk Bed [E/1] par so kar Calendar Day + FD Interest badhao.',
    };
  }

  private finalizeEnterCentralJail(): void {
    this.custodyCutscene = null;
    this.removePrisonerVan();
    const cs = this.courtroomState;
    const stars = cs?.starsAtArrest ?? 2;
    const sentenceDaysTotal = cs?.jailDays ?? 2;
    this.courtroomState = null;
    this.bustedLock = false;

    // Escrow remaining licensed weapons safely during prison stay (returned unless revoked at 3+★)
    this.jailEscrowedWeapons = [];
    this.jailEscrowedAmmo = {};
    for (const wid of WEAPON_ORDER) {
      if (wid === 'fists') continue;
      if (this.ownedWeapons.has(wid)) {
        this.jailEscrowedWeapons.push(wid);
        this.jailEscrowedAmmo[wid] = this.ammo[wid];
      }
    }
    this.ownedWeapons = new Set(['fists']);
    this.activeWeapon = 'fists';
    this.refreshPlayerWeaponMesh();

    const phase = this.getJailSchedulePhase(this.gameMinutes);
    const meta = this.getJailScheduleMeta(phase);

    if (this.jailRig) {
      this.disabledColliders.delete(this.jailRig.mainGateCollider);
      this.disabledColliders.delete(this.jailRig.northGateCollider);
      this.disabledColliders.delete(this.jailRig.eastGateCollider);
      this.jailRig.mainGateDoor.position.y = 2.3;
      this.jailRig.northGateDoor.position.y = 2.3;
      this.jailRig.eastGateDoor.position.set(-150 + 21, 2.3, 150);
      this.jailRig.eastGateDoor.rotation.y = 0;

      if (phase === 'NIGHT_LOCKUP') {
        this.disabledColliders.delete(this.jailRig.cellGateCollider);
        this.jailRig.cellGateDoor.position.z = 150 - 7.5;
        this.playerX = this.jailRig.cellInsidePos.x;
        this.playerY = 0.24;
        this.playerZ = this.jailRig.cellInsidePos.z;
      } else {
        this.disabledColliders.add(this.jailRig.cellGateCollider);
        this.jailRig.cellGateDoor.position.z = 150 - 7.5 - 3.0;
        this.playerX = this.jailRig.yardCenter.x;
        this.playerY = 0.24;
        this.playerZ = this.jailRig.yardCenter.z;
      }

      for (const inm of this.jailRig.inmates) {
        inm.hp = inm.maxHp;
        inm.bribed = false;
        inm.defeated = false;
        inm.attackCooldown = 0;
        inm.staggerTimer = 0;
        inm.alerted = false;
        const target =
          phase === 'WORK_SHIFT'
            ? inm.workPos
            : phase === 'NIGHT_LOCKUP'
              ? inm.nightPos
              : inm.yardPos;
        inm.x = target.x;
        inm.z = target.z;
        inm.yaw = target.yaw;
        inm.rig.root.position.set(inm.x, 0.24, inm.z);
        inm.rig.root.rotation.set(0, inm.yaw, 0);
      }
    } else {
      this.playerX = -150;
      this.playerY = 0;
      this.playerZ = 148;
    }
    this.playerYaw = 0;
    this.camYaw = 0;
    this.camPitch = 0.34;
    this.playerRig.helmetMesh.visible = false;
    this.playerRig.root.visible = !this.firstPerson;
    this.playerRig.root.position.set(this.playerX, this.playerY, this.playerZ);

    this.jailState = {
      starsAtArrest: stars,
      sentenceDaysTotal,
      remainingDays: sentenceDaysTotal,
      wardenBribeCost: stars >= 4 ? JAIL_WARDEN_BRIBE_HIGH_INR : JAIL_WARDEN_BRIBE_LOW_INR,
      workCount: 0,
      activeTaskKind: 'NONE',
      taskTimer: 0,
      taskDuration: 1,
      taskStartX: this.playerX,
      taskStartZ: this.playerZ,
      spottedByGuard: false,
      nearStation: null,
      statusBanner: `Saza: ${sentenceDaysTotal} Din · ${meta.title}`,
      spotCooldown: 0,
      lastSchedulePhase: phase,
      workShiftDoneToday: false,
      workSkipWarnTimer: 0,
      distractionTimer: 0,
      distractionCooldown: 0,
      toiletCooldown: 0,
      nearInmateDialogue: null,
    };

    soundEngine.playJailDoorClang();
    this.setMode('JAIL');
    this.saveGameState();
    this.speakWithSubtitle(
      'Jailer Mahendra Pal',
      'warden',
      920,
      'Bharat Central Jail mein swagat hai! Subah Workshop kaam, shaam Free Yard, aur raat 8:30 lockup — discipline todne par warning milegi!',
      'भारत सेंट्रल जेल में स्वागत है! सुबह वर्कशॉप काम, शाम फ्री यार्ड, और रात साढ़े आठ बजे लॉकअप — अनुशासन तोड़ने पर वॉर्निंग मिलेगी!',
      'high',
    );
  }

  private releaseFromJail(exitMode: 'LEGAL' | 'BRIBE' | 'ESCAPE'): void {
    const rig = this.jailRig;
    if (rig) {
      this.disabledColliders.add(rig.cellGateCollider);
      rig.cellGateDoor.position.z = 150 - 7.5 - 3.0;
    }
    if (exitMode === 'ESCAPE') {
      // Prison escape leaves confiscated weapons locked inside evidence (not returned to escapee)
      this.jailEscrowedWeapons = [];
      this.jailEscrowedAmmo = {};
    } else {
      // Restore escrowed weapons on legal release or settled release
      for (const wid of this.jailEscrowedWeapons) {
        this.ownedWeapons.add(wid);
        this.ammo[wid] = Math.max(this.ammo[wid], this.jailEscrowedAmmo[wid] ?? 0);
      }
      this.jailEscrowedWeapons = [];
      this.jailEscrowedAmmo = {};
    }
    this.jailState = null;

    this.playerY = 0;
    this.playerVy = 0;
    this.playerRig.helmetMesh.visible = this.hasHelmet && this.helmetOn;
    this.playerRig.root.visible = !this.firstPerson;
    this.refreshPlayerWeaponMesh();

    if (exitMode === 'LEGAL') {
      const target = rig ? rig.releaseOutsidePos : new THREE.Vector3(-150, 0, 178);
      const pos = this.resolveCollisions(target.x, target.z, 0.5);
      this.playerX = pos.x;
      this.playerZ = pos.z;
      this.playerYaw = Math.PI;
      this.camYaw = Math.PI;
      soundEngine.playJailDoorClang();
      this.setMode('PLAYING');
      this.callbacks.onToast({
        text: 'Saza Poori! Bharat Central Jail se kanooni rihaai · Bank Interest jama hua (0★)',
        tone: 'cash',
      });
    } else if (exitMode === 'BRIBE') {
      // Slip out North Warden Gate late at night (23:30)
      this.gameMinutes = 23 * 60 + 30;
      this.dayCount += 1;
      this.syncBankInterest(true);
      this.applyTimeOfDayLighting();
      const target = rig ? rig.bribeOutsidePos : new THREE.Vector3(-150, 0, 122);
      const pos = this.resolveCollisions(target.x, target.z, 0.5);
      this.playerX = pos.x;
      this.playerZ = pos.z;
      this.playerYaw = 0;
      this.camYaw = 0;
      soundEngine.playJailDoorClang();
      this.setMode('PLAYING');
      if (Math.random() < 0.35) {
        this.setWantedLevelSafe(2);
        this.callbacks.onToast({
          text: 'Warden ne raat mein chhod diya, par watchtower alarm baj gaya! (2★)',
          tone: 'warn',
        });
      } else {
        this.callbacks.onToast({
          text: 'Raat 11:30 PM ko Warden gate se chupchaap baahar nikal gaye! (0★)',
          tone: 'cash',
        });
      }
    } else {
      // Prison Break through Weak East Gate / Drainage Grate!
      if (rig) {
        this.disabledColliders.add(rig.eastGateCollider);
        rig.eastGateDoor.rotation.y = -Math.PI * 0.65;
        rig.eastGateDoor.position.set(-150 + 22.8, 2.3, 151.8);
      }
      const target = rig ? rig.escapeOutsidePos : new THREE.Vector3(-121.5, 0, 150);
      const pos = this.resolveCollisions(target.x, target.z, 0.5);
      this.playerX = pos.x;
      this.playerZ = pos.z;
      this.playerYaw = -Math.PI / 2;
      this.camYaw = -Math.PI / 2;
      soundEngine.playPoliceWhistle();
      this.setMode('PLAYING');
      this.setWantedLevelSafe(3);
      this.speakWithSubtitle(
        'Jail Siren',
        'narrator',
        921,
        'JAIL BREAK ALERT! Kaidi East Gate / Drainage Grate tod kar bhaag gaya! Sabhi SWAT units ghera daalo!',
        'जेल ब्रेक अलर्ट! कैदी ईस्ट गेट तोड़कर भाग गया! सभी स्वाट यूनिट्स घेरा डालो!',
        'high',
      );
      this.callbacks.onToast({
        text: 'PRISON BREAK! Aap jail tod kar bhaage — 3★ SWAT Chase Shuru!',
        tone: 'warn',
      });
    }
    this.playerRig.root.position.set(this.playerX, 0, this.playerZ);

    if (this.pendingLicenseRevocation > 0) {
      if (exitMode === 'ESCAPE') {
        this.hasGunLicense = false;
        this.pendingLicenseRevocation = 0;
        this.callbacks.onToast({
          text: '3+★ Case: Aapka Arms License radd/suspend ho gaya hai! Baad mein Thana ya DM Office par renew karein.',
          tone: 'warn',
        });
      } else {
        this.triggerLicenseRevokedFlow();
        return;
      }
    }

    this.saveGameState();
    this.emitHudSnapshot();
  }

  public jailSleepNight(): void {
    if (this.mode !== 'JAIL' || !this.jailState || this.sleepCutscene) return;
    if (this.jailState.activeTaskKind !== 'NONE') return;
    this.startSleepCutscene('JAIL_BUNK');
  }

  private startSleepCutscene(location: SleepCutsceneLocation): void {
    if (this.currentVehicle) {
      this.currentVehicle.occupiedByPlayer = false;
      this.currentVehicle = null;
    }
    this.adsActive = false;
    this.npcSubtitle = null;
    if (this.weaponMesh) this.weaponMesh.visible = false;
    if (this.fpWeaponGroup) this.fpWeaponGroup.visible = false;
    this.playerRig.helmetMesh.visible = false;
    this.playerRig.root.visible = true;
    this.playerRig.leftLeg.rotation.x = 0;
    this.playerRig.rightLeg.rotation.x = 0;
    this.playerRig.leftArm.rotation.x = 0;
    this.playerRig.rightArm.rotation.x = 0;

    if (location === 'HOME_BED') {
      const bx = this.homeRig ? this.homeRig.bedPos.x + 1.0 : 37.4;
      const bz = this.homeRig ? this.homeRig.bedPos.z - 3.6 : 83.8;
      this.playerX = bx;
      this.playerY = 1.38;
      this.playerZ = bz;
      this.playerRig.root.position.set(bx, 1.38, bz);
      this.playerRig.root.rotation.set(-Math.PI / 2, 0, 0);
      this.sleepCutscene = {
        location: 'HOME_BED',
        returnMode: 'PLAYING',
        timer: 0,
        duration: 5.4,
        startMinutes: this.gameMinutes,
        targetMinutes: 480, // 08:00 AM next morning
        daySettled: false,
        interestGain: 0,
        remainingAfterWake: 0,
        title: `${this.houseName ?? 'Apna Ghar'} · Bedroom Night Rest`,
        subtitle:
          'Aap apne bedroom ke double bed par aaram se so rahe hain — subah full HP/Stamina aur saved progress milega.',
      };
    } else {
      const bunk = this.jailRig?.bunkPos ?? new THREE.Vector3(-166.4, 0.24, 140.4);
      const bx = bunk.x - 1.2;
      const bz = bunk.z - 1.1;
      this.playerX = bx;
      this.playerY = 1.08;
      this.playerZ = bz;
      this.playerRig.root.position.set(bx, 1.08, bz);
      this.playerRig.root.rotation.set(-Math.PI / 2, Math.PI / 2, 0);
      if (this.jailRig) {
        this.jailRig.cellGateDoor.position.z = 150 - 7.5; // Cell bars shut for night sleep visual
      }
      this.sleepCutscene = {
        location: 'JAIL_BUNK',
        returnMode: 'JAIL',
        timer: 0,
        duration: 5.4,
        startMinutes: this.gameMinutes,
        targetMinutes: 6 * 60 + 5, // 06:05 AM Morning Roll Call
        daySettled: false,
        interestGain: 0,
        remainingAfterWake: Math.max(0, (this.jailState?.remainingDays ?? 1) - 1),
        title: 'Bharat Central Jail · Cell Bunk Lockup',
        subtitle:
          'Barracks cell lock ho chuki hai — aap cell bunk par so rahe hain. Subah 06:05 AM Roll Call par 1 din saza kam hogi.',
      };
    }

    soundEngine.playUiClick();
    if (location === 'JAIL_BUNK') {
      soundEngine.playJailDoorClang();
    }
    this.setMode('SLEEP');
  }

  private settleSleepDayTransition(sc: NonNullable<GameEngine['sleepCutscene']>): void {
    if (sc.daySettled) return;
    sc.daySettled = true;

    const prevInterest = this.totalInterestEarned;
    this.dayCount += 1;
    this.gameMinutes = sc.targetMinutes;
    this.lastAartiSlot = -1;
    this.lastAzaanSlot = -1;
    this.syncBankInterest(true);
    this.applyTimeOfDayLighting();
    sc.interestGain = Math.max(0, this.totalInterestEarned - prevInterest);

    if (this.probationDaysLeft > 0) {
      this.probationDaysLeft = Math.max(0, this.probationDaysLeft - 1);
    }

    const calDate = formatInGameDate(this.dayCount);
    if (sc.location === 'HOME_BED') {
      sc.subtitle =
        this.probationDaysLeft > 0
          ? `${calDate} ki subah ho gayi! Full Health/Stamina restored (Court Probation: ${this.probationDaysLeft} din baaki).`
          : `Good Morning (${calDate})! Full Health/Stamina restored · Bank Interest +${formatRsExact(sc.interestGain)}.`;
    } else {
      sc.subtitle =
        sc.remainingAfterWake <= 0.05
          ? `${calDate} Subah 06:05 AM! Saza poori ho gayi — ab aap kanooni taur par riha hone wale hain!`
          : `${calDate} Subah 06:05 AM Roll Call! Baaki Saza: ${sc.remainingAfterWake.toFixed(2)} din · Bank Interest +${formatRsExact(sc.interestGain)}.`;
    }
  }

  public skipSleepCutscene(): void {
    if (this.mode !== 'SLEEP' || !this.sleepCutscene) return;
    this.finalizeSleepWake();
  }

  private finalizeSleepWake(): void {
    const sc = this.sleepCutscene;
    if (!sc) return;
    if (!sc.daySettled) {
      this.settleSleepDayTransition(sc);
    }
    const location = sc.location;
    const interestGain = sc.interestGain;
    const calDate = formatInGameDate(this.dayCount);
    this.gameMinutes = sc.targetMinutes;
    this.applyTimeOfDayLighting();
    this.sleepCutscene = null;

    this.playerRig.root.rotation.set(0, this.playerYaw, 0);
    this.playerRig.helmetMesh.visible = location === 'HOME_BED' && this.hasHelmet && this.helmetOn;
    this.playerStamina = this.playerMaxStamina;
    this.staminaExhausted = false;

    if (location === 'HOME_BED') {
      const wakePos = this.homeRig?.bedPos ?? new THREE.Vector3(36.4, 0.36, 87.4);
      this.playerHp = this.playerMaxHp;
      this.playerX = wakePos.x;
      this.playerY = wakePos.y;
      this.playerZ = wakePos.z;
      this.playerRig.root.position.set(this.playerX, this.playerY, this.playerZ);
      this.playerRig.root.visible = !this.firstPerson;
      this.refreshPlayerWeaponMesh();
      soundEngine.playCashPickup();
      this.setMode('PLAYING');
      this.saveGameState();
      this.callbacks.onToast({
        text:
          this.probationDaysLeft > 0
            ? `Good Morning (${calDate})! Full HP/Stamina restored · Probation: ${this.probationDaysLeft}d remaining`
            : `Good Morning (${calDate})! Full HP/Stamina restored, Progress Saved & Bank Interest +${formatRsExact(interestGain)}.`,
        tone: 'cash',
      });
      this.emitHudSnapshot();
      return;
    }

    // JAIL_BUNK wake-up
    if (this.jailRig) {
      this.disabledColliders.add(this.jailRig.cellGateCollider);
      this.jailRig.cellGateDoor.position.z = 150 - 7.5 - 3.0;
      this.playerX = this.jailRig.bunkPos.x;
      this.playerY = 0.24;
      this.playerZ = this.jailRig.bunkPos.z;
      this.playerRig.root.position.set(this.playerX, this.playerY, this.playerZ);
    }
    this.playerRig.root.visible = !this.firstPerson;
    this.playerHp = Math.min(this.playerMaxHp, this.playerHp + 20);
    soundEngine.playJailDoorClang();

    if (this.jailState) {
      this.jailState.remainingDays = Math.max(0, this.jailState.remainingDays - 1);
      this.jailState.workShiftDoneToday = false;
      this.jailState.workSkipWarnTimer = 0;
      this.jailState.lastSchedulePhase = 'WORK_SHIFT';

      if (this.jailState.remainingDays <= 0.05) {
        this.callbacks.onToast({
          text: `Subah ho gayi (${calDate})! Bank Interest +${formatRsExact(interestGain)} · Saza Poori!`,
          tone: 'cash',
        });
        this.releaseFromJail('LEGAL');
        return;
      }

      this.jailState.statusBanner = `Nayi Subah (${calDate}, 06:05 AM)! Bank Interest +${formatRsExact(interestGain)} · Baaki Saza: ${this.jailState.remainingDays.toFixed(2)}d`;
      this.callbacks.onToast({
        text: `Bunk Sleep Complete · ${calDate} (+${formatRsExact(interestGain)} Bank Interest)`,
        tone: 'cash',
      });
    }

    this.setMode('JAIL');
    this.saveGameState();
    this.emitHudSnapshot();
  }

  private stepSleepCutscene(dt: number): void {
    const sc = this.sleepCutscene;
    if (!sc) return;

    sc.timer += dt;
    const p = clamp(sc.timer / Math.max(0.1, sc.duration), 0, 1);

    // Smoothly sweep clock forward across midnight toward dawn during deep rest
    if (p >= 0.2 && p < 0.85) {
      const k = clamp((p - 0.2) / 0.65, 0, 1);
      let span = sc.targetMinutes - sc.startMinutes;
      if (span <= 60) span += 1440;
      this.gameMinutes = (sc.startMinutes + span * k) % 1440;
      this.applyTimeOfDayLighting();
    }

    if (p >= 0.56 && !sc.daySettled) {
      this.settleSleepDayTransition(sc);
    }

    // Orbit camera gently around the bedroom bed or jail cell bunk
    const bx = this.playerX;
    const bz = this.playerZ;
    const orbit = p * Math.PI * 0.42;
    if (sc.location === 'HOME_BED') {
      this._camDesired.set(
        bx - 2.6 + Math.sin(orbit) * 1.4,
        3.25 - Math.sin(p * Math.PI) * 0.35,
        bz + 3.4 - Math.cos(orbit) * 0.8,
      );
      this._camTarget.set(bx, 1.35, bz);
    } else {
      this._camDesired.set(
        bx + 3.1 - Math.sin(orbit) * 0.9,
        2.65,
        bz + 2.7 + Math.cos(orbit) * 0.6,
      );
      this._camTarget.set(bx, 1.05, bz);
    }
    this.camera.position.lerp(this._camDesired, 1 - Math.exp(-5 * dt));
    this.camera.lookAt(this._camTarget);

    if (sc.timer >= sc.duration) {
      this.finalizeSleepWake();
      return;
    }

    this.hudAccum += dt;
    if (this.hudAccum >= 0.08) {
      this.hudAccum = 0;
      this.emitHudSnapshot();
    }
  }

  public jailUseToilet(): void {
    if (this.mode !== 'JAIL' || !this.jailState) return;
    if (this.jailState.toiletCooldown > 0) {
      this.callbacks.onToast({
        text: `Thoda ruko (${Math.ceil(this.jailState.toiletCooldown)}s) — abhi fresh huye the.`,
        tone: 'info',
      });
      return;
    }
    this.jailState.toiletCooldown = 12;
    this.playerStamina = Math.min(this.playerMaxStamina, this.playerStamina + 35);
    this.playerHp = Math.min(this.playerMaxHp, this.playerHp + 10);
    soundEngine.playUiClick();
    this.jailState.statusBanner = 'Cell Toilet use kiya · Fresh feel kar rahe ho (+35 Stamina, +10 HP)!';
    this.callbacks.onToast({
      text: 'Cell Toilet Used · Stamina & Energy Restored!',
      tone: 'info',
    });
    this.emitHudSnapshot();
  }

  public jailTriggerInmateDistraction(): void {
    if (this.mode !== 'JAIL' || !this.jailState) return;
    const phase = this.getJailSchedulePhase(this.gameMinutes);
    if (phase === 'NIGHT_LOCKUP') {
      this.callbacks.onToast({
        text: 'Abhi 20:30–06:00 Night Lockup hai! Chhotu ki Guard Distraction 17:00–20:30 Free Yard Hour mein hoti hai.',
        tone: 'warn',
      });
      return;
    }
    if (this.jailState.distractionCooldown > 0 || this.jailState.distractionTimer > 0) {
      this.callbacks.onToast({
        text:
          this.jailState.distractionTimer > 0
            ? `Guard Distraction abhi active hai (${Math.ceil(this.jailState.distractionTimer)}s)! East Gate bhaago!`
            : `Chhotu taiyaar ho raha hai (${Math.ceil(this.jailState.distractionCooldown)}s cooldown).`,
        tone: 'info',
      });
      return;
    }
    this.jailState.distractionTimer = 14;
    this.jailState.distractionCooldown = 36;
    soundEngine.playPoliceWhistle();
    this.jailState.statusBanner =
      'CHHOTU DISTRACTION ACTIVE (14s)! Guards West Yard bhaage — Weak East Gate / Grate [E] tod do!';
    this.speakWithSubtitle(
      'Chhotu Mechanic',
      'citizen',
      801,
      'Oye Sipahi ji! Mess ke paas paani ka pipe phat gaya hai, jaldi idhar dekho! (Bhai ab East Gate bhaag!)',
      'ओये सिपाही जी! मेस के पास पानी का पाइप फट गया है, जल्दी इधर देखो!',
      'high',
    );
    this.callbacks.onToast({
      text: 'Guard Distraction (14s)! Guards West taraf mud gaye — East Gate [E] par jaao!',
      tone: 'cash',
    });
    this.emitHudSnapshot();
  }

  public jailSkipSentence(): void {
    if (this.mode !== 'JAIL' || !this.jailState) return;
    const days = Math.max(1, Math.ceil(this.jailState.remainingDays));
    this.dayCount += days;
    this.gameMinutes = 8 * 60 + 30;
    this.lastAartiSlot = -1;
    this.lastAzaanSlot = -1;
    this.syncBankInterest(true);
    this.applyTimeOfDayLighting();
    this.releaseFromJail('LEGAL');
  }

  public jailPerformWork(): void {
    if (this.mode !== 'JAIL' || !this.jailState) return;
    if (this.jailState.activeTaskKind !== 'NONE') return;
    if (this.getJailSchedulePhase(this.gameMinutes) === 'NIGHT_LOCKUP') {
      this.callbacks.onToast({
        text: 'Night Lockup mein Workshop band hai! Subah 06:00 AM ya Bunk [E] par so kar Work Shift aayegi.',
        tone: 'warn',
      });
      return;
    }
    if (this.jailRig && Math.hypot(this.playerX - this.jailRig.workshopPos.x, this.playerZ - this.jailRig.workshopPos.z) > 3.6) {
      this.playerX = this.jailRig.workshopPos.x;
      this.playerZ = this.jailRig.workshopPos.z;
      this.playerYaw = Math.PI;
      this.camYaw = Math.PI;
      this.playerRig.root.position.set(this.playerX, this.playerY, this.playerZ);
    }
    this.jailState.activeTaskKind = 'WORK';
    this.jailState.taskTimer = 0;
    this.jailState.taskDuration = 2.2;
    this.jailState.taskStartX = this.playerX;
    this.jailState.taskStartZ = this.playerZ;
    this.jailState.statusBanner = 'Jail Workshop mein Carpentry & Gardening Shift chal rahi hai (+₹2,000 & -50% Saza)...';
    soundEngine.playUiClick();
    this.emitHudSnapshot();
  }

  public jailBribeWarden(source: 'cash' | 'bank'): { ok: boolean; message: string } {
    if (this.mode !== 'JAIL' || !this.jailState) {
      return { ok: false, message: 'Jail active nahi hai.' };
    }
    const cost = this.jailState.wardenBribeCost;
    if (source === 'bank') {
      this.syncBankInterest(true);
      const savTotal = this.savingsPrincipal + this.savingsInterest;
      if (savTotal < cost) {
        this.callbacks.onToast({
          text: `Bank Savings mein sirf ${formatRsExact(savTotal)} hai (${formatRs(cost)} chahiye)`,
          tone: 'warn',
        });
        return { ok: false, message: `Need ${formatRs(cost)} in Royal Bank Savings.` };
      }
      const ratio = cost / Math.max(0.01, savTotal);
      this.savingsInterest = Math.max(0, this.savingsInterest * (1 - ratio));
      this.savingsPrincipal = Math.max(0, this.savingsPrincipal * (1 - ratio));
      this.recordPassbook(
        'SAVINGS',
        'WITHDRAW',
        cost,
        this.savingsPrincipal + this.savingsInterest,
        'Late-Night Settlement Transfer',
      );
    } else {
      if (this.playerCash < cost) {
        this.callbacks.onToast({
          text: `Wallet mein sirf ${formatRs(this.playerCash)} hai (${formatRs(cost)} chahiye)`,
          tone: 'warn',
        });
        return { ok: false, message: `Need ${formatRs(cost)} cash.` };
      }
      this.playerCash -= cost;
    }

    soundEngine.playCashPickup();
    this.releaseFromJail('BRIBE');
    return { ok: true, message: 'Warden ne gate khol diya!' };
  }

  public jailStartPrisonBreak(): void {
    if (this.mode !== 'JAIL' || !this.jailState) return;
    if (this.jailState.activeTaskKind !== 'NONE') return;
    if (this.getJailSchedulePhase(this.gameMinutes) === 'NIGHT_LOCKUP') {
      this.callbacks.onToast({
        text: 'Night Lockup mein cell bars locked hain! 17:00–20:30 Free Yard Hour ya Guard Distraction [5] ka intezaar karo.',
        tone: 'warn',
      });
      return;
    }
    if (this.jailRig) {
      const distGate = Math.hypot(
        this.playerX - this.jailRig.escapePos.x,
        this.playerZ - this.jailRig.escapePos.z,
      );
      if (distGate > 3.8) {
        this.camYaw = -Math.PI / 2;
        this.jailState.statusBanner =
          'Tip: 17:00–20:30 Free Yard mein Chhotu [5] se Guard Distraction karao aur RED Weak East Gate / Grate (→) par [E] dabao!';
        soundEngine.playUiClick();
        this.callbacks.onToast({
          text: 'East Gate / Grate par pahunch kar [E] dabao (Free Yard + Chhotu Distraction sabse safe hai)!',
          tone: 'info',
        });
        this.emitHudSnapshot();
        return;
      }
    }
    this.jailState.activeTaskKind = 'ESCAPE';
    this.jailState.taskTimer = 0;
    this.jailState.taskDuration = this.getJailSchedulePhase(this.gameMinutes) === 'FREE_YARD' ? 2.5 : 3.2;
    this.jailState.taskStartX = this.playerX;
    this.jailState.taskStartZ = this.playerZ;
    this.jailState.statusBanner = 'Weak East Gate / Drainage Grate tod rahe hain — Guard cone aaye to ruko/bhaago!';
    soundEngine.playLockpickClick();
    this.emitHudSnapshot();
  }

  public respawnAtThana(): void {
    this.bustedLock = false;
    this.performPartialWorldCleanup(false);

    this.playerCash -= COURT_BAIL_FEE_INR;
    if (this.playerCash <= BANK_DEBT_TRIGGER_INR) {
      this.playerCash = BANK_BAILOUT_GRANT_INR;
      this.spawnInsideBank();
      this.saveGameState();
      this.setMode('PAUSED');
      this.speakWithSubtitle(
        'Bank Officer',
        'banker',
        777,
        'Aapka karz pachaas hazaar rupaye ho gaya. Police ke saath sadak ke kutton ko bachane ka mission karo — karz maaf aur das hazaar advance milenge.',
        'आपका कर्ज़ पचास हज़ार रुपये हो गया। पुलिस के साथ सड़क के कुत्तों को बचाने का मिशन करो — कर्ज़ माफ़ और दस हज़ार एडवांस मिलेंगे।',
        'high',
      );
      this.callbacks.onBankPrompt(true);
      this.callbacks.onToast({
        text: `Royal Bank Of India: Debt cleared to ₹0 + ${formatRs(BANK_BAILOUT_GRANT_INR)} advance!`,
        tone: 'info',
      });
      return;
    }

    const spawnPos = this.resolveCollisions(this.courtExitPos.x, this.courtExitPos.z, 0.5);
    this.playerX = spawnPos.x;
    this.playerZ = spawnPos.z;
    this.playerYaw = 0;
    this.camYaw = 0;
    this.playerRig.root.position.set(this.playerX, 0, this.playerZ);
    this.playerRig.root.rotation.y = this.playerYaw;

    this.saveGameState();
    this.setMode('PLAYING');
    this.callbacks.onToast({
      text: `District Court Bail -${formatRs(COURT_BAIL_FEE_INR)} · Bank, Time & Parked Cars safe`,
      tone: this.playerCash < 0 ? 'warn' : 'info',
    });
  }

  public respawnAtHospital(): void {
    // Partial Reset: restores player HP/stamina, clears road wrecks, restores hijacked cars, preserves Bank/FD & Day/Time.
    this.wastedLock = false;
    this.performPartialWorldCleanup(true);

    this.playerCash -= DEATH_FEE_INR;

    if (this.playerCash <= BANK_DEBT_TRIGGER_INR) {
      // Bank debt bailout at Royal Bank Of India: debt cleared to ₹0 + ₹10,000 advance!
      this.playerCash = BANK_BAILOUT_GRANT_INR;
      this.spawnInsideBank();
      this.saveGameState();
      this.setMode('PAUSED');
      this.speakWithSubtitle(
        'Bank Officer',
        'banker',
        777,
        'Aapka karz pachaas hazaar rupaye ho gaya. Police ke saath sadak ke kutton ko bachane ka mission karo — karz maaf aur das hazaar advance milenge.',
        'आपका कर्ज़ पचास हज़ार रुपये हो गया। पुलिस के साथ सड़क के कुत्तों को बचाने का मिशन करो — कर्ज़ माफ़ और दस हज़ार एडवांस मिलेंगे।',
        'high',
      );
      this.callbacks.onBankPrompt(true);
      this.callbacks.onToast({
        text: `Royal Bank Of India: Debt cleared to ₹0 + ${formatRs(BANK_BAILOUT_GRANT_INR)} advance!`,
        tone: 'info',
      });
      return;
    }

    this.playerX = this.hospitalPos.x;
    this.playerZ = this.hospitalPos.z;
    this.playerYaw = 0;
    this.camYaw = 0;
    this.playerRig.root.position.set(this.playerX, 0, this.playerZ);
    this.playerRig.root.rotation.y = this.playerYaw;

    this.saveGameState();
    this.setMode('PLAYING');
    this.callbacks.onToast({
      text: `Hospital bill -${formatRs(DEATH_FEE_INR)} · Bank, Time & Gear kept; Hijacked cars reset`,
      tone: this.playerCash < 0 ? 'warn' : 'info',
    });
  }

  private spawnInsideBank(): void {
    this.playerX = -30;
    this.playerZ = -84;
    this.playerY = 0;
    this.playerVy = 0;
    this.playerYaw = 0;
    this.camYaw = 0;
    this.playerRig.root.visible = true;
    this.playerRig.root.position.set(this.playerX, 0, this.playerZ);
    this.playerRig.root.rotation.y = 0;
  }

  public startDogRescueMission(): void {
    this.cleanupMissionEntities();
    this.clearWanted();

    this.missionPhase = 'ELIMINATE_MAFIA';
    this.missionTimer = MISSION_TIME_LIMIT_SEC;
    this.missionEnemiesTotal = 5;

    // Grant starter police-issue sidearm & SMG so player can complete mission alone
    this.ownedWeapons.add('pistol');
    this.ownedWeapons.add('smg');
    this.ammo.pistol = Math.max(this.ammo.pistol, 96);
    this.ammo.smg = Math.max(this.ammo.smg, 180);
    if (this.activeWeapon === 'fists') {
      this.activeWeapon = 'smg';
      this.refreshPlayerWeaponMesh();
    }

    // Spawn assigned Police Patrol Cruiser parked outside Royal Bank Of India (stays parked until player drives)
    const copRig = createVehicleModel('police');
    const carX = -30;
    const carZ = -65;
    const carYaw = -Math.PI / 2;
    copRig.root.position.set(carX, 0, carZ);
    copRig.root.rotation.y = carYaw;
    this.scene.add(copRig.root);
    const carId = this.nextEntityId++;
    this.missionPoliceCarId = carId;
    this.vehicles.push({
      id: carId,
      name: 'Police Rescue Unit',
      kind: 'police',
      rig: copRig,
      x: carX,
      z: carZ,
      yaw: carYaw,
      speed: 0,
      maxSpeed: 24,
      massFactor: 1.25,
      hp: 240,
      maxHp: 240,
      destroyed: false,
      smokeTimer: 0,
      wreckTimer: 0,
      hitCooldowns: new Map(),
      occupiedByPlayer: false,
      aiEnabled: false,
      aiDisabled: true,
      isStarterParked: true,
      origX: carX,
      origZ: carZ,
      origYaw: carYaw,
      origSpeed: 0,
      origWasStarter: true,
      origAxis: 'x',
      origDir: 1,
      origRoadCenter: -60,
      policeState: 'PATROL',
      maxOfficers: 1,
      spawnedOfficerIds: [],
      dismountCooldown: 0,
      stopCooldown: 0,
      patrolAxis: 'x',
      patrolDir: 1,
      patrolRoadCenter: -60,
    });

    // Spawn Rescue Van at Dog Mafia Compound Yard (150, -156)
    const van = createRescueVanModel();
    van.root.position.set(this.rescueVanPos.x, 0, this.rescueVanPos.z);
    van.root.rotation.y = 0;
    this.scene.add(van.root);
    this.rescueVan = van;

    // Spawn 5 weak Dog Mafia guards inside the compound yard (150, -150)
    const guardSpots: [number, number][] = [
      [143, -152],
      [157, -152],
      [145, -143],
      [155, -143],
      [150, -138],
    ];
    for (const [gx, gz] of guardSpots) {
      const rig = createHumanoidModel({
        shirtColor: 0x7f1d1d,
        pantsColor: 0x1e293b,
        skinColor: 0xc98b63,
      });
      const gun = createWeaponModel('pistol');
      gun.scale.setScalar(1.3);
      rig.weaponMount.add(gun);
      rig.rightArm.rotation.x = Math.PI / 2 - 0.1;
      rig.root.position.set(gx, 0, gz);
      this.scene.add(rig.root);

      this.npcs.push({
        id: this.nextEntityId++,
        name: 'Dog Mafia Guard',
        rig,
        x: gx,
        z: gz,
        yaw: Math.PI,
        vx: 0,
        vz: 0,
        hp: 50,
        maxHp: 50,
        knockbackResist: 0.72,
        walkPhase: 0,
        staggerTimer: 0,
        wanderTimer: 2,
        targetYaw: Math.PI,
        isEnforcer: true,
        isPolice: false,
        isMissionEnemy: true,
        hostile: true,
        aggressiveOnHit: true,
        fireCooldown: 1.6,
        meleeCooldown: 1.2,
        punchAnimTimer: 0,
        dead: false,
        deathTimer: 0,
        alertedTimer: 0,
        greetCooldown: 999,
        chaiCompanionTarget: null,
      });
    }

    this.saveGameState();
    this.setMode('PLAYING');
    this.speakWithSubtitle(
      'Police Radio',
      'narrator',
      101,
      'Bank ke baahar police ki gaadi aur hathiyar taiyaar hain. Nakshe ke raaste se jaakar sadak ke kutton ko bachao.',
      'बैंक के बाहर पुलिस की गाड़ी और हथियार तैयार हैं। नक्शे के रास्ते से जाकर सड़क के कुत्तों को बचाओ।',
      'high',
    );
    this.callbacks.onToast({
      text: 'Mission Shuru: Royal Bank ke baahar Police Car wait kar rahi hai ([F] dabakar chalayein)',
      tone: 'info',
    });
  }

  public skipCutscene(): void {
    if (this.missionPhase === 'CUTSCENE') {
      this.finishCutscene();
    }
  }

  private cleanupMissionEntities(): void {
    this.npcs = this.npcs.filter((n) => {
      if (n.isMissionEnemy) {
        this.scene.remove(n.rig.root);
        return false;
      }
      return true;
    });
    if (this.missionPoliceCarId !== null) {
      const oldCopId = this.missionPoliceCarId;
      this.vehicles = this.vehicles.filter((v) => {
        if (v.id === oldCopId && !v.occupiedByPlayer) {
          this.scene.remove(v.rig.root);
          return false;
        }
        return true;
      });
    }
    if (this.rescueVan) {
      this.scene.remove(this.rescueVan.root);
      this.rescueVan = null;
    }
    if (this.heldDogRig) {
      this.playerRig.root.remove(this.heldDogRig.root);
      this.heldDogRig = null;
    }
    for (const d of this.cutsceneDogs) {
      this.scene.remove(d.rig.root);
    }
    this.cutsceneDogs = [];
    this.missionPoliceCarId = null;
  }

  private beginRescueCutscene(): void {
    if (this.missionPhase !== 'OPEN_VAN' || !this.rescueVan) return;
    this.missionPhase = 'CUTSCENE';
    this.cutsceneTime = 0;
    this.cutsceneBarkStep = 0;

    if (this.currentVehicle) {
      this.currentVehicle.occupiedByPlayer = false;
      this.currentVehicle.speed = 0;
      this.currentVehicle = null;
      this.playerRig.root.visible = true;
    }

    // Position player right behind van rear doors, holding an Indian street dog
    this.playerX = this.rescueVanPos.x - 1.35;
    this.playerZ = this.rescueVanPos.z + 3.4;
    this.playerY = 0;
    this.playerVy = 0;
    this.playerYaw = 0.28;
    this.playerRig.root.position.set(this.playerX, 0, this.playerZ);
    this.playerRig.root.rotation.y = this.playerYaw;
    this.playerRig.leftArm.rotation.x = 1.05;
    this.playerRig.rightArm.rotation.x = 1.05;

    const held = createIndianDogModel(0);
    held.root.scale.setScalar(0.88);
    held.root.position.set(0, 0.92, -0.42);
    held.root.rotation.y = Math.PI / 2;
    this.playerRig.root.add(held.root);
    this.heldDogRig = held;

    // Spawn 24 Indian street dogs inside the van ready to bound out as doors swing open
    for (let i = 0; i < 24; i++) {
      const rig = createIndianDogModel(i + 1);
      const col = (i % 3) - 1;
      const row = Math.floor(i / 3);
      const dx = this.rescueVanPos.x + col * 0.55 + (Math.random() - 0.5) * 0.18;
      const dz = this.rescueVanPos.z - 0.4 + row * 0.34;
      rig.root.position.set(dx, 0.48, dz);
      rig.root.rotation.y = Math.PI; // Facing +Z out the back door
      this.scene.add(rig.root);
      this.cutsceneDogs.push({
        id: this.nextEntityId++,
        rig,
        x: dx,
        y: 0.48,
        z: dz,
        yaw: Math.PI + (Math.random() - 0.5) * 0.45,
        targetYaw: Math.PI + (Math.random() - 0.5) * 0.75,
        speed: 3.4 + Math.random() * 2.2,
        phase: Math.random() * 6,
        wanderTimer: 1 + Math.random() * 2,
        barkCooldown: i * 0.18,
        isCutscene: true,
        behavior: 'ROAM',
        hp: 45,
        maxHp: 45,
        dead: false,
        deathTimer: 0,
        hitCooldown: 0,
      });
    }

    soundEngine.playMissionSuccess();
    soundEngine.playDogBark(1);
    this.speakWithSubtitle(
      'Police Radio',
      'narrator',
      102,
      'Mission kamyaab! Chaubis sadak ke kutte aazaad ho gaye. Ek lakh rupaye aapke khaate mein jama ho gaye.',
      'मिशन कामयाब! चौबीस सड़क के कुत्ते आज़ाद हो गए। एक लाख रुपये आपके खाते में जमा हो गए।',
      'high',
    );
    this.emitHudSnapshot();
  }

  private finishCutscene(): void {
    this.missionPhase = 'NONE';
    this.missionTimer = 0;
    this.cleanupMissionEntities();

    // Restore player arms
    this.playerRig.leftArm.rotation.x = 0;
    this.playerRig.rightArm.rotation.x = 0;

    // Grant ₹1,00,000 mission reward and leave player right here; rescued dogs now roam city streets
    this.playerCash += MISSION_REWARD_INR;
    this.dogsRescuedUnlocked = true;
    this.spawnStreetDogs(10);

    this.saveGameState();
    this.callbacks.onToast({
      text: `MISSION KAMYAAB · +${formatRs(MISSION_REWARD_INR)} · Sadak ke kutte ab shehar mein ghoom rahe hain!`,
      tone: 'cash',
    });
    this.emitHudSnapshot();
  }

  private spawnStreetDogs(targetCount: number): void {
    const starterSpots: [number, number][] = [
      [7, 13],
      [-11, -7],
      [20, -24],
      [-20, 21],
    ];
    while (this.streetDogs.length < targetCount) {
      const idx = this.streetDogs.length;
      const rig = createIndianDogModel(idx + 3);
      let sx: number;
      let sz: number;
      if (idx < starterSpots.length) {
        [sx, sz] = starterSpots[idx];
      } else {
        const rc = this.roadCenters[Math.floor(Math.random() * this.roadCenters.length)];
        const offset = (Math.random() > 0.5 ? 1 : -1) * 9.5;
        sx = Math.random() > 0.5 ? rc + offset : (Math.random() - 0.5) * 260;
        sz = Math.random() > 0.5 ? (Math.random() - 0.5) * 260 : rc + offset;
      }
      const pos = this.resolveCollisions(sx, sz, 0.45);
      rig.root.position.set(pos.x, 0, pos.z);
      this.scene.add(rig.root);

      this.streetDogs.push({
        id: this.nextEntityId++,
        rig,
        x: pos.x,
        y: 0,
        z: pos.z,
        yaw: Math.random() * Math.PI * 2 - Math.PI,
        targetYaw: Math.random() * Math.PI * 2 - Math.PI,
        speed: 2.3 + Math.random() * 1.1,
        phase: Math.random() * 6,
        wanderTimer: 2 + Math.random() * 4,
        barkCooldown: 4 + Math.random() * 8,
        isCutscene: false,
        behavior: 'ROAM',
        hp: 45,
        maxHp: 45,
        dead: false,
        deathTimer: 0,
        hitCooldown: 0,
      });
    }
  }

  public resetCity(): void {
    this.respawnAtHospital();
    this.playerX = 0;
    this.playerZ = 8;
    this.playerY = 0;
    this.playerVy = 0;
    this.playerRig.root.position.set(0, 0, 8);
    this.saveGameState();
    this.emitHudSnapshot();
  }

  public resetFullGame(): void {
    try {
      localStorage.removeItem(SAVE_STORAGE_KEY);
    } catch {
      // ignore
    }
    this.missionPhase = 'NONE';
    this.missionTimer = 0;
    this.cleanupMissionEntities();
    for (const d of this.streetDogs) {
      this.scene.remove(d.rig.root);
    }
    this.streetDogs = [];
    this.dogsRescuedUnlocked = false;
    this.spawnStreetDogs(4);

    this.wastedLock = false;
    this.bustedLock = false;
    this.playerHp = this.playerMaxHp;
    this.playerArmor = 0;
    this.playerStamina = this.playerMaxStamina;
    this.staminaExhausted = false;
    this.playerMedkits = 0;
    this.playerCash = STARTING_CASH_INR;
    this.kills = 0;
    this.hasGunLicense = false;
    this.hasDrivingLicense = false;
    this.hasHelmet = false;
    this.helmetOn = false;
    this.challanCooldown = 0;
    this.trafficFineStrikes = 0;
    this.playerRig.helmetMesh.visible = false;
    this.licenseGraceTimer = 0;
    this.brandishExposeTimer = 0;
    this.noPoliceCheat = false;
    this.ownedWeapons = new Set(['fists']);
    this.ammo = { fists: 0, pistol: 0, smg: 0, shotgun: 0, rifle: 0 };
    this.activeWeapon = 'fists';
    this.activeChaiPrompt = null;
    this.npcSubtitle = null;
    this.refreshPlayerWeaponMesh();
    this.clearWanted();

    if (this.currentVehicle) {
      this.currentVehicle.occupiedByPlayer = false;
      this.currentVehicle = null;
      this.playerRig.root.visible = true;
    }

    this.houseName = null;
    this.hasSavedGame = false;
    this.playerOutfit = 'default';
    this.wardrobeWeapons.clear();
    this.wardrobeArmor = 0;
    this.wardrobeMedkits = 0;
    this.pujaCooldown = 0;
    this.applyPlayerOutfit('default');
    this.homeRig?.updateNameplate('Apna Ghar');
    const homeSign = this.buildingSigns.find((s) => s.id === 'sign-home');
    if (homeSign) homeSign.title = 'Apna Ghar (Family House)';

    if (this.homeRig) {
      this.playerX = this.homeRig.spawnPos.x;
      this.playerZ = this.homeRig.spawnPos.z;
    } else {
      this.playerX = 0;
      this.playerZ = 8;
    }
    this.playerY = 0;
    this.playerVy = 0;
    this.playerYaw = 0;
    this.camYaw = 0;
    this.playerRig.root.position.set(this.playerX, 0, this.playerZ);
    this.playerRig.root.rotation.y = 0;
    this.gameMinutes = 480;
    this.dayCount = 1;
    this.lastAartiSlot = -1;
    this.lastAzaanSlot = -1;
    this.savingsPrincipal = 0;
    this.savingsInterest = 0;
    this.fdPrincipal = 0;
    this.fdInterest = 0;
    this.fdOpenedDay = null;
    this.totalInterestEarned = 0;
    this.lastCompoundDay = this.getTotalGameDays();
    this.passbook = [];
    this.nextPassbookId = 1;
    this.blessedTimer = 0;
    this.prayerAnim = null;
    this.probationDaysLeft = 0;
    this.sleepCutscene = null;
    this.courtroomState = null;
    this.custodyCutscene = null;
    this.removePrisonerVan();
    this.pendingLicenseRevocation = 0;
    this.licenseRevokedPrompt = null;
    this.jailState = null;
    this.jailEscrowedWeapons = [];
    this.jailEscrowedAmmo = {};
    this.disabledColliders.clear();
    if (this.jailRig) {
      this.disabledColliders.add(this.jailRig.cellGateCollider);
    }
    this.randomizeThanaPrisoners(true);
    this.clearWaypoint(true);
    this.applyTimeOfDayLighting();
    this.updateSettings({ ...DEFAULT_SETTINGS });

    this.setMode('PLAYING');
    this.emitHudSnapshot();
  }

  public setWaypoint(x: number, z: number, label: string): void {
    const cx = clamp(x, -WORLD_LIMIT, WORLD_LIMIT);
    const cz = clamp(z, -WORLD_LIMIT, WORLD_LIMIT);
    this.waypoint = { x: cx, z: cz, label };
    if (this.waypointBeacon) {
      this.waypointBeacon.root.position.set(cx, 0, cz);
      this.waypointBeacon.root.visible = true;
    }
    soundEngine.playUiClick();
    this.callbacks.onToast({ text: `GPS Waypoint set: ${label}`, tone: 'info' });
    this.emitHudSnapshot();
  }

  public clearWaypoint(silent = false): void {
    this.waypoint = null;
    if (this.waypointBeacon) {
      this.waypointBeacon.root.visible = false;
    }
    if (!silent) {
      soundEngine.playUiClick();
      this.callbacks.onToast({ text: 'GPS Waypoint cleared', tone: 'info' });
    }
    this.emitHudSnapshot();
  }

  private clearWanted(): void {
    this.wantedLevel = 0;
    this.wantedDecayTimer = 0;
    this.redLightViolations = 0;
    this.civilianKillsInSpree = 0;
    this.policeKilledCount = 0;
    this.swatKilledCount = 0;
    this.commandoKilledCount = 0;
    this.policeVehiclesDestroyed = 0;
    this.crimeUnlicensedWeapon = false;
    this.crimeTrafficViolations = 0;
    this.crimeRecklessDriving = false;
    this.crimeVehicleTheftCount = 0;
    this.crimeStolePoliceCar = false;
    this.crimeCivilianAssaults = 0;
    this.enforcementSpawnCooldown = 0;
    this.brandishExposeTimer = 0;
    this.playerShotAtPolice = false;
    this.surrenderHolding = false;
    this.surrenderHoldTimer = 0;
    this.corneredArrestTimer = 0;

    if (this.activeWitness) {
      const wNpc = this.npcs.find((n) => n.id === this.activeWitness!.npcId);
      if (wNpc) wNpc.rig.phoneProp.visible = false;
      this.activeWitness = null;
    }
    this.policeInspection = null;

    if (this.chopper) {
      this.scene.remove(this.chopper.rig.root);
      this.scene.remove(this.chopper.rig.spotLight.target);
      this.chopper = null;
    }
    for (const rb of this.roadblocks) {
      this.scene.remove(rb);
    }
    this.roadblocks = [];

    soundEngine.setSirenActive(false);
    soundEngine.setChopperActive(false);

    // Despawn tactical reinforcement vehicles & return regular police cruisers to patrol
    this.vehicles = this.vehicles.filter((v) => {
      if (v.isTacticalReinforcement && !v.occupiedByPlayer) {
        this.scene.remove(v.rig.root);
        return false;
      }
      if (v.kind === 'police') {
        v.policeState = 'PATROL';
        v.spawnedOfficerIds = [];
        v.dismountCooldown = 0;
      }
      return true;
    });

    this.npcs = this.npcs.filter((n) => {
      if (n.isPolice && !n.isTrafficPolice && !n.isBeatCop) {
        this.scene.remove(n.rig.root);
        return false;
      }
      if (n.isPolice) {
        n.hostile = false;
        n.bribeRefused = false;
        n.fireCooldown = 1.4;
        n.rig.lathiProp.visible = false;
        for (const child of n.rig.weaponMount.children) {
          if (child !== n.rig.lathiProp) child.visible = true;
        }
      }
      return true;
    });
    this.spawnStandingTrafficPolice();
  }

  private refreshPlayerWeaponMesh(): void {
    if (this.weaponMesh) {
      this.playerRig.weaponMount.remove(this.weaponMesh);
      this.weaponMesh = null;
    }
    if (this.fpWeaponGroup) {
      this.camera.remove(this.fpWeaponGroup);
      this.fpWeaponGroup = null;
    }
    if (this.activeWeapon !== 'fists') {
      const m = createWeaponModel(this.activeWeapon);
      m.scale.setScalar(1.35);
      this.playerRig.weaponMount.add(m);
      this.weaponMesh = m;

      const fp = createWeaponModel(this.activeWeapon);
      fp.scale.setScalar(1.1);
      fp.position.set(0.24, -0.22, -0.48);
      fp.visible = this.firstPerson && !this.currentVehicle;
      this.camera.add(fp);
      this.fpWeaponGroup = fp;
    }
  }

  // --- Combat & Interactions ---

  private toggleVehicle(): void {
    if (this.currentVehicle) {
      const v = this.currentVehicle;
      v.occupiedByPlayer = false;
      v.aiEnabled = false;
      v.speed *= 0.4;
      v.rig.root.rotation.set(0, v.yaw, 0);
      if (v.rig.cabinMesh) v.rig.cabinMesh.visible = true;
      if (v.rig.cockpitGroup) {
        v.rig.cockpitGroup.visible = v.kind === 'rickshaw' || v.kind === 'chopper';
      }
      if (v.rig.cabinGlassMat) v.rig.cabinGlassMat.opacity = 0.34;
      this.chopperAscendTouch = false;
      this.chopperDescendTouch = false;
      this.vehicleSteerVisual = 0;
      this.currentVehicle = null;
      // Restore player rig limbs cleanly (e.g. from motorcycle riding pose)
      this.playerRig.leftArm.rotation.x = 0;
      this.playerRig.rightArm.rotation.x = 0;
      this.playerRig.leftLeg.rotation.x = 0;
      this.playerRig.rightLeg.rotation.x = 0;
      this.playerRig.root.rotation.z = 0;
      this.playerRig.helmetMesh.visible = this.hasHelmet && this.helmetOn;

      // Exit to left side of vehicle (-right vector)
      const sideX = -Math.cos(v.yaw) * 2.1;
      const sideZ = Math.sin(v.yaw) * 2.1;
      const exitPos = this.resolveCollisions(v.x + sideX, v.z + sideZ, 0.45);
      this.playerX = exitPos.x;
      this.playerY = v.y ?? 0;
      this.playerVy = 0;
      this.playerZ = exitPos.z;
      this.playerYaw = v.yaw;
      this.playerRig.root.visible = !this.firstPerson;
      this.playerRig.root.position.set(this.playerX, this.playerY, this.playerZ);
      this.refreshPlayerWeaponMesh();
      soundEngine.playUiClick();
      this.emitHudSnapshot();
      return;
    }

    // Find closest non-destroyed vehicle within 4.5m
    let closest: VehicleEntity | null = null;
    let bestDist = 4.5;
    for (const v of this.vehicles) {
      if (v.destroyed) continue;
      const d = Math.hypot(v.x - this.playerX, v.z - this.playerZ);
      if (d < bestDist) {
        bestDist = d;
        closest = v;
      }
    }
    if (closest) {
      const wasStarterParked = Boolean(closest.isStarterParked);
      const alreadyClaimed = Boolean(closest.playerClaimed);
      // Permanently disable autonomous AI driver once player enters this vehicle (until Wasted)
      closest.aiDisabled = true;
      closest.aiEnabled = false;
      closest.occupiedByPlayer = true;
      closest.isStarterParked = false;
      closest.playerClaimed = true;
      closest.speed = 0;
      this.adsActive = false;
      if (!this.vehicleFuelMap.has(closest.id)) {
        this.vehicleFuelMap.set(closest.id, 78 + (closest.id % 22));
      }

      // Eject visible helmeted AI rider onto pavement when hijacking an occupied bike
      if (closest.kind === 'bike' && closest.hasAiRider && closest.rig.riderRig) {
        closest.rig.riderRig.root.visible = false;
        closest.hasAiRider = false;
        this.spawnEjectedBikeRider(closest);
      }

      this.currentVehicle = closest;
      // Show seated rider + 3D helmet when mounting a motorcycle
      this.playerRig.root.visible = closest.kind === 'bike' ? !this.firstPerson : false;
      this.playerRig.helmetMesh.visible = this.hasHelmet && this.helmetOn;
      this.syncVehicleFirstPersonVisibility();
      if (this.fpWeaponGroup) this.fpWeaponGroup.visible = false;
      this.camYaw = closest.yaw;

      const isPoliceVehicle =
        closest.kind === 'police' ||
        closest.kind === 'swat_van' ||
        closest.kind === 'army_truck' ||
        closest.kind === 'armored_apc';

      if (isPoliceVehicle && closest.id !== this.missionPoliceCarId) {
        // Stealing a police vehicle immediately gives >= 1★ wanted level
        this.crimeStolePoliceCar = true;
        this.registerCrime('steal_police_vehicle');
      } else if (
        !wasStarterParked &&
        !alreadyClaimed &&
        this.missionPhase === 'NONE' &&
        !this.noPoliceCheat &&
        this.wantedLevel === 0
      ) {
        this.crimeVehicleTheftCount += 1;
        // Civilian car/auto/bike: 0★ by default — ONLY wanted if a foot cop directly sees it OR witness completes 100 call
        let sawCop: NpcEntity | null = null;
        let minCopD = 28;
        for (const n of this.npcs) {
          if (n.dead || !n.isPolice) continue;
          const d = Math.hypot(n.x - this.playerX, n.z - this.playerZ);
          if (d < minCopD) {
            const dirX = (this.playerX - n.x) / Math.max(0.1, d);
            const dirZ = (this.playerZ - n.z) / Math.max(0.1, d);
            if (this.raycastBuildings(n.x, n.z, dirX, dirZ, d) >= d - 0.9) {
              minCopD = d;
              sawCop = n;
            }
          }
        }
        if (sawCop) {
          soundEngine.playPoliceWhistle();
          sawCop.hostile = true;
          this.speakWithSubtitle(
            sawCop.name,
            'officer',
            sawCop.id,
            'Oye! Gaadi chura ke bhaag raha hai? Pakdo isko!',
            'ओये! गाड़ी चुरा के भाग रहा है? पकड़ो इसको!',
          );
          this.setWantedLevelSafe(1);
        } else {
          this.startWitnessCallNearPlayer('vehicle_theft', 4.5);
        }
      }

      soundEngine.playUiClick();
      this.emitHudSnapshot();
    }
  }

  private spawnEjectedBikeRider(bike: VehicleEntity): void {
    const id = this.nextEntityId++;
    const rightX = Math.cos(bike.yaw);
    const rightZ = -Math.sin(bike.yaw);
    const ejectPos = this.resolveCollisions(bike.x + rightX * 1.45, bike.z + rightZ * 1.45, 0.45);
    const rig = createHumanoidModel({
      shirtColor: 0x334155,
      pantsColor: 0x1e2430,
      skinColor: 0xc98b63,
      outfitStyle: 'casual',
    });
    // Bike rider ALWAYS wears an ISI helmet even as he is thrown off
    rig.helmetMesh.visible = true;
    rig.root.position.set(ejectPos.x, 0, ejectPos.z);
    rig.root.rotation.y = bike.yaw;
    this.scene.add(rig.root);

    const riderName = pickName(INDIAN_CITIZEN_NAMES, id);
    this.npcs.push({
      id,
      name: riderName,
      rig,
      x: ejectPos.x,
      z: ejectPos.z,
      yaw: normalizeAngle(bike.yaw + Math.PI * 0.5),
      vx: rightX * 6.4,
      vz: rightZ * 6.4,
      hp: 85,
      maxHp: 85,
      knockbackResist: 0.5,
      walkPhase: 0,
      staggerTimer: 1.4,
      wanderTimer: 2,
      targetYaw: normalizeAngle(bike.yaw + Math.PI),
      isEnforcer: false,
      isPolice: false,
      hostile: false,
      aggressiveOnHit: false,
      fireCooldown: 1.2,
      meleeCooldown: 1.0,
      punchAnimTimer: 0,
      dead: false,
      deathTimer: 0,
      alertedTimer: 8.5,
      greetCooldown: 10,
      chaiCompanionTarget: null,
    });

    soundEngine.playPunch(true);
    this.speakWithSubtitle(
      riderName,
      'citizen',
      id,
      'Oye! Meri bike chhor! Chor!',
      'ओये! मेरी बाइक छोड़! चोर!',
    );
  }

  private getVehicleHitDistance(
    ox: number,
    oy: number,
    oz: number,
    dx: number,
    dy: number,
    dz: number,
    maxDist: number,
  ): { vehicle: VehicleEntity | null; dist: number } {
    let bestVehicle: VehicleEntity | null = null;
    let bestDist = maxDist;
    for (const v of this.vehicles) {
      if (v.destroyed || v.occupiedByPlayer) continue;
      const hitY = 0.85;
      const toX = v.x - ox;
      const toY = hitY - oy;
      const toZ = v.z - oz;
      const proj = toX * dx + toY * dy + toZ * dz;
      if (proj > 0 && proj < bestDist) {
        const px = ox + dx * proj;
        const py = oy + dy * proj;
        const pz = oz + dz * proj;
        const r = v.kind === 'rickshaw' ? 1.55 : 2.15;
        if (Math.hypot(px - v.x, pz - v.z) < r && Math.abs(py - hitY) < 1.35) {
          bestDist = proj;
          bestVehicle = v;
        }
      }
    }
    return { vehicle: bestVehicle, dist: bestDist };
  }

  private damageVehicle(v: VehicleEntity, dmg: number, byPlayer: boolean): void {
    if (v.destroyed) return;
    v.hp = Math.max(0, v.hp - dmg);
    const isLawVeh =
      v.kind === 'police' || v.kind === 'swat_van' || v.kind === 'army_truck' || v.kind === 'armored_apc';
    if (byPlayer && isLawVeh && v.id !== this.missionPoliceCarId && this.missionPhase === 'NONE') {
      this.registerCrime('attack_police');
    }
    if (v.hp <= 0) {
      this.explodeVehicle(v, byPlayer);
    }
  }

  private explodeVehicle(v: VehicleEntity, byPlayer: boolean): void {
    if (v.destroyed) return;
    v.destroyed = true;
    v.hp = 0;
    v.speed = 0;
    v.wreckTimer = 18;
    soundEngine.playExplosion();

    // Char all vehicle chassis materials into blackened burnt wreck
    v.rig.root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const origMat = mesh.material;
        const darken = (m: THREE.Material) => {
          const cloned = m.clone();
          if ((cloned as THREE.MeshStandardMaterial).color) {
            (cloned as THREE.MeshStandardMaterial).color.setHex(0x18181b);
            (cloned as THREE.MeshStandardMaterial).roughness = 0.96;
            (cloned as THREE.MeshStandardMaterial).emissive?.setHex(0x451a03);
            (cloned as THREE.MeshStandardMaterial).emissiveIntensity = 0.35;
          }
          return cloned;
        };
        mesh.material = Array.isArray(origMat) ? origMat.map(darken) : darken(origMat);
      }
    });
    v.rig.root.rotation.z = 0.08;

    // Expanding glowing fireball + shockwave ring
    const fireball = new THREE.Mesh(
      new THREE.SphereGeometry(1.1, 14, 12),
      new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.95 }),
    );
    fireball.position.set(v.x, 1.2, v.z);
    this.scene.add(fireball);

    const shockwave = new THREE.Mesh(
      new THREE.RingGeometry(0.7, 1.3, 24),
      new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.9, side: THREE.DoubleSide }),
    );
    shockwave.rotation.x = -Math.PI / 2;
    shockwave.position.set(v.x, 0.25, v.z);
    this.scene.add(shockwave);

    this.explosions.push({ fireball, shockwave, age: 0, maxAge: 1.05 });

    // Eject player if inside exploding car
    if (v.occupiedByPlayer && this.currentVehicle?.id === v.id) {
      v.occupiedByPlayer = false;
      this.currentVehicle = null;
      this.playerRig.root.visible = !this.firstPerson;
      this.playerX = v.x - Math.cos(v.yaw) * 2.6;
      this.playerZ = v.z + Math.sin(v.yaw) * 2.6;
      this.refreshPlayerWeaponMesh();
      this.damagePlayer(62, `${v.name} blast ho gayi`);
    }

    // Radial blast damage (11.5m radius)
    const blastRadius = 11.5;
    for (const npc of this.npcs) {
      if (npc.dead) continue;
      const d = Math.hypot(npc.x - v.x, npc.z - v.z);
      if (d < blastRadius) {
        const falloff = 1 - d / blastRadius;
        const dirX = (npc.x - v.x) / Math.max(0.1, d);
        const dirZ = (npc.z - v.z) / Math.max(0.1, d);
        this.damageNpc(npc, Math.round(145 * falloff + 25), dirX, dirZ, 8 * falloff, byPlayer);
      }
    }
    for (const dog of this.streetDogs) {
      if (dog.dead) continue;
      const d = Math.hypot(dog.x - v.x, dog.z - v.z);
      if (d < blastRadius) {
        this.damageDog(dog, Math.round(80 * (1 - d / blastRadius)), byPlayer);
      }
    }
    const playerDist = Math.hypot(this.playerX - v.x, this.playerZ - v.z);
    if (playerDist < blastRadius && !this.currentVehicle) {
      this.damagePlayer(Math.round(58 * (1 - playerDist / blastRadius)), `${v.name} dhamake se ghayal`);
    }
    // Chain-damage nearby vehicles
    for (const other of this.vehicles) {
      if (other.id === v.id || other.destroyed) continue;
      const d = Math.hypot(other.x - v.x, other.z - v.z);
      if (d < 8.5) {
        other.hp = Math.max(0, other.hp - Math.round(140 * (1 - d / 8.5)));
      }
    }

    if (byPlayer && this.missionPhase === 'NONE') {
      const isLawVeh =
        v.kind === 'police' || v.kind === 'swat_van' || v.kind === 'army_truck' || v.kind === 'armored_apc';
      if (isLawVeh && v.id !== this.missionPoliceCarId) {
        this.policeVehiclesDestroyed++;
        this.registerCrime('destroy_police_vehicle');
      } else {
        this.registerCrime('vehicle_explosion', v.x, v.z);
      }
    }
    if (playerDist < 42) {
      this.callbacks.onToast({ text: `${v.name} blast ho gayi!`, tone: 'warn' });
    }
  }

  private tryPlayerAttack(): void {
    if (this.fireCooldown > 0 || this.currentVehicle) return;
    if (this.mode !== 'PLAYING' && this.mode !== 'JAIL') return;

    const effectiveWeapon: WeaponId = this.mode === 'JAIL' ? 'fists' : this.activeWeapon;
    const spec = WEAPONS[effectiveWeapon];
    this.fireCooldown = spec.fireRateMs / 1000;

    if (effectiveWeapon !== 'fists') {
      this.playerYaw = this.camYaw;
      this.playerRig.root.rotation.y = this.playerYaw;
    }

    if (effectiveWeapon === 'fists') {
      this.punchAnimTimer = 0.24;
      const fwdX = -Math.sin(this.playerYaw);
      const fwdZ = -Math.cos(this.playerYaw);

      let hitAny = false;
      if (this.mode === 'JAIL' && this.jailRig) {
        for (const inm of this.jailRig.inmates) {
          if (!inm.isRival || inm.defeated) continue;
          const dx = inm.x - this.playerX;
          const dz = inm.z - this.playerZ;
          const dist = Math.hypot(dx, dz);
          if (dist <= spec.range + 0.5) {
            const dot = dist > 0.01 ? (dx / dist) * fwdX + (dz / dist) * fwdZ : 1;
            if (dot > 0.12) {
              hitAny = true;
              inm.hp = Math.max(0, inm.hp - spec.damage);
              inm.staggerTimer = 0.36;
              inm.alerted = true;
              inm.bribed = false;
              const kx = dist > 0.05 ? dx / dist : fwdX;
              const kz = dist > 0.05 ? dz / dist : fwdZ;
              inm.x = clamp(inm.x + kx * 1.15, -168.5, -132.5);
              inm.z = clamp(inm.z + kz * 1.15, 132.5, 152.0);
              if (inm.hp <= 0) {
                inm.defeated = true;
                inm.alerted = false;
                inm.rig.root.rotation.x = -Math.PI / 2;
                inm.rig.root.position.y = 0.42;
                this.playerCash += 350;
                soundEngine.playCashPickup();
                if (this.jailState) {
                  this.jailState.statusBanner = `${inm.name} ko maar kar dher kar diya! +₹350 Rival Cash Loot!`;
                }
                this.callbacks.onToast({
                  text: `Rival Defeated: ${inm.name} KO! (+₹350 Cash)`,
                  tone: 'cash',
                });
              } else {
                this.callbacks.onToast({
                  text: `Hit ${inm.name}! (${inm.hp}/${inm.maxHp} HP)`,
                  tone: 'info',
                });
              }
            }
          }
        }
        soundEngine.playPunch(hitAny);
        this.emitHudSnapshot();
        return;
      }

      for (const npc of this.npcs) {
        if (npc.dead) continue;
        const dx = npc.x - this.playerX;
        const dz = npc.z - this.playerZ;
        const dist = Math.hypot(dx, dz);
        if (dist <= spec.range) {
          const dot = dist > 0.01 ? (dx / dist) * fwdX + (dz / dist) * fwdZ : 1;
          if (dot > 0.25) {
            this.damageNpc(npc, spec.damage, fwdX, fwdZ, spec.knockback, true);
            hitAny = true;
          }
        }
      }
      for (const dog of this.streetDogs) {
        if (dog.dead) continue;
        const dx = dog.x - this.playerX;
        const dz = dog.z - this.playerZ;
        const dist = Math.hypot(dx, dz);
        if (dist <= spec.range) {
          const dot = dist > 0.01 ? (dx / dist) * fwdX + (dz / dist) * fwdZ : 1;
          if (dot > 0.2) {
            this.damageDog(dog, spec.damage, true);
            hitAny = true;
          }
        }
      }
      for (const v of this.vehicles) {
        if (v.destroyed) continue;
        const dist = Math.hypot(v.x - this.playerX, v.z - this.playerZ);
        if (dist <= spec.range + 1.6) {
          this.damageVehicle(v, 16, true);
          hitAny = true;
        }
      }
      soundEngine.playPunch(hitAny);
      return;
    }

    // Firearm
    if (this.ammo[this.activeWeapon] <= 0) {
      soundEngine.playDryFire();
      this.callbacks.onToast({ text: 'Goliyan khatam! Pankaj Shastra Bhandar jaao ya hathiyar badlo', tone: 'warn' });
      return;
    }

    if (this.policeInspection) {
      // Firing while police are inspecting arms license immediately escalates
      this.respondToLicenseCheck(false);
    }

    this.ammo[this.activeWeapon]--;
    soundEngine.playGunshot(this.activeWeapon);
    let hitTargetCount = 0;

    // Center-screen crosshair aim ray so bullets land exactly where crosshair / scope points!
    this._ndc.set(0, 0);
    this._raycaster.setFromCamera(this._ndc, this.camera);
    const camOrigin = this._raycaster.ray.origin;
    const camDir = this._raycaster.ray.direction;

    const muzzleY = this.firstPerson ? 1.48 + this.playerY : 1.32 + this.playerY;
    const baseFwdX = -Math.sin(this.playerYaw);
    const baseFwdZ = -Math.cos(this.playerYaw);
    const muzzleX = this.playerX + baseFwdX * (this.firstPerson ? 0.45 : 0.8);
    const muzzleZ = this.playerZ + baseFwdZ * (this.firstPerson ? 0.45 : 0.8);

    // Find world aim target point along center crosshair ray
    let aimDist = spec.range + (this.firstPerson ? 0 : 7);
    const camWallDist = this.raycastBuildings(camOrigin.x, camOrigin.z, camDir.x, camDir.z, aimDist);
    aimDist = Math.min(aimDist, camWallDist);
    const aimPointX = camOrigin.x + camDir.x * aimDist;
    const aimPointY = Math.max(0.2, camOrigin.y + camDir.y * aimDist);
    const aimPointZ = camOrigin.z + camDir.z * aimDist;

    let toAimX = aimPointX - muzzleX;
    let toAimY = aimPointY - muzzleY;
    let toAimZ = aimPointZ - muzzleZ;
    const toAimLen = Math.hypot(toAimX, toAimY, toAimZ) || 1;
    toAimX /= toAimLen;
    toAimY /= toAimLen;
    toAimZ /= toAimLen;

    const effectiveSpread = this.adsActive ? spec.spread * 0.25 : spec.spread;

    for (let p = 0; p < spec.pellets; p++) {
      const yawJitter = (Math.random() - 0.5) * effectiveSpread;
      const pitchJitter = (Math.random() - 0.5) * effectiveSpread * 0.6;
      const cosJ = Math.cos(yawJitter);
      const sinJ = Math.sin(yawJitter);
      const dirX = toAimX * cosJ - toAimZ * sinJ;
      const dirZ = toAimX * sinJ + toAimZ * cosJ;
      const dirY = toAimY + pitchJitter;

      let bestDist = spec.range;
      let hitNpc: NpcEntity | null = null;
      let hitDog: DogEntity | null = null;
      let hitVeh: VehicleEntity | null = null;

      const horizLen = Math.hypot(dirX, dirZ) || 1;
      const wallDist = this.raycastBuildings(muzzleX, muzzleZ, dirX / horizLen, dirZ / horizLen, spec.range);
      bestDist = Math.min(bestDist, wallDist);

      for (const npc of this.npcs) {
        if (npc.dead) continue;
        const toX = npc.x - muzzleX;
        const toY = 1.1 - muzzleY;
        const toZ = npc.z - muzzleZ;
        const proj = toX * dirX + toY * dirY + toZ * dirZ;
        if (proj > 0 && proj < bestDist) {
          const px = muzzleX + dirX * proj;
          const py = muzzleY + dirY * proj;
          const pz = muzzleZ + dirZ * proj;
          if (Math.hypot(px - npc.x, pz - npc.z) < 0.62 && py >= -0.1 && py <= 2.15) {
            bestDist = proj;
            hitNpc = npc;
            hitDog = null;
            hitVeh = null;
          }
        }
      }

      for (const dog of this.streetDogs) {
        if (dog.dead) continue;
        const toX = dog.x - muzzleX;
        const toY = 0.45 - muzzleY;
        const toZ = dog.z - muzzleZ;
        const proj = toX * dirX + toY * dirY + toZ * dirZ;
        if (proj > 0 && proj < bestDist) {
          const px = muzzleX + dirX * proj;
          const py = muzzleY + dirY * proj;
          const pz = muzzleZ + dirZ * proj;
          if (Math.hypot(px - dog.x, pz - dog.z) < 0.55 && py >= -0.1 && py <= 1.25) {
            bestDist = proj;
            hitDog = dog;
            hitNpc = null;
            hitVeh = null;
          }
        }
      }

      const vehHit = this.getVehicleHitDistance(muzzleX, muzzleY, muzzleZ, dirX, dirY, dirZ, bestDist);
      if (vehHit.vehicle && vehHit.dist < bestDist) {
        bestDist = vehHit.dist;
        hitVeh = vehHit.vehicle;
        hitNpc = null;
        hitDog = null;
      }

      if (hitNpc) {
        hitTargetCount++;
        this.damageNpc(hitNpc, spec.damage, dirX, dirZ, spec.knockback, true);
      } else if (hitDog) {
        hitTargetCount++;
        this.damageDog(hitDog, spec.damage, true);
      } else if (hitVeh) {
        hitTargetCount++;
        this.damageVehicle(hitVeh, spec.damage, true);
      }

      this.spawnBulletTrace(
        muzzleX,
        muzzleY,
        muzzleZ,
        muzzleX + dirX * bestDist,
        muzzleY + dirY * bestDist,
        muzzleZ + dirZ * bestDist,
        0xfbbf24,
      );
    }

    // Harmless shots in the air trigger realistic Witness Phone Call -> Police License Check (never instant wanted!)
    if (
      hitTargetCount === 0 &&
      this.wantedLevel === 0 &&
      this.missionPhase === 'NONE' &&
      !this.noPoliceCheat &&
      !this.isNearLicenseRange()
    ) {
      this.handlePublicHarmlessGunfire();
    }
  }

  private damageDog(dog: DogEntity, dmg: number, byPlayer: boolean): void {
    if (dog.dead) return;
    dog.hp = Math.max(0, dog.hp - dmg);
    soundEngine.playDogBark(dog.id + 2);
    if (byPlayer && dog.behavior === 'FOLLOW') {
      dog.behavior = 'ROAM';
    }
    if (dog.hp <= 0) {
      dog.dead = true;
      dog.deathTimer = 4.0;
      dog.rig.root.rotation.z = Math.PI / 2;
      dog.rig.root.position.y = 0.22;
      if (byPlayer) {
        this.callbacks.onToast({ text: 'Sadak ka kutta maara gaya.', tone: 'warn' });
      }
    }
  }

  private speakWithSubtitle(
    speaker: string,
    role:
      | 'officer'
      | 'inspector'
      | 'enforcer'
      | 'dealer'
      | 'citizen'
      | 'banker'
      | 'narrator'
      | 'judge'
      | 'lawyer'
      | 'warden'
      | 'clerk',
    seedId: number,
    displayText: string,
    ttsText?: string,
    priority: 'high' | 'normal' | 'low' = 'normal',
  ): void {
    soundEngine.speakNpcLine(role, seedId, ttsText ?? displayText, priority);
    const estTtl = Math.min(9.5, Math.max(3.6, (ttsText ?? displayText).length * 0.085));
    this.npcSubtitle = { speaker, text: displayText, ttl: estTtl };
  }

  public replyToChai(accept: boolean): void {
    const prompt = this.activeChaiPrompt;
    if (!prompt) return;
    const npc = this.npcs.find((n) => n.id === prompt.npcId && !n.dead);
    this.stopMicRecognition();
    this.activeChaiPrompt = null;

    if (!npc) {
      this.emitHudSnapshot();
      return;
    }

    if (accept) {
      const stall = this.findNearestChaiStall(this.playerX, this.playerZ);
      npc.chaiCompanionTarget = stall;
      npc.hostile = false;
      npc.alertedTimer = 0;
      this.speakWithSubtitle(
        npc.name,
        'citizen',
        npc.id,
        'Haan bhai chal! Tapri pe garma-garam chai peete hain!',
        'हाँ भाई चल! टपरी पे गरमा-गरम चाय पीते हैं!',
      );
      this.callbacks.onToast({
        text: `${npc.name} saath chal raha hai → ${stall.name}`,
        tone: 'info',
      });
    } else {
      this.speakWithSubtitle(
        npc.name,
        'citizen',
        npc.id,
        'Koi baat nahi bhai, phir kabhi sahi!',
        'कोई बात नहीं भाई, फिर कभी सही!',
      );
    }
    this.emitHudSnapshot();
  }

  private findNearestChaiStall(x: number, z: number): ChaiStallInfo {
    const onlyChai = this.chaiStalls.filter((s) => s.kind === 'chai');
    const pool = onlyChai.length > 0 ? onlyChai : this.chaiStalls;
    let best: ChaiStallInfo =
      pool[0] ?? {
        id: 'default',
        name: 'Chai Tapri',
        kind: 'chai',
        vendorName: 'Bittu Chaiwala',
        x: 11,
        z: -12,
        approachX: 11,
        approachZ: -8,
      };
    let bestD = Infinity;
    for (const s of pool) {
      const d = Math.hypot(s.approachX - x, s.approachZ - z);
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    return best;
  }

  private stopMicRecognition(): void {
    if (this.speechRecognition) {
      try {
        this.speechRecognition.abort?.();
      } catch {
        // ignore
      }
      this.speechRecognition = null;
    }
    this.micState.active = false;
    this.micState.timer = 0;
    if (this.activeChaiPrompt) {
      this.activeChaiPrompt.micListening = false;
    }
  }

  public toggleOrStartMic(): void {
    soundEngine.unlock();
    if (!this.settings.voiceMicEnabled) {
      this.stopMicRecognition();
      this.callbacks.onToast({
        text: 'Voice Mic is OFF (enable in Settings → Audio if you want online voice commands)',
        tone: 'info',
      });
      return;
    }
    if (this.micState.active) {
      this.stopMicRecognition();
      this.micState.status = 'Mic band kiya gaya.';
      this.micClearStatusTimer = 2.0;
      this.emitHudSnapshot();
      return;
    }
    this.startMicChaiReply();
  }

  public startMicChaiReply(): void {
    const mode: 'chai' | 'command' = this.activeChaiPrompt ? 'chai' : 'command';
    const w = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: ((ev: { results: ArrayLike<{ isFinal?: boolean } & ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: ((ev: { error?: string }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
        abort: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: ((ev: { results: ArrayLike<{ isFinal?: boolean } & ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: ((ev: { error?: string }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
        abort: () => void;
      };
    };
    const Rec = w.SpeechRecognition || w.webkitSpeechRecognition;

    this.stopMicRecognition();
    this.micClearStatusTimer = 0;

    if (!Rec) {
      const msg =
        mode === 'chai'
          ? 'Browser mic nahi mila — [1] Haan ya [2] Baad mein dabao'
          : 'Browser SpeechRecognition unavailable — Phone buttons use karo';
      this.micState = { active: false, mode, status: msg, transcript: null, timer: 0 };
      this.micClearStatusTimer = 4.0;
      if (this.activeChaiPrompt) {
        this.activeChaiPrompt.micListening = false;
        this.activeChaiPrompt.micStatus = msg;
      }
      this.callbacks.onToast({ text: msg, tone: 'info' });
      this.emitHudSnapshot();
      return;
    }

    try {
      const rec = new Rec();
      rec.lang = 'hi-IN';
      rec.interimResults = true;
      rec.maxAlternatives = 3;
      const listenStatus =
        mode === 'chai'
          ? 'Sun raha hoon... Bolo "Haan chal" ya "Baad mein"'
          : 'Mic ON · Bolo "Map", "Medkit", "Car", "Armory", "Bribe", ya "Chai"';
      this.micState = {
        active: true,
        mode,
        status: listenStatus,
        transcript: null,
        timer: 9.0,
      };
      if (this.activeChaiPrompt) {
        this.activeChaiPrompt.micListening = true;
        this.activeChaiPrompt.micStatus = listenStatus;
      }
      this.emitHudSnapshot();

      rec.onresult = (ev) => {
        const resList = ev.results?.[0];
        let matched = '';
        for (let i = 0; i < (resList?.length ?? 0); i++) {
          matched += ' ' + (resList[i]?.transcript ?? '');
        }
        const trimmed = matched.trim();
        this.micState.transcript = trimmed || null;
        if (!resList?.isFinal) {
          this.emitHudSnapshot();
          return;
        }
        const lower = trimmed.toLowerCase();
        if (this.activeChaiPrompt) {
          if (/haan|han|ha|chal|chalo|chai|piye|yes|ok|bhai|bilkul|zaroor|हां|हाँ|चल|चाय/i.test(lower)) {
            this.replyToChai(true);
            return;
          }
          if (/nahi|na|nhi|baad|mat|no|नहीं|ना|बाद/i.test(lower)) {
            this.replyToChai(false);
            return;
          }
          this.micState.active = false;
          this.micState.status = `"${trimmed}" samajh nahi aaya — [1] ya [2] dabao`;
          this.micClearStatusTimer = 3.5;
          if (this.activeChaiPrompt) {
            this.activeChaiPrompt.micListening = false;
            this.activeChaiPrompt.micStatus = this.micState.status;
          }
          this.emitHudSnapshot();
          return;
        }

        // General voice command mode when no Chai prompt is open
        this.stopMicRecognition();
        if (/map|naksha|minimap|मैप|नक्शा/i.test(lower)) {
          this.micState.status = `Command: "${trimmed}" → City Map`;
          this.micClearStatusTimer = 2.5;
          this.releasePointerLock();
          this.callbacks.onToggleMap();
        } else if (/medkit|heal|dawa|health|दवा/i.test(lower)) {
          this.micState.status = `Command: "${trimmed}" → Medkit`;
          this.micClearStatusTimer = 2.5;
          this.useMedkit();
        } else if (/bribe|rishwat|police|पुलिस/i.test(lower)) {
          this.micState.status = `Command: "${trimmed}" → Bribe Police`;
          this.micClearStatusTimer = 2.5;
          this.bribePolice();
        } else if (/car|auto|rickshaw|gaadi|ride|गाड़ी|ऑटो/i.test(lower)) {
          this.micState.status = `Command: "${trimmed}" → Vehicle`;
          this.micClearStatusTimer = 2.5;
          this.toggleVehicle();
        } else if (/armory|gun|shop|weapon|बंदूक/i.test(lower)) {
          this.micState.status = `Command: "${trimmed}" → Armory`;
          this.micClearStatusTimer = 2.5;
          this.callbacks.onOpenShopShortcut?.();
        } else if (/chai|tapri|kutta|dog|pet|चाय|कुत्ता/i.test(lower)) {
          this.micState.status = `Command: "${trimmed}" → Interact`;
          this.micClearStatusTimer = 2.5;
          this.triggerContextAction();
        } else {
          this.micState.status = `Suna: "${trimmed}"`;
          this.micClearStatusTimer = 3.0;
        }
        this.emitHudSnapshot();
      };

      rec.onerror = () => {
        this.micState.active = false;
        this.micState.status = 'Offline / Mic access blocked — Buttons use karo';
        this.micClearStatusTimer = 3.5;
        if (this.activeChaiPrompt) {
          this.activeChaiPrompt.micListening = false;
          this.activeChaiPrompt.micStatus = this.micState.status;
        }
        this.emitHudSnapshot();
      };

      rec.onend = () => {
        if (this.micState.active) {
          this.micState.active = false;
          if (!this.micState.transcript) {
            this.micState.status = 'Awaaz nahi aayi — phir [V] dabao';
            this.micClearStatusTimer = 2.5;
          }
          if (this.activeChaiPrompt) {
            this.activeChaiPrompt.micListening = false;
          }
          this.emitHudSnapshot();
        }
      };

      this.speechRecognition = rec;
      rec.start();
    } catch {
      this.micState.active = false;
      this.micState.status = 'Mic start nahi hua — [1] ya [2] ya Phone use karo';
      this.micClearStatusTimer = 3.5;
      if (this.activeChaiPrompt) {
        this.activeChaiPrompt.micListening = false;
        this.activeChaiPrompt.micStatus = this.micState.status;
      }
      this.emitHudSnapshot();
    }
  }

  private damageNpc(
    npc: NpcEntity,
    dmg: number,
    dirX: number,
    dirZ: number,
    knockback: number,
    byPlayer: boolean,
  ): void {
    if (npc.dead) return;
    if (
      npc.landmarkKind === 'ram_mandir' ||
      npc.landmarkKind === 'krishna_mandir' ||
      npc.landmarkKind === 'mosque'
    ) {
      if (byPlayer) {
        this.callbacks.onToast({
          text: 'Shanti sthal: Mandir / Masjid mein hinsa mana hai',
          tone: 'info',
        });
      }
      return;
    }
    npc.hp = Math.max(0, npc.hp - dmg);
    npc.staggerTimer = 0.25;
    npc.chaiCompanionTarget = null;
    if (this.activeChaiPrompt?.npcId === npc.id) {
      this.activeChaiPrompt = null;
    }

    // Realistic knockback with mass resistance (no flying across city!)
    const impulse = knockback * (1 - npc.knockbackResist);
    npc.vx += dirX * impulse;
    npc.vz += dirZ * impulse;

    if (byPlayer) {
      // Silencing an active phone witness aborts their 100-dial before police dispatch
      if (this.activeWitness && this.activeWitness.npcId === npc.id) {
        npc.rig.phoneProp.visible = false;
        this.activeWitness = null;
        this.callbacks.onToast({ text: 'Witness phone call ruk gaya!', tone: 'info' });
      }

      if (!npc.isMissionEnemy) {
        if (npc.isPolice) {
          this.registerCrime('attack_police', npc.x, npc.z);
        } else if (npc.hp <= 0) {
          this.registerCrime('kill_civilian', npc.x, npc.z);
        } else {
          this.registerCrime('assault_civilian', npc.x, npc.z);
        }
      }

      const nowMs = performance.now();
      if (npc.hp > 0 && nowMs - this.lastNpcSpeechAt > 2400) {
        this.lastNpcSpeechAt = nowMs;
        if (npc.isPolice) {
          this.speakWithSubtitle(
            npc.name,
            'officer',
            npc.id,
            'Haath upar kar! Police par hamla karta hai? Pakdo isko!',
            'हाथ ऊपर कर! पुलिस पर हमला करता है? पकड़ो इसको!',
          );
        } else if (npc.isEnforcer || npc.aggressiveOnHit) {
          const pair =
            npc.id % 2 === 0
              ? { display: 'Ruk saale! Tujhe abhi batata hoon!', tts: 'रुक साले! तुझे अभी बताता हूँ!' }
              : { display: 'Pakdo isko! Himmat kaise hui!', tts: 'पकड़ो इसको! हिम्मत कैसे हुई!' };
          this.speakWithSubtitle(npc.name, 'enforcer', npc.id, pair.display, pair.tts);
        } else {
          const pair =
            npc.id % 2 === 0
              ? { display: 'Police ko bulao! Pakdo isko!', tts: 'पुलिस को बुलाओ! पकड़ो इसको!' }
              : { display: 'Bachao! Police ko bulao!', tts: 'बचाओ! पुलिस को बुलाओ!' };
          this.speakWithSubtitle(npc.name, 'citizen', npc.id, pair.display, pair.tts);
        }
      }

      if (npc.isEnforcer || npc.aggressiveOnHit || npc.isPolice) {
        npc.hostile = true;
      } else {
        // Civilians sprint away when hit
        npc.alertedTimer = 8.0;
        npc.targetYaw = Math.atan2(-(npc.x - this.playerX), -(npc.z - this.playerZ));
      }
      this.alertNearbyNpcs(npc.x, npc.z, 14);
    }

    if (npc.hp <= 0) {
      npc.dead = true;
      npc.deathTimer = 4.2;
      npc.rig.phoneProp.visible = false;
      npc.rig.root.rotation.x = -Math.PI / 2;
      npc.rig.root.position.y = 0.22;
      if (byPlayer) {
        this.kills++;
        if (!npc.isMissionEnemy) {
          if (npc.isPolice) {
            this.policeKilledCount++;
            if (npc.isSwat) this.swatKilledCount++;
            if (npc.isCommando) this.commandoKilledCount++;
            this.evaluateWantedEscalation();
          } else {
            this.civilianKillsInSpree++;
            this.evaluateWantedEscalation();
          }
        }
        // INR pocket cash drop (₹1,300-₹3,800 civilians, ₹3,800-₹7,200 enforcers/cops)
        const minCash = npc.isEnforcer || npc.isPolice ? 3800 : 1300;
        const maxCash = npc.isEnforcer || npc.isPolice ? 7200 : 3800;
        const amount = minCash + Math.floor(Math.random() * (maxCash - minCash + 1));
        this.spawnCashPickup(npc.x, npc.z, amount);
        this.saveGameState();
      }
      if (npc.isMissionEnemy && this.missionPhase === 'ELIMINATE_MAFIA') {
        const aliveGuards = this.npcs.filter((n) => n.isMissionEnemy && !n.dead).length;
        if (aliveGuards === 0) {
          this.missionPhase = 'OPEN_VAN';
          this.speakWithSubtitle(
            'Police Radio',
            'narrator',
            103,
            'Sabhi gunde khatam! Rescue van ke peeche jaakar darwaza kholo.',
            'सभी गुंडे ख़त्म! रेस्क्यू वैन के पीछे जाकर दरवाज़ा खोलो।',
            'high',
          );
          this.callbacks.onToast({
            text: 'Paanchon Dog Mafia khatam! Rescue Van ka darwaza kholo (E)',
            tone: 'info',
          });
        }
      }
    }
  }

  private spawnCashPickup(x: number, z: number, amount: number): void {
    const group = new THREE.Group();
    const bill = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.28, 0.14),
      new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.45,
        roughness: 0.4,
      }),
    );
    group.add(bill);
    group.position.set(x, 0.48, z);
    this.scene.add(group);
    this.pickups.push({ id: this.nextEntityId++, mesh: group, x, z, amount, age: 0 });
  }

  private spawnBulletTrace(
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number,
    colorHex: number,
  ): void {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x1, y1, z1),
      new THREE.Vector3(x2, y2, z2),
    ]);
    const mat = new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity: 0.85 });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    this.traces.push({ line, ttl: 0.08 });
  }

  private alertNearbyNpcs(cx: number, cz: number, radius: number): void {
    for (const other of this.npcs) {
      if (other.dead || other.isPolice || other.hostile) continue;
      if (this.activeWitness && this.activeWitness.npcId === other.id) continue;
      if (Math.hypot(other.x - cx, other.z - cz) <= radius) {
        other.alertedTimer = 7.0;
        other.targetYaw = Math.atan2(-(other.x - this.playerX), -(other.z - this.playerZ));
      }
    }
  }

  private isNearLicenseRange(): boolean {
    return Math.hypot(this.playerX - -82, this.playerZ - 32) < 22;
  }

  private isNearRoyalBank(): boolean {
    return Math.hypot(this.playerX - this.bankPos.x, this.playerZ - (this.bankPos.z - 8)) < 22;
  }

  private setWantedLevelSafe(targetStars: number): void {
    if (this.noPoliceCheat) return;
    const prev = this.wantedLevel;
    const clamped = clamp(Math.max(this.wantedLevel, targetStars), 0, 5);
    this.wantedLevel = clamped;
    this.wantedDecayTimer = Math.max(this.wantedDecayTimer, 18 + clamped * 3);

    if (clamped > 0 && prev === 0) {
      soundEngine.setSirenActive(true);
      const spoken = soundEngine.speakPoliceLine('warn');
      if (spoken) {
        this.npcSubtitle = { speaker: 'Police', text: spoken.text, ttl: 3.6 };
      }
    }
    if (clamped >= 4) {
      soundEngine.setChopperActive(true);
    }
    if (clamped > prev) {
      this.enforcementSpawnCooldown = Math.min(this.enforcementSpawnCooldown, 0.5);
      const title = WANTED_TIER_TITLES[clamped] || `${clamped}★ Wanted`;
      this.callbacks.onToast({
        text: `Wanted Level Badha: ${title}`,
        tone: 'warn',
      });
    }
  }

  private evaluateWantedEscalation(): void {
    if (this.noPoliceCheat || this.missionPhase !== 'NONE') return;
    let target = this.wantedLevel;

    // Step-by-step escalation: never jump from 0/1 to 5 on small fights
    if (target >= 1) {
      if (this.civilianKillsInSpree >= 2 || this.policeKilledCount >= 1) {
        target = Math.max(target, 2);
      }
    }
    if (target >= 2) {
      if (this.policeKilledCount >= 3 || this.policeVehiclesDestroyed >= 1) {
        target = Math.max(target, 3);
      }
    }
    if (target >= 3) {
      if (this.swatKilledCount >= 2 || this.policeKilledCount >= 6 || this.policeVehiclesDestroyed >= 2) {
        target = Math.max(target, 4);
      }
    }
    if (target >= 4) {
      if (this.commandoKilledCount >= 3 || this.policeKilledCount >= 10 || this.policeVehiclesDestroyed >= 4) {
        target = Math.max(target, 5);
      }
    }
    if (target > this.wantedLevel) {
      this.setWantedLevelSafe(target);
    }
  }

  private registerCrime(
    kind:
      | 'unlicensed_weapon'
      | 'refuse_inspection'
      | 'steal_police_vehicle'
      | 'traffic_violation'
      | 'assault_civilian'
      | 'kill_civilian'
      | 'attack_police'
      | 'destroy_police_vehicle'
      | 'vehicle_explosion',
    _cx = this.playerX,
    _cz = this.playerZ,
  ): void {
    if (this.noPoliceCheat || this.missionPhase !== 'NONE') return;

    if (kind === 'unlicensed_weapon') this.crimeUnlicensedWeapon = true;
    else if (kind === 'traffic_violation') this.crimeTrafficViolations += 1;
    else if (kind === 'steal_police_vehicle') this.crimeStolePoliceCar = true;
    else if (kind === 'assault_civilian') this.crimeCivilianAssaults += 1;

    if (kind === 'attack_police') {
      this.playerShotAtPolice = true;
      // Attacking police jumps straight to 2★ Armed Squad (or triggers escalation evaluation above 2★)
      if (this.policeInspection) {
        this.policeInspection = null;
      }
      this.setWantedLevelSafe(Math.max(2, this.wantedLevel));
      this.evaluateWantedEscalation();
      return;
    }

    if (kind === 'destroy_police_vehicle') {
      this.playerShotAtPolice = true;
      const next = this.wantedLevel >= 2 ? 3 : 2;
      this.setWantedLevelSafe(next);
      this.evaluateWantedEscalation();
      return;
    }

    if (kind === 'vehicle_explosion') {
      const next = this.wantedLevel >= 2 ? this.wantedLevel : 2;
      this.setWantedLevelSafe(next);
      this.evaluateWantedEscalation();
      return;
    }

    if (
      kind === 'unlicensed_weapon' ||
      kind === 'refuse_inspection' ||
      kind === 'steal_police_vehicle' ||
      kind === 'traffic_violation'
    ) {
      this.setWantedLevelSafe(Math.max(1, this.wantedLevel));
      return;
    }

    // Civilian assault or kill
    if (this.wantedLevel > 0) {
      if (this.isNearRoyalBank() && this.wantedLevel >= 2) {
        this.setWantedLevelSafe(3);
      } else {
        this.evaluateWantedEscalation();
      }
      return;
    }

    // At 0★: if a foot policeman is nearby watching, trigger 1★ immediately; otherwise witness phone call dispatches police
    const nearbyCop = this.npcs.some(
      (n) => !n.dead && n.isPolice && Math.hypot(n.x - this.playerX, n.z - this.playerZ) < 26,
    );
    if (nearbyCop || this.isNearRoyalBank()) {
      this.setWantedLevelSafe(1);
    } else if (!this.activeWitness && !this.policeInspection) {
      const started = this.startWitnessCallNearPlayer(kind === 'kill_civilian' ? 'murder' : 'assault', 2.6);
      if (!started) {
        this.setWantedLevelSafe(1);
      }
    }
  }

  private handlePublicHarmlessGunfire(): void {
    if (this.policeInspection || this.activeWitness) return;
    // Check if an officer is already right next to the player
    const nearCop = this.npcs.find(
      (n) => !n.dead && n.isPolice && Math.hypot(n.x - this.playerX, n.z - this.playerZ) < 24,
    );
    if (nearCop) {
      this.initiatePoliceLicenseCheck('gunfire', nearCop);
      return;
    }
    // Trigger realistic witness phone alert first
    const started = this.startWitnessCallNearPlayer('gunfire', 3.8);
    if (!started) {
      this.initiatePoliceLicenseCheck('gunfire');
    }
  }

  private startWitnessCallNearPlayer(
    reason: 'brandishing' | 'gunfire' | 'assault' | 'murder' | 'vehicle_theft',
    duration = 4.2,
  ): boolean {
    if (this.activeWitness || this.policeInspection || this.wantedLevel > 0) return false;
    let bestNpc: NpcEntity | null = null;
    let bestDist = 30;
    for (const npc of this.npcs) {
      if (
        npc.dead ||
        npc.isPolice ||
        npc.isEnforcer ||
        npc.isMissionEnemy ||
        npc.landmarkKind ||
        npc.hostile
      ) {
        continue;
      }
      const d = Math.hypot(npc.x - this.playerX, npc.z - this.playerZ);
      if (d > 2.2 && d < bestDist) {
        bestDist = d;
        bestNpc = npc;
      }
    }
    if (!bestNpc) return false;

    bestNpc.rig.phoneProp.visible = true;
    bestNpc.chaiCompanionTarget = null;
    this.activeWitness = {
      npcId: bestNpc.id,
      npcName: bestNpc.name,
      reason,
      remaining: duration,
      duration,
      beepAccum: 0.4,
    };

    const picked = pickHindiLine(
      reason === 'vehicle_theft'
        ? 'witness_call_theft'
        : reason === 'murder' || reason === 'assault'
          ? 'witness_call_assault'
          : 'witness_call_gun',
    );
    soundEngine.playPhoneDialBeep();
    this.speakWithSubtitle(bestNpc.name, 'citizen', bestNpc.id, picked.text, picked.tts);
    return true;
  }

  private dispatchRemoteBeatOfficer(): NpcEntity {
    // Prefer an existing calm Beat/Traffic officer if reasonably close, otherwise walk/run one in from down the road (~42m)
    let closest: NpcEntity | null = null;
    let bestD = 42;
    for (const n of this.npcs) {
      if (!n.dead && n.isPolice && !n.hostile && Math.hypot(n.x - this.playerX, n.z - this.playerZ) < bestD) {
        bestD = Math.hypot(n.x - this.playerX, n.z - this.playerZ);
        closest = n;
      }
    }
    if (closest) return closest;

    const angle = Math.random() * Math.PI * 2;
    const sx = clamp(this.playerX + Math.cos(angle) * 44, -WORLD_LIMIT + 14, WORLD_LIMIT - 14);
    const sz = clamp(this.playerZ + Math.sin(angle) * 44, -WORLD_LIMIT + 14, WORLD_LIMIT - 14);
    return this.spawnPoliceOfficer(sx, sz, 1, { beatCop: true, hostile: false });
  }

  private initiatePoliceLicenseCheck(
    reason: 'brandishing' | 'gunfire',
    specificOfficer?: NpcEntity,
  ): void {
    if (this.policeInspection || this.wantedLevel > 0 || this.noPoliceCheat || this.missionPhase !== 'NONE') {
      return;
    }
    const officer = specificOfficer ?? this.dispatchRemoteBeatOfficer();
    officer.hostile = false;
    this.policeInspection = {
      officerId: officer.id,
      officerName: officer.name,
      phase: 'APPROACHING',
      timer: 15,
      reason,
    };
    this.callbacks.onToast({
      text: `${officer.name} license check ke liye aa rahe hain...`,
      tone: 'info',
    });
  }

  public respondToLicenseCheck(showLicense: boolean): void {
    if (!this.policeInspection) return;
    const insp = this.policeInspection;
    const officer = this.npcs.find((n) => n.id === insp.officerId && !n.dead);
    this.policeInspection = null;

    if (showLicense && this.hasGunLicense) {
      // Valid arms license & holster weapon -> stern warning only (0 stars)
      if (this.activeWeapon !== 'fists') {
        this.activeWeapon = 'fists';
        this.adsActive = false;
        this.refreshPlayerWeaponMesh();
        this.saveGameState();
      }
      this.brandishExposeTimer = 0;
      this.licenseGraceTimer = 26;
      soundEngine.playLicenseApproved();
      if (officer) {
        officer.hostile = false;
        this.speakWithSubtitle(
          officer.name,
          'officer',
          officer.id,
          'Theek hai, arms license valid hai. Bazaar mein banduk mat nikalo, aage se dhyan rakhna!',
          'ठीक है, आर्म्स लाइसेंस वैध है। बाज़ार में बंदूक मत निकालो, आगे से ध्यान रखना!',
        );
      }
      this.callbacks.onToast({
        text: 'License Verified! Police warning dekar chhod diya (0★)',
        tone: 'cash',
      });
      this.emitHudSnapshot();
      return;
    }

    // Either player has NO valid license or actively refused -> 1★ Local Beat Police
    if (officer) {
      officer.hostile = true;
      this.speakWithSubtitle(
        officer.name,
        'officer',
        officer.id,
        showLicense
          ? 'Tumhare paas valid arms license nahi hai! Giraftar karo!'
          : 'Police ki baat nahi maani! Pakdo isko!',
        showLicense
          ? 'तुम्हारे पास वैध आर्म्स लाइसेंस नहीं है! गिरफ्तार करो!'
          : 'पुलिस की बात नहीं मानी! पकड़ो इसको!',
      );
    }
    this.registerCrime(showLicense ? 'unlicensed_weapon' : 'refuse_inspection');
    this.emitHudSnapshot();
  }

  private spawnRoadblockAhead(): void {
    if (this.roadblocks.length >= 2) return;
    const yaw = this.currentVehicle ? this.currentVehicle.yaw : this.playerYaw;
    const fwdX = -Math.sin(yaw);
    const fwdZ = -Math.cos(yaw);
    const rx = clamp(this.playerX + fwdX * 48, -WORLD_LIMIT + 18, WORLD_LIMIT - 18);
    const rz = clamp(this.playerZ + fwdZ * 48, -WORLD_LIMIT + 18, WORLD_LIMIT - 18);
    const rb = createRoadblockBarricade();
    rb.position.set(rx, 0, rz);
    rb.rotation.y = yaw;
    this.scene.add(rb);
    this.roadblocks.push(rb);

    // Station 2 SWAT officers beside the roadblock
    const perpX = Math.cos(yaw) * 3.8;
    const perpZ = -Math.sin(yaw) * 3.8;
    this.spawnPoliceOfficer(rx - perpX, rz - perpZ, 3, { hostile: true });
    this.spawnPoliceOfficer(rx + perpX, rz + perpZ, 3, { hostile: true });
  }

  private spawnTacticalReinforcementVehicle(
    kind: 'police' | 'swat_van' | 'army_truck' | 'armored_apc',
    unitTier: 2 | 3 | 4 | 5,
  ): void {
    const angle = Math.random() * Math.PI * 2;
    const sx = clamp(this.playerX + Math.cos(angle) * 58, -WORLD_LIMIT + 16, WORLD_LIMIT - 16);
    const sz = clamp(this.playerZ + Math.sin(angle) * 58, -WORLD_LIMIT + 16, WORLD_LIMIT - 16);
    const pos = this.resolveCollisions(sx, sz, 1.8);
    const yaw = Math.atan2(-(this.playerX - pos.x), -(this.playerZ - pos.z));
    const rig = createVehicleModel(kind);
    rig.root.position.set(pos.x, 0, pos.z);
    rig.root.rotation.y = yaw;
    this.scene.add(rig.root);

    const names: Record<typeof kind, string> = {
      police: 'Police Vajra SUV',
      swat_van: unitTier === 4 ? 'Commando 4x4' : 'STF SWAT Tactical SUV',
      army_truck: 'Indian Army Convoy Truck',
      armored_apc: 'Army Armored APC',
    };
    const maxHp = kind === 'armored_apc' ? 520 : kind === 'army_truck' ? 380 : kind === 'swat_van' ? 320 : 220;

    this.vehicles.push({
      id: this.nextEntityId++,
      name: names[kind],
      kind,
      rig,
      x: pos.x,
      z: pos.z,
      yaw,
      speed: 9.5,
      maxSpeed: kind === 'armored_apc' ? 21 : kind === 'swat_van' ? 24 : 23,
      massFactor: kind === 'armored_apc' ? 1.85 : kind === 'army_truck' ? 1.65 : 1.35,
      hp: maxHp,
      maxHp,
      destroyed: false,
      smokeTimer: 0,
      wreckTimer: 0,
      hitCooldowns: new Map(),
      occupiedByPlayer: false,
      aiEnabled: true,
      aiDisabled: false,
      origX: pos.x,
      origZ: pos.z,
      origYaw: yaw,
      origSpeed: 9.5,
      origWasStarter: false,
      origAxis: 'z',
      origDir: 1,
      origRoadCenter: 0,
      policeState: 'APPROACH',
      maxOfficers: 2,
      spawnedOfficerIds: [],
      dismountCooldown: 0,
      stopCooldown: 0,
      patrolAxis: 'z',
      patrolDir: 1,
      patrolRoadCenter: 0,
      isTacticalReinforcement: true,
      unitTier,
    });
  }

  private stepPoliceChopper(dt: number): void {
    if (this.wantedLevel < 4 || this.noPoliceCheat) {
      if (this.chopper) {
        this.scene.remove(this.chopper.rig.root);
        this.scene.remove(this.chopper.rig.spotLight.target);
        this.chopper = null;
        soundEngine.setChopperActive(false);
      }
      return;
    }

    if (!this.chopper) {
      const rig = createPoliceChopperModel();
      const startX = this.playerX + 46;
      const startZ = this.playerZ - 46;
      rig.root.position.set(startX, 22, startZ);
      this.scene.add(rig.root);
      this.scene.add(rig.spotLight.target);
      this.chopper = {
        rig,
        x: startX,
        y: 22,
        z: startZ,
        angle: 0,
        fireCooldown: 2.2,
      };
      soundEngine.setChopperActive(true);
      this.callbacks.onToast({
        text: '4★ ALERT: Police Chopper aasmaan se nigrani aur firing kar raha hai!',
        tone: 'warn',
      });
    }

    const c = this.chopper;
    c.angle += dt * 0.55;
    const orbitR = 22;
    const targetX = this.playerX + Math.cos(c.angle) * orbitR;
    const targetZ = this.playerZ + Math.sin(c.angle) * orbitR;
    c.x = THREE.MathUtils.damp(c.x, targetX, 2.2, dt);
    c.z = THREE.MathUtils.damp(c.z, targetZ, 2.2, dt);
    c.y = 21.5 + Math.sin(c.angle * 2) * 1.1;

    c.rig.root.position.set(c.x, c.y, c.z);
    c.rig.root.rotation.y = Math.atan2(-(this.playerX - c.x), -(this.playerZ - c.z));
    c.rig.mainRotor.rotation.y += dt * 24;
    c.rig.tailRotor.rotation.x += dt * 28;
    c.rig.spotLight.target.position.set(
      this.playerX + Math.sin(c.angle * 3) * 2.5,
      0,
      this.playerZ + Math.cos(c.angle * 3) * 2.5,
    );

    c.fireCooldown -= dt;
    if (c.fireCooldown <= 0) {
      c.fireCooldown = this.wantedLevel >= 5 ? 1.35 : 1.75;
      soundEngine.playGunshot('rifle');
      const hitChance = this.currentVehicle ? 0.25 : 0.4;
      if (Math.random() < hitChance) {
        this.damagePlayer(this.wantedLevel >= 5 ? 10 : 7, 'Police Chopper ki goli lag gayi');
      }
      this.spawnBulletTrace(
        c.x,
        c.y - 1.2,
        c.z,
        this.playerX + (Math.random() - 0.5) * 1.8,
        1.1,
        this.playerZ + (Math.random() - 0.5) * 1.8,
        0x38bdf8,
      );
    }
  }

  private stepWantedReinforcements(dt: number): void {
    if (this.wantedLevel <= 0 || this.noPoliceCheat || this.missionPhase !== 'NONE') return;

    this.enforcementSpawnCooldown -= dt;
    if (this.enforcementSpawnCooldown > 0) return;
    this.enforcementSpawnCooldown = 4.2;

    const aliveCops = this.npcs.filter((n) => !n.dead && n.isPolice && !n.isTrafficPolice);
    const maxOnFoot =
      this.wantedLevel === 1
        ? 3
        : this.wantedLevel === 2
          ? 4
          : this.wantedLevel === 3
            ? 5
            : this.wantedLevel === 4
              ? 6
              : 7;

    if (this.wantedLevel === 1) {
      // 1★: Beat Cops only (on foot, khaki uniform)
      if (aliveCops.filter((c) => c.lawTier === 1 || c.isBeatCop).length < maxOnFoot) {
        const angle = Math.random() * Math.PI * 2;
        const sx = clamp(this.playerX + Math.cos(angle) * 34, -WORLD_LIMIT + 12, WORLD_LIMIT - 12);
        const sz = clamp(this.playerZ + Math.sin(angle) * 34, -WORLD_LIMIT + 12, WORLD_LIMIT - 12);
        this.spawnPoliceOfficer(sx, sz, 1, { beatCop: true, hostile: true });
      }
    } else if (this.wantedLevel === 2) {
      // 2★: Armed Police Cruisers
      const activeSquadCars = this.vehicles.filter((v) => !v.destroyed && v.kind === 'police' && !v.occupiedByPlayer);
      if (activeSquadCars.length < 3) {
        this.spawnTacticalReinforcementVehicle('police', 2);
      } else if (aliveCops.length < maxOnFoot) {
        const angle = Math.random() * Math.PI * 2;
        this.spawnPoliceOfficer(
          clamp(this.playerX + Math.cos(angle) * 36, -WORLD_LIMIT + 12, WORLD_LIMIT - 12),
          clamp(this.playerZ + Math.sin(angle) * 36, -WORLD_LIMIT + 12, WORLD_LIMIT - 12),
          2,
          { hostile: true },
        );
      }
    } else if (this.wantedLevel === 3) {
      // 3★: SWAT Vans + Roadblocks
      const swatVans = this.vehicles.filter((v) => !v.destroyed && v.kind === 'swat_van');
      if (swatVans.length < 2) {
        this.spawnTacticalReinforcementVehicle('swat_van', 3);
      }
      if (this.roadblocks.length < 1) {
        this.spawnRoadblockAhead();
      }
      if (aliveCops.filter((c) => c.isSwat).length < 4) {
        const angle = Math.random() * Math.PI * 2;
        this.spawnPoliceOfficer(
          clamp(this.playerX + Math.cos(angle) * 38, -WORLD_LIMIT + 12, WORLD_LIMIT - 12),
          clamp(this.playerZ + Math.sin(angle) * 38, -WORLD_LIMIT + 12, WORLD_LIMIT - 12),
          3,
          { hostile: true },
        );
      }
    } else if (this.wantedLevel === 4) {
      // 4★: Elite Commandos + Chopper (Chopper updated in stepPoliceChopper)
      const swatVans = this.vehicles.filter((v) => !v.destroyed && v.kind === 'swat_van');
      if (swatVans.length < 2) {
        this.spawnTacticalReinforcementVehicle('swat_van', 4);
      }
      if (aliveCops.filter((c) => c.isCommando).length < 4) {
        const angle = Math.random() * Math.PI * 2;
        this.spawnPoliceOfficer(
          clamp(this.playerX + Math.cos(angle) * 38, -WORLD_LIMIT + 12, WORLD_LIMIT - 12),
          clamp(this.playerZ + Math.sin(angle) * 38, -WORLD_LIMIT + 12, WORLD_LIMIT - 12),
          4,
          { hostile: true },
        );
      }
    } else if (this.wantedLevel >= 5) {
      // 5★: Full Indian Army Trucks + Armored APCs + Soldiers + Chopper
      const armyVehs = this.vehicles.filter(
        (v) => !v.destroyed && (v.kind === 'army_truck' || v.kind === 'armored_apc'),
      );
      if (armyVehs.length < 2) {
        this.spawnTacticalReinforcementVehicle(armyVehs.length === 0 ? 'armored_apc' : 'army_truck', 5);
      }
      if (aliveCops.filter((c) => c.isArmy).length < 5) {
        const angle = Math.random() * Math.PI * 2;
        this.spawnPoliceOfficer(
          clamp(this.playerX + Math.cos(angle) * 40, -WORLD_LIMIT + 12, WORLD_LIMIT - 12),
          clamp(this.playerZ + Math.sin(angle) * 40, -WORLD_LIMIT + 12, WORLD_LIMIT - 12),
          5,
          { hostile: true },
        );
      }
    }
  }

  private stepLawEnforcementAndWitness(dt: number): void {
    if (this.licenseGraceTimer > 0) {
      this.licenseGraceTimer = Math.max(0, this.licenseGraceTimer - dt);
    }

    // 1) Passive public weapon brandishing detection at 0★
    const holdingGunInPublic =
      !this.currentVehicle &&
      this.activeWeapon !== 'fists' &&
      this.wantedLevel === 0 &&
      this.missionPhase === 'NONE' &&
      !this.noPoliceCheat &&
      this.licenseGraceTimer <= 0 &&
      !this.isNearLicenseRange() &&
      Math.hypot(this.playerX - 30, this.playerZ - -29) > 15; // Safe inside Pankaj Shastra Bhandar!

    if (holdingGunInPublic && !this.activeWitness && !this.policeInspection) {
      this.brandishExposeTimer += dt;
      if (this.brandishExposeTimer >= 1.25) {
        this.brandishExposeTimer = 0;
        const nearCop = this.npcs.find(
          (n) => !n.dead && n.isPolice && Math.hypot(n.x - this.playerX, n.z - this.playerZ) < 20,
        );
        if (nearCop) {
          this.initiatePoliceLicenseCheck('brandishing', nearCop);
        } else {
          this.startWitnessCallNearPlayer('brandishing', 4.4);
        }
      }
    } else if (!holdingGunInPublic) {
      this.brandishExposeTimer = 0;
    }

    // 2) Active NPC Witness calling Police on fictional smartphone
    if (this.activeWitness) {
      const wNpc = this.npcs.find((n) => n.id === this.activeWitness!.npcId && !n.dead);
      const dist = wNpc ? Math.hypot(wNpc.x - this.playerX, wNpc.z - this.playerZ) : 999;
      if (!wNpc || dist > 48) {
        if (wNpc) wNpc.rig.phoneProp.visible = false;
        this.activeWitness = null;
      } else {
        this.activeWitness.remaining -= dt;
        this.activeWitness.beepAccum -= dt;
        if (this.activeWitness.beepAccum <= 0) {
          this.activeWitness.beepAccum = 1.25;
          soundEngine.playPhoneDialBeep();
        }
        if (this.activeWitness.remaining <= 0) {
          const reason = this.activeWitness.reason;
          wNpc.rig.phoneProp.visible = false;
          this.activeWitness = null;
          if (reason === 'vehicle_theft') {
            this.setWantedLevelSafe(1);
          } else if (reason === 'assault' || reason === 'murder') {
            this.setWantedLevelSafe(reason === 'murder' && this.civilianKillsInSpree >= 2 ? 2 : 1);
          } else {
            this.initiatePoliceLicenseCheck(reason);
          }
        }
      }
    }

    // 3) Police Arms License Check state machine
    if (this.policeInspection) {
      const insp = this.policeInspection;
      const cop = this.npcs.find((n) => n.id === insp.officerId && !n.dead);
      if (!cop) {
        this.policeInspection = null;
      } else {
        const dist = Math.hypot(cop.x - this.playerX, cop.z - this.playerZ);
        if (insp.phase === 'APPROACHING') {
          insp.timer -= dt;
          if (dist <= 6.8) {
            insp.phase = 'ASKING';
            insp.timer = 12;
            soundEngine.playPoliceWhistle();
            const checkLine = pickHindiLine('police_license_check');
            this.speakWithSubtitle(
              cop.name,
              'officer',
              cop.id,
              checkLine.text,
              checkLine.tts,
            );
          } else if (dist > 56 || insp.timer <= 0) {
            this.respondToLicenseCheck(false);
          }
        } else {
          // ASKING
          insp.timer -= dt;
          if (dist > 25 || insp.timer <= 0) {
            this.respondToLicenseCheck(false);
          }
        }
      }
    }

    // 4) Escalated tactical spawns & 4★/5★ Police Chopper
    this.stepWantedReinforcements(dt);
    this.stepPoliceChopper(dt);
  }

  private addWanted(stars: number): void {
    this.setWantedLevelSafe(stars);
  }

  private damagePlayer(amount: number, reason: string): void {
    if (this.mode !== 'PLAYING' || this.wastedLock) return;
    let remaining = amount;
    if (this.playerArmor > 0) {
      const absorbed = Math.min(this.playerArmor, remaining * 0.7);
      this.playerArmor = Math.max(0, this.playerArmor - absorbed);
      remaining -= absorbed;
    }
    this.playerHp = Math.max(0, this.playerHp - remaining);

    if (this.playerHp <= 0 && !this.wastedLock) {
      this.wastedLock = true;
      this.wastedReason = reason;
      soundEngine.playWastedImpact();
      soundEngine.speakPoliceLine('kill');
      this.setMode('WASTED');
    }
  }

  // --- Physics & Collisions ---

  private pushCircleOutOfOrientedBox(
    px: number,
    pz: number,
    radius: number,
    bx: number,
    bz: number,
    byaw: number,
    halfW: number,
    halfL: number,
  ): { x: number; z: number } {
    const dx = px - bx;
    const dz = pz - bz;
    const c = Math.cos(byaw);
    const s = Math.sin(byaw);
    // Vehicle right = (c, -s), forward = (-s, -c)
    const lx = dx * c - dz * s;
    const lz = -dx * s - dz * c;

    const clampedX = clamp(lx, -halfW, halfW);
    const clampedZ = clamp(lz, -halfL, halfL);
    const offX = lx - clampedX;
    const offZ = lz - clampedZ;
    const distSq = offX * offX + offZ * offZ;

    if (distSq >= radius * radius) {
      return { x: px, z: pz };
    }

    let pushLocalX = 0;
    let pushLocalZ = 0;
    if (distSq > 0.00001) {
      const dist = Math.sqrt(distSq);
      const push = radius - dist;
      pushLocalX = (offX / dist) * push;
      pushLocalZ = (offZ / dist) * push;
    } else {
      const penLeft = Math.abs(lx + halfW);
      const penRight = Math.abs(halfW - lx);
      const penFront = Math.abs(halfL - lz);
      const penBack = Math.abs(lz + halfL);
      const minP = Math.min(penLeft, penRight, penFront, penBack);
      if (minP === penLeft) pushLocalX = -(penLeft + radius);
      else if (minP === penRight) pushLocalX = penRight + radius;
      else if (minP === penFront) pushLocalZ = penFront + radius;
      else pushLocalZ = -(penBack + radius);
    }

    const wx = pushLocalX * c - pushLocalZ * s;
    const wz = -pushLocalX * s - pushLocalZ * c;
    return { x: px + wx, z: pz + wz };
  }

  private resolveCollisions(
    x: number,
    z: number,
    radius: number,
    ignoreVehicleId?: number,
    skipVehicles = false,
    altitudeY = 0,
  ): { x: number; z: number } {
    let rx = clamp(x, -WORLD_LIMIT, WORLD_LIMIT);
    let rz = clamp(z, -WORLD_LIMIT, WORLD_LIMIT);

    // 60m Spatial Hash Grid Lookup (replaces scanning 400+ static colliders every call)
    const pad = radius + 2.0;
    const gx0 = Math.floor((rx - pad) / COLLIDER_CELL_SIZE);
    const gx1 = Math.floor((rx + pad) / COLLIDER_CELL_SIZE);
    const gz0 = Math.floor((rz - pad) / COLLIDER_CELL_SIZE);
    const gz1 = Math.floor((rz + pad) / COLLIDER_CELL_SIZE);
    this._visitedColliders.clear();

    for (let gx = gx0; gx <= gx1; gx++) {
      for (let gz = gz0; gz <= gz1; gz++) {
        const bucket = this.colliderGrid.get(`${gx},${gz}`);
        if (!bucket) continue;
        for (let i = 0; i < bucket.length; i++) {
          const c = bucket[i];
          if (this._visitedColliders.has(c) || this.disabledColliders.has(c)) continue;
          this._visitedColliders.add(c);
          if (altitudeY > c.height + 0.5) continue;
          const closestX = clamp(rx, c.minX, c.maxX);
          const closestZ = clamp(rz, c.minZ, c.maxZ);
          const dx = rx - closestX;
          const dz = rz - closestZ;
          const distSq = dx * dx + dz * dz;
          if (distSq < radius * radius) {
            const dist = Math.sqrt(distSq);
            if (dist > 0.0001) {
              const push = radius - dist;
              rx += (dx / dist) * push;
              rz += (dz / dist) * push;
            } else {
              const dLeft = Math.abs(rx - c.minX);
              const dRight = Math.abs(c.maxX - rx);
              const dTop = Math.abs(rz - c.minZ);
              const dBottom = Math.abs(c.maxZ - rz);
              const minD = Math.min(dLeft, dRight, dTop, dBottom);
              if (minD === dLeft) rx = c.minX - radius;
              else if (minD === dRight) rx = c.maxX + radius;
              else if (minD === dTop) rz = c.minZ - radius;
              else rz = c.maxZ + radius;
            }
          }
        }
      }
    }

    for (const cc of this.circleColliders) {
      if (altitudeY > cc.height + 0.5) continue;
      if (Math.abs(rx - cc.x) > cc.radius + radius + 0.5 || Math.abs(rz - cc.z) > cc.radius + radius + 0.5) continue;
      const dx = rx - cc.x;
      const dz = rz - cc.z;
      const minD = cc.radius + radius;
      const dist = Math.hypot(dx, dz);
      if (dist < minD) {
        if (dist > 0.001) {
          rx = cc.x + (dx / dist) * minD;
          rz = cc.z + (dz / dist) * minD;
        } else {
          rx = cc.x + minD;
        }
      }
    }

    if (!skipVehicles && altitudeY < 2.8) {
      for (const v of this.vehicles) {
        if (v.id === ignoreVehicleId) continue;
        if ((v.y ?? 0) > 2.8) continue;
        if (Math.abs(rx - v.x) > 4.5 || Math.abs(rz - v.z) > 4.5) continue;
        const halfW = v.kind === 'bike' ? 0.42 : v.kind === 'rickshaw' ? 0.85 : 1.12;
        const halfL = v.kind === 'bike' ? 1.05 : v.kind === 'rickshaw' ? 1.52 : 2.32;
        const pushed = this.pushCircleOutOfOrientedBox(rx, rz, radius, v.x, v.z, v.yaw, halfW, halfL);
        rx = pushed.x;
        rz = pushed.z;
      }
      if (this.rescueVan && Math.abs(rx - this.rescueVanPos.x) <= 5 && Math.abs(rz - this.rescueVanPos.z) <= 5) {
        const pushed = this.pushCircleOutOfOrientedBox(
          rx,
          rz,
          radius,
          this.rescueVanPos.x,
          this.rescueVanPos.z,
          0,
          1.28,
          2.85,
        );
        rx = pushed.x;
        rz = pushed.z;
      }
    }

    return { x: rx, z: rz };
  }

  private raycastBuildings(ox: number, oz: number, dx: number, dz: number, maxDist: number): number {
    const step = 1.25;
    for (let t = 1.0; t < maxDist; t += step) {
      const px = ox + dx * t;
      const pz = oz + dz * t;
      const bucket = this.colliderGrid.get(`${Math.floor(px / COLLIDER_CELL_SIZE)},${Math.floor(pz / COLLIDER_CELL_SIZE)}`);
      if (!bucket) continue;
      for (let i = 0; i < bucket.length; i++) {
        const c = bucket[i];
        if (this.disabledColliders.has(c)) continue;
        if (px >= c.minX && px <= c.maxX && pz >= c.minZ && pz <= c.maxZ) {
          return t;
        }
      }
    }
    return maxDist;
  }

  // --- Main Loop ---

  private loop = (): void => {
    if (this.disposed) return;

    const now = performance.now();
    const rawDt = Math.min(0.05, Math.max(0.001, (now - this.lastTime) / 1000));
    this.lastTime = now;

    if (this.mode === 'PLAYING') {
      const simDt = this.weaponWheelOpen ? rawDt * 0.16 : rawDt;
      this.stepSimulation(simDt);
      this.updateDynamicInteriorLight();
    } else if (this.mode === 'CUSTODY') {
      this.stepCustodyCutscene(rawDt);
      this.updateDynamicInteriorLight();
    } else if (this.mode === 'SLEEP') {
      this.stepSleepCutscene(rawDt);
      this.updateDynamicInteriorLight();
    } else if (this.mode === 'COURTROOM') {
      this.stepCourtroom(rawDt);
      this.updateDynamicInteriorLight();
    } else if (this.mode === 'JAIL') {
      this.stepJail(rawDt);
      this.updateDynamicInteriorLight();
    } else if (this.mode === 'TITLE') {
      // Gentle cinematic camera orbit on Title Screen
      this.camYaw += rawDt * 0.14;
      this.updateCamera(rawDt);
      this.updateDynamicInteriorLight();
    }

    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.loop);
    } else {
      this.frameId = requestAnimationFrame(this.loop);
    }
  };

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as Partial<WebGL2RenderingContext> | null;
    if (!gl || typeof gl.fenceSync !== 'function' || typeof gl.getSyncParameter !== 'function') {
      this.frameId = window.setTimeout(cb, 32);
      return;
    }
    try {
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE!, 0);
      gl.flush?.();
      const poll = () => {
        if (this.disposed) return;
        const state = sync && gl.getSyncParameter!(sync, gl.SYNC_STATUS!);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync?.(sync);
          this.frameId = window.setTimeout(cb, 80);
        }
      };
      this.frameId = window.setTimeout(poll, 5);
    } catch {
      this.frameId = window.setTimeout(cb, 32);
    }
  }

  private getSignalAxisState(sig: TrafficSignalRig, axis: 'x' | 'z'): 'GREEN' | 'YELLOW' | 'RED' {
    // Cycle = 24s: [0..9.5 NS Green] [9.5..12 NS Yellow] [12..21.5 EW Green] [21.5..24 EW Yellow]
    const phase = (this.signalTime + sig.cycleOffset) % 24;
    if (axis === 'z') {
      if (phase < 9.5) return 'GREEN';
      if (phase < 12.0) return 'YELLOW';
      return 'RED';
    } else {
      if (phase >= 12.0 && phase < 21.5) return 'GREEN';
      if (phase >= 21.5) return 'YELLOW';
      return 'RED';
    }
  }

  private stepTrafficSignals(dt: number): void {
    this.signalTime += dt;
    for (const [k, ttl] of this.signalJumpCooldowns.entries()) {
      if (ttl - dt <= 0) this.signalJumpCooldowns.delete(k);
      else this.signalJumpCooldowns.set(k, ttl - dt);
    }
    for (const sig of this.trafficSignals) {
      const ns = this.getSignalAxisState(sig, 'z');
      const ew = this.getSignalAxisState(sig, 'x');
      const prev = this.signalStateCache.get(sig.id);
      if (prev && prev.ns === ns && prev.ew === ew) continue;
      this.signalStateCache.set(sig.id, { ns, ew });
      for (const m of sig.nsRedMats) m.emissiveIntensity = ns === 'RED' ? 2.8 : 0.08;
      for (const m of sig.nsYellowMats) m.emissiveIntensity = ns === 'YELLOW' ? 2.8 : 0.08;
      for (const m of sig.nsGreenMats) m.emissiveIntensity = ns === 'GREEN' ? 2.8 : 0.08;
      for (const m of sig.ewRedMats) m.emissiveIntensity = ew === 'RED' ? 2.8 : 0.08;
      for (const m of sig.ewYellowMats) m.emissiveIntensity = ew === 'YELLOW' ? 2.8 : 0.08;
      for (const m of sig.ewGreenMats) m.emissiveIntensity = ew === 'GREEN' ? 2.8 : 0.08;
    }
  }

  private checkPlayerTrafficViolations(dt: number): void {
    if (this.challanCooldown > 0) this.challanCooldown = Math.max(0, this.challanCooldown - dt);
    if (!this.currentVehicle || Math.abs(this.currentVehicle.speed) < 3.5) return;
    const v = this.currentVehicle;

    // 1) Foot Police Helmet & Driving License spot-check challan
    if (
      this.challanCooldown <= 0 &&
      this.wantedLevel === 0 &&
      !this.noPoliceCheat &&
      this.missionPhase === 'NONE'
    ) {
      let spotCop: NpcEntity | null = null;
      let minD = 15.5;
      for (const npc of this.npcs) {
        if (npc.dead || !npc.isPolice) continue;
        const d = Math.hypot(npc.x - this.playerX, npc.z - this.playerZ);
        if (d < minD) {
          const dirX = (this.playerX - npc.x) / Math.max(0.1, d);
          const dirZ = (this.playerZ - npc.z) / Math.max(0.1, d);
          if (this.raycastBuildings(npc.x, npc.z, dirX, dirZ, d) >= d - 0.9) {
            minD = d;
            spotCop = npc;
          }
        }
      }
      if (spotCop) {
        if (v.kind === 'bike' && (!this.hasHelmet || !this.helmetOn)) {
          this.challanCooldown = 16;
          this.trafficFineStrikes++;
          this.playerCash -= NO_HELMET_FINE_INR;
          soundEngine.playPoliceWhistle();
          spotCop.yaw = Math.atan2(-(this.playerX - spotCop.x), -(this.playerZ - spotCop.z));
          const helmetLine = pickHindiLine('traffic_no_helmet', { fine: formatRs(NO_HELMET_FINE_INR) });
          this.speakWithSubtitle(
            spotCop.name,
            'officer',
            spotCop.id,
            helmetLine.text,
            helmetLine.tts,
          );
          this.callbacks.onToast({
            text: `TRAFFIC CHALLAN: Bina Helmet -${formatRs(NO_HELMET_FINE_INR)} ([L] se Helmet pehno)`,
            tone: 'warn',
          });
          if (this.trafficFineStrikes >= 3) {
            this.setWantedLevelSafe(1);
          }
          this.saveGameState();
          return;
        } else if (!this.hasDrivingLicense) {
          this.challanCooldown = 18;
          this.trafficFineStrikes++;
          this.playerCash -= NO_DL_FINE_INR;
          soundEngine.playPoliceWhistle();
          spotCop.yaw = Math.atan2(-(this.playerX - spotCop.x), -(this.playerZ - spotCop.z));
          const dlLine = pickHindiLine('traffic_no_dl', { fine: formatRs(NO_DL_FINE_INR) });
          this.speakWithSubtitle(
            spotCop.name,
            'officer',
            spotCop.id,
            dlLine.text,
            dlLine.tts,
          );
          this.callbacks.onToast({
            text: `TRAFFIC CHALLAN: Bina Driving License -${formatRs(NO_DL_FINE_INR)} (DM Office se DL banwao)`,
            tone: 'warn',
          });
          if (this.trafficFineStrikes >= 3) {
            this.setWantedLevelSafe(1);
          }
          this.saveGameState();
          return;
        }
      }
    }

    if (Math.abs(v.speed) < 4.2) return;
    const drivingAxis: 'x' | 'z' = Math.abs(Math.sin(v.yaw)) > Math.abs(Math.cos(v.yaw)) ? 'x' : 'z';

    for (const sig of this.trafficSignals) {
      if (Math.abs(this.playerX - sig.x) > 7.2 || Math.abs(this.playerZ - sig.z) > 7.2) continue;
      if (this.signalJumpCooldowns.has(sig.id)) continue;

      const lightState = this.getSignalAxisState(sig, drivingAxis);
      if (lightState !== 'RED') continue;

      this.signalJumpCooldowns.set(sig.id, 6.5);
      this.redLightViolations++;

      // Find nearest standing/walking on-foot policeman (NEVER a cruiser!)
      let nearestFootCop: NpcEntity | null = null;
      let nearestCopDist = 48;
      let witnessingWalkingCop: NpcEntity | null = null;
      let minWitnessDist = 36;

      for (const npc of this.npcs) {
        if (npc.dead || !npc.isPolice) continue;
        const d = Math.hypot(npc.x - this.playerX, npc.z - this.playerZ);
        if (d < nearestCopDist) {
          nearestCopDist = d;
          nearestFootCop = npc;
        }
        if (d < minWitnessDist) {
          const dirX = (this.playerX - npc.x) / Math.max(0.1, d);
          const dirZ = (this.playerZ - npc.z) / Math.max(0.1, d);
          const wallDist = this.raycastBuildings(npc.x, npc.z, dirX, dirZ, d);
          if (wallDist >= d - 0.9) {
            minWitnessDist = d;
            witnessingWalkingCop = npc;
          }
        }
      }

      if (this.redLightViolations <= 2) {
        // Ignoring once/twice: NO wanted star, just traffic cop whistle + Hindi warning
        if (nearestFootCop) {
          soundEngine.playPoliceWhistle();
          nearestFootCop.yaw = Math.atan2(-(this.playerX - nearestFootCop.x), -(this.playerZ - nearestFootCop.z));
          const redLine = pickHindiLine('traffic_red_light');
          this.speakWithSubtitle(
            nearestFootCop.name,
            'officer',
            nearestFootCop.id,
            redLine.text,
            redLine.tts,
          );
          this.callbacks.onToast({
            text: `Traffic Police ne seeti bajayi! Laal batti mat todo (${this.redLightViolations}/3)`,
            tone: 'warn',
          });
        } else {
          this.callbacks.onToast({
            text: `Laal batti paar ki! (${this.redLightViolations}/3)`,
            tone: 'info',
          });
        }
      } else {
        // Too many red-light jumps (>= 3): wanted star ONLY if a walking/on-foot policeman saw you!
        if (witnessingWalkingCop) {
          soundEngine.playPoliceWhistle();
          witnessingWalkingCop.hostile = true;
          witnessingWalkingCop.yaw = Math.atan2(
            -(this.playerX - witnessingWalkingCop.x),
            -(this.playerZ - witnessingWalkingCop.z),
          );
          this.speakWithSubtitle(
            witnessingWalkingCop.name,
            'officer',
            witnessingWalkingCop.id,
            'Baar-baar laal batti todta hai! Pakdo isko!',
            'बार-बार लाल बत्ती तोड़ता है! पकड़ो इसको!',
          );
          this.addWanted(1);
          this.callbacks.onToast({
            text: 'Paidal Police ne laal batti todte dekh liya! +1★ Wanted',
            tone: 'warn',
          });
        } else {
          this.callbacks.onToast({
            text: 'Laal batti todi! Koi paidal police wala dekh nahi raha tha.',
            tone: 'info',
          });
        }
      }
    }
  }

  private applyTimeOfDayLighting(): void {
    if (!this.scene || !this.sunLight || !this.hemiLight || !this.rimLight) return;

    const m = this.gameMinutes;
    const stops = TIME_LIGHT_STOPS;
    let a = stops[0];
    let b = stops[1];
    for (let i = 0; i < stops.length - 1; i++) {
      if (m >= stops[i].min && m <= stops[i + 1].min) {
        a = stops[i];
        b = stops[i + 1];
        break;
      }
    }
    const span = Math.max(1, b.min - a.min);
    const t = clamp((m - a.min) / span, 0, 1);

    this._tmpColorA.setHex(a.sky);
    this._tmpColorB.setHex(b.sky);
    this._tmpColorA.lerp(this._tmpColorB, t);
    if (this.scene.background instanceof THREE.Color) {
      this.scene.background.copy(this._tmpColorA);
    } else {
      this.scene.background = this._tmpColorA.clone();
    }
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.copy(this._tmpColorA);
      this.scene.fog.density = THREE.MathUtils.lerp(a.fog, b.fog, t);
    }

    this._tmpColorA.setHex(a.sun);
    this._tmpColorB.setHex(b.sun);
    this.sunLight.color.copy(this._tmpColorA.lerp(this._tmpColorB, t));
    this.sunLight.intensity = THREE.MathUtils.lerp(a.sunInt, b.sunInt, t);

    this._tmpColorA.setHex(a.hemi);
    this._tmpColorB.setHex(b.hemi);
    this.hemiLight.color.copy(this._tmpColorA.lerp(this._tmpColorB, t));
    this.hemiLight.intensity = THREE.MathUtils.lerp(a.hemiInt, b.hemiInt, t);

    this.rimLight.intensity = THREE.MathUtils.lerp(0.28, 0.52, clamp(this.sunLight.intensity / 2.2, 0, 1));
    this.renderer.toneMappingExposure = THREE.MathUtils.lerp(a.exp, b.exp, t);

    const lampIntensity = THREE.MathUtils.lerp(a.lamp, b.lamp, t);
    if (Math.abs(lampIntensity - this.lastLampIntensity) > 0.025) {
      this.lastLampIntensity = lampIntensity;
      for (const mat of this.nightEmissiveMats) {
        mat.emissiveIntensity = lampIntensity;
      }
    }
  }

  private stepCustodyCutscene(dt: number): void {
    const cc = this.custodyCutscene;
    if (!cc) return;
    this.stepTimeOfDay(dt);
    this.stepThanaAndCourtActors(dt, true);
    cc.timer += dt;

    const p = clamp(cc.timer / Math.max(0.1, cc.duration), 0, 1);

    if (cc.phase === 'THANA_LOCKUP') {
      const cell = this.jailRig?.thanaLockupCellPos ?? new THREE.Vector3(-141.2, 0.28, 161.5);
      const insp = this.jailRig?.thanaInspectorActor;
      const inspDest = this.jailRig?.thanaInspectorPos ?? new THREE.Vector3(-140.8, 0.28, 165.55);
      const doorPos = this.jailRig?.thanaDoorwayPos ?? new THREE.Vector3(-150, 0.18, 174.5);

      if (insp) {
        if (p < 0.34) {
          // Walk from Duty Desk to Lockup Cell Review Chair
          const k = p / 0.34;
          const ix = THREE.MathUtils.lerp(insp.baseX, inspDest.x, k);
          const iz = THREE.MathUtils.lerp(insp.baseZ, inspDest.z, k);
          const dx = inspDest.x - insp.baseX;
          const dz = inspDest.z - insp.baseZ;
          insp.rig.root.position.set(ix, 0.28, iz);
          insp.rig.root.rotation.set(0, Math.atan2(-dx, -dz), 0);
          const swing = Math.sin(performance.now() * 0.012) * 0.52;
          insp.rig.leftLeg.rotation.x = swing;
          insp.rig.rightLeg.rotation.x = -swing;
          insp.rig.leftArm.rotation.x = 0.65;
          insp.rig.rightArm.rotation.x = -swing * 0.35;
          cc.stepLabel = 'Step 1 of 4 · Inspector Arriving at Lockup Cell';
        } else if (p < 0.72) {
          // Sit at cell-front review chair facing the bars & review FIR file
          insp.rig.root.position.set(inspDest.x, 0.08, inspDest.z);
          insp.rig.root.rotation.set(0, 0, 0); // Facing north toward lockup bars
          insp.rig.leftLeg.rotation.x = -1.15;
          insp.rig.rightLeg.rotation.x = -1.15;
          insp.rig.leftArm.rotation.x = 0.75;
          insp.rig.rightArm.rotation.x = 0.75 + Math.sin(performance.now() * 0.01) * 0.22;
          cc.stepLabel = 'Step 1 of 4 · Inspector Sitting & Reviewing FIR File';
        } else {
          // Stand up and escort toward the Thana front doorway / Prisoner Van
          const k = (p - 0.72) / 0.28;
          const ix = THREE.MathUtils.lerp(inspDest.x, doorPos.x, k * 0.65);
          const iz = THREE.MathUtils.lerp(inspDest.z, doorPos.z, k * 0.65);
          const dx = doorPos.x - inspDest.x;
          const dz = doorPos.z - inspDest.z;
          insp.rig.root.position.set(ix, 0.28, iz);
          insp.rig.root.rotation.set(0, Math.atan2(-dx, -dz), 0);
          const swing = Math.sin(performance.now() * 0.012) * 0.5;
          insp.rig.leftLeg.rotation.x = swing;
          insp.rig.rightLeg.rotation.x = -swing;
          insp.rig.leftArm.rotation.x = 0.6;
          insp.rig.rightArm.rotation.x = 0.45;
          cc.stepLabel = 'Step 1 of 4 · Inspector Escorting You to Prisoner Van';
        }
      }

      const t = performance.now() * 0.0018;
      this._camDesired.set(cell.x - 1.8 + Math.sin(t) * 0.45, 2.55, cell.z + 6.4);
      this._camTarget.set((cell.x + inspDest.x) * 0.5, 1.15, (cell.z + inspDest.z) * 0.5);
      this.camera.position.lerp(this._camDesired, 1 - Math.exp(-5 * dt));
      this.camera.lookAt(this._camTarget);
    } else {
      // Drive the barred Prisoner Van smoothly along city road grid
      let vx = cc.startX;
      let vz = cc.startZ;
      let yaw = 0;
      if (cc.phase === 'VAN_TO_COURT') {
        // (-150, 180) -> East to (-90, 180) -> North to (-90, 108)
        if (p < 0.48) {
          const k = p / 0.48;
          vx = THREE.MathUtils.lerp(-150, -90, k);
          vz = 180;
          yaw = -Math.PI / 2;
        } else {
          const k = (p - 0.48) / 0.52;
          vx = -90;
          vz = THREE.MathUtils.lerp(180, 108, k);
          yaw = 0;
        }
      } else if (cc.phase === 'VAN_TO_THANA_RELEASE') {
        // (-90, 108) -> South to (-90, 180) -> West to (-150, 178)
        if (p < 0.52) {
          const k = p / 0.52;
          vx = -90;
          vz = THREE.MathUtils.lerp(108, 180, k);
          yaw = Math.PI;
        } else {
          const k = (p - 0.52) / 0.48;
          vx = THREE.MathUtils.lerp(-90, -150, k);
          vz = THREE.MathUtils.lerp(180, cc.endZ, k);
          yaw = Math.PI / 2;
        }
      } else {
        // VAN_TO_JAIL: (-90, 108) -> South to (-90, 180) -> West to (-150, 180) -> North into Central Jail Yard (-150, 152)
        if (p < 0.42) {
          const k = p / 0.42;
          vx = -90;
          vz = THREE.MathUtils.lerp(108, 180, k);
          yaw = Math.PI;
        } else if (p < 0.78) {
          const k = (p - 0.42) / 0.36;
          vx = THREE.MathUtils.lerp(-90, -150, k);
          vz = 180;
          yaw = Math.PI / 2;
        } else {
          const k = (p - 0.78) / 0.22;
          vx = -150;
          vz = THREE.MathUtils.lerp(180, cc.endZ, k);
          yaw = 0;
          if (this.jailRig) {
            this.jailRig.mainGateDoor.position.y = THREE.MathUtils.lerp(2.3, 6.4, Math.min(1, k * 1.4));
          }
        }
      }
      if (this.prisonerVan) {
        this.prisonerVan.root.position.set(vx, 0, vz);
        this.prisonerVan.root.rotation.set(0, yaw, 0);
        for (const w of this.prisonerVan.wheels) {
          w.rotation.x -= dt * 10;
        }
        const flash = Math.sin(performance.now() * 0.018) > 0;
        if (this.prisonerVan.lightBarRed) {
          (this.prisonerVan.lightBarRed.material as THREE.MeshBasicMaterial).color.setHex(
            flash ? 0xff2222 : 0x550000,
          );
        }
        if (this.prisonerVan.lightBarBlue) {
          (this.prisonerVan.lightBarBlue.material as THREE.MeshBasicMaterial).color.setHex(
            !flash ? 0x3b82f6 : 0x0f172a,
          );
        }
      }
      const fwdX = -Math.sin(yaw);
      const fwdZ = -Math.cos(yaw);
      // Elevated top-down / cinematic escort camera framing the Prisoner Van along city streets
      this._camDesired.set(vx - fwdX * 8.8 + 4.2, 10.6, vz - fwdZ * 8.8 + 3.2);
      this._camTarget.set(vx, 1.2, vz);
      this.camera.position.lerp(this._camDesired, 1 - Math.exp(-5 * dt));
      this.camera.lookAt(this._camTarget);
    }

    if (cc.timer >= cc.duration && !soundEngine.isSpeaking()) {
      this.resetThanaInspectorPose();
      if (cc.phase === 'THANA_LOCKUP') {
        this.startCustodyCutscene('VAN_TO_COURT');
        return;
      }
      if (cc.phase === 'VAN_TO_COURT') {
        this.enterCourtroomFromCustody();
        return;
      }
      if (cc.phase === 'VAN_TO_THANA_RELEASE') {
        this.finalizeThanaRelease();
        return;
      }
      this.finalizeEnterCentralJail();
      return;
    }

    this.hudAccum += dt;
    if (this.hudAccum >= 0.08) {
      this.hudAccum = 0;
      this.emitHudSnapshot();
    }
  }

  private updateDynamicInteriorLight(): void {
    if (!this.interiorLight) return;
    if (this.mode === 'COURTROOM' && this.courtroomStage) {
      this.interiorLight.position.copy(this.courtroomStage.lightAnchor);
      this.interiorLight.color.setHex(0xffedd5);
      this.interiorLight.intensity = 3.2;
      this.interiorLight.distance = 32;
      return;
    }
    if (this.mode === 'CUSTODY') {
      if (this.custodyCutscene?.phase === 'THANA_LOCKUP') {
        this.interiorLight.position.set(-144, 5.2, 162);
        this.interiorLight.color.setHex(0xe0f2fe);
        this.interiorLight.intensity = 3.0;
        this.interiorLight.distance = 28;
      } else {
        this.interiorLight.intensity = 0;
      }
      return;
    }
    if (this.mode === 'SLEEP') {
      if (this.sleepCutscene?.location === 'JAIL_BUNK') {
        this.interiorLight.position.set(-166, 4.6, 140);
        this.interiorLight.color.setHex(0xbae6fd);
        this.interiorLight.intensity = 2.2;
        this.interiorLight.distance = 24;
      } else {
        this.interiorLight.position.set(34, 4.2, 85);
        this.interiorLight.color.setHex(0xffedd5);
        this.interiorLight.intensity = 2.6;
        this.interiorLight.distance = 22;
      }
      return;
    }
    if (this.mode === 'JAIL') {
      this.interiorLight.position.set(-150, 12, 150);
      this.interiorLight.color.setHex(0xfffbeb);
      this.interiorLight.intensity = 3.4;
      this.interiorLight.distance = 48;
      return;
    }
    let best: InteriorLightSpot | null = null;
    let bestD = 42;
    for (const spot of this.interiorLightSpots) {
      const d = Math.hypot(spot.x - this.playerX, spot.z - this.playerZ);
      if (d < bestD) {
        bestD = d;
        best = spot;
      }
    }
    if (best) {
      this.interiorLight.position.set(best.x, best.y, best.z);
      this.interiorLight.color.setHex(best.color);
      this.interiorLight.intensity = best.intensity;
      this.interiorLight.distance = best.distance;
    } else {
      this.interiorLight.intensity = 0;
    }
  }

  private stepCourtroom(dt: number): void {
    const stage = this.courtroomStage;
    const cs = this.courtroomState;
    if (!stage || !cs) return;

    stage.fanGroup.rotation.y += dt * 4.5;
    if (this.courtGavelTimer > 0) {
      this.courtGavelTimer = Math.max(0, this.courtGavelTimer - dt);
      stage.judgeRig.rightArm.rotation.x = Math.sin((this.courtGavelTimer / 0.55) * Math.PI * 2) * 0.95;
    } else {
      stage.judgeRig.rightArm.rotation.x = 0.25;
    }

    const turn = cs.dialogueTurns[cs.dialogueIndex];
    const tNow = performance.now() * 0.005;
    stage.lawyerRig.rightArm.rotation.x = turn?.speakerRole === 'lawyer' ? 0.6 + Math.sin(tNow) * 0.35 : 0;
    stage.inspectorRig.rightArm.rotation.x = turn?.speakerRole === 'inspector' ? 0.6 + Math.sin(tNow) * 0.35 : 0;

    // Frame active speaker smoothly in the courtroom
    const cx = stage.root.position.x;
    const cz = stage.root.position.z;
    if (turn?.speakerRole === 'lawyer') {
      this._camDesired.set(cx + 1.2, 2.3, cz + 2.8);
      this._camTarget.set(cx - 3.6, 1.45, cz - 0.5);
    } else if (turn?.speakerRole === 'inspector') {
      this._camDesired.set(cx - 1.2, 2.3, cz + 2.8);
      this._camTarget.set(cx + 3.6, 1.45, cz - 0.5);
    } else {
      this._camDesired.set(cx + Math.sin(tNow * 0.14) * 1.1, 2.85, cz + 5.6);
      this._camTarget.set(cx, 1.85, cz - 3.4);
    }
    this.camera.position.lerp(this._camDesired, 1 - Math.exp(-5 * dt));
    this.camera.lookAt(this._camTarget);

    // Wait for current full sentence TTS to finish before stepping to the next courtroom speaker
    if (!cs.argumentsFinished) {
      if (!soundEngine.isSpeaking()) {
        this.courtDialogueTimer += dt;
        if (this.courtDialogueTimer >= 1.15) {
          this.advanceCourtroomDialogue();
        }
      }
    }
  }

  private stepJail(dt: number): void {
    const js = this.jailState;
    const rig = this.jailRig;
    if (!js || !rig) return;

    this.stepTimeOfDay(dt);
    if (js.spotCooldown > 0) js.spotCooldown = Math.max(0, js.spotCooldown - dt);
    if (js.distractionTimer > 0) js.distractionTimer = Math.max(0, js.distractionTimer - dt);
    if (js.distractionCooldown > 0) js.distractionCooldown = Math.max(0, js.distractionCooldown - dt);
    if (js.toiletCooldown > 0) js.toiletCooldown = Math.max(0, js.toiletCooldown - dt);

    const schedulePhase = this.getJailSchedulePhase(this.gameMinutes);
    const meta = this.getJailScheduleMeta(schedulePhase);

    // Watchtower sweeping searchlight spotlights
    const nowSec = performance.now() * 0.001;
    rig.watchtowerBeams.forEach((beam, idx) => {
      beam.rotation.y = Math.sin(nowSec * 0.45 + idx * 1.55) * 0.95 + idx * 1.25;
      const cone = beam.children[1] as THREE.Mesh | undefined;
      if (cone) {
        const bMat = cone.material as THREE.MeshBasicMaterial;
        bMat.opacity = schedulePhase === 'NIGHT_LOCKUP' ? 0.28 : schedulePhase === 'FREE_YARD' ? 0.14 : 0.08;
      }
    });

    // Detect schedule transitions (Morning Work Shift / Evening Free Yard / Night Lockup Whistle)
    if (js.lastSchedulePhase !== schedulePhase) {
      js.lastSchedulePhase = schedulePhase;
      js.workSkipWarnTimer = 0;
      if (schedulePhase === 'NIGHT_LOCKUP') {
        soundEngine.playPoliceWhistle();
        soundEngine.playJailDoorClang();
        this.disabledColliders.delete(rig.cellGateCollider);
        if (this.playerX > -150 - 12.8) {
          this.playerX = rig.cellInsidePos.x;
          this.playerZ = rig.cellInsidePos.z;
          this.playerRig.root.position.set(this.playerX, 0.24, this.playerZ);
        }
        js.statusBanner = 'NIGHT WHISTLE (20:30)! Sabhi kaidi cell mein lock! Toilet [E] ya Bunk [E/1] par so jao.';
        this.callbacks.onToast({
          text: 'Night Lockup Whistle (20:30): Cell gate locked! Sleep at Bunk [E] for +1 Day & FD Interest.',
          tone: 'warn',
        });
      } else if (schedulePhase === 'WORK_SHIFT') {
        js.workShiftDoneToday = false;
        soundEngine.playJailDoorClang();
        this.disabledColliders.add(rig.cellGateCollider);
        js.statusBanner = 'SUBAH 06:00 ROLL CALL! Work Shift shuru — Workshop [E] par jaao!';
        this.callbacks.onToast({
          text: 'Morning Work Shift (06:00–17:00): Report to Workshop [E] to earn ₹2,000 & cut sentence!',
          tone: 'info',
        });
      } else {
        soundEngine.playPoliceWhistle();
        this.disabledColliders.add(rig.cellGateCollider);
        js.statusBanner = '17:00 FREE YARD HOUR! Chhotu [5/E] se Distraction karao aur East Gate / Grate se bhaagne ka mauka!';
        this.callbacks.onToast({
          text: 'Evening Free Yard Window (17:00–20:30): Guards relaxed — best Escape Window!',
          tone: 'cash',
        });
      }
    }

    // Slide barracks iron-bar door smoothly open (day) or locked shut (night lockup)
    const targetDoorZ = schedulePhase === 'NIGHT_LOCKUP' ? 150 - 7.5 : 150 - 7.5 - 3.0;
    rig.cellGateDoor.position.z = THREE.MathUtils.lerp(rig.cellGateDoor.position.z, targetDoorZ, Math.min(1, dt * 6));

    // Work Shift skipping warning if inmate idles outside workshop
    if (schedulePhase === 'WORK_SHIFT' && !js.workShiftDoneToday && js.activeTaskKind !== 'WORK') {
      const nearWorkshop = Math.hypot(this.playerX - rig.workshopPos.x, this.playerZ - rig.workshopPos.z) < 4.5;
      if (!nearWorkshop) {
        js.workSkipWarnTimer += dt;
        if (js.workSkipWarnTimer >= 20) {
          js.workSkipWarnTimer = 0;
          soundEngine.playPoliceWhistle();
          this.playerStamina = Math.max(15, this.playerStamina - 10);
          js.statusBanner = 'GUARD WARNING: Work Shift chal rahi hai! Workshop [E] par kaam karo warna saza badhegi!';
          this.callbacks.onToast({
            text: 'Guard Warning: Work Shift skip mat karo! Workshop [2/E] par kaam karo!',
            tone: 'warn',
          });
        }
      }
    }

    this.stepPlayer(dt);
    this.playerY = Math.max(0.24, this.playerY);
    this.playerRig.root.position.y = this.playerY;

    const nearEastGateZone =
      Math.hypot(this.playerX - rig.escapePos.x, this.playerZ - rig.escapePos.z) < 6.0;

    // Update patrolling prison guards & 3D translucent vision cones
    let spottedNow = false;
    const isFreeYard = schedulePhase === 'FREE_YARD';
    const guardSpeed = js.distractionTimer > 0 ? 3.3 : isFreeYard ? 1.75 : 2.4;
    const visionRange = js.distractionTimer > 0 ? 4.4 : isFreeYard ? 5.9 : 7.8;

    for (const g of rig.guards) {
      const targetWp =
        js.distractionTimer > 0
          ? { x: -150 - 11.2, z: 150 - 11.2 }
          : g.waypoints[g.wpIndex];
      const dx = targetWp.x - g.x;
      const dz = targetWp.z - g.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.45) {
        if (js.distractionTimer <= 0) {
          g.wpIndex = (g.wpIndex + 1) % g.waypoints.length;
        }
      } else {
        const desiredYaw = Math.atan2(-dx, -dz);
        g.yaw = lerpAngle(g.yaw, desiredYaw, 1 - Math.exp(-7 * dt));
        g.x += (dx / dist) * guardSpeed * dt;
        g.z += (dz / dist) * guardSpeed * dt;
      }
      g.rig.root.position.set(g.x, 0.24, g.z);
      g.rig.root.rotation.y = g.yaw;
      const swing = dist >= 0.45 ? Math.sin(performance.now() * 0.008) * 0.45 : 0;
      g.rig.leftLeg.rotation.x = swing;
      g.rig.rightLeg.rotation.x = -swing;

      const toPx = this.playerX - g.x;
      const toPz = this.playerZ - g.z;
      const dP = Math.hypot(toPx, toPz);
      let seesPlayer = false;
      if (dP < visionRange) {
        const gFwdX = -Math.sin(g.yaw);
        const gFwdZ = -Math.cos(g.yaw);
        const dot = (toPx / Math.max(0.01, dP)) * gFwdX + (toPz / Math.max(0.01, dP)) * gFwdZ;
        if (dot > Math.cos((36 * Math.PI) / 180)) {
          seesPlayer = true;
        }
      }
      const alertVisual = seesPlayer && (nearEastGateZone || js.activeTaskKind === 'ESCAPE');
      const coneMat = g.coneMesh.material as THREE.MeshBasicMaterial;
      if (alertVisual) {
        spottedNow = true;
        coneMat.color.setHex(0xef4444);
        coneMat.opacity = 0.36;
      } else {
        coneMat.color.setHex(js.distractionTimer > 0 ? 0x38bdf8 : 0xfef08a);
        coneMat.opacity = isFreeYard ? 0.16 : 0.22;
      }
    }
    js.spottedByGuard = spottedNow;

    // Animate 7 diverse fellow prisoners (including 2 hostile rivals) & collect proximity dialogue
    let closestInmateDist = 3.3;
    let closestTip: { name: string; text: string } | null = null;
    let allyInmateDist = Infinity;
    let nearestActiveRivalDist = Infinity;
    const playerInCell =
      this.playerX < -150 - 12.6 &&
      this.playerZ > 150 - 10.5 &&
      this.playerZ < 150 - 5.0;

    for (const inm of rig.inmates) {
      if (inm.staggerTimer > 0) inm.staggerTimer = Math.max(0, inm.staggerTimer - dt);
      if (inm.attackCooldown > 0) inm.attackCooldown = Math.max(0, inm.attackCooldown - dt);

      if (inm.isRival && inm.defeated) {
        inm.rig.root.position.set(inm.x, 0.42, inm.z);
        inm.rig.root.rotation.x = -Math.PI / 2;
        inm.rig.root.rotation.y = inm.yaw;
        continue;
      }

      const distPlayer = Math.hypot(this.playerX - inm.x, this.playerZ - inm.z);
      const canAggroRival =
        inm.isRival &&
        !inm.defeated &&
        !inm.bribed &&
        schedulePhase !== 'NIGHT_LOCKUP' &&
        !playerInCell &&
        (distPlayer < 9.5 || (inm.alerted && distPlayer < 14.5));

      if (canAggroRival) {
        inm.alerted = true;
        const dxP = this.playerX - inm.x;
        const dzP = this.playerZ - inm.z;
        inm.yaw = lerpAngle(inm.yaw, Math.atan2(-dxP, -dzP), 1 - Math.exp(-10 * dt));
        if (distPlayer > 1.55 && inm.staggerTimer <= 0) {
          const step = Math.min(distPlayer - 1.4, 2.75 * dt);
          inm.x = clamp(inm.x + (dxP / Math.max(0.01, distPlayer)) * step, -162.5, -132.5);
          inm.z = clamp(inm.z + (dzP / Math.max(0.01, distPlayer)) * step, 132.5, 152.0);
          const walk = Math.sin(nowSec * 11 + inm.seedId) * 0.52;
          inm.rig.leftLeg.rotation.x = walk;
          inm.rig.rightLeg.rotation.x = -walk;
          inm.rig.leftArm.rotation.x = -walk * 0.85;
          inm.rig.rightArm.rotation.x = walk * 0.85;
        } else if (distPlayer <= 1.85 && inm.attackCooldown <= 0 && inm.staggerTimer <= 0) {
          inm.attackCooldown = 1.45;
          inm.rig.rightArm.rotation.x = 1.4;
          soundEngine.playPunch(true);
          this.playerHp = Math.max(0, this.playerHp - 9);
          js.statusBanner = `${inm.name} ne hamla kiya! Fight [Click/J], Bhaago (>9.5m) ya Bribe ₹${inm.bribeCost} [6/B]!`;
          if (this.playerHp <= 0) {
            this.playerHp = 65;
            this.playerX = rig.bunkPos.x;
            this.playerZ = rig.bunkPos.z;
            this.playerRig.root.position.set(this.playerX, 0.24, this.playerZ);
            inm.alerted = false;
            js.remainingDays += 0.15;
            soundEngine.playPoliceWhistle();
            this.callbacks.onToast({
              text: 'Jail Infirmary: Rival ladai mein behosh ho gaye! (65 HP restored, +0.15d recovery)',
              tone: 'warn',
            });
          }
        }
        inm.rig.root.position.set(inm.x, 0.24, inm.z);
        inm.rig.root.rotation.set(0, inm.yaw, 0);
      } else {
        if (inm.isRival && inm.alerted && (distPlayer >= 11.5 || playerInCell || schedulePhase === 'NIGHT_LOCKUP')) {
          inm.alerted = false;
        }
        const target =
          schedulePhase === 'WORK_SHIFT'
            ? inm.workPos
            : schedulePhase === 'NIGHT_LOCKUP'
              ? inm.nightPos
              : inm.yardPos;
        const dx = target.x - inm.x;
        const dz = target.z - inm.z;
        const dTarget = Math.hypot(dx, dz);
        if (dTarget > 0.25) {
          const step = Math.min(dTarget, 2.2 * dt);
          inm.x += (dx / dTarget) * step;
          inm.z += (dz / dTarget) * step;
          inm.yaw = lerpAngle(inm.yaw, Math.atan2(-dx, -dz), 1 - Math.exp(-8 * dt));
          const walk = Math.sin(nowSec * 8 + inm.seedId) * 0.48;
          inm.rig.leftLeg.rotation.x = walk;
          inm.rig.rightLeg.rotation.x = -walk;
          inm.rig.leftArm.rotation.x = -walk * 0.8;
          inm.rig.rightArm.rotation.x = walk * 0.8;
        } else {
          inm.yaw = lerpAngle(inm.yaw, target.yaw, 1 - Math.exp(-6 * dt));
          inm.rig.leftLeg.rotation.x = 0;
          inm.rig.rightLeg.rotation.x = 0;
          if (inm.role === 'exercise' && schedulePhase !== 'NIGHT_LOCKUP') {
            const reps = Math.sin(nowSec * 3.8 + inm.seedId);
            inm.rig.root.position.y = 0.24 - Math.abs(reps) * 0.14;
            inm.rig.leftArm.rotation.x = -Math.PI * 0.45 + reps * 0.35;
            inm.rig.rightArm.rotation.x = -Math.PI * 0.45 + reps * 0.35;
          } else if (inm.role === 'eat' && schedulePhase === 'FREE_YARD') {
            inm.rig.root.position.y = 0.24;
            inm.rig.rightArm.rotation.x = -0.9 + Math.sin(nowSec * 4.5) * 0.35;
            inm.rig.leftArm.rotation.x = -0.35;
          } else if (inm.role === 'workshop' || schedulePhase === 'WORK_SHIFT') {
            inm.rig.root.position.y = 0.24;
            inm.rig.rightArm.rotation.x = -0.7 + Math.sin(nowSec * 6.5 + inm.seedId) * 0.45;
            inm.rig.leftArm.rotation.x = -0.5;
          } else {
            inm.rig.root.position.y = 0.24;
            inm.rig.rightArm.rotation.x = Math.sin(nowSec * 2.4 + inm.seedId) * 0.22;
            inm.rig.leftArm.rotation.x = -Math.sin(nowSec * 2.4 + inm.seedId) * 0.18;
          }
        }
        inm.rig.root.position.x = inm.x;
        inm.rig.root.position.z = inm.z;
        if (dTarget > 0.25) inm.rig.root.position.y = 0.24;
        inm.rig.root.rotation.set(0, inm.yaw, 0);
      }

      if (inm.ally) allyInmateDist = distPlayer;
      if (inm.isRival && !inm.defeated && !inm.bribed && distPlayer < nearestActiveRivalDist) {
        nearestActiveRivalDist = distPlayer;
      }
      if (distPlayer < closestInmateDist) {
        closestInmateDist = distPlayer;
        if (inm.isRival) {
          closestTip = {
            name: inm.name,
            text: inm.bribed
              ? 'Theek hai bhai, haftaa mil gaya! Ab is saza mein tujhe kuch nahi bolunga.'
              : `Oye naye kaidi! Is yard mein humara raaj chalta hai — lad le [Click/J], door bhaag, ya ₹${inm.bribeCost} haftaa de [6/B/E]!`,
          };
        } else if (inm.ally) {
          closestTip = {
            name: `${inm.name} (Escape Ally)`,
            text:
              schedulePhase === 'FREE_YARD'
                ? 'Bhai, abhi 17:00–20:30 Free Yard hai! [E / 5] dabao, main Guards ko mess taraf bulaata hoon — tum East Gate / Drainage Grate tod do!'
                : 'Shaam 17:00 se 20:30 Free Yard Hour ka wait karo! Tab main guards ko distract karunga aur East Gate weak hai.',
          };
        } else if (inm.role === 'exercise') {
          closestTip = {
            name: inm.name,
            text: 'Subah 06:00–17:00 Workshop mein carpentry/gardening zaroor karo — paise bhi milte hain aur saza aadhi hoti hai!',
          };
        } else if (inm.role === 'eat') {
          closestTip = {
            name: inm.name,
            text: 'Raat 8:30 lockup mein Bunk [E/1] par sone se din badhta hai aur Royal Bank ka FD/Savings interest bhi judta hai!',
          };
        } else if (inm.role === 'workshop') {
          closestTip = {
            name: inm.name,
            text: 'Jailer Mahendra raat 23:30 par North Gate se ₹25k–₹50k bribe lekar chhod deta hai — par 35% alarm risk hai!',
          };
        } else {
          closestTip = {
            name: inm.name,
            text: 'Watchtower spotlights aur guard vision cones par nazar rakho. Blind spot milte hi Grate se bhaag sakte ho!',
          };
        }
      }
    }
    js.nearInmateDialogue = closestTip;

    // Proximity checks for jail stations, Inmate Ally & Rivals
    js.nearStation = null;
    if (Math.hypot(this.playerX - rig.bunkPos.x, this.playerZ - rig.bunkPos.z) < 3.0) {
      js.nearStation = 'BUNK';
    } else if (Math.hypot(this.playerX - rig.toiletPos.x, this.playerZ - rig.toiletPos.z) < 2.6) {
      js.nearStation = 'TOILET';
    } else if (Math.hypot(this.playerX - rig.workshopPos.x, this.playerZ - rig.workshopPos.z) < 3.6) {
      js.nearStation = 'WORKSHOP';
    } else if (Math.hypot(this.playerX - rig.wardenPos.x, this.playerZ - rig.wardenPos.z) < 3.6) {
      js.nearStation = 'WARDEN';
    } else if (Math.hypot(this.playerX - rig.escapePos.x, this.playerZ - rig.escapePos.z) < 3.8) {
      js.nearStation = 'ESCAPE_GATE';
    } else if (allyInmateDist < 3.2) {
      js.nearStation = 'INMATE_ALLY';
    } else if (nearestActiveRivalDist < 3.6) {
      js.nearStation = 'INMATE_RIVAL';
    }

    // Active task progress (WORK or ESCAPE)
    if (js.activeTaskKind !== 'NONE') {
      const movedAway =
        Math.hypot(this.playerX - js.taskStartX, this.playerZ - js.taskStartZ) > 1.5;
      if (js.activeTaskKind === 'ESCAPE' && spottedNow && js.spotCooldown <= 0) {
        js.activeTaskKind = 'NONE';
        js.taskTimer = 0;
        js.spotCooldown = 2.0;
        soundEngine.playPoliceWhistle();
        const safePos = this.resolveCollisions(rig.yardCenter.x, rig.yardCenter.z, 0.5);
        this.playerX = safePos.x;
        this.playerZ = safePos.z;
        this.playerRig.root.position.set(this.playerX, this.playerY, this.playerZ);
        js.statusBanner = 'Guard ne East Gate par dekh liya! Free Yard mein Chhotu [5] se distraction karaao!';
        this.callbacks.onToast({
          text: 'Guard Cone ne East Gate par pakad liya! Chhotu [5] se distraction karaao ya cone hatne do.',
          tone: 'warn',
        });
      } else if (movedAway) {
        js.activeTaskKind = 'NONE';
        js.taskTimer = 0;
        js.statusBanner = 'Task ruk gaya — jagah se 1.5m door chale gaye.';
      } else {
        js.taskTimer += dt;
        if (js.taskTimer >= js.taskDuration) {
          const doneKind = js.activeTaskKind;
          js.activeTaskKind = 'NONE';
          js.taskTimer = 0;
          if (doneKind === 'WORK') {
            js.workCount += 1;
            js.workShiftDoneToday = true;
            js.workSkipWarnTimer = 0;
            this.playerCash += JAIL_WORK_WAGE_INR;
            js.remainingDays = Math.max(0, js.remainingDays * 0.5 - 0.18);
            soundEngine.playCashPickup();
            if (js.remainingDays <= 0.12) {
              this.callbacks.onToast({
                text: `Workshop Kaam +${formatRs(JAIL_WORK_WAGE_INR)} · Achhe vyavhaar se Saza Poori!`,
                tone: 'cash',
              });
              this.releaseFromJail('LEGAL');
              return;
            }
            js.statusBanner = `Workshop Complete: +${formatRs(JAIL_WORK_WAGE_INR)} mila & saza aadhi hui (${js.remainingDays.toFixed(2)}d baaki)!`;
            this.callbacks.onToast({
              text: `Jail Work Complete: +${formatRs(JAIL_WORK_WAGE_INR)} · Bachi Saza kam hui!`,
              tone: 'cash',
            });
            this.saveGameState();
          } else if (doneKind === 'ESCAPE') {
            this.releaseFromJail('ESCAPE');
            return;
          }
        }
      }
    }

    // Gentle sentence countdown in real time as days advance
    js.remainingDays = Math.max(0, js.remainingDays - (this.timeSpeedMinPerSec * dt) / 1440);
    if (js.remainingDays <= 0.01) {
      this.releaseFromJail('LEGAL');
      return;
    }

    const sunAngle = ((this.gameMinutes - 360) / 720) * Math.PI;
    const isDayArc = this.gameMinutes >= 360 && this.gameMinutes <= 1110;
    this.sunLight.position.set(
      Math.round(this.playerX / 2) * 2 + (isDayArc ? Math.cos(sunAngle) * 85 : -35),
      isDayArc ? Math.max(24, Math.sin(clamp(sunAngle, 0.08, Math.PI - 0.08)) * 96) : 78,
      Math.round(this.playerZ / 2) * 2 + (isDayArc ? 38 : -42),
    );
    this.sunLight.target.position.set(Math.round(this.playerX / 2) * 2, 0, Math.round(this.playerZ / 2) * 2);
    this.sunLight.target.updateMatrixWorld();

    this.updateCamera(dt);

    if (!js.statusBanner) {
      js.statusBanner = meta.title;
    }

    this.hudAccum += dt;
    if (this.hudAccum >= 0.1) {
      this.hudAccum = 0;
      this.emitHudSnapshot();
    }
  }

  public jailBribeRival(rivalId?: string): boolean {
    if (this.mode !== 'JAIL' || !this.jailRig || !this.jailState) return false;
    const candidates = this.jailRig.inmates
      .filter((i) => i.isRival && !i.defeated && !i.bribed)
      .sort(
        (a, b) =>
          Math.hypot(a.x - this.playerX, a.z - this.playerZ) -
          Math.hypot(b.x - this.playerX, b.z - this.playerZ),
      );
    const target = rivalId ? candidates.find((c) => c.id === rivalId) : candidates[0];
    if (!target) {
      this.callbacks.onToast({ text: 'Sabhi rivals abhi shaant ya knocked-out hain.', tone: 'info' });
      return false;
    }
    const cost = target.bribeCost;
    this.syncBankInterest(true);
    const sav = this.savingsPrincipal + this.savingsInterest;
    if (this.playerCash >= cost) {
      this.playerCash -= cost;
    } else if (sav >= cost) {
      const ratio = cost / Math.max(0.01, sav);
      this.savingsInterest = Math.max(0, this.savingsInterest * (1 - ratio));
      this.savingsPrincipal = Math.max(0, this.savingsPrincipal * (1 - ratio));
      this.recordPassbook('SAVINGS', 'WITHDRAW', cost, this.savingsPrincipal + this.savingsInterest, `Jail Truce (${target.name})`);
    } else {
      this.callbacks.onToast({
        text: `${target.name} ko haftaa dene ke liye ${formatRs(cost)} chahiye!`,
        tone: 'warn',
      });
      return false;
    }
    target.bribed = true;
    target.alerted = false;
    soundEngine.playCashPickup();
    this.jailState.statusBanner = `${target.name} ko ${formatRs(cost)} haftaa diya — ab woh tang nahi karega!`;
    this.callbacks.onToast({
      text: `Truce Paid: ${target.name} (-${formatRs(cost)})`,
      tone: 'cash',
    });
    this.saveGameState();
    this.emitHudSnapshot();
    return true;
  }

  private stepTimeOfDay(dt: number): void {
    this.gameMinutes += this.timeSpeedMinPerSec * dt;
    if (this.gameMinutes >= 1440) {
      this.gameMinutes -= 1440;
      this.dayCount += 1;
      this.lastAartiSlot = -1;
      this.lastAzaanSlot = -1;
    }

    // Fixed in-game times for Mandir Aarti bells (06:30 AM & 06:30 PM)
    const aartiMarks = [390, 1110];
    aartiMarks.forEach((mark, idx) => {
      if (this.gameMinutes >= mark && this.lastAartiSlot < idx) {
        this.lastAartiSlot = idx;
        let minDist = Infinity;
        let nearestName = '';
        for (const sp of this.sacredPlaces) {
          if (sp.kind === 'ram_mandir' || sp.kind === 'krishna_mandir') {
            const d = Math.hypot(sp.x - this.playerX, sp.z - this.playerZ);
            if (d < minDist) {
              minDist = d;
              nearestName = sp.name;
            }
          }
        }
        if (minDist <= 44) {
          soundEngine.playMandirAarti(minDist);
          this.callbacks.onToast({
            text: `${nearestName} mein Aarti ki ghanti baj rahi hai`,
            tone: 'info',
          });
        }
      }
    });

    // Fixed in-game times for Masjid prayer call (05:15, 13:00, 16:30, 18:15, 20:00)
    const azaanMarks = [315, 780, 990, 1095, 1200];
    azaanMarks.forEach((mark, idx) => {
      if (this.gameMinutes >= mark && this.lastAzaanSlot < idx) {
        this.lastAzaanSlot = idx;
        const masjid = this.sacredPlaces.find((sp) => sp.kind === 'mosque');
        if (masjid) {
          const d = Math.hypot(masjid.x - this.playerX, masjid.z - this.playerZ);
          if (d <= 44) {
            soundEngine.playMasjidAzaan(d);
            this.callbacks.onToast({
              text: 'Noor Masjid se Azaan ki aawaaz aa rahi hai',
              tone: 'info',
            });
          }
        }
      }
    });

    this.syncBankInterest(false);
    this.applyTimeOfDayLighting();
  }

  private getTimeOfDayHud(): TimeOfDayHud {
    const totalMin = Math.floor(this.gameMinutes) % 1440;
    const h24 = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const formattedTime = `${String(h12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${ampm}`;

    let phaseLabel: TimePhase = 'MIDNIGHT';
    if (h24 >= 5 && h24 < 11) phaseLabel = 'MORNING';
    else if (h24 >= 11 && h24 < 17) phaseLabel = 'NOON';
    else if (h24 >= 17 && h24 < 20) phaseLabel = 'EVENING';

    return {
      minutesOfDay: totalMin,
      formattedTime,
      phaseLabel,
      dayCount: this.dayCount,
    };
  }

  private stepSimulation(dt: number): void {
    if (this.fireCooldown > 0) this.fireCooldown -= dt;
    if (this.punchAnimTimer > 0) this.punchAnimTimer -= dt;
    if (this.globalGreetCooldown > 0) this.globalGreetCooldown -= dt;
    if (this.sacredBlessCooldown > 0) this.sacredBlessCooldown -= dt;
    if (this.pujaCooldown > 0) this.pujaCooldown = Math.max(0, this.pujaCooldown - dt);

    // Smooth Day-Noon-Midnight progression
    this.stepTimeOfDay(dt);

    // Hold [H] Surrender progress at ANY 1-5★ wanted level
    if (this.surrenderHolding) {
      if (this.wantedLevel < 1 || this.missionPhase !== 'NONE') {
        this.surrenderHolding = false;
        this.surrenderHoldTimer = 0;
      } else {
        this.surrenderHoldTimer += dt;
        if (this.surrenderHoldTimer >= 0.65) {
          this.surrenderHolding = false;
          this.surrenderHoldTimer = 0;
          this.triggerBusted('Aapne police ke saamne haath upar karke surrender kar diya!');
          return;
        }
      }
    }

    // Darshan / Prayer animation countdown
    if (this.prayerAnim) {
      this.prayerAnim.remaining -= dt;
      if (this.prayerAnim.remaining <= 0) {
        this.prayerAnim = null;
      }
    }

    // "Blessed" status buff slowly regenerates HP & Stamina
    if (this.blessedTimer > 0) {
      this.blessedTimer = Math.max(0, this.blessedTimer - dt);
      if (this.playerHp > 0 && this.playerHp < this.playerMaxHp) {
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + 1.8 * dt);
      }
      if (this.playerStamina < this.playerMaxStamina) {
        this.playerStamina = Math.min(this.playerMaxStamina, this.playerStamina + 12 * dt);
        if (this.staminaExhausted && this.playerStamina >= 22) {
          this.staminaExhausted = false;
        }
      }
    }

    // Map GPS Waypoint beacon pulse & arrival auto-clear
    if (this.waypoint && this.waypointBeacon) {
      const pulseT = performance.now() * 0.004;
      this.waypointBeacon.beam.rotation.y += dt * 1.4;
      this.waypointBeacon.ring.scale.setScalar(1 + Math.sin(pulseT) * 0.14);
      const distWp = Math.hypot(this.waypoint.x - this.playerX, this.waypoint.z - this.playerZ);
      if (distWp < 7.5) {
        const arrivedLabel = this.waypoint.label;
        this.clearWaypoint(true);
        soundEngine.playCashPickup();
        this.callbacks.onToast({ text: `Manzil par pahunch gaye: ${arrivedLabel}`, tone: 'cash' });
      }
    }

    if (this.micState.active) {
      this.micState.timer -= dt;
      if (this.micState.timer <= 0) {
        this.stopMicRecognition();
        this.micState.status = 'Mic timeout — phir [V] dabao';
        this.micClearStatusTimer = 2.5;
      }
    } else if (this.micClearStatusTimer > 0) {
      this.micClearStatusTimer -= dt;
      if (this.micClearStatusTimer <= 0) {
        this.micState.status = null;
        this.micState.transcript = null;
        this.micState.mode = null;
      }
    }
    if (this.npcSubtitle) {
      if (soundEngine.isSpeaking()) {
        this.npcSubtitle.ttl = Math.max(this.npcSubtitle.ttl, 0.45);
      } else {
        this.npcSubtitle.ttl -= dt;
        if (this.npcSubtitle.ttl <= 0) this.npcSubtitle = null;
      }
    }
    if (this.activeChaiPrompt) {
      this.activeChaiPrompt.ttl -= dt;
      const asker = this.npcs.find((n) => n.id === this.activeChaiPrompt!.npcId && !n.dead);
      const tooFar = !asker || Math.hypot(asker.x - this.playerX, asker.z - this.playerZ) > 18;
      if (this.activeChaiPrompt.ttl <= 0 || tooFar) {
        if (this.micState.mode === 'chai') this.stopMicRecognition();
        this.activeChaiPrompt = null;
      }
    }

    this.stepTrafficSignals(dt);
    this.stepThanaAndCourtActors(dt, false);

    // Spin 3D display guns gently inside Armory
    for (const disp of this.shopDisplays) {
      disp.gunGroup.rotation.y += dt * 0.9;
    }

    // Active Mission Countdown & Cutscene Orchestration
    if (this.missionPhase === 'CUTSCENE') {
      this.stepCutscene(dt);
      this.stepStreetDogs(dt);
      this.stepExplosionsAndSmoke(dt);
      this.hudAccum += dt;
      if (this.hudAccum >= 0.08) {
        this.hudAccum = 0;
        this.emitHudSnapshot();
      }
      return;
    }

    if (this.missionPhase === 'ELIMINATE_MAFIA' || this.missionPhase === 'OPEN_VAN') {
      this.missionTimer -= dt;
      if (this.missionTimer <= 0) {
        // 20-minute limit expired: reset mission & respawn at Royal Bank Of India
        this.missionPhase = 'NONE';
        this.missionTimer = 0;
        this.cleanupMissionEntities();
        this.spawnInsideBank();
        this.callbacks.onToast({
          text: 'Mission time expired (20:00) — Returned to Royal Bank Of India',
          tone: 'warn',
        });
      } else if (this.missionPhase === 'OPEN_VAN' && !this.currentVehicle && this.rescueVan) {
        const distVanRear = Math.hypot(
          this.playerX - this.rescueVanPos.x,
          this.playerZ - (this.rescueVanPos.z + 2.6),
        );
        if (distVanRear < 4.4) {
          this.beginRescueCutscene();
          return;
        }
      }
    }

    // Continuous fire for held touch Fire or automatic weapons
    if (
      (this.mouseDownLeft || this.touchAttackHeld) &&
      !this.weaponWheelOpen &&
      !this.currentVehicle &&
      (this.touchAttackHeld || this.activeWeapon === 'smg' || this.activeWeapon === 'rifle')
    ) {
      this.tryPlayerAttack();
    }

    this.stepPlayer(dt);
    this.checkPlayerTrafficViolations(dt);
    this.stepLawEnforcementAndWitness(dt);
    this.stepVehicles(dt);
    this.stepNpcs(dt);
    this.stepStreetDogs(dt);
    this.stepPickupsAndTraces(dt);
    this.stepExplosionsAndSmoke(dt);

    // Wanted level decay when no pursuing police officer is close
    if (this.wantedLevel > 0) {
      const anyCopNear = this.npcs.some(
        (n) => n.isPolice && (n.hostile || !n.isTrafficPolice) && !n.dead && Math.hypot(n.x - this.playerX, n.z - this.playerZ) < 28,
      );
      if (!anyCopNear) {
        this.wantedDecayTimer -= dt;
        if (this.wantedDecayTimer <= 0) {
          this.wantedLevel--;
          this.wantedDecayTimer = 14;
          if (this.wantedLevel < 4 && this.chopper) {
            this.scene.remove(this.chopper.rig.root);
            this.scene.remove(this.chopper.rig.spotLight.target);
            this.chopper = null;
            soundEngine.setChopperActive(false);
          }
          if (this.wantedLevel === 0) {
            this.clearWanted();
          }
        }
      } else {
        this.wantedDecayTimer = Math.max(this.wantedDecayTimer, 12);
      }
    }

    this.updateCamera(dt);

    // Keep shadow frustum snapped to 2m grid around player to eliminate shadow shimmer
    const sunAngle = ((this.gameMinutes - 360) / 720) * Math.PI;
    const isDayArc = this.gameMinutes >= 360 && this.gameMinutes <= 1110;
    const arcX = isDayArc ? Math.cos(sunAngle) * 85 : -35;
    const arcY = isDayArc ? Math.max(24, Math.sin(clamp(sunAngle, 0.08, Math.PI - 0.08)) * 96) : 78;
    const arcZ = isDayArc ? 38 : -42;
    const snapPx = Math.round(this.playerX / 2) * 2;
    const snapPz = Math.round(this.playerZ / 2) * 2;
    this.sunLight.position.set(snapPx + arcX, arcY, snapPz + arcZ);
    this.sunLight.target.position.set(snapPx, 0, snapPz);
    this.sunLight.target.updateMatrixWorld();

    this.hudAccum += dt;
    if (this.hudAccum >= 0.11) {
      this.hudAccum = 0;
      this.emitHudSnapshot();
    }

    this.saveAccum += dt;
    if (this.saveAccum >= 3.5) {
      this.saveAccum = 0;
      this.saveGameState();
    }
  }

  private stepCutscene(dt: number): void {
    this.cutsceneTime += dt;
    if (this.rescueVan) {
      const doorProgress = clamp(this.cutsceneTime / 1.4, 0, 1);
      this.rescueVan.leftDoorPivot.rotation.y = -doorProgress * Math.PI * 0.72;
      this.rescueVan.rightDoorPivot.rotation.y = doorProgress * Math.PI * 0.72;
    }

    if (this.heldDogRig) {
      this.heldDogRig.tail.rotation.z = Math.sin(this.cutsceneTime * 14) * 0.45;
    }

    // Play lively procedural barks periodically during rescue release
    if (this.cutsceneTime > 0.8 + this.cutsceneBarkStep * 0.9 && this.cutsceneBarkStep < 5) {
      soundEngine.playDogBark(this.cutsceneBarkStep);
      this.cutsceneBarkStep++;
    }

    // Animate 24 Indian street dogs running out of the open van doors into the yard
    for (let i = 0; i < this.cutsceneDogs.length; i++) {
      const dog = this.cutsceneDogs[i];
      const releaseDelay = 0.4 + i * 0.14;
      if (this.cutsceneTime < releaseDelay) {
        dog.rig.tail.rotation.z = Math.sin(this.cutsceneTime * 12 + i) * 0.35;
        continue;
      }
      dog.yaw = lerpAngle(dog.yaw, dog.targetYaw, 1 - Math.exp(-4 * dt));
      const stepSpd = dog.speed;
      dog.x += -Math.sin(dog.yaw) * stepSpd * dt;
      dog.z += -Math.cos(dog.yaw) * stepSpd * dt;
      // Drop smoothly from cargo floor down to yard pavement
      if (dog.z > this.rescueVanPos.z + 2.6 && dog.y > 0) {
        dog.y = Math.max(0, dog.y - dt * 2.4);
      }
      dog.phase += dt * 16;
      const trot = Math.sin(dog.phase) * 0.65;
      dog.rig.flLeg.rotation.x = trot;
      dog.rig.brLeg.rotation.x = trot;
      dog.rig.frLeg.rotation.x = -trot;
      dog.rig.blLeg.rotation.x = -trot;
      dog.rig.tail.rotation.z = Math.sin(dog.phase * 1.4) * 0.5;
      dog.rig.root.position.set(dog.x, dog.y, dog.z);
      dog.rig.root.rotation.y = dog.yaw;
    }

    // Cinematic camera framing player holding dog & van rear door opening
    const camAngle = clamp(this.cutsceneTime * 0.16, 0, 0.9);
    this._camDesired.set(
      this.rescueVanPos.x + Math.sin(camAngle) * 7.5 + 2.4,
      3.1,
      this.rescueVanPos.z + 10.5 - camAngle * 1.8,
    );
    this._camTarget.set(this.rescueVanPos.x - 0.3, 1.15, this.rescueVanPos.z + 3.2);
    this.camera.position.lerp(this._camDesired, 1 - Math.exp(-6 * dt));
    this.camera.lookAt(this._camTarget);

    if (this.cutsceneTime >= this.cutsceneDuration) {
      this.finishCutscene();
    }
  }

  private stepStreetDogs(dt: number): void {
    const toRemove: number[] = [];
    for (const dog of this.streetDogs) {
      if (dog.hitCooldown > 0) dog.hitCooldown -= dt;
      if (dog.dead) {
        dog.deathTimer -= dt;
        if (dog.deathTimer <= 0) {
          this.scene.remove(dog.rig.root);
          toRemove.push(dog.id);
        }
        continue;
      }

      let moveSpeed = 0;
      if (dog.behavior === 'SIT') {
        const dx = this.playerX - dog.x;
        const dz = this.playerZ - dog.z;
        if (Math.hypot(dx, dz) < 12) {
          dog.yaw = lerpAngle(dog.yaw, Math.atan2(-dx, -dz), 1 - Math.exp(-5 * dt));
        }
        dog.phase += dt * 6;
        dog.rig.flLeg.rotation.x = 0;
        dog.rig.frLeg.rotation.x = 0;
        dog.rig.blLeg.rotation.x = -0.82;
        dog.rig.brLeg.rotation.x = -0.82;
        dog.rig.tail.rotation.z = Math.sin(dog.phase * 1.4) * 0.35;
        dog.rig.root.position.set(dog.x, -0.09, dog.z);
        dog.rig.root.rotation.y = dog.yaw;
      } else if (dog.behavior === 'FOLLOW') {
        const dx = this.playerX - dog.x;
        const dz = this.playerZ - dog.z;
        const dist = Math.hypot(dx, dz);
        dog.targetYaw = Math.atan2(-dx, -dz);
        dog.yaw = lerpAngle(dog.yaw, dog.targetYaw, 1 - Math.exp(-9 * dt));
        if (dist > 2.6) {
          moveSpeed = dist > 6.5 ? 6.8 : 4.2;
          const next = this.resolveCollisions(
            dog.x - Math.sin(dog.yaw) * moveSpeed * dt,
            dog.z - Math.cos(dog.yaw) * moveSpeed * dt,
            0.38,
          );
          dog.x = next.x;
          dog.z = next.z;
          dog.phase += dt * (moveSpeed > 5 ? 16 : 12);
        } else {
          dog.phase += dt * 5;
        }
        const trot = moveSpeed > 0 ? Math.sin(dog.phase) * 0.55 : 0;
        dog.rig.flLeg.rotation.x = trot;
        dog.rig.brLeg.rotation.x = trot;
        dog.rig.frLeg.rotation.x = -trot;
        dog.rig.blLeg.rotation.x = -trot;
        dog.rig.tail.rotation.z = Math.sin(dog.phase * 1.6) * 0.52;
        dog.rig.root.position.set(dog.x, 0, dog.z);
        dog.rig.root.rotation.y = dog.yaw;
      } else {
        dog.wanderTimer -= dt;
        if (dog.wanderTimer <= 0) {
          dog.wanderTimer = 2.5 + Math.random() * 4;
          dog.targetYaw = Math.random() * Math.PI * 2 - Math.PI;
        }
        dog.yaw = lerpAngle(dog.yaw, dog.targetYaw, 1 - Math.exp(-5 * dt));
        const next = this.resolveCollisions(
          dog.x - Math.sin(dog.yaw) * dog.speed * dt,
          dog.z - Math.cos(dog.yaw) * dog.speed * dt,
          0.4,
        );
        if (Math.hypot(next.x - dog.x, next.z - dog.z) < dog.speed * dt * 0.3) {
          dog.targetYaw = normalizeAngle(dog.targetYaw + Math.PI * 0.7);
        }
        dog.x = next.x;
        dog.z = next.z;
        dog.phase += dt * 11;
        const trot = Math.sin(dog.phase) * 0.5;
        dog.rig.flLeg.rotation.x = trot;
        dog.rig.brLeg.rotation.x = trot;
        dog.rig.frLeg.rotation.x = -trot;
        dog.rig.blLeg.rotation.x = -trot;
        dog.rig.tail.rotation.z = Math.sin(dog.phase * 1.2) * 0.4;
        dog.rig.root.position.set(dog.x, 0, dog.z);
        dog.rig.root.rotation.y = dog.yaw;
      }

      dog.barkCooldown -= dt;
      if (dog.barkCooldown <= 0 && Math.hypot(dog.x - this.playerX, dog.z - this.playerZ) < 16) {
        dog.barkCooldown = dog.behavior === 'FOLLOW' ? 11 + Math.random() * 10 : 8 + Math.random() * 10;
        soundEngine.playDogBark(dog.id);
      }
    }

    if (toRemove.length > 0) {
      this.streetDogs = this.streetDogs.filter((d) => !toRemove.includes(d.id));
    }
  }

  private stepPlayer(dt: number): void {
    if (this.currentVehicle) {
      // Regenerate stamina while driving
      this.playerStamina = Math.min(this.playerMaxStamina, this.playerStamina + 18 * dt);
      if (this.staminaExhausted && this.playerStamina >= 22) {
        this.staminaExhausted = false;
      }

      const v = this.currentVehicle;
      const keyAccel = (this.isActionKeyHeld('moveForward') ? 1 : 0) - (this.isActionKeyHeld('moveBackward') ? 1 : 0);
      const accel = Math.abs(this.touchMoveY) > 0.12 ? this.touchMoveY : keyAccel;
      const keySteer = (this.isActionKeyHeld('moveLeft') ? 1 : 0) - (this.isActionKeyHeld('moveRight') ? 1 : 0);
      const steer = Math.abs(this.touchMoveX) > 0.12 ? -this.touchMoveX : keySteer;

      this.vehicleSteerVisual = THREE.MathUtils.damp(this.vehicleSteerVisual, steer, 10, dt);
      if (v.rig.steeringWheel) {
        const axis = v.rig.steerAxis ?? 'z';
        v.rig.steeringWheel.rotation[axis] = this.vehicleSteerVisual * (axis === 'z' ? 1.15 : 0.45);
      }

      if (v.kind === 'chopper') {
        const ascend = this.isActionKeyHeld('jump') || this.chopperAscendTouch;
        const descend = this.isActionKeyHeld('sprint') || this.chopperDescendTouch;
        const climbInput = (ascend ? 1 : 0) - (descend ? 1 : 0);
        const curY = v.y ?? 0;
        const nextY = clamp(curY + climbInput * 12.5 * dt, 0, 44);
        v.y = nextY;

        if (accel > 0.05) {
          v.speed = Math.min(v.maxSpeed, v.speed + 20 * accel * dt);
        } else if (accel < -0.05) {
          v.speed = Math.max(-14, v.speed + 18 * accel * dt);
        } else {
          v.speed *= Math.exp(-2.0 * dt);
        }

        if ((nextY > 0.25 || Math.abs(v.speed) > 0.35) && Math.abs(steer) > 0.05) {
          v.yaw = normalizeAngle(v.yaw + steer * 2.1 * dt);
        }

        const fwdX = -Math.sin(v.yaw);
        const fwdZ = -Math.cos(v.yaw);
        const desiredX = v.x + fwdX * v.speed * dt;
        const desiredZ = v.z + fwdZ * v.speed * dt;
        const nextPos = this.resolveCollisions(desiredX, desiredZ, 2.2, v.id, false, nextY);
        if (Math.hypot(nextPos.x - desiredX, nextPos.z - desiredZ) > 0.08) {
          v.speed *= 0.35;
        }
        v.x = nextPos.x;
        v.z = nextPos.z;
        v.rig.root.position.set(v.x, nextY, v.z);
        v.rig.root.rotation.y = v.yaw;
        v.rig.root.rotation.x = THREE.MathUtils.damp(v.rig.root.rotation.x, clamp(-accel * 0.14, -0.18, 0.18), 6, dt);
        v.rig.root.rotation.z = THREE.MathUtils.damp(v.rig.root.rotation.z, clamp(steer * 0.2, -0.24, 0.24), 6, dt);
        this.playerY = nextY;
      } else {
        if (accel > 0.05) {
          const accelRate = v.kind === 'bike' ? 21 : 16;
          v.speed = Math.min(v.maxSpeed, v.speed + accelRate * accel * dt);
        } else if (accel < -0.05) {
          v.speed = Math.max(-10, v.speed + 22 * accel * dt);
        } else {
          v.speed *= Math.exp(-3.2 * dt);
        }

        if (Math.abs(v.speed) > 0.35 && Math.abs(steer) > 0.05) {
          const dirSign = v.speed >= 0 ? 1 : -1;
          const turnRate = v.kind === 'bike' ? 2.55 : 2.15;
          v.yaw = normalizeAngle(v.yaw + steer * dirSign * turnRate * dt);
        }

        const fwdX = -Math.sin(v.yaw);
        const fwdZ = -Math.cos(v.yaw);
        const desiredX = v.x + fwdX * v.speed * dt;
        const desiredZ = v.z + fwdZ * v.speed * dt;
        const colR = v.kind === 'bike' ? 0.72 : v.kind === 'rickshaw' ? 1.25 : 1.55;
        const nextPos = this.resolveCollisions(desiredX, desiredZ, colR, v.id);
        if (Math.hypot(nextPos.x - desiredX, nextPos.z - desiredZ) > 0.05) {
          v.speed *= 0.35;
        }
        v.x = nextPos.x;
        v.z = nextPos.z;
        v.y = 0;
        v.rig.root.position.set(v.x, 0, v.z);
        v.rig.root.rotation.y = v.yaw;
        this.playerY = 0;

        if (v.kind === 'bike') {
          const targetLean = Math.abs(v.speed) > 1.5 ? steer * 0.24 : 0;
          v.rig.root.rotation.z = THREE.MathUtils.damp(v.rig.root.rotation.z, targetLean, 9, dt);
          this.playerRig.root.visible = !this.firstPerson;
          this.playerRig.helmetMesh.visible = this.hasHelmet && this.helmetOn;
          this.playerRig.root.position.set(v.x, 0.24, v.z);
          this.playerRig.root.rotation.y = v.yaw;
          this.playerRig.root.rotation.z = v.rig.root.rotation.z;
          this.playerRig.leftArm.rotation.x = 0.85;
          this.playerRig.rightArm.rotation.x = 0.85;
          this.playerRig.leftLeg.rotation.x = 0.55;
          this.playerRig.rightLeg.rotation.x = 0.55;
        } else {
          v.rig.root.rotation.z = 0;
          this.playerRig.root.visible = false;
        }
      }

      if (Math.abs(v.speed) > 0.5 || (v.y ?? 0) > 0.2) {
        const curFuel = this.vehicleFuelMap.get(v.id) ?? 90;
        this.vehicleFuelMap.set(v.id, Math.max(8, curFuel - 0.14 * dt));
      }

      this.playerX = v.x;
      this.playerZ = v.z;
      this.playerYaw = v.yaw;
      this.playerSpeed = Math.abs(v.speed);
      return;
    }

    // On-foot camera-relative WASD + Touch Joystick (W = camFwd = -Z when camYaw=0)
    const keyFwd = (this.isActionKeyHeld('moveForward') ? 1 : 0) - (this.isActionKeyHeld('moveBackward') ? 1 : 0);
    const keyRight = (this.isActionKeyHeld('moveRight') ? 1 : 0) - (this.isActionKeyHeld('moveLeft') ? 1 : 0);

    const inputFwd = Math.abs(this.touchMoveY) > 0.08 ? this.touchMoveY : keyFwd;
    const inputRight = Math.abs(this.touchMoveX) > 0.08 ? this.touchMoveX : keyRight;

    const camFwdX = -Math.sin(this.camYaw);
    const camFwdZ = -Math.cos(this.camYaw);
    const camRightX = Math.cos(this.camYaw);
    const camRightZ = -Math.sin(this.camYaw);

    let moveX = camFwdX * inputFwd + camRightX * inputRight;
    let moveZ = camFwdZ * inputFwd + camRightZ * inputRight;
    const len = Math.hypot(moveX, moveZ);

    const wantsSprint = this.touchSprint || this.isActionKeyHeld('sprint');
    const isMoving = len > 0.01;
    const canSprint = wantsSprint && isMoving && !this.staminaExhausted && this.playerStamina > 0;

    if (canSprint) {
      this.playerStamina = Math.max(0, this.playerStamina - 24 * dt);
      if (this.playerStamina <= 0.1) {
        this.staminaExhausted = true;
      }
    } else {
      this.playerStamina = Math.min(this.playerMaxStamina, this.playerStamina + (isMoving ? 10 : 18) * dt);
      if (this.staminaExhausted && this.playerStamina >= 22) {
        this.staminaExhausted = false;
      }
    }

    const maxSpeed = canSprint ? 9.8 : 6.1;

    if (isMoving) {
      moveX /= len;
      moveZ /= len;
      this.playerSpeed = maxSpeed;
      // Rotate character smoothly to face movement direction (or camYaw in FPV/ADS)
      const moveYaw = this.firstPerson || this.adsActive ? this.camYaw : Math.atan2(-moveX, -moveZ);
      this.playerYaw = lerpAngle(this.playerYaw, moveYaw, 1 - Math.exp(-14 * dt));

      const nextPos = this.resolveCollisions(
        this.playerX + moveX * maxSpeed * dt,
        this.playerZ + moveZ * maxSpeed * dt,
        0.48,
      );
      this.playerX = nextPos.x;
      this.playerZ = nextPos.z;
      this.walkPhase += dt * (canSprint ? 15 : 10);
    } else {
      // Still resolve solid vehicle pushes even while standing still
      const pushed = this.resolveCollisions(this.playerX, this.playerZ, 0.48);
      this.playerX = pushed.x;
      this.playerZ = pushed.z;
      this.playerSpeed = 0;
      if (this.firstPerson || this.adsActive) {
        this.playerYaw = this.camYaw;
      }
    }

    // Vertical Jump physics (respect raised Jail compound floor at y = 0.24)
    const groundY = this.mode === 'JAIL' ? 0.24 : 0;
    if (this.playerY > groundY || this.playerVy !== 0) {
      this.playerVy -= 23.5 * dt;
      this.playerY += this.playerVy * dt;
      if (this.playerY <= groundY) {
        this.playerY = groundY;
        this.playerVy = 0;
      }
    }

    this.playerRig.root.position.set(this.playerX, this.playerY, this.playerZ);
    this.playerRig.root.rotation.y = this.playerYaw;

    // Limb animation (tuck legs slightly mid-air during jump)
    const inAir = this.playerY > groundY + 0.08;
    const swing = inAir ? 0.35 : this.playerSpeed > 0.2 ? Math.sin(this.walkPhase) * 0.55 : 0;
    this.playerRig.leftLeg.rotation.x = swing;
    this.playerRig.rightLeg.rotation.x = inAir ? -0.45 : -swing;
    this.playerRig.leftArm.rotation.x = inAir ? -0.5 : -swing * 0.7;

    if (this.punchAnimTimer > 0) {
      const p = Math.sin((this.punchAnimTimer / 0.24) * Math.PI);
      this.playerRig.rightArm.rotation.x = p * 1.45;
    } else if (this.mode !== 'JAIL' && this.activeWeapon !== 'fists') {
      // Aiming stance pointing gun barrel along -Z
      this.playerRig.rightArm.rotation.x = Math.PI / 2 - 0.1;
    } else {
      this.playerRig.rightArm.rotation.x = inAir ? -0.5 : swing * 0.7;
    }
  }

  private stepVehicles(dt: number): void {
    const tNow = performance.now() / 1000;
    const wreckedIds: number[] = [];

    for (const v of this.vehicles) {
      if (v.stopCooldown > 0) v.stopCooldown -= dt;

      // Destroyed burnt wrecks smoke gently and despawn cleanly after wreckTimer
      if (v.destroyed) {
        v.wreckTimer -= dt;
        v.smokeTimer -= dt;
        if (v.smokeTimer <= 0) {
          v.smokeTimer = 0.25;
          this.spawnSmokePuff(v.x + (Math.random() - 0.5) * 0.7, 1.0, v.z + (Math.random() - 0.5) * 0.7, 0x18181b);
        }
        if (v.wreckTimer <= 0) {
          wreckedIds.push(v.id);
        }
        continue;
      }

      // Emit engine warning smoke when heavily damaged (<42% HP)
      if (v.hp < v.maxHp * 0.42) {
        v.smokeTimer -= dt;
        if (v.smokeTimer <= 0) {
          v.smokeTimer = 0.18;
          const hoodOffset = v.kind === 'rickshaw' ? 0.8 : 1.45;
          const hx = v.x - Math.sin(v.yaw) * hoodOffset;
          const hz = v.z - Math.cos(v.yaw) * hoodOffset;
          this.spawnSmokePuff(hx, 1.05, hz, v.hp < v.maxHp * 0.22 ? 0x27272a : 0x52525b);
        }
      }

      // Decay per-entity collision cooldowns
      for (const [eid, ttl] of v.hitCooldowns.entries()) {
        if (ttl - dt <= 0) v.hitCooldowns.delete(eid);
        else v.hitCooldowns.set(eid, ttl - dt);
      }

      if (v.aiHornCooldown && v.aiHornCooldown > 0) {
        v.aiHornCooldown = Math.max(0, v.aiHornCooldown - dt);
      }

      // Spin Chopper rotors when piloted or airborne
      if (v.kind === 'chopper' && v.rig.mainRotor && v.rig.tailRotor) {
        const airborne = (v.y ?? 0) > 0.12;
        if (v.occupiedByPlayer || airborne) {
          v.rig.mainRotor.rotation.y += 18 * dt;
          v.rig.tailRotor.rotation.x += 28 * dt;
        }
        if (!v.occupiedByPlayer && airborne) {
          v.y = Math.max(0, (v.y ?? 0) - 5.5 * dt);
        }
      }

      // Headlights emissive intensity
      if (v.rig.headlightMats && v.rig.headlightMats.length > 0) {
        const isNight = this.gameMinutes >= 1060 || this.gameMinutes <= 380;
        const lightsOn = v.occupiedByPlayer ? this.vehicleHeadlightsOn : (!v.isStarterParked && (isNight || v.aiEnabled));
        const inten = lightsOn ? 1.8 : 0.08;
        for (const mat of v.rig.headlightMats) {
          mat.emissiveIntensity = inten;
        }
      }

      // Wheel spin
      for (const w of v.rig.wheels) {
        w.rotation.x -= v.speed * dt * 1.8;
      }

      // Police lightbar flash when wanted
      if (v.kind === 'police' && v.rig.lightBarRed && v.rig.lightBarBlue) {
        const active = this.wantedLevel > 0 && !v.occupiedByPlayer;
        const pulse = Math.sin(tNow * 14) > 0;
        (v.rig.lightBarRed.material as THREE.MeshStandardMaterial).emissiveIntensity = active && pulse ? 2.4 : 0.25;
        (v.rig.lightBarBlue.material as THREE.MeshStandardMaterial).emissiveIntensity = active && !pulse ? 2.4 : 0.25;
      }

      if (!v.occupiedByPlayer) {
        if (v.id === this.missionPoliceCarId || v.isStarterParked || v.aiDisabled || !v.aiEnabled) {
          // Exited/stolen/parked vehicles have AI permanently off — roll smoothly to a complete stop
          v.speed *= Math.exp(-3.8 * dt);
          if (Math.abs(v.speed) < 0.25) v.speed = 0;
          if (v.speed !== 0 && v.kind !== 'chopper') {
            const fwdX = -Math.sin(v.yaw);
            const fwdZ = -Math.cos(v.yaw);
            const colR = v.kind === 'bike' ? 0.72 : v.kind === 'rickshaw' ? 1.2 : 1.5;
            const safe = this.resolveCollisions(v.x + fwdX * v.speed * dt, v.z + fwdZ * v.speed * dt, colR, v.id);
            v.x = safe.x;
            v.z = safe.z;
          }
        } else if (
          (v.kind === 'police' ||
            v.kind === 'swat_van' ||
            v.kind === 'army_truck' ||
            v.kind === 'armored_apc') &&
          this.wantedLevel >= (v.unitTier ?? 2)
        ) {
          this.stepPoliceVehicle(v, dt);
        } else {
          // Smooth left-hand lane road patrol — comes to full stop on Red lights & queued cars
          if (v.policeState !== 'PATROL') {
            v.policeState = 'PATROL';
          }
          const cruiseSpeed = v.kind === 'bike' ? 8.2 : v.kind === 'rickshaw' ? 6.5 : 7.6;
          let targetSpeed = cruiseSpeed;
          const fwdX = -Math.sin(v.yaw);
          const fwdZ = -Math.cos(v.yaw);

          // Check upcoming major intersection traffic signals along vehicle heading
          let blockedByTraffic = false;
          for (const sig of this.trafficSignals) {
            const alignedNS = Math.abs(fwdZ) > 0.7 && Math.abs(v.x - sig.x) < 6.5;
            const alignedEW = Math.abs(fwdX) > 0.7 && Math.abs(v.z - sig.z) < 6.5;
            if (!alignedNS && !alignedEW) continue;

            const alongDist = alignedNS
              ? (sig.z - v.z) * Math.sign(fwdZ)
              : (sig.x - v.x) * Math.sign(fwdX);
            if (alongDist > 9.0 && alongDist < 27.0) {
              const axisState = this.getSignalAxisState(sig, alignedNS ? 'z' : 'x');
              if (axisState === 'RED' || (axisState === 'YELLOW' && alongDist > 12.2)) {
                targetSpeed = 0;
                break;
              }
            }
          }

          // Brake smoothly behind any same-direction vehicle or burnt wreck ahead in the same lane
          if (targetSpeed > 0) {
            for (const other of this.vehicles) {
              if (other.id === v.id || (other.y ?? 0) > 2.2) continue;
              const otherFwdX = -Math.sin(other.yaw);
              const otherFwdZ = -Math.cos(other.yaw);
              const sameDir = otherFwdX * fwdX + otherFwdZ * fwdZ > 0.5 || other.destroyed || other.occupiedByPlayer;
              if (!sameDir) continue;
              const toX = other.x - v.x;
              const toZ = other.z - v.z;
              const forwardProj = toX * fwdX + toZ * fwdZ;
              if (forwardProj > 2.2 && forwardProj < 11.5) {
                const lateral = Math.abs(toX * fwdZ - toZ * fwdX);
                if (lateral < 2.3) {
                  const aheadSpd = Math.abs(other.speed) < 0.4 || other.destroyed ? 0 : Math.max(0, Math.abs(other.speed) - 0.6);
                  targetSpeed = Math.min(targetSpeed, aheadSpd);
                  if (aheadSpd === 0) blockedByTraffic = true;
                }
              }
            }
          }

          // Check if player is standing or stopped directly in front on the road -> realistic AI honk
          const toPlayerX = this.playerX - v.x;
          const toPlayerZ = this.playerZ - v.z;
          const distToPlayer = Math.hypot(toPlayerX, toPlayerZ);
          if (distToPlayer < 12 && this.playerY < 2.0) {
            const pFwd = toPlayerX * fwdX + toPlayerZ * fwdZ;
            const pLat = Math.abs(toPlayerX * fwdZ - toPlayerZ * fwdX);
            if (pFwd > 1.8 && pFwd < 11 && pLat < 2.4) {
              blockedByTraffic = true;
              if (!this.currentVehicle && pFwd < 7.5) targetSpeed = Math.min(targetSpeed, 1.8);
            }
          }

          if (blockedByTraffic && (!v.aiHornCooldown || v.aiHornCooldown <= 0) && distToPlayer < 46) {
            v.aiHornCooldown = 2.6 + Math.random() * 4.5;
            soundEngine.playCarHorn(v.kind, clamp(1 - distToPlayer / 48, 0.08, 0.72));
          }

          v.speed = THREE.MathUtils.damp(v.speed, targetSpeed, targetSpeed === 0 ? 9.5 : 2.8, dt);
          if (targetSpeed === 0 && Math.abs(v.speed) < 0.25) {
            v.speed = 0;
          }

          let nx = v.x + fwdX * v.speed * dt;
          let nz = v.z + fwdZ * v.speed * dt;
          // Steer smoothly around Chowk roundabout islands so vehicles never get stuck on central plinths
          for (const chowk of CHOWK_ROUNDABOUTS) {
            const dC = Math.hypot(nx - chowk.x, nz - chowk.z);
            const avoidR = chowk.radius + 2.6;
            if (dC < avoidR && dC > 0.01) {
              const push = (avoidR - dC) * 0.65;
              nx += ((nx - chowk.x) / dC) * push;
              nz += ((nz - chowk.z) / dC) * push;
            }
          }
          // Turn around cleanly into the opposite left-hand lane at city bounds
          if (Math.abs(nx) > WORLD_LIMIT - 16 || Math.abs(nz) > WORLD_LIMIT - 16) {
            v.patrolDir = v.patrolDir === 1 ? -1 : 1;
            v.yaw = normalizeAngle(v.yaw + Math.PI);
            const laneCoord = getLeftHandLaneCoord(v.patrolRoadCenter, v.patrolAxis, v.patrolDir);
            if (v.patrolAxis === 'z') {
              nx = laneCoord;
              nz = clamp(nz, -WORLD_LIMIT + 18, WORLD_LIMIT - 18);
            } else {
              nz = laneCoord;
              nx = clamp(nx, -WORLD_LIMIT + 18, WORLD_LIMIT - 18);
            }
          }
          const colR = v.kind === 'bike' ? 0.72 : v.kind === 'rickshaw' ? 1.2 : 1.5;
          const safe = this.resolveCollisions(nx, nz, colR, v.id);
          if (Math.hypot(safe.x - nx, safe.z - nz) > 0.1) {
            v.speed *= 0.3;
          }
          v.x = safe.x;
          v.z = safe.z;
        }
      }

      const impactSpeed = Math.abs(v.speed);
      const hitRadius = v.kind === 'bike' ? 1.15 : v.kind === 'rickshaw' ? 1.65 : 2.15;

      // High-speed crash damage for player-driven vehicles (cars can catch fire & blast; helmets reduce bike crash dmg 65%)
      if (v.occupiedByPlayer && impactSpeed > 13.5 && !v.hitCooldowns.has(-99) && (v.y ?? 0) < 1.5) {
        const fwdX = -Math.sin(v.yaw);
        const fwdZ = -Math.cos(v.yaw);
        const colR = v.kind === 'bike' ? 0.72 : v.kind === 'rickshaw' ? 1.25 : 1.55;
        const probe = this.resolveCollisions(v.x + fwdX * 0.45, v.z + fwdZ * 0.45, colR, v.id);
        if (Math.hypot(probe.x - (v.x + fwdX * 0.45), probe.z - (v.z + fwdZ * 0.45)) > 0.18) {
          v.hitCooldowns.set(-99, 0.55);
          this.crimeRecklessDriving = true;
          this.damageVehicle(v, (impactSpeed - 12) * 3.2, true);
          if (v.kind === 'bike') {
            const rawRiderDmg = (impactSpeed - 11.5) * 1.6;
            const helmetMult = this.hasHelmet && this.helmetOn ? 0.35 : 1.0;
            this.damagePlayer(Math.max(2, Math.round(rawRiderDmg * helmetMult)), 'Bike crash impact');
          }
          soundEngine.playCarCrash(clamp(impactSpeed / 22, 0.35, 1));
        }
      }

      // Speed & momentum-based Vehicle -> NPC collisions (skip when chopper flies high)
      if ((v.y ?? 0) < 2.2) {
        for (const npc of this.npcs) {
          if (npc.dead) continue;
          const dx = npc.x - v.x;
          const dz = npc.z - v.z;
          if (Math.abs(dx) > 5 || Math.abs(dz) > 5) continue;
          const dist = Math.hypot(dx, dz);
          if (dist < hitRadius) {
            const nx = dist > 0.01 ? dx / dist : Math.cos(v.yaw);
            const nz = dist > 0.01 ? dz / dist : -Math.sin(v.yaw);
            const pushOut = hitRadius + 0.1 - dist;
            npc.x += nx * pushOut;
            npc.z += nz * pushOut;

            if (impactSpeed > 4.0 && !v.hitCooldowns.has(npc.id)) {
              v.hitCooldowns.set(npc.id, 0.45);
              if (v.occupiedByPlayer && impactSpeed > 8.5) {
                this.crimeRecklessDriving = true;
              }
              const dmg = Math.round(clamp((impactSpeed - 3.2) * 10.5 * v.massFactor, 12, 160));
              const knockback = Math.min(18, impactSpeed * 0.9 * v.massFactor);
              this.damageNpc(npc, dmg, nx, nz, knockback, v.occupiedByPlayer);
              soundEngine.playCarCrash(clamp(impactSpeed / 20, 0.3, 1));
              v.speed *= 0.86;
            }
          }
        }
      }

      // Vehicle -> Street Dog impact
      if ((v.y ?? 0) < 2.2) {
        for (const dog of this.streetDogs) {
          if (dog.dead || dog.hitCooldown > 0) continue;
          if (Math.abs(dog.x - v.x) > 5 || Math.abs(dog.z - v.z) > 5) continue;
          const dist = Math.hypot(dog.x - v.x, dog.z - v.z);
          if (dist < hitRadius && impactSpeed > 5.2) {
            dog.hitCooldown = 0.6;
            const dmg = Math.round(clamp((impactSpeed - 4.0) * 9.0 * v.massFactor, 15, 90));
            this.damageDog(dog, dmg, v.occupiedByPlayer);
          }
        }
      }

      // Speed & momentum-based Vehicle -> Player collision (if player on foot & not jumping above chassis)
      if (!v.occupiedByPlayer && !this.currentVehicle && this.playerY < 1.35 && (v.y ?? 0) < 2.0) {
        const dx = this.playerX - v.x;
        const dz = this.playerZ - v.z;
        const distToPlayer = Math.hypot(dx, dz);
        if (distToPlayer < hitRadius) {
          const pushX = dx / Math.max(0.1, distToPlayer);
          const pushZ = dz / Math.max(0.1, distToPlayer);

          if (
            (v.kind === 'police' ||
              v.kind === 'swat_van' ||
              v.kind === 'army_truck' ||
              v.kind === 'armored_apc') &&
            this.wantedLevel >= (v.unitTier ?? 2) &&
            impactSpeed < 7.0
          ) {
            // Police cruisers/vans at low speed stop & dismount instead of pinning player
            v.speed = 0;
            v.policeState = 'STOPPED_DISMOUNTED';
            this.ensurePoliceDismounted(v);
          } else if (impactSpeed > 4.2 && !v.hitCooldowns.has(-1)) {
            v.hitCooldowns.set(-1, 0.6);
            const dmg = Math.round(clamp((impactSpeed - 3.5) * 7.5 * v.massFactor, 10, 120));
            soundEngine.playCarCrash(clamp(impactSpeed / 20, 0.35, 1));
            this.damagePlayer(dmg, `${v.name} ne ${Math.round(impactSpeed * 6.2)} km/h par takkar maari`);
            v.speed *= 0.82;
          }

          this.playerX += pushX * (hitRadius + 0.08 - distToPlayer);
          this.playerZ += pushZ * (hitRadius + 0.08 - distToPlayer);
        }
      }

      v.rig.root.position.set(v.x, v.y ?? 0, v.z);
      v.rig.root.rotation.y = v.yaw;
    }

    // Remove burned-out wrecks after timer expires
    if (wreckedIds.length > 0) {
      for (const wid of wreckedIds) {
        const wreck = this.vehicles.find((vh) => vh.id === wid);
        if (wreck) this.scene.remove(wreck.rig.root);
      }
      this.vehicles = this.vehicles.filter((vh) => !wreckedIds.includes(vh.id));
    }
  }

  /**
   * Smart Police AI (Strictly capped at 1 or 2 officers per cruiser):
   * - Approaches an offset standoff zone beside the player rather than ramming directly.
   * - Smoothly brakes to a stop within 13m when player is on foot/slow, then dismounts 1–2 officers.
   * - Never spawns unlimited officers from a single police car.
   */
  private stepPoliceVehicle(v: VehicleEntity, dt: number): void {
    if (v.destroyed) return;
    const dx = this.playerX - v.x;
    const dz = this.playerZ - v.z;
    const dist = Math.hypot(dx, dz);

    if (v.policeState === 'STOPPED_DISMOUNTED') {
      v.speed = THREE.MathUtils.damp(v.speed, 0, 10, dt);

      // If cruiser allows 2 officers and has only spawned 1 so far, dismount the 2nd partner
      if (v.spawnedOfficerIds.length < v.maxOfficers && dist < 24) {
        v.dismountCooldown -= dt;
        if (v.dismountCooldown <= 0) {
          this.ensurePoliceDismounted(v);
        }
      }

      const aliveCrew = this.npcs.filter((n) => v.spawnedOfficerIds.includes(n.id) && !n.dead).length;
      if (dist > 36 && aliveCrew === 0) {
        v.policeState = 'APPROACH';
      }
      return;
    }

    // Offset target 6.5m to the side/front of player so cruiser parks cleanly instead of plowing through player
    const perpX = dz / Math.max(1, dist);
    const perpZ = -dx / Math.max(1, dist);
    const targetX = this.playerX + perpX * 6.5 - (dx / Math.max(1, dist)) * 6.5;
    const targetZ = this.playerZ + perpZ * 6.5 - (dz / Math.max(1, dist)) * 6.5;

    const toTargetX = targetX - v.x;
    const toTargetZ = targetZ - v.z;
    const desiredYaw = Math.atan2(-toTargetX, -toTargetZ);
    v.yaw = lerpAngle(v.yaw, desiredYaw, 1 - Math.exp(-3.4 * dt));

    if (dist < 13 && this.playerSpeed < 9) {
      v.speed = THREE.MathUtils.damp(v.speed, 0, 9.5, dt);
      if (v.speed < 1.2) {
        v.speed = 0;
        v.policeState = 'STOPPED_DISMOUNTED';
        this.ensurePoliceDismounted(v);
      }
    } else if (this.currentVehicle && this.playerSpeed >= 9 && dist < 11) {
      v.policeState = 'TACTICAL_INTERCEPT';
      v.speed = THREE.MathUtils.damp(v.speed, Math.min(v.maxSpeed, this.playerSpeed + 2), 4, dt);
    } else {
      v.policeState = 'APPROACH';
      const targetSpd = dist > 26 ? 17 : 11.5;
      v.speed = THREE.MathUtils.damp(v.speed, targetSpd, 3.2, dt);
    }

    const fwdX = -Math.sin(v.yaw);
    const fwdZ = -Math.cos(v.yaw);
    const nextPos = this.resolveCollisions(v.x + fwdX * v.speed * dt, v.z + fwdZ * v.speed * dt, 1.55, v.id);
    v.x = nextPos.x;
    v.z = nextPos.z;
  }

  private ensurePoliceDismounted(v: VehicleEntity): void {
    // Hard cap: max 1 or 2 officers total from this cruiser (never unlimited!)
    if (v.spawnedOfficerIds.length >= v.maxOfficers) return;

    const sideSign = v.spawnedOfficerIds.length === 0 ? -1 : 1;
    const sideX = Math.cos(v.yaw) * 2.15 * sideSign;
    const sideZ = -Math.sin(v.yaw) * 2.15 * sideSign;
    const tier: 1 | 2 | 3 | 4 | 5 =
      v.kind === 'armored_apc' || v.kind === 'army_truck'
        ? 5
        : v.kind === 'swat_van'
          ? 3
          : (v.unitTier ?? 2);
    const officer = this.spawnPoliceOfficer(v.x + sideX, v.z + sideZ, tier, { hostile: true });
    v.spawnedOfficerIds.push(officer.id);
    v.dismountCooldown = 0.65;
    if (v.spawnedOfficerIds.length === 1) {
      const spoken = soundEngine.speakPoliceLine('warn');
      if (spoken) {
        this.npcSubtitle = { speaker: officer.name, text: spoken.text, ttl: 3.6 };
      }
    }
  }

  private randomizeThanaPrisoners(force: boolean): void {
    if (!this.jailRig) return;
    const distToThana = Math.hypot(this.playerX - -150, this.playerZ - 163.5);
    if (!force && distToThana < 34) return;
    const count = Math.floor(Math.random() * 3); // 0, 1, or 2 NPC prisoners dynamically
    this.thanaPrisonerActiveCount = count;
    this.jailRig.thanaPrisoners.forEach((p, idx) => {
      const show = idx < count;
      p.active = show;
      p.rig.root.visible = show;
    });
  }

  private stepThanaAndCourtActors(dt: number, suppressAmbientSpeech: boolean): void {
    const tNow = performance.now() * 0.004;

    if (this.jailRig) {
      const blink = Math.sin(tNow * 2.5) > 0;
      this.jailRig.thanaRadioLedMat.color.setHex(blink ? 0x22c55e : 0xf59e0b);

      this.thanaPrisonerShuffleTimer -= dt;
      if (this.thanaPrisonerShuffleTimer <= 0) {
        this.thanaPrisonerShuffleTimer = 42;
        this.randomizeThanaPrisoners(false);
      }

      for (const a of this.jailRig.thanaActors) {
        if (a === this.jailRig.thanaInspectorActor && this.mode === 'CUSTODY' && this.custodyCutscene?.phase === 'THANA_LOCKUP') {
          continue;
        }
        if (!a.active) {
          a.rig.root.visible = false;
          continue;
        }
        a.rig.root.visible = true;
        if (a.waypoints && a.waypoints.length >= 2) {
          const wp = a.waypoints[a.wpIndex];
          const dx = wp.x - a.x;
          const dz = wp.z - a.z;
          const d = Math.hypot(dx, dz);
          if (d < 0.35) {
            a.wpIndex = (a.wpIndex + 1) % a.waypoints.length;
          } else {
            const spd = a.kind === 'prisoner' ? 1.15 : 1.75;
            a.yaw = lerpAngle(a.yaw, Math.atan2(-dx, -dz), 1 - Math.exp(-6 * dt));
            a.x += (dx / d) * spd * dt;
            a.z += (dz / d) * spd * dt;
            a.rig.root.position.set(a.x, 0.28, a.z);
            a.rig.root.rotation.y = a.yaw;
            const swing = Math.sin(tNow * 2.1 + a.seedId) * 0.42;
            a.rig.leftLeg.rotation.x = swing;
            a.rig.rightLeg.rotation.x = -swing;
            a.rig.leftArm.rotation.x = -swing * 0.4;
            a.rig.rightArm.rotation.x = a.kind === 'constable' ? 0.45 : swing * 0.4;
          }
        } else {
          // Stationary Duty Officer, Complainant, or Lockup Questioning Constable
          a.rig.leftLeg.rotation.x = 0;
          a.rig.rightLeg.rotation.x = 0;
          if (a === this.jailRig.thanaLockupConstable) {
            a.rig.rightArm.rotation.x =
              this.thanaPrisonerActiveCount > 0 ? 0.55 + Math.sin(tNow * 1.9) * 0.35 : 0.1;
          } else {
            a.rig.rightArm.rotation.x = Math.sin(tNow * 1.4 + a.seedId) * 0.22;
          }
        }
      }

      // Localized Police Thana SFX + Ambient Hindi Chatter
      const distThana = Math.hypot(this.playerX - -150, this.playerZ - 163.5);
      if (distThana < 26) {
        this.thanaChatterCooldown -= dt;
        if (this.thanaChatterCooldown <= 0) {
          this.thanaChatterCooldown = 5.5 + Math.random() * 4.5;
          if (Math.random() < 0.55) {
            soundEngine.playPoliceRadioChatter();
          } else {
            soundEngine.playThanaPhoneRing();
          }
        }
        if (!suppressAmbientSpeech && !this.npcSubtitle && !this.licenseRevokedPrompt?.active) {
          this.thanaAmbientBubbleTimer -= dt;
          if (this.thanaAmbientBubbleTimer <= 0) {
            this.thanaAmbientBubbleTimer = 7.5 + Math.random() * 4;
            const pick = pickAmbientActorLine(
              this.thanaPrisonerActiveCount > 0 && Math.random() < 0.55
                ? 'thana_lockup_ambient'
                : 'thana_ambient',
            );
            this.speakWithSubtitle(pick.speaker, pick.role, pick.seed, pick.text, pick.tts, 'low');
          }
        }
      }
    }

    // Bustling District Court Complex Actors (Spectator Mode)
    if (this.courtRig) {
      for (const a of this.courtRig.actors) {
        if (a.kind === 'vakil' && a.waypoints && a.waypoints.length >= 2) {
          const wp = a.waypoints[a.wpIndex];
          const dx = wp.x - a.x;
          const dz = wp.z - a.z;
          const d = Math.hypot(dx, dz);
          if (d < 0.35) {
            a.wpIndex = (a.wpIndex + 1) % a.waypoints.length;
          } else {
            const spd = 1.85;
            a.yaw = lerpAngle(a.yaw, Math.atan2(-dx, -dz), 1 - Math.exp(-6 * dt));
            a.x += (dx / d) * spd * dt;
            a.z += (dz / d) * spd * dt;
            a.rig.root.position.set(a.x, 0.24, a.z);
            a.rig.root.rotation.y = a.yaw;
            const swing = Math.sin(tNow * 2.0 + a.seedId) * 0.4;
            a.rig.leftLeg.rotation.x = swing;
            a.rig.rightLeg.rotation.x = -swing;
            a.rig.leftArm.rotation.x = 0.72; // Carrying bundle of legal case papers
            a.rig.rightArm.rotation.x = -swing * 0.3;
          }
        } else if (a.kind === 'clerk') {
          // Clerks typing fast on files at Atrium desks
          a.rig.leftArm.rotation.x = 0.85 + Math.sin(tNow * 4.5 + a.seedId) * 0.14;
          a.rig.rightArm.rotation.x = 0.85 + Math.cos(tNow * 4.8 + a.seedId) * 0.14;
        } else if (a.kind === 'judge') {
          a.rig.rightArm.rotation.x = 0.3 + Math.sin(tNow * 1.1 + a.seedId) * 0.25;
        } else if (a.kind === 'witness') {
          a.rig.rightArm.rotation.x = Math.sin(tNow * 1.6 + a.seedId) * 0.18;
        }
      }

      const distCourt = Math.hypot(
        this.playerX - this.courtRig.atriumCenter.x,
        this.playerZ - this.courtRig.atriumCenter.z,
      );
      if (!suppressAmbientSpeech && distCourt < 22 && !this.npcSubtitle) {
        this.courtAmbientBubbleTimer -= dt;
        if (this.courtAmbientBubbleTimer <= 0) {
          this.courtAmbientBubbleTimer = 7.5 + Math.random() * 4;
          const pick = pickAmbientActorLine('court_ambient');
          this.speakWithSubtitle(pick.speaker, pick.role, pick.seed, pick.text, pick.tts, 'low');
        }
      }
    }
  }

  private stepNpcs(dt: number): void {
    let activeCount = 0;
    const toRemove: number[] = [];

    for (const npc of this.npcs) {
      if (npc.dead) {
        npc.deathTimer -= dt;
        if (npc.deathTimer <= 0) {
          this.scene.remove(npc.rig.root);
          toRemove.push(npc.id);
        }
        continue;
      }

      if (!npc.isPolice) activeCount++;

      if (npc.staggerTimer > 0) {
        npc.staggerTimer -= dt;
      }
      if (npc.greetCooldown > 0) {
        npc.greetCooldown -= dt;
      }

      // Apply damped knockback velocity
      if (Math.abs(npc.vx) > 0.05 || Math.abs(npc.vz) > 0.05) {
        const nextK = this.resolveCollisions(npc.x + npc.vx * dt, npc.z + npc.vz * dt, 0.45);
        npc.x = nextK.x;
        npc.z = nextK.z;
        const damp = Math.exp(-10 * dt);
        npc.vx *= damp;
        npc.vz *= damp;
      }

      const dx = this.playerX - npc.x;
      const dz = this.playerZ - npc.z;
      const dist = Math.hypot(dx, dz);

      if (this.activeWitness && this.activeWitness.npcId === npc.id) {
        // Witness pulls out fictional smartphone, faces player timidly, steps back slowly
        npc.rig.phoneProp.visible = true;
        npc.rig.leftArm.rotation.x = 1.28;
        const awayYaw = Math.atan2(-(npc.x - this.playerX), -(npc.z - this.playerZ));
        npc.yaw = lerpAngle(npc.yaw, awayYaw, 1 - Math.exp(-6 * dt));
        if (dist < 14 && npc.staggerTimer <= 0) {
          const stepB = this.resolveCollisions(
            npc.x - Math.sin(npc.yaw) * 1.45 * dt,
            npc.z - Math.cos(npc.yaw) * 1.45 * dt,
            0.45,
          );
          npc.x = stepB.x;
          npc.z = stepB.z;
          npc.walkPhase += dt * 4.5;
        } else {
          npc.walkPhase = 0;
        }
      } else if (this.policeInspection && this.policeInspection.officerId === npc.id) {
        // Inspecting officer approaches calmly within 5.6m without firing and asks for Arms License
        npc.yaw = lerpAngle(npc.yaw, Math.atan2(-dx, -dz), 1 - Math.exp(-8 * dt));
        if (dist > 5.6 && npc.staggerTimer <= 0) {
          const approachSpd = 4.6;
          const nextI = this.resolveCollisions(
            npc.x - Math.sin(npc.yaw) * approachSpd * dt,
            npc.z - Math.cos(npc.yaw) * approachSpd * dt,
            0.45,
          );
          npc.x = nextI.x;
          npc.z = nextI.z;
          npc.walkPhase += dt * 8.5;
        } else {
          npc.walkPhase = 0;
        }
      } else if (npc.isPolice && (this.wantedLevel > 0 || npc.hostile)) {
        const tier = npc.lawTier ?? (npc.isArmy ? 5 : npc.isCommando ? 4 : npc.isSwat ? 3 : npc.isBeatCop ? 1 : 2);
        const nonLethalArrest = this.isPoliceNonLethalArrestMode() && tier <= 3;

        // Swap Police hand prop between wooden Lathi (non-lethal arrest) and firearm (lethal force)
        npc.rig.lathiProp.visible = nonLethalArrest;
        for (const child of npc.rig.weaponMount.children) {
          if (child !== npc.rig.lathiProp) {
            child.visible = !nonLethalArrest;
          }
        }

        npc.yaw = lerpAngle(npc.yaw, Math.atan2(-dx, -dz), 1 - Math.exp(-9 * dt));

        if (nonLethalArrest) {
          // Non-lethal Arrest Mode (1-2★ or 3★ holstered): rush in with Lathi baton to corner & bust player
          const lathiRange = 1.85;
          if (dist > lathiRange && npc.staggerTimer <= 0) {
            const spd = 5.3;
            const nextP = this.resolveCollisions(
              npc.x - Math.sin(npc.yaw) * spd * dt,
              npc.z - Math.cos(npc.yaw) * spd * dt,
              0.45,
            );
            npc.x = nextP.x;
            npc.z = nextP.z;
            npc.walkPhase += dt * 10;
          } else {
            npc.walkPhase = 0;
          }

          if (dist <= 2.2) {
            npc.meleeCooldown -= dt;
            if (npc.meleeCooldown <= 0) {
              npc.meleeCooldown = 0.85;
              npc.punchAnimTimer = 0.24;
              soundEngine.playPunch(true);
              this.playerStamina = Math.max(0, this.playerStamina - 16);
              if (this.playerStamina < 10) this.staminaExhausted = true;
              // Lathi taps deal light non-lethal damage (capped above 8 HP)
              if (this.playerHp > 8) {
                this.playerHp = Math.max(8, this.playerHp - 8);
              }
              if (Math.random() < 0.4) {
                this.speakWithSubtitle(
                  npc.name,
                  'officer',
                  npc.id,
                  'Haath upar kar! Lathi padegi, surrender kar!',
                  'हाथ ऊपर कर! लाठी पड़ेगी, सरेंडर कर!',
                );
              }
            }
          }
        } else {
          // Lethal Mode (4-5★, shot at police, or holding weapon at 3★)
          const engageDist = tier >= 3 ? 16 : 12;
          if (dist > engageDist && npc.staggerTimer <= 0) {
            const spd = tier >= 4 ? 5.2 : 4.6;
            const nextP = this.resolveCollisions(
              npc.x - Math.sin(npc.yaw) * spd * dt,
              npc.z - Math.cos(npc.yaw) * spd * dt,
              0.45,
            );
            npc.x = nextP.x;
            npc.z = nextP.z;
            npc.walkPhase += dt * 9;
          }

          npc.fireCooldown -= dt;
          const maxRange = tier >= 4 ? 40 : tier >= 3 ? 36 : 30;
          if (npc.fireCooldown <= 0 && dist < maxRange) {
            const baseInterval = tier === 1 ? 1.65 : tier === 2 ? 1.2 : tier === 3 ? 0.92 : tier === 4 ? 0.72 : 0.6;
            npc.fireCooldown = baseInterval + Math.random() * 0.25;
            const dirX = dx / Math.max(0.1, dist);
            const dirZ = dz / Math.max(0.1, dist);
            const wallDist = this.raycastBuildings(npc.x, npc.z, dirX, dirZ, dist);
            if (wallDist >= dist - 0.8) {
              soundEngine.playGunshot(npc.weaponKind ?? (tier >= 4 ? 'rifle' : tier === 3 ? 'smg' : 'pistol'));
              const hitChance = dist < 14 ? (tier === 1 ? 0.55 : 0.72) : tier >= 3 ? 0.52 : 0.42;
              const dmg = tier === 1 ? 5 : tier === 2 ? 8 : tier === 3 ? 11 : tier === 4 ? 13 : 15;
              if (Math.random() < hitChance) {
                const reason =
                  tier === 5
                    ? 'Army Jawan ki goli se dher ho gaye'
                    : tier === 4
                      ? 'ATS Commando ki goli se haar gaye'
                      : tier === 3
                        ? 'STF SWAT squad ne maar giraya'
                        : 'Police ki goli se dher ho gaye';
                this.damagePlayer(dmg, reason);
              }
              const traceColor = tier >= 5 ? 0x22c55e : tier >= 3 ? 0x38bdf8 : 0xef4444;
              this.spawnBulletTrace(npc.x, 1.32, npc.z, this.playerX, 1.25, this.playerZ, traceColor);
            }
          }
        }
      } else if (npc.isTrafficPolice && !npc.hostile) {
        // Standing Traffic Police officer stationed at intersection corner
        const hx = npc.homeX ?? npc.x;
        const hz = npc.homeZ ?? npc.z;
        const distHome = Math.hypot(hx - npc.x, hz - npc.z);
        if (distHome > 0.6 && npc.staggerTimer <= 0) {
          npc.targetYaw = Math.atan2(-(hx - npc.x), -(hz - npc.z));
          npc.yaw = lerpAngle(npc.yaw, npc.targetYaw, 1 - Math.exp(-6 * dt));
          const stepH = this.resolveCollisions(
            npc.x - Math.sin(npc.yaw) * 2.4 * dt,
            npc.z - Math.cos(npc.yaw) * 2.4 * dt,
            0.45,
          );
          npc.x = stepH.x;
          npc.z = stepH.z;
          npc.walkPhase += dt * 6;
        } else {
          const watchYaw = dist < 12 ? Math.atan2(-dx, -dz) : (npc.homeYaw ?? 0);
          npc.yaw = lerpAngle(npc.yaw, watchYaw, 1 - Math.exp(-4 * dt));
          npc.walkPhase = 0;
        }
      } else if (npc.isBeatCop && !npc.hostile) {
        // Calm walking Beat Constable patrolling sidewalks on foot
        npc.wanderTimer -= dt;
        if (npc.wanderTimer <= 0) {
          npc.wanderTimer = 3.5 + Math.random() * 4;
          npc.targetYaw = Math.random() * Math.PI * 2 - Math.PI;
        }
        npc.yaw = lerpAngle(npc.yaw, npc.targetYaw, 1 - Math.exp(-5 * dt));
        if (npc.staggerTimer <= 0) {
          const nextB = this.resolveCollisions(
            npc.x - Math.sin(npc.yaw) * 2.1 * dt,
            npc.z - Math.cos(npc.yaw) * 2.1 * dt,
            0.45,
          );
          if (Math.hypot(nextB.x - npc.x, nextB.z - npc.z) < 2.1 * dt * 0.35) {
            npc.targetYaw = normalizeAngle(npc.targetYaw + Math.PI * 0.75);
          }
          npc.x = nextB.x;
          npc.z = nextB.z;
          npc.walkPhase += dt * 5;
        }
      } else if (npc.hostile && !npc.isPolice && dist < 34) {
        npc.yaw = lerpAngle(npc.yaw, Math.atan2(-dx, -dz), 1 - Math.exp(-9 * dt));
        if (npc.isEnforcer && dist > 6 && dist < 30) {
          npc.fireCooldown -= dt;
          if (npc.fireCooldown <= 0) {
            // Weak mission guards fire slower, less accurately, and deal light damage
            npc.fireCooldown = npc.isMissionEnemy ? 2.1 : 1.25;
            soundEngine.playGunshot('pistol');
            const hitAcc = npc.isMissionEnemy ? 0.22 : 0.48;
            const dmg = npc.isMissionEnemy ? 4 : 9;
            if (Math.random() < hitAcc) {
              this.damagePlayer(
                dmg,
                npc.isMissionEnemy ? 'Dog Mafia ke gunde ne maar giraya' : 'Street Gunde se haar gaye',
              );
            }
            this.spawnBulletTrace(npc.x, 1.32, npc.z, this.playerX, 1.25, this.playerZ, 0xf97316);
          }
        } else if (dist > 1.75 && npc.staggerTimer <= 0) {
          // Chase player on foot to brawl
          const chaseSpd = 5.4;
          const nextA = this.resolveCollisions(
            npc.x - Math.sin(npc.yaw) * chaseSpd * dt,
            npc.z - Math.cos(npc.yaw) * chaseSpd * dt,
            0.45,
          );
          npc.x = nextA.x;
          npc.z = nextA.z;
          npc.walkPhase += dt * 11;
        } else if (dist <= 2.1 && npc.staggerTimer <= 0) {
          // Melee punch back!
          npc.meleeCooldown -= dt;
          if (npc.meleeCooldown <= 0) {
            npc.meleeCooldown = 0.95;
            npc.punchAnimTimer = 0.24;
            soundEngine.playPunch(true);
            this.damagePlayer(10, `${npc.name} ke mukke se knockout`);
          }
        }
      } else if (npc.chaiCompanionTarget) {
        // Walking together with player toward the nearest Chai Tapri
        const stall = npc.chaiCompanionTarget;
        const toStallX = stall.approachX - npc.x;
        const toStallZ = stall.approachZ - npc.z;
        const stallDist = Math.hypot(toStallX, toStallZ);
        const playerStallDist = Math.hypot(stall.approachX - this.playerX, stall.approachZ - this.playerZ);

        if (stallDist < 3.6 && playerStallDist < 5.5) {
          npc.chaiCompanionTarget = null;
          this.playerHp = Math.min(this.playerMaxHp, this.playerHp + 5);
          soundEngine.playCashPickup();
          this.speakWithSubtitle(
            npc.name,
            'citizen',
            npc.id,
            'Wah bhai! Kya kadak chai bani hai!',
            'वाह भाई! क्या कड़क चाय बनी है!',
          );
          this.callbacks.onToast({
            text: `${stall.name}: Garma-garam Chai (+5 HP)`,
            tone: 'cash',
          });
        } else if (dist > 28) {
          npc.chaiCompanionTarget = null;
        } else if (stallDist > 2.0 && dist < 8.5 && npc.staggerTimer <= 0) {
          npc.targetYaw = Math.atan2(-toStallX, -toStallZ);
          npc.yaw = lerpAngle(npc.yaw, npc.targetYaw, 1 - Math.exp(-7 * dt));
          const walkSpd = 3.9;
          const nextW = this.resolveCollisions(
            npc.x - Math.sin(npc.yaw) * walkSpd * dt,
            npc.z - Math.cos(npc.yaw) * walkSpd * dt,
            0.45,
          );
          npc.x = nextW.x;
          npc.z = nextW.z;
          npc.walkPhase += dt * 9;
        } else {
          // Wait warmly looking toward player while player catches up
          npc.yaw = lerpAngle(npc.yaw, Math.atan2(-dx, -dz), 1 - Math.exp(-6 * dt));
        }
      } else if (npc.landmarkKind && !npc.hostile && npc.alertedTimer <= 0) {
        // Temple Pandits, Devotees, Mosque Imam & Visitors stay calmly around their sacred courtyard
        if (
          !this.currentVehicle &&
          dist < 5.4 &&
          npc.greetCooldown <= 0 &&
          this.globalGreetCooldown <= 0
        ) {
          npc.greetCooldown = 16 + Math.random() * 10;
          this.globalGreetCooldown = 3.5;
          if (npc.landmarkKind === 'ram_mandir') {
            const pair = pickHindiLine('sacred_ram_mandir');
            this.speakWithSubtitle(npc.name, 'citizen', npc.id, pair.text, pair.tts, 'low');
          } else if (npc.landmarkKind === 'krishna_mandir') {
            const pair = pickHindiLine('sacred_krishna_mandir');
            this.speakWithSubtitle(npc.name, 'citizen', npc.id, pair.text, pair.tts, 'low');
          } else {
            const pair = pickHindiLine('sacred_mosque');
            this.speakWithSubtitle(npc.name, 'citizen', npc.id, pair.text, pair.tts, 'low');
          }
        }
        const hx = npc.homeX ?? npc.x;
        const hz = npc.homeZ ?? npc.z;
        const dHome = Math.hypot(hx - npc.x, hz - npc.z);
        if (dHome > 3.2 && npc.staggerTimer <= 0) {
          npc.targetYaw = Math.atan2(-(hx - npc.x), -(hz - npc.z));
          npc.yaw = lerpAngle(npc.yaw, npc.targetYaw, 1 - Math.exp(-5 * dt));
          const stepBack = this.resolveCollisions(
            npc.x - Math.sin(npc.yaw) * 1.4 * dt,
            npc.z - Math.cos(npc.yaw) * 1.4 * dt,
            0.45,
          );
          npc.x = stepBack.x;
          npc.z = stepBack.z;
          npc.walkPhase += dt * 4;
        } else {
          const watchYaw = dist < 8 ? Math.atan2(-dx, -dz) : (npc.homeYaw ?? 0);
          npc.yaw = lerpAngle(npc.yaw, watchYaw, 1 - Math.exp(-4 * dt));
          npc.walkPhase = 0;
        }
      } else {
        // Friendly Hindi greetings when player walks close to calm citizens
        if (
          !this.currentVehicle &&
          !npc.isEnforcer &&
          !npc.isPolice &&
          npc.alertedTimer <= 0 &&
          dist < 5.0 &&
          npc.greetCooldown <= 0 &&
          this.globalGreetCooldown <= 0
        ) {
          npc.greetCooldown = 16 + Math.random() * 10;
          this.globalGreetCooldown = 3.2;
          const chosen = pickHindiLine('street_greet');
          this.speakWithSubtitle(npc.name, 'citizen', npc.id, chosen.text, chosen.tts, 'low');
          if (chosen.text === 'Chal chai piyega?') {
            this.activeChaiPrompt = {
              npcId: npc.id,
              npcName: npc.name,
              line: chosen.text,
              micListening: false,
              micStatus: null,
              ttl: 14,
            };
          }
        }

        // Civilian patrol or panic sprint away from player
        if (npc.alertedTimer > 0) {
          npc.alertedTimer -= dt;
          npc.targetYaw = Math.atan2(-(npc.x - this.playerX), -(npc.z - this.playerZ));
        } else {
          npc.wanderTimer -= dt;
          if (npc.wanderTimer <= 0) {
            npc.wanderTimer = 3 + Math.random() * 4;
            npc.targetYaw = Math.random() * Math.PI * 2 - Math.PI;
          }
        }
        npc.yaw = lerpAngle(npc.yaw, npc.targetYaw, 1 - Math.exp(-6 * dt));
        if (npc.staggerTimer <= 0) {
          const spd = npc.alertedTimer > 0 ? 6.6 : 1.9;
          const nextC = this.resolveCollisions(
            npc.x - Math.sin(npc.yaw) * spd * dt,
            npc.z - Math.cos(npc.yaw) * spd * dt,
            0.45,
          );
          if (Math.hypot(nextC.x - npc.x, nextC.z - npc.z) < spd * dt * 0.35) {
            npc.targetYaw = normalizeAngle(npc.targetYaw + Math.PI * 0.75);
          }
          npc.x = nextC.x;
          npc.z = nextC.z;
          npc.walkPhase += dt * (spd * 2.2);
        }
      }

      if (this.activeWitness?.npcId !== npc.id) {
        if (npc.rig.phoneProp.visible) npc.rig.phoneProp.visible = false;
        npc.rig.leftArm.rotation.x = -Math.sin(npc.walkPhase) * 0.35;
      }

      if (npc.punchAnimTimer > 0) {
        npc.punchAnimTimer -= dt;
        const p = Math.sin((npc.punchAnimTimer / 0.24) * Math.PI);
        npc.rig.rightArm.rotation.x = p * 1.45;
      } else if (!npc.isPolice) {
        npc.rig.rightArm.rotation.x = Math.sin(npc.walkPhase) * 0.35;
      }

      npc.rig.root.position.set(npc.x, 0, npc.z);
      npc.rig.root.rotation.y = npc.yaw;
      const swing = Math.sin(npc.walkPhase) * 0.45;
      npc.rig.leftLeg.rotation.x = swing;
      npc.rig.rightLeg.rotation.x = -swing;
    }

    if (toRemove.length > 0) {
      this.npcs = this.npcs.filter((n) => !toRemove.includes(n.id));
    }

    // Check cornered BUSTED arrest condition when non-lethal lathi officers pin player at low stamina/HP
    if (this.isPoliceNonLethalArrestMode() && this.mode === 'PLAYING' && this.missionPhase === 'NONE') {
      const slowOrOnFoot = !this.currentVehicle || Math.abs(this.currentVehicle.speed) < 3.5;
      const copPinning = this.npcs.some(
        (n) => !n.dead && n.isPolice && Math.hypot(n.x - this.playerX, n.z - this.playerZ) < 2.25,
      );
      if (slowOrOnFoot && copPinning && (this.playerStamina < 28 || this.playerHp < 32)) {
        this.corneredArrestTimer += dt;
        if (this.corneredArrestTimer >= 1.05) {
          this.corneredArrestTimer = 0;
          this.triggerBusted('Police ne gher kar lathi-charge ke baad giraftar kar liya!');
        }
      } else {
        this.corneredArrestTimer = Math.max(0, this.corneredArrestTimer - dt * 1.5);
      }
    } else {
      this.corneredArrestTimer = 0;
    }

    // Maintain ambient NPC & AI traffic population scaled to user density settings
    this.rebalanceAmbientPopulation();
  }

  private stepPickupsAndTraces(dt: number): void {
    // Cash pickups
    const remainingPickups: CashPickup[] = [];
    for (const p of this.pickups) {
      p.age += dt;
      p.mesh.rotation.y += dt * 2.5;
      p.mesh.position.y = 0.48 + Math.sin(p.age * 4) * 0.1;

      if (Math.hypot(p.x - this.playerX, p.z - this.playerZ) < 1.9) {
        this.playerCash += p.amount;
        soundEngine.playCashPickup();
        this.callbacks.onToast({ text: `+${formatRs(p.amount)}`, tone: 'cash' });
        this.saveGameState();
        this.scene.remove(p.mesh);
        p.mesh.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            m.geometry.dispose();
            if (Array.isArray(m.material)) m.material.forEach((mt) => mt.dispose());
            else m.material?.dispose();
          }
        });
      } else if (p.age > 35) {
        this.scene.remove(p.mesh);
        p.mesh.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            m.geometry.dispose();
            if (Array.isArray(m.material)) m.material.forEach((mt) => mt.dispose());
            else m.material?.dispose();
          }
        });
      } else {
        remainingPickups.push(p);
      }
    }
    this.pickups = remainingPickups;

    // Bullet traces
    const remainingTraces: BulletTrace[] = [];
    for (const tr of this.traces) {
      tr.ttl -= dt;
      if (tr.ttl <= 0) {
        this.scene.remove(tr.line);
        tr.line.geometry.dispose();
        (tr.line.material as THREE.Material).dispose();
      } else {
        remainingTraces.push(tr);
      }
    }
    this.traces = remainingTraces;
  }

  private spawnSmokePuff(x: number, y: number, z: number, colorHex: number): void {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 7, 6),
      new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.58 }),
    );
    mesh.position.set(x, y, z);
    this.scene.add(mesh);
    this.smokePuffs.push({ mesh, vy: 1.9 + Math.random() * 0.8, age: 0, maxAge: 1.25 });
  }

  private stepExplosionsAndSmoke(dt: number): void {
    const nextExp: ExplosionEffect[] = [];
    for (const ex of this.explosions) {
      ex.age += dt;
      const t = clamp(ex.age / ex.maxAge, 0, 1);
      if (t >= 1) {
        this.scene.remove(ex.fireball);
        this.scene.remove(ex.shockwave);
        ex.fireball.geometry.dispose();
        (ex.fireball.material as THREE.Material).dispose();
        ex.shockwave.geometry.dispose();
        (ex.shockwave.material as THREE.Material).dispose();
      } else {
        const fbScale = 1 + t * 5.2;
        ex.fireball.scale.setScalar(fbScale);
        ex.fireball.position.y = 1.2 + t * 2.2;
        (ex.fireball.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.92;
        const swScale = 1 + t * 8.5;
        ex.shockwave.scale.setScalar(swScale);
        (ex.shockwave.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.85;
        nextExp.push(ex);
      }
    }
    this.explosions = nextExp;

    const nextSmoke: SmokePuffEffect[] = [];
    for (const sm of this.smokePuffs) {
      sm.age += dt;
      const t = clamp(sm.age / sm.maxAge, 0, 1);
      if (t >= 1) {
        this.scene.remove(sm.mesh);
        sm.mesh.geometry.dispose();
        (sm.mesh.material as THREE.Material).dispose();
      } else {
        sm.mesh.position.y += sm.vy * dt;
        sm.mesh.scale.setScalar(1 + t * 2.2);
        (sm.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.55;
        nextSmoke.push(sm);
      }
    }
    this.smokePuffs = nextSmoke;
  }

  private updateCamera(dt: number): void {
    const canAds = this.adsActive && !this.currentVehicle && this.activeWeapon !== 'fists';
    const targetFov = canAds ? WEAPONS[this.activeWeapon].scopeFov : this.cameraMode === 'first_person' && this.currentVehicle ? 72 : 62;
    this.currentFov = THREE.MathUtils.damp(this.currentFov, targetFov, 11, dt);
    if (Math.abs(this.camera.fov - this.currentFov) > 0.05) {
      this.camera.fov = this.currentFov;
      this.camera.updateProjectionMatrix();
    }

    if (this.cameraMode === 'first_person' && this.currentVehicle) {
      const v = this.currentVehicle;
      const offset =
        v.kind === 'bike'
          ? { right: 0, up: 1.42, fwd: 0.04 }
          : v.kind === 'rickshaw'
            ? { right: 0, up: 1.46, fwd: 0.26 }
            : v.kind === 'chopper'
              ? { right: -0.34, up: 1.52, fwd: 1.25 }
              : v.kind === 'police'
                ? { right: -0.36, up: 1.48, fwd: 0.28 }
                : v.kind === 'swat_van' || v.kind === 'army_truck' || v.kind === 'armored_apc'
                  ? { right: -0.34, up: 1.82, fwd: 1.18 }
                  : { right: -0.34, up: 1.24, fwd: 0.22 };

      const fwdX = -Math.sin(v.yaw);
      const fwdZ = -Math.cos(v.yaw);
      const rightX = Math.cos(v.yaw);
      const rightZ = -Math.sin(v.yaw);
      const eyeX = v.x + fwdX * offset.fwd + rightX * offset.right;
      const eyeY = (v.y ?? 0) + offset.up;
      const eyeZ = v.z + fwdZ * offset.fwd + rightZ * offset.right;
      this.camera.position.set(eyeX, eyeY, eyeZ);

      const cosP = Math.cos(this.camPitch);
      const lookX = -Math.sin(this.camYaw) * cosP;
      const lookY = -Math.sin(this.camPitch);
      const lookZ = -Math.cos(this.camYaw) * cosP;
      this._camTarget.set(eyeX + lookX * 16, eyeY + lookY * 16, eyeZ + lookZ * 16);
      this.camera.lookAt(this._camTarget);
      if (this.fpWeaponGroup) this.fpWeaponGroup.visible = false;
      return;
    }

    if (this.firstPerson && !this.currentVehicle) {
      const eyeY = 1.62 + this.playerY;
      this.camera.position.set(this.playerX, eyeY, this.playerZ);

      const cosP = Math.cos(this.camPitch);
      const lookX = -Math.sin(this.camYaw) * cosP;
      const lookY = -Math.sin(this.camPitch);
      const lookZ = -Math.cos(this.camYaw) * cosP;
      this._camTarget.set(this.playerX + lookX * 14, eyeY + lookY * 14, this.playerZ + lookZ * 14);
      this.camera.lookAt(this._camTarget);

      if (this.fpWeaponGroup) {
        const hideForHolo = canAds && WEAPONS[this.activeWeapon].scopeType === 'holo_2x';
        this.fpWeaponGroup.visible = this.activeWeapon !== 'fists' && !hideForHolo;
        const bob = this.playerSpeed > 0.3 && !canAds ? Math.sin(this.walkPhase) * 0.012 : 0;
        const targetX = canAds ? 0 : 0.24;
        const targetY = canAds ? -0.145 : -0.22 + bob;
        const targetZ = canAds ? -0.36 : -0.48;
        const wAlpha = 1 - Math.exp(-16 * dt);
        this.fpWeaponGroup.position.x = THREE.MathUtils.lerp(this.fpWeaponGroup.position.x, targetX, wAlpha);
        this.fpWeaponGroup.position.y = THREE.MathUtils.lerp(this.fpWeaponGroup.position.y, targetY, wAlpha);
        this.fpWeaponGroup.position.z = THREE.MathUtils.lerp(this.fpWeaponGroup.position.z, targetZ, wAlpha);
      }
      return;
    }

    if (this.fpWeaponGroup) {
      this.fpWeaponGroup.visible = false;
    }

    const isClose = this.cameraMode === 'third_close';
    const baseDist = this.currentVehicle
      ? this.currentVehicle.kind === 'chopper'
        ? isClose
          ? 9.4
          : 12.6
        : isClose
          ? 6.2
          : 9.2
      : isClose
        ? 4.2
        : 6.4;
    const baseHeight = this.currentVehicle
      ? this.currentVehicle.kind === 'chopper'
        ? isClose
          ? 3.8
          : 4.8
        : isClose
          ? 2.55
          : 3.5
      : isClose
        ? 1.95
        : 2.35;
    const dist = canAds ? 3.2 : baseDist;
    const height = canAds ? 1.85 : baseHeight;
    const camFwdX = -Math.sin(this.camYaw);
    const camFwdZ = -Math.cos(this.camYaw);
    const shoulderOffset = canAds ? 0.55 : 0;
    const rightX = Math.cos(this.camYaw) * shoulderOffset;
    const rightZ = -Math.sin(this.camYaw) * shoulderOffset;

    this._camDesired.set(
      this.playerX - camFwdX * dist + rightX,
      height + this.playerY * 0.85 + Math.sin(this.camPitch) * (canAds ? 1.5 : 2.8),
      this.playerZ - camFwdZ * dist + rightZ,
    );
    this._camTarget.set(
      this.playerX + rightX,
      (this.currentVehicle ? 1.2 + (this.currentVehicle.y ?? 0) : 1.45 + this.playerY * 0.55) -
        (canAds ? Math.sin(this.camPitch) * 1.1 : 0),
      this.playerZ + rightZ,
    );

    const alpha = 1 - Math.exp(-12 * dt);
    this.camera.position.lerp(this._camDesired, alpha);
    this.camera.lookAt(this._camTarget);
  }

  private computeRouteToTarget(sx: number, sz: number, tx: number, tz: number): { x: number; z: number }[] {
    const snapRoad = (v: number): number => {
      let best = this.roadCenters[0];
      let minD = Infinity;
      for (const r of this.roadCenters) {
        const d = Math.abs(v - r);
        if (d < minD) {
          minD = d;
          best = r;
        }
      }
      return best;
    };
    const rSx = snapRoad(sx);
    const rSz = snapRoad(sz);
    const rTx = snapRoad(tx);
    const rTz = snapRoad(tz);

    const pts: { x: number; z: number }[] = [{ x: sx, z: sz }];
    if (Math.hypot(rSx - sx, sz - sz) > 3) pts.push({ x: rSx, z: sz });
    pts.push({ x: rSx, z: rSz });
    pts.push({ x: rTx, z: rSz });
    pts.push({ x: rTx, z: rTz });
    pts.push({ x: tx, z: tz });
    return pts;
  }

  private emitHudSnapshot(): void {
    const blips: MinimapBlip[] = [
      { x: 30, z: 109.5, type: 'home' },
      { x: this.gunShopPos.x, z: this.gunShopPos.z, type: 'gunshop' },
      { x: this.hospitalPos.x, z: this.hospitalPos.z, type: 'hospital' },
      { x: this.bankPos.x, z: this.bankPos.z, type: 'bank' },
      { x: this.licenseOfficePos.x, z: this.licenseOfficePos.z, type: 'dm_office' },
      { x: -90, z: 90, type: 'court' },
      { x: -150, z: 150, type: 'jail' },
    ];
    for (const stall of this.chaiStalls) {
      blips.push({
        x: stall.x,
        z: stall.z,
        type: stall.kind === 'chai' ? 'chai' : 'golgappa',
      });
    }
    for (const atm of this.atms) {
      blips.push({
        x: atm.x,
        z: atm.z,
        type: 'atm',
      });
    }
    for (const sp of this.sacredPlaces) {
      blips.push({
        x: sp.x,
        z: sp.z,
        type: sp.kind === 'mosque' ? 'mosque' : 'temple',
      });
    }
    for (const sig of this.trafficSignals) {
      blips.push({
        x: sig.x,
        z: sig.z,
        type: 'traffic_light',
        signalState: this.getSignalAxisState(sig, 'z'),
      });
    }

    const damagedNpcs: DamagedNpcHud[] = [];
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;

    for (const npc of this.npcs) {
      if (npc.dead) continue;
      blips.push({
        x: npc.x,
        z: npc.z,
        type: npc.isMissionEnemy
          ? 'mission_enemy'
          : npc.isArmy
            ? 'army'
            : npc.isTrafficPolice
              ? 'traffic_cop'
              : npc.isPolice
                ? 'police_officer'
                : npc.isEnforcer
                  ? 'enforcer'
                  : 'npc',
      });

      if (npc.hp < npc.maxHp) {
        const dist = Math.hypot(npc.x - this.playerX, npc.z - this.playerZ);
        if (dist < 32) {
          this._proj.set(npc.x, 2.25, npc.z);
          this._proj.project(this.camera);
          if (this._proj.z < 1) {
            const sx = (this._proj.x * 0.5 + 0.5) * w;
            const sy = (-this._proj.y * 0.5 + 0.5) * h;
            damagedNpcs.push({
              id: npc.id,
              name: npc.name,
              hp: Math.ceil(npc.hp),
              maxHp: npc.maxHp,
              screenX: sx,
              screenY: sy,
              isPolice: npc.isPolice,
            });
          }
        }
      }
    }

    for (const dog of this.streetDogs) {
      if (dog.dead) continue;
      blips.push({ x: dog.x, z: dog.z, type: 'dog' });
      if (dog.hp < dog.maxHp) {
        const dist = Math.hypot(dog.x - this.playerX, dog.z - this.playerZ);
        if (dist < 28) {
          this._proj.set(dog.x, 1.35, dog.z);
          this._proj.project(this.camera);
          if (this._proj.z < 1) {
            damagedNpcs.push({
              id: dog.id,
              name: 'Street Dog',
              hp: Math.ceil(dog.hp),
              maxHp: dog.maxHp,
              screenX: (this._proj.x * 0.5 + 0.5) * w,
              screenY: (-this._proj.y * 0.5 + 0.5) * h,
              isPolice: false,
            });
          }
        }
      }
    }
    if (this.rescueVan && this.missionPhase !== 'NONE') {
      blips.push({ x: this.rescueVanPos.x, z: this.rescueVanPos.z, type: 'rescue_van' });
    }
    if (this.chopper) {
      blips.push({ x: this.chopper.x, z: this.chopper.z, type: 'chopper' });
    }

    for (const v of this.vehicles) {
      if (v.occupiedByPlayer || v.destroyed) continue;
      blips.push({
        x: v.x,
        z: v.z,
        type:
          v.kind === 'army_truck' || v.kind === 'armored_apc'
            ? 'army'
            : v.kind === 'police' || v.kind === 'swat_van'
              ? 'police_car'
              : 'vehicle',
        yaw: v.yaw,
      });
    }

    for (const p of this.pickups) {
      blips.push({ x: p.x, z: p.z, type: 'pickup' });
    }

    // Center-screen crosshair target highlight check
    this.targetInCrosshair = false;
    if (!this.currentVehicle && this.activeWeapon !== 'fists') {
      this._ndc.set(0, 0);
      this._raycaster.setFromCamera(this._ndc, this.camera);
      const ro = this._raycaster.ray.origin;
      const rd = this._raycaster.ray.direction;
      const maxRange = WEAPONS[this.activeWeapon].range + 8;
      for (const npc of this.npcs) {
        if (npc.dead) continue;
        const proj = (npc.x - ro.x) * rd.x + (1.1 - ro.y) * rd.y + (npc.z - ro.z) * rd.z;
        if (proj > 1.2 && proj < maxRange) {
          const px = ro.x + rd.x * proj;
          const pz = ro.z + rd.z * proj;
          const py = ro.y + rd.y * proj;
          if (Math.hypot(px - npc.x, pz - npc.z) < 0.65 && py >= 0 && py <= 2.1) {
            this.targetInCrosshair = true;
            break;
          }
        }
      }
      if (!this.targetInCrosshair) {
        const vh = this.getVehicleHitDistance(ro.x, ro.y, ro.z, rd.x, rd.y, rd.z, maxRange);
        if (vh.vehicle) this.targetInCrosshair = true;
      }
    }

    // Contextual interaction prompt + Floating Shop / Bank display tags
    const distToShopCenter = Math.hypot(this.playerX - 30, this.playerZ - -29);
    const nearGunShop = !this.currentVehicle && distToShopCenter < 16;
    const distToBank = Math.hypot(this.playerX - this.bankPos.x, this.playerZ - (this.bankPos.z - 8));
    const nearBank = !this.currentVehicle && distToBank < 18;
    const distToVan =
      this.missionPhase === 'OPEN_VAN' && this.rescueVan
        ? Math.hypot(this.playerX - this.rescueVanPos.x, this.playerZ - (this.rescueVanPos.z + 2.6))
        : 999;
    const nearRescueVan = this.missionPhase === 'OPEN_VAN' && distToVan < 6.5;

    const nearDog = !this.currentVehicle ? this.findClosestStreetDog(3.8) : null;
    const nearDogAction: 'pet' | 'sit' | 'follow' | null = nearDog
      ? nearDog.behavior === 'ROAM'
        ? 'pet'
        : nearDog.behavior === 'FOLLOW'
          ? 'sit'
          : 'follow'
      : null;

    const nearStallFound = !this.currentVehicle ? this.findNearestStreetStall(4.5) : null;
    const nearStall: StreetStallHudInfo | null = nearStallFound
      ? {
          id: nearStallFound.id,
          name: nearStallFound.name,
          kind: nearStallFound.kind,
          vendorName: nearStallFound.vendorName,
        }
      : null;
    const nearAtmFound = !this.currentVehicle ? this.findNearestAtm(4.8) : null;
    const nearAtm: AtmLandmarkHud | null = nearAtmFound
      ? { id: nearAtmFound.id, name: nearAtmFound.name }
      : null;
    const nearSacredFound = !this.currentVehicle ? this.findNearestSacredPlace(14.5) : null;
    const nearSacredPlace = nearSacredFound ? { name: nearSacredFound.name, kind: nearSacredFound.kind } : null;

    const distToLicense = Math.hypot(this.playerX - this.licenseOfficePos.x, this.playerZ - this.licenseOfficePos.z);
    const nearLicenseOffice = !this.currentVehicle && distToLicense < 16;
    const distToThanaDesk = this.jailRig
      ? Math.hypot(this.playerX - this.jailRig.thanaDeskPos.x, this.playerZ - this.jailRig.thanaDeskPos.z)
      : 999;
    const nearThanaDesk = !this.currentVehicle && distToThanaDesk < 4.5;

    const worldLabels: WorldLabelHud[] = [];
    const interactableCandidates: { label: WorldLabelHud; dist: number }[] = [];

    const pushInteractableIfVisible = (
      wx: number,
      wy: number,
      wz: number,
      label: Omit<WorldLabelHud, 'screenX' | 'screenY'>,
    ) => {
      const dist = Math.hypot(wx - this.playerX, wz - this.playerZ);
      if (dist > 11) return;
      this._proj.set(wx, wy, wz).project(this.camera);
      // Center 60% view cone in NDC (-0.6..+0.6 X and Y) and strictly in front of camera
      if (
        this._proj.z <= 0 ||
        this._proj.z >= 1 ||
        Math.abs(this._proj.x) > 0.6 ||
        Math.abs(this._proj.y) > 0.6
      ) {
        return;
      }
      interactableCandidates.push({
        dist,
        label: {
          ...label,
          screenX: (this._proj.x * 0.5 + 0.5) * w,
          screenY: (-this._proj.y * 0.5 + 0.5) * h,
        },
      });
    };

    if (distToShopCenter < 24) {
      for (const disp of this.shopDisplays) {
        const spec = WEAPONS[disp.weaponId];
        const owned = this.ownedWeapons.has(disp.weaponId);
        pushInteractableIfVisible(disp.worldPos.x, disp.worldPos.y, disp.worldPos.z, {
          id: `disp-${disp.weaponId}`,
          title: spec.shortName,
          subtitle: owned
            ? `Owned · Ammo ${formatRs(spec.ammoPrice)}`
            : `${formatRs(spec.price)} · Click to Buy`,
          weaponId: disp.weaponId,
        });
      }
      if (this.shopDealer) {
        pushInteractableIfVisible(
          this.shopDealer.worldPos.x,
          this.shopDealer.worldPos.y,
          this.shopDealer.worldPos.z,
          {
            id: 'shop-dealer',
            title: 'Pankaj Bhai (Shastra Bhandar)',
            subtitle: 'Press E / Click to Browse',
            isDealer: true,
          },
        );
      }
    }

    if (distToBank < 26 && this.bankClerk) {
      pushInteractableIfVisible(
        this.bankClerk.worldPos.x,
        this.bankClerk.worldPos.y,
        this.bankClerk.worldPos.z,
        {
          id: 'bank-clerk',
          title: 'Royal Bank Of India',
          subtitle: 'Press E / Click Officer for Bank & Mission',
          isBanker: true,
        },
      );
    }

    if (this.mode === 'JAIL' && this.jailRig && this.jailState) {
      const allyInmate = this.jailRig.inmates.find((i) => i.ally);
      const stationTags: {
        id: string;
        station: 'BUNK' | 'TOILET' | 'WORKSHOP' | 'WARDEN' | 'ESCAPE_GATE' | 'INMATE_ALLY';
        pos: { x: number; z: number };
        title: string;
        subtitle: string;
      }[] = [
        {
          id: 'jail-bunk',
          station: 'BUNK',
          pos: this.jailRig.bunkPos,
          title: '1. Cell Bunk',
          subtitle: 'Sleep Night (+1 Day & FD Interest) [E]',
        },
        {
          id: 'jail-toilet',
          station: 'TOILET',
          pos: this.jailRig.toiletPos,
          title: 'Cell Toilet',
          subtitle: 'Freshen Up (+Stamina/HP) [E]',
        },
        {
          id: 'jail-workshop',
          station: 'WORKSHOP',
          pos: this.jailRig.workshopPos,
          title: '2. Workshop',
          subtitle: `+${formatRs(JAIL_WORK_WAGE_INR)} & -50% Saza [E]`,
        },
        {
          id: 'jail-warden',
          station: 'WARDEN',
          pos: this.jailRig.wardenPos,
          title: '3. Jailer Mahendra',
          subtitle: `Bribe ${formatRs(this.jailState.wardenBribeCost)} [E]`,
        },
        {
          id: 'jail-escape',
          station: 'ESCAPE_GATE',
          pos: this.jailRig.escapePos,
          title: '4. Weak East Gate',
          subtitle: 'Free Yard Escape Window [E]',
        },
      ];
      if (allyInmate) {
        stationTags.push({
          id: 'jail-ally',
          station: 'INMATE_ALLY',
          pos: { x: allyInmate.x, z: allyInmate.z },
          title: '5. Chhotu Mechanic',
          subtitle: 'Guard Distraction [E/5]',
        });
      }
      for (const st of stationTags) {
        pushInteractableIfVisible(st.pos.x, 3.05, st.pos.z, {
          id: st.id,
          title: st.title,
          subtitle: st.subtitle,
          jailStation: st.station,
        });
      }
      for (const rival of this.jailRig.inmates) {
        if (!rival.isRival) continue;
        pushInteractableIfVisible(rival.x, 2.55, rival.z, {
          id: `jail-rival-${rival.id}`,
          title: rival.defeated
            ? `${rival.name} · KO`
            : rival.bribed
              ? `${rival.name} · Truce`
              : `${rival.name} (${rival.hp}/${rival.maxHp} HP)`,
          subtitle: rival.defeated
            ? 'Knocked Out'
            : rival.bribed
              ? 'Haftaa Paid · Safe'
              : `Fight [Click/J] · Bribe ${formatRs(rival.bribeCost)} [6/B]`,
          jailStation: 'INMATE_RIVAL',
          rivalId: rival.id,
        });
      }
    }

    // Crisp HUD Building Sign Projections (landmarks inside center 60% viewport so HUD corners never overlap)
    if (this.mode === 'PLAYING' && this.houseName !== null) {
      const visibleSigns: { sign: BuildingSignInfo; dist: number; sx: number; sy: number }[] = [];
      for (const sign of this.buildingSigns) {
        const dist = Math.hypot(sign.x - this.playerX, sign.z - this.playerZ);
        if (dist > (sign.maxDist ?? 65)) continue;
        this._proj.set(sign.x, sign.y, sign.z).project(this.camera);
        if (
          this._proj.z > 0 &&
          this._proj.z < 1 &&
          Math.abs(this._proj.x) <= 0.6 &&
          Math.abs(this._proj.y) <= 0.56
        ) {
          visibleSigns.push({
            sign,
            dist,
            sx: (this._proj.x * 0.5 + 0.5) * w,
            sy: (-this._proj.y * 0.5 + 0.5) * h,
          });
        }
      }
      visibleSigns.sort((a, b) => a.dist - b.dist);
      for (const item of visibleSigns.slice(0, 4)) {
        worldLabels.push({
          id: item.sign.id,
          title: item.sign.title,
          subtitle: `${item.sign.subtitle} · ${Math.round(item.dist)}m`,
          screenX: item.sx,
          screenY: item.sy,
          isBuildingSign: true,
          signAccent: item.sign.accent,
        });
      }
    }

    // Personal Indian Family House interior stations
    let nearHomeStation: 'PUJA' | 'BED' | 'WARDROBE' | null = null;
    if (this.mode === 'PLAYING' && !this.currentVehicle && this.homeRig) {
      const distHome = Math.hypot(this.playerX - this.homeRig.homeCenter.x, this.playerZ - this.homeRig.homeCenter.z);
      if (distHome < 18) {
        const homeStations: {
          id: string;
          kind: 'PUJA' | 'BED' | 'WARDROBE';
          pos: THREE.Vector3;
          title: string;
          subtitle: string;
        }[] = [
          {
            id: 'home-puja',
            kind: 'PUJA',
            pos: this.homeRig.pujaPos,
            title: 'Home Puja Corner',
            subtitle: 'Press E for Aarti & Blessing',
          },
          {
            id: 'home-bed',
            kind: 'BED',
            pos: this.homeRig.bedPos,
            title: 'Bedroom (Save & Sleep)',
            subtitle: 'Press E to Rest (+1 Day, Full HP)',
          },
          {
            id: 'home-wardrobe',
            kind: 'WARDROBE',
            pos: this.homeRig.wardrobePos,
            title: 'Almirah / Wardrobe',
            subtitle: 'Press E for Outfits & Locker',
          },
        ];
        for (const hs of homeStations) {
          const d = Math.hypot(this.playerX - hs.pos.x, this.playerZ - hs.pos.z);
          if (d < 3.4) nearHomeStation = hs.kind;
          pushInteractableIfVisible(hs.pos.x, 2.35, hs.pos.z, {
            id: hs.id,
            title: hs.title,
            subtitle: hs.subtitle,
            homeStation: hs.kind,
          });
        }
      }
    }

    if (distToLicense < 26 && this.licenseOfficer) {
      pushInteractableIfVisible(
        this.licenseOfficer.worldPos.x,
        this.licenseOfficer.worldPos.y,
        this.licenseOfficer.worldPos.z,
        {
          id: 'license-officer',
          title: 'DM Arms & Driving Office',
          subtitle:
            this.hasGunLicense && this.hasDrivingLicense
              ? 'Arms + Driving Licenses Approved'
              : `Press E / Click for Arms, DL & Helmet`,
          isLicenseOfficer: true,
        },
      );
    }

    // Sort interactables nearest-first, keep detailed [E] prompt ONLY for single closest target,
    // and prevent overlapping label stacks on screen
    interactableCandidates.sort((a, b) => a.dist - b.dist);
    const placedInteractables: WorldLabelHud[] = [];
    for (let i = 0; i < interactableCandidates.length; i++) {
      const candidate = interactableCandidates[i].label;
      const isClosest = i === 0;
      const overlapsPlaced = placedInteractables.some(
        (p) =>
          Math.abs(p.screenX - candidate.screenX) < 110 &&
          Math.abs(p.screenY - candidate.screenY) < 34,
      );
      if (overlapsPlaced) continue;
      placedInteractables.push({
        ...candidate,
        isClosest,
        subtitle: isClosest ? candidate.subtitle : '',
      });
    }
    worldLabels.push(...placedInteractables);

    let nearPrompt: string | null = null;
    if (this.missionPhase === 'CUTSCENE') {
      nearPrompt = null;
    } else if (this.policeInspection) {
      nearPrompt =
        this.policeInspection.phase === 'ASKING'
          ? `Police Check: [E] Arms License Dikhao & Gun Rakho · [R] Mana Karo`
          : `${this.policeInspection.officerName} license check ke liye aa rahe hain...`;
    } else if (nearRescueVan) {
      nearPrompt = 'Press E or Click Van to open Rescue Van gate';
    } else if (this.currentVehicle) {
      nearPrompt =
        this.currentVehicle.kind === 'bike' && this.hasHelmet && !this.helmetOn
          ? 'Press F to exit bike · Press L to put on ISI Helmet (Challan Safety)'
          : 'Press F to exit vehicle';
    } else if (nearHomeStation === 'PUJA') {
      nearPrompt = 'Home Puja Corner · Press E for Puja & Blessed Regen';
    } else if (nearHomeStation === 'BED') {
      nearPrompt = 'Bedroom · Press E to Save Progress, Sleep (+1 Day) & Full HP';
    } else if (nearHomeStation === 'WARDROBE') {
      nearPrompt = 'Almirah / Wardrobe · Press E to Change Outfit & Store Legal Gear';
    } else if (nearThanaDesk) {
      nearPrompt = this.hasGunLicense
        ? 'Thana No. 4 Duty Desk · Press E to talk to Duty Officer'
        : `Thana No. 4 Duty Desk · Press E for Urgent Arms License Renewal (${formatRs(URGENT_THANA_LICENSE_RENEWAL_INR)})`;
    } else if (nearDogAction === 'pet') {
      nearPrompt = 'Press E to Pet / Feed Street Dog (Saath chalega)';
    } else if (nearDogAction === 'sit') {
      nearPrompt = 'Press E to command Dog: Sit / Stay';
    } else if (nearDogAction === 'follow') {
      nearPrompt = 'Press E to call Dog: Follow';
    } else if (nearAtm) {
      nearPrompt = `${nearAtm.name} · Press E or Click ATM to Withdraw / Deposit`;
    } else if (nearStall) {
      nearPrompt = `${nearStall.name} · Press E or Click to Order`;
    } else if (nearSacredPlace) {
      nearPrompt = `${nearSacredPlace.name} · Press E for ${nearSacredPlace.kind === 'mosque' ? 'Dua & Salaam' : 'Darshan & Blessing'}`;
    } else if (nearLicenseOffice) {
      nearPrompt = `DM & RTO Licensing Office · Press E or Click Officer (Arms License, Driving License & Helmet)`;
    } else if (nearBank) {
      nearPrompt = 'Royal Bank Of India · Press E or Click Bank Officer for Savings, FD & Mission';
    } else if (nearGunShop) {
      nearPrompt = 'Pankaj Shastra Bhandar · Click Display Gun, Right-Click Dealer, or press B';
    } else {
      const nearCar = this.vehicles.find(
        (v) => !v.destroyed && Math.hypot(v.x - this.playerX, v.z - this.playerZ) < 4.2,
      );
      if (nearCar) {
        nearPrompt = `Press F to enter ${nearCar.name}`;
      } else if (
        this.courtRig &&
        Math.hypot(
          this.playerX - this.courtRig.atriumCenter.x,
          this.playerZ - this.courtRig.atriumCenter.z,
        ) < 14.5
      ) {
        nearPrompt =
          'District & Sessions Court (Spectator Gallery) · Observe Vakils, Clerks & Live Side-Hall Hearings';
      }
    }

    const policeStopped = this.vehicles.some(
      (v) => !v.destroyed && v.kind === 'police' && v.policeState === 'STOPPED_DISMOUNTED',
    );
    const policeWarning =
      this.wantedLevel > 0 && policeStopped
        ? 'POLICE: Gaadi ruk gayi — sipahi paidal aa rahe hain!'
        : this.wantedLevel > 0
          ? 'Police Peecha Kar Rahi Hai'
          : null;

    // Mission HUD summary + GPS route
    const enemiesRemaining = this.npcs.filter((n) => n.isMissionEnemy && !n.dead).length;
    const missionActive = this.missionPhase !== 'NONE';
    const targetX = this.missionPhase === 'OPEN_VAN' ? this.rescueVanPos.x : this.mafiaYardPos.x;
    const targetZ = this.missionPhase === 'OPEN_VAN' ? this.rescueVanPos.z + 2.6 : this.mafiaYardPos.z;
    const distanceMeters = Math.round(Math.hypot(targetX - this.playerX, targetZ - this.playerZ));
    const routePoints =
      this.missionPhase === 'ELIMINATE_MAFIA' || this.missionPhase === 'OPEN_VAN'
        ? this.computeRouteToTarget(this.playerX, this.playerZ, targetX, targetZ)
        : [];
    let objectiveText = '';
    if (this.missionPhase === 'ELIMINATE_MAFIA') {
      objectiveText = `Eliminate the Dog Mafia (${enemiesRemaining}/${this.missionEnemiesTotal} left) at North-East Yard`;
    } else if (this.missionPhase === 'OPEN_VAN') {
      objectiveText = 'Open the Rescue Van rear gate to free the street dogs';
    } else if (this.missionPhase === 'CUTSCENE') {
      objectiveText = 'Street dogs rescued and released!';
    }
    const missionHud: MissionHudState = {
      active: missionActive,
      phase: this.missionPhase,
      timeRemainingSec: Math.max(0, Math.ceil(this.missionTimer)),
      enemiesRemaining,
      enemiesTotal: this.missionEnemiesTotal,
      targetX,
      targetZ,
      distanceMeters,
      routePoints,
      objectiveText,
      cutsceneBanner:
        this.missionPhase === 'CUTSCENE'
          ? `MISSION SUCCESSFUL · +${formatRs(MISSION_REWARD_INR)}`
          : null,
    };

    let waypointHud: WaypointHudState | null = null;
    if (this.waypoint) {
      const dx = this.waypoint.x - this.playerX;
      const dz = this.waypoint.z - this.playerZ;
      const targetWorldYaw = Math.atan2(-dx, -dz);
      const relYaw = normalizeAngle(this.camYaw - targetWorldYaw);
      waypointHud = {
        active: true,
        x: this.waypoint.x,
        z: this.waypoint.z,
        label: this.waypoint.label,
        distanceMeters: Math.round(Math.hypot(dx, dz)),
        bearingDeg: (relYaw * 180) / Math.PI,
        routePoints: this.computeRouteToTarget(this.playerX, this.playerZ, this.waypoint.x, this.waypoint.z),
      };
    }

    const prayerAnimHud: PrayerAnimHud | null = this.prayerAnim
      ? {
          kind: this.prayerAnim.kind,
          placeName: this.prayerAnim.placeName,
          title: this.prayerAnim.title,
          subtitle: this.prayerAnim.subtitle,
          progressPct: clamp(
            ((this.prayerAnim.duration - this.prayerAnim.remaining) / this.prayerAnim.duration) * 100,
            0,
            100,
          ),
        }
      : null;

    let witnessAlertHud: WitnessAlertHud | null = null;
    if (this.activeWitness) {
      const wNpc = this.npcs.find((n) => n.id === this.activeWitness!.npcId && !n.dead);
      let screenX: number | undefined;
      let screenY: number | undefined;
      if (wNpc) {
        this._proj.set(wNpc.x, 2.35, wNpc.z).project(this.camera);
        if (this._proj.z < 1) {
          screenX = (this._proj.x * 0.5 + 0.5) * w;
          screenY = (-this._proj.y * 0.5 + 0.5) * h;
        }
      }
      witnessAlertHud = {
        npcId: this.activeWitness.npcId,
        npcName: this.activeWitness.npcName,
        reason: this.activeWitness.reason,
        remainingSec: Math.max(0.1, Number(this.activeWitness.remaining.toFixed(1))),
        totalSec: this.activeWitness.duration,
        screenX,
        screenY,
      };
    }

    const policeInspectionHud: PoliceInspectionHud | null = this.policeInspection
      ? {
          active: true,
          officerName: this.policeInspection.officerName,
          phase: this.policeInspection.phase,
          timeRemainingSec: Math.max(0, Math.ceil(this.policeInspection.timer)),
          hasGunLicense: this.hasGunLicense,
          promptText:
            this.policeInspection.phase === 'APPROACHING'
              ? 'Police officer arms license check ke liye paas aa rahe hain...'
              : '“Ruko! Apna arms license dikhao!”',
        }
      : null;

    const activeJailPhase = this.jailState ? this.getJailSchedulePhase(this.gameMinutes) : 'WORK_SHIFT';
    const activeJailMeta = this.getJailScheduleMeta(activeJailPhase);
    const rivalDistanceEntries = (this.jailRig?.inmates ?? [])
      .filter((inm) => inm.isRival)
      .map((r) => {
        const distMeters = Math.round(Math.hypot(r.x - this.playerX, r.z - this.playerZ));
        const info: JailRivalInfo = {
          id: r.id,
          name: r.name,
          hp: Math.ceil(r.hp),
          maxHp: r.maxHp,
          bribeCost: r.bribeCost,
          bribed: r.bribed,
          defeated: r.defeated,
          chasing:
            activeJailPhase !== 'NIGHT_LOCKUP' &&
            !r.bribed &&
            !r.defeated &&
            distMeters <= 9.5,
        };
        return { info, distMeters };
      });
    const jailRivalsList: JailRivalInfo[] = rivalDistanceEntries.map((entry) => entry.info);
    const nearJailRival =
      rivalDistanceEntries
        .filter((entry) => !entry.info.defeated && !entry.info.bribed && entry.distMeters <= 9)
        .sort((a, b) => a.distMeters - b.distMeters)[0]?.info ?? null;

    const jailHud: JailHudState | null = this.jailState
      ? {
          active: true,
          starsAtArrest: this.jailState.starsAtArrest,
          sentenceDaysTotal: this.jailState.sentenceDaysTotal,
          remainingDays: Number(this.jailState.remainingDays.toFixed(2)),
          remainingHoursLabel: `${Math.max(1, Math.round(this.jailState.remainingDays * 24))} hrs`,
          wardenBribeCost: this.jailState.wardenBribeCost,
          workCount: this.jailState.workCount,
          workRewardTotal: this.jailState.workCount * JAIL_WORK_WAGE_INR,
          escrowedWeaponsCount: this.jailEscrowedWeapons.length,
          activeTaskKind: this.jailState.activeTaskKind,
          activeTaskPct:
            this.jailState.activeTaskKind !== 'NONE'
              ? clamp(Math.round((this.jailState.taskTimer / Math.max(0.1, this.jailState.taskDuration)) * 100), 0, 100)
              : 0,
          spottedByGuard: this.jailState.spottedByGuard,
          nearStation: this.jailState.nearStation,
          statusBanner: this.jailState.statusBanner,
          schedulePhase: activeJailPhase,
          scheduleTitle: activeJailMeta.title,
          scheduleSub: activeJailMeta.sub,
          workShiftDoneToday: this.jailState.workShiftDoneToday,
          distractionActiveSec: Math.ceil(this.jailState.distractionTimer),
          distractionCooldownSec: Math.ceil(this.jailState.distractionCooldown),
          nearInmateDialogue: this.jailState.nearInmateDialogue,
          nearRival: nearJailRival,
          rivals: jailRivalsList,
          playerX: this.playerX,
          playerZ: this.playerZ,
          playerYaw: this.playerYaw,
          guards: (this.jailRig?.guards ?? []).map((g) => ({
            x: g.x,
            z: g.z,
            yaw: g.yaw,
            alerted: this.jailState?.spottedByGuard ?? false,
          })),
          inmates: (this.jailRig?.inmates ?? []).map((inm) => ({
            id: inm.id,
            x: inm.x,
            z: inm.z,
            name: inm.name,
            ally: inm.ally,
            rival: inm.isRival,
            defeated: inm.defeated,
            bribed: inm.bribed,
          })),
        }
      : null;

    const wantedNextHint =
      this.wantedLevel === 1
        ? `Next 2★: Police par fire / car blast / 2 civilians (${this.civilianKillsInSpree}/2)`
        : this.wantedLevel === 2
          ? `Next 3★ SWAT: ${this.policeKilledCount}/3 cops OR ${this.policeVehiclesDestroyed}/1 police car`
          : this.wantedLevel === 3
            ? `Next 4★ Chopper: ${this.swatKilledCount}/2 SWAT OR ${this.policeKilledCount}/6 cops OR ${this.policeVehiclesDestroyed}/2 vehs`
            : this.wantedLevel === 4
              ? `Next 5★ Army: ${this.commandoKilledCount}/3 Commandos OR ${this.policeKilledCount}/10 cops OR ${this.policeVehiclesDestroyed}/4 vehs`
              : this.wantedLevel >= 5
                ? '5★ MAX HEAT: Indian Army APC + Trucks + Chopper Active!'
                : null;

    this.callbacks.onHudUpdate({
      hp: Math.ceil(this.playerHp),
      maxHp: this.playerMaxHp,
      armor: Math.ceil(this.playerArmor),
      stamina: Math.round(this.playerStamina),
      maxStamina: this.playerMaxStamina,
      medkits: this.playerMedkits,
      cash: this.playerCash,
      wantedLevel: this.wantedLevel,
      wantedTierTitle: WANTED_TIER_TITLES[this.wantedLevel] ?? '',
      wantedNextHint,
      wantedCooldownPct: this.wantedLevel > 0 ? clamp(this.wantedDecayTimer / 18, 0, 1) : 0,
      hasGunLicense: this.hasGunLicense,
      hasDrivingLicense: this.hasDrivingLicense,
      hasHelmet: this.hasHelmet,
      helmetOn: this.helmetOn,
      activeWeapon: this.activeWeapon,
      ownedWeapons: Array.from(this.ownedWeapons),
      ammo: { ...this.ammo },
      inVehicle: Boolean(this.currentVehicle),
      currentVehicleKind: this.currentVehicle?.kind ?? null,
      vehicleName: this.currentVehicle?.name ?? '',
      vehicleSpeedKmh: Math.round((this.currentVehicle ? Math.abs(this.currentVehicle.speed) : 0) * 6.2),
      vehicleSteer: this.currentVehicle ? this.vehicleSteerVisual : 0,
      vehicleGear: (() => {
        const cv = this.currentVehicle;
        if (!cv) return 'N';
        if (cv.kind === 'chopper' && (cv.y ?? 0) > 0.35) return 'FLY';
        if (cv.speed < -0.4) return 'R';
        if (Math.abs(cv.speed) < 0.35) return 'N';
        const ratio = Math.abs(cv.speed) / Math.max(1, cv.maxSpeed);
        if (ratio < 0.2) return 'D1';
        if (ratio < 0.42) return 'D2';
        if (ratio < 0.65) return 'D3';
        if (ratio < 0.85) return 'D4';
        return 'D5';
      })(),
      vehicleHeadlightsOn: this.vehicleHeadlightsOn,
      vehicleFuelPct: this.currentVehicle ? Math.round(this.vehicleFuelMap.get(this.currentVehicle.id) ?? 88) : 100,
      vehicleAltitudeM: this.currentVehicle?.kind === 'chopper' ? Math.round(this.currentVehicle.y ?? 0) : 0,
      playerX: this.playerX,
      playerZ: this.playerZ,
      playerYaw: this.playerYaw,
      pointerLocked: this.pointerLocked,
      firstPerson: this.firstPerson,
      cameraMode: this.cameraMode,
      adsActive: this.adsActive && !this.currentVehicle && this.activeWeapon !== 'fists',
      targetInCrosshair: this.targetInCrosshair,
      nearPrompt,
      nearGunShop,
      nearBank,
      nearLicenseOffice,
      nearThanaDesk,
      nearRescueVan,
      nearDogAction,
      nearStall,
      nearAtm,
      nearSacredPlace,
      witnessAlert: witnessAlertHud,
      policeInspection: policeInspectionHud,
      chaiPrompt: this.activeChaiPrompt
        ? {
            npcId: this.activeChaiPrompt.npcId,
            npcName: this.activeChaiPrompt.npcName,
            line: this.activeChaiPrompt.line,
            micListening: this.activeChaiPrompt.micListening,
            micStatus: this.activeChaiPrompt.micStatus,
          }
        : null,
      micState: {
        active: this.micState.active,
        mode: this.micState.mode,
        status: this.micState.status,
        transcript: this.micState.transcript,
      },
      npcSubtitle: this.npcSubtitle ? { speaker: this.npcSubtitle.speaker, text: this.npcSubtitle.text } : null,
      policeWarning,
      wastedReason: this.wastedReason,
      bustedReason: this.bustedReason,
      bustedConfiscated: this.bustedConfiscated,
      policeNonLethalArrest: this.isPoliceNonLethalArrestMode(),
      surrenderHoldPct: this.surrenderHolding
        ? clamp(Math.round((this.surrenderHoldTimer / 0.65) * 100), 0, 100)
        : 0,
      streetBribe: this.isStreetBribeAvailable()
        ? {
            available: true,
            officerName:
              this.npcs.find(
                (n) =>
                  !n.dead &&
                  n.isPolice &&
                  !n.bribeRefused &&
                  Math.hypot(n.x - this.playerX, n.z - this.playerZ) < 16,
              )?.name ?? 'Officer',
            amount: STREET_BRIBE_INR,
          }
        : null,
      kills: this.kills,
      blips,
      damagedNpcs,
      worldLabels,
      mission: missionHud,
      timeOfDay: this.getTimeOfDayHud(),
      waypoint: waypointHud,
      blessedRemainingSec: Math.ceil(this.blessedTimer),
      blessedTotalSec: this.blessedTotalSec,
      prayerAnim: prayerAnimHud,
      bank: this.getBankHudState(),
      courtroom: this.courtroomState
        ? {
            ...this.courtroomState,
            charges: [...this.courtroomState.charges],
            confiscated: [...this.courtroomState.confiscated],
            dialogueTurns: [...this.courtroomState.dialogueTurns],
          }
        : null,
      custodyCutscene: this.custodyCutscene
        ? {
            active: true,
            phase: this.custodyCutscene.phase,
            stepIndex: this.custodyCutscene.stepIndex,
            title: this.custodyCutscene.title,
            subtitle: this.custodyCutscene.subtitle,
            stepLabel: this.custodyCutscene.stepLabel,
            progressPct: clamp(
              Math.round((this.custodyCutscene.timer / Math.max(0.1, this.custodyCutscene.duration)) * 100),
              0,
              100,
            ),
          }
        : null,
      sleepCutscene: this.sleepCutscene
        ? (() => {
            const p = clamp(this.sleepCutscene.timer / Math.max(0.1, this.sleepCutscene.duration), 0, 1);
            const phase: SleepCutsceneHud['phase'] =
              p < 0.24 ? 'LYING_DOWN' : p < 0.8 ? 'NIGHT_REST' : 'MORNING_WAKE';
            const stageLabel =
              phase === 'LYING_DOWN'
                ? 'Step 1 of 3 · Lying Down on Bed'
                : phase === 'NIGHT_REST'
                  ? 'Step 2 of 3 · Night Sweeping to Dawn'
                  : 'Step 3 of 3 · Waking Up Refreshed';
            return {
              active: true,
              location: this.sleepCutscene.location,
              phase,
              title: this.sleepCutscene.title,
              subtitle: this.sleepCutscene.subtitle,
              stageLabel,
              progressPct: Math.round(p * 100),
            };
          })()
        : null,
      probationDaysLeft: this.probationDaysLeft,
      licenseRevokedPrompt: this.licenseRevokedPrompt ? { ...this.licenseRevokedPrompt } : null,
      jail: jailHud,
      houseName: this.houseName,
      needsHouseNaming: this.houseName === null,
      homePos: { x: 30, z: 109.5 },
      nearHomeStation,
      playerOutfit: this.playerOutfit,
      wardrobe: {
        weapons: Array.from(this.wardrobeWeapons),
        armor: this.wardrobeArmor,
        medkits: this.wardrobeMedkits,
      },
    });
  }

  private isPoliceNonLethalArrestMode(): boolean {
    return (
      this.wantedLevel >= 1 &&
      this.wantedLevel <= 3 &&
      !this.playerShotAtPolice &&
      (this.wantedLevel <= 2 || this.activeWeapon === 'fists' || this.surrenderHolding)
    );
  }

  public dispose(): void {
    this.disposed = true;
    this.removePrisonerVan();
    this.releasePointerLock();
    this.stopMicRecognition();
    this.saveGameState();
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    window.removeEventListener('resize', this.handleResize);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('blur', this.handleWindowBlur);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
    document.removeEventListener('pointerlockerror', this.handlePointerLockError);
    if (this.pointerLockProbeId !== null) {
      window.clearTimeout(this.pointerLockProbeId);
      this.pointerLockProbeId = null;
    }
    this.renderer.domElement.removeEventListener('mousedown', this.handleMouseDown);
    this.renderer.domElement.removeEventListener('mouseleave', this.handleMouseLeave);
    this.renderer.domElement.removeEventListener('contextmenu', this.handleContextMenu);
    soundEngine.stopAll();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
