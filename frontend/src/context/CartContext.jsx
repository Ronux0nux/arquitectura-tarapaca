import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('cotizacionCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cotizacionCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    const newItem = {
      id: Date.now() + Math.random(), // ID único
      title: item.title,
      price: item.price || 'Precio no disponible',
      source: item.source,
      link: item.link,
      thumbnail: item.thumbnail,
      type: item.type,
      searchTerm: item.searchTerm || '',
      dateAdded: new Date().toISOString(),
      quantity: 1,
      notes: '',
      category: item.category || 'General'
    };

    setCartItems(prev => [...prev, newItem]);
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateCartItem = (itemId, updates) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, ...updates }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartCount,
    isCartOpen,
    toggleCart,
    setIsCartOpen
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
