import { useNavigate } from "react-router-dom";
import {
  groupTasksByDay,
  dayKey,
  taskStatus,
  formatTime,
} from "../../utils/calendar";

const STATUS_DOT = {
  done: "bg-gray-400",
  overdue: "bg-rose-500",
  upcoming: "bg-emerald-500",
};

/** Single-day agenda: tasks for `anchorDate` listed by due time. Each row
 * deep-links to its customer in the Dashboard. */
function DayView({ anchorDate, tasks }) {
  const navigate = useNavigate();
  const dayTasks = groupTasksByDay(tasks).get(dayKey(anchorDate)) ?? [];

  if (dayTasks.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center dark:border-gray-800 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">
          Nothing due on this day.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
      {dayTasks.map((task) => {
        const status = taskStatus(task);
        return (
          <button
            key={task.id}
            type="button"
            onClick={() => navigate(`/app?customer=${task.customerId}`)}
            className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <span className="w-20 shrink-0 text-sm tabular-nums text-gray-500 dark:text-gray-400">
              {task.dueDate ? formatTime(task.dueDate) : "—"}
            </span>
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[status]}`}
            />
            <div className="min-w-0 flex-1">
              <p
                className={`truncate font-medium text-gray-900 dark:text-gray-100 ${
                  status === "done" ? "line-through opacity-60" : ""
                }`}
              >
                {task.title}
              </p>
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                {task.customerName}
              </p>
            </div>
            {status === "overdue" && (
              <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
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
