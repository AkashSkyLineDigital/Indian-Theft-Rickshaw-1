export type GameMode = 'TITLE' | 'PLAYING' | 'PAUSED' | 'WASTED' | 'BUSTED' | 'CUSTODY' | 'COURTROOM' | 'JAIL' | 'SLEEP';

export type WeaponId = 'fists' | 'pistol' | 'smg' | 'shotgun' | 'rifle';

export type PlayerOutfitId = 'default' | 'kurta' | 'jacket';

export const PLAYER_OUTFITS: Record<
  PlayerOutfitId,
  { id: PlayerOutfitId; label: string; subtitle: string; shirtHex: number; pantsHex: number; swatch: string }
> = {
  default: {
    id: 'default',
    label: 'Olive Tactical',
    subtitle: 'Signature street cargo jacket & dark denim',
    shirtHex: 0x2f4f3e,
    pantsHex: 0x1e293b,
    swatch: '#2f4f3e',
  },
  kurta: {
    id: 'kurta',
    label: 'Festive Kurta-Pajama',
    subtitle: 'Traditional cream-saffron cotton kurta & churidar',
    shirtHex: 0xfef3c7,
    pantsHex: 0xf8fafc,
    swatch: '#f59e0b',
  },
  jacket: {
    id: 'jacket',
    label: 'Crimson Street Jacket',
    subtitle: 'Bold maroon bomber jacket & charcoal trousers',
    shirtHex: 0x7f1d1d,
    pantsHex: 0x111827,
    swatch: '#b91c1c',
  },
};

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
  | 'armored_apc'
  | 'chopper';

export type CameraViewMode = 'third_far' | 'third_close' | 'first_person';
export type DensityLevel = 'low' | 'medium' | 'high' | 'ultra';

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

// Authentic Indian Saka National Calendar starting on 18 Kartik, 2026 (Day 1)
const INDIAN_MONTHS: { name: string; days: number }[] = [
  { name: 'Kartik', days: 30 },
  { name: 'Margashirsha', days: 30 },
  { name: 'Pausha', days: 30 },
  { name: 'Magha', days: 30 },
  { name: 'Phalguna', days: 30 },
  { name: 'Chaitra', days: 30 },
  { name: 'Vaishakha', days: 31 },
  { name: 'Jyeshtha', days: 31 },
  { name: 'Ashadha', days: 31 },
  { name: 'Shravana', days: 31 },
  { name: 'Bhadrapada', days: 31 },
  { name: 'Ashwin', days: 30 },
];

