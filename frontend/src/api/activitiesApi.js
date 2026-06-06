import http from './http';

export async function getActivitiesByCustomerId(customerId) {
    const response = await http.get(`/activities/${customerId}`)
    return response.data;
}