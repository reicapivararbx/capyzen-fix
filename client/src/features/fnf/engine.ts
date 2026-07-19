type NoteKind = "tap" | "hold";
type Lane = 0 | 1 | 2 | 3 | 4;
type Judgment = "perfect" | "good" | "bad" | "miss";
type Difficulty = "easy" | "normal" | "hard" | "insane";

interface Note {
  kind: NoteKind;
  lane: Lane;
  timeMs: number;
  durationMs: number;
}

interface Chart {
  notes: Note[];
  oppNotes: Note[];
  songDurationMs: number;
  bpm: number;
  scrollSpeed: number;
  difficulty: Difficulty;
  laneCount: number;
}

interface EngineState {
  score: number;
  combo: number;
  maxCombo: number;
  health: number;
  songPositionMs: number;
  songEnded: boolean;
  noteResults: Array<{ noteIndex: number; judgment: Judgment; timeMs: number }>;
  activeHolds: Map<Lane, number>;
  perfectCount: number;
  goodCount: number;
  badCount: number;
  missCount: number;
}

interface EngineEvent {
  type: "note_hit" | "note_miss" | "hold_complete" | "hold_dropped" | "song_end" | "death";
  timeMs: number;
  judgment?: Judgment;
  noteIndex?: number;
  combo?: number;
}

function createRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateChart(songIndex: number, difficulty: Difficulty = "normal"): Chart {
  const rng = createRng(songIndex * 2654435761 + 12345);
  const bpm = [120, 130, 140, 150, 160, 170, 100, 145, 180, 110][songIndex] || 120;
  const seconds = [30, 45, 60, 75, 90, 45, 60, 50, 70, 55][songIndex] || 30;
  const songDurationMs = seconds * 1000;
  const beatMs = (60_000 / bpm);
  const totalBeats = Math.floor((songDurationMs - 1500) / beatMs);
  const notes: Note[] = [];

  // Difficulty modifiers
  const isInsane = difficulty === "insane";
  const laneCount = isInsane ? 5 : 4;
  
  // Note density: easy ~50%, normal 100%, hard ~150%, insane ~130% (more lanes)
  const densityMultiplier = difficulty === "easy" ? 0.5 : difficulty === "hard" ? 1.5 : difficulty === "insane" ? 1.3 : 1;
  
  // Speed modifier: easy slower, hard faster, insane fastest
  const speedMultiplier = difficulty === "easy" ? 0.8 : difficulty === "hard" ? 1.3 : difficulty === "insane" ? 1.5 : 1;

  for (let beat = 0; beat < totalBeats; beat++) {
    const timeMs = beat * beatMs + 2000;
    const noise = rng();
    const baseChance = 0.55 + 0.15 * Math.sin(beat * 0.3);
    const shouldPlace = noise < baseChance * densityMultiplier;
    if (!shouldPlace) continue;
    const lane = Math.floor(rng() * laneCount) as Lane;
    const isHold = rng() < (difficulty === "easy" ? 0.2 : 0.3);
    const durationMs = isHold ? Math.round(beatMs * (1 + rng() * 3)) : 0;
    notes.push({
      kind: isHold ? "hold" : "tap",
      lane,
      timeMs: Math.round(timeMs),
      durationMs,
    });
  }

  const oppNotes: Note[] = [];
  const oppLaneCount = isInsane ? 5 : 4;
  for (let beat = 0; beat < totalBeats; beat++) {
    const timeMs = beat * beatMs + 2000;
    const noise = rng();
    const shouldPlace = noise < 0.4 + 0.15 * Math.cos(beat * 0.25);
    if (!shouldPlace) continue;
    const lane = Math.floor(rng() * oppLaneCount) as Lane;
    oppNotes.push({
      kind: "tap",
      lane,
      timeMs: Math.round(timeMs),
      durationMs: 0,
    });
  }

  return { notes, oppNotes, songDurationMs, bpm, scrollSpeed: speedMultiplier, difficulty, laneCount };
}

