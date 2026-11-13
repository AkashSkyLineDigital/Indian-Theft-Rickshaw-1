import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Bike,
  CheckCircle2,
  Crosshair,
  FileCheck2,
  HardHat,
  RotateCcw,
  ShieldCheck,
  Target,
  X,
} from 'lucide-react';
import {
  DRIVING_LICENSE_FEE_INR,
  GUN_LICENSE_FEE_INR,
  HELMET_PRICE_INR,
  NO_DL_FINE_INR,
  NO_HELMET_FINE_INR,
  formatRs,
} from '../types/game';

interface LicenseOfficeModalProps {
  cash: number;
  hasGunLicense: boolean;
  hasDrivingLicense: boolean;
  hasHelmet: boolean;
  helmetOn: boolean;
  onPayFee: () => { ok: boolean; message: string };
  onGrantLicense: () => void;
  onPayDrivingFee: () => { ok: boolean; message: string };
  onGrantDrivingLicense: () => void;
  onBuyHelmet: () => { ok: boolean; message: string };
  onToggleHelmet: () => void;
  onClose: () => void;
}

type OfficeTab = 'driving' | 'arms';
type ArmsStep = 'overview' | 'quiz' | 'range' | 'approved';
type DrivingStep = 'overview' | 'dl_quiz' | 'dl_track' | 'dl_approved';

interface QuizQuestion {
  prompt: string;
  options: string[];
  correctIdx: number;
  hint: string;
}

const SAFETY_QUESTIONS: QuizQuestion[] = [
  {
    prompt: 'When a Police Officer stops you on foot and asks for your Arms License, what is the lawful response?',
    options: [
      'Open fire immediately to escape the block',
      'Press [E] to show your valid Arms License & holster your weapon',
      'Sprint away while holding your weapon',
    ],
    correctIdx: 1,
    hint: 'Cooperate peacefully: press [E] to present your valid license and holster.',
  },
  {
    prompt: 'What happens if you openly hold or fire a gun on crowded public roads?',
    options: [
      'Nothing happens at all',
      'Citizens record an emergency call and alert local police',
      'You automatically receive a bank bonus',
    ],
    correctIdx: 1,
    hint: 'Bystanders call 100 when they spot public firearm brandishing or gunfire.',
  },
  {
    prompt: 'How should a licensed firearm holder behave around temples, mosques, and public markets?',
    options: [
      'Keep firearms holstered unless acting in authorized police rescue duty',
      'Fire celebratory rounds into the air near stalls',
      'Threaten shopkeepers for discounts',
    ],
    correctIdx: 0,
    hint: 'Keep firearms safely holstered in civic and sacred zones.',
  },
];

const DRIVING_QUESTIONS: QuizQuestion[] = [
  {
    prompt: 'What must a rider or driver do when approaching a RED traffic signal at a city intersection?',
    options: [
      'Speed up to beat cross-traffic',
      'Stop completely behind the white stop line and wait for GREEN',
      'Honk continuously and weave between pedestrians',
    ],
    correctIdx: 1,
    hint: 'Always stop behind the line on RED; jumping red lights attracts traffic whistles & challans.',
  },
  {
    prompt: 'When riding a motorcycle on Bharat roads, why is an ISI-certified helmet mandatory?',
    options: [
      'It prevents ₹500 no-helmet challans and cuts crash injuries by 65%',
      'It is only required at night',
      'It makes the bike go twice as fast',
    ],
    correctIdx: 0,
    hint: 'Wear your ISI helmet ([L]) for 65% crash protection and to avoid ₹500 traffic challans.',
  },
  {
    prompt: 'How should you navigate a Chowk roundabout in India?',
    options: [
      'Cut straight across the central statue island',
      'Slow down, yield to traffic already circling the Chowk, and keep left',
      'Park inside the roundabout circle',
    ],
    correctIdx: 1,
    hint: 'Yield to circulating traffic and steer smoothly around the Chowk island.',
  },
];

interface RangeSlot {
  lane: 0 | 1 | 2;
  kind: 'target' | 'hold_fire';
  id: number;
}

const TRACK_W = 520;
const TRACK_H = 260;
const STOP_LINE_X = 165;
const CHOWK_X = 290;
const CHOWK_Y = 130;
const CHOWK_ISLAND_R = 26;
const PARK_BAY = { x: 432, y: 92, w: 66, h: 76 };
const TRACK_CONES: { x: number; y: number; r: number }[] = [
  { x: 115, y: 68, r: 8 },
  { x: 115, y: 192, r: 8 },
  { x: 222, y: 95, r: 8 },
  { x: 222, y: 165, r: 8 },
  { x: 374, y: 82, r: 8 },
  { x: 374, y: 178, r: 8 },
];

