import React from 'react';
import { useCart } from '../context/CartContext';

const DemoCarrito = () => {
  const { addToCart, toggleCart, getCartCount } = useCart();

  const demoProducts = [
    {
      title: "Cemento Portland Tipo I - 25kg",
      price: "$3.500",
      source: "Ferreterías Cruz",
      link: "https://ejemplo.com/cemento",
      thumbnail: "https://via.placeholder.com/150x150/666/fff?text=Cemento",
      type: "shopping",
      category: "Albañilería"
    },
    {
      title: "Acero Corrugado A630-420H 12mm",
      price: "$890/metro",
      source: "Aceros del Norte",
      link: "https://ejemplo.com/acero",
      thumbnail: "https://via.placeholder.com/150x150/444/fff?text=Acero",
      type: "shopping",
      category: "Estructura"
    },
    {
      title: "Ladrillo Cerámico Hueco 14x19x29cm",
      price: "$185/unidad",
      source: "Ladrillos Tarapacá",
      link: "https://ejemplo.com/ladrillo",
      thumbnail: "https://via.placeholder.com/150x150/a0522d/fff?text=Ladrillo",
      type: "shopping",
      category: "Albañilería"
    },
    {
      title: "Pintura Látex Interior Blanca 4L",
      price: "$12.500",
      source: "Pinturas del Norte",
      link: "https://ejemplo.com/pintura",
      thumbnail: "https://via.placeholder.com/150x150/fff/000?text=Pintura",
      type: "shopping",
      category: "Terminaciones"
    }
  ];

  const handleAddDemo = (product) => {
    const demoItem = {
      ...product,
      searchTerm: "Productos de demostración",
      id: Date.now() + Math.random()
    };
    addToCart(demoItem);
    
    // Mostrar notificación
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = '✓ Producto demo agregado al carrito';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🛒 Demo del Carrito de Cotizaciones</h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">🏗️ Nuevo: Carrito Profesional</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">📊 Exporta Excel igual a tu archivo manual:</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>✅ Hoja PPTO con estructura por capítulos</li>
                <li>✅ Hoja APU con análisis detallado</li>
                <li>✅ Hoja RECURSOS con base de datos completa</li>
                <li>✅ Mismos campos y formato que tu Excel</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">🔄 Funcionalidades mejoradas:</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Editar cantidades, unidades y categorías</li>
                <li>• Agregar observaciones por producto</li>
                <li>• Cálculos automáticos de totales</li>
                <li>• Resumen financiero del proyecto</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Productos de Demostración</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Productos en carrito: {getCartCount()}
            </span>
            <button
              onClick={toggleCart}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Ver Carrito
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {demoProducts.map((product, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <img 
              src={product.thumbnail} 
              alt={product.title}
              className="w-full h-32 object-cover rounded-md mb-3"
            />
            <h4 className="font-semibold text-sm text-gray-800 mb-2 overflow-hidden" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {product.title}
            </h4>
            <p className="text-lg font-bold text-green-600 mb-1">
              {product.price}
            </p>
            <p className="text-xs text-gray-500 mb-3">
              {product.source}
            </p>
            <button
              onClick={() => handleAddDemo(product)}
              className="w-full bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              🛒 Agregar al carrito
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">📊 Próximos pasos:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">1. Agregar productos</h4>
            <p className="text-sm text-gray-600">
              Haz clic en "🛒 Agregar al carrito" para incorporar productos a tu cotización.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">2. Gestionar carrito profesional</h4>
            <p className="text-sm text-gray-600">
              Edita cantidades, unidades, categorías y observaciones como en tu Excel.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">3. Información del proyecto</h4>
            <p className="text-sm text-gray-600">
              Completa nombre del proyecto y cliente para generar cotización profesional.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">4. Exportar Excel igual al manual</h4>
            <p className="text-sm text-gray-600">
              Genera archivo con hojas PPTO, APU y RECURSOS idénticas a tu formato.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoCarrito;
