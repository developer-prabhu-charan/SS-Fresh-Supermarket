import { useState, useEffect } from "react";

export interface Order {
  id: string;
  customerName: string;
  location: {
    city: string;
    state: string;
    country: string;
    lat: number;
    lng: number;
  };
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  orderDate: string;
  status: "pending" | "shipped" | "delivered";
}

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  stockCount: number;
  status: "in-stock" | "out-of-stock";
  views: number;
  purchases: number;
  description?: string;
}

export interface OutOfStockItem {
  id: string;
  searchTerm: string;
  searchCount: number;
  lastSearched: string;
}

// Mock data generation
const generateMockOrders = (): Order[] => {
  const customers = ["John Doe", "Jane Smith", "Bob Johnson", "Alice Brown", "Charlie Wilson"];
  const cities = [
    { city: "New York", state: "NY", country: "USA", lat: 40.7128, lng: -74.0060 },
    { city: "Los Angeles", state: "CA", country: "USA", lat: 34.0522, lng: -118.2437 },
    { city: "Chicago", state: "IL", country: "USA", lat: 41.8781, lng: -87.6298 },
    { city: "Houston", state: "TX", country: "USA", lat: 29.7604, lng: -95.3698 },
    { city: "Miami", state: "FL", country: "USA", lat: 25.7617, lng: -80.1918 },
  ];
  const products = [
    { name: "Wireless Headphones", price: 99.99 },
    { name: "Smart Watch", price: 249.99 },
    { name: "Laptop Stand", price: 49.99 },
    { name: "Phone Case", price: 19.99 },
    { name: "Bluetooth Speaker", price: 79.99 },
  ];
  const statuses: Order["status"][] = ["pending", "shipped", "delivered"];

  return Array.from({ length: 50 }, (_, i) => {
    const location = cities[Math.floor(Math.random() * cities.length)];
    const orderProducts = Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      () => {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        return { ...product, quantity };
      }
    );

    return {
      id: `order-${i + 1}`,
      customerName: customers[Math.floor(Math.random() * customers.length)],
      location,
      products: orderProducts,
      totalPrice: orderProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0),
      orderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
    };
  });
};

const generateMockProducts = (): Product[] => {
  const products = [
    "Wireless Headphones", "Smart Watch", "Laptop Stand", "Phone Case", "Bluetooth Speaker",
    "Gaming Mouse", "Mechanical Keyboard", "Monitor", "Tablet", "Earbuds"
  ];

  return products.map((name, i) => ({
    id: `product-${i + 1}`,
    name,
    image: `https://images.unsplash.com/photo-${1500000000000 + i}?w=200&h=200&fit=crop&crop=center`,
    price: Math.floor(Math.random() * 500) + 20,
    stockCount: Math.floor(Math.random() * 100),
    status: Math.random() > 0.8 ? "out-of-stock" : "in-stock" as const,
    views: Math.floor(Math.random() * 1000) + 100,
    purchases: Math.floor(Math.random() * 50) + 10,
    description: `High-quality ${name.toLowerCase()} with premium features and excellent performance.`,
  }));
};

const generateMockOutOfStock = (): OutOfStockItem[] => {
  const searchTerms = [
    "iPhone 15 Pro", "MacBook Pro M3", "AirPods Pro 2", "iPad Air", "Apple Watch Ultra",
    "Gaming Laptop", "4K Monitor", "Wireless Charger", "Premium Headphones"
  ];

  return searchTerms.map((term, i) => ({
    id: `oos-${i + 1}`,
    searchTerm: term,
    searchCount: Math.floor(Math.random() * 50) + 5,
    lastSearched: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

export const useDashboardData = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [outOfStock, setOutOfStock] = useState<OutOfStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOrders(generateMockOrders());
      setProducts(generateMockProducts());
      setOutOfStock(generateMockOutOfStock());
      setLoading(false);
    };

    loadData();
  }, []);

  const metrics = {
    totalOrders: orders.length,
    totalSales: orders.reduce((sum, order) => sum + order.totalPrice, 0),
    totalCustomers: new Set(orders.map(order => order.customerName)).size,
    outOfStockCount: products.filter(p => p.status === "out-of-stock").length,
  };

  return {
    orders,
    products,
    outOfStock,
    metrics,
    loading,
    setProducts,
    setOutOfStock,
  };
};