export const LicenseOfficeModal: React.FC<LicenseOfficeModalProps> = ({
  cash,
  hasGunLicense,
  hasDrivingLicense,
  hasHelmet,
  helmetOn,
  onPayFee,
  onGrantLicense,
  onPayDrivingFee,
  onGrantDrivingLicense,
  onBuyHelmet,
  onToggleHelmet,
  onClose,
}) => {
  const [tab, setTab] = useState<OfficeTab>('driving');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<'ok' | 'err'>('ok');

  // Arms License state
  const [armsStep, setArmsStep] = useState<ArmsStep>(hasGunLicense ? 'approved' : 'overview');
  const [qIdx, setQIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [hits, setHits] = useState(0);
  const [shotsFired, setShotsFired] = useState(0);
  const [activeSlot, setActiveSlot] = useState<RangeSlot | null>(null);
  const targetGoal = 5;

  // Driving License state
  const [dlStep, setDlStep] = useState<DrivingStep>(
    hasDrivingLicense ? 'dl_approved' : 'overview',
  );
  const [dlQIdx, setDlQIdx] = useState(0);
  const [dlSelectedOpt, setDlSelectedOpt] = useState<number | null>(null);
  const [trackFouls, setTrackFouls] = useState(0);
  const [trackSignal, setTrackSignal] = useState<'RED' | 'GREEN'>('RED');
  const [trackPassedSignal, setTrackPassedSignal] = useState(false);
  const [trackNote, setTrackNote] = useState('Wait for GREEN signal, circle the Chowk, and park in GREEN BAY!');

  const trackCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackKeysRef = useRef({ up: false, down: false, left: false, right: false });
  const trackStateRef = useRef({
    x: 52,
    y: 130,
    angle: 0,
    speed: 0,
    fouls: 0,
    passedSignal: false,
    signalGreen: false,
    signalTimer: 0,
    foulCooldown: 0,
    done: false,
  });

  useEffect(() => {
    if (hasGunLicense && armsStep === 'overview') setArmsStep('approved');
  }, [hasGunLicense, armsStep]);

  useEffect(() => {
    if (hasDrivingLicense && dlStep === 'overview') setDlStep('dl_approved');
  }, [hasDrivingLicense, dlStep]);

  // Spawn pop-up bullseyes & hold-fire cutouts across 3 lanes during shooting verification
  useEffect(() => {
    if (tab !== 'arms' || armsStep !== 'range') return;
    let nextId = 1;
    const spawnNext = () => {
      const lane = Math.floor(Math.random() * 3) as 0 | 1 | 2;
      const kind: 'target' | 'hold_fire' = Math.random() < 0.24 ? 'hold_fire' : 'target';
      setActiveSlot({ lane, kind, id: nextId++ });
    };
    spawnNext();
    const timer = window.setInterval(spawnNext, 1350);
    return () => window.clearInterval(timer);
  }, [tab, armsStep]);

  const resetTrackRun = useCallback((resetFouls = true) => {
    const s = trackStateRef.current;
    s.x = 52;
    s.y = 130;
    s.angle = 0;
    s.speed = 0;
    s.passedSignal = false;
    s.signalGreen = false;
    s.signalTimer = 0;
    s.foulCooldown = 0.4;
    s.done = false;
    if (resetFouls) {
      s.fouls = 0;
      setTrackFouls(0);
    }
    setTrackPassedSignal(false);
    setTrackSignal('RED');
    setTrackNote('Wait behind stop line until GREEN, avoid cones & Chowk island, park gently in GREEN BAY.');
  }, []);

  // IRL Driving Track 2D Canvas Simulation Loop
  useEffect(() => {
    if (tab !== 'driving' || dlStep !== 'dl_track') return;
    resetTrackRun(true);

    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'KeyW' || e.code === 'ArrowUp') trackKeysRef.current.up = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') trackKeysRef.current.down = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') trackKeysRef.current.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') trackKeysRef.current.right = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') trackKeysRef.current.up = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') trackKeysRef.current.down = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') trackKeysRef.current.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') trackKeysRef.current.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    let rafId = 0;
    let lastTs = performance.now();

    const triggerFoul = (reason: string, pushBack = false) => {
      const s = trackStateRef.current;
      if (s.foulCooldown > 0 || s.done) return;
      s.foulCooldown = 1.0;
      s.fouls += 1;
      setTrackFouls(s.fouls);
      setStatusTone('err');
      setStatusMsg(`${reason} (Foul ${s.fouls}/3)`);
      setTrackNote(reason);
      if (pushBack) {
        s.speed = -25;
      }
      if (s.fouls >= 3) {
        setStatusTone('err');
        setStatusMsg('3 fouls reached! Track restarted — drive carefully.');
        resetTrackRun(true);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      const s = trackStateRef.current;
      const keys = trackKeysRef.current;

      // Traffic light cycle: 2.8s RED -> 4.8s GREEN
      s.signalTimer += dt;
      const cycle = s.signalTimer % 7.6;
      const isGreen = cycle >= 2.8;
      if (isGreen !== s.signalGreen) {
        s.signalGreen = isGreen;
        setTrackSignal(isGreen ? 'GREEN' : 'RED');
      }
      if (s.foulCooldown > 0) s.foulCooldown = Math.max(0, s.foulCooldown - dt);

      if (!s.done) {
        const accel = keys.up ? 150 : keys.down ? -110 : 0;
        if (accel !== 0) {
          s.speed += accel * dt;
        } else {
          s.speed *= Math.pow(0.08, dt);
          if (Math.abs(s.speed) < 2) s.speed = 0;
        }
        s.speed = Math.max(-75, Math.min(135, s.speed));

        const steerDir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
        if (steerDir !== 0 && Math.abs(s.speed) > 4) {
          const turnSign = s.speed >= 0 ? 1 : -1;
          s.angle += steerDir * turnSign * 2.55 * dt;
        }

        const prevX = s.x;
        s.x += Math.cos(s.angle) * s.speed * dt;
        s.y += Math.sin(s.angle) * s.speed * dt;

        // Track outer walls
        if (s.x < 18 || s.x > TRACK_W - 18 || s.y < 20 || s.y > TRACK_H - 20) {
          s.x = Math.max(20, Math.min(TRACK_W - 20, s.x));
          s.y = Math.max(22, Math.min(TRACK_H - 22, s.y));
          triggerFoul('Track boundary curb hit!', true);
        }

        // Red signal stop line check
        if (prevX <= STOP_LINE_X && s.x > STOP_LINE_X && !s.passedSignal) {
          if (!s.signalGreen) {
            s.x = STOP_LINE_X - 10;
            triggerFoul('Red Light Jumped! Wait for GREEN light.', false);
            s.speed = 0;
          } else {
            s.passedSignal = true;
            setTrackPassedSignal(true);
            setStatusTone('ok');
            setStatusMsg('Signal cleared on GREEN! Navigate Chowk & park in the GREEN BAY.');
            setTrackNote('Signal cleared! Circle Chowk safely & park gently inside GREEN BAY.');
          }
        }

        // Chowk island collision
        const dxC = s.x - CHOWK_X;
        const dyC = s.y - CHOWK_Y;
        const dC = Math.hypot(dxC, dyC);
        if (dC < CHOWK_ISLAND_R + 10) {
          const nx = dxC / (dC || 1);
          const ny = dyC / (dC || 1);
          s.x = CHOWK_X + nx * (CHOWK_ISLAND_R + 11);
          s.y = CHOWK_Y + ny * (CHOWK_ISLAND_R + 11);
          triggerFoul('Hit Chowk Roundabout island!', true);
        }

        // Cone collision
        for (const cone of TRACK_CONES) {
          if (Math.hypot(s.x - cone.x, s.y - cone.y) < cone.r + 9) {
            triggerFoul('Knocked a safety cone!', true);
            break;
          }
        }

        // Parking Bay finish detection
        const insideBay =
          s.x >= PARK_BAY.x + 8 &&
          s.x <= PARK_BAY.x + PARK_BAY.w - 8 &&
          s.y >= PARK_BAY.y + 8 &&
          s.y <= PARK_BAY.y + PARK_BAY.h - 8;
        if (insideBay && s.passedSignal && Math.abs(s.speed) < 32) {
          s.done = true;
          setStatusTone('ok');
          setStatusMsg('IRL Driving Practical Test PASSED! Bharat Driving License issued.');
          onGrantDrivingLicense();
          setDlStep('dl_approved');
          return;
        } else if (insideBay && !s.passedSignal) {
          setTrackNote('Pass the GREEN signal line cleanly before parking!');
        } else if (insideBay) {
          setTrackNote('Slow down inside GREEN BAY to complete parking!');
        }
      }

      // Draw 2D RTO Track
      const canvas = trackCanvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#151c29';
        ctx.fillRect(0, 0, TRACK_W, TRACK_H);

        // Asphalt lanes
        ctx.fillStyle = '#232d3f';
        ctx.fillRect(16, 22, TRACK_W - 32, TRACK_H - 44);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(16, 22, TRACK_W - 32, TRACK_H - 44);

        // Lane markings
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.moveTo(24, TRACK_H / 2);
        ctx.lineTo(CHOWK_X - 58, TRACK_H / 2);
        ctx.moveTo(CHOWK_X + 58, TRACK_H / 2);
        ctx.lineTo(PARK_BAY.x, TRACK_H / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Stop line + Traffic Signal
        ctx.strokeStyle = s.signalGreen ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(STOP_LINE_X, 26);
        ctx.lineTo(STOP_LINE_X, TRACK_H - 26);
        ctx.stroke();

        ctx.fillStyle = '#0b0e14';
        ctx.fillRect(STOP_LINE_X - 11, 6, 22, 26);
        ctx.fillStyle = s.signalGreen ? '#22c55e' : '#ef4444';
        ctx.beginPath();
        ctx.arc(STOP_LINE_X, 19, 6.5, 0, Math.PI * 2);
        ctx.fill();

        // Chowk roundabout island
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(CHOWK_X, CHOWK_Y, 56, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#1f4e37';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(CHOWK_X, CHOWK_Y, CHOWK_ISLAND_R, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fef3c7';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('CHOWK', CHOWK_X, CHOWK_Y);

        // Cones
        for (const cone of TRACK_CONES) {
          ctx.fillStyle = '#f97316';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cone.x, cone.y, cone.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Green Parking Bay
        ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.fillRect(PARK_BAY.x, PARK_BAY.y, PARK_BAY.w, PARK_BAY.h);
        ctx.strokeRect(PARK_BAY.x, PARK_BAY.y, PARK_BAY.w, PARK_BAY.h);
        ctx.fillStyle = '#a7f3d0';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('PARK', PARK_BAY.x + PARK_BAY.w / 2, PARK_BAY.y + PARK_BAY.h / 2 - 6);
        ctx.fillText('BAY', PARK_BAY.x + PARK_BAY.w / 2, PARK_BAY.y + PARK_BAY.h / 2 + 7);

        // Start label
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('START', 44, 42);

        // Player test vehicle
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#0b0e14';
        ctx.lineWidth = 2;
        ctx.fillRect(-13, -8, 26, 16);
        ctx.strokeRect(-13, -8, 26, 16);
        // Windshield / front indicator
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(4, -5.5, 6, 11);
        ctx.restore();
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      trackKeysRef.current = { up: false, down: false, left: false, right: false };
    };
  }, [tab, dlStep, onGrantDrivingLicense, resetTrackRun]);

  // Arms License Handlers
  const handleStartArmsApplication = () => {
    const res = onPayFee();
    if (!res.ok) {
      setStatusTone('err');
      setStatusMsg(res.message);
      return;
    }
    setStatusTone('ok');
    setStatusMsg(null);
    setQIdx(0);
    setSelectedOpt(null);
    setArmsStep('quiz');
  };

  const handleArmsAnswerSelect = (idx: number) => {
    setSelectedOpt(idx);
    const current = SAFETY_QUESTIONS[qIdx];
    if (idx === current.correctIdx) {
      setStatusTone('ok');
      setStatusMsg('Sahi jawab! Verified.');
    } else {
      setStatusTone('err');
      setStatusMsg(current.hint);
    }
  };

  const handleArmsNextQuestion = () => {
    const current = SAFETY_QUESTIONS[qIdx];
    if (selectedOpt !== current.correctIdx) {
      setStatusTone('err');
      setStatusMsg(current.hint);
      return;
    }
    setStatusMsg(null);
    if (qIdx + 1 < SAFETY_QUESTIONS.length) {
      setQIdx(qIdx + 1);
      setSelectedOpt(null);
    } else {
      setHits(0);
      setShotsFired(0);
      setArmsStep('range');
    }
  };

  const handleShootLane = (lane: 0 | 1 | 2) => {
    if (armsStep !== 'range') return;
    setShotsFired((s) => s + 1);
    if (!activeSlot || activeSlot.lane !== lane) {
      setStatusTone('err');
      setStatusMsg('Miss! Wait for the red bullseye in that lane.');
      return;
    }
    if (activeSlot.kind === 'hold_fire') {
      setHits((h) => Math.max(0, h - 1));
      setStatusTone('err');
      setStatusMsg('HOLD FIRE! Do not shoot civilian safety cutouts (-1 point).');
      setActiveSlot(null);
      return;
    }

    const nextHits = hits + 1;
    setHits(nextHits);
    setActiveSlot(null);
    if (nextHits >= targetGoal) {
      setStatusTone('ok');
      setStatusMsg('Range verification passed!');
      onGrantLicense();
      setArmsStep('approved');
    } else {
      setStatusTone('ok');
      setStatusMsg(`Direct Hit! (${nextHits}/${targetGoal})`);
    }
  };

  // Driving License Handlers
  const handleStartDrivingApplication = () => {
    const res = onPayDrivingFee();
    if (!res.ok) {
      setStatusTone('err');
      setStatusMsg(res.message);
      return;
    }
    setStatusTone('ok');
    setStatusMsg('Driving License fee paid! Complete the 3 RTO Traffic Rules questions.');
    setDlQIdx(0);
    setDlSelectedOpt(null);
    setDlStep('dl_quiz');
  };

  const handleDlAnswerSelect = (idx: number) => {
    setDlSelectedOpt(idx);
    const current = DRIVING_QUESTIONS[dlQIdx];
    if (idx === current.correctIdx) {
      setStatusTone('ok');
      setStatusMsg('Shabash! Correct Indian Traffic Rule.');
    } else {
      setStatusTone('err');
      setStatusMsg(current.hint);
    }
  };

  const handleDlNextQuestion = () => {
    const current = DRIVING_QUESTIONS[dlQIdx];
    if (dlSelectedOpt !== current.correctIdx) {
      setStatusTone('err');
      setStatusMsg(current.hint);
      return;
    }
    setStatusMsg(null);
    if (dlQIdx + 1 < DRIVING_QUESTIONS.length) {
      setDlQIdx(dlQIdx + 1);
      setDlSelectedOpt(null);
    } else {
      setDlStep('dl_track');
    }
  };

  const handlePurchaseHelmet = () => {
    const res = onBuyHelmet();
    setStatusTone(res.ok ? 'ok' : 'err');
    setStatusMsg(res.message);
  };

  const currentArmsQuestion = SAFETY_QUESTIONS[qIdx];
  const currentDlQuestion = DRIVING_QUESTIONS[dlQIdx];

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#070A10]/85 p-4 pointer-events-auto">
      <div className="w-full max-w-2xl bg-[#101520] border border-purple-500/50 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0B0E14] border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-display text-base font-bold tracking-wider text-slate-100">
                DM &amp; RTO LICENSING OFFICE
              </h2>
              <p className="text-[11px] font-mono-num text-slate-400">
                District Magistrate &amp; Transport Authority · DL, ISI Helmet &amp; Arms Permits
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono-num font-bold text-emerald-400">
              {formatRs(cash)}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Licensing Office"
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Service Tabs */}
        <div className="grid grid-cols-2 bg-[#0D111A] border-b border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => {
              setTab('driving');
              setStatusMsg(null);
            }}
            className={`py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-display font-bold tracking-wider border-b-2 transition-colors cursor-pointer ${
              tab === 'driving'
                ? 'border-amber-400 bg-[#141C2B] text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>DRIVING LICENSE &amp; HELMET</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('arms');
              setStatusMsg(null);
            }}
            className={`py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-display font-bold tracking-wider border-b-2 transition-colors cursor-pointer ${
              tab === 'arms'
                ? 'border-purple-400 bg-[#141C2B] text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>ARMS LICENSE</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {statusMsg && (
            <div
              className={`px-3.5 py-2 border text-xs font-medium flex items-center gap-2 ${
                statusTone === 'ok'
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                  : 'bg-red-950/60 border-red-500/60 text-red-200'
              }`}
            >
              {statusTone === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{statusMsg}</span>
            </div>
          )}

          {/* TAB 1: DRIVING LICENSE & ISI HELMET */}
          {tab === 'driving' && (
            <div className="space-y-4">
              {/* ISI Motorcycle Helmet Counter */}
              <div className="p-3.5 bg-[#0B0E14] border border-amber-500/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-amber-500/15 border border-amber-400/50 flex items-center justify-center shrink-0">
                    <HardHat className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-display font-bold text-slate-100">
                        ISI CERTIFIED MOTORCYCLE HELMET
                      </span>
                      {hasHelmet && (
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-mono-num font-bold border ${
                            helmetOn
                              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                              : 'bg-slate-900 border-slate-600 text-slate-300'
                          }`}
                        >
                          {helmetOn ? 'WORN (ON)' : 'STORED (OFF)'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Cuts bike crash damage by 65% &amp; avoids {formatRs(NO_HELMET_FINE_INR)} Traffic Police challans. Press [L] anytime.
                    </p>
                  </div>
                </div>
                {!hasHelmet ? (
                  <button
                    type="button"
                    onClick={handlePurchaseHelmet}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-[#0B0E14] font-display text-xs font-bold tracking-wider uppercase cursor-pointer shrink-0"
                  >
                    Buy Helmet ({formatRs(HELMET_PRICE_INR)})
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onToggleHelmet}
                    className={`px-3.5 py-2 font-display text-xs font-bold tracking-wider uppercase border cursor-pointer shrink-0 ${
                      helmetOn
                        ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
                        : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white'
                    }`}
                  >
                    {helmetOn ? 'Take Off (L)' : 'Wear Helmet (L)'}
                  </button>
                )}
              </div>

              {/* DL Stepper */}
              {dlStep !== 'dl_approved' && (
                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono-num">
                  {[
                    { key: 'overview', label: '1. RTO FEE' },
                    { key: 'dl_quiz', label: '2. TRAFFIC RULES' },
                    { key: 'dl_track', label: '3. IRL TRACK TEST' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className={`px-2.5 py-1.5 text-center border font-semibold ${
                        dlStep === item.key
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-[#0B0E14] border-slate-800 text-slate-500'
                      }`}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              )}

              {dlStep === 'overview' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0B0E14] border border-slate-700/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono-num font-bold text-slate-400">
                        DRIVING LICENSE STATUS
                      </span>
                      <span className="px-2 py-0.5 bg-red-950/80 border border-red-500/50 text-[11px] font-mono-num font-bold text-red-300">
                        NO DL
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      Driving cars, auto-rickshaws, or bikes past a Traffic Officer without a valid{' '}
                      <strong className="text-amber-300">Bharat Driving License (2W + LMV)</strong>{' '}
                      draws an on-the-spot {formatRs(NO_DL_FINE_INR)} challan. Pass the RTO traffic
                      theory quiz and complete the live IRL driving track test to earn your smart DL.
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                      <div className="p-2.5 bg-[#121826] border border-slate-800">
                        <div className="text-[10px] font-mono-num text-slate-400">RTO TEST FEE</div>
                        <div className="font-mono-num text-base font-bold text-amber-400">
                          {formatRs(DRIVING_LICENSE_FEE_INR)}
                        </div>
                      </div>
                      <div className="p-2.5 bg-[#121826] border border-slate-800">
                        <div className="text-[10px] font-mono-num text-slate-400">PRACTICAL EXAM</div>
                        <div className="font-semibold text-slate-100 mt-0.5">
                          Signal + Chowk + Parking
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartDrivingApplication}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-[#0B0E14] font-display text-sm font-bold tracking-wider uppercase cursor-pointer transition-colors"
                  >
                    Pay {formatRs(DRIVING_LICENSE_FEE_INR)} &amp; Start RTO Driving Test
                  </button>
                </div>
              )}

              {dlStep === 'dl_quiz' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0B0E14] border border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono-num text-amber-400">
                      <span className="flex items-center gap-1.5 font-bold">
                        <FileCheck2 className="w-4 h-4" />
                        TRAFFIC RULE {dlQIdx + 1} / {DRIVING_QUESTIONS.length}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-100 leading-snug">
                      {currentDlQuestion.prompt}
                    </p>
                    <div className="space-y-2 pt-1">
                      {currentDlQuestion.options.map((opt, idx) => {
                        const isPicked = dlSelectedOpt === idx;
                        const isRight = idx === currentDlQuestion.correctIdx;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleDlAnswerSelect(idx)}
                            className={`w-full text-left px-3.5 py-2.5 border text-xs font-medium transition-colors cursor-pointer ${
                              isPicked
                                ? isRight
                                  ? 'bg-emerald-950/70 border-emerald-400 text-emerald-100'
                                  : 'bg-red-950/70 border-red-400 text-red-100'
                                : 'bg-[#121826] hover:bg-[#192235] border-slate-700/80 text-slate-200'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDlNextQuestion}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-[#0B0E14] font-display text-xs font-bold tracking-wider uppercase cursor-pointer"
                  >
                    {dlQIdx + 1 < DRIVING_QUESTIONS.length
                      ? 'Next Rule Question'
                      : 'Enter IRL Driving Track Test'}
                  </button>
                </div>
              )}

              {dlStep === 'dl_track' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#0B0E14] border border-slate-800 text-[11px] font-mono-num">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 font-bold ${
                          trackSignal === 'GREEN'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        SIGNAL: {trackSignal}
                      </span>
                      <span className={trackPassedSignal ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                        {trackPassedSignal ? 'LINE CLEARED' : 'STOP AT LINE'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={trackFouls > 0 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                        FOULS {trackFouls}/3
                      </span>
                      <button
                        type="button"
                        onClick={() => resetTrackRun(true)}
                        className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

                  <canvas
                    ref={trackCanvasRef}
                    width={TRACK_W}
                    height={TRACK_H}
                    className="w-full h-auto border-2 border-slate-700/80 bg-[#151c29] block"
                  />

                  <div className="text-[11px] font-mono-num text-amber-300 bg-[#0B0E14] border border-slate-800 px-3 py-1.5">
                    {trackNote}
                  </div>

                  {/* Keyboard + Touch Steering Controls for Driving Track */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] font-mono-num text-slate-400">
                      Drive with WASD / Arrow Keys or Hold Buttons:
                    </span>
                    <div className="flex items-center gap-1.5 select-none">
                      {[
                        { label: 'LEFT', key: 'left' as const },
                        { label: 'FWD', key: 'up' as const },
                        { label: 'REV', key: 'down' as const },
                        { label: 'RIGHT', key: 'right' as const },
                      ].map((btn) => (
                        <button
                          key={btn.key}
                          type="button"
                          onMouseDown={() => {
                            trackKeysRef.current[btn.key] = true;
                          }}
                          onMouseUp={() => {
                            trackKeysRef.current[btn.key] = false;
                          }}
                          onMouseLeave={() => {
                            trackKeysRef.current[btn.key] = false;
                          }}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            trackKeysRef.current[btn.key] = true;
                          }}
                          onTouchEnd={() => {
                            trackKeysRef.current[btn.key] = false;
                          }}
                          className="px-3 py-1.5 bg-[#161e2e] hover:bg-[#1f2a40] active:bg-amber-500 active:text-[#0B0E14] border border-slate-600 text-[11px] font-mono-num font-bold text-slate-100 cursor-pointer"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {dlStep === 'dl_approved' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-[#0e2620] to-[#0B0E14] border-2 border-emerald-400/80 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-300 font-display font-bold text-sm tracking-wider">
                        <Award className="w-5 h-5" />
                        <span>BHARAT DRIVING LICENSE · ACTIVE</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-500 text-[#0B0E14] text-[10px] font-mono-num font-bold">
                        2W + LMV VALID
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono-num pt-1">
                      <div>
                        <div className="text-[10px] text-slate-400">DL NUMBER</div>
                        <div className="text-slate-100 font-bold">RTO-IND-LMV-2W-0942</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">AUTHORITY</div>
                        <div className="text-slate-100 font-bold">District Magistrate / RTO</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed border-t border-emerald-500/30 pt-2.5">
                      You are legally certified to drive cars, auto-rickshaws, and motorcycles across
                      Bharat City. Remember to wear your ISI Helmet ([L]) on 2-wheelers!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#0B0E14] font-display text-xs font-bold tracking-wider uppercase cursor-pointer"
                  >
                    Done &amp; Return to City
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ARMS LICENSE */}
          {tab === 'arms' && (
            <div className="space-y-4">
              {armsStep !== 'approved' && (
                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono-num">
                  {[
                    { key: 'overview', label: '1. FEE & FORM' },
                    { key: 'quiz', label: '2. SAFETY CHECK' },
                    { key: 'range', label: '3. RANGE TEST' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className={`px-2.5 py-1.5 text-center border font-semibold ${
                        armsStep === item.key
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-[#0B0E14] border-slate-800 text-slate-500'
                      }`}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              )}

              {armsStep === 'overview' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0B0E14] border border-slate-700/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono-num font-bold text-slate-400">
                        CURRENT STATUS
                      </span>
                      <span className="px-2 py-0.5 bg-red-950/80 border border-red-500/50 text-[11px] font-mono-num font-bold text-red-300">
                        UNLICENSED
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      Holding or firing a weapon in public without a valid{' '}
                      <strong className="text-amber-300">Bharat Arms License</strong> will fail Police
                      inspection and trigger a 1-Star Beat Police response. Complete the safety check
                      and target verification to obtain your civic permit.
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                      <div className="p-2.5 bg-[#121826] border border-slate-800">
                        <div className="text-[10px] font-mono-num text-slate-400">STATUTORY FEE</div>
                        <div className="font-mono-num text-base font-bold text-amber-400">
                          {formatRs(GUN_LICENSE_FEE_INR)}
                        </div>
                      </div>
                      <div className="p-2.5 bg-[#121826] border border-slate-800">
                        <div className="text-[10px] font-mono-num text-slate-400">TESTS REQUIRED</div>
                        <div className="font-semibold text-slate-100 mt-0.5">
                          3 Safety Rules + 5 Targets
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartArmsApplication}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-[#0B0E14] font-display text-sm font-bold tracking-wider uppercase cursor-pointer transition-colors"
                  >
                    Pay {formatRs(GUN_LICENSE_FEE_INR)} &amp; Begin Verification
                  </button>
                </div>
              )}

              {armsStep === 'quiz' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0B0E14] border border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono-num text-amber-400">
                      <span className="flex items-center gap-1.5 font-bold">
                        <FileCheck2 className="w-4 h-4" />
                        RULE QUESTION {qIdx + 1} / {SAFETY_QUESTIONS.length}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-100 leading-snug">
                      {currentArmsQuestion.prompt}
                    </p>
                    <div className="space-y-2 pt-1">
                      {currentArmsQuestion.options.map((opt, idx) => {
                        const isPicked = selectedOpt === idx;
                        const isRight = idx === currentArmsQuestion.correctIdx;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleArmsAnswerSelect(idx)}
                            className={`w-full text-left px-3.5 py-2.5 border text-xs font-medium transition-colors cursor-pointer ${
                              isPicked
                                ? isRight
                                  ? 'bg-emerald-950/70 border-emerald-400 text-emerald-100'
                                  : 'bg-red-950/70 border-red-400 text-red-100'
                                : 'bg-[#121826] hover:bg-[#192235] border-slate-700/80 text-slate-200'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleArmsNextQuestion}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-[#0B0E14] font-display text-xs font-bold tracking-wider uppercase cursor-pointer"
                  >
                    {qIdx + 1 < SAFETY_QUESTIONS.length
                      ? 'Next Question'
                      : 'Proceed to Shooting Verification Range'}
                  </button>
                </div>
              )}

              {armsStep === 'range' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-3 py-2 bg-[#0B0E14] border border-slate-800 text-xs font-mono-num">
                    <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                      <Crosshair className="w-4 h-4" />
                      HIT {targetGoal} RED BULLSEYES ({hits}/{targetGoal})
                    </span>
                    <span className="text-slate-400">SHOTS {shotsFired}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((laneIdx) => {
                      const lane = laneIdx as 0 | 1 | 2;
                      const slot = activeSlot?.lane === lane ? activeSlot : null;
                      return (
                        <button
                          key={lane}
                          type="button"
                          onClick={() => handleShootLane(lane)}
                          className="h-44 bg-[#0B0E14] hover:bg-[#131a29] border-2 border-slate-700/90 hover:border-amber-400/70 flex flex-col items-center justify-between p-3 cursor-crosshair transition-colors"
                        >
                          <span className="text-[10px] font-mono-num text-slate-500">
                            LANE {lane + 1}
                          </span>
                          {slot ? (
                            slot.kind === 'target' ? (
                              <div className="flex flex-col items-center gap-1.5">
                                <div className="w-16 h-16 rounded-full bg-red-600/25 border-4 border-red-500 flex items-center justify-center shadow-[0_0_16px_rgba(239,68,68,0.45)]">
                                  <Target className="w-8 h-8 text-red-400" />
                                </div>
                                <span className="text-[10px] font-mono-num font-bold text-red-300">
                                  FIRE TARGET!
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1.5">
                                <div className="w-16 h-16 rounded-full bg-sky-600/25 border-4 border-sky-400 flex items-center justify-center">
                                  <ShieldCheck className="w-8 h-8 text-sky-300" />
                                </div>
                                <span className="text-[10px] font-mono-num font-bold text-sky-300">
                                  HOLD FIRE!
                                </span>
                              </div>
                            )
                          ) : (
                            <div className="text-[11px] font-mono-num text-slate-600">READY...</div>
                          )}
                          <span className="text-[10px] font-mono-num text-slate-500">CLICK TO FIRE</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="w-full h-2 bg-slate-900 border border-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-150"
                      style={{ width: `${Math.min(100, (hits / targetGoal) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {armsStep === 'approved' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-[#0e2620] to-[#0B0E14] border-2 border-emerald-400/80 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-300 font-display font-bold text-sm tracking-wider">
                        <Award className="w-5 h-5" />
                        <span>BHARAT ARMS LICENSE · ACTIVE</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-500 text-[#0B0E14] text-[10px] font-mono-num font-bold">
                        VALID PERMIT
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono-num pt-1">
                      <div>
                        <div className="text-[10px] text-slate-400">PERMIT ID</div>
                        <div className="text-slate-100 font-bold">DM-IND-2025-0481</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">AUTHORITY</div>
                        <div className="text-slate-100 font-bold">District Magistrate</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed border-t border-emerald-500/30 pt-2.5">
                      When a Beat Police Officer asks for your license, press{' '}
                      <strong className="text-amber-300">[E] Show License &amp; Holster</strong> to pass
                      inspection peacefully with a warning instead of triggering Wanted Stars.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#0B0E14] font-display text-xs font-bold tracking-wider uppercase cursor-pointer"
                  >
                    Done &amp; Return to City
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
