import { describe, it, expect } from "vitest";
import {
  generateChart,
  createInitialState,
  judgeNote,
  calculateScore,
  calculateHealthChange,
  processNoteHit,
  processHoldRelease,
  processSongTick,
  processKeyPress,
  processBotTick,
  getAccuracy,
  getRatingLetter,
} from "./engine";
import type { Chart, EngineState, Lane } from "./engine";

function holdChart(lane: Lane, timeMs: number, durationMs: number): Chart {
  return {
    notes: [{ kind: "hold", lane, timeMs, durationMs }],
    oppNotes: [],
    songDurationMs: 10000,
    bpm: 120,
    scrollSpeed: 1,
  };
}

function tapChart(lane: Lane, timeMs: number): Chart {
  return {
    notes: [{ kind: "tap", lane, timeMs, durationMs: 0 }],
    oppNotes: [],
    songDurationMs: 10000,
    bpm: 120,
    scrollSpeed: 1,
  };
}

function emptyChart(): Chart {
  return { notes: [], oppNotes: [], songDurationMs: 10000, bpm: 120, scrollSpeed: 1 };
}

function chart5000(): Chart {
  return { notes: [], oppNotes: [], songDurationMs: 5000, bpm: 120, scrollSpeed: 1 };
}

describe("generateChart", () => {
  it("produces deterministic output for same songIndex", () => {
    const a = generateChart(0);
    const b = generateChart(0);
    expect(a).toEqual(b);
  });

  it("produces different output for different songIndex", () => {
    const a = generateChart(0);
    const b = generateChart(1);
    expect(a).not.toEqual(b);
  });

  it("first note at >= 2000ms", () => {
    for (let i = 0; i < 10; i++) {
      const chart = generateChart(i);
      expect(chart.notes[0].timeMs).toBeGreaterThanOrEqual(2000);
    }
  });

  it("has both tap and hold notes", () => {
    const chart = generateChart(0);
    expect(chart.notes.some((n) => n.kind === "tap")).toBe(true);
    expect(chart.notes.some((n) => n.kind === "hold")).toBe(true);
  });

  it("has bpm field", () => {
    const chart = generateChart(0);
    expect(chart.bpm).toBeGreaterThan(0);
  });
});

describe("judgeNote", () => {
  it("perfect within 45ms", () => {
    expect(judgeNote(1000, 1000)).toBe("perfect");
    expect(judgeNote(1045, 1000)).toBe("perfect");
    expect(judgeNote(955, 1000)).toBe("perfect");
  });

  it("good within 45-90ms", () => {
    expect(judgeNote(1090, 1000)).toBe("good");
    expect(judgeNote(910, 1000)).toBe("good");
    expect(judgeNote(1046, 1000)).toBe("good");
    expect(judgeNote(954, 1000)).toBe("good");
  });

  it("bad within 90-135ms", () => {
    expect(judgeNote(1135, 1000)).toBe("bad");
    expect(judgeNote(865, 1000)).toBe("bad");
    expect(judgeNote(1091, 1000)).toBe("bad");
    expect(judgeNote(909, 1000)).toBe("bad");
  });

  it("miss beyond 135ms", () => {
    expect(judgeNote(1136, 1000)).toBe("miss");
    expect(judgeNote(864, 1000)).toBe("miss");
    expect(judgeNote(2000, 1000)).toBe("miss");
    expect(judgeNote(0, 1000)).toBe("miss");
  });
});

describe("calculateScore", () => {
  it("perfect: 300 + floor(combo/10) * 50", () => {
    expect(calculateScore("perfect", 0)).toBe(300);
    expect(calculateScore("perfect", 9)).toBe(300);
    expect(calculateScore("perfect", 10)).toBe(350);
    expect(calculateScore("perfect", 24)).toBe(400);
  });

  it("good: 100 + floor(combo/10) * 25", () => {
    expect(calculateScore("good", 0)).toBe(100);
    expect(calculateScore("good", 9)).toBe(100);
    expect(calculateScore("good", 10)).toBe(125);
    expect(calculateScore("good", 24)).toBe(150);
  });

  it("bad: 50 + floor(combo/10) * 10", () => {
    expect(calculateScore("bad", 0)).toBe(50);
    expect(calculateScore("bad", 9)).toBe(50);
    expect(calculateScore("bad", 10)).toBe(60);
    expect(calculateScore("bad", 24)).toBe(70);
  });

  it("miss: 0 regardless of combo", () => {
    expect(calculateScore("miss", 0)).toBe(0);
    expect(calculateScore("miss", 50)).toBe(0);
  });
});

