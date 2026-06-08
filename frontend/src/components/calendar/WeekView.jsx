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
            className="rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
              <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                {day.toLocaleDateString(undefined, { weekday: "short" })}
              </span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  isToday
                    ? "bg-emerald-600 font-semibold text-white"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {day.getDate()}
              </span>
            </div>

            <div className="space-y-1">
              {dayTasks.length === 0 ? (
                <p className="px-1 py-2 text-xs text-gray-400 dark:text-gray-600">
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
