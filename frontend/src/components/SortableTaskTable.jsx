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
      <p className="py-8 text-center text-gray-500 dark:text-gray-400">
        No tasks found.
      </p>
    );
  }

  return (
    <>
      {actionError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          {actionError}
        </div>
      )}

      {/* ── Mobile cards ── */}
      <div className="space-y-3 md:hidden">
        {sorted.map((task) => (
          <div
            key={task.id}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {task.title}
            </p>
            {task.customerName && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {task.customerName}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Due: {fmtDate(task.dueDate)}
            </p>
            {mode === "completed" && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Completed: {fmtDate(task.completedAt)}
              </p>
            )}
            <p className="mt-1 text-sm">
              <span
                className={
                  task.isDone
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }
              >
                {task.isDone ? "Done" : "Pending"}
              </span>
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setEditingTask(task)}
                className="rounded-xl p-2 text-blue-600 transition hover:cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30"
                title="Edit"
              >
                <Pencil size={16} />
              </button>
              {!task.isDone && (
                <button
                  onClick={() => handleComplete(task.id)}
                  className="rounded-xl p-2 text-emerald-600 transition hover:cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  title="Complete"
                >
                  <Check size={16} />
                </button>
              )}
              <button
                onClick={() => handleDelete(task.id)}
                className="rounded-xl p-2 text-red-600 transition hover:cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block dark:border-gray-800">
        <table className="w-full border-collapse text-gray-900 dark:text-gray-200">
          <thead className="bg-gray-100 text-sm dark:bg-gray-800">
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
                className="border-t transition-colors dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-3">{task.title}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {task.customerName || "—"}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {fmtDate(task.dueDate)}
                </td>
                {mode === "completed" && (
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {fmtDate(task.completedAt)}
                  </td>
                )}
                <td className="px-4 py-3">
                  <span
                    className={
                      task.isDone
                        ? "font-medium text-emerald-600 dark:text-emerald-400"
                        : "font-medium text-amber-600 dark:text-amber-400"
                    }
                  >
                    {task.isDone ? "Done" : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingTask(task)}
                      className="rounded-xl p-2 text-blue-600 transition hover:cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    {!task.isDone && (
                      <button
                        onClick={() => handleComplete(task.id)}
                        className="rounded-xl p-2 text-emerald-600 transition hover:cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        title="Complete"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="rounded-xl p-2 text-red-600 transition hover:cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30"
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
