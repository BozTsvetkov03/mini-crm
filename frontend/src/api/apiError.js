export function getApiErrorMessage(error) {
  if (error.response?.status === 429) {
    return "Too many requests. Please wait a few minutes and try again.";
  }

  const data = error.response?.data;

  if (data?.errors) {
    const firstKey = Object.keys(data.errors)[0];
    if (firstKey && data.errors[firstKey]?.length) {
      return data.errors[firstKey][0];
    }
  }

  if (data?.title) {
    return data.title;
  }

  if (typeof data === "string") {
    return data;
  }

  if (error.response) {
    return `Request failed with status ${error.response.status}`;
  }

  if (error.request) {
    return "No response from server. Check whether the backend is running.";
  }

  return error.message || "Something went wrong.";
}