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
} from '@/features/fnf/engine';
import { loadGameState, updateGameState } from '@/lib/game-save';

const SONG_NAMES = [
  'Tropical Dawn',
  'Pixel Storm',
  'Neon Nights',
  'Crystal Cave',
  'Final Boss',
];

const LANE_COLORS: [string, string, string, string] = ['#a855f7', '#3b82f6', '#22c55e', '#ef4444'];

const LANE_DIRECTIONS: [string, string, string, string] = ['←', '↓', '↑', '→'];

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
    lane0: '/sfx/ah_medium.mp3',
    lane1: '/sfx/ai_short.mp3',
    lane2: '/sfx/ah_short.mp3',
    lane3: '/sfx/auh_medium.mp3',
    miss: '/sfx/fnf-missnote-1.mp3',
    death: '/sfx/fnf-lost-sfx.mp3',
    countdown: '/sfx/3-2-1-go-sound-effect.mp3',
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

  lane(l: Lane): void {
    this.play(`lane${l}`, 0.8);
  }

  miss(): void {
    this.play('miss', 0.8);
  }

  countdown(): void {
    this.play('countdown', 1);
  }

  go(): void {
    /* countdown sound covers GO */
  }

  fanfare(): void {
    /* victory — keep as fallback */
    this.play('countdown', 0.5);
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
  const [songsCleared, setSongsCleared] = useState<boolean[]>(() => {
    try {
      const s = loadGameState();
      return [0, 1, 2, 3, 4].map((i) => s.fnfSongsCompleted > i);
    } catch {
      return [false, false, false, false, false];
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

  useEffect(() => {
    audioRef.current.init();
  }, []);

  const addPopup = useCallback(
    (text: string, lane: Lane, canvasWidth: number, receptorY: number) => {
      const laneW = Math.min((canvasWidth - 80) / 4, 120);
      const total = laneW * 4 + 4 * 3;
      const sx = (canvasWidth - total) / 2;
      const x = sx + lane * (laneW + 4) + laneW / 2;
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

  const handleSongClear = useCallback(
    (state: EngineState) => {
      const passed = state.health > 0;
      const score = state.score;
      const maxCombo = state.maxCombo;
      const accuracy = getAccuracy(state);
      const ratingLetter = getRatingLetter(accuracy);
      const saved = loadGameState();
      const completed = !passed
        ? saved.fnfSongsCompleted
        : Math.max(saved.fnfSongsCompleted, selectedSong + 1);
      const bestCombo = Math.max(saved.fnfHighestCombo, maxCombo);
      const coinsAdd = Math.floor(score / 10);
      let finalCoins = saved.coins + coinsAdd;
      let millionReward = false;
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
      setSongsCleared([0, 1, 2, 3, 4].map((i) => completed > i));
      if (passed) {
        audioRef.current.fanfare();
      }
      setGameResult({ score, maxCombo, passed, millionReward, accuracy, ratingLetter });
      setScreen('result');
    },
    [selectedSong],
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
            audio.lane(note.lane);
            addPopup(event.judgment, note.lane, cw, receptorY);
          }
          break;
        }
        case 'note_miss': {
          audio.miss();
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
          audio.miss();
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
    [addPopup, handleSongClear],
  );

  const tick = useCallback(
    (chart: Chart, dt: number) => {
      const engine = engineRef.current;
      if (engine.songEnded) return;
      const result = processSongTick(engine, dt, chart);
      engineRef.current = result.state;
      for (const ev of result.events) {
        handleEngineEvent(ev, chart);
      }
    },
    [handleEngineEvent],
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
    const laneCount = 4;
    const gap = 4;
    const laneW = Math.min((w - 80) / laneCount, 120);
    const totalW = laneW * laneCount + gap * (laneCount - 1);
    const startX = (w - totalW) / 2;
    const receptorY = h - 80;
    const topY = 0;
    const state = engineRef.current;
    const chart = chartRef.current;

    for (let i = 0; i < 4; i++) {
      const x = startX + i * (laneW + gap);
      const color = LANE_COLORS[i];
      const isPressed = pressedLanesRef.current.has(i as Lane);
      ctx.fillStyle = color + (isPressed ? '25' : '15');
      ctx.fillRect(x, 0, laneW, h);
      ctx.strokeStyle = color + '40';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, 0, laneW, h);
      const receptorScale = isPressed ? 1.15 : 1;
      const rw = laneW * receptorScale;
      const rh = 50 * receptorScale;
      const rx = x + (laneW - rw) / 2;
      const ry = receptorY - rh / 2;
      ctx.fillStyle = isPressed ? color + 'cc' : color + '80';
      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, rh, 6);
      ctx.fill();
      ctx.strokeStyle = isPressed ? '#ffffff' : color;
      ctx.lineWidth = isPressed ? 3 : 2;
      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, rh, 6);
      ctx.stroke();
      drawArrow(ctx, x + laneW / 2, receptorY, i, color, isPressed ? 1 : 0.8);
    }

    for (let i = 0; i < chart.notes.length; i++) {
      const note = chart.notes[i];
      const hasResult = state.noteResults.some((r) => r.noteIndex === i);
      const isActive = state.activeHolds.get(note.lane as Lane) === i;
      if (hasResult && !isActive) continue;
      const headY = computeNoteY(note.timeMs, state.songPositionMs, receptorY, topY, leadInMsRef.current);
      if (headY < -100 && headY > h + 100) continue;
      const x = startX + note.lane * (laneW + gap);
      const color = LANE_COLORS[note.lane];
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
        const holdProgress = Math.min(
          1,
          Math.max(0, (state.songPositionMs - note.timeMs) / note.durationMs),
        );
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
          const r = 6;
          path.moveTo(x + pad + r, clippedTop);
          path.lineTo(x + pad + tw - r, clippedTop);
          path.lineTo(x + pad + tw, clippedTop + r);
          path.lineTo(x + pad + tw, tBot - r);
          path.quadraticCurveTo(x + pad + tw, tBot, x + pad + tw - r, tBot);
          path.lineTo(x + pad + r, tBot);
          path.quadraticCurveTo(x + pad, tBot, x + pad, tBot - r);
          path.lineTo(x + pad, clippedTop + r);
          path.quadraticCurveTo(x + pad, clippedTop, x + pad + r, clippedTop);
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

    const popups = popupsRef.current;
    for (let i = popups.length - 1; i >= 0; i--) {
      const p = popups[i];
      if (p.life <= 0) continue;
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
      p.life -= 0.025;
      p.y -= 1.2;
      if (p.life <= 0) {
        popups.splice(i, 1);
      }
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

  useEffect(() => {
    if (screen !== 'countdown') return;
    const audio = audioRef.current;
    audio.resume();
    audio.countdown();
    const bpm = chartRef.current.bpm;
    const countdownInterval = Math.round((60_000 / bpm) * 2);
    let step = 3;
    const timer = setInterval(() => {
      step--;
      if (step > 0) {
        setCountdownValue(step);
        audio.countdown();
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
    const chart = generateChart(idx);
    chartRef.current = chart;
    engineRef.current = createInitialState();
    leadInMsRef.current = computeLeadIn(chart.bpm);
    popupsRef.current = [];
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
  }, []);

  useEffect(() => {
    if (screen !== 'playing') return;
    const down = (e: KeyboardEvent) => {
      const lane = keyToLane(e.key);
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
      const lane = keyToLane(e.key);
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
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <div className="bg-gray-800 rounded-xl p-8 max-w-sm w-full border border-gray-700 text-center">
          <div className="text-6xl mb-4">
            {r.passed ? '🎉' : '💔'}
          </div>
          <h2
            className={`text-3xl font-bold mb-2 ${r.passed ? 'text-green-400' : 'text-red-400'}`}
          >
            {r.passed ? 'VITÓRIA!' : 'DERROTA!'}
          </h2>
          {r.millionReward && (
            <div className="bg-yellow-900/50 border border-yellow-500 rounded-lg p-3 mb-4">
              <div className="text-yellow-400 text-lg font-bold">
                🎉 1 MILHÃO DE MOEDAS! 🎉
              </div>
              <div className="text-yellow-300 text-sm mt-1">
                Parabéns por completar todas as músicas!
              </div>
            </div>
          )}
          <div className="space-y-2 mb-6 text-left">
            <div className="flex justify-between">
              <span className="text-gray-400">Pontuação</span>
              <span className="font-bold text-xl">{r.score.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Precisão</span>
              <span className="font-bold text-xl">{r.accuracy.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Rating</span>
              <span className={`text-3xl font-bold ${
                r.ratingLetter === 'S' ? 'text-yellow-400' :
                r.ratingLetter === 'A' ? 'text-green-400' :
                r.ratingLetter === 'B' ? 'text-blue-400' :
                r.ratingLetter === 'C' ? 'text-purple-400' :
                r.ratingLetter === 'D' ? 'text-orange-400' :
                'text-red-400'
              }`}>{r.ratingLetter}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Máximo Combo</span>
              <span className="font-bold text-yellow-400">{r.maxCombo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className={r.passed ? 'text-green-400' : 'text-red-400'}>
                {r.passed ? 'Aprovado' : 'Reprovado'}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
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
              className="text-white border-gray-600 hover:bg-gray-700 w-full"
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
            <span className="text-gray-500">HP</span>
            <div className="w-32 bg-gray-700 rounded-full h-3 overflow-hidden">
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
          {([0, 1, 2, 3] as const).map((lane) => (
            <button
              key={lane}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleTouchPress(lane);
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                handleTouchRelease(lane);
              }}
              onPointerLeave={(e) => {
                e.preventDefault();
                handleTouchRelease(lane);
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
          <span>Pressione <kbd className="mx-1 px-1.5 py-0.5 rounded bg-gray-800 text-gray-200 font-mono text-xs">A</kbd> <span className="text-gray-500">←</span></span>
          <span><kbd className="mx-1 px-1.5 py-0.5 rounded bg-gray-800 text-gray-200 font-mono text-xs">S</kbd> <span className="text-gray-500">↓</span></span>
          <span><kbd className="mx-1 px-1.5 py-0.5 rounded bg-gray-800 text-gray-200 font-mono text-xs">D</kbd> <span className="text-gray-500">↑</span></span>
          <span><kbd className="mx-1 px-1.5 py-0.5 rounded bg-gray-800 text-gray-200 font-mono text-xs">F</kbd> <span className="text-gray-500">→</span></span>
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
];
for (const [k, l] of MAPPINGS) KEY_MAP[k] = l;

function keyToLane(key: string): Lane | undefined {
  return KEY_MAP[key];
}

const ARROW_ROTATIONS: [number, number, number, number] = [
  -Math.PI / 2,
  Math.PI,
  0,
  Math.PI / 2,
];

function drawArrow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  dir: number,
  color: string,
  alpha: number,
): void {
  const size = 18;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.rotate(ARROW_ROTATIONS[dir]);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(-size * 0.7, size * 0.4);
  ctx.lineTo(size * 0.7, size * 0.4);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#ffffffaa';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}