export function formatInGameDate(dayCount: number): string {
  const safeDay = Math.max(1, Math.floor(dayCount));
  let rem = safeDay - 1 + 17; // Day 1 => 18 Kartik, 2026
  let year = 2026;
  let mIdx = 0;
  while (rem >= INDIAN_MONTHS[mIdx].days) {
    rem -= INDIAN_MONTHS[mIdx].days;
    mIdx = (mIdx + 1) % INDIAN_MONTHS.length;
    if (mIdx === 5) {
      // Chaitra marks the Indian New Year rollover
      year += 1;
    }
  }
  const dayOfMonth = rem + 1;
  return `${dayOfMonth} ${INDIAN_MONTHS[mIdx].name}, ${year}`;
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

export type HudControlId =
  | 'move'
  | 'fire'
  | 'jump'
  | 'sprint'
  | 'vehicle'
  | 'ads'
  | 'fpv'
  | 'wheel'
  | 'medkit'
  | 'interact'
  | 'helmet'
  | 'map'
  | 'phone'
  | 'radio'
  | 'mic'
  | 'settings'
  | 'gas'
  | 'brake'
  | 'steer'
  | 'horn'
  | 'bribe';

export type HudWorkingMode = 'fixed' | 'floating' | 'tap' | 'hold' | 'drag_aim' | 'toggle';

export type HudLayoutPresetId = 'classic' | 'two_thumb' | 'claw_4f' | 'custom';

export interface HudElementConfig {
  id: HudControlId;
  xPct: number; // 4..96 viewport width %
  yPct: number; // 6..94 viewport height %
  scale: number; // 0.60..1.65
  opacity: number; // 0.25..1.00
  visible: boolean;
  mode?: HudWorkingMode;
}

export interface CustomHudConfig {
  preset: HudLayoutPresetId;
  elements: Record<HudControlId, HudElementConfig>;
}

export interface HudControlMeta {
  id: HudControlId;
  label: string;
  shortLabel: string;
  context: 'foot' | 'drive' | 'both';
  lockVisible?: boolean;
  modes?: { id: HudWorkingMode; label: string; hint: string }[];
}

export const HUD_CONTROL_META: Record<HudControlId, HudControlMeta> = {
  move: {
    id: 'move',
    label: 'Move Stick / D-Pad',
    shortLabel: 'MOVE',
    context: 'foot',
    modes: [
      { id: 'fixed', label: 'Fixed Center', hint: 'Pad stays anchored at its position' },
      { id: 'floating', label: 'Floating Thumb', hint: 'Stick centers where your thumb touches' },
    ],
  },
  fire: {
    id: 'fire',
    label: 'Fire / Punch',
    shortLabel: 'FIRE',
    context: 'foot',
    modes: [
      { id: 'drag_aim', label: 'Drag-Aim + Auto', hint: 'Hold to auto-fire & drag finger to aim' },
      { id: 'hold', label: 'Hold Auto-Fire', hint: 'Hold button for continuous SMG/Rifle fire' },
      { id: 'tap', label: 'Single Tap', hint: 'One shot or punch per tap' },
    ],
  },
  jump: {
    id: 'jump',
    label: 'Jump',
    shortLabel: 'JUMP',
    context: 'foot',
  },
  sprint: {
    id: 'sprint',
    label: 'Sprint (Run)',
    shortLabel: 'RUN',
    context: 'foot',
    modes: [
      { id: 'toggle', label: 'Tap Toggle', hint: 'Tap once to toggle sprint ON/OFF' },
      { id: 'hold', label: 'Hold to Run', hint: 'Sprint only while holding button' },
    ],
  },
  ads: {
    id: 'ads',
    label: 'Scope / Aim (ADS)',
    shortLabel: 'AIM',
    context: 'foot',
    modes: [
      { id: 'tap', label: 'Tap Toggle', hint: 'Tap to zoom scope in/out' },
      { id: 'hold', label: 'Hold to Scope', hint: 'Scoped only while holding button' },
    ],
  },
  fpv: {
    id: 'fpv',
    label: 'First-Person View (FPV)',
    shortLabel: 'FPV',
    context: 'foot',
  },
  wheel: {
    id: 'wheel',
    label: 'Weapon Wheel',
    shortLabel: 'GUNS',
    context: 'foot',
  },
  vehicle: {
    id: 'vehicle',
    label: 'Enter / Exit Vehicle',
    shortLabel: 'CAR',
    context: 'both',
  },
  interact: {
    id: 'interact',
    label: 'Context Action (Shop/Bank/Talk)',
    shortLabel: 'ACTION',
    context: 'both',
  },
  medkit: {
    id: 'medkit',
    label: 'Use Medkit',
    shortLabel: 'HEAL',
    context: 'both',
  },
  helmet: {
    id: 'helmet',
    label: 'Toggle ISI Helmet',
    shortLabel: 'HELM',
    context: 'both',
  },
  map: {
    id: 'map',
    label: 'City Map',
    shortLabel: 'MAP',
    context: 'both',
  },
  phone: {
    id: 'phone',
    label: 'ITR OS Smartphone',
    shortLabel: 'PHONE',
    context: 'both',
  },
  radio: {
    id: 'radio',
    label: 'Police Radio',
    shortLabel: 'RADIO',
    context: 'both',
  },
  mic: {
    id: 'mic',
    label: 'Voice Mic (Online)',
    shortLabel: 'MIC',
    context: 'both',
  },
  settings: {
    id: 'settings',
    label: 'Pause / Settings',
    shortLabel: 'SET',
    context: 'both',
    lockVisible: true,
  },
  steer: {
    id: 'steer',
    label: 'Driving Steer (Left/Right)',
    shortLabel: 'STEER',
    context: 'drive',
  },
  gas: {
    id: 'gas',
    label: 'Driving Gas Pedal',
    shortLabel: 'GAS',
    context: 'drive',
    modes: [
      { id: 'hold', label: 'Hold Pedal', hint: 'Accelerate while pressing GAS' },
      { id: 'toggle', label: 'Cruise Toggle', hint: 'Tap GAS to toggle auto-throttle' },
    ],
  },
  brake: {
    id: 'brake',
    label: 'Driving Brake / Reverse',
    shortLabel: 'BRAKE',
    context: 'drive',
  },
  horn: {
    id: 'horn',
    label: 'Vehicle Horn',
    shortLabel: 'HORN',
    context: 'drive',
  },
  bribe: {
    id: 'bribe',
    label: 'Bribe / Surrender Alert',
    shortLabel: 'POLICE',
    context: 'both',
  },
};

export function createHudPresetElements(
  preset: Exclude<HudLayoutPresetId, 'custom'>,
): Record<HudControlId, HudElementConfig> {
  if (preset === 'two_thumb') {
    return {
      move: { id: 'move', xPct: 14, yPct: 58, scale: 1.12, opacity: 0.92, visible: true, mode: 'floating' },
      fire: { id: 'fire', xPct: 86, yPct: 72, scale: 1.22, opacity: 0.95, visible: true, mode: 'drag_aim' },
      jump: { id: 'jump', xPct: 72, yPct: 84, scale: 1.05, opacity: 0.9, visible: true },
      sprint: { id: 'sprint', xPct: 73, yPct: 60, scale: 1.0, opacity: 0.9, visible: true, mode: 'toggle' },
      ads: { id: 'ads', xPct: 88, yPct: 48, scale: 1.05, opacity: 0.92, visible: true, mode: 'tap' },
      fpv: { id: 'fpv', xPct: 63, yPct: 48, scale: 0.92, opacity: 0.85, visible: true },
      wheel: { id: 'wheel', xPct: 75, yPct: 42, scale: 0.98, opacity: 0.9, visible: true },
      vehicle: { id: 'vehicle', xPct: 90, yPct: 33, scale: 1.0, opacity: 0.92, visible: true },
      interact: { id: 'interact', xPct: 50, yPct: 74, scale: 1.05, opacity: 0.96, visible: true },
      medkit: { id: 'medkit', xPct: 62, yPct: 74, scale: 0.95, opacity: 0.92, visible: true },
      helmet: { id: 'helmet', xPct: 55, yPct: 60, scale: 0.9, opacity: 0.88, visible: true },
      map: { id: 'map', xPct: 42, yPct: 11, scale: 0.92, opacity: 0.88, visible: true },
      phone: { id: 'phone', xPct: 52, yPct: 11, scale: 0.95, opacity: 0.92, visible: true },
      radio: { id: 'radio', xPct: 32, yPct: 11, scale: 0.88, opacity: 0.85, visible: true },
      mic: { id: 'mic', xPct: 23, yPct: 11, scale: 0.88, opacity: 0.85, visible: true },
      settings: { id: 'settings', xPct: 62, yPct: 11, scale: 0.92, opacity: 0.9, visible: true },
      steer: { id: 'steer', xPct: 15, yPct: 58, scale: 1.08, opacity: 0.92, visible: true },
      gas: { id: 'gas', xPct: 89, yPct: 74, scale: 1.12, opacity: 0.95, visible: true, mode: 'hold' },
      brake: { id: 'brake', xPct: 75, yPct: 80, scale: 1.05, opacity: 0.92, visible: true },
      horn: { id: 'horn', xPct: 75, yPct: 58, scale: 0.95, opacity: 0.9, visible: true },
      bribe: { id: 'bribe', xPct: 50, yPct: 86, scale: 0.96, opacity: 0.95, visible: true },
    };
  }

  if (preset === 'claw_4f') {
    return {
      move: { id: 'move', xPct: 14, yPct: 58, scale: 1.05, opacity: 0.88, visible: true, mode: 'fixed' },
      fire: { id: 'fire', xPct: 15, yPct: 28, scale: 1.18, opacity: 0.95, visible: true, mode: 'drag_aim' },
      ads: { id: 'ads', xPct: 84, yPct: 36, scale: 1.12, opacity: 0.95, visible: true, mode: 'hold' },
      jump: { id: 'jump', xPct: 88, yPct: 58, scale: 1.08, opacity: 0.92, visible: true },
      sprint: { id: 'sprint', xPct: 75, yPct: 78, scale: 1.0, opacity: 0.9, visible: true, mode: 'toggle' },
      fpv: { id: 'fpv', xPct: 66, yPct: 52, scale: 0.92, opacity: 0.85, visible: true },
      wheel: { id: 'wheel', xPct: 74, yPct: 52, scale: 0.96, opacity: 0.9, visible: true },
      vehicle: { id: 'vehicle', xPct: 88, yPct: 78, scale: 1.02, opacity: 0.92, visible: true },
      interact: { id: 'interact', xPct: 50, yPct: 73, scale: 1.04, opacity: 0.96, visible: true },
      medkit: { id: 'medkit', xPct: 62, yPct: 78, scale: 0.95, opacity: 0.92, visible: true },
      helmet: { id: 'helmet', xPct: 54, yPct: 58, scale: 0.9, opacity: 0.85, visible: true },
      map: { id: 'map', xPct: 42, yPct: 11, scale: 0.9, opacity: 0.88, visible: true },
      phone: { id: 'phone', xPct: 52, yPct: 11, scale: 0.92, opacity: 0.92, visible: true },
      radio: { id: 'radio', xPct: 32, yPct: 11, scale: 0.88, opacity: 0.85, visible: true },
      mic: { id: 'mic', xPct: 23, yPct: 11, scale: 0.88, opacity: 0.85, visible: true },
      settings: { id: 'settings', xPct: 62, yPct: 11, scale: 0.9, opacity: 0.9, visible: true },
      steer: { id: 'steer', xPct: 15, yPct: 58, scale: 1.05, opacity: 0.92, visible: true },
      gas: { id: 'gas', xPct: 89, yPct: 74, scale: 1.08, opacity: 0.95, visible: true, mode: 'hold' },
      brake: { id: 'brake', xPct: 75, yPct: 80, scale: 1.0, opacity: 0.92, visible: true },
      horn: { id: 'horn', xPct: 76, yPct: 58, scale: 0.92, opacity: 0.9, visible: true },
      bribe: { id: 'bribe', xPct: 50, yPct: 86, scale: 0.95, opacity: 0.95, visible: true },
    };
  }

  // 'classic' default preset — clean non-overlapping thumb layout
  return {
    move: { id: 'move', xPct: 14, yPct: 56, scale: 1.0, opacity: 0.9, visible: true, mode: 'fixed' },
    fire: { id: 'fire', xPct: 88, yPct: 75, scale: 1.12, opacity: 0.95, visible: true, mode: 'drag_aim' },
    jump: { id: 'jump', xPct: 75, yPct: 82, scale: 1.0, opacity: 0.9, visible: true },
    sprint: { id: 'sprint', xPct: 75, yPct: 61, scale: 0.96, opacity: 0.9, visible: true, mode: 'hold' },
    vehicle: { id: 'vehicle', xPct: 89, yPct: 52, scale: 0.98, opacity: 0.92, visible: true },
    ads: { id: 'ads', xPct: 63, yPct: 74, scale: 0.96, opacity: 0.9, visible: true, mode: 'tap' },
    fpv: { id: 'fpv', xPct: 63, yPct: 54, scale: 0.9, opacity: 0.85, visible: true },
    wheel: { id: 'wheel', xPct: 89, yPct: 35, scale: 0.92, opacity: 0.9, visible: true },
    medkit: { id: 'medkit', xPct: 51, yPct: 78, scale: 0.92, opacity: 0.92, visible: true },
    interact: { id: 'interact', xPct: 50, yPct: 66, scale: 1.0, opacity: 0.96, visible: true },
    helmet: { id: 'helmet', xPct: 52, yPct: 54, scale: 0.88, opacity: 0.88, visible: true },
    map: { id: 'map', xPct: 43, yPct: 11, scale: 0.9, opacity: 0.88, visible: true },
    phone: { id: 'phone', xPct: 52, yPct: 11, scale: 0.92, opacity: 0.92, visible: true },
    radio: { id: 'radio', xPct: 34, yPct: 11, scale: 0.88, opacity: 0.85, visible: true },
    mic: { id: 'mic', xPct: 25, yPct: 11, scale: 0.88, opacity: 0.85, visible: true },
    settings: { id: 'settings', xPct: 61, yPct: 11, scale: 0.9, opacity: 0.9, visible: true },
    steer: { id: 'steer', xPct: 15, yPct: 56, scale: 1.0, opacity: 0.92, visible: true },
    gas: { id: 'gas', xPct: 89, yPct: 74, scale: 1.05, opacity: 0.95, visible: true, mode: 'hold' },
    brake: { id: 'brake', xPct: 75, yPct: 80, scale: 1.0, opacity: 0.92, visible: true },
    horn: { id: 'horn', xPct: 76, yPct: 58, scale: 0.92, opacity: 0.9, visible: true },
    bribe: { id: 'bribe', xPct: 50, yPct: 86, scale: 0.94, opacity: 0.95, visible: true },
  };
}

export const DEFAULT_CUSTOM_HUD: CustomHudConfig = {
  preset: 'classic',
  elements: createHudPresetElements('classic'),
};

export type KeybindActionId =
  | 'moveForward'
  | 'moveBackward'
  | 'moveLeft'
  | 'moveRight'
  | 'sprint'
  | 'jump'
  | 'vehicle'
  | 'horn'
  | 'helmet'
  | 'camera'
  | 'scope'
  | 'attack'
  | 'interact'
  | 'medkit'
  | 'surrender'
  | 'wheel'
  | 'shop'
  | 'map'
  | 'phone'
  | 'radio'
  | 'mic'
  | 'weapon1'
  | 'weapon2'
  | 'weapon3'
  | 'weapon4'
  | 'weapon5'
  | 'jail1'
  | 'jail2'
  | 'jail3'
  | 'jail4'
  | 'jail5'
  | 'jail6';

export type KeybindMap = Record<KeybindActionId, string>;

export const DEFAULT_KEYBINDS: KeybindMap = {
  moveForward: 'KeyW',
  moveBackward: 'KeyS',
  moveLeft: 'KeyA',
  moveRight: 'KeyD',
  sprint: 'ShiftLeft',
  jump: 'Space',
  vehicle: 'KeyF',
  horn: 'KeyG',
  helmet: 'KeyL',
  camera: 'KeyC',
  scope: 'KeyX',
  attack: 'KeyJ',
  interact: 'KeyE',
  medkit: 'KeyK',
  surrender: 'KeyH',
  wheel: 'KeyQ',
  shop: 'KeyB',
  map: 'KeyM',
  phone: 'KeyP',
  radio: 'KeyR',
  mic: 'KeyV',
  weapon1: 'Digit1',
  weapon2: 'Digit2',
  weapon3: 'Digit3',
  weapon4: 'Digit4',
  weapon5: 'Digit5',
  jail1: 'Digit1',
  jail2: 'Digit2',
  jail3: 'Digit3',
  jail4: 'Digit4',
  jail5: 'Digit5',
  jail6: 'Digit6',
};

export interface KeybindMetaItem {
  id: KeybindActionId;
  label: string;
  category: 'Movement' | 'Vehicle & Camera' | 'Combat & Survival' | 'City & Jail';
}

export const KEYBIND_META: KeybindMetaItem[] = [
  { id: 'moveForward', label: 'Move Forward / Gas', category: 'Movement' },
  { id: 'moveBackward', label: 'Move Backward / Brake', category: 'Movement' },
  { id: 'moveLeft', label: 'Strafe Left / Steer Left', category: 'Movement' },
  { id: 'moveRight', label: 'Strafe Right / Steer Right', category: 'Movement' },
  { id: 'sprint', label: 'Sprint / Chopper Descend', category: 'Movement' },
  { id: 'jump', label: 'Jump / Chopper Ascend', category: 'Movement' },
  { id: 'vehicle', label: 'Enter / Exit Vehicle', category: 'Vehicle & Camera' },
  { id: 'horn', label: 'Vehicle Horn / Headlights Hold', category: 'Vehicle & Camera' },
  { id: 'helmet', label: 'Toggle ISI Helmet', category: 'Vehicle & Camera' },
  { id: 'camera', label: 'Cycle Camera (3P Far / Close / FPV)', category: 'Vehicle & Camera' },
  { id: 'attack', label: 'Fire / Melee Attack', category: 'Combat & Survival' },
  { id: 'scope', label: 'Toggle Scope / ADS', category: 'Combat & Survival' },
  { id: 'interact', label: 'Interact / Context Action', category: 'Combat & Survival' },
  { id: 'medkit', label: 'Quick-Use Medkit (+75 HP)', category: 'Combat & Survival' },
  { id: 'surrender', label: 'Surrender to Police (Hold)', category: 'Combat & Survival' },
  { id: 'wheel', label: 'Weapon Wheel', category: 'Combat & Survival' },
  { id: 'weapon1', label: 'Equip Slot 1 (Fists)', category: 'Combat & Survival' },
  { id: 'weapon2', label: 'Equip Slot 2 (Pistol)', category: 'Combat & Survival' },
  { id: 'weapon3', label: 'Equip Slot 3 (SMG)', category: 'Combat & Survival' },
  { id: 'weapon4', label: 'Equip Slot 4 (Shotgun)', category: 'Combat & Survival' },
  { id: 'weapon5', label: 'Equip Slot 5 (Rifle)', category: 'Combat & Survival' },
  { id: 'shop', label: 'Inventory / Armory / Street Bribe', category: 'City & Jail' },
  { id: 'map', label: '3D City GPS Map', category: 'City & Jail' },
  { id: 'phone', label: 'Smartphone & Cheat Terminal', category: 'City & Jail' },
  { id: 'radio', label: 'Police Radio Chatter', category: 'City & Jail' },
  { id: 'mic', label: 'Hindi Voice Mic', category: 'City & Jail' },
  { id: 'jail1', label: 'Jail Action 1 (Sleep Bunk)', category: 'City & Jail' },
  { id: 'jail2', label: 'Jail Action 2 (Work Shift)', category: 'City & Jail' },
  { id: 'jail3', label: 'Jail Action 3 (Bribe Warden)', category: 'City & Jail' },
  { id: 'jail4', label: 'Jail Action 4 (Prison Break)', category: 'City & Jail' },
  { id: 'jail5', label: 'Jail Action 5 (Distraction)', category: 'City & Jail' },
  { id: 'jail6', label: 'Jail Action 6 (Bribe Rival)', category: 'City & Jail' },
];

export function formatKeyCode(code: string): string {
  if (!code) return '—';
  if (code.startsWith('Key')) return code.slice(3).toUpperCase();
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return `NUM${code.slice(6)}`;
  if (code === 'ShiftLeft' || code === 'ShiftRight') return 'SHIFT';
  if (code === 'ControlLeft' || code === 'ControlRight') return 'CTRL';
  if (code === 'AltLeft' || code === 'AltRight') return 'ALT';
  if (code === 'Space') return 'SPACE';
  if (code === 'ArrowUp') return 'UP';
  if (code === 'ArrowDown') return 'DOWN';
  if (code === 'ArrowLeft') return 'LEFT';
  if (code === 'ArrowRight') return 'RIGHT';
  if (code === 'Enter') return 'ENTER';
  if (code === 'Backspace') return 'BKSP';
  if (code === 'Tab') return 'TAB';
  return code.toUpperCase();
}

export interface GameSettings {
  masterVolume: number; // 0..1
  sfxVolume: number; // 0..1
  npcVoiceEnabled: boolean; // Street NPCs, Enforcers, Armory Dealer
  policeVoiceEnabled: boolean; // Police Officers
  gameVoiceEnabled: boolean; // Bank Clerk, Mission Narrator, System Voice
  voiceMicEnabled: boolean; // Opt-in browser SpeechRecognition (off by default so game never bugs for mic permission)
  retroVoiceBlips: boolean;
  mouseSensitivity: number; // 0.3..2.0
  shadowsEnabled: boolean;
  showControlsStrip: boolean;
  touchControls: 'auto' | 'on' | 'off';
  touchButtonScale: number; // 0.75..1.35
  touchOpacity: number; // 0.45..1.0
  touchMovementStyle: 'joystick' | 'dpad';
  customHud: CustomHudConfig;
  npcDensity: DensityLevel;
  trafficDensity: DensityLevel;
  keybinds: KeybindMap;
}

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.75,
  sfxVolume: 0.85,
  npcVoiceEnabled: true,
  policeVoiceEnabled: true,
  gameVoiceEnabled: true,
  voiceMicEnabled: false,
  retroVoiceBlips: true,
  mouseSensitivity: 1.0,
  shadowsEnabled: true,
  showControlsStrip: true,
  touchControls: 'auto',
  touchButtonScale: 1.0,
  touchOpacity: 0.9,
  touchMovementStyle: 'joystick',
  customHud: DEFAULT_CUSTOM_HUD,
  npcDensity: 'high',
  trafficDensity: 'high',
  keybinds: { ...DEFAULT_KEYBINDS },
};

