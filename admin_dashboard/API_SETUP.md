# API Setup

## Environment Variables

Create a `.env` file in the admin_dashboard root directory with the following:

```
VITE_API_URL=http://localhost:5000
```

Replace `http://localhost:5000` with your actual backend API URL.

## Backend API Endpoints

The admin dashboard expects the following endpoints to be available:

- `GET /api/products` - Fetch all products
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

## Product Data Structure

The API should handle products with the following structure:

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}
```
