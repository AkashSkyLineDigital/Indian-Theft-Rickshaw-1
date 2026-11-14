export type GameMode = 'TITLE' | 'PLAYING' | 'PAUSED' | 'WASTED' | 'BUSTED' | 'CUSTODY' | 'COURTROOM' | 'JAIL';

export type WeaponId = 'fists' | 'pistol' | 'smg' | 'shotgun' | 'rifle';

export type ScopeType = 'none' | 'iron' | 'red_dot' | 'spread' | 'holo_2x';

export const STARTING_CASH_INR = 10000;
export const DEATH_FEE_INR = 5000;
export const BANK_DEBT_TRIGGER_INR = -50000;
export const BANK_BAILOUT_GRANT_INR = 10000;
export const MISSION_REWARD_INR = 100000;
export const MEDKIT_PRICE_INR = 8500;
export const MEDKIT_HEAL_AMOUNT = 75;
export const MAX_MEDKITS = 3;
export const ARMOR_PRICE_INR = 38000;
export const BRIBE_PRICE_INR = 50000;
export const STREET_BRIBE_INR = 3000;
export const COURT_BAIL_FEE_INR = 2500;
export const LAWYER_FEE_1_2_INR = 1500;
export const LAWYER_FEE_3_INR = 3000;
export const HIGH_BAIL_3_STAR_INR = 18000;
export const JAIL_WARDEN_BRIBE_LOW_INR = 15000;
export const JAIL_WARDEN_BRIBE_HIGH_INR = 30000;
export const JAIL_WORK_WAGE_INR = 2000;
export const MISSION_TIME_LIMIT_SEC = 20 * 60; // 20 minutes
export const GUN_LICENSE_FEE_INR = 25000;
export const URGENT_THANA_LICENSE_RENEWAL_INR = 35000;
export const DRIVING_LICENSE_FEE_INR = 12000;
export const HELMET_PRICE_INR = 1500;
export const NO_HELMET_FINE_INR = 500;
export const NO_DL_FINE_INR = 2000;
export const SAVINGS_ANNUAL_RATE = 0.025; // 2.5% p.a.
export const FD_ANNUAL_RATE = 0.04; // 4.0% p.a.
export const DAYS_PER_YEAR = 365;

export type VehicleKind =
  | 'sedan'
  | 'muscle'
  | 'police'
  | 'rickshaw'
  | 'bike'
  | 'swat_van'
  | 'army_truck'
  | 'armored_apc';

export const CITY_ROAD_CENTERS = [-300, -240, -180, -120, -60, 0, 60, 120, 180, 240, 300];
export const CITY_BLOCK_CENTERS = [-270, -210, -150, -90, -30, 30, 90, 150, 210, 270];
export const WORLD_LIMIT_METERS = 340;

export const CHOWK_ROUNDABOUTS: { x: number; z: number; radius: number; label: string }[] = [
  { x: 0, z: 0, radius: 2.6, label: 'Bharat Central Chowk' },
  { x: -120, z: 0, radius: 4.4, label: 'Azad Chowk' },
  { x: 120, z: 0, radius: 4.4, label: 'Subhash Chowk' },
  { x: 0, z: -120, radius: 4.4, label: 'Patel Chowk' },
  { x: 0, z: 120, radius: 4.4, label: 'Gandhi Chowk' },
  { x: -120, z: -120, radius: 4.4, label: 'Shastri Chowk' },
  { x: 120, z: -120, radius: 4.4, label: 'Kisan Chowk' },
  { x: -120, z: 120, radius: 4.4, label: 'Nehru Chowk' },
  { x: 120, z: 120, radius: 4.4, label: 'Rani Chowk' },
];

export const WANTED_TIER_TITLES: Record<number, string> = {
  0: '',
  1: '1★ Local Beat Police',
  2: '2★ Armed Police Squad',
  3: '3★ Special Task Force (SWAT)',
  4: '4★ Elite Commandos + Chopper',
  5: '5★ Full Army Deployment',
};

export function formatRs(amount: number): string {
  const rounded = Math.round(amount);
  const absStr = Math.abs(rounded).toLocaleString('en-IN');
  return rounded < 0 ? `-₹${absStr}` : `₹${absStr}`;
}

