import  http  from './http'

export async function getTasksByCustomerId(customerId) {
    const response = await http.get(`/customers/${customerId}/tasks`);
    return response.data;
}

export async function createTask(customerId, taskData) {
    const response = await http.post(`/customers/${customerId}/tasks`, taskData);
    return response.data;
}

export async function completeTask(taskId) {
    const response = await http.put(`/tasks/${taskId}/complete`);
    return response.data;
}

export async function deleteTask(taskId) {
  const response = await http.delete(`/tasks/${taskId}`);
  return response.data;
}