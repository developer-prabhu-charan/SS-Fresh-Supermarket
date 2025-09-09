# Frontend API Setup

## Environment Variables

Create a `.env` file in the frontend root directory with the following:

```
VITE_API_URL=http://localhost:5000
```

Replace `http://localhost:5000` with your actual backend API URL.

## Backend Requirements

The frontend expects the following backend endpoints to be available:

- `GET /api/products` - Fetch all products
- `GET /api/products/:id` - Fetch a single product by ID

## Product Data Structure

The backend should return products with the following structure:

```typescript
interface BackendProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl?: string;
  description?: string;
  category?: string;
  brand?: string;
  available?: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

## Data Transformation

The frontend automatically transforms backend products to include additional fields needed for the UI:

- `image` - Uses `imageUrl` from backend or fallback placeholder
- `category` - Uses backend category or defaults to "General"
- `rating` - Defaults to 4.5 (not stored in backend)
- `reviews` - Defaults to 0 (not stored in backend)
- `brand` - Uses backend brand or defaults to "Generic"
- `features` - Empty array (not stored in backend)
- `specifications` - Empty object (not stored in backend)
- `tags` - Empty array (not stored in backend)

