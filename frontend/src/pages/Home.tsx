import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Truck, Shield, Headphones, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import ProductCard from '@/components/ProductCard';
import { productApi, transformProduct } from '@/services/api';
import { Product } from '@/types';

const Home = () => {
  const { t } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch featured products from API
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const backendProducts = await productApi.getProducts();
        const transformedProducts = backendProducts.map(transformProduct);
        // Get first 4 products as featured
        setFeaturedProducts(transformedProducts.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const features = [
    {
      icon: Truck,
      title: 'Free Delivery',
      description: 'Free shipping on orders over ₹99',
      titleTe: 'ఉచిత డెలివరీ',
      descriptionTe: '₹999 కంటే ఎక్కువ ఆర్డర్లకు ఉచిత షిప్పింగ్'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round the clock customer support',
      titleTe: '24/7 మద్దతు',
      descriptionTe: 'రౌండ్ ది క్లాక్ కస్టమర్ మద్దతు'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-4 text-sm">
                🌱 Eco-Friendly Shopping
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Shop Smart,{' '}
                <span className="text-primary">Live Better</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Discover premium quality products at unbeatable prices. 
                From electronics to eco-friendly essentials, we have everything you need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products">
                  <Button size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-primary">
                    {t('products')} <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg">
                    {t('about')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="text-center p-6 hover:shadow-card-hover transition-all duration-300 gradient-card border-border h-full">
                  <CardContent className="p-0 flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Featured Products
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover our handpicked selection of premium products that our customers love the most.
              </p>
            </motion.div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12 mb-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading featured products...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12 mb-12">
              <div className="text-destructive mb-4">
                <h3 className="text-lg font-semibold mb-2">Failed to load featured products</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Try again
              </Button>
            </div>
          )}

          {/* Featured Products */}
          {!loading && !error && featuredProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}

          {/* No Products State */}
          {!loading && !error && featuredProducts.length === 0 && (
            <div className="text-center py-12 mb-12">
              <p className="text-muted-foreground">No featured products available at the moment.</p>
            </div>
          )}

          <div className="text-center">
            <Link to="/products">
              <Button variant="outline" size="lg">
                View All Products <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Order Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl p-8 md:p-12 border border-primary/20">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    Need Help with Your Order?
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    Call us directly to place your order or get assistance
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Available 24/7 • Free consultation • Expert guidance
                  </p>
                </div>
                
                <motion.div
                  className="flex flex-col items-center gap-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <a 
                    href="tel:+919010007046"
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                    <Button
                      size="lg"
                      className="relative bg-primary hover:bg-primary-hover text-primary-foreground shadow-primary text-lg px-8 py-6 rounded-full"
                    >
                      <Phone className="w-6 h-6 mr-3" />
                      Call to Order
                    </Button>
                  </a>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      +91 9010007046
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Toll-free calling
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Additional Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-primary/20">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">Instant Support</h4>
                  <p className="text-sm text-muted-foreground">Get immediate help from our experts</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">Phone Orders</h4>
                  <p className="text-sm text-muted-foreground">Place orders directly over the phone</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Headphones className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">24/7 Available</h4>
                  <p className="text-sm text-muted-foreground">Round the clock customer service</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Start Shopping?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of satisfied customers who trust us for their daily needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                  {t('register')} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" size="lg">
                  Browse Products
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;