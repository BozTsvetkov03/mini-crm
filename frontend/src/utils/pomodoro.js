export const PHASES = {
  FOCUS: "focus",
  SHORT_BREAK: "shortBreak",
  LONG_BREAK: "longBreak",
};

export const PHASE_LABELS = {
  [PHASES.FOCUS]: "Focus",
  [PHASES.SHORT_BREAK]: "Short break",
  [PHASES.LONG_BREAK]: "Long break",
};

export const DEFAULT_SETTINGS = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsBeforeLongBreak: 4,
};

export const FOCUS_OPTIONS = [15, 20, 25, 30, 45, 50, 60];
export const SHORT_BREAK_OPTIONS = [3, 5, 10];
export const LONG_BREAK_OPTIONS = [10, 15, 20, 30];

export function phaseDurationMinutes(phase, settings) {
  switch (phase) {
    case PHASES.SHORT_BREAK:
      return settings.shortBreak;
    case PHASES.LONG_BREAK:
      return settings.longBreak;
    default:
      return settings.focus;
  }
}

// completedFocusCount counts focus phases finished INCLUDING the one that
// just ended; every Nth earns the long break
export function nextPhase(currentPhase, completedFocusCount, sessionsBeforeLongBreak) {
  if (currentPhase !== PHASES.FOCUS) return PHASES.FOCUS;

  return completedFocusCount % sessionsBeforeLongBreak === 0
    ? PHASES.LONG_BREAK
    : PHASES.SHORT_BREAK;
}

export function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// Aggregates API sessions into the stats row; "today" is the browser's local day
export function summarizeSessions(sessions, now = new Date()) {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  let todayCount = 0;
  let todayMinutes = 0;
  let weekCount = 0;
  let weekMinutes = 0;

  for (const s of sessions) {
    const completedAt = new Date(s.completedAt);
    weekCount += 1;
    weekMinutes += s.durationMinutes;
    if (completedAt >= startOfToday) {
      todayCount += 1;
      todayMinutes += s.durationMinutes;
    }
  }

  return { todayCount, todayMinutes, weekCount, weekMinutes };
}
