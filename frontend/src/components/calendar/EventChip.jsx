import { useNavigate } from "react-router-dom";
import { taskStatus, formatTime } from "../../utils/calendar";

const STATUS_STYLES = {
  done: "bg-line text-ink-muted",
  overdue: "bg-danger/15 text-danger",
  upcoming:
    "bg-primary/15 text-primary-strong",
};

/**
 * Compact, clickable pill for a single task. Top line is the (optionally
 * time-prefixed) title; the muted second line is the customer it belongs to.
 * Clicking deep-links to that customer in the Dashboard.
 */
function EventChip({ task, showTime = false }) {
  const navigate = useNavigate();
  const status = taskStatus(task);

  return (
    <button
      type="button"
      onClick={() => navigate(`/app?customer=${task.customerId}`)}
      title={`${task.title} — ${task.customerName}`}
      className={`block w-full rounded-md px-2 py-1 text-left text-xs transition hover:cursor-pointer hover:brightness-95 dark:hover:brightness-125 ${STATUS_STYLES[status]}`}
    >
      <span
        className={`block truncate font-medium ${
          status === "done" ? "line-through" : ""
        }`}
      >
        {showTime && task.dueDate && (
          <span className="mr-1 tabular-nums opacity-80">
            {formatTime(task.dueDate)}
          </span>
        )}
        {task.title}
      </span>
      <span className="block truncate opacity-70">{task.customerName}</span>
    </button>
  );
}

export default EventChip;
