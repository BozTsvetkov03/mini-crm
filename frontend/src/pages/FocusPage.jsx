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
    <main className="min-h-screen bg-gray-50 px-6 py-10 transition-colors dark:bg-gray-950">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Focus</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Pomodoro timer with a lofi radio. Press start, get things done.
            </p>
          </div>

          {stats && (
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
                <Flame size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Today: <strong>{stats.todayCount}</strong> session{stats.todayCount === 1 ? "" : "s"} ·{" "}
                  <strong>{stats.todayMinutes}</strong> min
                </span>
              </div>
              <div className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 sm:flex dark:border-gray-800 dark:bg-gray-900">
                <CalendarRange size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-gray-700 dark:text-gray-300">
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
