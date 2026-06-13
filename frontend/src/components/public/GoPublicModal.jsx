import { X, Globe } from "lucide-react";

// Warning shown before a user opts into the public space. Used both from the
// Profile "Public space" card and the Public page's gate.
function GoPublicModal({ open, onConfirm, onCancel, confirming }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-primary-strong" />
            <h3 className="text-lg font-semibold text-ink">Go public?</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-ink-muted hover:bg-ink/5 hover:text-ink"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-sm text-ink-muted">
          <p>
            While this is on, other Atelier users can see a live timeline of
            your activity — when you finish focus sessions, create or complete
            tasks, and write in your notebook. They&apos;ll see your display
            name and the time,{" "}
            <span className="font-medium text-ink">never the contents</span> of
            your notes, tasks, or pages.
          </p>
          <p>
            You&apos;ll also be able to see their activity. You can turn this off
            anytime; your past activity is hidden while you&apos;re off.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-line-strong px-4 py-2 text-ink hover:bg-ink/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="rounded-xl bg-primary-strong px-4 py-2 font-medium text-white transition hover:bg-primary-strong/85 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirming ? "Enabling…" : "Go public!"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GoPublicModal;
