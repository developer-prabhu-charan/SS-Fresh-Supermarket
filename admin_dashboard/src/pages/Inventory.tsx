import { useState } from 'react';
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
import { Pencil, Trash2, Plus, Package, DollarSign } from 'lucide-react';
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

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully!');
      setProductForm({});
      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create product: ${error.message}`);
    },
  });

  // Update product mutation
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
    onError: (error: Error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete product: ${error.message}`);
    },
  });

  const handleSave = () => {
    if (isEditing && editingProduct) {
      console.log('Updating product with data:', productForm);
      console.log('Product ID:', editingProduct.id);
      
      // Validate required fields for update
      if (!productForm.name || !productForm.price || productForm.stock === undefined) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      updateProductMutation.mutate({
        id: editingProduct.id,
        data: productForm,
      });
    } else {
      if (!productForm.name || !productForm.price || productForm.stock === undefined) {
        toast.error('Please fill in all required fields');
        return;
      }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-muted-foreground">Manage your product catalog and stock levels</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Product' : 'Add Product'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={productForm.name || ''}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={productForm.category || ''}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={productForm.price || ''}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        price: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price ($)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={productForm.originalPrice || ''}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        originalPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Live Price Preview */}
              <div>
                <Label>Price Preview</Label>
                <div className="flex items-center gap-2 mt-1 p-3 border rounded-md bg-muted/50">
                  {productForm.originalPrice &&
                    productForm.originalPrice > (productForm.price || 0) && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${productForm.originalPrice.toFixed(2)}
                      </span>
                    )}
                  {productForm.price !== undefined && (
                    <span className="text-base font-semibold">
                      ${productForm.price.toFixed(2)}
                    </span>
                  )}
                  {!productForm.price && !productForm.originalPrice && (
                    <span className="text-sm text-muted-foreground">Enter prices to see preview</span>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="stock">Stock Count *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={productForm.stock || ''}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      stock: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={productForm.imageUrl || ''}
                  onChange={(e) =>
                    setProductForm({ ...productForm, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={productForm.description || ''}
                  onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value })
                  }
                  placeholder="Product description (optional)"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                >
                  {createProductMutation.isPending || updateProductMutation.isPending
                    ? 'Saving...'
                    : isEditing
                    ? 'Update Product'
                    : 'Add Product'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first product</p>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-32 w-full object-cover rounded-md mb-3"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="h-32 w-full bg-muted rounded-md mb-3 flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>

                {/* Price Display */}
                <div className="flex flex-col mb-2">
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-lg font-bold text-foreground">
                    ${product.price.toFixed(2)}
                  </span>
                </div>

                {/* Stock Display */}
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                  <Package className="h-4 w-4" />
                  <span>Stock: {product.stock}</span>
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(product)}
                    disabled={updateProductMutation.isPending}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(product.id)}
                    disabled={deleteProductMutation.isPending}
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