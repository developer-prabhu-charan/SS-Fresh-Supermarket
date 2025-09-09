import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { Product } from '@/types';
import { Plus, Minus } from 'lucide-react'; // ⭐ IMPORTED: Plus and Minus icons

interface ProductCardProps {
  product: Product;
  onAddToWishlist?: (product: Product) => void;
  isInWishlist?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToWishlist,
  isInWishlist = false 
}) => {
  // ⭐ UPDATED: Access cart state from the hook
  const { addItem, decreaseQuantity, cart } = useCart(); // ⭐ CHANGED: Now using decreaseQuantity
  const { t } = useLanguage();

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const getStockStatus = () => {
    if (product.stock === 0) return { text: t('outOfStock'), className: 'stock-out' };
    if (product.stock <= 5) return { text: t('lowStock'), className: 'stock-low' };
    return { text: t('inStock'), className: 'stock-available' };
  };

  const stockStatus = getStockStatus();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      addItem(product);
    }
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToWishlist) {
      onAddToWishlist(product);
    }
  };

  // ⭐ NEW LOGIC: Check if the product is in the cart
  const cartItem = cart.find((item) => item.id === product.id);
  const isInCart = !!cartItem;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className="overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 bg-card border-border">
        <div className="relative">
          <Link to={`/product/${product.id}`}>
            <div className="aspect-square overflow-hidden bg-secondary/30">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
          
          {/* Discount Badge */}
          {discount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 left-2 text-xs font-semibold"
            >
              {discount}% OFF
            </Badge>
          )}

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-2 right-2 p-2 bg-card/80 backdrop-blur-sm hover:bg-card ${
              isInWishlist ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={handleAddToWishlist}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </Button>

          {/* Quick View Button */}
          <Link to={`/product/${product.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="absolute bottom-2 right-2 p-2 bg-card/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <CardContent className="p-4">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? 'text-warning fill-current'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviews})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg font-bold price-text">
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-medium ${stockStatus.className}`}>
              {stockStatus.text}
            </span>
            {product.stock > 0 && product.stock <= 10 && (
              <span className="text-xs text-muted-foreground">
                {product.stock} left
              </span>
            )}
          </div>

          {/* ⭐ KEY CHANGE: Conditional rendering based on cart presence */}
          {isInCart ? (
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                // ⭐ CHANGED: Call decreaseQuantity instead of removeItem
                onClick={() => decreaseQuantity(product.id)}
                className="p-2"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-lg font-semibold">{cartItem.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addItem(product)}
                disabled={cartItem.quantity >= product.stock}
                className="p-2"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.stock > 0 ? t('addToCart') : t('outOfStock')}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;