const VALID_DENSITIES: DensityLevel[] = ['low', 'medium', 'high', 'ultra'];

export function normalizeSettings(partial: Partial<GameSettings> | null | undefined): GameSettings {
  const baseElements = createHudPresetElements('classic');
  const incomingElements = partial?.customHud?.elements;
  const mergedElements = { ...baseElements };
  if (incomingElements && typeof incomingElements === 'object') {
    for (const key of Object.keys(baseElements) as HudControlId[]) {
      const inc = incomingElements[key];
      if (inc && typeof inc === 'object') {
        mergedElements[key] = {
          ...baseElements[key],
          ...inc,
          id: key,
          xPct: Math.max(4, Math.min(96, Number(inc.xPct ?? baseElements[key].xPct))),
          yPct: Math.max(6, Math.min(94, Number(inc.yPct ?? baseElements[key].yPct))),
          scale: Math.max(0.6, Math.min(1.65, Number(inc.scale ?? baseElements[key].scale))),
          opacity: Math.max(0.25, Math.min(1, Number(inc.opacity ?? baseElements[key].opacity))),
          visible: HUD_CONTROL_META[key].lockVisible ? true : Boolean(inc.visible ?? baseElements[key].visible),
        };
      }
    }
  }
  const mergedKeybinds: KeybindMap = { ...DEFAULT_KEYBINDS };
  if (partial?.keybinds && typeof partial.keybinds === 'object') {
    for (const k of Object.keys(DEFAULT_KEYBINDS) as KeybindActionId[]) {
      const val = partial.keybinds[k];
      if (typeof val === 'string' && val.trim().length > 0) {
        mergedKeybinds[k] = val;
      }
    }
  }
  const npcDensity = VALID_DENSITIES.includes(partial?.npcDensity as DensityLevel)
    ? (partial!.npcDensity as DensityLevel)
    : DEFAULT_SETTINGS.npcDensity;
  const trafficDensity = VALID_DENSITIES.includes(partial?.trafficDensity as DensityLevel)
    ? (partial!.trafficDensity as DensityLevel)
    : DEFAULT_SETTINGS.trafficDensity;
  return {
    ...DEFAULT_SETTINGS,
    ...(partial ?? {}),
    voiceMicEnabled: Boolean(partial?.voiceMicEnabled ?? DEFAULT_SETTINGS.voiceMicEnabled),
    npcDensity,
    trafficDensity,
    keybinds: mergedKeybinds,
    customHud: {
      preset: partial?.customHud?.preset ?? 'classic',
      elements: mergedElements,
    },
  };
}

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
  houseName?: string;
  playerOutfit?: PlayerOutfitId;
  wardrobeWeapons?: WeaponId[];
  wardrobeArmor?: number;
  wardrobeMedkits?: number;
  gameMinutes?: number;
  dayCount?: number;
  probationDaysLeft?: number;
  pendingLicenseRevocation?: number;
  licenseRevokedPrompt?: LicenseRevokedPromptHud | null;
  jailEscrowedWeapons?: WeaponId[];
  jailEscrowedAmmo?: Partial<Record<WeaponId, number>>;
  jailSentence?: {
    starsAtArrest: number;
    sentenceDaysTotal: number;
    remainingDays: number;
    wardenBribeCost: number;
    workCount: number;
    workShiftDoneToday: boolean;
    pendingLicenseRevocation: number;
  } | null;
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
    | 'home'
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
  isClosest?: boolean;
  weaponId?: WeaponId;
  isDealer?: boolean;
  isBanker?: boolean;
  isLicenseOfficer?: boolean;
  isBuildingSign?: boolean;
  signAccent?: string;
  homeStation?: 'PUJA' | 'BED' | 'WARDROBE';
  jailStation?:
    | 'BUNK'
    | 'TOILET'
    | 'WORKSHOP'
    | 'WARDEN'
    | 'ESCAPE_GATE'
    | 'INMATE_ALLY'
    | 'INMATE_RIVAL';
  rivalId?: string;
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
  { id: 'pankaj-armory', label: 'Pankaj Shastra Bhandar', category: 'service', x: 30, z: -14, badge: 'G' },
  { id: 'hospital', label: 'City Hospital', category: 'service', x: -30, z: 14, badge: '+' },
  { id: 'auto-stand', label: 'Chai Chowk Auto Stand', category: 'service', x: 7.5, z: 14, badge: 'A' },
  { id: 'chai-chowk', label: 'Sharma Chai Tapri', category: 'food', x: 10.2, z: 13.5, badge: 'C' },
  { id: 'golgappa-chowk', label: 'Gupta Golgappa Bhandar', category: 'food', x: -10.2, z: 14.5, badge: 'P' },
  { id: 'laxmi-medical', label: 'Laxmi Medical & Kirana Bazaar', category: 'service', x: 90, z: 46, badge: 'K' },
  { id: 'ganga-dhaba', label: 'Ganga Highway Dhaba', category: 'food', x: -120, z: 14, badge: 'D' },
  { id: 'azad-nagar', label: 'Azad Nagar Colony', category: 'service', x: -210, z: 16, badge: 'R' },
  { id: 'shanti-vihar', label: 'Shanti Vihar Colony', category: 'service', x: 210, z: -16, badge: 'R' },
];

