/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the type for a product in the cart
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  brand?: string;
}

// Define the type for the context value
interface CartContextType {
  cart: CartItem[];
  addItem: (product: { id: string, name: string, price: number, image: string, category: string, brand?: string }) => void;
  removeItem: (productId: string) => void;
  decreaseQuantity: (productId: string) => void; // ⭐ ADDED: New function
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create the provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addItem = (product: { id: string, name: string, price: number, image: string, category: string, brand?: string }) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(item => item.id === product.id);
      if (existingItem) {
        return currentCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...currentCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeItem = (productId: string) => {
    setCart((currentCart) => currentCart.filter(item => item.id !== productId));
  };
  
  // ⭐ ADDED: New decreaseQuantity function
  const decreaseQuantity = (productId: string) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(item => item.id === productId);
      if (existingItem) {
        // If quantity is 1, remove the item entirely
        if (existingItem.quantity <= 1) {
          return currentCart.filter(item => item.id !== productId);
        } else {
          // Otherwise, decrease the quantity by 1
          return currentCart.map(item =>
            item.id === productId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          );
        }
      }
      return currentCart;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      setCart((currentCart) =>
        currentCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, decreaseQuantity, updateQuantity, clearCart, getItemCount, getTotal }}>
      {children}
    </CartContext.Provider>
  );
};

// Create a custom hook to use the context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};