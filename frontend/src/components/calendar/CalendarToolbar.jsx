import { ChevronLeft, ChevronRight } from "lucide-react";

const VIEWS = ["month", "week", "day"];

/**
 * Top bar: Today + prev/next navigation and the current-range title on the
 * left, a Month/Week/Day segmented toggle on the right.
 */
function CalendarToolbar({ title, view, onViewChange, onPrev, onNext, onToday }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToday}
          className="rounded-xl border border-line-strong px-4 py-2 text-sm font-medium text-ink transition hover:bg-ink/5 hover:cursor-pointer"
        >
          Today
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            aria-label="Previous"
            className="rounded-lg p-2 text-ink-muted transition hover:bg-ink/5 hover:cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={onNext}
            aria-label="Next"
            className="rounded-lg p-2 text-ink-muted transition hover:bg-ink/5 hover:cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <h2 className="text-lg font-semibold text-ink">
          {title}
        </h2>
      </div>

      <div className="inline-flex rounded-xl border border-line bg-line p-1">
        {VIEWS.map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition hover:cursor-pointer ${
              view === v
                ? "bg-surface text-primary-strong shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CalendarToolbar;