interface CNENote {
  id: number;     // lane 0-3
  time: number;   // ms
  sLen: number;   // sustain length ms, 0 = tap
  type: number;   // note type
}

interface CNEStrumLine {
  position: string;
  notes: CNENote[];
  characters?: string[];
  type?: number;
  visible?: boolean;
}

interface CNEChart {
  strumLines: CNEStrumLine[];
  events?: Array<{ name: string; time: number; params?: unknown[] }>;
  scrollSpeed?: number;
  stage?: string;
  bpm?: number;
  songDurationMs?: number;
}

function parseCNEChart(json: CNEChart, defaultBpm = 120): Chart {
  const playerLine = json.strumLines.find(s => s.position === 'boyfriend');
  const oppLine = json.strumLines.find(s => s.position === 'dad');
  const bpm = json.bpm ?? defaultBpm;
  const scrollSpeed = json.scrollSpeed ?? 1;

  const toNote = (n: CNENote): Note => ({
    kind: n.sLen > 0 ? 'hold' : 'tap',
    lane: n.id as Lane,
    timeMs: Math.round(n.time),
    durationMs: Math.round(n.sLen),
  });

  const notes = (playerLine?.notes ?? []).map(toNote);
  const oppNotes = (oppLine?.notes ?? []).map(toNote);

  let songDurationMs = json.songDurationMs ?? 0;
  if (!songDurationMs && notes.length > 0) {
    const lastNote = notes[notes.length - 1];
    songDurationMs = lastNote.timeMs + (lastNote.durationMs || 500) + 2000;
  }

  return { notes, oppNotes, songDurationMs, bpm, scrollSpeed, difficulty: 'normal', laneCount: 4 };
}

function createInitialState(): EngineState {
  return {
    score: 0,
    combo: 0,
    maxCombo: 0,
    health: 100,
    songPositionMs: 0,
    songEnded: false,
    noteResults: [],
    activeHolds: new Map(),
    perfectCount: 0,
    goodCount: 0,
    badCount: 0,
    missCount: 0,
  };
}

function judgeNote(songPositionMs: number, noteTimeMs: number, difficulty: Difficulty = "normal"): Judgment {
  const diff = Math.abs(songPositionMs - noteTimeMs);
  
  // Timing windows adjusted by difficulty
  const windows = difficulty === "easy" 
    ? { perfect: 60, good: 120, bad: 180 }
    : difficulty === "hard"
    ? { perfect: 35, good: 70, bad: 105 }
    : difficulty === "insane"
    ? { perfect: 30, good: 60, bad: 90 }
    : { perfect: 45, good: 90, bad: 135 };
  
  if (diff <= windows.perfect) return "perfect";
  if (diff <= windows.good) return "good";
  if (diff <= windows.bad) return "bad";
  return "miss";
}

function calculateScore(judgment: Judgment, combo: number): number {
  if (judgment === "perfect") return 300 + Math.floor(combo / 10) * 50;
  if (judgment === "good") return 100 + Math.floor(combo / 10) * 25;
  if (judgment === "bad") return 50 + Math.floor(combo / 10) * 10;
  return 0;
}

function calculateHealthChange(judgment: Judgment, kind: NoteKind): number {
  if (kind === "tap") {
    if (judgment === "perfect") return 2;
    if (judgment === "good") return 1;
    if (judgment === "bad") return 0;
    return -5;
  }
  if (judgment === "perfect") return 3;
  if (judgment === "good") return 1;
  if (judgment === "bad") return 0;
  return -7;
}

