import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CompraModal = ({ isOpen, onClose, productos, onComprar }) => {
  const [proyectos, setProyectos] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`);
      setProyectos(response.data);
    } catch (error) {
      console.error('Error cargando proyectos:', error);
    }
  };

  const handleComprar = async () => {
    if (!selectedProject) {
      alert('Debes seleccionar un proyecto');
      return;
    }

    setLoading(true);
    try {
      await onComprar({
        projectId: selectedProject,
        productos,
        observaciones
      });
      
      setSelectedProject('');
      setObservaciones('');
      onClose();
    } catch (error) {
      console.error('Error realizando compra:', error);
      alert('Error al procesar la compra');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalCompra = productos.reduce((sum, producto) => {
    const precio = typeof producto.price === 'string' 
      ? parseFloat(producto.price.replace(/[^0-9]/g, '')) || 0
      : producto.price || 0;
    return sum + precio;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">🛒 Finalizar Compra</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Resumen de productos */}
        <div className="mb-4">
          <h4 className="font-medium mb-2">Productos a comprar ({productos.length})</h4>
          <div className="max-h-32 overflow-y-auto bg-gray-50 rounded p-2">
            {productos.map((producto, index) => (
              <div key={`producto-${producto.id}-${index}`} className="flex justify-between text-sm py-1">
                <span className="truncate">{producto.title}</span>
                <span className="font-medium">
                  ${(typeof producto.price === 'string' 
                    ? parseFloat(producto.price.replace(/[^0-9]/g, '')) || 0
                    : producto.price || 0
                  ).toLocaleString()}
                </span>
              </div>
            ))}
            <div className="border-t pt-1 mt-1 font-semibold flex justify-between">
              <span>Total:</span>
              <span>${totalCompra.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Selección de proyecto */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Asociar a Proyecto *
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccionar proyecto...</option>
            {proyectos.map((proyecto) => (
              <option key={proyecto.id || proyecto._id} value={proyecto.id || proyecto._id}>
                {proyecto.nombre} - {proyecto.ubicacion}
              </option>
            ))}
          </select>
        </div>

        {/* Observaciones */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Observaciones
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Notas adicionales sobre la compra..."
            rows="3"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleComprar}
            disabled={loading || !selectedProject}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '⏳ Procesando...' : '✅ Comprar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompraModal;
