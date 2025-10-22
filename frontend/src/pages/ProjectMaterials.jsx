import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ProjectMaterials() {
  const { id } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('resumen');

  useEffect(() => {
    fetchProjectMaterials();
  }, [id]);

  const fetchProjectMaterials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${id}/materiales`);
      if (!response.ok) throw new Error('Error al cargar los datos');
      const data = await response.json();
      setProjectData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CL');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'Aprobada': 'bg-green-100 text-green-800',
      'Rechazada': 'bg-red-100 text-red-800',
      'Comprada': 'bg-blue-100 text-blue-800',
      'Recibida': 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!projectData) return null;

  const { proyecto, cotizaciones, ordenesCompra, materialesMasCotizados } = projectData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header del proyecto */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{proyecto.nombre}</h1>
            <p className="text-gray-600">Código: {proyecto.codigo}</p>
            <p className="text-sm text-gray-500">
              {formatDate(proyecto.fechaInicio)} - {formatDate(proyecto.fechaTermino)}
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              proyecto.estado === 'En ejecución' ? 'bg-green-100 text-green-800' :
              proyecto.estado === 'Finalizado' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {proyecto.estado}
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <span className="text-blue-600 font-semibold">$</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cotizaciones</p>
              <p className="text-2xl font-semibold text-gray-900">{cotizaciones.resumen.total}</p>
              <p className="text-sm text-gray-600">{formatCurrency(cotizaciones.resumen.montoTotal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <span className="text-green-600 font-semibold">OC</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Órdenes de Compra</p>
              <p className="text-2xl font-semibold text-gray-900">{ordenesCompra.resumen.total}</p>
              <p className="text-sm text-gray-600">{formatCurrency(ordenesCompra.resumen.montoTotal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">!</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pendientes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {cotizaciones.resumen.pendientes + ordenesCompra.resumen.pendientes}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <span className="text-purple-600 font-semibold">M</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Materiales</p>
              <p className="text-2xl font-semibold text-gray-900">{materialesMasCotizados.length}</p>
            </div>
          </div>
        </div>
      </div>      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'resumen', label: 'Resumen' },
              { id: 'cotizaciones', label: 'Cotizaciones' },
              { id: 'ordenes', label: 'Órdenes de Compra' },
              { id: 'materiales', label: 'Materiales' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: Resumen */}
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resumen de Cotizaciones */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    Estado de Cotizaciones
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Pendientes:</span>
                      <span className="font-medium">{cotizaciones.resumen.pendientes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Aprobadas:</span>
                      <span className="font-medium text-green-600">{cotizaciones.resumen.aprobadas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Compradas:</span>
                      <span className="font-medium text-blue-600">{cotizaciones.resumen.compradas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rechazadas:</span>
                      <span className="font-medium text-red-600">{cotizaciones.resumen.rechazadas}</span>
                    </div>
                  </div>
                </div>

                {/* Resumen de Órdenes */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    Estado de Órdenes
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Pendientes:</span>
                      <span className="font-medium">{ordenesCompra.resumen.pendientes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Aprobadas:</span>
                      <span className="font-medium text-green-600">{ordenesCompra.resumen.aprobadas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recibidas:</span>
                      <span className="font-medium text-blue-600">{ordenesCompra.resumen.recibidas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Canceladas:</span>
                      <span className="font-medium text-red-600">{ordenesCompra.resumen.canceladas}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Cotizaciones */}
          {activeTab === 'cotizaciones' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Lista de Cotizaciones</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  + Nueva Cotización
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Material</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Proveedor</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Cantidad</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Precio Unit.</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Total</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Estado</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cotizaciones.lista.map((cotizacion) => (
                      <tr key={cotizacion.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{cotizacion.nombreMaterial}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {cotizacion.proveedorId?.nombre || 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {cotizacion.cantidad} {cotizacion.unidad}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatCurrency(cotizacion.precioUnitario)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                          {formatCurrency(cotizacion.cantidad * cotizacion.precioUnitario)}
                        </td>
                        <td className="px-4 py-2">{getStatusBadge(cotizacion.estado)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatDate(cotizacion.fechaCotizacion)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Órdenes de Compra */}
          {activeTab === 'ordenes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Lista de Órdenes de Compra</h3>
                <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                  + Nueva Orden
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">N° Orden</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Proveedor</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Monto</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Estado</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Fecha</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Entrega</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ordenesCompra.lista.map((orden) => (
                      <tr key={orden._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                          {orden.numeroOrden || orden._id.slice(-6)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{orden.proveedor}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                          {formatCurrency(orden.montoNeto)}
                        </td>
                        <td className="px-4 py-2">{getStatusBadge(orden.estado)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatDate(orden.fecha)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {orden.fechaEntregaEstimada ? formatDate(orden.fechaEntregaEstimada) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Materiales */}
          {activeTab === 'materiales' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Materiales Más Cotizados</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materialesMasCotizados.map((material, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{material.nombre}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Unidad: {material.unidad}</p>
                      <p>Cotizaciones: {material.totalCotizaciones}</p>
                      <p>Cantidad total: {material.cantidadTotal}</p>
                      <p>Mejor precio: {formatCurrency(material.mejorPrecio)}</p>
                      <p>Precio promedio: {formatCurrency(material.precioPromedio)}</p>
                      <p>Proveedores: {material.proveedores.join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