function processNoteHit(
  state: EngineState,
  noteIndex: number,
  songPositionMs: number,
  chart: Chart,
): { state: EngineState; events: EngineEvent[] } {
  if (state.health <= 0) return { state, events: [] };
  if (state.noteResults.some((r) => r.noteIndex === noteIndex)) return { state, events: [] };

  const note = chart.notes[noteIndex];
  if (!note) return { state, events: [] };

  const judgment = judgeNote(songPositionMs, note.timeMs, chart.difficulty);
  const newCombo = judgment === "miss" ? 0 : state.combo + 1;
  const newMaxCombo = judgment === "miss" ? state.maxCombo : Math.max(state.maxCombo, newCombo);
  const scoreIncrease = calculateScore(judgment, newCombo);
  const newScore = state.score + scoreIncrease;
  const healthChange = calculateHealthChange(judgment, note.kind);
  let newHealth = Math.min(100, Math.max(0, state.health + healthChange));

  const newPerfectCount = state.perfectCount + (judgment === "perfect" ? 1 : 0);
  const newGoodCount = state.goodCount + (judgment === "good" ? 1 : 0);
  const newBadCount = state.badCount + (judgment === "bad" ? 1 : 0);
  const newMissCount = state.missCount + (judgment === "miss" ? 1 : 0);

  const noteResult = { noteIndex, judgment, timeMs: songPositionMs };
  const events: EngineEvent[] = [];

  let newActiveHolds = state.activeHolds;

  if (judgment === "miss") {
    events.push({ type: "note_miss", timeMs: songPositionMs, noteIndex });
  } else {
    events.push({
      type: "note_hit",
      timeMs: songPositionMs,
      judgment,
      noteIndex,
      combo: newCombo,
    });

    if (note.kind === "hold") {
      newActiveHolds = new Map(state.activeHolds);
      newActiveHolds.set(note.lane, noteIndex);
    }
  }

  if (newHealth <= 0) {
    newHealth = 0;
    events.push({ type: "death", timeMs: songPositionMs });
  }

  return {
    state: {
      ...state,
      score: newScore,
      combo: newCombo,
      maxCombo: newMaxCombo,
      health: newHealth,
      noteResults: [...state.noteResults, noteResult],
      activeHolds: newActiveHolds,
      perfectCount: newPerfectCount,
      goodCount: newGoodCount,
      badCount: newBadCount,
      missCount: newMissCount,
    },
    events,
  };
}

function processHoldRelease(
  state: EngineState,
  lane: Lane,
  songPositionMs: number,
  chart: Chart,
): { state: EngineState; events: EngineEvent[] } {
  const noteIndex = state.activeHolds.get(lane);
  if (noteIndex === undefined) return { state, events: [] };

  const note = chart.notes[noteIndex];
  if (!note) return { state, events: [] };

  const coverage = Math.min(songPositionMs - note.timeMs, note.durationMs) / note.durationMs;
  const isComplete = coverage >= 0.9;

  const newActiveHolds = new Map(state.activeHolds);
  newActiveHolds.delete(lane);

  const events: EngineEvent[] = [];
  let newState: EngineState = { ...state, activeHolds: newActiveHolds };

  if (isComplete) {
    if (newState.health > 0) {
      const healthChange = calculateHealthChange("perfect", "hold");
      newState = {
        ...newState,
        health: Math.min(100, Math.max(0, newState.health + healthChange)),
      };
      if (newState.health <= 0) {
        newState = { ...newState, health: 0 };
        events.push({ type: "death", timeMs: songPositionMs });
      }
    }
    events.push({ type: "hold_complete", timeMs: songPositionMs, noteIndex });
  } else {
    if (newState.health > 0) {
      const healthChange = calculateHealthChange("miss", "hold");
      newState = {
        ...newState,
        combo: 0,
        health: Math.min(100, Math.max(0, newState.health + healthChange)),
      };
      if (newState.health <= 0) {
        newState = { ...newState, health: 0 };
        events.push({ type: "death", timeMs: songPositionMs });
      }
    } else {
      newState = { ...newState, combo: 0 };
    }
    events.push({ type: "hold_dropped", timeMs: songPositionMs, noteIndex });
  }

  return { state: newState, events };
}

