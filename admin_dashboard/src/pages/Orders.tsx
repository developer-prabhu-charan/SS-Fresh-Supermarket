import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, MapPin, Calendar, DollarSign } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { fetchOrders, updateOrderStatus } from '@/api/orders';
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Orders = () => {
  const { orders: mockOrders, loading: mockLoading } = useDashboardData();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchOrders().then(data => {
      if (!mounted) return;
      // Normalize records: map backend fields to expected shape
      const normalized = (data || []).map(o => ({
        id: o._id || o.id,
        customerName: o.customerName || o.customer_name || (o.customer || '').toString(),
        location: o.location || { city: o.city || '', state: o.state || '', country: o.country || '' },
        products: o.products || [],
        totalPrice: o.totalAmount || o.total || o.totalPrice || 0,
        orderDate: o.createdAt || o.orderDate || o.order_date,
        status: (o.status || '').toString(),
        phone: o.phone || o.mobile || o.contact || null,
        address: o.address || null,
      }));
      setOrders(normalized);
      setError(null);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch orders', err);
      if (!mounted) return;
      setError(err.message || 'Failed to fetch orders');
      // fall back to mock data if available
      setOrders(mockOrders as any[]);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [mockOrders]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");

  // Get unique cities for filter
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    orders.forEach(order => {
  const c = order?.location?.city || (order?.address ? order.address.split('\n')[0] : null) || null;
      if (c) citySet.add(c);
    });
    return Array.from(citySet).sort();
  }, [orders]);

  // Filter orders based on search and filters
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const name = (order?.customerName || '').toString().toLowerCase();
      const locCity = (order?.location?.city || order?.address || '').toString().toLowerCase();
      const productMatch = (order?.products || []).some(p => (p?.name || '').toString().toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSearch = name.includes(searchTerm.toLowerCase()) || locCity.includes(searchTerm.toLowerCase()) || productMatch;
      const statusVal = (order?.status || '').toString().toLowerCase();
      const matchesStatus = statusFilter === "all" || statusVal === statusFilter.toLowerCase();
      const matchesCity = cityFilter === "all" || (order?.location?.city === cityFilter) || (order?.address === cityFilter && cityFilter !== 'all');

      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [orders, searchTerm, statusFilter, cityFilter]);

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const openGoogleMaps = (lat: number, lng: number, city: string) => {
  if (lat == null || lng == null) return;
  const url = `https://www.google.com/maps?q=${lat},${lng}`;
  window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
          <p className="text-muted-foreground">
            Track and manage all customer orders
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Total Orders: {filteredOrders.length}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>

            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCityFilter("all");
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="p-4 text-sm text-destructive">Error fetching orders: {error}</div>
          )}
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Location</th>
                  <th>Products</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Map</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="font-mono text-sm">{order.id}</td>
                    <td className="font-medium">{order.customerName}<div className="text-xs text-muted mt-1">{order.phone ? <a href={`tel:${order.phone}`} className="text-primary">{order.phone}</a> : 'Unknown'}</div></td>
                        <td>
                          <div className="text-sm">
                            {order?.address ? (
                              <div className="whitespace-pre-line">{order.address}</div>
                            ) : (
                              <>
                                <div>{order?.location?.city ?? 'Unknown'}, {order?.location?.region ?? ''}</div>
                                <div className="text-muted-foreground text-xs">{order?.location?.country ?? ''}</div>
                              </>
                            )}
                          </div>
                        </td>
                    <td>
                      <div className="max-w-[200px]">
                        {order.products.map((product, i) => {
                          // Extract product details from populated data
                          const productName = product.productId?.name || product.name || "Unknown Product";
                          const productPrice = product.productId?.price || product.price || 0;
                          const quantity = product.quantity || 1;
                          
                          return (
                            <div key={i} className="text-sm mb-1">
                              <div className="font-medium">{productName}</div>
                              <div className="text-muted-foreground text-xs">
                                ₹{productPrice.toLocaleString()} × {quantity} = ₹{(productPrice * quantity).toLocaleString()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="font-semibold">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {(Number(order?.totalPrice ?? order?.totalAmount ?? 0)).toFixed(2)}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        {(() => {
                          const d = order?.orderDate || order?.createdAt || order?.order_date;
                          try { return d ? new Date(d).toLocaleDateString() : 'Unknown'; } catch { return 'Unknown'; }
                        })()}
                      </div>
                    </td>
                    <td>
                      <Select value={(order?.status || '').toString()} onValueChange={async (val) => {
                        // optimistic update
                        const oldStatus = order.status;
                        setOrders(current => current.map(o => o.id === order.id ? { ...o, status: val } : o));
                        setUpdatingOrderId(order.id);
                        try {
                          await updateOrderStatus(order.id, val);
                        } catch (e) {
                          // revert on error
                          console.error('Failed to update status', e);
                          setOrders(current => current.map(o => o.id === order.id ? { ...o, status: oldStatus } : o));
                        } finally {
                          setUpdatingOrderId(null);
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Placed">Placed</SelectItem>
                          <SelectItem value="Packed">Packed</SelectItem>
                          <SelectItem value="On the way">On the way</SelectItem>
                          <SelectItem value="Reached location">Reached location</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      {updatingOrderId === order.id && <div className="text-xs text-muted-foreground">Saving...</div>}
                    </td>
                    <td>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Prefer stored mapLink, then lat/lng, then address search
                          if (order?.mapLink) {
                            window.open(order.mapLink, '_blank');
                            return;
                          }
                          const lat = order?.location?.lat ?? order?.location?.latitude ?? null;
                          const lng = order?.location?.lng ?? order?.location?.longitude ?? order?.location?.lon ?? null;
                          if (lat != null && lng != null) {
                            window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                            return;
                          }
                          if (order?.address) {
                            const q = encodeURIComponent(order.address.replace(/\n/g, ', '));
                            window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
                            return;
                          }
                          // fallback: open Google Maps homepage
                          window.open('https://www.google.com/maps', '_blank');
                        }}
                        className="flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3" />
                        View
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No orders found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;