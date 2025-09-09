export interface Product {
  id: string;
  name: string;
  category?: string; // Add this
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface UpdateProductData extends Partial<Product> {
  id: string;
}
