const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
    console.error('Orders API error', response.status, response.url, errorData);
    throw new Error(errorData.message || `HTTP error ${response.status}`);
  }
  return response.json();
}

export async function fetchOrders() {
  const res = await fetch(`${API_BASE_URL}/api/orders`);
  return handleResponse(res);
}

export async function updateOrderStatus(id, status) {
  const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return handleResponse(res);
}

export default { fetchOrders, updateOrderStatus };
