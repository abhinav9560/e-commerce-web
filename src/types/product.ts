// Product Types
export interface ProductImage {
  url: string;
  alt?: string;
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface ProductDiscount {
  percentage: number;
  amount: number;
  startDate?: Date;
  endDate?: Date;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand?: string;
  images: ProductImage[];
  rating: ProductRating;
  stock: number;
  inStock: boolean;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  trending: boolean;
  discount?: ProductDiscount;
  tags?: string[];
  specifications?: Record<string, any>;
  reviews?: number;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductApiResponse extends ApiResponse<Product[]> {
  meta?: PaginationMeta;
}

export interface SingleProductApiResponse extends ApiResponse<Product> {}

export interface FeaturedProductsResponse extends ApiResponse<Product[]> {}

// Product Filters
export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'rating' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
  addedAt: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartApiResponse extends ApiResponse<Cart> {}

export interface CartCountResponse extends ApiResponse<{ count: number }> {
  count: number;
}

// Wishlist Types
export interface WishlistItem {
  productId: Product;
  addedAt: string;
}

export interface Wishlist {
  _id: string;
  userId: string;
  items: WishlistItem[];
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistApiResponse extends ApiResponse<Wishlist> {}

// Order Types
export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderApiResponse extends ApiResponse<Order> {}
export interface OrdersApiResponse extends ApiResponse<Order[]> {}

// Search Types
export interface SearchSuggestion {
  text: string;
  type: 'product' | 'category' | 'brand';
  count?: number;
}

export interface SearchResponse extends ApiResponse<Product[]> {
  suggestions?: SearchSuggestion[];
  filters?: {
    categories: Array<{ name: string; count: number }>;
    brands: Array<{ name: string; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
  };
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: string;
  subCategories?: Category[];
  productCount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryApiResponse extends ApiResponse<Category[]> {}

// Review Types
export interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsApiResponse extends ApiResponse<Review[]> {
  stats?: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: string]: number };
  };
}

// User Types (extended from your AuthContext)
export interface User {
  _id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  bio?: string;
  avatar?: string;
  isActive: boolean;
  preferences?: {
    currency: string;
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  _id: string;
  userId: string;
  type: 'order' | 'promotion' | 'account' | 'security';
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export interface NotificationApiResponse extends ApiResponse<Notification[]> {}