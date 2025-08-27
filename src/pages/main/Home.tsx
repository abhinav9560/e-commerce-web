import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  User,
  Heart,
  ShoppingCart,
  Star,
  TrendingUp,
  Filter,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  productAPI,
  formatPrice,
  calculateDiscount,
  getImageUrl,
} from "../../api/productService";
import { Product } from "../../types/product";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartCount, addToCart, fetchCartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>(
    {}
  );

  const defaultCategories = [
    { name: "Electronics", icon: "📱", color: "bg-blue-100 text-blue-600" },
    { name: "Fashion", icon: "👗", color: "bg-pink-100 text-pink-600" },
    { name: "Home & Living", icon: "🏠", color: "bg-green-100 text-green-600" },
    { name: "Books", icon: "📚", color: "bg-purple-100 text-purple-600" },
    { name: "Sports", icon: "⚽", color: "bg-orange-100 text-orange-600" },
    { name: "Beauty", icon: "💄", color: "bg-red-100 text-red-600" },
  ];

  const trendingSearches = [
    "iPhone 15",
    "Nike Shoes",
    "Gaming Laptop",
    "Coffee Maker",
    "Yoga Mat",
  ];

  const handleCartClick = () => {
    navigate("/cart");
  };
  // Helper function to safely get rating value
  const getRatingValue = (rating: {
    average: number;
    count: number;
  }): number => {
    return rating?.average || 0;
  };

  // Helper function to safely get review count
  const getReviewCount = (rating: {
    average: number;
    count: number;
  }): number => {
    return rating?.count || 0;
  };

  // Add the missing getProductBadge function
  const getProductBadge = (product: Product): string | null => {
    // Check if product is new (created within last 30 days)
    if (product.newArrival) {
      return "New";
    }

    // Check if product is featured
    if (product.featured) {
      return "Featured";
    }

    // Check for discount
    if (product.originalPrice && product.originalPrice > product.price) {
      const discount = Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      );
      if (discount > 0) {
        return `${discount}% OFF`;
      }
    }

    // Check if low stock
    if (product.stock && product.stock <= 5) {
      return "Low Stock";
    }

    return null;
  };

  // Handle add to cart with loading state
  const handleAddToCart = async (productId: string): Promise<void> => {
    try {
      setAddingToCart((prev) => ({ ...prev, [productId]: true }));
      await addToCart(productId, 1);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      // You could show a toast notification here
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        fetchCartCount();
        // Fetch featured products
        const productsResponse = await productAPI.getFeaturedProducts();
        if (productsResponse.success) {
          setFeaturedProducts(productsResponse.data || []);
        }

        // For now, use default categories since we don't have a categories endpoint
        // You can replace this with actual API call when categories endpoint is available
        setCategories(defaultCategories);
      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        setError(err.message);
        // Use fallback data on error
        setFeaturedProducts([]);
        setCategories(defaultCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">
                  {user?.fullName?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900 hidden sm:block">
                Marketplace
              </span>
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Search for products, brands, and more..."
                />
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
              <button
                onClick={handleCartClick}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                    {cartCount}
                  </span>
                )}
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
              <button
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Search products..."
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-lg">
          <div className="px-4 py-2 space-y-2">
            <a
              href="#"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Categories
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Deals
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              New Arrivals
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Help
            </a>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">Failed to load data: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Hero Section */}
        <section className="mb-8 lg:mb-12">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="max-w-2xl">
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4">
                  Discover Amazing Products
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl mb-6 text-white/90">
                  Shop the latest trends with exclusive deals and fast delivery
                </p>
                <button className="bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                  Shop Now
                </button>
              </div>
            </div>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute bottom-10 right-32 w-20 h-20 bg-white rounded-full"></div>
              <div className="absolute top-32 right-64 w-16 h-16 bg-white rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-8 lg:mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Shop by Category
            </h2>
            <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm sm:text-base">
              View All
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {categories.map((category: any, index: number) => (
              <div
                key={index}
                className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 text-center hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 cursor-pointer border border-gray-100"
              >
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl ${category.color} flex items-center justify-center mx-auto mb-3 text-xl sm:text-2xl`}
                >
                  {category.icon}
                </div>
                <h3 className="font-medium text-gray-900 text-xs sm:text-sm lg:text-base">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        </section>

        {/* Trending Searches */}
        <section className="mb-8 lg:mb-12">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
            Trending Searches
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {trendingSearches.map((search, index) => (
              <span
                key={index}
                className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 cursor-pointer transition-colors duration-200"
              >
                {search}
              </span>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="mb-8 lg:mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
              <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm sm:text-base">
                View All
              </button>
            </div>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No featured products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product: Product) => {
                const ratingValue = getRatingValue(product.rating);
                const reviewCount = getReviewCount(product.rating);
                const isAddingToCart = addingToCart[product._id];
                const productBadge = getProductBadge(product);

                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-xl lg:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 cursor-pointer border border-gray-100"
                  >
                    <div className="relative">
                      <img
                        src={getImageUrl(product.images)}
                        alt={product.title}
                        className="w-full h-40 sm:h-48 lg:h-56 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop";
                        }}
                      />
                      {productBadge && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-indigo-600 text-white text-xs font-medium rounded-md">
                          {productBadge}
                        </span>
                      )}
                      <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                        <Heart className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>

                    <div className="p-4 sm:p-5">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base line-clamp-2">
                        {product.title}
                      </h3>

                      <div className="flex items-center space-x-1 mb-3">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {ratingValue.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({reviewCount})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg sm:text-xl font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                        </div>
                        <button
                          onClick={() => handleAddToCart(product._id)}
                          disabled={isAddingToCart}
                          className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAddingToCart ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ShoppingCart className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HomePage;
