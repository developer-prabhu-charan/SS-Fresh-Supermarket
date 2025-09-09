import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Grid, List, SortAsc, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import { productApi, transformProduct } from '@/services/api';
import { Product } from '@/types';
import { useSearchParams } from 'react-router-dom';
import { useTrackOutOfStock } from '@/utils/trackOutOfStock';
import { Link } from "react-router-dom";
// ... existing imports ...

const Products = ({ searchQuery: propSearchQuery, onSearch }: { searchQuery: string; onSearch: (query: string) => void }) => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { trackSearch } = useTrackOutOfStock();

  // State for products, loading, and error
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get search query from URL or props (single source of truth)
  const searchQuery = searchParams.get('search') || propSearchQuery || '';

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const backendProducts = await productApi.getProducts();
        const transformedProducts = backendProducts.map(transformProduct);
        setProducts(transformedProducts);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get unique categories from fetched products
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    return ['all', ...uniqueCategories]; // Add 'all' as the first option
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      const searchTerms = query.split(/\s+/).filter(term => term.length > 0);
      
      filtered = filtered.filter(product => {
        const searchableText = [
          product.name.toLowerCase(),
          product.description?.toLowerCase() || '',
          product.category?.toLowerCase() || '',
          product.brand?.toLowerCase() || '',
        ].join(' ');

        return searchTerms.every(term => {
          if (searchableText.includes(term)) {
            return true;
          }
          
          const words = searchableText.split(/\s+/);
          return words.some(word => word.includes(term) || term.includes(word));
        });
      });
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // For demo, we'll use the order in the array
        break;
      case 'popularity':
      default:
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy]);

  // Track out-of-stock searches when no products are found
  useEffect(() => {
    if (searchQuery && filteredProducts.length === 0 && !loading) {
      trackSearch(searchQuery);
    }
  }, [searchQuery, filteredProducts.length, loading, trackSearch]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setSearchParams({ search: query.trim() });
    } else {
      setSearchParams({});
    }
    onSearch(query);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchParams({});
    onSearch('');
  };

  // Add this useEffect to reset the selectedCategory when products are loaded
  useEffect(() => {
    if (products.length > 0 && selectedCategory === 'all') {
      // This will trigger a re-render with the correct filteredProducts
      setSelectedCategory('all');
    }
  }, [products, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('products')}
            </h1>
            <p className="text-muted-foreground mb-6">
              Discover our extensive collection of premium products
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md">
              <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
            </div>
          </motion.div>
        </div>

        {/* Filters and Controls */}
        {!loading && products.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-4 shadow-card border-border">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Categories */}
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category === 'all' ? 'All Categories' : category}
                      </Button>
                    ))}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-4">
                    {/* Sort */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SortAsc className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popularity">Popularity</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* View Mode */}
                    <div className="flex border border-border rounded-md">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-r-none"
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-l-none"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results Count */}
        {!loading && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {loading ? (
                  'Loading products...'
                ) : (
                  <>
                    Showing {filteredProducts.length} of {products.length} products
                    {searchQuery && (
                      <span> for "<span className="text-foreground font-medium">{searchQuery}</span>"</span>
                    )}
                  </>
                )}
              </p>
              {selectedCategory !== 'all' && (
                <Badge variant="secondary">
                  {selectedCategory}
                </Badge>
              )}
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            className="flex items-center justify-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-destructive mb-4">
              <h3 className="text-lg font-semibold mb-2">Failed to load products</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          </motion.div>
        )}

        {/* Products Grid/List */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
          {filteredProducts.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : !loading && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No products found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button
                variant="outline"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Products;