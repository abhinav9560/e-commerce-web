import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaSpinner } from 'react-icons/fa';

interface CartButtonProps {
  productId: string;
  className?: string;
  showCartIcon?: boolean;
  children?: React.ReactNode;
}

const CartButton: React.FC<CartButtonProps> = ({ 
  productId, 
  className = "", 
  showCartIcon = true,
  children 
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsAdding(true);
      await addToCart(productId, 1);
      
      // Optional: Show success message or toast
      console.log('Product added to cart successfully!');
      
      // Navigate to cart page after adding
      navigate('/cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Optional: Show error message or toast
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isAdding ? (
        <FaSpinner className="animate-spin" />
      ) : showCartIcon ? (
        <FaShoppingCart />
      ) : null}
      {children || (isAdding ? 'Adding...' : 'Add to Cart')}
    </button>
  );
};

export default CartButton;