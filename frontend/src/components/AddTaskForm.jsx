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
    <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <h3 className="mb-5 text-lg font-semibold text-gray-900">Add Task</h3>

      {!selectedCustomer ? (
        <p className="text-sm text-gray-600 py-6 text-center">
          Select a customer to add a task.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Follow up with customer"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            <div className="mt-1 text-right text-xs text-gray-500">
            {title.length}/100
          </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Due date
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              max="9999-12-31T23:59"
              min="2026-01-01T00:00"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Adding..." : "Add Task"}
          </button>
        </form>
      )}
    </div>
  );
}

export default AddTaskForm;