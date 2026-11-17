import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BatteryCharging,
  Camera,
  Car,
  ChevronLeft,
  ChevronRight,
  Code2,
  Coffee,
  Crosshair,
  Disc,
  Eye,
  Flame,
  Hand,
  HardHat,
  Heart,
  HeartPulse,
  Landmark,
  Map as MapIcon,
  MessageCircle,
  Mic,
  Minus,
  Music2,
  Newspaper,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOff,
  Play,
  Radio,
  Send,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Signal,
  Square,
  Terminal,
  Trash2,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { soundEngine } from '../engine/audio';
import {
  BRIBE_PRICE_INR,
  BankAccountHudState,
  CITY_LOCATIONS,
  ChaiDialoguePrompt,
  GameSettings,
  MAX_MEDKITS,
  MicHudState,
  PoliceInspectionHud,
  STREET_BRIBE_INR,
  TimeOfDayHud,
  WaypointHudState,
  formatInGameDate,
  formatRs,
  formatRsExact,
} from '../types/game';

interface InGamePhoneProps {
  cash: number;
  wantedLevel: number;
  hp: number;
  maxHp: number;
  medkits: number;
  kills: number;
  probationDaysLeft: number;
  houseName: string | null;
  homePos: { x: number; z: number };
  timeOfDay: TimeOfDayHud;
  bank: BankAccountHudState;
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
  minimized?: boolean;
  onMinimize?: () => void;
  onRestore?: () => void;
  onUpdateSettings: (next: GameSettings) => void;
  onOpenFullSettings: () => void;
  onOpenArmory: () => void;
  onOpenMap: () => void;
  onSetWaypoint: (x: number, z: number, label: string) => void;
  onClearWaypoint: () => void;
  onBankTransaction: (
    account: 'SAVINGS' | 'FD',
    action: 'DEPOSIT' | 'WITHDRAW',
    amount: number,
  ) => { ok: boolean; message: string };
  onCaptureSnapshot: () => string | null;
  onRadio: () => void;
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

type PhoneApp =
  | 'home'
  | 'contacts'
  | 'bharattube'
  | 'desigram'
  | 'bharatbook'
  | 'bank'
  | 'gps'
  | 'cheats';

type TubeCategory = 'dev' | 'lofi';

interface TubeTrack {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  category: TubeCategory;
}

interface DesiGramComment {
  id: string;
  author: string;
  text: string;
}

interface DesiGramSavedPhoto {
  id: string;
  dataUrl: string;
  caption: string;
  location: string;
  timeLabel: string;
  likes: number;
  liked: boolean;
  comments: DesiGramComment[];
}

interface ContactEntry {
  id: 'inspector' | 'pankaj' | 'fixer' | 'mom';
  name: string;
  roleLabel: string;
  phoneNumber: string;
  locationLabel: string;
  avatarBg: string;
  initials: string;
  voiceRole: 'inspector' | 'dealer' | 'enforcer' | 'mom';
  seedId: number;
}

interface ActiveCallState {
  contact: ContactEntry;
  direction: 'INCOMING' | 'OUTGOING';
  phase: 'RINGING' | 'CONNECTED';
  connectedSec: number;
  spokenText: string;
}

const DESIGRAM_STORAGE_KEY = 'itr_desigram_photos_v1';
const MAX_SAVED_PHOTOS = 4;

const BHARATTUBE_DEV_PLAYLIST: TubeTrack[] = [
  {
    id: 'xooWkXN97bc',
    title: 'Three.js 3D Projects Course',
    subtitle: 'WebGL Scenes & Meshes',
    tag: '3D DEV',
    category: 'dev',
  },
  {
    id: 'biw7kCtgnv8',
    title: 'Three.js 3D Game Engine',
    subtitle: 'Physics, Lighting & Collisions',
    tag: 'GAME DEV',
    category: 'dev',
  },
  {
    id: 'FbaUr4vX7ho',
    title: 'TypeScript Full Course',
    subtitle: 'Strict Types & Architecture',
    tag: 'TYPESCRIPT',
    category: 'dev',
  },
  {
    id: 'zwNF1-lsia8',
    title: '3D Game Loop & State',
    subtitle: 'Models, Camera & Controls',
    tag: 'DEVLOG',
    category: 'dev',
  },
  {
    id: '9oZ2m626_qg',
    title: 'Browser 3D Game Physics',
    subtitle: 'Vehicle & World Tuning',
    tag: 'TUTORIAL',
    category: 'dev',
  },
  {
    id: 'aG47pivdsww',
    title: 'No-Engine Web 3D Guide',
    subtitle: 'Optimization & Frame Pacing',
    tag: 'WEBGL',
    category: 'dev',
  },
];

const BHARATTUBE_LOFI_PRESETS: TubeTrack[] = [
  {
    id: 'jfKfPfyJRdk',
    title: 'Lofi Beats Radio',
    subtitle: '24/7 Chill Coding & Drive',
    tag: 'LIVE',
    category: 'lofi',
  },
  {
    id: '5qap5aO4i9A',
    title: 'Midnight Highway Drift',
    subtitle: 'Chillhop Instrumentals',
    tag: 'CHILL',
    category: 'lofi',
  },
  {
    id: '4xDzrJKXOOY',
    title: 'Synthwave Night Drive',
    subtitle: 'Kashi Nagar Cruise Beats',
    tag: 'SYNTH',
    category: 'lofi',
  },
  {
    id: 'DWcJFNfaw9c',
    title: 'Rainy Chai Lounge',
    subtitle: 'Monsoon Street Ambience',
    tag: 'MONSOON',
    category: 'lofi',
  },
];

const ALL_TUBE_TRACKS = [...BHARATTUBE_DEV_PLAYLIST, ...BHARATTUBE_LOFI_PRESETS];

function extractYouTubeVideoId(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const u = new URL(withProto);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') {
      const seg = u.pathname.split('/').filter(Boolean)[0];
      return seg && /^[A-Za-z0-9_-]{11}$/.test(seg) ? seg : null;
    }
    if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      const v = u.searchParams.get('v');
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
      const parts = u.pathname.split('/').filter(Boolean);
      const embedIdx = parts.findIndex((p) => p === 'embed' || p === 'shorts' || p === 'live');
      if (embedIdx >= 0 && parts[embedIdx + 1] && /^[A-Za-z0-9_-]{11}$/.test(parts[embedIdx + 1])) {
        return parts[embedIdx + 1];
      }
    }
  } catch {
    // fallback regex below
  }
  const match = trimmed.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

function loadDesiGramPhotos(): DesiGramSavedPhoto[] {
  try {
    const raw = localStorage.getItem(DESIGRAM_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_SAVED_PHOTOS).map((item) => ({
      id: String(item.id ?? `snap_${Date.now()}`),
      dataUrl: String(item.dataUrl ?? ''),
      caption: String(item.caption ?? ''),
      location: String(item.location ?? 'Madhavpur Central Chowk'),
      timeLabel: String(item.timeLabel ?? 'Saved'),
      likes: Number(item.likes ?? 0),
      liked: Boolean(item.liked),
      comments: Array.isArray(item.comments) ? item.comments : [],
    }));
  } catch {
    return [];
  }
}

function saveDesiGramPhotos(photos: DesiGramSavedPhoto[]): void {
  try {
    localStorage.setItem(DESIGRAM_STORAGE_KEY, JSON.stringify(photos.slice(0, MAX_SAVED_PHOTOS)));
  } catch {
    // ignore quota error
  }
}

function formatCallDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const InGamePhone: React.FC<InGamePhoneProps> = ({
  cash,
  wantedLevel,
  hp,
  maxHp,
  medkits,
  kills,
  probationDaysLeft,
  houseName,
  homePos,
  timeOfDay,
  bank,
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
  minimized = false,
  onMinimize,
  onRestore,
  onUpdateSettings,
  onOpenFullSettings,
  onOpenArmory,
  onOpenMap,
  onSetWaypoint,
  onClearWaypoint,
  onBankTransaction,
  onCaptureSnapshot,
  onRadio,
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
  const [app, setApp] = useState<PhoneApp>('home');

  // BharatTube state (persists while phone is minimized)
  const [tubeCategory, setTubeCategory] = useState<TubeCategory>('dev');
  const [ytInput, setYtInput] = useState('');
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>('BharatTube');
  const [ytError, setYtError] = useState<string | null>(null);
  const [offlineLofiPlaying, setOfflineLofiPlaying] = useState(false);
  const lofiTimerRef = useRef<number | null>(null);
  const lofiCtxRef = useRef<AudioContext | null>(null);

  // Contacts & Full-Screen Call Overlay state
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);
  const outgoingConnectTimeoutRef = useRef<number | null>(null);
  const ringIntervalRef = useRef<number | null>(null);

  // DesiGram state
  const [photos, setPhotos] = useState<DesiGramSavedPhoto[]>(loadDesiGramPhotos);
  const [snapCaption, setSnapCaption] = useState('');
  const [npcLikes, setNpcLikes] = useState<Record<string, boolean>>({});
  const [npcComments, setNpcComments] = useState<Record<string, DesiGramComment[]>>({
    'npc-raju': [
      { id: 'c1', author: 'pankaj_shastra', text: 'Save one kulhad chai for me bhai!' },
      { id: 'c2', author: 'anmol_surajpur', text: 'Evening ride on Chowk looks clean.' },
    ],
    'npc-chowk': [
      { id: 'c3', author: 'inspector_rathore', text: 'Ride safely & keep your ISI helmet on.' },
      { id: 'c4', author: 'kashi_traveler', text: 'Aarti atmosphere at Ram Mandir is peaceful.' },
    ],
  });
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');

  // Royal Bank app feedback
  const [bankFeedback, setBankFeedback] = useState<string | null>(null);

  // Cheat Dialer state
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const safeHomeLabel = houseName?.trim() || 'Shanti Niwas';

  const contacts: ContactEntry[] = useMemo(
    () => [
      {
        id: 'inspector',
        name: 'Inspector Rathore',
        roleLabel: 'Bharat Police · Thana No. 4',
        phoneNumber: '+91 100-0404',
        locationLabel: 'Madhavpur Thana',
        avatarBg: 'from-sky-500 to-indigo-700',
        initials: 'IR',
        voiceRole: 'inspector',
        seedId: 404,
      },
      {
        id: 'pankaj',
        name: 'Pankaj Shastra Bhandar',
        roleLabel: 'Licensed Arms & Armor',
        phoneNumber: '+91 9820-7712',
        locationLabel: 'Bharat Central Chowk',
        avatarBg: 'from-amber-500 to-orange-700',
        initials: 'PS',
        voiceRole: 'dealer',
        seedId: 505,
      },
      {
        id: 'fixer',
        name: 'Bribe Fixer',
        roleLabel: 'Case Clearance Network',
        phoneNumber: '+91 9001-0050',
        locationLabel: 'Kashi Nagar Lane',
        avatarBg: 'from-rose-500 to-red-800',
        initials: 'BF',
        voiceRole: 'enforcer',
        seedId: 606,
      },
      {
        id: 'mom',
        name: 'Mom / Family',
        roleLabel: `${safeHomeLabel} · Home`,
        phoneNumber: '+91 9412-1080',
        locationLabel: 'Surajpur Colony',
        avatarBg: 'from-emerald-500 to-teal-700',
        initials: 'MF',
        voiceRole: 'mom',
        seedId: 101,
      },
    ],
    [safeHomeLabel],
  );

  const getCallDialogue = (contactId: ContactEntry['id']): { display: string; tts: string } => {
    if (contactId === 'inspector') {
      if (wantedLevel >= 1) {
        return {
          display: `Rathore: "Suno! Tumhare khilaaf ${wantedLevel}★ alert active hai. Hoshiyari chhodo aur turant Thana surrender karo!"`,
          tts: `सुनो! तुम्हारे खिलाफ ${wantedLevel} स्टार अलर्ट एक्टिव है। होशियारी छोड़ो और तुरंत थाना सरेंडर करो!`,
        };
      }
      return {
        display:
          'Rathore: "Jai Hind! Thana No. 4 se Inspector Rathore bol raha hoon. Madhavpur mein checking tight hai — license saath rakhna!"',
        tts: 'जय हिंद! थाना नंबर चार से इंस्पेक्टर राठौर बोल रहा हूँ। माधवपुर में चेकिंग टाइट है, लाइसेंस साथ रखना!',
      };
    }
    if (contactId === 'pankaj') {
      return {
        display:
          'Pankaj: "Namaste bhai! Pankaj Shastra Bhandar mein naya tactical stock aa gaya hai — kabhi bhi B dabakar armory aa jao!"',
        tts: 'नमस्ते भाई! पंकज शस्त्र भंडार में नया टैक्टिकल स्टॉक आ गया है, कभी भी आर्मरी आ जाओ!',
      };
    }
    if (contactId === 'fixer') {
      if (wantedLevel >= 1) {
        return {
          display: `Fixer: "Arre bhai ${wantedLevel}★ case laga hai kya? ${formatRs(BRIBE_PRICE_INR)} bhejo, abhi saari file gayab karwa deta hoon!"`,
          tts: `अरे भाई ${wantedLevel} स्टार केस लगा है क्या? पचास हजार भेजो, अभी सारी फाइल गायब करवा देता हूँ!`,
        };
      }
      return {
        display:
          'Fixer: "Sab clear chal raha hai bhai! Jab bhi police file dabwani ho ya setting chahiye, seedha call kar dena."',
        tts: 'सब क्लियर चल रहा है भाई! जब भी पुलिस फाइल दबवानी हो या सेटिंग चाहिए, सीधा कॉल कर देना।',
      };
    }
    return {
      display: `Mom: "Beta, samay par khana kha lena! Raat hone par jaldi ${safeHomeLabel} laut aana aur puja corner mein diya jalana."`,
      tts: `बेटा, समय पर खाना खा लेना! रात होने पर जल्दी ${safeHomeLabel} लौट आना और पूजा घर में दिया जलाना।`,
    };
  };

  const clearCallTimers = () => {
    if (outgoingConnectTimeoutRef.current !== null) {
      window.clearTimeout(outgoingConnectTimeoutRef.current);
      outgoingConnectTimeoutRef.current = null;
    }
    if (ringIntervalRef.current !== null) {
      window.clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
  };

  // Call connected second counter
  useEffect(() => {
    if (!activeCall || activeCall.phase !== 'CONNECTED') return;
    const id = window.setInterval(() => {
      setActiveCall((prev) =>
        prev && prev.phase === 'CONNECTED'
          ? { ...prev, connectedSec: prev.connectedSec + 1 }
          : prev,
      );
    }, 1000);
    return () => window.clearInterval(id);
  }, [activeCall?.phase]);

  // Clean up offline synth loop & call timers on unmount
  useEffect(() => {
    return () => {
      clearCallTimers();
      if (lofiTimerRef.current !== null) {
        window.clearInterval(lofiTimerRef.current);
      }
      if (lofiCtxRef.current && lofiCtxRef.current.state !== 'closed') {
        lofiCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const connectCallNow = (contact: ContactEntry, direction: 'INCOMING' | 'OUTGOING') => {
    clearCallTimers();
    soundEngine.unlock();
    const line = getCallDialogue(contact.id);
    setActiveCall({
      contact,
      direction,
      phase: 'CONNECTED',
      connectedSec: 0,
      spokenText: line.display,
    });
    soundEngine.speakNpcLine(contact.voiceRole, contact.seedId, line.tts, 'high');
  };

  const startOutgoingCall = (contact: ContactEntry) => {
    clearCallTimers();
    soundEngine.unlock();
    soundEngine.playPhoneDialBeep();
    const line = getCallDialogue(contact.id);
    setActiveCall({
      contact,
      direction: 'OUTGOING',
      phase: 'RINGING',
      connectedSec: 0,
      spokenText: line.display,
    });
    soundEngine.playOutgoingRingback();
    ringIntervalRef.current = window.setInterval(() => {
      soundEngine.playOutgoingRingback();
    }, 1700);
    outgoingConnectTimeoutRef.current = window.setTimeout(() => {
      connectCallNow(contact, 'OUTGOING');
    }, 1850);
  };

  const triggerIncomingCall = (contact: ContactEntry) => {
    clearCallTimers();
    soundEngine.unlock();
    const line = getCallDialogue(contact.id);
    setActiveCall({
      contact,
      direction: 'INCOMING',
      phase: 'RINGING',
      connectedSec: 0,
      spokenText: line.display,
    });
    soundEngine.playMobileRingtone();
    ringIntervalRef.current = window.setInterval(() => {
      soundEngine.playMobileRingtone();
    }, 1600);
  };

  const endOrDeclineCall = () => {
    clearCallTimers();
    soundEngine.stopPoliceVoice();
    soundEngine.playCallHangupTone();
    setActiveCall(null);
  };

  const stopOfflineLofi = () => {
    if (lofiTimerRef.current !== null) {
      window.clearInterval(lofiTimerRef.current);
      lofiTimerRef.current = null;
    }
    setOfflineLofiPlaying(false);
  };

  const toggleOfflineLofi = () => {
    if (offlineLofiPlaying) {
      stopOfflineLofi();
      return;
    }
    setActiveVideoId(null);
    setYtError(null);
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      setYtError('Web Audio unavailable in this browser.');
      return;
    }
    if (!lofiCtxRef.current || lofiCtxRef.current.state === 'closed') {
      lofiCtxRef.current = new AudioCtx();
    }
    const ctx = lofiCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const scaleNotes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
    let step = 0;
    const playStep = () => {
      if (!lofiCtxRef.current) return;
      const now = lofiCtxRef.current.currentTime;
      const freq = scaleNotes[(step * 2 + (step % 3)) % scaleNotes.length];
      const osc = lofiCtxRef.current.createOscillator();
      const gain = lofiCtxRef.current.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.connect(gain);
      gain.connect(lofiCtxRef.current.destination);
      osc.start(now);
      osc.stop(now + 0.7);
      step++;
    };
    playStep();
    lofiTimerRef.current = window.setInterval(playStep, 680);
    setOfflineLofiPlaying(true);
    setActiveVideoTitle('Desi Lo-Fi Synth (Offline)');
  };

  const handlePlayUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractYouTubeVideoId(ytInput);
    if (!id) {
      setYtError('Paste a valid youtube.com/watch?v=... or youtu.be/... link.');
      return;
    }
    stopOfflineLofi();
    setYtError(null);
    setActiveVideoId(id);
    setActiveVideoTitle(`Video · ${id}`);
    setYtInput('');
  };

  const handleSelectTrack = (track: TubeTrack) => {
    stopOfflineLofi();
    setYtError(null);
    setActiveVideoId(track.id);
    setActiveVideoTitle(track.title);
  };

  const handleStepPlaylist = (dir: -1 | 1) => {
    const list = tubeCategory === 'dev' ? BHARATTUBE_DEV_PLAYLIST : BHARATTUBE_LOFI_PRESETS;
    const idx = list.findIndex((t) => t.id === activeVideoId);
    const nextIdx =
      idx < 0 ? 0 : (idx + dir + list.length) % list.length;
    handleSelectTrack(list[nextIdx]);
  };

  const handleStopAudio = () => {
    setActiveVideoId(null);
    stopOfflineLofi();
  };

  const handleSnapPhoto = () => {
    const dataUrl = onCaptureSnapshot();
    if (!dataUrl) return;
    const nextPhoto: DesiGramSavedPhoto = {
      id: `snap_${Date.now()}`,
      dataUrl,
      caption:
        snapCaption.trim() ||
        `Cruising through ${houseName ? `${houseName}` : 'Bharat Central Chowk'} at ${timeOfDay.formattedTime}`,
      location: 'Madhavpur · Bharat Central Chowk',
      timeLabel: `Just now · ${bank.calendarDate}`,
      likes: Math.floor(18 + Math.random() * 64),
      liked: false,
      comments: [
        {
          id: `cm_${Date.now()}`,
          author: 'raju_rickshaw_07',
          text: 'Solid capture bhai!',
        },
      ],
    };
    const next = [nextPhoto, ...photos].slice(0, MAX_SAVED_PHOTOS);
    setPhotos(next);
    saveDesiGramPhotos(next);
    setSnapCaption('');
  };

  const handleDeletePhoto = (id: string) => {
    const next = photos.filter((p) => p.id !== id);
    setPhotos(next);
    saveDesiGramPhotos(next);
  };

  const handleTogglePhotoLike = (id: string) => {
    const next = photos.map((p) =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p,
    );
    setPhotos(next);
    saveDesiGramPhotos(next);
  };

  const handleAddComment = (postId: string, isSavedSnap: boolean) => {
    const clean = commentDraft.trim();
    if (!clean) return;
    const newComment: DesiGramComment = {
      id: `cm_${Date.now()}`,
      author: 'player_madhavpur',
      text: clean.slice(0, 80),
    };
    if (isSavedSnap) {
      const next = photos.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p,
      );
      setPhotos(next);
      saveDesiGramPhotos(next);
    } else {
      setNpcComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), newComment],
      }));
    }
    setCommentDraft('');
  };

  const resolveCheatInput = (raw: string): string => {
    const clean = raw.trim().toUpperCase();
    const numericMap: Record<string, string> = {
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
    return numericMap[clean] ?? clean;
  };

  const runCheatCode = (raw: string) => {
    if (!raw.trim()) return;
    const resolved = resolveCheatInput(raw);
    const res = onApplyCheat(resolved);
    setFeedback(res.message);
    if (res.ok) setCode('');
  };

  const handleDial = (e: React.FormEvent) => {
    e.preventDefault();
    runCheatCode(code);
  };

  const bharatBookPosts = useMemo(() => {
    const items: { id: string; tag: string; headline: string; body: string; tone: string }[] = [];
    if (wantedLevel >= 4) {
      items.push({
        id: 'alert-high',
        tag: 'BREAKING NEWS · BHARATPUR',
        headline: `Red Alert Across Madhavpur Chowk (${wantedLevel}★ Wanted)`,
        body: 'Special Task Force and aerial units patrolling Central Chowk. Citizens advised to stay indoors.',
        tone: 'text-red-300 border-red-400/40',
      });
    } else if (wantedLevel >= 1) {
      items.push({
        id: 'alert-low',
        tag: 'TRAFFIC & THANA',
        headline: `Police Beat Alert Issued (${wantedLevel}★)`,
        body: 'Inspector Rathore has alerted Kashi Nagar & Chowk patrols. License & helmet checkpoints active.',
        tone: 'text-amber-300 border-amber-400/40',
      });
    } else {
      items.push({
        id: 'peace',
        tag: 'MADHAVPUR BULLETIN',
        headline: 'Morning Rush Smooth at Bharat Central Chowk',
        body: 'Auto-rickshaws and chai tapris humming peacefully. Zero active warrants on your citizen file.',
        tone: 'text-emerald-300 border-emerald-400/35',
      });
    }

    if (bank.fdTotal > 0 || bank.savingsTotal > 0) {
      items.push({
        id: 'bank-update',
        tag: 'ROYAL BANK OF INDIA',
        headline: `Portfolio: ${formatRsExact(bank.savingsTotal + bank.fdTotal)}`,
        body: `Savings earning 2.5% p.a. (${formatRsExact(bank.savingsTotal)}) · FD earning 4.0% p.a. (${formatRsExact(bank.fdTotal)}). Daily compound on sleep.`,
        tone: 'text-sky-300 border-sky-400/35',
      });
    }

    if (probationDaysLeft > 0) {
      items.push({
        id: 'court-probation',
        tag: 'BHARATPUR DISTRICT COURT',
        headline: `Active Court Probation: ${probationDaysLeft} Day(s) Left`,
        body: 'Bail conditions enforced under BNS directives. Avoid armed confrontation until probation expires.',
        tone: 'text-orange-300 border-orange-400/40',
      });
    }

    items.push({
      id: 'citizen-record',
      tag: 'CITIZEN DOSSIER',
      headline: `${safeHomeLabel} Residence · ${kills} Combat Takedowns`,
      body: `Arms Permit: ${hasGunLicense ? 'Active' : 'Unlicensed'} · Driving License: ${hasDrivingLicense ? 'Valid' : 'Pending at DM RTO'}.`,
      tone: 'text-slate-200 border-white/10',
    });

    return items;
  }, [
    wantedLevel,
    bank.fdTotal,
    bank.savingsTotal,
    probationDaysLeft,
    safeHomeLabel,
    kills,
    hasGunLicense,
    hasDrivingLicense,
  ]);

  const audioActive = Boolean(activeVideoId || offlineLofiPlaying);
  const currentPlaylist =
    tubeCategory === 'dev' ? BHARATTUBE_DEV_PLAYLIST : BHARATTUBE_LOFI_PRESETS;
  const activeTrackMeta = ALL_TUBE_TRACKS.find((t) => t.id === activeVideoId);

  return (
    <>
      {/* Persistent Floating Mini-Pill when Phone is Minimized (keeps BharatTube iframe mounted & playing!) */}
      {minimized && (
        <div className="fixed bottom-2 right-2 z-[26] flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/15 shadow-xl pointer-events-auto">
          <Music2
            className={`w-3.5 h-3.5 ${audioActive ? 'text-[#FBBF24] animate-pulse' : 'text-sky-400'}`}
          />
          <button
            type="button"
            onClick={onRestore}
            className="text-[11px] font-mono-num font-bold text-white hover:text-[#FBBF24] max-w-[140px] truncate cursor-pointer"
          >
            {audioActive ? `♫ ${activeVideoTitle}` : 'ITR OS · Open Phone'}
          </button>
          {audioActive && (
            <button
              type="button"
              onClick={handleStopAudio}
              title="Stop Audio"
              className="p-1 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-200 cursor-pointer"
            >
              <Square className="w-2.5 h-2.5 fill-current" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              handleStopAudio();
              endOrDeclineCall();
              onClose();
            }}
            title="Close Phone"
            className="p-0.5 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Curved Right-Docked Smartphone Frame (moved offscreen cleanly when minimized so audio never pauses) */}
      <div
        className={
          minimized
            ? 'fixed -left-[480px] top-0 w-[312px] h-[540px] opacity-0 pointer-events-none overflow-hidden'
            : 'fixed bottom-2 right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-3 sm:bottom-3 z-30 w-[min(94vw,312px)] h-[min(calc(100dvh-16px),580px)] min-h-0 rounded-[28px] border-[3px] border-slate-700/90 bg-slate-950/92 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden pointer-events-auto'
        }
      >
        {/* Full-Screen Incoming / Outgoing Phone Call Overlay */}
        {activeCall && !minimized && (
          <div className="absolute inset-0 z-40 bg-gradient-to-b from-slate-950 via-[#0d1422] to-slate-950 flex flex-col justify-between p-5 text-center">
            <div className="flex items-center justify-between text-[10px] font-mono-num text-slate-400">
              <span>{activeCall.direction === 'INCOMING' ? 'INCOMING CALL' : 'OUTGOING CALL'}</span>
              <span>HD VOICE · hi-IN</span>
            </div>

            <div className="flex flex-col items-center gap-3 my-auto">
              <div className="relative">
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${activeCall.contact.avatarBg} flex items-center justify-center text-2xl font-display font-extrabold text-white shadow-2xl border-2 border-white/25 ${
                    activeCall.phase === 'RINGING' ? 'animate-pulse' : ''
                  }`}
                >
                  {activeCall.contact.initials}
                </div>
                {activeCall.phase === 'RINGING' && (
                  <span className="absolute -inset-2 rounded-full border-2 border-emerald-400/55 animate-ping pointer-events-none" />
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                <h3 className="font-display text-lg font-bold text-white leading-tight">
                  {activeCall.contact.name}
                </h3>
                <div className="text-[11px] text-slate-300">{activeCall.contact.roleLabel}</div>
                <div className="text-[11px] font-mono-num text-[#FBBF24] mt-1 font-bold">
                  {activeCall.phase === 'RINGING'
                    ? activeCall.direction === 'INCOMING'
                      ? 'Ringing... Tap Accept'
                      : 'Calling...'
                    : `Connected · ${formatCallDuration(activeCall.connectedSec)}`}
                </div>
              </div>

              {activeCall.phase === 'CONNECTED' && (
                <div className="w-full p-3 rounded-2xl bg-white/[0.06] border border-white/15 text-left flex flex-col gap-2">
                  <div className="text-xs text-slate-100 leading-snug">
                    {activeCall.spokenText}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        const line = getCallDialogue(activeCall.contact.id);
                        soundEngine.speakNpcLine(
                          activeCall.contact.voiceRole,
                          activeCall.contact.seedId,
                          line.tts,
                          'high',
                        );
                      }}
                      className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-sky-300 cursor-pointer flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Replay Voice</span>
                    </button>

                    {activeCall.contact.id === 'pankaj' && (
                      <button
                        type="button"
                        onClick={() => {
                          endOrDeclineCall();
                          onOpenArmory();
                        }}
                        className="px-2.5 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold cursor-pointer"
                      >
                        Open Armory
                      </button>
                    )}

                    {activeCall.contact.id === 'fixer' && wantedLevel >= 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          endOrDeclineCall();
                          if (streetBribe?.available && onOfferStreetBribe) {
                            onOfferStreetBribe();
                          } else {
                            onBribePolice();
                          }
                        }}
                        className="px-2.5 py-1 rounded-full bg-red-500 hover:bg-red-400 text-white text-[10px] font-bold cursor-pointer"
                      >
                        {streetBribe?.available
                          ? `Chai-Paani ${formatRs(STREET_BRIBE_INR)}`
                          : `Pay Fixer ${formatRs(BRIBE_PRICE_INR)}`}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Animated Green Accept & Red Decline / End Buttons */}
            <div className="flex items-center justify-center gap-8 pb-3">
              {activeCall.phase === 'RINGING' && activeCall.direction === 'INCOMING' && (
                <button
                  type="button"
                  onClick={() => connectCallNow(activeCall.contact, 'INCOMING')}
                  aria-label="Accept Call"
                  className="flex flex-col items-center gap-1.5 cursor-pointer group"
                >
                  <span className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-[0_0_24px_rgba(16,185,129,0.65)] animate-bounce transition-transform group-active:scale-95">
                    <Phone className="w-6 h-6" />
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-300">Accept</span>
                </button>
              )}

              <button
                type="button"
                onClick={endOrDeclineCall}
                aria-label={activeCall.phase === 'RINGING' ? 'Decline Call' : 'End Call'}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <span className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-[0_0_24px_rgba(220,38,38,0.6)] transition-transform group-active:scale-95">
                  <PhoneOff className="w-6 h-6" />
                </span>
                <span className="text-[10px] font-semibold text-red-300">
                  {activeCall.phase === 'RINGING' && activeCall.direction === 'INCOMING'
                    ? 'Decline'
                    : 'End Call'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Smartphone Notch & Status Bar */}
        <div className="px-4 pt-2.5 pb-1.5 bg-black/45 border-b border-white/10 flex items-center justify-between gap-2 text-[10px] font-mono-num shrink-0">
          <span className="font-bold text-slate-100">{timeOfDay.formattedTime}</span>

          <div className="w-16 h-2 rounded-full bg-slate-800 border border-white/10" />

          <div className="flex items-center gap-1.5 text-slate-200">
            <span className="text-[9px] font-bold text-[#38BDF8] flex items-center gap-0.5">
              <Signal className="w-2.5 h-2.5" />
              5G
            </span>
            <span className="text-[9px] text-emerald-300 flex items-center gap-0.5">
              <BatteryCharging className="w-3 h-3" />
              94%
            </span>
            {onMinimize && (
              <button
                type="button"
                onClick={onMinimize}
                aria-label="Minimize Phone"
                title="Minimize (Keep Audio Playing)"
                className="p-0.5 rounded-full hover:bg-white/15 text-slate-300 hover:text-white cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                handleStopAudio();
                endOrDeclineCall();
                onClose();
              }}
              aria-label="Close Phone"
              className="p-0.5 rounded-full hover:bg-white/15 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ITR OS Sub-Header (Cash, Permits & App Back) */}
        <div className="px-3.5 py-1.5 bg-white/[0.03] border-b border-white/10 flex items-center justify-between gap-2 text-[11px] shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            {app !== 'home' && (
              <button
                type="button"
                onClick={() => setApp('home')}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 cursor-pointer shrink-0"
                title="Home Screen"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
            )}
            <span className={`font-mono-num font-bold truncate ${cash < 0 ? 'text-red-400' : 'text-[#FBBF24]'}`}>
              {formatRs(cash)}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span
              className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono-num font-bold ${
                hasGunLicense
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                  : 'bg-white/5 text-slate-400 border border-white/10'
              }`}
            >
              {hasGunLicense ? 'ARMS' : 'NO ARMS'}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono-num font-bold ${
                hasDrivingLicense
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                  : 'bg-white/5 text-slate-400 border border-white/10'
              }`}
            >
              {hasDrivingLicense ? 'DL' : 'NO DL'}
            </span>
            <span className="font-mono-num text-[10px] font-bold text-[#EF4444] ml-0.5">
              {wantedLevel}★
            </span>
          </div>
        </div>

        {/* Persistent BharatTube Banner when browsing other apps */}
        {audioActive && app !== 'bharattube' && (
          <div className="px-3 py-1 bg-amber-500/15 border-b border-amber-400/30 flex items-center justify-between gap-2 text-[10px] font-mono-num shrink-0">
            <button
              type="button"
              onClick={() => setApp('bharattube')}
              className="flex items-center gap-1.5 text-[#FBBF24] font-semibold truncate cursor-pointer"
            >
              <Music2 className="w-3 h-3 animate-pulse shrink-0" />
              <span className="truncate">♫ {activeVideoTitle}</span>
            </button>
            <button
              type="button"
              onClick={handleStopAudio}
              className="text-red-300 hover:text-red-200 font-bold cursor-pointer shrink-0"
            >
              STOP
            </button>
          </div>
        )}

        {/* Active BharatTube Iframe stays mounted even while browsing other phone apps! */}
        {activeVideoId && (
          <div
            className={
              app === 'bharattube'
                ? 'px-3 pt-2.5 shrink-0'
                : 'fixed -left-[480px] top-0 w-[284px] h-[160px] opacity-0 pointer-events-none'
            }
          >
            <div className="w-full rounded-xl overflow-hidden border border-white/15 bg-black aspect-video">
              <iframe
                title="BharatTube Player"
                src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&rel=0`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}

        {/* Screen Content */}
        <div className="flex-1 overflow-y-auto touch-pan-y p-3 flex flex-col gap-2.5 min-h-0">
          {app === 'home' && (
            <>
              {/* Live Contextual Alerts */}
              {policeInspection && policeInspection.phase === 'ASKING' && onRespondLicenseCheck && (
                <div className="p-2.5 rounded-2xl bg-sky-950/60 border border-sky-400/60 flex flex-col gap-1.5">
                  <div className="text-[11px] font-display font-bold text-sky-300">
                    {policeInspection.officerName}: &ldquo;License dikhao!&rdquo;
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onRespondLicenseCheck(true)}
                      className="py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono-num font-bold cursor-pointer"
                    >
                      [E] Show License
                    </button>
                    <button
                      type="button"
                      onClick={() => onRespondLicenseCheck(false)}
                      className="py-1.5 rounded-xl bg-red-800 hover:bg-red-700 text-white text-[10px] font-mono-num font-bold cursor-pointer"
                    >
                      [R] Refuse
                    </button>
                  </div>
                </div>
              )}

              {chaiPrompt && (
                <div className="p-2.5 rounded-2xl bg-amber-950/45 border border-amber-400/55 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#FBBF24]">
                    <Coffee className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {chaiPrompt.npcName}: &ldquo;{chaiPrompt.line}&rdquo;
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onReplyChai(true)}
                      className="py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono-num font-bold cursor-pointer"
                    >
                      [1] Haan chal
                    </button>
                    <button
                      type="button"
                      onClick={() => onReplyChai(false)}
                      className="py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-mono-num font-bold cursor-pointer"
                    >
                      [2] Baad mein
                    </button>
                  </div>
                </div>
              )}

              {(micState.active || micState.status) && (
                <div
                  className={`p-2 rounded-2xl border text-[11px] flex items-center justify-between gap-2 ${
                    micState.active
                      ? 'bg-red-950/55 border-red-400/60 text-red-100'
                      : 'bg-sky-950/45 border-sky-400/40 text-sky-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Mic className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {micState.transcript ? `"${micState.transcript}"` : micState.status || 'Mic Active'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleMic}
                    className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-bold cursor-pointer shrink-0"
                  >
                    {micState.active ? 'Stop' : 'Mic'}
                  </button>
                </div>
              )}

              {waypoint?.active && (
                <div className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate text-amber-200 font-semibold">
                    GPS: {waypoint.label} ({waypoint.distanceMeters}m)
                  </span>
                  <button
                    type="button"
                    onClick={onClearWaypoint}
                    className="text-[10px] font-mono-num font-bold text-red-300 hover:text-red-200 cursor-pointer shrink-0"
                  >
                    CLEAR
                  </button>
                </div>
              )}

              {/* ITR OS App Launcher Grid */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setApp('contacts')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-100">Contacts</span>
                </button>

                <button
                  type="button"
                  onClick={() => setApp('bharattube')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-100">BharatTube</span>
                </button>

                <button
                  type="button"
                  onClick={() => setApp('desigram')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-100">DesiGram</span>
                </button>

                <button
                  type="button"
                  onClick={() => setApp('bharatbook')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg">
                    <Newspaper className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-100">BharatBook</span>
                </button>

                <button
                  type="button"
                  onClick={() => setApp('bank')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center shadow-lg">
                    <Landmark className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-100">Royal Bank</span>
                </button>

                <button
                  type="button"
                  onClick={() => setApp('gps')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-orange-600 flex items-center justify-center shadow-lg">
                    <PhoneCall className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-100">GPS &amp; Fixer</span>
                </button>
              </div>

              {/* Compact Quick Action Strip */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={onOpenMap}
                  className="flex flex-col items-center gap-0.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-[9px] text-sky-300 cursor-pointer"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenArmory}
                  className="flex flex-col items-center gap-0.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-[9px] text-emerald-300 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Armory</span>
                </button>
                <button
                  type="button"
                  onClick={() => setApp('cheats')}
                  className="flex flex-col items-center gap-0.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-[9px] text-[#FBBF24] cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Cheats</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenFullSettings}
                  className="flex flex-col items-center gap-0.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-[9px] text-slate-200 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>
              </div>

              {/* Quick Toggles */}
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={onInteract}
                  className="flex items-center justify-center gap-1 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-amber-200 font-semibold cursor-pointer"
                >
                  <Hand className="w-3 h-3" />
                  <span>Action</span>
                </button>
                <button
                  type="button"
                  onClick={onUseMedkit}
                  disabled={medkits <= 0 || hp >= maxHp}
                  className="flex items-center justify-center gap-1 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 disabled:opacity-40 border border-emerald-400/35 text-emerald-200 font-semibold cursor-pointer"
                >
                  <HeartPulse className="w-3 h-3" />
                  <span>
                    {medkits}/{MAX_MEDKITS}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onEnterExitVehicle}
                  className="flex items-center justify-center gap-1 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/35 text-sky-200 font-semibold cursor-pointer"
                >
                  <Car className="w-3 h-3" />
                  <span>{inVehicle ? 'Exit' : 'Ride'}</span>
                </button>
              </div>
            </>
          )}

          {app === 'contacts' && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-display font-bold text-emerald-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Madhavpur Contacts
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const idx = wantedLevel >= 1 ? 0 : Math.floor(Math.random() * contacts.length);
                    triggerIncomingCall(contacts[idx]);
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/40 text-emerald-200 text-[10px] font-semibold cursor-pointer"
                >
                  <PhoneIncoming className="w-3 h-3" />
                  <span>Ring Me</span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between gap-2 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => startOutgoingCall(c)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <div
                        className={`w-9 h-9 rounded-full bg-gradient-to-br ${c.avatarBg} flex items-center justify-center text-xs font-display font-bold text-white shrink-0`}
                      >
                        {c.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{c.name}</div>
                        <div className="text-[10px] text-slate-300 truncate">{c.roleLabel}</div>
                        <div className="text-[9px] font-mono-num text-slate-400">
                          {c.phoneNumber} · {c.locationLabel}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => triggerIncomingCall(c)}
                        title="Simulate Incoming Call"
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-sky-300 cursor-pointer"
                      >
                        <PhoneIncoming className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startOutgoingCall(c)}
                        title={`Call ${c.name}`}
                        className="p-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {app === 'bharattube' && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-display font-bold text-red-400 flex items-center gap-1.5 truncate">
                  <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span className="truncate">
                    {activeTrackMeta ? activeTrackMeta.title : 'BharatTube'}
                  </span>
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStepPlaylist(-1)}
                    title="Previous Video"
                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepPlaylist(1)}
                    title="Next Video"
                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  {audioActive && (
                    <button
                      type="button"
                      onClick={handleStopAudio}
                      className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-200 text-[10px] font-bold cursor-pointer"
                    >
                      Stop
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handlePlayUrl} className="flex gap-1.5">
                <input
                  type="text"
                  value={ytInput}
                  onChange={(e) => setYtInput(e.target.value)}
                  placeholder="Paste YouTube link or ID..."
                  className="flex-1 min-w-0 px-2.5 py-1.5 rounded-xl bg-black/50 border border-white/15 focus:border-red-400 outline-none text-[11px] text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold cursor-pointer shrink-0"
                >
                  Play
                </button>
              </form>

              {/* Category Toggle: Coding & Game Dev Playlist vs Lo-Fi Radio */}
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10">
                <button
                  type="button"
                  onClick={() => setTubeCategory('dev')}
                  className={`flex items-center justify-center gap-1 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    tubeCategory === 'dev'
                      ? 'bg-[#F59E0B] text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3 h-3" />
                  <span>Dev &amp; Coding</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTubeCategory('lofi')}
                  className={`flex items-center justify-center gap-1 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    tubeCategory === 'lofi'
                      ? 'bg-red-500 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Music2 className="w-3 h-3" />
                  <span>Lo-Fi &amp; Radio</span>
                </button>
              </div>

              {ytError && (
                <div className="p-2 rounded-xl bg-red-950/60 border border-red-400/40 text-[10px] text-red-200">
                  {ytError}
                </div>
              )}

              {!activeVideoId && !offlineLofiPlaying && (
                <button
                  type="button"
                  onClick={() => handleSelectTrack(currentPlaylist[0])}
                  className="p-3 rounded-xl bg-gradient-to-r from-red-600/25 to-amber-500/20 hover:from-red-600/35 hover:to-amber-500/30 border border-amber-400/40 text-left flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-[#FBBF24]">
                      Play Default {tubeCategory === 'dev' ? 'Coding & Game Dev' : 'Lo-Fi'} Playlist
                    </div>
                    <div className="text-[10px] text-slate-200 truncate">
                      Up next: {currentPlaylist[0].title}
                    </div>
                  </div>
                  <Play className="w-5 h-5 text-white fill-white shrink-0" />
                </button>
              )}

              {offlineLofiPlaying && (
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/45 flex items-center justify-between text-[11px] text-[#FBBF24]">
                  <span className="font-semibold">♫ Playing Offline Desi Lo-Fi Synth</span>
                  <button
                    type="button"
                    onClick={stopOfflineLofi}
                    className="px-2 py-0.5 rounded-full bg-black/30 text-white text-[10px] cursor-pointer"
                  >
                    Pause
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5">
                {currentPlaylist.map((p) => {
                  const selected = activeVideoId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectTrack(p)}
                      className={`p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                        selected
                          ? 'bg-red-500/20 border-red-400/60 text-white'
                          : 'bg-white/[0.04] hover:bg-white/[0.10] border-white/10 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-mono-num font-bold text-[#FBBF24]">{p.tag}</span>
                        <Play className="w-2.5 h-2.5 text-red-400 fill-current shrink-0" />
                      </div>
                      <div className="text-[10px] font-bold truncate mt-0.5">{p.title}</div>
                      <div className="text-[9px] text-slate-400 truncate">{p.subtitle}</div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={toggleOfflineLofi}
                className="w-full py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[10px] font-mono-num text-slate-200 cursor-pointer"
              >
                {offlineLofiPlaying
                  ? 'Stop Offline Synth Fallback'
                  : 'Embed blocked / Offline? Play Built-in Synth Beat'}
              </button>
            </div>
          )}

          {app === 'desigram' && (
            <div className="flex flex-col gap-2.5">
              {/* Instagram-Style Feed Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-display font-bold text-pink-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> DesiGram Feed
                </span>
                <span className="text-[10px] font-mono-num text-slate-400">
                  {photos.length}/{MAX_SAVED_PHOTOS} Snaps
                </span>
              </div>

              {/* Snap Screenshot Bar */}
              <div className="p-2 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-1.5">
                <input
                  type="text"
                  value={snapCaption}
                  onChange={(e) => setSnapCaption(e.target.value)}
                  placeholder="Write a caption for your city post..."
                  maxLength={60}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-black/50 border border-white/15 outline-none text-[11px] text-white"
                />
                <button
                  type="button"
                  onClick={handleSnapPhoto}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 text-white text-[11px] font-bold cursor-pointer shadow"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Snap Screenshot &amp; Post</span>
                </button>
              </div>

              {/* User WebGL Snapshot Vertical Posts */}
              {photos.map((photo) => {
                const commentsOpen = openCommentPostId === photo.id;
                return (
                  <div
                    key={photo.id}
                    className="rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10"
                  >
                    {/* Avatar Header */}
                    <div className="px-2.5 py-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          YO
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-white truncate">
                            @citizen_madhavpur
                          </div>
                          <div className="text-[9px] text-slate-400 truncate">
                            {photo.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] font-mono-num text-slate-400">
                          {photo.timeLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="p-1 text-slate-400 hover:text-red-400 cursor-pointer"
                          title="Delete Photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <img
                      src={photo.dataUrl}
                      alt={photo.caption}
                      className="w-full aspect-[16/10] object-cover bg-black"
                    />

                    {/* Actions & Counters */}
                    <div className="p-2.5 flex flex-col gap-1.5">
                      <div className="flex items-center gap-4 text-[11px] font-mono-num">
                        <button
                          type="button"
                          onClick={() => handleTogglePhotoLike(photo.id)}
                          className="flex items-center gap-1 text-slate-200 cursor-pointer"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              photo.liked ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
                            }`}
                          />
                          <span>{photo.likes}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenCommentPostId(commentsOpen ? null : photo.id)
                          }
                          className="flex items-center gap-1 text-slate-200 cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4 text-sky-300" />
                          <span>{photo.comments.length}</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-100 leading-snug">
                        <span className="font-bold mr-1">@citizen_madhavpur</span>
                        {photo.caption}
                      </div>

                      {commentsOpen && (
                        <div className="pt-1.5 border-t border-white/10 flex flex-col gap-1">
                          {photo.comments.map((cm) => (
                            <div key={cm.id} className="text-[10px] text-slate-300 leading-snug">
                              <span className="font-bold text-[#FBBF24] mr-1">@{cm.author}</span>
                              {cm.text}
                            </div>
                          ))}
                          <div className="flex gap-1 mt-1">
                            <input
                              type="text"
                              value={commentDraft}
                              onChange={(e) => setCommentDraft(e.target.value)}
                              placeholder="Add comment..."
                              className="flex-1 min-w-0 px-2 py-1 rounded-lg bg-black/50 border border-white/15 text-[10px] text-white outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddComment(photo.id, true)}
                              className="px-2 py-1 rounded-lg bg-sky-500 text-slate-950 cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Simulated NPC Instagram-Style Feed Cards */}
              {[
                {
                  id: 'npc-raju',
                  handle: 'raju_rickshaw_07',
                  initials: 'RR',
                  avatarBg: 'from-amber-500 to-yellow-600',
                  location: 'Sharma Chai Tapri · Madhavpur',
                  timeAgo: '14m ago',
                  sceneTitle: 'Auto Stand Golden Hour',
                  sceneSub: 'Kulhad Adrak Chai · ₹20',
                  sceneGrad: 'from-amber-900/70 via-orange-950/60 to-slate-900',
                  caption: 'Kadak adrak chai at Sharma Tapri before night shift! Meter down, full speed.',
                  likes: 84,
                },
                {
                  id: 'npc-chowk',
                  handle: 'kashi_chowk_live',
                  initials: 'KC',
                  avatarBg: 'from-sky-500 to-indigo-600',
                  location: 'Shree Ram Mandir · Kashi Nagar',
                  timeAgo: '42m ago',
                  sceneTitle: 'Mandir Aarti & Chowk Lights',
                  sceneSub: 'Bharatpur District Heritage',
                  sceneGrad: 'from-indigo-900/70 via-purple-950/60 to-slate-900',
                  caption: 'Evening aarti bells echoing across Bharat Central Chowk. Peaceful sunset view.',
                  likes: 142,
                },
              ].map((post) => {
                const liked = Boolean(npcLikes[post.id]);
                const postComments = npcComments[post.id] ?? [];
                const commentsOpen = openCommentPostId === post.id;
                return (
                  <div
                    key={post.id}
                    className="rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10"
                  >
                    <div className="px-2.5 py-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-full bg-gradient-to-br ${post.avatarBg} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}
                        >
                          {post.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-white truncate">
                            @{post.handle}
                          </div>
                          <div className="text-[9px] text-slate-400 truncate">{post.location}</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono-num text-slate-400 shrink-0">
                        {post.timeAgo}
                      </span>
                    </div>

                    {/* Styled Vector Scene Card */}
                    <div
                      className={`w-full h-24 bg-gradient-to-br ${post.sceneGrad} border-y border-white/10 flex flex-col items-center justify-center px-3 text-center`}
                    >
                      <div className="text-xs font-display font-bold text-[#FBBF24]">
                        {post.sceneTitle}
                      </div>
                      <div className="text-[10px] text-slate-300 mt-0.5">{post.sceneSub}</div>
                    </div>

                    <div className="p-2.5 flex flex-col gap-1.5">
                      <div className="flex items-center gap-4 text-[11px] font-mono-num">
                        <button
                          type="button"
                          onClick={() =>
                            setNpcLikes((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
                          }
                          className="flex items-center gap-1 text-slate-200 cursor-pointer"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              liked ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
                            }`}
                          />
                          <span>{post.likes + (liked ? 1 : 0)}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenCommentPostId(commentsOpen ? null : post.id)
                          }
                          className="flex items-center gap-1 text-slate-200 cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4 text-sky-300" />
                          <span>{postComments.length}</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-200 leading-snug">
                        <span className="font-bold text-white mr-1">@{post.handle}</span>
                        {post.caption}
                      </div>

                      {commentsOpen && (
                        <div className="pt-1.5 border-t border-white/10 flex flex-col gap-1">
                          {postComments.map((cm) => (
                            <div key={cm.id} className="text-[10px] text-slate-300 leading-snug">
                              <span className="font-bold text-[#FBBF24] mr-1">@{cm.author}</span>
                              {cm.text}
                            </div>
                          ))}
                          <div className="flex gap-1 mt-1">
                            <input
                              type="text"
                              value={commentDraft}
                              onChange={(e) => setCommentDraft(e.target.value)}
                              placeholder="Add comment..."
                              className="flex-1 min-w-0 px-2 py-1 rounded-lg bg-black/50 border border-white/15 text-[10px] text-white outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddComment(post.id, false)}
                              className="px-2 py-1 rounded-lg bg-sky-500 text-slate-950 cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {app === 'bharatbook' && (
            <div className="flex flex-col gap-2">
              <div className="text-xs font-display font-bold text-sky-300 flex items-center gap-1.5">
                <Newspaper className="w-3.5 h-3.5" /> BharatBook Live Feed
              </div>
              {bharatBookPosts.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-2xl bg-white/[0.04] border ${item.tone} flex flex-col gap-1`}
                >
                  <div className="flex items-center justify-between text-[9px] font-mono-num font-bold">
                    <span>{item.tag}</span>
                    <Flame className="w-3 h-3 opacity-75" />
                  </div>
                  <div className="text-xs font-bold text-white leading-snug">{item.headline}</div>
                  <div className="text-[11px] text-slate-300 leading-snug">{item.body}</div>
                </div>
              ))}
            </div>
          )}

          {app === 'bank' && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-display font-bold text-emerald-300 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5" /> Royal Bank Mobile
                </span>
                <span className="text-[9px] font-mono-num text-slate-400">{bank.calendarDate}</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div className="p-2.5 rounded-2xl bg-emerald-500/12 border border-emerald-400/35">
                  <div className="text-[9px] font-mono-num text-emerald-200/80 uppercase">Savings (2.5%)</div>
                  <div className="text-xs font-mono-num font-bold text-white mt-0.5">
                    {formatRsExact(bank.savingsTotal)}
                  </div>
                </div>
                <div className="p-2.5 rounded-2xl bg-amber-500/12 border border-amber-400/35">
                  <div className="text-[9px] font-mono-num text-amber-200/80 uppercase">Fixed Dep (4%)</div>
                  <div className="text-xs font-mono-num font-bold text-[#FBBF24] mt-0.5">
                    {formatRsExact(bank.fdTotal)}
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-1.5">
                <div className="text-[10px] font-mono-num text-slate-300">Quick Savings Transfer</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[1000, 5000].map((amt) => (
                    <button
                      key={`dep-${amt}`}
                      type="button"
                      onClick={() => {
                        const res = onBankTransaction('SAVINGS', 'DEPOSIT', amt);
                        setBankFeedback(res.message);
                      }}
                      className="py-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-500 text-white text-[10px] font-mono-num font-bold cursor-pointer"
                    >
                      + Deposit {formatRs(amt)}
                    </button>
                  ))}
                  {[1000, 5000].map((amt) => (
                    <button
                      key={`wd-${amt}`}
                      type="button"
                      onClick={() => {
                        const res = onBankTransaction('SAVINGS', 'WITHDRAW', amt);
                        setBankFeedback(res.message);
                      }}
                      className="py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-100 text-[10px] font-mono-num font-bold cursor-pointer"
                    >
                      - Withdraw {formatRs(amt)}
                    </button>
                  ))}
                </div>
                {bankFeedback && (
                  <div className="text-[10px] text-sky-300 leading-snug">{bankFeedback}</div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <div className="text-[10px] font-mono-num text-slate-400 uppercase">Recent Passbook</div>
                {bank.passbook.length === 0 ? (
                  <div className="p-2 rounded-xl bg-white/[0.03] text-[10px] text-slate-400">
                    No recent branch or ATM transactions.
                  </div>
                ) : (
                  bank.passbook.slice(0, 6).map((entry) => (
                    <div
                      key={entry.id}
                      className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-2 text-[10px]"
                    >
                      <div className="min-w-0">
                        <div className="text-slate-100 font-semibold truncate">{entry.note}</div>
                        <div className="text-[9px] font-mono-num text-slate-400">
                          {formatInGameDate(entry.day)} · {entry.timeLabel}
                        </div>
                      </div>
                      <span
                        className={`font-mono-num font-bold shrink-0 ${
                          entry.kind === 'WITHDRAW' ? 'text-red-300' : 'text-emerald-300'
                        }`}
                      >
                        {entry.kind === 'WITHDRAW' ? '-' : '+'}
                        {formatRs(entry.amount)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {app === 'gps' && (
            <div className="flex flex-col gap-2.5">
              {/* Fixer & Police Contacts */}
              <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-1.5">
                <div className="text-[11px] font-display font-bold text-[#FBBF24]">
                  Fixer &amp; Tactical Controls
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  {streetBribe?.available && onOfferStreetBribe ? (
                    <button
                      type="button"
                      onClick={onOfferStreetBribe}
                      className="py-1.5 px-2 rounded-xl bg-amber-500 text-slate-950 font-bold cursor-pointer"
                    >
                      Chai-Paani {formatRs(STREET_BRIBE_INR)}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onBribePolice}
                      className="py-1.5 px-2 rounded-xl bg-red-500/20 hover:bg-red-500/35 border border-red-400/40 text-red-200 font-semibold cursor-pointer"
                    >
                      Fixer ({formatRs(BRIBE_PRICE_INR)})
                    </button>
                  )}

                  {wantedLevel >= 1 && onSurrender ? (
                    <button
                      type="button"
                      onClick={onSurrender}
                      className="py-1.5 px-2 rounded-xl bg-sky-500/25 border border-sky-400/50 text-sky-100 font-semibold cursor-pointer"
                    >
                      Surrender (Hold H)
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onRadio}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-100 font-semibold cursor-pointer"
                    >
                      <Radio className="w-3 h-3 text-sky-400" />
                      <span>Police Radio</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onToggleFirstPerson}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-xl border cursor-pointer ${
                      firstPerson
                        ? 'bg-sky-500/30 border-sky-400 text-white'
                        : 'bg-white/5 border-white/10 text-slate-200'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>FPV (C)</span>
                  </button>

                  <button
                    type="button"
                    onClick={onToggleAds}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-xl border cursor-pointer ${
                      adsActive
                        ? 'bg-amber-500/30 border-amber-400 text-[#FBBF24]'
                        : 'bg-white/5 border-white/10 text-slate-200'
                    }`}
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>Scope (X)</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenWheel}
                    className="flex items-center justify-center gap-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 cursor-pointer"
                  >
                    <Disc className="w-3 h-3 text-[#FBBF24]" />
                    <span>Wheel (Q)</span>
                  </button>

                  <button
                    type="button"
                    onClick={onToggleHelmet}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-xl border cursor-pointer ${
                      helmetOn
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                        : 'bg-white/5 border-white/10 text-slate-200'
                    }`}
                  >
                    <HardHat className="w-3 h-3" />
                    <span>{hasHelmet ? (helmetOn ? 'Helmet ON' : 'Helmet') : 'Helmet'}</span>
                  </button>
                </div>
              </div>

              {/* Quick GPS Destinations */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-display font-bold text-sky-300">
                  Set GPS Destination
                </span>
                {waypoint?.active && (
                  <button
                    type="button"
                    onClick={onClearWaypoint}
                    className="text-[10px] font-mono-num text-red-300 cursor-pointer"
                  >
                    Clear GPS
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1">
                {[
                  {
                    id: 'home',
                    label: houseName ? `${houseName} (Home)` : 'Shanti Niwas (Home)',
                    x: homePos.x,
                    z: homePos.z,
                  },
                  ...CITY_LOCATIONS,
                ].map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => onSetWaypoint(loc.x, loc.z, loc.label)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-left text-[11px] cursor-pointer ${
                      waypoint?.label === loc.label
                        ? 'bg-amber-500/20 border-amber-400/60 text-[#FBBF24] font-semibold'
                        : 'bg-white/[0.04] hover:bg-white/[0.10] border-white/10 text-slate-200'
                    }`}
                  >
                    <span className="truncate">{loc.label}</span>
                    <span className="text-[9px] font-mono-num text-sky-300 ml-2 shrink-0">GO</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {app === 'cheats' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-display font-bold text-[#FBBF24] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> BHARAT CHEAT TERMINAL
                </div>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-mono-num font-bold text-emerald-300">
                  IBD3D DIALER
                </span>
              </div>

              {/* Retro Terminal LCD Readout + Direct Input */}
              <form
                onSubmit={handleDial}
                className="p-2 rounded-2xl bg-[#07110b] border border-emerald-500/45 shadow-inner flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-[9px] font-mono-num text-emerald-400/80">
                  <span>CMD / DIAL CODE</span>
                  <span>8000·2000·3000·1000·100</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="COPTER / 8000"
                    className="flex-1 min-w-0 px-2.5 py-1.5 rounded-xl bg-black/60 border border-emerald-500/35 focus:border-[#F59E0B] outline-none font-mono-num text-xs font-bold tracking-wider uppercase text-emerald-300"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono-num font-extrabold text-[11px] cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>DIAL</span>
                  </button>
                </div>
              </form>

              {feedback && (
                <div className="text-[10px] font-mono-num text-emerald-200 bg-emerald-950/70 border border-emerald-400/45 rounded-xl px-2.5 py-1.5 leading-snug">
                  {feedback}
                </div>
              )}

              {/* Touch-Friendly Numeric Keypad */}
              <div className="grid grid-cols-3 gap-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => {
                      setCode((prev) => `${prev}${digit}`.slice(0, 14));
                    }}
                    className="h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] active:scale-95 border border-white/10 font-mono-num text-xs font-bold text-slate-100 cursor-pointer transition-transform"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCode((prev) => prev.slice(0, -1))}
                  className="h-8 rounded-xl bg-red-500/20 hover:bg-red-500/35 active:scale-95 border border-red-400/35 font-mono-num text-[10px] font-bold text-red-200 cursor-pointer"
                >
                  DEL
                </button>
                <button
                  type="button"
                  onClick={() => setCode((prev) => `${prev}0`.slice(0, 14))}
                  className="h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] active:scale-95 border border-white/10 font-mono-num text-xs font-bold text-slate-100 cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => runCheatCode(code)}
                  className="h-8 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] active:scale-95 font-mono-num text-[10px] font-extrabold text-slate-950 cursor-pointer"
                >
                  RUN
                </button>
              </div>

              {/* Instant Vehicle Spawner Terminal Buttons */}
              <div className="flex flex-col gap-1 pt-0.5">
                <div className="text-[9px] font-mono-num text-sky-300/90 uppercase tracking-wider">
                  Instant Vehicle Spawns (Tap to Spawn)
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] font-mono-num">
                  {[
                    { cmd: 'COPTER', dial: '8000', desc: 'Chopper' },
                    { cmd: 'AUTO', dial: '2000', desc: 'Auto-Rickshaw' },
                    { cmd: 'BIKE', dial: '3000', desc: 'Sports Bike' },
                    { cmd: 'CAR', dial: '1000', desc: 'Sedan Car' },
                    { cmd: 'POLICE', dial: '100', desc: 'Police SUV' },
                  ].map((item) => (
                    <button
                      key={item.cmd}
                      type="button"
                      onClick={() => runCheatCode(item.cmd)}
                      className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-sky-500/12 hover:bg-sky-500/25 border border-sky-400/35 text-left cursor-pointer transition-colors"
                    >
                      <div className="flex flex-col min-w-0 leading-tight">
                        <span className="font-bold text-sky-200 truncate">{item.cmd}</span>
                        <span className="text-[8px] text-slate-300 truncate">{item.desc}</span>
                      </div>
                      <span className="text-[9px] text-[#FBBF24] font-bold shrink-0 ml-1">{item.dial}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Classic World & Armory Cheats */}
              <div className="grid grid-cols-2 gap-1 text-[10px] font-mono-num">
                {[
                  { cmd: 'PAISABARSAO', dial: '9110' },
                  { cmd: 'SHASTRA100', dial: '7000' },
                  { cmd: 'NOCHALLAN', dial: '0000' },
                  { cmd: 'VIPPASS', dial: '5555' },
                ].map((c) => (
                  <button
                    key={c.cmd}
                    type="button"
                    onClick={() => runCheatCode(c.cmd)}
                    className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-[#FBBF24] cursor-pointer"
                  >
                    <span className="font-bold truncate">{c.cmd}</span>
                    <span className="text-[8px] text-slate-300 shrink-0 ml-1">{c.dial}</span>
                  </button>
                ))}
              </div>

              {/* Voice & Touch Quick Switches */}
              <div className="flex flex-col gap-1.5 pt-1 border-t border-white/10 text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      policeVoiceEnabled: !settings.policeVoiceEnabled,
                    })
                  }
                  className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 text-slate-200">
                    {settings.policeVoiceEnabled ? (
                      <Volume2 className="w-3.5 h-3.5 text-[#FBBF24]" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    Police Voice
                  </span>
                  <span className="font-mono-num font-bold text-[#FBBF24]">
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
                  className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 cursor-pointer"
                >
                  <span className="text-slate-200">NPC Voices</span>
                  <span className="font-mono-num font-bold text-emerald-400">
                    {settings.npcVoiceEnabled ? 'ON' : 'OFF'}
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
                  className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 cursor-pointer"
                >
                  <span className="text-slate-200">Touchscreen HUD</span>
                  <span className="font-mono-num font-bold text-sky-400 uppercase">
                    {settings.touchControls}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Smartphone Home Bar Pill */}
        <div className="py-2 bg-black/40 border-t border-white/10 flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={() => {
              if (app !== 'home') {
                setApp('home');
              } else if (onMinimize && audioActive) {
                onMinimize();
              } else {
                handleStopAudio();
                endOrDeclineCall();
                onClose();
              }
            }}
            title={app !== 'home' ? 'Return to Home Screen' : 'Close / Minimize Phone'}
            className="w-24 h-1.5 rounded-full bg-white/30 hover:bg-white/60 transition-colors cursor-pointer"
          />
        </div>
      </div>
    </>
  );
};
