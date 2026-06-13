import http from "./http";

export async function getPages() {
  const response = await http.get("/notebook");
  return response.data;
}

export async function createPage(title = "", content = "") {
  const response = await http.post("/notebook", { title, content });
  return response.data;
}

export async function updatePage(id, title, content) {
  const response = await http.put(`/notebook/${id}`, { title, content });
  return response.data;
}

export async function deletePage(id) {
  await http.delete(`/notebook/${id}`);
}
