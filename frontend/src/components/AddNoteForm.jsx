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
    <div className="mb-8 rounded-2xl border border-warning/30 bg-warning/10 p-5">
      <h3 className="mb-5 text-lg font-semibold text-ink">Add Note</h3>

      {!selectedCustomer ? (
        <p className="text-sm text-ink-muted py-6 text-center">
          Select a customer to add a note.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Called customer to discuss renewal..."
              className="w-full rounded-xl border border-line-strong bg-field px-3 py-2 text-ink outline-none transition focus:border-warning focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="mt-1 text-right text-xs text-ink-muted">
              {content.length}/500
            </div>
          </div>

          {error && (
            <p className="text-sm font-medium text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-warning px-4 py-2 font-medium text-white transition hover:bg-warning/85 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Adding..." : "Add Note"}
          </button>
        </form>
      )}
    </div>
  );
}

export default AddNoteForm;