describe("calculateHealthChange", () => {
  it("tap: perfect +2, good +1, bad 0, miss -5", () => {
    expect(calculateHealthChange("perfect", "tap")).toBe(2);
    expect(calculateHealthChange("good", "tap")).toBe(1);
    expect(calculateHealthChange("bad", "tap")).toBe(0);
    expect(calculateHealthChange("miss", "tap")).toBe(-5);
  });

  it("hold: perfect +3, good +1, bad 0, miss -7", () => {
    expect(calculateHealthChange("perfect", "hold")).toBe(3);
    expect(calculateHealthChange("good", "hold")).toBe(1);
    expect(calculateHealthChange("bad", "hold")).toBe(0);
    expect(calculateHealthChange("miss", "hold")).toBe(-7);
  });
});

describe("processNoteHit", () => {
  it("processes a perfect hit correctly", () => {
    const chart = tapChart(0, 5000);
    const state = createInitialState();
    const { state: newState, events } = processNoteHit(state, 0, 5000, chart);
    expect(newState.score).toBeGreaterThan(0);
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].type).toBe("note_hit");
    expect(events[0].judgment).toBe("perfect");
  });

  it("processes a miss correctly", () => {
    const chart = tapChart(0, 5000);
    const state = createInitialState();
    const { state: newState, events } = processNoteHit(state, 0, 6000, chart);
    expect(newState.score).toBe(0);
    expect(newState.combo).toBe(0);
    expect(events[0].type).toBe("note_miss");
  });

  it("same note twice -> no double score", () => {
    const chart = tapChart(0, 5000);
    const state = createInitialState();
    const { state: first } = processNoteHit(state, 0, 5000, chart);
    const scoreAfterFirst = first.score;
    const { state: second } = processNoteHit(first, 0, 5000, chart);
    expect(second.score).toBe(scoreAfterFirst);
    expect(second.noteResults.length).toBe(1);
  });

  it("adds hold to activeHolds on hit", () => {
    const chart = holdChart(0, 5000, 2000);
    const state = createInitialState();
    const { state: newState } = processNoteHit(state, 0, 5000, chart);
    expect(newState.activeHolds.has(0)).toBe(true);
    expect(newState.noteResults.length).toBe(1);
    expect(newState.noteResults[0].judgment).toBe("perfect");
  });

  it("tracks perfectCount on perfect hit", () => {
    const chart = tapChart(0, 5000);
    const state = createInitialState();
    const { state: newState } = processNoteHit(state, 0, 5000, chart);
    expect(newState.perfectCount).toBe(1);
    expect(newState.goodCount).toBe(0);
    expect(newState.badCount).toBe(0);
    expect(newState.missCount).toBe(0);
  });

  it("tracks missCount on miss", () => {
    const chart = tapChart(0, 5000);
    const state = createInitialState();
    const { state: newState } = processNoteHit(state, 0, 6000, chart);
    expect(newState.missCount).toBe(1);
  });
});

