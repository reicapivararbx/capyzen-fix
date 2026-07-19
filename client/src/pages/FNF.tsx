import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import {
  generateChart,
  createInitialState,
  processKeyPress,
  processKeyRelease,
  processSongTick,
  getAccuracy,
  getRatingLetter,
} from '@/features/fnf/engine';
import type {
  Chart,
  EngineState,
  Lane,
  EngineEvent,
  Difficulty,
} from '@/features/fnf/engine';
import { loadGameState, updateGameState } from '@/lib/game-save';

const SONG_NAMES = [
  'Tropical Dawn',
  'Pixel Storm',
  'Neon Nights',
  'Crystal Cave',
  'Crimson Typhoon',
  'Electric Shock',
  'Deep Blue',
  'Moonlight',
  'Hyper Drive',
  'Sunset Groove',
];

const LANE_COLORS: string[] = ['#c24bf0', '#00a3ff', '#36c44a', '#ff4a52', '#ffaa00'];

const LANE_DIRECTIONS: string[] = ['←', '↓', '↑', '→', '★'];

const OPP_LANE_COLORS: string[] = ['#a64bd0', '#0077cc', '#2a9c3e', '#cc404a', '#cc8800'];

function computeLeadIn(bpm: number): number {
  return Math.round((60_000 / bpm) * 4);
}

function computeNoteY(
  noteTimeMs: number,
  songPositionMs: number,
  receptorY: number,
  topY: number,
  leadInMs: number,
): number {
  const diff = noteTimeMs - songPositionMs;
  if (diff > leadInMs) return topY - 100;
  const t = 1 - diff / leadInMs;
  return topY + t * (receptorY - topY);
}

class AudioManager {
  private ctx: AudioContext | null = null;
  private ready = false;
  private buffers: Record<string, AudioBuffer> = {};
  private loaded = false;

  private static SFX = {
    hit: `${import.meta.env.BASE_URL}sfx/gunshot.mp3`,
    fah: `${import.meta.env.BASE_URL}sfx/fah.mp3`,
    death: `${import.meta.env.BASE_URL}sfx/fnf-lost-sfx.mp3`,
    intro3: `${import.meta.env.BASE_URL}sfx/intro3.mp3`,
    intro2: `${import.meta.env.BASE_URL}sfx/intro2.mp3`,
    intro1: `${import.meta.env.BASE_URL}sfx/intro1.mp3`,
    introgo: `${import.meta.env.BASE_URL}sfx/introgo.mp3`,
  } as const;

  init(): void {
    if (this.ctx) return;
    try {
      this.ctx = new AudioContext();
      void this.loadAll();
    } catch {
      /* no audio available */
    }
  }

  private async loadAll(): Promise<void> {
    if (!this.ctx) return;
    const ctx = this.ctx;
    for (const [key, url] of Object.entries(AudioManager.SFX)) {
      try {
        const resp = await fetch(url);
        const arrayBuf = await resp.arrayBuffer();
        this.buffers[key] = await ctx.decodeAudioData(arrayBuf);
      } catch {
        /* ignore */
      }
    }
    this.loaded = true;
  }

  private play(name: string, vol = 1): void {
    if (!this.ctx) return;
    const buf = this.buffers[name];
    if (!buf) return;
    try {
      const src = this.ctx.createBufferSource();
      const gain = this.ctx.createGain();
      src.buffer = buf;
      gain.gain.value = vol;
      src.connect(gain);
      gain.connect(this.ctx.destination);
      src.start(0);
    } catch {
      /* ignore */
    }
  }

  resume(): void {
    if (this.ready || !this.ctx) return;
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    this.ready = true;
  }

  hit(): void {
    this.play('hit', 0.6);
  }

  fah(): void {
    this.play('fah', 0.8);
  }

  countdown(step: number): void {
    const key = step === 3 ? 'intro3' : step === 2 ? 'intro2' : step === 1 ? 'intro1' : 'introgo';
    this.play(key, 1);
  }

  go(): void {
    this.play('introgo', 1);
  }

  fanfare(): void {
    /* victory — keep as fallback */
    this.play('introgo', 0.5);
  }
}

const JUDGMENT_COLORS: Record<string, string> = {
  perfect: '#fbbf24',
  good: '#60a5fa',
  miss: '#ef4444',
};

interface Popup {
  id: number;
  text: string;
  x: number;
  y: number;
  life: number;
  color: string;
}

type Screen = 'song_select' | 'countdown' | 'playing' | 'result';

