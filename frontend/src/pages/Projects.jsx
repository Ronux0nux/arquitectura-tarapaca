import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [filteredProyectos, setFilteredProyectos] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    id: '',
    nombre: '',
    codigo: '',
    fechaInicio: '',
    fechaTermino: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    codigo: '',
    fechaInicio: '',
    fechaTermino: '',
    subjefe: '', // ID del coordinador encargado
    equipo: [],  // vacío por ahora
    descripcion: '',
    ubicacion: ''
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    axios.get('http://localhost:5000/api/proyectos')
      .then(res => {
        setProyectos(res.data);
        setFilteredProyectos(res.data);
      })
      .catch(err => console.error(err));
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearchChange = e => {
    const newFilters = { ...searchFilters, [e.target.name]: e.target.value };
    setSearchFilters(newFilters);
    
    // Búsqueda instantánea
    performSearch(newFilters);
  };

  const performSearch = (filters = searchFilters) => {
    // Construir query string con los filtros
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? 
      `http://localhost:5000/api/proyectos/search?${queryString}` :
      'http://localhost:5000/api/proyectos';

    axios.get(url)
      .then(res => setFilteredProyectos(res.data))
      .catch(err => console.error(err));
  };

  const handleSearch = () => {
    performSearch();
  };

  const handleSubmit = e => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/proyectos', form)
      .then(res => {
        setProyectos([...proyectos, res.data]);
        setFilteredProyectos([...proyectos, res.data]);
        alert('Proyecto creado');
        // Limpiar formulario
        setForm({
          nombre: '',
          codigo: '',
          fechaInicio: '',
          fechaTermino: '',
          subjefe: '',
          equipo: [],
          descripcion: '',
          ubicacion: ''
        });
        setShowCreateForm(false); // Cerrar el modal
      })
      .catch(err => alert('Error al crear proyecto: ' + err.response?.data?.detalle));
  };

  const clearSearch = () => {
    setSearchFilters({
      id: '',
      nombre: '',
      codigo: '',
      fechaInicio: '',
      fechaTermino: ''
    });
    setFilteredProyectos(proyectos);
  };

  return (
    <div className="p-6">
      {/* Header con botón de crear proyecto */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Proyectos</h2>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span>
          Nuevo Proyecto
        </button>
      </div>

      {/* Barra de búsqueda */}
      <h2 className="text-xl font-semibold mb-2">Buscar Proyectos</h2>
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <input 
          className="border p-2 rounded" 
          name="id" 
          placeholder="ID" 
          value={searchFilters.id} 
          onChange={handleSearchChange} 
        />
        <input 
          className="border p-2 rounded" 
          name="nombre" 
          placeholder="Nombre (Razón Social)" 
          value={searchFilters.nombre} 
          onChange={handleSearchChange} 
        />
        <input 
          className="border p-2 rounded" 
          name="codigo" 
          placeholder="Código (RUT)" 
          value={searchFilters.codigo} 
          onChange={handleSearchChange} 
        />
        <input 
          className="border p-2 rounded" 
          name="fechaInicio" 
          type="date" 
          title="Fecha de Inicio"
          value={searchFilters.fechaInicio} 
          onChange={handleSearchChange} 
        />
        <input 
          className="border p-2 rounded" 
          name="fechaTermino" 
          type="date" 
          title="Fecha de Término"
          value={searchFilters.fechaTermino} 
          onChange={handleSearchChange} 
        />
        <button 
          onClick={handleSearch} 
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Buscar
        </button>
        <button 
          onClick={clearSearch} 
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Limpiar
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Lista de Proyectos ({filteredProyectos.length} resultados)</h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2 text-left">ID</th>
              <th className="border p-2 text-left">Nombre</th>
              <th className="border p-2 text-left">Código</th>
              <th className="border p-2 text-left">Estado</th>
              <th className="border p-2 text-left">Fecha Inicio</th>
              <th className="border p-2 text-left">Fecha Término</th>
            </tr>
          </thead>
          <tbody>
            {filteredProyectos.map(p => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="border p-2 text-sm">{p._id}</td>
                <td className="border p-2">{p.nombre}</td>
                <td className="border p-2">{p.codigo}</td>
                <td className="border p-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    p.estado === 'Finalizado' ? 'bg-green-100 text-green-800' :
                    p.estado === 'En ejecución' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {p.estado}
                  </span>
                </td>
                <td className="border p-2">{p.fechaInicio?.slice(0, 10)}</td>
                <td className="border p-2">{p.fechaTermino?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para crear proyecto */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Crear Nuevo Proyecto</h2>
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
                  <label className="block text-sm font-medium mb-1">Nombre del Proyecto *</label>
                  <input 
                    className="border p-2 w-full rounded" 
                    name="nombre" 
                    placeholder="Nombre del proyecto" 
                    value={form.nombre} 
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Código del Proyecto *</label>
                  <input 
                    className="border p-2 w-full rounded" 
                    name="codigo" 
                    placeholder="Código único" 
                    value={form.codigo} 
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha de Inicio *</label>
                  <input 
                    className="border p-2 w-full rounded" 
                    name="fechaInicio" 
                    type="date" 
                    value={form.fechaInicio} 
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha de Término *</label>
                  <input 
                    className="border p-2 w-full rounded" 
                    name="fechaTermino" 
                    type="date" 
                    value={form.fechaTermino} 
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Coordinador Encargado *</label>
                  <input 
                    className="border p-2 w-full rounded" 
                    name="subjefe" 
                    placeholder="ID del coordinador encargado" 
                    value={form.subjefe} 
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ubicación</label>
                  <input 
                    className="border p-2 w-full rounded" 
                    name="ubicacion" 
                    placeholder="Ubicación del proyecto" 
                    value={form.ubicacion} 
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea 
                  className="border p-2 w-full rounded" 
                  name="descripcion" 
                  placeholder="Descripción del proyecto" 
                  value={form.descripcion} 
                  onChange={handleChange}
                  rows="3"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Crear Proyecto
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
    </div>
  );
}