describe("processKeyPress", () => {
  it("hit a note -> score increases", () => {
    const chart = tapChart(0, 5000);
    const state = createInitialState();
    const { state: newState, events } = processKeyPress(state, 0, 5000, chart);
    expect(newState.score).toBeGreaterThan(0);
    expect(events.length).toBeGreaterThan(0);
  });

  it("wrong lane -> no-op", () => {
    const chart = tapChart(1, 5000);
    const state = createInitialState();
    const { state: newState } = processKeyPress(state, 0, 5000, chart);
    expect(newState).toEqual(state);
  });

  it("same note twice -> no double score", () => {
    const chart = tapChart(0, 5000);
    const state = createInitialState();
    const { state: first } = processKeyPress(state, 0, 5000, chart);
    expect(first.score).toBeGreaterThan(0);
    const { state: second } = processKeyPress(first, 0, 5000, chart);
    expect(second.score).toBe(first.score);
  });

  it("empty press when no note in window -> no-op", () => {
    const chart = tapChart(0, 5000);
    const state = createInitialState();
    const { state: newState } = processKeyPress(state, 0, 1000, chart);
    expect(newState).toEqual(state);
  });

  it("presses nearest note in lane", () => {
    const chart: Chart = {
      notes: [
        { kind: "tap", lane: 0, timeMs: 5000, durationMs: 0 },
        { kind: "tap", lane: 0, timeMs: 5300, durationMs: 0 },
      ],
      oppNotes: [],
      songDurationMs: 10000,
      bpm: 120,
      scrollSpeed: 1,
    };
    const state = createInitialState();
    const { state: newState } = processKeyPress(state, 0, 5100, chart);
    expect(newState.noteResults.length).toBe(1);
    expect(newState.noteResults[0].noteIndex).toBe(0);
  });

  it("press does nothing after death", () => {
    const chart: Chart = {
      notes: [
        { kind: "tap", lane: 0, timeMs: 1000, durationMs: 0 },
        { kind: "tap", lane: 0, timeMs: 3000, durationMs: 0 },
      ],
      oppNotes: [],
      songDurationMs: 10000,
      bpm: 120,
      scrollSpeed: 1,
    };
    const nearDeath: EngineState = { ...createInitialState(), health: 3 };
    const { state: afterDeath } = processNoteHit(nearDeath, 0, 2000, chart);
    expect(afterDeath.health).toBe(0);
    const scoreAtDeath = afterDeath.score;
    const { state: afterSecond } = processKeyPress(afterDeath, 0, 3000, chart);
    expect(afterSecond.score).toBe(scoreAtDeath);
    expect(afterSecond.health).toBe(0);
  });
});

describe("processHoldRelease", () => {
  it("hold >= 90% -> hold_complete", () => {
    const chart = holdChart(0, 1000, 2000);
    const state = createInitialState();
    const { state: afterHit } = processNoteHit(state, 0, 1000, chart);
    expect(afterHit.activeHolds.has(0)).toBe(true);
    const { state: afterRelease, events } = processHoldRelease(
      afterHit,
      0,
      1000 + 2000 * 0.95,
      chart,
    );
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].type).toBe("hold_complete");
  });

  it("hold < 90% -> hold_dropped", () => {
    const chart = holdChart(0, 1000, 2000);
    const state = createInitialState();
    const { state: afterHit } = processNoteHit(state, 0, 1000, chart);
    const { events } = processHoldRelease(afterHit, 0, 1000 + 2000 * 0.5, chart);
    expect(events[0].type).toBe("hold_dropped");
  });

  it("hold dropped resets combo", () => {
    const chart = holdChart(0, 1000, 2000);
    const state: EngineState = { ...createInitialState(), combo: 50 };
    const { state: afterHit } = processNoteHit(state, 0, 1000, chart);
    const { state: afterDrop } = processHoldRelease(afterHit, 0, 1500, chart);
    expect(afterDrop.combo).toBe(0);
  });

  it("hold dropped just under 90% coverage", () => {
    const chart = holdChart(0, 1000, 2000);
    const state = createInitialState();
    const { state: afterHit } = processNoteHit(state, 0, 1000, chart);
    const { events } = processHoldRelease(afterHit, 0, 1000 + 2000 * 0.89, chart);
    expect(events[0].type).toBe("hold_dropped");
  });

  it("hold exactly at 90% coverage -> hold_complete", () => {
    const chart = holdChart(0, 1000, 2000);
    const state = createInitialState();
    const { state: afterHit } = processNoteHit(state, 0, 1000, chart);
    const { events } = processHoldRelease(afterHit, 0, 1000 + 2000 * 0.9, chart);
    expect(events[0].type).toBe("hold_complete");
  });

  it("no active hold on lane -> no-op", () => {
    const chart = holdChart(0, 1000, 2000);
    const state = createInitialState();
    const { state: newState } = processHoldRelease(state, 1, 2000, chart);
    expect(newState).toEqual(state);
  });

  it("removes from activeHolds after release", () => {
    const chart = holdChart(0, 1000, 2000);
    const state = createInitialState();
    const { state: afterHit } = processNoteHit(state, 0, 1000, chart);
    expect(afterHit.activeHolds.has(0)).toBe(true);
    const { state: afterRelease } = processHoldRelease(afterHit, 0, 2000, chart);
    expect(afterRelease.activeHolds.has(0)).toBe(false);
  });
});

