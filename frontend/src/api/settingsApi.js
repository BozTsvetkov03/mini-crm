import http from "./http";

export async function getSettings() {
  const response = await http.get("/user-settings");
  return response.data;
}

export async function updateTheme(theme) {
  const response = await http.put("/user-settings", { theme });
  return response.data;
}

export async function updateReminderSettings({ emailRemindersEnabled, remindDaysBefore, digestHour, timeZone }) {
  const response = await http.put("/user-settings", {
    emailRemindersEnabled,
    remindDaysBefore,
    digestHour,
    timeZone,
  });
  return response.data;
}

export async function updateProfile(name) {
  const response = await http.put("/auth/profile", { name });
  return response.data;
}

export async function updatePublicSpace(enabled) {
  const response = await http.put("/user-settings", { publicSpaceEnabled: enabled });
  return response.data;
}
