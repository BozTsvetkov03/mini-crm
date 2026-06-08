import http from "./http";
import { toLocalIso } from "../utils/calendar";

/**
 * Fetch the logged-in user's tasks with a due date inside [from, to).
 * Boundaries are sent as local wall-clock strings to match how due dates are
 * stored, avoiding timezone drift at the range edges.
 */
export async function getCalendarTasks({ from, to }) {
  const response = await http.get("/tasks/calendar", {
    params: { from: toLocalIso(from), to: toLocalIso(to) },
  });
  return response.data;
}
