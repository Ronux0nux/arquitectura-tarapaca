import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

// Función para generar UUID única y robusta
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
};

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
    console.log('📦 Cargando carrito desde localStorage:', savedCart ? 'ENCONTRADO' : 'VACÍO');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('📦 Carrito parseado:', parsedCart.length, 'items');
        setCartItems(parsedCart);
      } catch (error) {
        console.error('❌ Error al cargar carrito:', error);
        setCartItems([]);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    console.log('💾 Guardando carrito en localStorage. Items:', cartItems.length);
    console.log('💾 Contenido:', cartItems.map(item => ({ id: item.id, title: item.title })));
    localStorage.setItem('cotizacionCart', JSON.stringify(cartItems));
    console.log('✅ Carrito guardado exitosamente en localStorage');
  }, [cartItems]);

  const addToCart = (item) => {
    const newItem = {
      id: generateUniqueId(), // ID único y robusto
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
      category: item.category || 'General',
      projectId: item.projectId || null, // 🆕 ID del proyecto
      projectName: item.projectName || '' // 🆕 Nombre del proyecto
    };

    console.log('🛒 AGREGANDO AL CARRITO:');
    console.log('  - Producto:', newItem.title);
    console.log('  - ID único:', newItem.id);
    console.log('  - Precio:', newItem.price);
    
    setCartItems(prev => {
      const updated = [...prev, newItem];
      console.log('🛒 Carrito actualizado. Total items:', updated.length);
      return updated;
    });
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
