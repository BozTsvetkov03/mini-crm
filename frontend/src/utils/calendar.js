/**
 * Pure date helpers for the calendar. Weeks start on Monday. All math is done
 * in the browser's local time zone, which matches how task due dates are
 * stored (local wall-clock, see toLocalIso). Kept side-effect free so the grid
 * and range logic can be unit tested without a DOM.
 */

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

export function startOfMonth(date) {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

/** Monday on or before `date`, at 00:00 local. */
export function startOfWeek(date) {
  const d = startOfDay(date);
  const offset = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
  return addDays(d, -offset);
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Stable local-date key "YYYY-MM-DD" used to bucket tasks by day. */
export function dayKey(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Local ISO-ish string without a timezone suffix, matching stored due dates. */
export function toLocalIso(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

/** 42 days (6 weeks) covering `date`'s month, starting on a Monday. */
export function getMonthGrid(date) {
  const start = startOfWeek(startOfMonth(date));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

/** Mon..Sun for the week containing `date`. */
export function getWeekDays(date) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Half-open [from, to) range to fetch for the given view/anchor. */
export function getVisibleRange(view, date) {
  if (view === "month") {
    const grid = getMonthGrid(date);
    return { from: grid[0], to: addDays(grid[41], 1) };
  }
  if (view === "week") {
    const start = startOfWeek(date);
    return { from: start, to: addDays(start, 7) };
  }
  const start = startOfDay(date);
  return { from: start, to: addDays(start, 1) };
}

/** Shift the anchor date by one unit of the current view. dir = -1 | +1. */
export function shiftDate(view, date, dir) {
  if (view === "month") return addMonths(date, dir);
  if (view === "week") return addDays(date, 7 * dir);
  return addDays(date, dir);
}

export function formatTitle(view, date) {
  if (view === "month") {
    return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }
  if (view === "week") {
    const start = startOfWeek(date);
    const end = addDays(start, 6);
    const startStr = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const endStr = end.toLocaleDateString(
      undefined,
      isSameMonth(start, end)
        ? { day: "numeric", year: "numeric" }
        : { month: "short", day: "numeric", year: "numeric" }
    );
    return `${startStr} – ${endStr}`;
  }
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Map of dayKey -> tasks (each day sorted by due time ascending). */
export function groupTasksByDay(tasks) {
  const map = new Map();
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const key = dayKey(new Date(task.dueDate));
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(task);
  }
  for (const list of map.values()) {
    list.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }
  return map;
}

/** "done" | "overdue" | "upcoming" — drives event coloring. */
export function taskStatus(task, now = new Date()) {
  if (task.isDone) return "done";
  if (task.dueDate && new Date(task.dueDate) < now) return "overdue";
  return "upcoming";
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
