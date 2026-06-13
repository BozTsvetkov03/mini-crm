import { describe, it, expect } from "vitest";
import {
  PHASES,
  DEFAULT_SETTINGS,
  nextPhase,
  formatTime,
  phaseDurationMinutes,
  summarizeSessions,
} from "./pomodoro";

describe("formatTime", () => {
  it("pads minutes and seconds", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(9)).toBe("00:09");
    expect(formatTime(65)).toBe("01:05");
    expect(formatTime(25 * 60)).toBe("25:00");
  });

  it("clamps negatives to zero", () => {
    expect(formatTime(-3)).toBe("00:00");
  });
});

describe("nextPhase", () => {
  it("gives a short break after most focus sessions", () => {
    expect(nextPhase(PHASES.FOCUS, 1, 4)).toBe(PHASES.SHORT_BREAK);
    expect(nextPhase(PHASES.FOCUS, 3, 4)).toBe(PHASES.SHORT_BREAK);
  });

  it("gives a long break after every Nth focus session", () => {
    expect(nextPhase(PHASES.FOCUS, 4, 4)).toBe(PHASES.LONG_BREAK);
    expect(nextPhase(PHASES.FOCUS, 8, 4)).toBe(PHASES.LONG_BREAK);
  });

  it("always returns to focus after any break", () => {
    expect(nextPhase(PHASES.SHORT_BREAK, 2, 4)).toBe(PHASES.FOCUS);
    expect(nextPhase(PHASES.LONG_BREAK, 4, 4)).toBe(PHASES.FOCUS);
  });
});

describe("phaseDurationMinutes", () => {
  it("maps phases to configured durations", () => {
    expect(phaseDurationMinutes(PHASES.FOCUS, DEFAULT_SETTINGS)).toBe(25);
    expect(phaseDurationMinutes(PHASES.SHORT_BREAK, DEFAULT_SETTINGS)).toBe(5);
    expect(phaseDurationMinutes(PHASES.LONG_BREAK, DEFAULT_SETTINGS)).toBe(15);
  });
});

describe("summarizeSessions", () => {
  it("splits today's sessions from the rest of the week", () => {
    const now = new Date("2026-06-13T15:00:00");
    const sessions = [
      { completedAt: "2026-06-13T09:30:00", durationMinutes: 25 },
      { completedAt: "2026-06-13T11:00:00", durationMinutes: 50 },
      { completedAt: "2026-06-10T10:00:00", durationMinutes: 25 },
    ];

    const stats = summarizeSessions(sessions, now);

    expect(stats.todayCount).toBe(2);
    expect(stats.todayMinutes).toBe(75);
    expect(stats.weekCount).toBe(3);
    expect(stats.weekMinutes).toBe(100);
  });

  it("handles empty lists", () => {
    expect(summarizeSessions([])).toEqual({
      todayCount: 0,
      todayMinutes: 0,
      weekCount: 0,
      weekMinutes: 0,
    });
  });
});
