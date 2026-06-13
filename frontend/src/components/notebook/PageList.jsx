import { Plus, Trash2 } from "lucide-react";

function snippet(content) {
  const firstLine = (content || "").split("\n").find((l) => l.trim()) ?? "";
  return firstLine.trim().slice(0, 50);
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function PageList({ pages, activeId, onSelect, onNew, onDelete, creating }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="font-heading text-sm font-semibold text-ink-muted uppercase tracking-wide">
          Pages
        </h2>
        <button
          type="button"
          onClick={onNew}
          disabled={creating}
          title="New page"
          className="rounded-lg p-1.5 text-primary-strong transition hover:cursor-pointer hover:bg-primary/10 disabled:opacity-50"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {pages.length === 0 ? (
          <p className="px-2 py-4 text-sm text-ink-faint">No pages yet.</p>
        ) : (
          <ul className="space-y-1">
            {pages.map((page) => {
              const active = page.id === activeId;
              return (
                <li key={page.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(page.id)}
                    className={`group flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left transition hover:cursor-pointer ${
                      active
                        ? "bg-primary/10"
                        : "hover:bg-ink/5"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm font-medium ${
                          active ? "text-primary-strong" : "text-ink"
                        }`}
                      >
                        {page.title.trim() || "Untitled"}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-ink-faint">
                        {snippet(page.content) || "Empty page"}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      <span className="text-[10px] text-ink-faint">
                        {formatDate(page.updatedAt)}
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(page.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            onDelete(page.id);
                          }
                        }}
                        title="Delete page"
                        className="rounded-md p-1 text-ink-faint opacity-0 transition hover:cursor-pointer hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PageList;
