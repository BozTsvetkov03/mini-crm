import http from "./http";

export async function logFocusSession(durationMinutes) {
  const response = await http.post("/focus/sessions", { durationMinutes });
  return response.data;
}

export async function getFocusSessions(from) {
  const response = await http.get("/focus/sessions", {
    params: { from: from.toISOString() },
  });
  return response.data;
}