export type CourtroomVerdictKind = 'BAILABLE' | 'HIGH_BAIL' | 'NO_BAIL' | 'CONDITIONAL_INTERIM_BAIL';

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
  hasFatalCharge: boolean;
  fatalitiesCount: number;
  verdictKind: CourtroomVerdictKind;
  verdictHeadline: string;
  bailAmount: number;
  lawyerFee: number;
  victimCompensation: number;
  totalDue: number;
  jailDays: number;
  interimBailEligible: boolean;
  interimBailApplied: boolean;
  interimBailBreakdown?: {
    heavyBond: number;
    seniorAdvocateFee: number;
    victimCompensation: number;
    total: number;
  };
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

export type SleepCutsceneLocation = 'HOME_BED' | 'JAIL_BUNK';

export interface SleepCutsceneHud {
  active: boolean;
  location: SleepCutsceneLocation;
  phase: 'LYING_DOWN' | 'NIGHT_REST' | 'MORNING_WAKE';
  title: string;
  subtitle: string;
  stageLabel: string;
  progressPct: number;
}

export interface LicenseRevokedPromptHud {
  active: boolean;
  starsAtArrest: number;
  urgentFee: number;
  standardFee: number;
}

export type JailSchedulePhase = 'WORK_SHIFT' | 'FREE_YARD' | 'NIGHT_LOCKUP';

