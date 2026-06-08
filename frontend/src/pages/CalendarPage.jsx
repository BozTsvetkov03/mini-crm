import { useEffect, useMemo, useState } from "react";
import { getCalendarTasks } from "../api/calendarApi";
import { getApiErrorMessage } from "../api/apiError";
import {
  getVisibleRange,
  shiftDate,
  formatTitle,
} from "../utils/calendar";
import CalendarToolbar from "../components/calendar/CalendarToolbar";
import MonthView from "../components/calendar/MonthView";
import WeekView from "../components/calendar/WeekView";
import DayView from "../components/calendar/DayView";
import LoadingSpinner from "../components/LoadingSpinner";

export default function CalendarPage() {
  const [view, setView] = useState("month");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const range = useMemo(
    () => getVisibleRange(view, anchorDate),
    [view, anchorDate]
  );

  const drillToDay = (day) => {
    setAnchorDate(day);
    setView("day");
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getCalendarTasks(range);
        if (!cancelled) setTasks(data);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [range]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-150 transition-colors dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto w-[92%] pt-12 pb-16 lg:w-[85%]">
        <CalendarToolbar
          title={formatTitle(view, anchorDate)}
          view={view}
          onViewChange={setView}
          onPrev={() => setAnchorDate((d) => shiftDate(view, d, -1))}
          onNext={() => setAnchorDate((d) => shiftDate(view, d, 1))}
          onToday={() => setAnchorDate(new Date())}
        />

        {error && (
          <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </p>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {view === "month" && (
              <MonthView anchorDate={anchorDate} tasks={tasks} onDrillToDay={drillToDay} />
            )}
            {view === "week" && <WeekView anchorDate={anchorDate} tasks={tasks} />}
            {view === "day" && <DayView anchorDate={anchorDate} tasks={tasks} />}
          </>
        )}
      </div>
    </div>
  );
}
