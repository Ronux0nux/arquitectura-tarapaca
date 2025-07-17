import React from 'react';
import { useCart } from '../context/CartContext';

const CartButton = () => {
  const { getCartCount, toggleCart } = useCart();
  const count = getCartCount();

  return (
    <button
      onClick={toggleCart}
      className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all duration-200 z-40"
    >
      <div className="relative">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </div>
    </button>
  );
};

export default CartButton;
