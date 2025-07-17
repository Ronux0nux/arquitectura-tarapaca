import React, { createContext, useContext, useState, useEffect } from 'react';

const CotizacionesContext = createContext();

export const useCotizaciones = () => {
  const context = useContext(CotizacionesContext);
  if (!context) {
    throw new Error('useCotizaciones must be used within a CotizacionesProvider');
  }
  return context;
};

export const CotizacionesProvider = ({ children }) => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [productosDatabase, setProductosDatabase] = useState([]);

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedCotizaciones = localStorage.getItem('cotizaciones_historial');
    const savedProductos = localStorage.getItem('productos_database');
    
    if (savedCotizaciones) {
      setCotizaciones(JSON.parse(savedCotizaciones));
    }
    
    if (savedProductos) {
      setProductosDatabase(JSON.parse(savedProductos));
    }
  }, []);

  // Guardar cotización cuando se exporta a Excel
  const guardarCotizacion = (cotizacionData) => {
    const nuevaCotizacion = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      fechaFormateada: new Date().toLocaleDateString('es-CL'),
      ...cotizacionData,
      totalProductos: cotizacionData.productos.length,
      totalItems: cotizacionData.productos.reduce((sum, item) => sum + (item.quantity || 1), 0),
      montoEstimado: cotizacionData.productos.reduce((total, item) => {
        const precio = typeof item.price === 'string' && item.price.includes('$') 
          ? parseFloat(item.price.replace(/[$.,\s]/g, '')) || 0
          : 0;
        return total + (precio * (item.quantity || 1));
      }, 0)
    };

    const nuevasCotizaciones = [nuevaCotizacion, ...cotizaciones];
    setCotizaciones(nuevasCotizaciones);
    localStorage.setItem('cotizaciones_historial', JSON.stringify(nuevasCotizaciones));

    // Actualizar base de datos de productos
    actualizarProductosDatabase(cotizacionData.productos);
    
    return nuevaCotizacion;
  };

  // Actualizar base de datos de productos únicos
  const actualizarProductosDatabase = (nuevosProductos) => {
    const productosExistentes = [...productosDatabase];
    
    nuevosProductos.forEach(producto => {
      const existe = productosExistentes.find(p => 
        p.title === producto.title && p.source === producto.source
      );
      
      if (!existe) {
        productosExistentes.push({
          ...producto,
          id: Date.now() + Math.random(),
          fechaAgregado: new Date().toISOString(),
          vecesUsado: 1,
          ultimoUso: new Date().toISOString()
        });
      } else {
        existe.vecesUsado = (existe.vecesUsado || 1) + 1;
        existe.ultimoUso = new Date().toISOString();
        // Actualizar precio si es más reciente
        if (producto.price && producto.price !== 'Precio no disponible') {
          existe.price = producto.price;
        }
      }
    });

    setProductosDatabase(productosExistentes);
    localStorage.setItem('productos_database', JSON.stringify(productosExistentes));
  };

  // Eliminar cotización
  const eliminarCotizacion = (id) => {
    const nuevasCotizaciones = cotizaciones.filter(c => c.id !== id);
    setCotizaciones(nuevasCotizaciones);
    localStorage.setItem('cotizaciones_historial', JSON.stringify(nuevasCotizaciones));
  };

  // Buscar productos en la base de datos
  const buscarEnDatabase = (termino) => {
    if (!termino.trim()) return [];
    
    const terminoLower = termino.toLowerCase();
    return productosDatabase.filter(producto => 
      producto.title.toLowerCase().includes(terminoLower) ||
      producto.source.toLowerCase().includes(terminoLower) ||
      (producto.category && producto.category.toLowerCase().includes(terminoLower))
    ).sort((a, b) => b.vecesUsado - a.vecesUsado); // Ordenar por más usado
  };

  // Obtener productos más usados
  const getProductosMasUsados = (limite = 10) => {
    return productosDatabase
      .sort((a, b) => b.vecesUsado - a.vecesUsado)
      .slice(0, limite);
  };

  // Obtener productos usados recientemente
  const getProductosRecientes = (limite = 10) => {
    return productosDatabase
      .sort((a, b) => new Date(b.ultimoUso) - new Date(a.ultimoUso))
      .slice(0, limite);
  };

  // Obtener estadísticas
  const getEstadisticas = () => {
    const totalCotizaciones = cotizaciones.length;
    const totalProductosUnicos = productosDatabase.length;
    const montoTotalEstimado = cotizaciones.reduce((sum, cot) => sum + cot.montoEstimado, 0);
    
    const categorias = {};
    productosDatabase.forEach(producto => {
      const cat = producto.category || 'Sin categoría';
      categorias[cat] = (categorias[cat] || 0) + producto.vecesUsado;
    });

    return {
      totalCotizaciones,
      totalProductosUnicos,
      montoTotalEstimado,
      categorias,
      cotizacionPromedio: totalCotizaciones > 0 ? montoTotalEstimado / totalCotizaciones : 0
    };
  };

  const value = {
    cotizaciones,
    productosDatabase,
    guardarCotizacion,
    eliminarCotizacion,
    buscarEnDatabase,
    getProductosMasUsados,
    getProductosRecientes,
    getEstadisticas
  };

  return (
    <CotizacionesContext.Provider value={value}>
      {children}
    </CotizacionesContext.Provider>
  );
};

export default CotizacionesProvider;
