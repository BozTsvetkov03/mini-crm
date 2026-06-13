import { useState } from "react";
import { createTask } from "../api/tasksApi";
import { getApiErrorMessage } from "../api/apiError";

function AddTaskForm({ selectedCustomer, onTaskCreated }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCustomer) return;

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        title: title.trim(),
        dueDate: dueDate || null,
      };
      await createTask(selectedCustomer.id, payload);

      setTitle("");
      setDueDate("");

      await onTaskCreated();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-8 rounded-2xl border border-primary/30 bg-primary/10 p-5">
      <h3 className="mb-5 text-lg font-semibold text-ink">Add Task</h3>

      {!selectedCustomer ? (
        <p className="text-sm text-ink-muted py-6 text-center">
          Select a customer to add a task.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Follow up with customer"
              className="w-full rounded-xl border border-line-strong bg-field px-3 py-2 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-ring dark:[color-scheme:dark]"
            />
            <div className="mt-1 text-right text-xs text-ink-muted">
            {title.length}/100
          </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Due date
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              max="9999-12-31T23:59"
              min="2026-01-01T00:00"
              className="w-full rounded-xl border border-line-strong bg-field px-3 py-2 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-ring dark:[color-scheme:dark]"
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-primary-strong px-4 py-2 font-medium text-white transition hover:bg-primary-strong/85 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Adding..." : "Add Task"}
          </button>
        </form>
      )}
    </div>
  );
}

export default AddTaskForm;