describe("processSongTick", () => {
  it("advances song position", () => {
    const chart = emptyChart();
    const state = createInitialState();
    const { state: newState } = processSongTick(state, 1000, chart);
    expect(newState.songPositionMs).toBe(1000);
  });

  it("auto-misses expired notes", () => {
    const chart: Chart = {
      notes: [{ kind: "tap", lane: 0, timeMs: 1000, durationMs: 0 }],
      oppNotes: [],
      songDurationMs: 10000,
      bpm: 120,
      scrollSpeed: 1,
    };
    const state = createInitialState();
    const { state: newState } = processSongTick(state, 2000, chart);
    expect(newState.noteResults.length).toBe(1);
    expect(newState.noteResults[0].judgment).toBe("miss");
  });

  it("reaches song end", () => {
    const chart = chart5000();
    const state = createInitialState();
    const { state: newState, events } = processSongTick(state, 5000, chart);
    expect(newState.songPositionMs).toBe(5000);
    expect(newState.songEnded).toBe(true);
    expect(events.some((e) => e.type === "song_end")).toBe(true);
  });

  it("does not emit song_end twice", () => {
    const chart = chart5000();
    const state = createInitialState();
    const { state: afterFirst } = processSongTick(state, 5000, chart);
    expect(afterFirst.songEnded).toBe(true);
    const { state: afterSecond, events } = processSongTick(afterFirst, 1000, chart);
    expect(events.some((e) => e.type === "song_end")).toBe(false);
  });

  it("auto-drops expired hold notes", () => {
    const chart = holdChart(0, 1000, 500);
    const state = createInitialState();
    const { state: afterHit } = processNoteHit(state, 0, 1000, chart);
    expect(afterHit.activeHolds.has(0)).toBe(true);
    const { events } = processSongTick(afterHit, 2000, chart);
    expect(events.some((e) => e.type === "hold_complete" || e.type === "hold_dropped")).toBe(true);
  });

  it("auto-miss increments missCount", () => {
    const chart: Chart = {
      notes: [{ kind: "tap", lane: 0, timeMs: 1000, durationMs: 0 }],
      oppNotes: [],
      songDurationMs: 10000,
      bpm: 120,
      scrollSpeed: 1,
    };
    const state = createInitialState();
    const { state: newState } = processSongTick(state, 2000, chart);
    expect(newState.missCount).toBe(1);
  });
});

describe("processKeyRelease", () => {
  it("delegates hold release correctly", async () => {
    const { processKeyRelease } = await import("./engine");
    const chart = holdChart(0, 1000, 2000);
    const state = createInitialState();
    const { state: afterHit } = processNoteHit(state, 0, 1000, chart);
    const { state: afterRelease, events } = processKeyRelease(afterHit, 0, 1500, chart);
    expect(events.some((e) => e.type === "hold_dropped" || e.type === "hold_complete")).toBe(true);
    expect(afterRelease.activeHolds.has(0)).toBe(false);
  });
});

