import { useState } from "react";
import { Check, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { completeTask, deleteTask, updateTask } from "../api/tasksApi";
import { getApiErrorMessage } from "../api/apiError";
import EditTaskModal from "./EditTaskModal";

/**
 * SortableTaskTable
 *
 * Props:
 *   tasks       – TaskListItemDto[]
 *   mode        – "completed" | "due"
 *   onReload    – () => void  (called after any mutating action succeeds)
 */
function SortableTaskTable({ tasks, mode, onReload }) {
  // sortKey: "title" | "customerName" | "dueDate" | "completedAt" | "isDone"
  const defaultKey = mode === "completed" ? "completedAt" : "dueDate";
  const defaultDir = mode === "completed" ? "desc" : "asc";

  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortDir, setSortDir] = useState(defaultDir);

  const [editingTask, setEditingTask] = useState(null);
  const [actionError, setActionError] = useState("");

  // ── Sort helpers ──────────────────────────────────────────────────────────

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      // dates default desc; everything else asc
      setSortDir(key === "completedAt" || key === "dueDate" ? "asc" : "asc");
    }
  }

  function compareValues(a, b, key) {
    const av = a[key];
    const bv = b[key];

    // Nulls last regardless of direction
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;

    // Date columns – compare as timestamps
    if (key === "dueDate" || key === "completedAt") {
      return new Date(av) - new Date(bv);
    }

    // Boolean column
    if (typeof av === "boolean") {
      return av === bv ? 0 : av ? 1 : -1;
    }

    // String columns
    return String(av).localeCompare(String(bv));
  }

  const sorted = [...tasks].sort((a, b) => {
    const cmp = compareValues(a, b, sortKey);
    return sortDir === "asc" ? cmp : -cmp;
  });

  // ── Actions ───────────────────────────────────────────────────────────────

  async function handleComplete(taskId) {
    try {
      setActionError("");
      await completeTask(taskId);
      onReload();
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  }

  async function handleDelete(taskId) {
    if (!window.confirm("Delete this task?")) return;
    try {
      setActionError("");
      await deleteTask(taskId);
      onReload();
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  }

  async function handleSave(taskId, taskData) {
    await updateTask(taskId, taskData);
    onReload();
  }

  // ── Formatting ────────────────────────────────────────────────────────────

  function fmtDate(val) {
    if (!val) return "—";
    const d = new Date(val);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // ── Column header component ───────────────────────────────────────────────

  function SortHeader({ label, colKey }) {
    const active = sortKey === colKey;
    return (
      <th
        className="cursor-pointer select-none px-4 py-3 text-left whitespace-nowrap"
        onClick={() => toggleSort(colKey)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {active ? (
            sortDir === "asc" ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )
          ) : (
            <ChevronDown size={14} className="opacity-30" />
          )}
        </span>
      </th>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (tasks.length === 0) {
    return (
      <p className="py-8 text-center text-ink-muted">
        No tasks found.
      </p>
    );
  }

  return (
    <>
      {actionError && (
        <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {actionError}
        </div>
      )}

      {/* ── Mobile cards ── */}
      <div className="space-y-3 md:hidden">
        {sorted.map((task) => (
          <div
            key={task.id}
            className="rounded-xl border border-line bg-surface p-4"
          >
            <p className="font-semibold text-ink">
              {task.title}
            </p>
            {task.customerName && (
              <p className="mt-1 text-sm text-ink-muted">
                {task.customerName}
              </p>
            )}
            <p className="mt-1 text-sm text-ink-muted">
              Due: {fmtDate(task.dueDate)}
            </p>
            {mode === "completed" && (
              <p className="mt-1 text-sm text-ink-muted">
                Completed: {fmtDate(task.completedAt)}
              </p>
            )}
            <p className="mt-1 text-sm">
              <span
                className={
                  task.isDone
                    ? "text-primary-strong"
                    : "text-warning"
                }
              >
                {task.isDone ? "Done" : "Pending"}
              </span>
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setEditingTask(task)}
                className="rounded-xl p-2 text-secondary transition hover:cursor-pointer hover:bg-secondary/15"
                title="Edit"
              >
                <Pencil size={16} />
              </button>
              {!task.isDone && (
                <button
                  onClick={() => handleComplete(task.id)}
                  className="rounded-xl p-2 text-primary-strong transition hover:cursor-pointer hover:bg-primary/10"
                  title="Complete"
                >
                  <Check size={16} />
                </button>
              )}
              <button
                onClick={() => handleDelete(task.id)}
                className="rounded-xl p-2 text-danger transition hover:cursor-pointer hover:bg-danger/10"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden overflow-x-auto rounded-xl border border-line md:block">
        <table className="w-full border-collapse text-ink">
          <thead className="bg-line text-sm">
            <tr>
              <SortHeader label="Title" colKey="title" />
              <SortHeader label="Customer" colKey="customerName" />
              <SortHeader label="Due date" colKey="dueDate" />
              {mode === "completed" && (
                <SortHeader label="Completed date" colKey="completedAt" />
              )}
              <SortHeader label="Status" colKey="isDone" />
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((task) => (
              <tr
                key={task.id}
                className="border-t transition-colors hover:bg-ink/5"
              >
                <td className="px-4 py-3">{task.title}</td>
                <td className="px-4 py-3 text-ink-muted">
                  {task.customerName || "—"}
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {fmtDate(task.dueDate)}
                </td>
                {mode === "completed" && (
                  <td className="px-4 py-3 text-ink-muted">
                    {fmtDate(task.completedAt)}
                  </td>
                )}
                <td className="px-4 py-3">
                  <span
                    className={
                      task.isDone
                        ? "font-medium text-primary-strong"
                        : "font-medium text-warning"
                    }
                  >
                    {task.isDone ? "Done" : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingTask(task)}
                      className="rounded-xl p-2 text-secondary transition hover:cursor-pointer hover:bg-secondary/15"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    {!task.isDone && (
                      <button
                        onClick={() => handleComplete(task.id)}
                        className="rounded-xl p-2 text-primary-strong transition hover:cursor-pointer hover:bg-primary/10"
                        title="Complete"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="rounded-xl p-2 text-danger transition hover:cursor-pointer hover:bg-danger/10"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditTaskModal
        task={editingTask}
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSave}
      />
    </>
  );
}

export default SortableTaskTable;
