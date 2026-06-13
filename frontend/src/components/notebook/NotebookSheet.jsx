import { Check, Loader2 } from "lucide-react";

function NotebookSheet({ page, onChange, onFlush, saveStatus }) {
  return (
    <div className="notebook-sheet flex h-full flex-col bg-field">
      {/* Save indicator */}
      <div className="flex h-6 items-center justify-end px-6 pt-2 text-xs text-ink-faint">
        {saveStatus === "saving" && (
          <span className="flex items-center gap-1">
            <Loader2 size={12} className="animate-spin" /> Saving…
          </span>
        )}
        {saveStatus === "saved" && (
          <span className="flex items-center gap-1">
            <Check size={12} /> Saved
          </span>
        )}
      </div>

      <input
        type="text"
        value={page.title}
        onChange={(e) => onChange(e.target.value, page.content)}
        onBlur={onFlush}
        placeholder="Untitled"
        maxLength={200}
        className="w-full bg-transparent pr-6 pl-14 font-heading text-2xl font-bold text-ink outline-none placeholder:text-ink-faint"
      />

      <textarea
        value={page.content}
        onChange={(e) => onChange(page.title, e.target.value)}
        onBlur={onFlush}
        placeholder="Start writing…"
        className="notebook-rules mt-2 w-full flex-1 resize-none bg-transparent pr-6 pb-10 pl-14 text-ink outline-none placeholder:text-ink-faint"
      />
    </div>
  );
}

export default NotebookSheet;