export default function FNF() {
  const [screen, setScreen] = useState<Screen>('song_select');
  const [selectedSong, setSelectedSong] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [botplay, setBotplay] = useState(false);
  const [songsCleared, setSongsCleared] = useState<boolean[]>(() => {
    try {
      const s = loadGameState();
      return SONG_NAMES.map((_, i) => s.fnfSongsCompleted > i);
    } catch {
      return SONG_NAMES.map(() => false);
    }
  });
  const [countdownValue, setCountdownValue] = useState<number | 'GO' | null>(
    null,
  );
  const [displayScore, setDisplayScore] = useState(0);
  const [displayCombo, setDisplayCombo] = useState(0);
  const [displayHealth, setDisplayHealth] = useState(100);
  const [dying, setDying] = useState(false);
  const [gameResult, setGameResult] = useState<{
    score: number;
    maxCombo: number;
    passed: boolean;
    millionReward: boolean;
    accuracy: number;
    ratingLetter: string;
    difficulty: Difficulty;
    botplay: boolean;
  } | null>(null);
  const [inputMode, setInputMode] = useState<'keyboard' | 'touch'>('keyboard');

  const engineRef = useRef<EngineState>(createInitialState());
  const chartRef = useRef<Chart>(generateChart(0));
  const audioRef = useRef<AudioManager>(new AudioManager());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const lastFrameRef = useRef(0);
  const popupsRef = useRef<Popup[]>([]);
  const popupIdRef = useRef(0);
  const displayScoreRef = useRef(0);
  const displayComboRef = useRef(0);
  const displayHealthRef = useRef(100);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const pressedLanesRef = useRef<Set<Lane>>(new Set());
  const leadInMsRef = useRef(2000);
  const oppHitLanesRef = useRef<number[]>([0, 0, 0, 0, 0]);
  const oppHitSetRef = useRef<Set<number>>(new Set());
  const splashRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string; life: number; star?: boolean }[]>([]);

  useEffect(() => {
    audioRef.current.init();
  }, []);

  const addPopup = useCallback(
    (text: string, lane: Lane, canvasWidth: number, receptorY: number) => {
      const laneCount = chartRef.current.laneCount;
      const laneW = Math.min((canvasWidth - 80) / laneCount, 120);
      const total = laneW * laneCount + (laneCount - 1) * 3;
      const sx = (canvasWidth - total) / 2;
      const x = sx + lane * (laneW + 3) + laneW / 2;
      const color = JUDGMENT_COLORS[text] ?? '#ffffff';
      popupsRef.current.push({
        id: popupIdRef.current++,
        text: text === 'perfect' ? 'PERFEITO' : text === 'good' ? 'BOM' : text === 'miss' ? 'ERROU' : 'HOLD',
        x,
        y: receptorY - 30,
        life: 1,
        color,
      });
    },
    [],
  );

  const addSplash = useCallback(
    (lane: Lane, canvasWidth: number, receptorY: number) => {
      const laneCount = chartRef.current.laneCount;
      const laneW = Math.min((canvasWidth - 140) / (laneCount * 2), 70);
      const laneGap = 3;
      const setGap = 50;
      const oppSetW = laneW * laneCount + laneGap * (laneCount - 1);
      const playerStartX = (canvasWidth - (oppSetW * 2 + setGap)) / 2 + oppSetW + setGap;
      const px = playerStartX + lane * (laneW + laneGap) + laneW / 2;
      const color = LANE_COLORS[lane];
      for (let i = 0; i < 10; i++) {
        const ang = (Math.PI * 2 * i) / 10 + Math.random() * 0.3;
        const spd = 2 + Math.random() * 3;
        splashRef.current.push({ x: px, y: receptorY, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 1, color, life: 1 });
      }
      for (let i = 0; i < 3; i++) {
        const ang = (Math.PI * 2 * i) / 3 + Math.random() * 0.5;
        const spd = 3 + Math.random() * 3;
        splashRef.current.push({ x: px, y: receptorY, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 1, color: '#ffffff', life: 0.8, star: true });
      }
    },
    [],
  );

  const handleSongClear = useCallback(
    (state: EngineState) => {
      const passed = state.health > 0;
      const score = state.score;
      const maxCombo = state.maxCombo;
      const accuracy = getAccuracy(state);
      const ratingLetter = getRatingLetter(accuracy);
      let millionReward = false;
      
      // Don't save botplay scores to game state
      if (!botplay) {
        const saved = loadGameState();
        const completed = !passed
          ? saved.fnfSongsCompleted
          : Math.max(saved.fnfSongsCompleted, selectedSong + 1);
        const bestCombo = Math.max(saved.fnfHighestCombo, maxCombo);
        const coinsAdd = Math.floor(score / 10);
        let finalCoins = saved.coins + coinsAdd;
        if (completed >= 5 && !saved.millionRewardClaimed) {
          finalCoins += 1_000_000;
          millionReward = true;
        }
        updateGameState({
          fnfSongsCompleted: completed,
          fnfHighestCombo: bestCombo,
          coins: finalCoins,
          millionRewardClaimed: saved.millionRewardClaimed || millionReward,
        });
        setSongsCleared(SONG_NAMES.map((_, i) => completed > i));
      }
      
      if (passed) {
        audioRef.current.fanfare();
      }
      setGameResult({ score, maxCombo, passed, millionReward, accuracy, ratingLetter, difficulty, botplay });
      setScreen('result');
    },
    [selectedSong, difficulty, botplay],
  );

  const handleEngineEvent = useCallback(
    (event: EngineEvent, chart: Chart) => {
      const audio = audioRef.current;
      const canvas = canvasRef.current;
      const cw = canvas?.width ?? 800;
      const receptorY = (canvas?.height ?? 600) - 80;
      switch (event.type) {
        case 'note_hit': {
          if (event.judgment && event.noteIndex !== undefined) {
            const note = chart.notes[event.noteIndex];
            audio.hit();
            addPopup(event.judgment, note.lane, cw, receptorY);
            addSplash(note.lane, cw, receptorY);
          }
          break;
        }
        case 'note_miss': {
          audio.fah();
          if (event.noteIndex !== undefined) {
            const note = chart.notes[event.noteIndex];
            addPopup('miss', note.lane, cw, receptorY);
          }
          break;
        }
        case 'hold_complete': {
          if (event.noteIndex !== undefined) {
            const note = chart.notes[event.noteIndex];
            addPopup('good', note.lane, cw, receptorY);
          }
          break;
        }
        case 'hold_dropped': {
          audio.fah();
          if (event.noteIndex !== undefined) {
            const note = chart.notes[event.noteIndex];
            addPopup('miss', note.lane, cw, receptorY);
          }
          break;
        }
        case 'death': {
          setDying(true);
          setTimeout(() => {
            handleSongClear(engineRef.current);
          }, 2000);
          break;
        }
        case 'song_end': {
          handleSongClear(engineRef.current);
          break;
        }
      }
    },
    [addPopup, addSplash, handleSongClear],
  );

  const tick = useCallback(
    (chart: Chart, dt: number) => {
      const engine = engineRef.current;
      if (engine.songEnded) return;
      
      // Botplay: auto-hit notes at perfect timing
      if (botplay) {
        for (let i = 0; i < chart.notes.length; i++) {
          if (engine.noteResults.some((r) => r.noteIndex === i)) continue;
          const note = chart.notes[i];
          const diff = Math.abs(engine.songPositionMs - note.timeMs);
          if (diff <= 5) {
            const result = processKeyPress(engine, note.lane, engine.songPositionMs, chart);
            engineRef.current = result.state;
            for (const ev of result.events) {
              handleEngineEvent(ev, chart);
            }
          }
        }
      }
      
      const result = processSongTick(engineRef.current, dt, chart);
      engineRef.current = result.state;
      for (const ev of result.events) {
        handleEngineEvent(ev, chart);
      }
    },
    [handleEngineEvent, botplay],
  );

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const container = containerRef.current;
    if (!container) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    const state = engineRef.current;
    const chart = chartRef.current;
    const receptorY = h - 80;
    const topY = 0;
    const laneCount = chart.laneCount;
    const laneW = Math.min((w - 140) / (laneCount * 2), 70);
    const laneGap = 3;
    const setGap = 50;
    const oppSetW = laneW * laneCount + laneGap * (laneCount - 1);
    const playerSetW = oppSetW;
    const totalW = oppSetW + setGap + playerSetW;
    const startX = (w - totalW) / 2;
    const oppStartX = startX;
    const playerStartX = startX + oppSetW + setGap;
    const now = performance.now();

    const drawLaneSet = (
      startXOffset: number,
      isOpponent: boolean,
      flashLane: (i: number) => boolean,
    ) => {
      for (let i = 0; i < laneCount; i++) {
        const x = startXOffset + i * (laneW + laneGap);
        const color = isOpponent ? OPP_LANE_COLORS[i] : LANE_COLORS[i];
        const isPressed = isOpponent
          ? false
          : pressedLanesRef.current.has(i as Lane);
        const isFlashing = flashLane(i);
        const active = isPressed || isFlashing;
        ctx.fillStyle = color + (active ? '25' : '15');
        ctx.fillRect(x, 0, laneW, h);
        ctx.strokeStyle = color + '40';
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.strokeRect(x, 0, laneW, h);
        const bounceScale = active ? 1 + 0.15 * Math.abs(Math.sin(now * 0.008)) : 1;
        const receptorScale = bounceScale;
        const rw = laneW * receptorScale;
        const rh = 50 * receptorScale;
        const rx = x + (laneW - rw) / 2;
        const ry = receptorY - rh / 2;
        ctx.fillStyle = active ? color + 'cc' : color + '80';
        ctx.beginPath();
        ctx.roundRect(rx, ry, rw, rh, 6);
        ctx.fill();
        ctx.strokeStyle = active ? '#ffffff' : color;
        ctx.lineWidth = active ? 3 : 2;
        ctx.beginPath();
        ctx.roundRect(rx, ry, rw, rh, 6);
        ctx.stroke();
        drawArrow(ctx, x + laneW / 2, receptorY, i, color, active ? 1 : 0.7);
      }
    };

    drawLaneSet(oppStartX, true, (i) => now - oppHitLanesRef.current[i] < 150);
    drawLaneSet(playerStartX, false, () => false);

    const oppHitSet = oppHitSetRef.current;
    for (let i = 0; i < chart.oppNotes.length; i++) {
      const note = chart.oppNotes[i];
      const headY = computeNoteY(note.timeMs, state.songPositionMs, receptorY, topY, leadInMsRef.current);
      if (headY < -100 || headY > h + 100) continue;
      const x = oppStartX + note.lane * (laneW + laneGap);
      const color = OPP_LANE_COLORS[note.lane];
      // auto-flash when note crosses receptor
      if (note.timeMs <= state.songPositionMs + 16 && note.timeMs > state.songPositionMs - 80 && !oppHitSet.has(i)) {
        oppHitSet.add(i);
        oppHitLanesRef.current[note.lane] = now;
      }
      if (note.timeMs <= state.songPositionMs - 80) {
        oppHitSet.add(i);
      }
      drawArrow(ctx, x + laneW / 2, headY, note.lane, color, note.timeMs <= state.songPositionMs ? 0.25 : 0.8);
    }

    for (let i = 0; i < chart.notes.length; i++) {
      const note = chart.notes[i];
      const hasResult = state.noteResults.some((r) => r.noteIndex === i);
      const isActive = state.activeHolds.get(note.lane as Lane) === i;
      if (hasResult && !isActive) continue;
      const headY = computeNoteY(note.timeMs, state.songPositionMs, receptorY, topY, leadInMsRef.current);
      if (headY < -100 || headY > h + 100) continue;
      const x = playerStartX + note.lane * (laneW + laneGap);
      const color = LANE_COLORS[note.lane];
      // draw hold/duration bar
      if (note.kind === 'hold') {
        const tailEndY = computeNoteY(
          note.timeMs + note.durationMs,
          state.songPositionMs,
          receptorY,
          topY,
          leadInMsRef.current,
        );
        const fullTop = Math.min(headY, tailEndY);
        const fullBot = Math.max(headY, tailEndY);
        const tTop = Math.max(0, fullTop);
        const tBot = Math.min(fullBot, receptorY - 20);
        const holdProgress = Math.min(1, Math.max(0, (state.songPositionMs - note.timeMs) / note.durationMs));
        const clippedTop = tTop + (tBot - tTop) * holdProgress;
        if (tBot > clippedTop + 4) {
          const isMissed = state.noteResults.some(
            (r) => r.noteIndex === i && r.judgment === 'miss',
          );
          ctx.save();
          ctx.globalAlpha = isMissed ? 0.2 : 0.5;
          const trailColor = isMissed ? '#666666' : color;
          const pad = 4;
          const tw = laneW - pad * 2;
          const path = new Path2D();
          const cr = 6;
          path.moveTo(x + pad + cr, clippedTop);
          path.lineTo(x + pad + tw - cr, clippedTop);
          path.lineTo(x + pad + tw, clippedTop + cr);
          path.lineTo(x + pad + tw, tBot - cr);
          path.quadraticCurveTo(x + pad + tw, tBot, x + pad + tw - cr, tBot);
          path.lineTo(x + pad + cr, tBot);
          path.quadraticCurveTo(x + pad, tBot, x + pad, tBot - cr);
          path.lineTo(x + pad, clippedTop + cr);
          path.quadraticCurveTo(x + pad, clippedTop, x + pad + cr, clippedTop);
          path.closePath();
          ctx.fillStyle = trailColor + '60';
          ctx.fill(path);
          ctx.strokeStyle = trailColor + '80';
          ctx.lineWidth = 1;
          ctx.stroke(path);
          ctx.restore();
        }
      }
      drawArrow(ctx, x + laneW / 2, headY, note.lane, color, 0.9);
    }

    const splashes = splashRef.current;
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i];
      if (s.life <= 0) { splashes.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = s.life;
      ctx.fillStyle = s.color;
      if (s.star) {
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2;
        for (let j = 0; j < 4; j++) {
          const a = (Math.PI * 2 * j) / 4 + Math.PI / 4;
          const len = 5 * s.life;
          ctx.beginPath();
          ctx.moveTo(s.x - Math.cos(a) * len, s.y - Math.sin(a) * len);
          ctx.lineTo(s.x + Math.cos(a) * len, s.y + Math.sin(a) * len);
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, 3 * s.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.08;
      s.life -= 0.025;
    }

    const popups = popupsRef.current;
    for (let i = popups.length - 1; i >= 0; i--) {
      const p = popups[i];
      if (p.life <= 0) { popups.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
      p.life -= 0.025;
      p.y -= 1.2;
    }

    const progress = state.songEnded
      ? 1
      : state.songPositionMs / chart.songDurationMs;
    ctx.fillStyle = '#22c55e44';
    ctx.fillRect(0, 0, w * progress, 3);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, 0, w * progress, 2);
  }, []);

  useEffect(() => {
    if (screen !== 'playing') return;
    const chart = chartRef.current;
    lastFrameRef.current = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(now - lastFrameRef.current, 50);
      lastFrameRef.current = now;
      if (dt >= 1) {
        tick(chart, dt);
      }
      drawCanvas();
      const state = engineRef.current;
      if (displayScoreRef.current !== state.score) {
        displayScoreRef.current = state.score;
        setDisplayScore(state.score);
      }
      if (displayComboRef.current !== state.combo) {
        displayComboRef.current = state.combo;
        setDisplayCombo(state.combo);
      }
      if (displayHealthRef.current !== state.health) {
        displayHealthRef.current = state.health;
        setDisplayHealth(state.health);
      }
      if (!state.songEnded) {
        frameRef.current = requestAnimationFrame(loop);
      }
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [screen, tick, drawCanvas]);

  const countdownStarted = useRef(false);

  useEffect(() => {
    if (screen !== 'countdown') {
      countdownStarted.current = false;
      return;
    }
    // Guard against React 18 Strict Mode double-mount
    if (countdownStarted.current) return;
    countdownStarted.current = true;

    const audio = audioRef.current;
    audio.resume();
    audio.countdown(3);
    const bpm = chartRef.current.bpm;
    const countdownInterval = Math.round((60_000 / bpm) * 2);
    let step = 3;
    const timer = setInterval(() => {
      step--;
      if (step > 0) {
        setCountdownValue(step);
        audio.countdown(step);
      } else if (step === 0) {
        setCountdownValue('GO');
        audio.go();
      } else {
        clearInterval(timer);
        setCountdownValue(null);
        setScreen('playing');
      }
    }, countdownInterval);
    return () => clearInterval(timer);
  }, [screen]);

  const startSong = useCallback((idx: number) => {
    audioRef.current.resume();
    setSelectedSong(idx);
    const chart = generateChart(idx, difficulty);
    chartRef.current = chart;
    engineRef.current = createInitialState();
    leadInMsRef.current = computeLeadIn(chart.bpm);
    popupsRef.current = [];
    splashRef.current = [];
    oppHitSetRef.current = new Set();
    displayScoreRef.current = 0;
    displayComboRef.current = 0;
    displayHealthRef.current = 100;
    setDisplayScore(0);
    setDisplayCombo(0);
    setDisplayHealth(100);
    setGameResult(null);
    setDying(false);
    setCountdownValue(3);
    setScreen('countdown');
  }, [difficulty]);

  useEffect(() => {
    if (screen !== 'playing') return;
    const isInsane = chartRef.current.difficulty === 'insane';
    const down = (e: KeyboardEvent) => {
      const lane = keyToLane(e.key, isInsane);
      if (lane === undefined) return;
      e.preventDefault();
      if (pressedKeysRef.current.has(e.key)) return;
      pressedKeysRef.current.add(e.key);
      pressedLanesRef.current.add(lane);
      const state = engineRef.current;
      const chart = chartRef.current;
      const result = processKeyPress(state, lane, state.songPositionMs, chart);
      engineRef.current = result.state;
      for (const ev of result.events) {
        handleEngineEvent(ev, chart);
      }
    };
    const up = (e: KeyboardEvent) => {
      const lane = keyToLane(e.key, isInsane);
      if (lane === undefined) return;
      e.preventDefault();
      pressedKeysRef.current.delete(e.key);
      pressedLanesRef.current.delete(lane);
      const state = engineRef.current;
      const chart = chartRef.current;
      const result = processKeyRelease(
        state,
        lane,
        state.songPositionMs,
        chart,
      );
      engineRef.current = result.state;
      for (const ev of result.events) {
        handleEngineEvent(ev, chart);
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      pressedKeysRef.current.clear();
    };
  }, [screen, handleEngineEvent]);

  const handleTouchPress = useCallback(
    (lane: Lane) => {
      pressedLanesRef.current.add(lane);
      const state = engineRef.current;
      const chart = chartRef.current;
      const result = processKeyPress(state, lane, state.songPositionMs, chart);
      engineRef.current = result.state;
      for (const ev of result.events) {
        handleEngineEvent(ev, chart);
      }
    },
    [handleEngineEvent],
  );

  const handleTouchRelease = useCallback(
    (lane: Lane) => {
      pressedLanesRef.current.delete(lane);
      const state = engineRef.current;
      const chart = chartRef.current;
      const result = processKeyRelease(
        state,
        lane,
        state.songPositionMs,
        chart,
      );
      engineRef.current = result.state;
      for (const ev of result.events) {
        handleEngineEvent(ev, chart);
      }
    },
    [handleEngineEvent],
  );

  if (screen === 'song_select') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold">🎵 FNF Rhythm</h1>
          <Link href="/">
            <Button
              variant="outline"
              className="text-white border-gray-600 hover:bg-gray-800"
            >
              ← Voltar
            </Button>
          </Link>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
          <h2 className="text-3xl font-bold">Selecione uma música</h2>
          
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setInputMode('keyboard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                inputMode === 'keyboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ⌨️ PC (Teclado)
            </button>
            <button
              type="button"
              onClick={() => setInputMode('touch')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                inputMode === 'touch'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              👆 Mobile (Touch)
            </button>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="text-sm text-gray-400">Dificuldade</span>
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
              {(['easy', 'normal', 'hard', 'insane'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    difficulty === d
                      ? d === 'easy' ? 'bg-green-600 text-white'
                        : d === 'normal' ? 'bg-blue-600 text-white'
                        : d === 'hard' ? 'bg-orange-600 text-white'
                        : 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {d === 'easy' ? '🟢 Fácil' : d === 'normal' ? '🔵 Normal' : d === 'hard' ? '🟠 Difícil' : '🔴 Insano'}
                </button>
              ))}
            </div>
            {difficulty === 'insane' && (
              <span className="text-xs text-yellow-400">⚡ Modo Insano: 5 lanes! Use A, S, Space, D, F</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Botplay</span>
            <button
              type="button"
              onClick={() => setBotplay(!botplay)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                botplay
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {botplay ? '🤖 Ativado' : '🤖 Desativado'}
            </button>
          </div>

          <div className="w-full max-w-md flex flex-col gap-3">
            {SONG_NAMES.map((name, i) => {
              const cleared = songsCleared[i];
              const locked = i > 0 && !songsCleared[i - 1];
              return (
                <button
                  key={i}
                  disabled={locked}
                  type="button"
                  onClick={() => startSong(i)}
                  className={`p-4 rounded-lg text-left flex items-center justify-between transition-colors ${
                    cleared
                      ? 'bg-green-900/40 border border-green-600'
                      : locked
                        ? 'bg-gray-800/30 border border-gray-700 opacity-50 cursor-not-allowed'
                        : 'bg-gray-800 border border-gray-700 hover:border-blue-500 hover:bg-gray-750'
                  }`}
                >
                  <div>
                    <div className="text-lg font-semibold">
                      {cleared ? '✅' : locked ? '🔒' : '🎵'} {name}
                    </div>
                    <div className="text-sm text-gray-400 mt-0.5">
                      {cleared
                        ? 'Completa'
                        : locked
                          ? 'Complete a música anterior'
                          : 'Disponível'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col items-center gap-2 mt-4">
            <span className="text-sm text-gray-400">me teste</span>
            <iframe 
              width="110" 
              height="200" 
              src="https://www.myinstants.com/instant/botao-do-whatsapp-97196/embed/" 
              frameBorder="0" 
              scrolling="no"
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'countdown') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div
          key={String(countdownValue)}
          className="text-9xl font-bold animate-ping"
        >
          {countdownValue === 'GO' ? 'GO!' : countdownValue}
        </div>
      </div>
    );
  }

  if (screen === 'result' && gameResult) {
    const r = gameResult;
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl overflow-hidden text-center">
          {/* Rainbow gradient banner */}
          <div
            className="h-24 w-full"
            style={{
              background: 'linear-gradient(90deg, #ff6eb4 0%, #ff3de8 15%, #cc33cc 30%, #da1bde 50%, #73fd0b 75%, #5eed2c 90%, #f2ff96 100%)',
            }}
          />

          {/* RATING 3D text */}
          <div className="relative -mt-2 mb-2">
            <h1
              className="text-5xl font-black tracking-wider select-none"
              style={{
                color: '#ff2222',
                textShadow: `
                  1px 1px 0px #b40000,
                  2px 2px 0px #a00000,
                  3px 3px 0px #8c0000,
                  4px 4px 0px #780000,
                  5px 5px 0px #640000,
                  6px 6px 8px rgba(0,0,0,0.4)
                `,
              }}
            >
              RATING
            </h1>
          </div>

          {/* Victory / Defeat header */}
          <h2 className={`text-2xl font-bold mb-1 ${r.passed ? 'text-green-600' : 'text-red-500'}`}>
            {r.passed ? 'VITÓRIA!' : 'DERROTA!'}
          </h2>

          {/* Difficulty + Botplay badges */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
              r.difficulty === 'easy' ? 'bg-green-500'
              : r.difficulty === 'normal' ? 'bg-blue-500'
              : r.difficulty === 'hard' ? 'bg-orange-500'
              : 'bg-red-500'
            }`}>
              {r.difficulty === 'easy' ? '🟢 Fácil' : r.difficulty === 'normal' ? '🔵 Normal' : r.difficulty === 'hard' ? '🟠 Difícil' : '🔴 Insano'}
            </span>
            {r.botplay && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500 text-white">
                🤖 BOTPLAY
              </span>
            )}
          </div>

          {/* Rating letter - large prominent display */}
          <div className="mb-4">
            <span
              className={`text-8xl font-black drop-shadow-lg ${
                r.ratingLetter === 'S' ? 'text-yellow-400' :
                r.ratingLetter === 'A' ? 'text-green-400' :
                r.ratingLetter === 'B' ? 'text-blue-400' :
                r.ratingLetter === 'C' ? 'text-purple-400' :
                r.ratingLetter === 'D' ? 'text-orange-400' :
                'text-red-400'
              }`}
              style={{
                textShadow: r.ratingLetter === 'S'
                  ? '2px 2px 0px #b8860b, 4px 4px 6px rgba(0,0,0,0.2)'
                  : r.ratingLetter === 'A'
                  ? '2px 2px 0px #15803d, 4px 4px 6px rgba(0,0,0,0.2)'
                  : r.ratingLetter === 'B'
                  ? '2px 2px 0px #1d4ed8, 4px 4px 6px rgba(0,0,0,0.2)'
                  : r.ratingLetter === 'C'
                  ? '2px 2px 0px #6b21a8, 4px 4px 6px rgba(0,0,0,0.2)'
                  : r.ratingLetter === 'D'
                  ? '2px 2px 0px #c2410c, 4px 4px 6px rgba(0,0,0,0.2)'
                  : '2px 2px 0px #991b1b, 4px 4px 6px rgba(0,0,0,0.2)',
              }}
            >
              {r.ratingLetter}
            </span>
          </div>

          {/* Million reward notification */}
          {r.millionReward && (
            <div className="mx-4 bg-yellow-50 border border-yellow-400 rounded-lg p-3 mb-4">
              <div className="text-yellow-600 text-lg font-bold">
                🎉 1 MILHÃO DE MOEDAS! 🎉
              </div>
              <div className="text-yellow-500 text-sm mt-1">
                Parabéns por completar todas as músicas!
              </div>
            </div>
          )}

          {/* Stats section */}
          <div className="px-6 pb-4 space-y-2 mb-4 text-left">
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-500 text-sm">Pontuação</span>
              <span className="font-bold text-lg text-gray-800">{r.score.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-500 text-sm">Precisão</span>
              <span className="font-bold text-lg text-gray-800">{r.accuracy.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-500 text-sm">Máximo Combo</span>
              <span className="font-bold text-lg text-yellow-500">{r.maxCombo}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500 text-sm">Status</span>
              <span className={`font-bold text-lg ${r.passed ? 'text-green-500' : 'text-red-500'}`}>
                {r.passed ? 'Aprovado' : 'Reprovado'}
              </span>
            </div>
          </div>

          {/* Botplay warning */}
          {r.botplay && (
            <div className="mx-4 bg-purple-50 border border-purple-300 rounded-lg p-3 mb-4">
              <div className="text-purple-600 text-sm">
                ⚠️ Pontuações com Botplay não contam para o progresso
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="px-6 pb-6 flex flex-col gap-3">
            <Button
              onClick={() => startSong(selectedSong)}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              🔄 Tentar Novamente
            </Button>
            <Button
              onClick={() => {
                setGameResult(null);
                setScreen('song_select');
              }}
              variant="outline"
              className="text-gray-700 border-gray-300 hover:bg-gray-100 w-full"
            >
              ← Voltar às Músicas
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-950 border-b border-gray-800">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">
            {SONG_NAMES[selectedSong]}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-red-400 font-bold w-5 text-center">O</span>
            <div className="w-28 bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-100 ${
                  displayHealth > 50
                    ? 'bg-green-500'
                    : displayHealth > 25
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${displayHealth}%` }}
              />
            </div>
            <span className="text-green-400 font-bold w-5 text-center">P</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-300 font-mono">
            Score:{' '}
            <span className="text-white font-bold">
              {displayScore.toLocaleString()}
            </span>
          </span>
          <span className="text-gray-300 font-mono">
            Combo:{' '}
            <span className="text-yellow-400 font-bold">
              {displayCombo > 0 ? `${displayCombo}x` : '-'}
            </span>
          </span>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 relative">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        {botplay && (
          <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg font-bold animate-pulse">
            🤖 BOTPLAY
          </div>
        )}
        {dying && (
          <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center animate-pulse">
            <div className="text-center">
              <div className="text-7xl font-bold text-red-400 mb-4">GAME OVER</div>
              <div className="text-xl text-red-200">Continue jogando...</div>
            </div>
          </div>
        )}
      </div>
      {inputMode === 'touch' ? (
        <div className="flex items-center justify-center gap-3 px-4 py-4 bg-gray-950 border-t border-gray-800">
          {Array.from({ length: chartRef.current.laneCount }, (_, i) => i).map((lane) => (
            <button
              key={lane}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleTouchPress(lane as Lane);
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                handleTouchRelease(lane as Lane);
              }}
              onPointerLeave={(e) => {
                e.preventDefault();
                handleTouchRelease(lane as Lane);
              }}
              onContextMenu={(e) => e.preventDefault()}
              className={`w-20 h-20 rounded-xl text-2xl font-bold flex items-center justify-center select-none touch-none active:scale-95 transition-transform`}
              style={{
                backgroundColor: LANE_COLORS[lane] + '60',
                border: `2px solid ${LANE_COLORS[lane]}`,
                color: LANE_COLORS[lane],
                touchAction: 'none',
              }}
            >
              {LANE_DIRECTIONS[lane]}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center gap-6 px-4 py-2 bg-gray-950 border-t border-gray-800 text-xs text-gray-400">
          {chartRef.current.difficulty === 'insane' ? (
            <>
              <span>Pressione <kbd className="mx-1 px-1.5 py-0.5 rounded bg-gray-800 text-gray-200 font-mono text-xs">A</kbd> <span className="text-gray-500">←</span></span>
              <span><kbd className="mx-1 px-1.5 py-0.5 rounded bg-gray-800 text-gray-200 font-mono text-xs">S</kbd> <span className="text-gray-500">↓</span></span>
              <span><kbd className="mx-1 px-1.5 py-0.5 rounded bg-gray-800 text-gray-200 font-mono text-xs">Space</kbd> <span className="text-gray-500">★</span></span>
              <span><kbd className="mx-1 px-1.5 py-0.5 rounded bg-gray-800 text-gray-200 font-mono text-xs">D</kbd> <span className="text-gray-500">↑</span></span>
              <span><kbd className="mx-1 px-1.5 py-0.5 rounded bg-gray-800 text-gray-200 font-mono text-xs">F</kbd> <span className="text-gray-500">→</span></span>
            </>
          ) : (
            <>
              <span>Pressione <kbd className="mx-1 px-1.5 py-0.5 rounded bg-gray-800 text-gray-200 font-mono text-xs">A</kbd> <span className="text-gray-500">←</span></span>
              <span><kbd className="mx-1 px-1.5 py-0.5 rounded bg-gray-800 text-gray-200 font-mono text-xs">S</kbd> <span className="text-gray-500">↓</span></span>
              <span><kbd className="mx-1 px-1.5 py-0.5 rounded bg-gray-800 text-gray-200 font-mono text-xs">D</kbd> <span className="text-gray-500">↑</span></span>
              <span><kbd className="mx-1 px-1.5 py-0.5 rounded bg-gray-800 text-gray-200 font-mono text-xs">F</kbd> <span className="text-gray-500">→</span></span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const KEY_MAP: Record<string, Lane> = {};
const MAPPINGS: [string, Lane][] = [
  ['ArrowLeft', 0],
  ['a', 0],
  ['A', 0],
  ['ArrowDown', 1],
  ['s', 1],
  ['S', 1],
  ['ArrowUp', 2],
  ['d', 2],
  ['D', 2],
  ['w', 2],
  ['W', 2],
  ['j', 2],
  ['J', 2],
  ['ArrowRight', 3],
  ['f', 3],
  ['F', 3],
  ['k', 3],
  ['K', 3],
  [' ', 2], // Space bar maps to lane 2 (middle)
];
for (const [k, l] of MAPPINGS) KEY_MAP[k] = l;

const INSANE_KEY_MAP: Record<string, Lane> = {
  'ArrowLeft': 0,
  'a': 0,
  'A': 0,
  's': 1,
  'S': 1,
  ' ': 2,
  'd': 3,
  'D': 3,
  'ArrowRight': 4,
  'f': 4,
  'F': 4,
};

function keyToLane(key: string, isInsane: boolean): Lane | undefined {
  if (isInsane) return INSANE_KEY_MAP[key];
  return KEY_MAP[key];
}

const ARROW_ROTATIONS: number[] = [
  -Math.PI / 2,
  Math.PI,
  0,
  Math.PI / 2,
  0, // Lane 4 (star) points up
];

function drawArrow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  dir: number,
  color: string,
  alpha: number,
): void {
  const size = 16;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (alpha > 0.8) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
  }
  ctx.translate(cx, cy);
  ctx.rotate(ARROW_ROTATIONS[dir]);
  const w = size * 0.65;
  const h = size;
  const shaft = w * 0.35;
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.lineTo(-w, 0);
  ctx.lineTo(-shaft, 0);
  ctx.lineTo(-shaft, h * 0.55);
  ctx.lineTo(shaft, h * 0.55);
  ctx.lineTo(shaft, 0);
  ctx.lineTo(w, 0);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#ffffffdd';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();
}
