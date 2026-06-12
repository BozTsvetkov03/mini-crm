import http from "./http";

export async function login(email, password) {
  const response = await http.post("/auth/login", { email, password });
  return response.data;
}

export async function register(name, email, password) {
  const response = await http.post("/auth/register", { name, email, password });
  return response.data;
}

export async function logout() {
  await http.post("/auth/logout");
}

export async function getMe() {
  const response = await http.get("/auth/me");
  return response.data;
}

export async function forgotPassword(email) {
  await http.post("/auth/forgot-password", { email });
}

export async function resetPassword(email, token, newPassword) {
  await http.post("/auth/reset-password", { email, token, newPassword });
}

export async function setPassword(currentPassword, newPassword) {
  await http.post("/auth/password", { currentPassword, newPassword });
}
