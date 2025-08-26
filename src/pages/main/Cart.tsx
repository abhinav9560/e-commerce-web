import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../api/productService';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMinus, FaPlus, FaTrash, FaShoppingCart } from 'react-icons/fa';
import { CartItem } from '../../types/product';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cart,
    cartCount,
    loading,
    error,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart
  } = useCart();

  const [updatingItems, setUpdatingItems] = useState<{[key: string]: boolean}>({});
  const [removingItems, setRemovingItems] = useState<{[key: string]: boolean}>({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Refresh cart on component mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Handle quantity update
  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1 || !productId) return;

    try {
      setUpdatingItems(prev => ({ ...prev, [productId]: true }));
      await updateCartItem(productId, newQuantity);
    } catch (err) {
      console.error('Failed to update quantity:', err);
    } finally {
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Handle item removal
  const handleRemoveItem = async (productId: string) => {
    if (!productId) return;

    try {
      setRemovingItems(prev => ({ ...prev, [productId]: true }));
      await removeFromCart(productId);
    } catch (err) {
      console.error('Failed to remove item:', err);
    } finally {
      setRemovingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    try {
      await clearCart();
      setShowClearConfirm(false);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  // Calculate totals - use the totalAmount from API response
  const subtotal = cart?.totalAmount || 0;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Loading state
  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-20 md:pb-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
            >
              <FaArrowLeft />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Shopping Cart</h1>
            <div></div>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet</p>
            <button
              onClick={() => navigate('/explore')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20 md:pb-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Shopping Cart</h1>
            <p className="text-gray-600">{cartCount} items</p>
          </div>
          {cartCount > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item: CartItem) => {
              // Safety checks for item data
              if (!item || !item.product) {
                console.warn('Invalid cart item:', item);
                return null;
              }

              const product = item.product;
              console.log(product, 'product in cart item');

              const productId = product._id;
              const imageUrl = product.images[0]?.url && product.images.length > 0
                ? product.images[0].url
                : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop';

              return (
                <div
                  key={productId}
                  className="bg-white rounded-lg shadow-sm p-4"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt={product.title || 'Product'}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                          {product.title || 'Product Name'}
                        </h3>
                        <button
                          onClick={() => handleRemoveItem(productId)}
                          disabled={removingItems[productId]}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          {removingItems[productId] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                          ) : (
                            <FaTrash className="text-sm" />
                          )}
                        </button>
                      </div>

                      {/* Brand and Category */}
                      {(product.brand || product.category) && (
                        <p className="text-sm text-gray-600 mb-2">
                          {product.brand && `${product.brand} • `}
                          {product.category}
                        </p>
                      )}

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-gray-800">
                          {formatPrice(item.price || product.price || 0)}
                          {product.originalPrice && product.originalPrice > (item.price || product.price) && (
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(productId, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updatingItems[productId]}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {updatingItems[productId] ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                            ) : (
                              item.quantity || 1
                            )}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(productId, item.quantity + 1)}
                            disabled={updatingItems[productId]}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                          >
                            <FaPlus className="text-xs" />
                          </button>
                        </div>
                      </div>

                      {/* Stock Status */}
                      {product.stock && product.stock <= 5 && (
                        <div className="mt-2 text-sm text-orange-600">
                          Only {product.stock} left in stock
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }).filter(Boolean)}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                Proceed to Checkout
              </button>

              {/* Free Shipping Notice */}
              {subtotal < 50 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    Add {formatPrice(50 - subtotal)} more for FREE shipping!
                  </p>
                </div>
                )}
            </div>
          </div>
        </div>

        {/* Clear Cart Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Clear Cart</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove all items from your cart?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearCart}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;