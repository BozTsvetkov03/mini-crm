import {
  getWeekDays,
  groupTasksByDay,
  dayKey,
  isSameDay,
} from "../../utils/calendar";
import EventChip from "./EventChip";

/** Seven day-columns Mon..Sun, each listing that day's tasks by time. */
function WeekView({ anchorDate, tasks }) {
  const days = getWeekDays(anchorDate);
  const byDay = groupTasksByDay(tasks);
  const today = new Date();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
      {days.map((day) => {
        const dayTasks = byDay.get(dayKey(day)) ?? [];
        const isToday = isSameDay(day, today);

        return (
          <div
            key={day.toISOString()}
            className="rounded-2xl border border-line bg-surface p-2"
          >
            <div className="mb-2 flex items-center justify-between border-b border-line pb-2">
              <span className="text-xs font-semibold uppercase text-ink-muted">
                {day.toLocaleDateString(undefined, { weekday: "short" })}
              </span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  isToday
                    ? "bg-primary-strong font-semibold text-white"
                    : "text-ink"
                }`}
              >
                {day.getDate()}
              </span>
            </div>

            <div className="space-y-1">
              {dayTasks.length === 0 ? (
                <p className="px-1 py-2 text-xs text-ink-faint dark:text-ink-muted">
                  —
                </p>
              ) : (
                dayTasks.map((task) => (
                  <EventChip key={task.id} task={task} showTime />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default WeekView;
