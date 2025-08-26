import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../api/productService';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: any;
  cartCount: number;
  loading: boolean;
  error: any;
  addToCart: (productId: any, quantity?: number) => Promise<any>;
  updateCartItem: (productId: any, quantity: any) => Promise<any>;
  removeFromCart: (productId: any) => Promise<any>;
  clearCart: () => Promise<any>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      setCart(null);
      setCartCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await cartAPI.getCart();
      
      if (response.success) {
        setCart(response.data);
        setCartCount(response.data?.totalItems || 0);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError(err.message);
      setCart(null);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  // Fetch cart count only (lighter request)
  const fetchCartCount = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      setCartCount(0);
      return;
    }

    try {
      const response = await cartAPI.getCartCount();
      if (response.success) {
        setCartCount(response.count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch cart count:', err);
    }
  }, [isAuthenticated, authLoading]);

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to add items to cart');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await cartAPI.addToCart(productId, quantity);
      
      if (response.success) {
        // Update local cart state
        setCart(response.data);
        setCartCount(response.data?.totalItems || 0);
        return response;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (productId, quantity) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to update cart');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await cartAPI.updateCartItem(productId, quantity);
      
      if (response.success) {
        setCart(response.data);
        setCartCount(response.data?.totalItems || 0);
        return response;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to remove items from cart');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await cartAPI.removeFromCart(productId);
      
      if (response.success) {
        setCart(response.data);
        setCartCount(response.data?.totalItems || 0);
        return response;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!isAuthenticated) {
      throw new Error('Please log in to clear cart');
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await cartAPI.clearCart();
      
      if (response.success) {
        setCart(response.data);
        setCartCount(0);
        return response;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh cart data
  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  // Initialize cart when user authentication changes - but wait for auth to be ready
  useEffect(() => {
    // Don't fetch cart until auth loading is complete
    if (authLoading) return;

    if (isAuthenticated && user) {
      fetchCart();
    } else {
      setCart(null);
      setCartCount(0);
      setError(null);
    }
  }, [isAuthenticated, user, authLoading, fetchCart]);

  // Provide context value
  const value = {
    cart,
    cartCount,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};