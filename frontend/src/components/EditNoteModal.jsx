import { useEffect, useState } from "react";
import { X } from "lucide-react";

function EditNoteModal({ note, open, onClose, onSave }) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!note) return;

    setContent(note.content || "");
    setError("");
  }, [note]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave(note.id, { content: content.trim() });
      onClose();
    } catch (err) {
      setError("Failed to update note");
    } finally {
      setSaving(false);
    }
  }

  if (!open || !note) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">Edit note</h3>

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
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full rounded-xl border border-line-strong px-3 py-2 text-ink outline-none focus:border-warning focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="mt-1 text-right text-xs text-ink-muted">
              {content.length}/500
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-line-strong px-4 py-2 text-ink hover:bg-ink/5 hover:cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-warning px-4 py-2 font-medium text-white transition hover:bg-warning/85 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditNoteModal;