describe("health and death", () => {
  it("health reaches 0 -> death event", () => {
    const chart: Chart = {
      notes: [{ kind: "tap", lane: 0, timeMs: 1000, durationMs: 0 }],
      oppNotes: [],
      songDurationMs: 10000,
      bpm: 120,
      scrollSpeed: 1,
    };
    const state: EngineState = { ...createInitialState(), health: 3 };
    const { state: newState, events } = processNoteHit(state, 0, 2000, chart);
    expect(newState.health).toBe(0);
    expect(newState.noteResults[0].judgment).toBe("miss");
    expect(events.some((e) => e.type === "death")).toBe(true);
  });

  it("death stops further scoring", () => {
    const chart: Chart = {
      notes: [
        { kind: "tap", lane: 0, timeMs: 1000, durationMs: 0 },
        { kind: "tap", lane: 1, timeMs: 2000, durationMs: 0 },
      ],
      oppNotes: [],
      songDurationMs: 10000,
      bpm: 120,
      scrollSpeed: 1,
    };
    const state: EngineState = { ...createInitialState(), health: 3 };
    const { state: afterDeath } = processNoteHit(state, 0, 2000, chart);
    expect(afterDeath.health).toBe(0);
    expect(afterDeath.noteResults.length).toBe(1);
    const scoreAtDeath = afterDeath.score;
    const { state: afterSecondHit } = processNoteHit(afterDeath, 1, 2000, chart);
    expect(afterSecondHit.score).toBe(scoreAtDeath);
    expect(afterSecondHit.health).toBe(0);
    expect(afterSecondHit.noteResults.length).toBe(1);
  });

  it("health never goes below 0", () => {
    const chart: Chart = {
      notes: [{ kind: "tap", lane: 0, timeMs: 1000, durationMs: 0 }],
      oppNotes: [],
      songDurationMs: 10000,
      bpm: 120,
      scrollSpeed: 1,
    };
    const state: EngineState = { ...createInitialState(), health: 1 };
    const { state: newState } = processNoteHit(state, 0, 2000, chart);
    expect(newState.health).toBe(0);
  });

  it("health never goes above 100", () => {
    const chart: Chart = {
      notes: [{ kind: "tap", lane: 0, timeMs: 1000, durationMs: 0 }],
      oppNotes: [],
      songDurationMs: 10000,
      bpm: 120,
      scrollSpeed: 1,
    };
    const state: EngineState = { ...createInitialState(), health: 99 };
    const { state: newState } = processNoteHit(state, 0, 1000, chart);
    expect(newState.health).toBe(100);
  });

  it("score never decreases", () => {
    const chart: Chart = {
      notes: [
        { kind: "tap", lane: 0, timeMs: 1000, durationMs: 0 },
        { kind: "tap", lane: 1, timeMs: 3000, durationMs: 0 },
      ],
      oppNotes: [],
      songDurationMs: 10000,
      bpm: 120,
      scrollSpeed: 1,
    };
    let state = createInitialState();
    const { state: s1 } = processNoteHit(state, 0, 1000, chart);
    expect(s1.score).toBeGreaterThanOrEqual(0);
    const scoreAfterHit = s1.score;
    const { state: s2 } = processNoteHit(s1, 1, 5000, chart);
    expect(s2.score).toBe(scoreAfterHit);
  });
});

