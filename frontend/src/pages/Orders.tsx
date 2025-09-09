import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Orders = () => {
  const { t } = useLanguage();

  type Order = { 
  _id: string; 
  createdAt: string; 
  status?: string;
  products?: { 
    productId?: {
      _id: string;
      name: string;
      price: number;
      imageUrl?: string;
    }; 
    quantity?: number 
  }[]; 
  total?: number;
};
  const [orders, setOrders] = useState<Order[]>([]);
  const { token, user } = useAuth();

  useEffect(() => {
    const load = async () => {
      if (!user) return setOrders([]);
      try {
        const res = await fetch(`${API_BASE_URL}/api/customers/` + (user.id || '') + '/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        setOrders(data);
      } catch (e) {
        // silently ignore network errors for now
        // could set an error state here for UI feedback
      }
    };
    load();
  }, [user, token]);

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-6xl mb-6">📦</div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            No orders yet
          </h2>
          <p className="text-muted-foreground mb-8">
            Start shopping to see your orders here.
          </p>
          <Link to="/products">
            <Button size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Start Shopping
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('orders')}
          </h1>
          <p className="text-muted-foreground">
            Track and manage your orders
          </p>
        </motion.div>

        <div className="space-y-4 mt-6">
          {orders.map((o) => (
  <motion.div
    key={o._id}
    className="p-4 border rounded-lg bg-card"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    {/* Header */}
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center space-x-3">
        <Package className="w-5 h-5" />
        <div>
          <div className="font-medium">Order #{o._id}</div>
          <div className="text-sm text-muted-foreground">
            {new Date(o.createdAt).toLocaleString()}
          </div>
          {/* ✅ Order status */}
          <div className="text-xs mt-1 px-2 py-1 rounded bg-primary/10 text-primary inline-block">
            {o.status || "Placed"}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold">₹{(o.total || 0).toLocaleString()}</div>
      </div>
    </div>

    {/* Products inside order */}
    <div className="space-y-2 mt-3">
      {o.products && o.products.length > 0 ? (
  o.products.map((p, idx) => (
    <div key={idx} className="flex items-center justify-between border-b pb-2">
      <div className="flex items-center space-x-3">
        {/* Product image */}
        {p.productId?.imageUrl ? (
          <img
            src={p.productId.imageUrl}
            alt={p.productId.name}
            className="w-12 h-12 rounded object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
            📦
          </div>
        )}
        {/* Product details */}
        <div>
          <div className="font-medium">{p.productId?.name || "Product"}</div>
          <div className="text-xs text-muted-foreground">
            Qty: {p.quantity} × ₹{p.productId?.price?.toLocaleString() || 0}
          </div>
        </div>
      </div>
      <div className="font-semibold">
        ₹{((p.productId?.price || 0) * (p.quantity || 0)).toLocaleString()}
      </div>
    </div>
  ))
) : (
  <div className="text-sm text-muted-foreground">No items listed</div>
)}
    </div>
  </motion.div>
))}

        </div>
      </div>
    </div>
  );
};

export default Orders;