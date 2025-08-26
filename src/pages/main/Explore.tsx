import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  Heart,
  ShoppingCart,
  ChevronDown,
  SlidersHorizontal,
  X,
  Loader2,
} from "lucide-react";
import {
  productAPI,
  formatPrice,
  getImageUrl,
  getProductBadge,
  isProductOnSale,
} from "../../api/productService";
import { useCart } from "../../context/CartContext";
import { Product, ProductFilters } from "../../types/product";

const ExplorePage = () => {
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // API state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState({});
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Default categories if API doesn't provide them
  const defaultCategories = [
    { id: "all", name: "All Categories", count: totalProducts },
    { id: "electronics", name: "Electronics", count: 0 },
    { id: "fashion", name: "Fashion", count: 0 },
    { id: "home", name: "Home & Living", count: 0 },
    { id: "books", name: "Books", count: 0 },
    { id: "sports", name: "Sports", count: 0 },
    { id: "beauty", name: "Beauty", count: 0 },
  ];

  // Extract unique brands from products
  const brands = [
    ...new Set(products.map((product) => product.brand).filter(Boolean)),
  ];

  // Fetch products with filters
  const fetchProducts = async (isNewSearch = false) => {
    try {
      setLoading(true);
      setError("");

      const filters: ProductFilters = {
        page: isNewSearch ? 1 : currentPage,
        limit: 20,
        sortBy:
          sortBy === "featured"
            ? undefined
            : sortBy === "price"
            ? "price"
            : sortBy === "-price"
            ? "price"
            : sortBy === "-rating.average"
            ? "rating"
            : sortBy === "-createdAt"
            ? "createdAt"
            : undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 2000 ? priceRange[1] : undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        brands: selectedBrands.length > 0 ? selectedBrands : undefined,
      };

      let response;

      if (searchQuery.trim()) {
        response = await productAPI.searchProducts(searchQuery, filters);
      } else {
        response = await productAPI.getProducts(filters);
      }

      if (response.success) {
        const newProducts = response.data.products || [];

        if (isNewSearch) {
          setProducts(newProducts);
          setCurrentPage(1);
        } else {
          setProducts((prev) => [...prev, ...newProducts]);
        }

        setTotalProducts(response.total || newProducts.length);
        setHasMore(newProducts.length === 20); // Assuming 20 is the limit
      } else {
        setError("Failed to fetch products");
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(err.message || "Failed to fetch products");
      if (isNewSearch) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load more products
  const loadMore = () => {
    if (!loading && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Handle add to cart
  const handleAddToCart = async (productId) => {
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

  // Toggle brand filter
  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory("all");
    setPriceRange([0, 2000]);
    setSelectedBrands([]);
    setSearchQuery("");
  };

  // Effect for initial load and filter changes
  useEffect(() => {
    fetchProducts(true);
  }, [searchQuery, selectedCategory, sortBy, priceRange, selectedBrands]);

  // Effect for pagination
  useEffect(() => {
    if (currentPage > 1) {
      fetchProducts(false);
    }
  }, [currentPage]);

  // Get rating safely
  const getRating = (product) => {
    if (product.rating && typeof product.rating === "object") {
      return {
        average: product.rating.average || 0,
        count: product.rating.count || 0,
      };
    }
    return { average: 0, count: 0 };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Search products..."
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="-rating.average">Highest Rated</option>
                  <option value="-createdAt">Newest</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Filters Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div
            className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              {/* Close Filters (Mobile) */}
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">
                  Categories
                </h4>
                <div className="space-y-3">
                  {defaultCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left flex items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="text-sm">{category.name}</span>
                      <span className="text-xs text-gray-500">
                        (
                        {category.id === "all" ? totalProducts : category.count}
                        )
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">
                  Price Range
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([
                          parseInt(e.target.value) || 0,
                          priceRange[1],
                        ])
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Min"
                      min="0"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([
                          priceRange[0],
                          parseInt(e.target.value) || 2000,
                        ])
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Max"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Brands */}
              {brands.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">
                    Brands
                  </h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {loading && products.length === 0
                  ? "Loading..."
                  : `Showing ${products.length} of ${totalProducts} products`}
              </p>
              <div className="lg:hidden">
                <button
                  onClick={() =>
                    setViewMode(viewMode === "grid" ? "list" : "grid")
                  }
                  className="p-2 bg-white border border-gray-200 rounded-lg"
                >
                  {viewMode === "grid" ? (
                    <List className="w-4 h-4" />
                  ) : (
                    <Grid className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Error loading products
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchProducts(true)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && products.length === 0 && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
                <p className="text-gray-600">Loading products...</p>
              </div>
            )}

            {/* Products */}
            {!loading && products.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {products.length > 0 && (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {products.map((product) => {
                      const rating = getRating(product);
                      const isAddingToCart = addingToCart[product._id];
                      const badge = getProductBadge(product);

                      return (
                        <div
                          key={product._id}
                          className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 cursor-pointer border border-gray-100"
                        >
                          <div className="relative">
                            <img
                              src={getImageUrl(product.images)}
                              alt={product.title}
                              className="w-full h-48 sm:h-56 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop";
                              }}
                            />
                            {badge && (
                              <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-md">
                                {badge}
                              </span>
                            )}
                            {product.newArrival && (
                              <span className="absolute top-3 right-12 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-md">
                                New
                              </span>
                            )}
                            <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                              <Heart className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>

                          <div className="p-4 sm:p-5">
                            <p className="text-xs text-gray-500 mb-1">
                              {product.brand}
                            </p>
                            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base line-clamp-2">
                              {product.title}
                            </h3>

                            <div className="flex items-center space-x-1 mb-3">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium text-gray-900">
                                {rating.average.toFixed(1)}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({rating.count})
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-gray-900">
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
                                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
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
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => {
                      const rating = getRating(product);
                      const isAddingToCart = addingToCart[product._id];
                      const badge = getProductBadge(product);

                      return (
                        <div
                          key={product._id}
                          className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-100 p-4 sm:p-6"
                        >
                          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                            <div className="relative w-full sm:w-48 h-48 sm:h-32 flex-shrink-0">
                              <img
                                src={getImageUrl(product.images)}
                                alt={product.title}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop";
                                }}
                              />
                              {badge && (
                                <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-md">
                                  {badge}
                                </span>
                              )}
                              {product.newArrival && (
                                <span className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-md">
                                  New
                                </span>
                              )}
                            </div>

                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  {product.brand}
                                </p>
                                <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                                  {product.title}
                                </h3>

                                <div className="flex items-center space-x-1 mb-3">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {rating.average.toFixed(1)}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    ({rating.count} reviews)
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className="text-2xl font-bold text-gray-900">
                                    {formatPrice(product.price)}
                                  </span>
                                  {product.originalPrice &&
                                    product.originalPrice > product.price && (
                                      <span className="text-lg text-gray-500 line-through">
                                        {formatPrice(product.originalPrice)}
                                      </span>
                                    )}
                                </div>
                                <div className="flex items-center space-x-3">
                                  <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <Heart className="w-5 h-5 text-gray-600" />
                                  </button>
                                  <button
                                    onClick={() => handleAddToCart(product._id)}
                                    disabled={isAddingToCart}
                                    className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                  >
                                    {isAddingToCart ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <ShoppingCart className="w-4 h-4" />
                                    )}
                                    <span>Add to Cart</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Load More Button */}
                {hasMore && !loading && (
                  <div className="text-center mt-8">
                    <button
                      onClick={loadMore}
                      className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Load More Products
                    </button>
                  </div>
                )}

                {/* Loading more indicator */}
                {loading && products.length > 0 && (
                  <div className="text-center mt-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