describe("edge cases", () => {
  it("song ends exactly at duration boundary", () => {
    const chart = chart5000();
    const state = createInitialState();
    const { state: newState } = processSongTick(state, 5000, chart);
    expect(newState.songPositionMs).toBe(5000);
    expect(newState.songEnded).toBe(true);
  });

  it("auto-misses multiple expired notes in one tick", () => {
    const chart: Chart = {
      notes: [
        { kind: "tap", lane: 0, timeMs: 500, durationMs: 0 },
        { kind: "tap", lane: 1, timeMs: 800, durationMs: 0 },
      ],
      oppNotes: [],
      songDurationMs: 10000,
      bpm: 120,
      scrollSpeed: 1,
    };
    const state = createInitialState();
    const { state: newState } = processSongTick(state, 2000, chart);
    expect(newState.noteResults.length).toBe(2);
    expect(newState.noteResults.every((r) => r.judgment === "miss")).toBe(true);
  });

  it("hold dropped does not affect score (score from initial hit only)", () => {
    const chart = holdChart(0, 1000, 2000);
    const state = createInitialState();
    const { state: afterHit } = processNoteHit(state, 0, 1000, chart);
    const scoreAfterHit = afterHit.score;
    const { state: afterDrop } = processHoldRelease(afterHit, 0, 1500, chart);
    expect(afterDrop.score).toBe(scoreAfterHit);
  });

  it("hold dropped after death is no-op for health", () => {
    const chart: Chart = {
      notes: [
        { kind: "hold", lane: 0, timeMs: 1000, durationMs: 2000 },
        { kind: "hold", lane: 1, timeMs: 1100, durationMs: 1000 },
      ],
      oppNotes: [],
      songDurationMs: 10000,
      bpm: 120,
      scrollSpeed: 1,
    };
    const state: EngineState = { ...createInitialState(), health: 4 };
    const { state: afterHit } = processNoteHit(state, 0, 1000, chart);
    expect(afterHit.activeHolds.has(0)).toBe(true);
    expect(afterHit.health).toBe(7);
    const { state: afterDeath } = processNoteHit(afterHit, 1, 5000, chart);
    expect(afterDeath.health).toBe(0);
    expect(afterDeath.activeHolds.has(0)).toBe(true);
    const { state: afterRelease } = processHoldRelease(afterDeath, 0, 2500, chart);
    expect(afterRelease.health).toBe(0);
    expect(afterRelease.activeHolds.has(0)).toBe(false);
  });

  it("processKeyPress on dead state is no-op", () => {
    const chart: Chart = {
      notes: [{ kind: "tap", lane: 0, timeMs: 5000, durationMs: 0 }],
      oppNotes: [],
      songDurationMs: 10000,
      bpm: 120,
      scrollSpeed: 1,
    };
    const deadState: EngineState = { ...createInitialState(), health: 0 };
    const { state: newState } = processKeyPress(deadState, 0, 5000, chart);
    expect(newState).toEqual(deadState);
  });
});

describe("getAccuracy", () => {
  it("perfect + good + bad + miss = accuracy weighted by quality", () => {
    const state: EngineState = {
      ...createInitialState(),
      perfectCount: 10,
      goodCount: 5,
      badCount: 3,
      missCount: 2,
    };
    const acc = getAccuracy(state);
    const expected = (10 * 100 + 5 * 75 + 3 * 25) / 20;
    expect(acc).toBeCloseTo(expected);
  });

  it("all perfect = 100%", () => {
    const state: EngineState = {
      ...createInitialState(),
      perfectCount: 50,
    };
    expect(getAccuracy(state)).toBe(100);
  });

  it("all miss = 0%", () => {
    const state: EngineState = {
      ...createInitialState(),
      missCount: 50,
    };
    expect(getAccuracy(state)).toBe(0);
  });

  it("no notes = 0%", () => {
    expect(getAccuracy(createInitialState())).toBe(0);
  });
});

describe("getRatingLetter", () => {
  it("S for >= 95", () => {
    expect(getRatingLetter(95)).toBe("S");
    expect(getRatingLetter(100)).toBe("S");
  });

  it("A for 85-94", () => {
    expect(getRatingLetter(85)).toBe("A");
    expect(getRatingLetter(94)).toBe("A");
  });

  it("B for 70-84", () => {
    expect(getRatingLetter(70)).toBe("B");
    expect(getRatingLetter(84)).toBe("B");
  });

  it("C for 50-69", () => {
    expect(getRatingLetter(50)).toBe("C");
    expect(getRatingLetter(69)).toBe("C");
  });

  it("D for 30-49", () => {
    expect(getRatingLetter(30)).toBe("D");
    expect(getRatingLetter(49)).toBe("D");
  });

  it("F for < 30", () => {
    expect(getRatingLetter(0)).toBe("F");
    expect(getRatingLetter(29)).toBe("F");
  });
});