export function formatRsExact(amount: number): string {
  const fixed = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-₹${fixed}` : `₹${fixed}`;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function formatInGameDate(dayCount: number): string {
  const safeDay = Math.max(1, Math.floor(dayCount));
  const zeroDay = safeDay - 1;
  const year = Math.floor(zeroDay / 365) + 1;
  let rem = zeroDay % 365;
  let monthIdx = 0;
  while (monthIdx < 11 && rem >= MONTH_DAYS[monthIdx]) {
    rem -= MONTH_DAYS[monthIdx];
    monthIdx++;
  }
  const dayOfMonth = rem + 1;
  return `${dayOfMonth} ${MONTH_NAMES[monthIdx]}, Yr ${year}`;
}

export interface WeaponSpec {
  id: WeaponId;
  name: string;
  shortName: string;
  caliber: string;
  damage: number;
  fireRateMs: number;
  range: number;
  spread: number;
  pellets: number;
  price: number;
  ammoPrice: number;
  ammoPackSize: number;
  maxAmmo: number;
  knockback: number;
  scopeType: ScopeType;
  scopeLabel: string;
  scopeFov: number;
  description: string;
}

export const WEAPONS: Record<WeaponId, WeaponSpec> = {
  fists: {
    id: 'fists',
    name: 'Bare Fists',
    shortName: 'Fists',
    caliber: 'MELEE',
    damage: 26,
    fireRateMs: 420,
    range: 2.3,
    spread: 0,
    pellets: 1,
    price: 0,
    ammoPrice: 0,
    ammoPackSize: 0,
    maxAmmo: 0,
    knockback: 3.4,
    scopeType: 'none',
    scopeLabel: 'No Optic',
    scopeFov: 62,
    description: 'Close-quarters street brawling. Takes 3–4 solid hits to down a target.',
  },
  pistol: {
    id: 'pistol',
    name: '9mm Service Pistol',
    shortName: '9mm Pistol',
    caliber: '9×19mm',
    damage: 34,
    fireRateMs: 310,
    range: 56,
    spread: 0.022,
    pellets: 1,
    price: 105000,
    ammoPrice: 13500,
    ammoPackSize: 24,
    maxAmmo: 144,
    knockback: 3.2,
    scopeType: 'iron',
    scopeLabel: 'Glow Iron Sight (1.25×)',
    scopeFov: 48,
    description: 'Standard-issue steel-frame sidearm with luminous iron sights for crisp aiming.',
  },
  smg: {
    id: 'smg',
    name: 'MP-9 Tactical SMG',
    shortName: 'MP-9 SMG',
    caliber: '9×19mm +P',
    damage: 21,
    fireRateMs: 105,
    range: 48,
    spread: 0.048,
    pellets: 1,
    price: 320000,
    ammoPrice: 27000,
    ammoPackSize: 60,
    maxAmmo: 360,
    knockback: 2.2,
    scopeType: 'red_dot',
    scopeLabel: 'Reflex Red-Dot (1.45×)',
    scopeFov: 42,
    description: 'Compact submachine gun equipped with a fast Reflex Red-Dot sight.',
  },
  shotgun: {
    id: 'shotgun',
    name: 'M870 Combat Shotgun',
    shortName: 'M870 Pump',
    caliber: '12 Gauge',
    damage: 18,
    fireRateMs: 780,
    range: 28,
    spread: 0.12,
    pellets: 6,
    price: 540000,
    ammoPrice: 38000,
    ammoPackSize: 16,
    maxAmmo: 96,
    knockback: 5.5,
    scopeType: 'spread',
    scopeLabel: 'Ghost-Ring Spread (1.2×)',
    scopeFov: 52,
    description: 'Heavy parkerized 12-gauge pump action with ghost-ring buckshot reticle.',
  },
  rifle: {
    id: 'rifle',
    name: 'MK-18 Tactical Carbine',
    shortName: 'MK-18 Rifle',
    caliber: '5.56 NATO',
    damage: 38,
    fireRateMs: 140,
    range: 92,
    spread: 0.016,
    pellets: 1,
    price: 1050000,
    ammoPrice: 64000,
    ammoPackSize: 60,
    maxAmmo: 360,
    knockback: 3.8,
    scopeType: 'holo_2x',
    scopeLabel: '2.2× Marksman Scope',
    scopeFov: 28,
    description: 'Forged receiver carbine with magnified 2.2× Marksman optic for long-range precision.',
  },
};

export const WEAPON_ORDER: WeaponId[] = ['fists', 'pistol', 'smg', 'shotgun', 'rifle'];

export type StreetStallKind = 'chai' | 'golgappa' | 'chaat';

export interface StreetStallMenuItem {
  id: string;
  name: string;
  hindiName: string;
  price: number;
  hpGain: number;
  restoreStamina: boolean;
  description: string;
}

export const STREET_STALL_MENUS: Record<StreetStallKind, StreetStallMenuItem[]> = {
  chai: [
    {
      id: 'masala-chai',
      name: 'Kadak Masala Chai',
      hindiName: 'कड़क मसाला चाय',
      price: 20,
      hpGain: 20,
      restoreStamina: true,
      description: 'Hot kulhad tea with cardamom & cloves. Restores +20 HP and full Stamina.',
    },
    {
      id: 'adrak-chai',
      name: 'Special Adrak Chai',
      hindiName: 'अदरक इलायची चाय',
      price: 30,
      hpGain: 30,
      restoreStamina: true,
      description: 'Fresh ginger-infused chai for instant energy (+30 HP & full Stamina).',
    },
    {
      id: 'bun-maska',
      name: 'Bun Maska + Chai Combo',
      hindiName: 'बन मस्का और चाय',
      price: 60,
      hpGain: 45,
      restoreStamina: true,
      description: 'Buttered toasted bun with hot kulhad chai (+45 HP & full Stamina).',
    },
  ],
  golgappa: [
    {
      id: 'teekha-golgappa',
      name: 'Teekha Golgappa (6 pcs)',
      hindiName: 'तीखा गोलगप्पा',
      price: 30,
      hpGain: 25,
      restoreStamina: true,
      description: 'Crispy puris with spicy pudina jaljeera (+25 HP & full Stamina).',
    },
    {
      id: 'meetha-pani-puri',
      name: 'Meetha-Teekha Pani Puri',
      hindiName: 'खट्टा-मीठा पानी पूरी',
      price: 40,
      hpGain: 35,
      restoreStamina: true,
      description: 'Tamarind chutney & mint-spiced potato puris (+35 HP & full Stamina).',
    },
    {
      id: 'dahi-puri',
      name: 'Special Dahi Papdi Chaat',
      hindiName: 'दही पापड़ी चाट',
      price: 60,
      hpGain: 50,
      restoreStamina: true,
      description: 'Chilled curd, sev & pomegranate chaat platter (+50 HP & full Stamina).',
    },
  ],
  chaat: [
    {
      id: 'garam-samosa',
      name: '2 Garam Samosa',
      hindiName: 'गरम समोसा',
      price: 25,
      hpGain: 22,
      restoreStamina: true,
      description: 'Golden crispy potato samosas with green chutney (+22 HP & full Stamina).',
    },
    {
      id: 'aloo-tikki',
      name: 'Desi Ghee Aloo Tikki',
      hindiName: 'आलू टिक्की चाट',
      price: 50,
      hpGain: 42,
      restoreStamina: true,
      description: 'Crisp spiced tikki topped with chole & dahi (+42 HP & full Stamina).',
    },
    {
      id: 'malai-lassi',
      name: 'Kulhad Malai Lassi',
      hindiName: 'मलाई लस्सी',
      price: 45,
      hpGain: 38,
      restoreStamina: true,
      description: 'Thick chilled sweet lassi in clay kulhad (+38 HP & full Stamina).',
    },
  ],
};

export interface StreetStallHudInfo {
  id: string;
  name: string;
  kind: StreetStallKind;
  vendorName: string;
}

export interface GameSettings {
  masterVolume: number; // 0..1
  sfxVolume: number; // 0..1
  npcVoiceEnabled: boolean; // Street NPCs, Enforcers, Armory Dealer
  policeVoiceEnabled: boolean; // Police Officers
  gameVoiceEnabled: boolean; // Bank Clerk, Mission Narrator, System Voice
  retroVoiceBlips: boolean;
  mouseSensitivity: number; // 0.3..2.0
  shadowsEnabled: boolean;
  showControlsStrip: boolean;
  touchControls: 'auto' | 'on' | 'off';
}

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.75,
  sfxVolume: 0.85,
  npcVoiceEnabled: true,
  policeVoiceEnabled: true,
  gameVoiceEnabled: true,
  retroVoiceBlips: true,
  mouseSensitivity: 1.0,
  shadowsEnabled: true,
  showControlsStrip: true,
  touchControls: 'auto',
};

export interface PassbookEntry {
  id: number;
  day: number;
  timeLabel: string;
  account: 'SAVINGS' | 'FD' | 'ATM';
  kind: 'DEPOSIT' | 'WITHDRAW' | 'INTEREST' | 'MISSION';
  amount: number;
  balanceAfter: number;
  note: string;
}

export interface BankAccountHudState {
  savingsPrincipal: number;
  savingsInterest: number;
  savingsTotal: number;
  savingsDailyRate: number;
  fdPrincipal: number;
  fdInterest: number;
  fdTotal: number;
  fdDailyRate: number;
  fdOpenedDay: number | null;
  totalInterestEarned: number;
  calendarDate: string;
  passbook: PassbookEntry[];
}

export interface AtmLandmarkHud {
  id: string;
  name: string;
}

export interface SavedGameState {
  currencyVersion?: number;
  cash: number;
  kills: number;
  hp: number;
  armor: number;
  medkits: number;
  ownedWeapons: WeaponId[];
  activeWeapon: WeaponId;
  ammo: Record<WeaponId, number>;
  playerX: number;
  playerZ: number;
  playerYaw: number;
  dogsRescuedUnlocked?: boolean;
  hasGunLicense?: boolean;
  hasDrivingLicense?: boolean;
  hasHelmet?: boolean;
  helmetOn?: boolean;
  gameMinutes?: number;
  dayCount?: number;
  bank?: {
    savingsPrincipal: number;
    savingsInterest: number;
    fdPrincipal: number;
    fdInterest: number;
    fdOpenedDay: number | null;
    totalInterestEarned: number;
    lastCompoundDay: number;
    passbook: PassbookEntry[];
  };
}

export interface MinimapBlip {
  x: number;
  z: number;
  type:
    | 'npc'
    | 'enforcer'
    | 'police_car'
    | 'police_officer'
    | 'traffic_cop'
    | 'traffic_light'
    | 'vehicle'
    | 'pickup'
    | 'gunshop'
    | 'hospital'
    | 'bank'
    | 'atm'
    | 'dm_office'
    | 'court'
    | 'jail'
    | 'chai'
    | 'golgappa'
    | 'temple'
    | 'mosque'
    | 'mission_enemy'
    | 'rescue_van'
    | 'chopper'
    | 'army'
    | 'dog';
  yaw?: number;
  signalState?: 'GREEN' | 'YELLOW' | 'RED';
}

export interface DamagedNpcHud {
  id: number;
  name: string;
  hp: number;
  maxHp: number;
  screenX: number;
  screenY: number;
  isPolice: boolean;
}

export interface WorldLabelHud {
  id: string;
  title: string;
  subtitle: string;
  screenX: number;
  screenY: number;
  weaponId?: WeaponId;
  isDealer?: boolean;
  isBanker?: boolean;
  isLicenseOfficer?: boolean;
  jailStation?: 'BUNK' | 'WORKSHOP' | 'WARDEN' | 'ESCAPE_GATE';
}

export interface WitnessAlertHud {
  npcId: number;
  npcName: string;
  remainingSec: number;
  totalSec: number;
  reason: 'brandishing' | 'gunfire' | 'assault' | 'murder' | 'vehicle_theft';
  screenX?: number;
  screenY?: number;
}

export interface PoliceInspectionHud {
  active: boolean;
  officerName: string;
  phase: 'APPROACHING' | 'ASKING';
  timeRemainingSec: number;
  hasGunLicense: boolean;
  promptText: string;
}

export interface FloatingToast {
  id: number;
  text: string;
  tone: 'cash' | 'warn' | 'info' | 'cheat';
}

export type MissionPhase = 'NONE' | 'ELIMINATE_MAFIA' | 'OPEN_VAN' | 'CUTSCENE';

export interface MissionHudState {
  active: boolean;
  phase: MissionPhase;
  timeRemainingSec: number;
  enemiesRemaining: number;
  enemiesTotal: number;
  targetX: number;
  targetZ: number;
  distanceMeters: number;
  routePoints: { x: number; z: number }[];
  objectiveText: string;
  cutsceneBanner: string | null;
}

export interface ChaiDialoguePrompt {
  npcId: number;
  npcName: string;
  line: string;
  micListening: boolean;
  micStatus: string | null;
}

export interface MicHudState {
  active: boolean;
  mode: 'chai' | 'command' | null;
  status: string | null;
  transcript: string | null;
}

export type TimePhase = 'MORNING' | 'NOON' | 'EVENING' | 'MIDNIGHT';

export interface TimeOfDayHud {
  minutesOfDay: number;
  formattedTime: string;
  phaseLabel: TimePhase;
  dayCount: number;
}

export interface WaypointHudState {
  active: boolean;
  x: number;
  z: number;
  label: string;
  distanceMeters: number;
  bearingDeg: number;
  routePoints: { x: number; z: number }[];
}

export interface PrayerAnimHud {
  kind: 'ram_mandir' | 'krishna_mandir' | 'mosque';
  placeName: string;
  title: string;
  subtitle: string;
  progressPct: number;
}

export interface CityLocationPreset {
  id: string;
  label: string;
  category: 'sacred' | 'service' | 'food';
  x: number;
  z: number;
  badge: string;
}

export const CITY_LOCATIONS: CityLocationPreset[] = [
  { id: 'central-chowk', label: 'Bharat Central Chowk', category: 'service', x: 0, z: 12, badge: 'C' },
  { id: 'ram-mandir', label: 'Shree Ram Mandir', category: 'sacred', x: 19, z: 30, badge: 'ॐ' },
  { id: 'krishna-mandir', label: 'Shree Krishna Mandir', category: 'sacred', x: 90, z: -18, badge: 'ॐ' },
  { id: 'noor-masjid', label: 'Noor Masjid', category: 'sacred', x: -90, z: -18, badge: '☪' },
  { id: 'royal-bank', label: 'Royal Bank Of India', category: 'service', x: -30, z: -74, badge: 'B' },
  { id: 'dm-office', label: 'DM Office (Arms & Driving License)', category: 'service', x: -90, z: 46, badge: 'L' },
  { id: 'district-court', label: 'District & Sessions Court', category: 'service', x: -90, z: 108, badge: '⚖' },
  { id: 'central-jail', label: 'Bharat Police Thana & Central Jail', category: 'service', x: -150, z: 176, badge: 'T' },
  { id: 'pankaj-armory', label: 'Pankaj Ammunation', category: 'service', x: 30, z: -14, badge: 'G' },
  { id: 'hospital', label: 'City Hospital', category: 'service', x: -30, z: 14, badge: '+' },
  { id: 'auto-stand', label: 'Chai Chowk Auto Stand', category: 'service', x: 7.5, z: 14, badge: 'A' },
  { id: 'chai-chowk', label: 'Sharma Chai Tapri', category: 'food', x: 10.2, z: 13.5, badge: 'C' },
  { id: 'golgappa-chowk', label: 'Gupta Golgappa Bhandar', category: 'food', x: -10.2, z: 14.5, badge: 'P' },
  { id: 'laxmi-medical', label: 'Laxmi Medical & Kirana Bazaar', category: 'service', x: 90, z: 46, badge: 'K' },
  { id: 'ganga-dhaba', label: 'Ganga Highway Dhaba', category: 'food', x: -120, z: 14, badge: 'D' },
  { id: 'azad-nagar', label: 'Azad Nagar Colony', category: 'service', x: -210, z: 16, badge: 'R' },
  { id: 'shanti-vihar', label: 'Shanti Vihar Colony', category: 'service', x: 210, z: -16, badge: 'R' },
];

export type CourtroomVerdictKind = 'BAILABLE' | 'HIGH_BAIL' | 'NO_BAIL';

export interface CourtroomDialogueTurn {
  speakerRole: 'judge' | 'inspector' | 'lawyer';
  speakerName: string;
  title: string;
  text: string;
  tts: string;
}

export interface CourtroomState {
  starsAtArrest: number;
  arrestReason: string;
  charges: string[];
  confiscated: string[];
  verdictKind: CourtroomVerdictKind;
  verdictHeadline: string;
  bailAmount: number;
  lawyerFee: number;
  totalDue: number;
  jailDays: number;
  dialogueIndex: number;
  dialogueTurns: CourtroomDialogueTurn[];
  argumentsFinished: boolean;
}

export type CustodyPhase =
  | 'THANA_LOCKUP'
  | 'VAN_TO_COURT'
  | 'VAN_TO_THANA_RELEASE'
  | 'VAN_TO_JAIL';

export interface CustodyCutsceneHud {
  active: boolean;
  phase: CustodyPhase;
  stepIndex: number;
  title: string;
  subtitle: string;
  stepLabel: string;
  progressPct: number;
}

export interface LicenseRevokedPromptHud {
  active: boolean;
  starsAtArrest: number;
  urgentFee: number;
  standardFee: number;
}

export interface JailGuardBlip {
  x: number;
  z: number;
  yaw: number;
  alerted: boolean;
}

export interface JailHudState {
  active: boolean;
  starsAtArrest: number;
  sentenceDaysTotal: number;
  remainingDays: number;
  remainingHoursLabel: string;
  wardenBribeCost: number;
  workCount: number;
  workRewardTotal: number;
  escrowedWeaponsCount: number;
  activeTaskKind: 'NONE' | 'WORK' | 'ESCAPE';
  activeTaskPct: number;
  spottedByGuard: boolean;
  nearStation: 'BUNK' | 'WORKSHOP' | 'WARDEN' | 'ESCAPE_GATE' | null;
  statusBanner: string | null;
  playerX: number;
  playerZ: number;
  playerYaw: number;
  guards: JailGuardBlip[];
}

export interface HudSnapshot {
  hp: number;
  maxHp: number;
  armor: number;
  stamina: number;
  maxStamina: number;
  medkits: number;
  cash: number;
  hasGunLicense: boolean;
  hasDrivingLicense: boolean;
  hasHelmet: boolean;
  helmetOn: boolean;
  wantedLevel: number;
  wantedTierTitle: string;
  wantedNextHint: string | null;
  wantedCooldownPct: number;
  activeWeapon: WeaponId;
  ownedWeapons: WeaponId[];
  ammo: Record<WeaponId, number>;
  inVehicle: boolean;
  currentVehicleKind: VehicleKind | null;
  vehicleName: string;
  vehicleSpeedKmh: number;
  playerX: number;
  playerZ: number;
  playerYaw: number;
  pointerLocked: boolean;
  firstPerson: boolean;
  adsActive: boolean;
  targetInCrosshair: boolean;
  nearPrompt: string | null;
  nearGunShop: boolean;
  nearBank: boolean;
  nearLicenseOffice: boolean;
  nearThanaDesk: boolean;
  nearRescueVan: boolean;
  nearStall: StreetStallHudInfo | null;
  nearAtm: AtmLandmarkHud | null;
  nearSacredPlace: { name: string; kind: 'ram_mandir' | 'krishna_mandir' | 'mosque' } | null;
  nearDogAction: 'pet' | 'sit' | 'follow' | null;
  chaiPrompt: ChaiDialoguePrompt | null;
  witnessAlert: WitnessAlertHud | null;
  policeInspection: PoliceInspectionHud | null;
  micState: MicHudState;
  npcSubtitle: { speaker: string; text: string } | null;
  policeWarning: string | null;
  wastedReason: string;
  bustedReason: string;
  bustedConfiscated: string[];
  policeNonLethalArrest: boolean;
  surrenderHoldPct: number;
  streetBribe: { available: boolean; officerName: string; amount: number } | null;
  kills: number;
  blips: MinimapBlip[];
  damagedNpcs: DamagedNpcHud[];
  worldLabels: WorldLabelHud[];
  mission: MissionHudState;
  timeOfDay: TimeOfDayHud;
  waypoint: WaypointHudState | null;
  blessedRemainingSec: number;
  blessedTotalSec: number;
  prayerAnim: PrayerAnimHud | null;
  bank: BankAccountHudState;
  courtroom: CourtroomState | null;
  custodyCutscene: CustodyCutsceneHud | null;
  licenseRevokedPrompt: LicenseRevokedPromptHud | null;
  jail: JailHudState | null;
}
