type NoteKind = "tap" | "hold";
type Lane = 0 | 1 | 2 | 3;
type Judgment = "perfect" | "good" | "bad" | "miss";

interface Note {
  kind: NoteKind;
  lane: Lane;
  timeMs: number;
  durationMs: number;
}

interface Chart {
  notes: Note[];
  songDurationMs: number;
  bpm: number;
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

function generateChart(songIndex: number): Chart {
  const rng = createRng(songIndex * 2654435761 + 12345);
  const bpm = [120, 130, 140, 150, 160][songIndex] || 120;
  const seconds = [30, 45, 60, 75, 90][songIndex] || 30;
  const songDurationMs = seconds * 1000;
  const beatMs = (60_000 / bpm);
  const totalBeats = Math.floor((songDurationMs - 1500) / beatMs);
  const notes: Note[] = [];

  for (let beat = 0; beat < totalBeats; beat++) {
    const timeMs = beat * beatMs + 2000;
    const noise = rng();
    const shouldPlace = noise < 0.55 + 0.15 * Math.sin(beat * 0.3);
    if (!shouldPlace) continue;
    const lane = Math.floor(rng() * 4) as Lane;
    const isHold = rng() < 0.3;
    const durationMs = isHold ? Math.round(beatMs * (1 + rng() * 3)) : 0;
    notes.push({
      kind: isHold ? "hold" : "tap",
      lane,
      timeMs: Math.round(timeMs),
      durationMs,
    });
  }

  return { notes, songDurationMs, bpm };
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

function judgeNote(songPositionMs: number, noteTimeMs: number): Judgment {
  const diff = Math.abs(songPositionMs - noteTimeMs);
  if (diff <= 45) return "perfect";
  if (diff <= 90) return "good";
  if (diff <= 135) return "bad";
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

  const judgment = judgeNote(songPositionMs, note.timeMs);
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

  for (let i = 0; i < chart.notes.length; i++) {
    if (newState.noteResults.some((r) => r.noteIndex === i)) continue;
    const note = chart.notes[i];
    if (newPosition > note.timeMs + 135) {
      const missResult = { noteIndex: i, judgment: "miss" as Judgment, timeMs: note.timeMs + 135 };
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

  let nearestIdx = -1;
  let nearestDiff = 136;

  for (let i = 0; i < chart.notes.length; i++) {
    if (state.noteResults.some((r) => r.noteIndex === i)) continue;
    const note = chart.notes[i];
    if (note.lane !== lane) continue;
    const diff = Math.abs(songPositionMs - note.timeMs);
    if (diff <= 135 && diff < nearestDiff) {
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

export type { NoteKind, Lane, Judgment, Note, Chart, EngineState, EngineEvent };
export {
  generateChart,
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
