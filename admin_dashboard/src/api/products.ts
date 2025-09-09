import { Product, UpdateProductData } from '@/types/product';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      errorData
    });
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// GET /api/products - Fetch all products
export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  return handleResponse<Product[]>(response);
}

// POST /api/products - Create a new product
export async function createProduct(productData: Product): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
  return handleResponse<Product>(response);
}

// PUT /api/products/:id - Update a product
export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  console.log('updateProduct called with:', { id, productData });
  
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
  
  console.log('updateProduct response status:', response.status);
  return handleResponse<Product>(response);
}

// DELETE /api/products/:id - Delete a product
export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
}
