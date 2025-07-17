import React from 'react';

const ActasReunion = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📋 Actas de Reunión</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Gestión de Actas de Reunión</h2>
          <p className="text-gray-600 mb-4">
            Las actas de reunión se pueden gestionar desde la sección de Proyectos.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Ve a la sección <strong>Proyectos</strong></p>
            <p>• Selecciona un proyecto específico</p>
            <p>• Haz clic en <strong>"Actas"</strong> para ver y gestionar las actas de reunión</p>
          </div>
          
          <div className="mt-6">
            <a 
              href="/projects" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Ir a Proyectos
            </a>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Funcionalidades disponibles:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Crear nuevas actas de reunión por proyecto</li>
          <li>• Ver detalles completos de cada acta</li>
          <li>• Buscar actas por diferentes criterios</li>
          <li>• Gestionar participantes y acuerdos</li>
          <li>• Exportar información de actas</li>
        </ul>
      </div>
    </div>
  );
};

export default ActasReunion;
