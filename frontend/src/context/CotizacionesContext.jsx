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
  const guardarCotizacion = async (cotizacionData) => {
    console.log('🔵 GUARDAR_COTIZACION LLAMADA CON:', cotizacionData);
    console.log('🔵 Proyecto:', cotizacionData.projectId, 'Tipo:', typeof cotizacionData.projectId);
    console.log('🔵 Productos:', cotizacionData.productos?.length || 0);
    
    // ✅ VALIDACIÓN PRINCIPAL: El projectId debe ser un número válido
    if (!cotizacionData.projectId || isNaN(cotizacionData.projectId) || cotizacionData.projectId === null) {
      console.error('❌ VALIDACIÓN FALLIDA: projectId debe ser un número válido', {
        projectId: cotizacionData.projectId,
        isNaN: isNaN(cotizacionData.projectId),
        tipo: typeof cotizacionData.projectId
      });
      alert('⚠️ Error: Proyecto inválido. Por favor, selecciona un proyecto válido.');
      return null;
    }
    
    if (!cotizacionData.productos || !Array.isArray(cotizacionData.productos) || cotizacionData.productos.length === 0) {
      console.error('❌ VALIDACIÓN FALLIDA: Productos inválidos o vacíos');
      alert('⚠️ Error: No hay productos para guardar.');
      return null;
    }
    
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

    // Guardar cada item como cotización individual en el backend
    try {
      console.log('💾 Guardando cotizaciones en backend para proyecto:', cotizacionData.projectId);
      console.log('💾 Número de productos:', cotizacionData.productos.length);
      
      const token = localStorage.getItem('tarapaca_token');
      console.log('🔐 Token disponible:', !!token);
      
      const promises = cotizacionData.productos.map((producto, idx) => {
        console.log(`📦 PRODUCTO #${idx}:`, JSON.stringify(producto, null, 2));
        
        const precio = typeof producto.price === 'string' && producto.price.includes('$') 
          ? parseFloat(producto.price.replace(/[$.,\s]/g, '')) || 0
          : parseInt(producto.price) || 0;

        const cotizacionItem = {
          proyectoId: parseInt(cotizacionData.projectId), // Garantizar que es número
          nombreMaterial: producto.title || 'Material sin nombre',
          unidad: producto.unit || 'un',
          cantidad: producto.quantity || 1,
          precioUnitario: precio,  // Campo correcto para backend
          estado: 'pendiente',
          observaciones: producto.notes || '',
          detalles: producto.category || ''
        };

        console.log(`📝 COTIZACIÓN #${idx} A ENVIAR:`, JSON.stringify(cotizacionItem, null, 2));
        
        return fetch('http://localhost:5000/api/cotizaciones', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(cotizacionItem)
        });
      });

      const responses = await Promise.all(promises);
      console.log('🔄 Respuestas HTTP del servidor:', responses.map(r => ({ status: r.status, ok: r.ok })));
      
      // Procesar respuestas
      const results = await Promise.all(
        responses.map(async (r, idx) => {
          const json = await r.json();
          console.log(`📊 RESPUESTA #${idx} (Status: ${r.status}):`, json);
          return json;
        })
      );
      
      console.log('✅ Cotizaciones guardadas exitosamente:', results.length, 'items');
      
      // Guardar en localStorage
      localStorage.setItem('cotizaciones_historial', JSON.stringify(nuevasCotizaciones));
      
      // Actualizar base de datos de productos
      actualizarProductosDatabase(cotizacionData.productos);
      
      return nuevaCotizacion;
    } catch (error) {
      console.error('❌ Error al guardar cotizaciones en backend:', error);
      alert('⚠️ Error al guardar la cotización en el servidor. Por favor, intenta nuevamente.');
      return null;
    }
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
