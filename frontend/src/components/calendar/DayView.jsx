import { useNavigate } from "react-router-dom";
import {
  groupTasksByDay,
  dayKey,
  taskStatus,
  formatTime,
} from "../../utils/calendar";

const STATUS_DOT = {
  done: "bg-ink-faint",
  overdue: "bg-danger",
  upcoming: "bg-primary",
};

/** Single-day agenda: tasks for `anchorDate` listed by due time. Each row
 * deep-links to its customer in the Dashboard. */
function DayView({ anchorDate, tasks }) {
  const navigate = useNavigate();
  const dayTasks = groupTasksByDay(tasks).get(dayKey(anchorDate)) ?? [];

  if (dayTasks.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface py-16 text-center">
        <p className="text-ink-muted">
          Nothing due on this day.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {dayTasks.map((task) => {
        const status = taskStatus(task);
        return (
          <button
            key={task.id}
            type="button"
            onClick={() => navigate(`/app?customer=${task.customerId}`)}
            className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:cursor-pointer hover:bg-ink/5/50"
          >
            <span className="w-20 shrink-0 text-sm tabular-nums text-ink-muted">
              {task.dueDate ? formatTime(task.dueDate) : "—"}
            </span>
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[status]}`}
            />
            <div className="min-w-0 flex-1">
              <p
                className={`truncate font-medium text-ink ${
                  status === "done" ? "line-through opacity-60" : ""
                }`}
              >
                {task.title}
              </p>
              <p className="truncate text-sm text-ink-muted">
                {task.customerName}
              </p>
            </div>
            {status === "overdue" && (
              <span className="shrink-0 rounded-full bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger">
                Overdue
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default DayView;