export interface JailGuardBlip {
  x: number;
  z: number;
  yaw: number;
  alerted: boolean;
}

export interface JailInmateBlip {
  id: string;
  x: number;
  z: number;
  name: string;
  ally: boolean;
  rival?: boolean;
  defeated?: boolean;
  bribed?: boolean;
}

export interface JailRivalInfo {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  bribeCost: number;
  bribed: boolean;
  defeated: boolean;
  chasing: boolean;
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
  nearStation:
    | 'BUNK'
    | 'TOILET'
    | 'WORKSHOP'
    | 'WARDEN'
    | 'ESCAPE_GATE'
    | 'INMATE_ALLY'
    | 'INMATE_RIVAL'
    | null;
  statusBanner: string | null;
  schedulePhase: JailSchedulePhase;
  scheduleTitle: string;
  scheduleSub: string;
  workShiftDoneToday: boolean;
  distractionActiveSec: number;
  distractionCooldownSec: number;
  nearInmateDialogue: { name: string; text: string } | null;
  nearRival: JailRivalInfo | null;
  rivals: JailRivalInfo[];
  playerX: number;
  playerZ: number;
  playerYaw: number;
  guards: JailGuardBlip[];
  inmates: JailInmateBlip[];
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
  vehicleSteer: number;
  vehicleGear: string;
  vehicleHeadlightsOn: boolean;
  vehicleFuelPct: number;
  vehicleAltitudeM: number;
  playerX: number;
  playerZ: number;
  playerYaw: number;
  pointerLocked: boolean;
  firstPerson: boolean;
  cameraMode: CameraViewMode;
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
  sleepCutscene: SleepCutsceneHud | null;
  probationDaysLeft: number;
  licenseRevokedPrompt: LicenseRevokedPromptHud | null;
  jail: JailHudState | null;
  houseName: string | null;
  needsHouseNaming: boolean;
  homePos: { x: number; z: number };
  nearHomeStation: 'PUJA' | 'BED' | 'WARDROBE' | null;
  playerOutfit: PlayerOutfitId;
  wardrobe: {
    weapons: WeaponId[];
    armor: number;
    medkits: number;
  };
}
