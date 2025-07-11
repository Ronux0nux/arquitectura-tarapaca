import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ActasReunion() {
  const [actas, setActas] = useState([]);
  const [filteredActas, setFilteredActas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    proyectoId: '',
    entidad: '',
    fecha: '',
    fechaInicio: '',
    fechaFin: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedActa, setSelectedActa] = useState(null);
  const [form, setForm] = useState({
    proyectoId: '',
    entidad: '',
    fecha: '',
    horaInicio: '',
    horaTermino: '',
    objetivoReunion: '',
    temasTratados: '',
    acuerdos: '',
    participantes: [],
    creadoPor: '507f1f77bcf86cd799439011' // ID temporal - en un sistema real vendría del usuario autenticado
  });

  useEffect(() => {
    loadActas();
    loadProyectos();
  }, []);

  const loadActas = () => {
    axios.get('http://localhost:5000/api/actas-reunion')
      .then(res => {
        setActas(res.data);
        setFilteredActas(res.data);
      })
      .catch(err => console.error(err));
  };

  const loadProyectos = () => {
    axios.get('http://localhost:5000/api/projects')
      .then(res => setProyectos(res.data))
      .catch(err => console.error(err));
  };

  const handleChange = e => {
    if (e.target.name === 'participantes') {
      // Convertir la lista de participantes separada por comas en array
      const participantesArray = e.target.value.split(',').map(p => p.trim()).filter(p => p);
      setForm({ ...form, [e.target.name]: participantesArray });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSearchChange = e => {
    const newFilters = { ...searchFilters, [e.target.name]: e.target.value };
    setSearchFilters(newFilters);
    performSearch(newFilters);
  };

  const performSearch = (filters = searchFilters) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? 
      `http://localhost:5000/api/actas-reunion/search?${queryString}` :
      'http://localhost:5000/api/actas-reunion';

    axios.get(url)
      .then(res => setFilteredActas(res.data))
      .catch(err => console.error(err));
  };

  const handleSubmit = e => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/actas-reunion', form)
      .then(res => {
        setActas([res.data, ...actas]);
        setFilteredActas([res.data, ...filteredActas]);
        alert('Acta de reunión creada exitosamente');
        setForm({
          proyectoId: '',
          entidad: '',
          fecha: '',
          horaInicio: '',
          horaTermino: '',
          objetivoReunion: '',
          temasTratados: '',
          acuerdos: '',
          participantes: [],
          creadoPor: '507f1f77bcf86cd799439011'
        });
        setShowCreateForm(false);
      })
      .catch(err => alert('Error al crear acta: ' + (err.response?.data?.error || err.message)));
  };

  const clearSearch = () => {
    setSearchFilters({
      proyectoId: '',
      entidad: '',
      fecha: '',
      fechaInicio: '',
      fechaFin: ''
    });
    setFilteredActas(actas);
  };

  const handleViewDetails = (acta) => {
    setSelectedActa(acta);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatTime = (timeString) => {
    return timeString ? timeString.slice(0, 5) : '';
  };

  return (
    <div className="p-6">
      {/* Header con botón de crear acta */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Actas de Reunión</h2>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span>
          Nueva Acta
        </button>
      </div>

      {/* Barra de búsqueda */}
      <h2 className="text-xl font-semibold mb-2">Buscar Actas de Reunión</h2>
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <select 
          className="border p-2 rounded" 
          name="proyectoId" 
          value={searchFilters.proyectoId} 
          onChange={handleSearchChange}
        >
          <option value="">Todos los proyectos</option>
          {proyectos.map(proyecto => (
            <option key={proyecto._id} value={proyecto._id}>
              {proyecto.nombre}
            </option>
          ))}
        </select>
        <input 
          className="border p-2 rounded" 
          name="entidad" 
          placeholder="Entidad" 
          value={searchFilters.entidad} 
          onChange={handleSearchChange} 
        />
        <input 
          className="border p-2 rounded" 
          name="fecha" 
          type="date" 
          title="Fecha específica"
          value={searchFilters.fecha} 
          onChange={handleSearchChange} 
        />
        <input 
          className="border p-2 rounded" 
          name="fechaInicio" 
          type="date" 
          title="Desde fecha"
          value={searchFilters.fechaInicio} 
          onChange={handleSearchChange} 
        />
        <input 
          className="border p-2 rounded" 
          name="fechaFin" 
          type="date" 
          title="Hasta fecha"
          value={searchFilters.fechaFin} 
          onChange={handleSearchChange} 
        />
        <button 
          onClick={clearSearch} 
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Limpiar
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Lista de Actas ({filteredActas.length} resultados)</h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2 text-left">Proyecto</th>
              <th className="border p-2 text-left">Entidad</th>
              <th className="border p-2 text-left">Fecha</th>
              <th className="border p-2 text-left">Hora</th>
              <th className="border p-2 text-left">Objetivo</th>
              <th className="border p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredActas.map(acta => (
              <tr key={acta._id} className="hover:bg-gray-50">
                <td className="border p-2">
                  {acta.proyectoId?.nombre || 'N/A'}
                  <br />
                  <span className="text-xs text-gray-500">
                    {acta.proyectoId?.codigo || ''}
                  </span>
                </td>
                <td className="border p-2">{acta.entidad}</td>
                <td className="border p-2">{formatDate(acta.fecha)}</td>
                <td className="border p-2">
                  {formatTime(acta.horaInicio)} - {formatTime(acta.horaTermino)}
                </td>
                <td className="border p-2">
                  <div className="max-w-xs truncate" title={acta.objetivoReunion}>
                    {acta.objetivoReunion}
                  </div>
                </td>
                <td className="border p-2">
                  <button 
                    onClick={() => handleViewDetails(acta)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para crear acta */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Crear Nueva Acta de Reunión</h2>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Proyecto *</label>
                  <select 
                    className="border p-2 w-full rounded" 
                    name="proyectoId" 
                    value={form.proyectoId} 
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar proyecto</option>
                    {proyectos.map(proyecto => (
                      <option key={proyecto._id} value={proyecto._id}>
                        {proyecto.nombre} - {proyecto.codigo}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Entidad *</label>
                  <input 
                    className="border p-2 w-full rounded" 
                    name="entidad" 
                    placeholder="Nombre de la entidad" 
                    value={form.entidad} 
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha *</label>
                  <input 
                    className="border p-2 w-full rounded" 
                    name="fecha" 
                    type="date" 
                    value={form.fecha} 
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Participantes</label>
                  <input 
                    className="border p-2 w-full rounded" 
                    name="participantes" 
                    placeholder="Separar por comas: Juan Pérez, María García..." 
                    value={form.participantes.join(', ')} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora de Inicio *</label>
                  <input 
                    className="border p-2 w-full rounded" 
                    name="horaInicio" 
                    type="time" 
                    value={form.horaInicio} 
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora de Término *</label>
                  <input 
                    className="border p-2 w-full rounded" 
                    name="horaTermino" 
                    type="time" 
                    value={form.horaTermino} 
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Objetivo de la Reunión *</label>
                <textarea 
                  className="border p-2 w-full rounded" 
                  name="objetivoReunion" 
                  placeholder="Describir el objetivo principal de la reunión" 
                  value={form.objetivoReunion} 
                  onChange={handleChange}
                  rows="2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Temas Tratados *</label>
                <textarea 
                  className="border p-2 w-full rounded" 
                  name="temasTratados" 
                  placeholder="Detallar los temas que se discutieron en la reunión" 
                  value={form.temasTratados} 
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Acuerdos *</label>
                <textarea 
                  className="border p-2 w-full rounded" 
                  name="acuerdos" 
                  placeholder="Listar los acuerdos alcanzados y compromisos asumidos" 
                  value={form.acuerdos} 
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Crear Acta
                </button>
                <button 
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para ver detalles del acta */}
      {showDetailsModal && selectedActa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Acta de Reunión - Detalles</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Información del proyecto y reunión */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Proyecto</label>
                  <p className="bg-gray-100 p-3 rounded">
                    <strong>{selectedActa.proyectoId?.nombre}</strong>
                    <br />
                    <span className="text-sm text-gray-600">Código: {selectedActa.proyectoId?.codigo}</span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Entidad</label>
                  <p className="bg-gray-100 p-3 rounded">{selectedActa.entidad}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Fecha</label>
                  <p className="bg-gray-100 p-3 rounded">{formatDate(selectedActa.fecha)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Horario</label>
                  <p className="bg-gray-100 p-3 rounded">
                    {formatTime(selectedActa.horaInicio)} - {formatTime(selectedActa.horaTermino)}
                  </p>
                </div>
              </div>

              {/* Participantes */}
              {selectedActa.participantes && selectedActa.participantes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">Participantes</label>
                  <div className="bg-gray-100 p-3 rounded">
                    <ul className="list-disc list-inside">
                      {selectedActa.participantes.map((participante, index) => (
                        <li key={index} className="text-sm">{participante}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Objetivo */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Objetivo de la Reunión</label>
                <p className="bg-gray-100 p-3 rounded whitespace-pre-wrap">{selectedActa.objetivoReunion}</p>
              </div>
              
              {/* Temas tratados */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Temas Tratados</label>
                <p className="bg-gray-100 p-3 rounded whitespace-pre-wrap min-h-[100px]">{selectedActa.temasTratados}</p>
              </div>
              
              {/* Acuerdos */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Acuerdos y Compromisos</label>
                <p className="bg-gray-100 p-3 rounded whitespace-pre-wrap min-h-[100px]">{selectedActa.acuerdos}</p>
              </div>

              {/* Información de creación */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Creado por</label>
                    <p className="text-sm bg-gray-100 p-2 rounded">
                      {selectedActa.creadoPor?.nombre || 'Usuario'} ({selectedActa.creadoPor?.email || 'N/A'})
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Fecha de creación</label>
                    <p className="text-sm bg-gray-100 p-2 rounded">
                      {formatDate(selectedActa.fechaCreacion)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
