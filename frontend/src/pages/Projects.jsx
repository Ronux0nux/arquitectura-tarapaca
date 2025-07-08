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
  const [form, setForm] = useState({
    nombre: '',
    codigo: '',
    fechaInicio: '',
    fechaTermino: '',
    subjefe: '', // pondrás un ID válido manual por ahora
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
      <h2 className="text-2xl font-bold mb-4">Crear Proyecto</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input className="border p-2 w-full rounded" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
        <input className="border p-2 w-full rounded" name="codigo" placeholder="Código" value={form.codigo} onChange={handleChange} />
        <input className="border p-2 w-full rounded" name="fechaInicio" type="date" value={form.fechaInicio} onChange={handleChange} />
        <input className="border p-2 w-full rounded" name="fechaTermino" type="date" value={form.fechaTermino} onChange={handleChange} />
        <input className="border p-2 w-full rounded" name="subjefe" placeholder="ID del subjefe" value={form.subjefe} onChange={handleChange} />
        <input className="border p-2 w-full rounded" name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} />
        <input className="border p-2 w-full rounded" name="ubicacion" placeholder="Ubicación" value={form.ubicacion} onChange={handleChange} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Guardar</button>
      </form>

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
    </div>
  );
}
