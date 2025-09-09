const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Product API functions
export const productApi = {
  // Get all products
  async getProducts(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    return handleResponse<any[]>(response);
  },

  // ⭐ NEW: Function to get a single product by ID
  getProduct: async (id: string): Promise<any> => {
    const response = await fetch(`http://localhost:5000/api/products/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    return response.json();
  },

  // Search products (if you want to implement search on backend)
  async searchProducts(query: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/products?search=${encodeURIComponent(query)}`);
    return handleResponse<any[]>(response);
  }
};

// Transform backend product to frontend Product format
export function transformProduct(backendProduct: any): any {
  return {
    id: backendProduct.id,
    name: backendProduct.name,
    description: backendProduct.description || '',
    price: backendProduct.price,
    originalPrice: backendProduct.originalPrice,
    image: backendProduct.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image',
    category: backendProduct.category || 'General', // Default category if not provided
    stock: backendProduct.stock || 0,
    rating: 4.5, // Default rating since backend doesn't have this
    reviews: 0, // Default reviews since backend doesn't have this
    brand: backendProduct.brand || 'Generic', // Default brand if not provided
    features: [], // Empty array since backend doesn't have this
    specifications: {}, // Empty object since backend doesn't have this
    tags: [] // Empty array since backend doesn't have this
  };
}

