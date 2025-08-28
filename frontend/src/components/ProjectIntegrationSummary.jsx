import React, { useState, useEffect } from 'react';
import ProjectExcelService from '../services/ProjectExcelService';
import ProviderService from '../services/ProviderService';
import CotizacionService from '../services/CotizacionService';
import { useNotifications } from '../context/NotificationContext';

export default function ProjectIntegrationSummary() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const { notifySuccess, notifyInfo } = useNotifications();

  useEffect(() => {
    loadProjects();
    loadStats();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await ProjectExcelService.getAllProjects();
      if (response.success) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Error cargando proyectos:', error);
    }
  };

  const loadStats = async () => {
    try {
      const [projectsStats, providersStats, cotizacionesStats] = await Promise.all([
        ProjectExcelService.getAllProjects(),
        ProviderService.getDataStatus(),
        CotizacionService.getDataStatus()
      ]);

      setStats({
        projects: projectsStats.data?.length || 0,
        providers: providersStats.cacheSize + providersStats.localStorageSize,
        cotizaciones: cotizacionesStats.cacheSize + cotizacionesStats.localStorageSize,
        templates: ProjectExcelService.getAvailableTemplates().length
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleProjectSelect = async (projectId) => {
    setLoading(true);
    try {
      const response = await ProjectExcelService.generateProjectExcelData(projectId);
      if (response.success) {
        setSelectedProject(projectId);
        setProjectData(response.data);
        notifySuccess(`Datos Excel generados para: ${response.data.project.name}`, 'Proyecto Cargado');
      }
    } catch (error) {
      console.error('Error generando datos del proyecto:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportProjectExcel = () => {
    if (!projectData) return;

    // Simular descarga (en implementación real, generaría archivo Excel)
    const projectInfo = {
      proyecto: projectData.project.name,
      hojas: Object.keys(projectData.sheets),
      presupuesto: projectData.project.budget,
      generado: new Date().toISOString()
    };

    const dataStr = JSON.stringify(projectInfo, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectData.project.name}_excel_data.json`;
    link.click();
    URL.revokeObjectURL(url);

    notifyInfo('Datos del proyecto exportados (Demo)', 'Exportación');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              📊 Sistema Integrado de Proyectos Excel
            </h1>
            <p className="text-blue-100">
              Gestión completa de proyectos con presupuestos, APUs, recursos y cotizaciones
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats.projects}</div>
            <div className="text-sm text-blue-200">Proyectos Disponibles</div>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🏗️</div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.projects}</div>
              <div className="text-sm text-gray-600">Proyectos</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🏢</div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.providers}</div>
              <div className="text-sm text-gray-600">Proveedores</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">💰</div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.cotizaciones}</div>
              <div className="text-sm text-gray-600">Cotizaciones</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📋</div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.templates}</div>
              <div className="text-sm text-gray-600">Plantillas Excel</div>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de proyecto */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Seleccionar Proyecto para Excel
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedProject === project.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => handleProjectSelect(project.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">{project.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{project.client}</p>
                  <p className="text-sm text-gray-500">{project.location}</p>
                </div>
                <div className="text-2xl">
                  {ProjectExcelService.getAvailableTemplates()
                    .find(t => t.id === project.type)?.icon || '🏗️'}
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Presupuesto:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
                      .format(project.budget)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    project.status === 'active' ? 'bg-green-100 text-green-800' :
                    project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Datos del proyecto seleccionado */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Generando datos Excel del proyecto...</p>
        </div>
      )}

      {projectData && !loading && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                📊 Datos Excel: {projectData.project.name}
              </h2>
              <p className="text-gray-600">
                Plantilla: {projectData.template.name} {projectData.template.icon}
              </p>
            </div>
            <button
              onClick={exportProjectExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              ⬇️ Exportar Excel
            </button>
                <button
      onClick={() => { setProjectData(null); setSelectedProject(null); }}
      className="px-2 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-lg font-bold"
      title="Cerrar"
    >
      ×
    </button>
          </div>

          {/* Hojas disponibles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Object.entries(projectData.sheets).map(([sheetName, sheetData]) => (
              <div key={sheetName} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">{sheetName}</h3>
                <div className="text-sm text-gray-600">
                  <div>Filas: {sheetData.data?.length || 0}</div>
                  <div>Columnas: {sheetData.headers?.length || 0}</div>
                </div>
                <div className="mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    Excel Sheet
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen del proyecto */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Resumen del Proyecto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Cliente:</span>
                <div className="font-medium">{projectData.project.client}</div>
              </div>
              <div>
                <span className="text-gray-600">Ubicación:</span>
                <div className="font-medium">{projectData.project.location}</div>
              </div>
              <div>
                <span className="text-gray-600">Fecha Inicio:</span>
                <div className="font-medium">{projectData.project.startDate}</div>
              </div>
              <div>
                <span className="text-gray-600">Fecha Fin:</span>
                <div className="font-medium">{projectData.project.endDate}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          💡 Funcionalidades Integradas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-700 mb-2">📊 Presupuestos</h4>
            <ul className="text-blue-600 space-y-1">
              <li>• Materiales por proyecto</li>
              <li>• Cotizaciones integradas</li>
              <li>• Cálculos automáticos</li>
              <li>• Control de proveedores</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-700 mb-2">🔧 APUs</h4>
            <ul className="text-blue-600 space-y-1">
              <li>• Análisis de precios unitarios</li>
              <li>• Mano de obra</li>
              <li>• Equipos y materiales</li>
              <li>• Subcontratos</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-700 mb-2">📋 Recursos</h4>
            <ul className="text-blue-600 space-y-1">
              <li>• Personal especializado</li>
              <li>• Equipos por días</li>
              <li>• Costos totales</li>
              <li>• Planificación temporal</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-700 mb-2">🏢 Proveedores</h4>
            <ul className="text-blue-600 space-y-1">
              <li>• Base de datos integrada</li>
              <li>• Importación CSV</li>
              <li>• Conexión MongoDB Atlas</li>
              <li>• Gestión offline</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