function processSongTick(
  state: EngineState,
  deltaMs: number,
  chart: Chart,
): { state: EngineState; events: EngineEvent[] } {
  if (state.songEnded) return { state, events: [] };

  const newPosition = state.songPositionMs + deltaMs;
  let newState: EngineState = { ...state, songPositionMs: newPosition };
  const events: EngineEvent[] = [];

  for (const [lane, noteIdx] of Array.from(newState.activeHolds)) {
    const note = chart.notes[noteIdx];
    if (!note) continue;
    if (newPosition > note.timeMs + note.durationMs + 150) {
      const result = processHoldRelease(newState, lane, newPosition, chart);
      newState = result.state;
      events.push(...result.events);
    }
  }

  const missWindow = chart.difficulty === "easy" ? 180 : chart.difficulty === "hard" ? 105 : chart.difficulty === "insane" ? 90 : 135;
  
  for (let i = 0; i < chart.notes.length; i++) {
    if (newState.noteResults.some((r) => r.noteIndex === i)) continue;
    const note = chart.notes[i];
    if (newPosition > note.timeMs + missWindow) {
      const missResult = { noteIndex: i, judgment: "miss" as Judgment, timeMs: note.timeMs + missWindow };
      newState = {
        ...newState,
        noteResults: [...newState.noteResults, missResult],
        missCount: newState.missCount + 1,
      };
      if (newState.health > 0) {
        const healthChange = calculateHealthChange("miss", note.kind);
        const newCombo = 0;
        newState = {
          ...newState,
          combo: newCombo,
          health: Math.min(100, Math.max(0, newState.health + healthChange)),
        };
        if (newState.health <= 0) {
          newState = { ...newState, health: 0 };
          events.push({ type: "death", timeMs: newState.songPositionMs });
        }
      } else {
        newState = { ...newState, combo: 0 };
      }
      events.push({ type: "note_miss", timeMs: note.timeMs + 135, noteIndex: i });
    }
  }

  if (!newState.songEnded && newPosition >= chart.songDurationMs) {
    newState = { ...newState, songEnded: true };
    events.push({ type: "song_end", timeMs: newPosition });
  }

  return { state: newState, events };
}

function processKeyPress(
  state: EngineState,
  lane: Lane,
  songPositionMs: number,
  chart: Chart,
): { state: EngineState; events: EngineEvent[] } {
  if (state.health <= 0) return { state, events: [] };

  const maxWindow = chart.difficulty === "easy" ? 180 : chart.difficulty === "hard" ? 105 : chart.difficulty === "insane" ? 90 : 135;
  
  let nearestIdx = -1;
  let nearestDiff = maxWindow + 1;

  for (let i = 0; i < chart.notes.length; i++) {
    if (state.noteResults.some((r) => r.noteIndex === i)) continue;
    const note = chart.notes[i];
    if (note.lane !== lane) continue;
    const diff = Math.abs(songPositionMs - note.timeMs);
    if (diff <= maxWindow && diff < nearestDiff) {
      nearestDiff = diff;
      nearestIdx = i;
    }
  }

  if (nearestIdx === -1) return { state, events: [] };

  return processNoteHit(state, nearestIdx, songPositionMs, chart);
}

function processKeyRelease(
  state: EngineState,
  lane: Lane,
  songPositionMs: number,
  chart: Chart,
): { state: EngineState; events: EngineEvent[] } {
  return processHoldRelease(state, lane, songPositionMs, chart);
}

function getAccuracy(state: EngineState): number {
  const total = state.perfectCount + state.goodCount + state.badCount + state.missCount;
  if (total === 0) return 0;
  return (state.perfectCount * 100 + state.goodCount * 75 + state.badCount * 25) / total;
}

function getRatingLetter(accuracy: number): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (accuracy >= 95) return 'S';
  if (accuracy >= 85) return 'A';
  if (accuracy >= 70) return 'B';
  if (accuracy >= 50) return 'C';
  if (accuracy >= 30) return 'D';
  return 'F';
}

export type { NoteKind, Lane, Judgment, Difficulty, Note, Chart, EngineState, EngineEvent, CNENote, CNEStrumLine, CNEChart };
export {
  generateChart,
  parseCNEChart,
  createInitialState,
  judgeNote,
  calculateScore,
  calculateHealthChange,
  processNoteHit,
  processHoldRelease,
  processSongTick,
  processKeyPress,
  processKeyRelease,
  getAccuracy,
  getRatingLetter,
};
