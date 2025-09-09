import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash2, Plus, Package } from 'lucide-react';
import { Product } from '@/types/product';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '@/api/products';

const categories = [
  "All Categories",
  "Fruits & Vegetables",
  "General",
  "Dairy",
  "Bakery",
  "Bakery, cakes & Dairy",
  "Breakfast,Dips & Spreads",
  "Eggs,Meat & Fish",
  "Masalas, Oils & Dry fruits",
  "Atta, Rice, Dals & Sugar",
  "Chips, Biscuits, Namkeens",
  "Hot & Cold Beverages",
  "Instant & Frozen foods",
  "Chocolates & Ice-creams",
  "Baby Care",
  "Health & Hgiene",
  "Men's Grooming",
  "Bath, Body & Hair",
  "Beauty & Cosmetics",
  "Cleaning & Detergents",
  "Kitchen, Pooja & Homeware",
  "Electronics",
  "Pet Care",
  "Fashion"
];

export default function Inventory() {
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Search state + debounce
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 250); // 250ms debounce
    return () => clearTimeout(t);
  }, [search]);

  const queryClient = useQueryClient();

  // Fetch products
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  // Filter products by substring (character) match on name (case-insensitive)
  const filteredProducts = useMemo(() => {
    if (!debouncedSearch) return products;
    const q = debouncedSearch.toLowerCase();
    return products.filter((p: Product) => (p.name || '').toLowerCase().includes(q));
  }, [products, debouncedSearch]);

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully!');
      setProductForm({});
      setOpen(false);
    },
    onError: (err: any) => {
      toast.error(`Failed to create product: ${err?.message || 'Unknown error'}`);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully!');
      setProductForm({});
      setEditingProduct(null);
      setOpen(false);
    },
    onError: (err: any) => {
      toast.error(`Failed to update product: ${err?.message || 'Unknown error'}`);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully!');
    },
    onError: (err: any) => {
      toast.error(`Failed to delete product: ${err?.message || 'Unknown error'}`);
    },
  });

  const handleSave = () => {
    // basic validation
    if (!productForm.name || productForm.name.trim() === '') {
      toast.error('Please provide a product name');
      return;
    }
    if (productForm.price === undefined || Number.isNaN(Number(productForm.price))) {
      toast.error('Please provide a valid price');
      return;
    }
    if (productForm.stock === undefined || Number.isNaN(Number(productForm.stock))) {
      toast.error('Please provide stock count');
      return;
    }

    if (isEditing && editingProduct) {
      updateProductMutation.mutate({
        id: editingProduct.id,
        data: productForm,
      });
    } else {
      createProductMutation.mutate(productForm as Product);
    }
  };

  const handleEdit = (product: Product) => {
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
      imageUrl: product.imageUrl,
      description: product.description,
    });
    setEditingProduct(product);
    setIsEditing(true);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setProductForm({});
    setEditingProduct(null);
    setIsEditing(false);
    setOpen(true);
  };

  const resetForm = () => {
    setProductForm({});
    setEditingProduct(null);
    setIsEditing(false);
    setOpen(false);
  };

  // Loading / error UI
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load products</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header + Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-muted-foreground">Manage your product catalog and stock levels</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search input (mobile-first) */}
          <div className="w-full sm:w-80">
            <Input
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="Search products (character match)..."
            />
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px]">
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit Product' : 'Add Product'}</DialogTitle>
              </DialogHeader>

              {/* Full form inside dialog */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={productForm.name || ''}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={productForm.category || categories[0]}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={productForm.price !== undefined ? String(productForm.price) : ''}
                      onChange={(e) =>
                        setProductForm({ ...productForm, price: e.target.value ? Number(e.target.value) : undefined })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Original Price</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      value={productForm.originalPrice !== undefined ? String(productForm.originalPrice) : ''}
                      onChange={(e) =>
                        setProductForm({ ...productForm, originalPrice: e.target.value ? Number(e.target.value) : undefined })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="stock">Stock Count *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={productForm.stock !== undefined ? String(productForm.stock) : ''}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stock: e.target.value ? Number(e.target.value) : undefined })
                    }
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={productForm.imageUrl || ''}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={productForm.description || ''}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Short description (optional)"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={createProductMutation.isLoading || updateProductMutation.isLoading}
                  >
                    {createProductMutation.isLoading || updateProductMutation.isLoading ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Products grid: default to 3 columns on mobile (grid-cols-3),
          adjusts on larger screens. Tweak classes if you'd like different breakpoints. */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or add a new product</p>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-3">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-28 w-full object-cover rounded-md mb-3"
                    onError={(e) => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="h-28 w-full bg-muted rounded-md mb-3 flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                <h3 className="text-sm font-semibold mb-1 line-clamp-2">{product.name}</h3>

                <div className="flex items-center justify-between mb-2">
                  <div>
                    {product.originalPrice && product.originalPrice > (product.price || 0) && (
                      <div className="text-xs text-muted-foreground line-through">${(product.originalPrice || 0).toFixed(2)}</div>
                    )}
                    <div className="text-sm font-bold">${(product.price || 0).toFixed(2)}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">Stock: {product.stock ?? 0}</div>
                </div>

                {product.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(product)}
                    disabled={updateProductMutation.isLoading}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(product.id)}
                    disabled={deleteProductMutation.isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
