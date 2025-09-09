import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Package, Upload, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

const Admin = () => {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    stock: '',
    brand: '',
    image: ''
  });

  const categories = [
    'Electronics',
    'Clothing',
    'Home & Kitchen',
    'Sports & Fitness',
    'Beauty & Personal Care',
    'Books',
    'Automotive',
    'Health & Wellness'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      category: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle product creation logic here
    console.log('Creating product:', formData);
    // Reset form
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      stock: '',
      brand: '',
      image: ''
    });
  };

  // If a regular user is logged in, show their profile and last 5 orders
  type Order = { _id: string; createdAt: string; products?: { productId?: string; quantity?: number }[]; total?: number };
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    const load = async () => {
      if (!user || !token) return setOrders([]);
      try {
        const res = await fetch('http://localhost:5000/api/customers/' + user.id + '/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        // ignore fetch errors silently; could show UI error
        setOrders([]);
      }
    };
    load();
  }, [user, token]);

  // If a logged-in user exists, show profile + orders
  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Profile</h1>
            <p className="text-muted-foreground">Your account details and recent orders.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-card border-border col-span-1">
              <CardHeader>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>Account information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Email</p>
                <div className="font-medium text-foreground mb-4">{user.email}</div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <div className="text-xs text-muted-foreground break-all">{user.id}</div>
              </CardContent>
            </Card>

            <div className="md:col-span-2">
              <Card className="shadow-card border-border mb-4">
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Last 5 orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-muted-foreground">No orders yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((o: Order) => (
                        <div key={o._id} className="p-3 border rounded-lg">
                          <div className="flex justify-between">
                            <div className="font-medium">Order #{o._id}</div>
                            <div className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</div>
                          </div>
                          <div className="text-sm mt-1">Items: {o.products?.length || 0} • Total: ₹{o.total || 0}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default admin dashboard when no normal user is logged in
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('admin')} Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your products and inventory
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add Product Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-primary" />
                  <span>{t('addProduct')}</span>
                </CardTitle>
                <CardDescription>
                  Add a new product to your store inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Product Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('productName')}</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  {/* Product Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">{t('productDescription')}</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter product description"
                      rows={3}
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">{t('productPrice')}</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                      <Input
                        id="originalPrice"
                        name="originalPrice"
                        type="number"
                        value={formData.originalPrice}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Stock and Brand */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input
                        id="stock"
                        name="stock"
                        type="number"
                        value={formData.stock}
                        onChange={handleInputChange}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        placeholder="Enter brand name"
                      />
                    </div>
                  </div>

                  {/* Product Image */}
                  <div className="space-y-2">
                    <Label htmlFor="image">{t('productImage')} URL</Label>
                    <Input
                      id="image"
                      name="image"
                      type="url"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                  </div>

                  {/* Image Preview */}
                  {formData.image && (
                    <div className="space-y-2">
                      <Label>Image Preview</Label>
                      <div className="w-32 h-32 bg-secondary/30 rounded-lg overflow-hidden">
                        <img
                          src={formData.image}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Invalid+Image';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
                    size="lg"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Add Product
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Admin Stats */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Quick Stats */}
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle>Store Overview</CardTitle>
                <CardDescription>
                  Quick statistics about your store
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">10</div>
                    <div className="text-sm text-muted-foreground">Total Products</div>
                  </div>
                  <div className="text-center p-4 bg-success/5 rounded-lg">
                    <div className="text-2xl font-bold text-success mb-1">157</div>
                    <div className="text-sm text-muted-foreground">Total Stock</div>
                  </div>
                  <div className="text-center p-4 bg-warning/5 rounded-lg">
                    <div className="text-2xl font-bold text-warning mb-1">5</div>
                    <div className="text-sm text-muted-foreground">Low Stock</div>
                  </div>
                  <div className="text-center p-4 bg-destructive/5 rounded-lg">
                    <div className="text-2xl font-bold text-destructive mb-1">1</div>
                    <div className="text-sm text-muted-foreground">Out of Stock</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common admin tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    Manage Inventory
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk Upload Products
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    View Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>• Fill out all required fields to add a new product</p>
                  <p>• Use high-quality images for better conversion</p>
                  <p>• Set competitive prices based on market research</p>
                  <p>• Keep track of inventory levels regularly</p>
                  <p>• This is a demo interface - no data is actually saved</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Admin;