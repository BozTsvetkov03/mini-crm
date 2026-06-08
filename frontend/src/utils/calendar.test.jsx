import { describe, it, expect } from "vitest";
import {
  startOfWeek,
  getMonthGrid,
  getWeekDays,
  getVisibleRange,
  shiftDate,
  groupTasksByDay,
  taskStatus,
  dayKey,
  isSameDay,
} from "./calendar";

describe("startOfWeek", () => {
  it("returns the Monday on or before the date at midnight", () => {
    // 2026-06-10 is a Wednesday
    const result = startOfWeek(new Date(2026, 5, 10, 15, 30));
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(8);
    expect(result.getHours()).toBe(0);
  });

  it("keeps a Monday unchanged (date-wise)", () => {
    const monday = new Date(2026, 5, 8, 9, 0);
    expect(startOfWeek(monday).getDate()).toBe(8);
  });
});

describe("getMonthGrid", () => {
  const grid = getMonthGrid(new Date(2026, 5, 15)); // June 2026

  it("is 6 weeks (42 days)", () => {
    expect(grid).toHaveLength(42);
  });

  it("starts on a Monday", () => {
    expect(grid[0].getDay()).toBe(1);
  });

  it("covers the first and last of the month", () => {
    const keys = grid.map(dayKey);
    expect(keys).toContain("2026-06-01");
    expect(keys).toContain("2026-06-30");
  });
});

describe("getWeekDays", () => {
  it("returns 7 consecutive days starting Monday", () => {
    const days = getWeekDays(new Date(2026, 5, 10));
    expect(days).toHaveLength(7);
    expect(days[0].getDay()).toBe(1);
    expect(days[6].getDay()).toBe(0); // Sunday
  });
});

describe("getVisibleRange", () => {
  it("month range spans 42 days", () => {
    const { from, to } = getVisibleRange("month", new Date(2026, 5, 15));
    const diffDays = Math.round((to - from) / 86400000);
    expect(diffDays).toBe(42);
  });

  it("week range spans 7 days", () => {
    const { from, to } = getVisibleRange("week", new Date(2026, 5, 10));
    expect(Math.round((to - from) / 86400000)).toBe(7);
    expect(from.getDay()).toBe(1);
  });

  it("day range spans 1 day starting at midnight", () => {
    const { from, to } = getVisibleRange("day", new Date(2026, 5, 10, 14));
    expect(from.getHours()).toBe(0);
    expect(Math.round((to - from) / 86400000)).toBe(1);
  });
});

describe("shiftDate", () => {
  const base = new Date(2026, 5, 15);

  it("shifts by a month in month view", () => {
    expect(shiftDate("month", base, 1).getMonth()).toBe(6);
    expect(shiftDate("month", base, -1).getMonth()).toBe(4);
  });

  it("shifts by a week in week view", () => {
    expect(isSameDay(shiftDate("week", base, 1), new Date(2026, 5, 22))).toBe(true);
  });

  it("shifts by a day in day view", () => {
    expect(isSameDay(shiftDate("day", base, -1), new Date(2026, 5, 14))).toBe(true);
  });
});

describe("groupTasksByDay", () => {
  it("buckets by local day and sorts each day by time", () => {
    const tasks = [
      { id: "a", dueDate: "2026-06-08T15:00:00", title: "late" },
      { id: "b", dueDate: "2026-06-08T09:00:00", title: "early" },
      { id: "c", dueDate: "2026-06-09T10:00:00", title: "next day" },
      { id: "d", dueDate: null, title: "no date" },
    ];
    const map = groupTasksByDay(tasks);
    expect(map.get("2026-06-08").map((t) => t.id)).toEqual(["b", "a"]);
    expect(map.get("2026-06-09")).toHaveLength(1);
    expect(map.has("d")).toBe(false);
  });
});

describe("taskStatus", () => {
  const now = new Date(2026, 5, 10, 12, 0);

  it("is done when completed regardless of date", () => {
    expect(taskStatus({ isDone: true, dueDate: "2026-06-01T00:00:00" }, now)).toBe("done");
  });

  it("is overdue when past and not done", () => {
    expect(taskStatus({ isDone: false, dueDate: "2026-06-09T00:00:00" }, now)).toBe("overdue");
  });

  it("is upcoming when in the future", () => {
    expect(taskStatus({ isDone: false, dueDate: "2026-06-11T00:00:00" }, now)).toBe("upcoming");
  });
});
