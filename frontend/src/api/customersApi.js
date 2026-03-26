import  http  from './http'

export async function getCustomers() {
    const response = await http.get('/customers');
    return response.data;
}

export async function createCustomer(customerData) {
    const response = await http.post('/customers', customerData);
    return response.data;
}

export async function deleteCustomer(customerId) {
  const response = await http.delete(`/customers/${customerId}`);
  return response.data;
}