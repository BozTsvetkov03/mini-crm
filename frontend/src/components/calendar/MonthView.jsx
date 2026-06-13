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
    <div className="overflow-hidden rounded-2xl border border-line">
      <div className="grid grid-cols-7 border-b border-line bg-background">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-xs font-semibold text-ink-muted"
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
              className={`min-h-[7rem] border-b border-r border-line p-1.5/70 ${
                inMonth
                  ? "bg-surface"
                  : "bg-background/60/40"
              }`}
            >
              <div className="mb-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => onDrillToDay(day)}
                  aria-label={`View ${day.toDateString()}`}
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs transition hover:cursor-pointer ${
                    isToday
                      ? "bg-primary-strong font-semibold text-white hover:bg-primary-strong/85"
                      : inMonth
                        ? "text-ink hover:bg-ink/5"
                        : "text-ink-faint hover:bg-ink/5 dark:text-ink-muted"
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
                    className="w-full rounded px-1 text-left text-xs font-medium text-ink-muted transition hover:cursor-pointer hover:text-ink"
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