describe("processBotTick", () => {
  it("hits a due note (songPositionMs >= note.timeMs)", () => {
    const chart = tapChart(0, 5000);
    const state = { ...createInitialState(), songPositionMs: 5000 };
    const { state: newState, events } = processBotTick(state, chart);
    expect(newState.noteResults.length).toBe(1);
    expect(newState.noteResults[0].judgment).toBe("perfect");
    expect(events.some((e) => e.type === "note_hit")).toBe(true);
  });

  it("skips future notes (songPositionMs < note.timeMs)", () => {
    const chart = tapChart(0, 5000);
    const state = { ...createInitialState(), songPositionMs: 4000 };
    const { state: newState, events } = processBotTick(state, chart);
    expect(newState.noteResults.length).toBe(0);
    expect(events.length).toBe(0);
  });

  it("skips already-hit notes", () => {
    const chart = tapChart(0, 5000);
    const state = createInitialState();
    const hit = processKeyPress(state, 0, 5000, chart);
    const { state: newState, events } = processBotTick(hit.state, chart);
    expect(newState.noteResults.length).toBe(1);
    expect(events.length).toBe(0);
  });

  it("hits notes in different lanes", () => {
    const chart: Chart = {
      notes: [
        { kind: "tap", lane: 0, timeMs: 1000, durationMs: 0 },
        { kind: "tap", lane: 1, timeMs: 1000, durationMs: 0 },
        { kind: "tap", lane: 2, timeMs: 1000, durationMs: 0 },
      ],
      oppNotes: [],
      songDurationMs: 10000,
      bpm: 120,
      scrollSpeed: 1,
    };
    const state = { ...createInitialState(), songPositionMs: 1000 };
    const { state: newState } = processBotTick(state, chart);
    expect(newState.noteResults.length).toBe(3);
  });

  it("one hit per lane per tick (multiple notes same lane)", () => {
    const chart: Chart = {
      notes: [
        { kind: "tap", lane: 0, timeMs: 1000, durationMs: 0 },
        { kind: "tap", lane: 0, timeMs: 1100, durationMs: 0 },
      ],
      oppNotes: [],
      songDurationMs: 10000,
      bpm: 120,
      scrollSpeed: 1,
    };
    const state = { ...createInitialState(), songPositionMs: 1100 };
    const { state: first } = processBotTick(state, chart);
    expect(first.noteResults.length).toBe(1);
    const { state: second } = processBotTick(first, chart);
    expect(second.noteResults.length).toBe(2);
  });

  it("deterministic multi-tick sweep hits all notes", () => {
    const chart: Chart = {
      notes: [
        { kind: "tap", lane: 0, timeMs: 1000, durationMs: 0 },
        { kind: "tap", lane: 1, timeMs: 1200, durationMs: 0 },
        { kind: "tap", lane: 2, timeMs: 1400, durationMs: 0 },
        { kind: "tap", lane: 3, timeMs: 1600, durationMs: 0 },
        { kind: "tap", lane: 0, timeMs: 1800, durationMs: 0 },
      ],
      oppNotes: [],
      songDurationMs: 10000,
      bpm: 120,
      scrollSpeed: 1,
    };
    let state: EngineState = createInitialState();
    for (let t = 0; t <= 2000; t += 16) {
      state = { ...state, songPositionMs: t };
      const tick = processSongTick(state, 16, chart);
      state = tick.state;
      const bot = processBotTick(state, chart);
      state = bot.state;
    }
    expect(state.noteResults.length).toBe(5);
    expect(state.missCount).toBe(0);
  });

  it("no-op on dead state", () => {
    const chart = tapChart(0, 5000);
    const state = { ...createInitialState(), health: 0, songPositionMs: 5000 };
    const { state: newState, events } = processBotTick(state, chart);
    expect(newState).toEqual(state);
    expect(events.length).toBe(0);
  });

  it("no-op on ended song", () => {
    const chart = tapChart(0, 5000);
    const state = { ...createInitialState(), songEnded: true, songPositionMs: 5000 };
    const { state: newState, events } = processBotTick(state, chart);
    expect(newState).toEqual(state);
    expect(events.length).toBe(0);
  });
});
