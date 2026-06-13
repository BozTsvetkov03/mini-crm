import { useEffect, useState } from "react";
import { X } from "lucide-react";


function EditTaskModal({ task, open, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!task) return;

    setTitle(task.title || "");
    setDueDate((task.dueDate));
    setIsDone(task.isDone);
    setError("");
  }, [task]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave(task.id, {
        title: title.trim(),
        dueDate: dueDate || null,
        isDone
      });

      onClose();
    } catch (err) {
      setError("Failed to update task");
    } finally {
      setSaving(false);
    }
  }

  if (!open || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">Edit task</h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-ink-muted hover:bg-ink/5 hover:text-ink"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Title
            </label>
            <input
              type="text"
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-line-strong px-3 py-2 text-ink outline-none focus:border-primary dark:[color-scheme:dark]"
            />
            <div className="mt-1 text-right text-xs text-ink-muted">
            {title.length}/100
          </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Due date
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              max="9999-12-31T23:59"
              min="2026-01-01T00:00"
              className="w-full rounded-xl border border-line-strong px-3 py-2 text-ink outline-none focus:border-primary dark:[color-scheme:dark]"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={isDone}
              onChange={(e) => setIsDone(e.target.checked)}
            />
            Mark as completed
          </label>

          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-line-strong px-4 py-2 text-ink hover:bg-ink/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary-strong px-4 py-2 font-medium text-white transition hover:bg-primary-strong/85 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTaskModal;