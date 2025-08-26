import API from "./axios";
import {
  Product,
  ProductFilters,
  ProductApiResponse,
  SingleProductApiResponse,
  FeaturedProductsResponse,
  CartApiResponse,
  CartCountResponse,
} from "../types/product";

// Product API endpoints
export const productAPI = {
  // Get all products with filters
  getProducts: async (
    params: ProductFilters = {}
  ): Promise<ProductApiResponse> => {
    try {
      const response = await API.get("/products", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  },

  // Get product by ID
  getProductById: async (id: string): Promise<SingleProductApiResponse> => {
    try {
      const response = await API.get(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
  },

  // Search products
  searchProducts: async (
    query: string,
    filters: ProductFilters = {}
  ): Promise<ProductApiResponse> => {
    try {
      const params = {
        search: query,
        ...filters,
      };
      const response = await API.get("/products/search", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to search products"
      );
    }
  },

  // Get products by category
  getProductsByCategory: async (
    category: string,
    params: ProductFilters = {}
  ): Promise<ProductApiResponse> => {
    try {
      const response = await API.get(`/products/category/${category}`, {
        params,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch products by category"
      );
    }
  },

  // Get featured products
  getFeaturedProducts: async (): Promise<FeaturedProductsResponse> => {
    try {
      const response = await API.get("/products/featured");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch featured products"
      );
    }
  },
};

// Cart API endpoints
export const cartAPI = {
  // Get cart
  getCart: async (): Promise<CartApiResponse> => {
    try {
      const response = await API.get("/cart");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch cart");
    }
  },

  // Add item to cart
  addToCart: async (
    productId: string,
    quantity: number = 1
  ): Promise<CartApiResponse> => {
    try {
      const response = await API.post("/cart/add", {
        productId,
        quantity,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to add item to cart"
      );
    }
  },

  // Update cart item quantity
  updateCartItem: async (
    productId: string,
    quantity: number
  ): Promise<CartApiResponse> => {
    try {
      const response = await API.put("/cart/update", {
        productId,
        quantity,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update cart item"
      );
    }
  },

  // Remove item from cart
  removeFromCart: async (productId: string): Promise<CartApiResponse> => {
    try {
      const response = await API.delete(`/cart/remove/${productId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to remove item from cart"
      );
    }
  },

  // Get cart count
  getCartCount: async (): Promise<CartCountResponse> => {
    try {
      const response = await API.get("/cart/count");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch cart count"
      );
    }
  },

  // Validate cart
  validateCart: async (): Promise<CartApiResponse> => {
    try {
      const response = await API.post("/cart/validate");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to validate cart"
      );
    }
  },

  // Clear cart
  clearCart: async (): Promise<CartApiResponse> => {
    try {
      const response = await API.delete("/cart/clear");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to clear cart");
    }
  },
};

// Utility functions for formatting
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

export const calculateDiscount = (
  originalPrice: number,
  currentPrice: number
): number => {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

export const getImageUrl = (images: any): string => {
  // Handle different image formats
  if (!images)
    return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop";

  // If it's an array of images (your API format)
  if (Array.isArray(images) && images.length > 0) {
    return images[0].url;
  }

  // If it's a single image object
  if (typeof images === "object" && images.url) {
    return images.url;
  }

  // If it's a string URL
  if (typeof images === "string") {
    return images;
  }

  // Fallback image
  return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop";
};

// Helper function to get product badge
export const getProductBadge = (product: Product): string | null => {
  if (product.newArrival) return "New";
  if (product.bestSeller) return "Best Seller";
  if (product.trending) return "Trending";
  if (product.discount && product.discount.percentage > 0)
    return `${product.discount.percentage}% OFF`;
  return null;
};

// Helper function to check if product is on sale
export const isProductOnSale = (product: Product): boolean => {
  return !!(product.originalPrice && product.originalPrice > product.price);
};
