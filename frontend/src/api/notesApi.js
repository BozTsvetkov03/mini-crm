import http from './http'

export async function getNotesByCustomerId(customerId) {
    const response = await http.get(`/customers/${customerId}/notes`);
    return response.data;
}

export async function createNote(customerId, noteData) {
    const response = await http.post(`/customers/${customerId}/notes`, noteData);
    return response.data;
}

export async function updateNote(noteId, noteData) {
    const response = await http.put(`/notes/${noteId}`, noteData);
    return response.data;
}

export async function deleteNote(noteId) {
    const response = await http.delete(`/notes/${noteId}`);
    return response.data;
}
