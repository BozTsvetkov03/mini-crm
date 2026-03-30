import { useState } from "react";
import { createNote } from "../api/notesApi";
import { getApiErrorMessage } from "../api/apiError";

function AddNoteForm({ selectedCustomer, onNoteCreated }) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCustomer) return;

    if (!content.trim()) {
      setError("Note content is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await createNote(selectedCustomer.id, { content: content.trim() });

      setContent("");
      await onNoteCreated();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <h3 className="mb-5 text-lg font-semibold text-gray-900">Add Note</h3>

      {!selectedCustomer ? (
        <p className="text-sm text-gray-600 py-6 text-center">
          Select a customer to add a note.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Called customer to discuss renewal..."
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none"
            />
            <div className="mt-1 text-right text-xs text-gray-500">
              {content.length}/500
            </div>
          </div>

          {error && (
            <p className="text-sm font-medium text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-amber-600 px-4 py-2 font-medium text-white transition hover:bg-amber-700 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Adding..." : "Add Note"}
          </button>
        </form>
      )}
    </div>
  );
}

export default AddNoteForm;
