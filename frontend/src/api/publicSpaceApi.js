import http from "./http";

// Returns the newest-first activity feed across all currently-public users.
// The backend responds 403 when the caller hasn't opted in — viewing the
// public space is reciprocal.
export async function getPublicFeed() {
  const response = await http.get("/public-space/feed");
  return response.data;
}
