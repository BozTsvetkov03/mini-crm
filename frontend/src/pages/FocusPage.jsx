import { useCallback, useEffect, useState } from "react";
import { Flame, CalendarRange } from "lucide-react";
import PomodoroTimer from "../components/focus/PomodoroTimer";
import LofiPlayer from "../components/focus/LofiPlayer";
import { getFocusSessions, logFocusSession } from "../api/focusApi";
import { summarizeSessions } from "../utils/pomodoro";

function statsRangeStart() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  return start;
}

function FocusPage() {
  const [stats, setStats] = useState(null);

  const refreshStats = useCallback(() => {
    getFocusSessions(statsRangeStart())
      .then((sessions) => setStats(summarizeSessions(sessions)))
      .catch(() => setStats(null));
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const handleFocusComplete = async (minutes) => {
    try {
      await logFocusSession(minutes);
    } catch {
      // Losing one stat entry shouldn't interrupt the user's break
    }
    refreshStats();
  };

  return (
    <main className="min-h-screen bg-background px-6 py-10 transition-colors">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-ink">Focus</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Pomodoro timer with a lofi radio. Press start, get things done.
            </p>
          </div>

          {stats && (
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2">
                <Flame size={16} className="text-primary-strong" />
                <span className="text-ink">
                  Today: <strong>{stats.todayCount}</strong> session{stats.todayCount === 1 ? "" : "s"} ·{" "}
                  <strong>{stats.todayMinutes}</strong> min
                </span>
              </div>
              <div className="hidden items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 sm:flex">
                <CalendarRange size={16} className="text-primary-strong" />
                <span className="text-ink">
                  7 days: <strong>{stats.weekCount}</strong> · <strong>{stats.weekMinutes}</strong> min
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <PomodoroTimer onFocusComplete={handleFocusComplete} />
          <LofiPlayer />
        </div>
      </div>
    </main>
  );
}

export default FocusPage;
