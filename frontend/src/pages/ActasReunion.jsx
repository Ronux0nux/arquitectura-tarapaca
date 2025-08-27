
import React, { useState, useEffect } from 'react';
import CreateActaReunion from '../components/CreateActaReunion';

const ActasReunion = () => {
  const [actas, setActas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActas = () => {
    setLoading(true);
    fetch('/api/actas-reunion')
      .then(res => res.json())
      .then(data => {
        setActas(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchActas();
  }, []);

  const handleCreateActa = (data) => {
    fetch('/api/actas-reunion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(result => {
        if (result.error) {
          alert('Error al crear acta: ' + result.error);
        } else {
          alert('Acta creada correctamente');
          fetchActas();
        }
      })
      .catch(err => {
        alert('Error de conexión: ' + err.message);
      });
  };

  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📋 Actas de Reunión</h1>
      <button
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
        onClick={() => setShowForm((prev) => !prev)}
      >
        {showForm ? 'Cancelar' : 'Crear nueva acta'}
      </button>
      {showForm && <CreateActaReunion onCreate={handleCreateActa} />}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Actas creadas</h2>
        {loading ? (
          <div className="text-gray-500">Cargando actas...</div>
        ) : actas.length === 0 ? (
          <div className="text-gray-500">No hay actas registradas.</div>
        ) : (
          <ul className="space-y-4">
            {actas.map((acta) => (
              <li key={acta.id} className="bg-white rounded shadow p-4">
                <div className="font-bold text-blue-800 text-lg mb-1">{acta.titulo}</div>
                <div className="text-gray-700 mb-1">{acta.info_breve}</div>
                <div className="text-gray-600 mb-1"><strong>Propósito:</strong> {acta.proposito}</div>
                <div className="text-gray-600 mb-1"><strong>Descripción:</strong> {acta.descripcion}</div>
                <div className="text-gray-600 mb-1"><strong>Asistentes:</strong> {Array.isArray(acta.asistentes) ? acta.asistentes.join(', ') : ''}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* ...resto de la página... */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
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
