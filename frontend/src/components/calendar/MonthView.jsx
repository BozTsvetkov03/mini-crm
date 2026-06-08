import {
  WEEKDAY_LABELS,
  getMonthGrid,
  groupTasksByDay,
  dayKey,
  isSameDay,
  isSameMonth,
} from "../../utils/calendar";
import EventChip from "./EventChip";

const MAX_PER_CELL = 2;

/**
 * 6×7 month grid. Each cell shows up to MAX_PER_CELL tasks then "+N more".
 * Clicking the day number or "+N more" drills into Day view via onDrillToDay.
 */
function MonthView({ anchorDate, tasks, onDrillToDay }) {
  const days = getMonthGrid(anchorDate);
  const byDay = groupTasksByDay(tasks);
  const today = new Date();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayTasks = byDay.get(dayKey(day)) ?? [];
          const inMonth = isSameMonth(day, anchorDate);
          const isToday = isSameDay(day, today);
          const overflow = dayTasks.length - MAX_PER_CELL;

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[7rem] border-b border-r border-gray-100 p-1.5 dark:border-gray-800/70 ${
                inMonth
                  ? "bg-white dark:bg-gray-900"
                  : "bg-gray-50/60 dark:bg-gray-950/40"
              }`}
            >
              <div className="mb-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => onDrillToDay(day)}
                  aria-label={`View ${day.toDateString()}`}
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs transition hover:cursor-pointer ${
                    isToday
                      ? "bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                      : inMonth
                        ? "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        : "text-gray-400 hover:bg-gray-100 dark:text-gray-600 dark:hover:bg-gray-800"
                  }`}
                >
                  {day.getDate()}
                </button>
              </div>

              <div className="space-y-1">
                {dayTasks.slice(0, MAX_PER_CELL).map((task) => (
                  <EventChip key={task.id} task={task} />
                ))}
                {overflow > 0 && (
                  <button
                    type="button"
                    onClick={() => onDrillToDay(day)}
                    className="w-full rounded px-1 text-left text-xs font-medium text-gray-500 transition hover:cursor-pointer hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    +{overflow} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MonthView;
