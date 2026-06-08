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
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:cursor-pointer dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Today
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            aria-label="Previous"
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:cursor-pointer dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={onNext}
            aria-label="Next"
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:cursor-pointer dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
      </div>

      <div className="inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-gray-800 dark:bg-gray-800">
        {VIEWS.map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition hover:cursor-pointer ${
              view === v
                ? "bg-white text-emerald-600 shadow-sm dark:bg-gray-900 dark:text-emerald-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
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
