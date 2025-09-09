import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  AlertTriangle, 
  Plus, 
  Archive, 
  Calendar,
  TrendingUp,
  Package
} from "lucide-react";
import { useDashboardData, OutOfStockItem } from "@/hooks/useDashboardData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OutOfStock = () => {
  const { products, outOfStock, loading, setProducts, setOutOfStock } = useDashboardData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("searchCount");
  const [isRestockingProduct, setIsRestockingProduct] = useState<string | null>(null);
  const [restockQuantity, setRestockQuantity] = useState<number>(0);

  // Get out of stock products
  const outOfStockProducts = useMemo(() => {
    return products.filter(product => product.status === "out-of-stock");
  }, [products]);

  // Filter and sort searched terms
  const filteredSearchTerms = useMemo(() => {
    let filtered = outOfStock.filter(item =>
      item.searchTerm.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by different criteria
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "searchCount":
          return b.searchCount - a.searchCount;
        case "recent":
          return new Date(b.lastSearched).getTime() - new Date(a.lastSearched).getTime();
        case "alphabetical":
          return a.searchTerm.localeCompare(b.searchTerm);
        default:
          return 0;
      }
    });

    return filtered;
  }, [outOfStock, searchTerm, sortBy]);

  const handleRestockProduct = (productId: string) => {
    if (restockQuantity <= 0) return;

    setProducts(prev => prev.map(product =>
      product.id === productId
        ? { 
            ...product, 
            stockCount: product.stockCount + restockQuantity, 
            status: "in-stock" as const 
          }
        : product
    ));

    setIsRestockingProduct(null);
    setRestockQuantity(0);
  };

  const handleMarkAsDiscontinued = (productId: string) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
  };

  const handleRemoveSearchTerm = (termId: string) => {
    setOutOfStock(prev => prev.filter(item => item.id !== termId));
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than 1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Out of Stock Management</h1>
        <p className="text-muted-foreground">
          Manage out-of-stock products and popular search terms
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Out of Stock Products</p>
                <h3 className="text-2xl font-bold text-warning">{outOfStockProducts.length}</h3>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Popular Search Terms</p>
                <h3 className="text-2xl font-bold text-primary">{outOfStock.length}</h3>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Searches</p>
                <h3 className="text-2xl font-bold text-success">
                  {outOfStock.reduce((sum, item) => sum + item.searchCount, 0)}
                </h3>
              </div>
              <Search className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Out of Stock Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-warning" />
            Out of Stock Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {outOfStockProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              All products are currently in stock!
            </div>
          ) : (
            <div className="space-y-4">
              {outOfStockProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-card-hover transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Price: ${product.price.toFixed(2)} • Views: {product.views}
                      </p>
                      <Badge className="status-badge status-pending mt-1">
                        Out of Stock
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Dialog 
                      open={isRestockingProduct === product.id} 
                      onOpenChange={(open) => setIsRestockingProduct(open ? product.id : null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Restock
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Restock Product</DialogTitle>
                          <DialogDescription>
                            Add stock for {product.name}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="quantity">Quantity to Add</Label>
                            <Input
                              id="quantity"
                              type="number"
                              min="1"
                              value={restockQuantity || ""}
                              onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 0)}
                              placeholder="Enter quantity"
                            />
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsRestockingProduct(null);
                              setRestockQuantity(0);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={() => handleRestockProduct(product.id)}>
                            Add Stock
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsDiscontinued(product.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Archive className="w-4 h-4 mr-1" />
                      Discontinue
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popular Search Terms */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Popular Search Terms Not Found
            </CardTitle>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search terms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="searchCount">Sort by Search Count</SelectItem>
                  <SelectItem value="recent">Sort by Most Recent</SelectItem>
                  <SelectItem value="alphabetical">Sort Alphabetically</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSearchTerms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No search terms found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSearchTerms.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-card-hover transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{item.searchTerm}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Search className="w-3 h-3" />
                        {item.searchCount} searches
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {getTimeAgo(item.lastSearched)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      High Demand
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveSearchTerm(item.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OutOfStock;