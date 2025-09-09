import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

const Wishlist = () => {
  const { t } = useLanguage();

  // For demo purposes, showing empty wishlist
  // In a real app, you'd have wishlist context/state management
  const wishlistItems: any[] = [];

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-6xl mb-6">💝</div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Your wishlist is empty
          </h2>
          <p className="text-muted-foreground mb-8">
            Save items you love by clicking the heart icon on products.
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
            {t('wishlist')}
          </h1>
          <p className="text-muted-foreground">
            Items you've saved for later
          </p>
        </motion.div>

        {/* Wishlist implementation would go here */}
      </div>
    </div>
  );
};

export default Wishlist;