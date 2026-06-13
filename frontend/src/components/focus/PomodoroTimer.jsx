import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, TimerReset } from "lucide-react";
import {
  PHASES,
  PHASE_LABELS,
  DEFAULT_SETTINGS,
  FOCUS_OPTIONS,
  SHORT_BREAK_OPTIONS,
  LONG_BREAK_OPTIONS,
  phaseDurationMinutes,
  nextPhase,
  formatTime,
} from "../../utils/pomodoro";

const SETTINGS_KEY = "focus-timer-settings";

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function PomodoroTimer({ onFocusComplete }) {
  const [settings, setSettings] = useState(loadSettings);
  const [phase, setPhase] = useState(PHASES.FOCUS);
  const [running, setRunning] = useState(false);
  const [remainingMs, setRemainingMs] = useState(
    () => phaseDurationMinutes(PHASES.FOCUS, loadSettings()) * 60_000
  );
  const [completedCount, setCompletedCount] = useState(0);

  // The countdown is anchored to a wall-clock end time, not a decrementing
  // counter — background tabs throttle intervals, which would silently
  // stretch the session
  const endsAtRef = useRef(null);
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  const stopTicking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const chime = () => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const playTone = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      playTone(880, 0, 0.5);
      playTone(1175, 0.25, 0.6);
    } catch {
      // sound is best-effort
    }
  };

  const notify = (title, body) => {
    try {
      if (window.Notification?.permission === "granted") {
        new Notification(title, { body, icon: "/favicon.png" });
      }
    } catch {
      // notifications are best-effort
    }
  };

  const completePhase = () => {
    stopTicking();
    setRunning(false);
    chime();

    if (phase === PHASES.FOCUS) {
      const newCount = completedCount + 1;
      setCompletedCount(newCount);
      onFocusComplete?.(settings.focus);

      const next = nextPhase(PHASES.FOCUS, newCount, settings.sessionsBeforeLongBreak);
      notify("Focus session complete 🎉", `Time for a ${PHASE_LABELS[next].toLowerCase()}.`);
      setPhase(next);
      setRemainingMs(phaseDurationMinutes(next, settings) * 60_000);
    } else {
      notify("Break's over", "Ready for another focus session?");
      setPhase(PHASES.FOCUS);
      setRemainingMs(phaseDurationMinutes(PHASES.FOCUS, settings) * 60_000);
    }
  };

  const start = () => {
    if (running || remainingMs <= 0) return;

    // First user gesture: unlock audio + ask for notification permission
    if (!audioCtxRef.current && window.AudioContext) {
      audioCtxRef.current = new AudioContext();
    }
    audioCtxRef.current?.resume?.();
    if (window.Notification?.permission === "default") {
      Notification.requestPermission();
    }

    endsAtRef.current = Date.now() + remainingMs;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      const left = endsAtRef.current - Date.now();
      if (left <= 0) {
        setRemainingMs(0);
        completePhaseRef.current();
      } else {
        setRemainingMs(left);
      }
    }, 250);
  };

  // The interval closure must always see the latest phase/count state
  const completePhaseRef = useRef(completePhase);
  completePhaseRef.current = completePhase;

  const pause = () => {
    stopTicking();
    setRunning(false);
  };

  const reset = () => {
    stopTicking();
    setRunning(false);
    setRemainingMs(phaseDurationMinutes(phase, settings) * 60_000);
  };

  const switchPhase = (next) => {
    stopTicking();
    setRunning(false);
    setPhase(next);
    setRemainingMs(phaseDurationMinutes(next, settings) * 60_000);
  };

  const updateSetting = (key, minutes) => {
    const next = { ...settings, [key]: minutes };
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));

    // Apply immediately when the affected phase is idle on screen
    const affected =
      (key === "focus" && phase === PHASES.FOCUS) ||
      (key === "shortBreak" && phase === PHASES.SHORT_BREAK) ||
      (key === "longBreak" && phase === PHASES.LONG_BREAK);
    if (affected && !running) {
      setRemainingMs(minutes * 60_000);
    }
  };

  // Countdown in the tab title while running
  useEffect(() => {
    if (running) {
      document.title = `${formatTime(remainingMs / 1000)} · ${PHASE_LABELS[phase]} — Atelier`;
    }
    return () => {
      document.title = "Atelier";
    };
  }, [running, remainingMs, phase]);

  useEffect(() => stopTicking, []);

  const seconds = remainingMs / 1000;
  const cycleProgress = completedCount % settings.sessionsBeforeLongBreak;

  const phaseTabClass = (p) =>
    `rounded-xl px-3 py-1.5 text-sm font-medium transition hover:cursor-pointer ${
      phase === p
        ? "bg-primary-strong text-white"
        : "text-ink-muted hover:bg-ink/5"
    }`;

  const selectClass =
    "rounded-lg border border-line-strong bg-field px-2 py-1 text-sm text-ink outline-none transition focus:border-primary";

  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition-colors">
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
        {Object.values(PHASES).map((p) => (
          <button key={p} type="button" onClick={() => switchPhase(p)} className={phaseTabClass(p)}>
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      <p
        className="text-center font-bold tabular-nums text-7xl tracking-tight text-ink"
        aria-live="off"
      >
        {formatTime(seconds)}
      </p>

      {/* One dot per focus session in the current cycle */}
      <div className="mt-4 flex items-center justify-center gap-2" title={`${cycleProgress} of ${settings.sessionsBeforeLongBreak} focus sessions until a long break`}>
        {Array.from({ length: settings.sessionsBeforeLongBreak }, (_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              i < cycleProgress ? "bg-primary" : "bg-line"
            }`}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        {running ? (
          <button
            type="button"
            onClick={pause}
            className="flex items-center gap-2 rounded-xl bg-primary-strong px-8 py-3 font-medium text-white transition hover:cursor-pointer hover:bg-primary-strong/85"
          >
            <Pause size={18} /> Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className="flex items-center gap-2 rounded-xl bg-primary-strong px-8 py-3 font-medium text-white transition hover:cursor-pointer hover:bg-primary-strong/85"
          >
            <Play size={18} /> Start
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          title="Reset timer"
          className="flex items-center gap-2 rounded-xl border border-line-strong px-4 py-3 font-medium text-ink transition hover:cursor-pointer hover:bg-ink/5"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-line pt-4 text-sm text-ink-muted">
        <span className="flex items-center gap-1.5">
          <TimerReset size={15} className="text-primary-strong" />
          Durations:
        </span>
        <label className="flex items-center gap-1.5">
          Focus
          <select
            value={settings.focus}
            onChange={(e) => updateSetting("focus", Number(e.target.value))}
            className={selectClass}
          >
            {FOCUS_OPTIONS.map((m) => (
              <option key={m} value={m}>{m} min</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5">
          Short
          <select
            value={settings.shortBreak}
            onChange={(e) => updateSetting("shortBreak", Number(e.target.value))}
            className={selectClass}
          >
            {SHORT_BREAK_OPTIONS.map((m) => (
              <option key={m} value={m}>{m} min</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5">
          Long
          <select
            value={settings.longBreak}
            onChange={(e) => updateSetting("longBreak", Number(e.target.value))}
            className={selectClass}
          >
            {LONG_BREAK_OPTIONS.map((m) => (
              <option key={m} value={m}>{m} min</option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

export default PomodoroTimer;
