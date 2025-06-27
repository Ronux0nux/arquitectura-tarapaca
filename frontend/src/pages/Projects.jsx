import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
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
    axios.get('http://localhost:5000/api/proyectos')
      .then(res => setProyectos(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/proyectos', form)
      .then(res => {
        setProyectos([...proyectos, res.data]);
        alert('Proyecto creado');
      })
      .catch(err => alert('Error al crear proyecto: ' + err.response?.data?.detalle));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Crear Proyecto</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input className="border p-2 w-full" name="nombre" placeholder="Nombre" onChange={handleChange} />
        <input className="border p-2 w-full" name="codigo" placeholder="Código" onChange={handleChange} />
        <input className="border p-2 w-full" name="fechaInicio" type="date" onChange={handleChange} />
        <input className="border p-2 w-full" name="fechaTermino" type="date" onChange={handleChange} />
        <input className="border p-2 w-full" name="subjefe" placeholder="ID del subjefe" onChange={handleChange} />
        <input className="border p-2 w-full" name="descripcion" placeholder="Descripción" onChange={handleChange} />
        <input className="border p-2 w-full" name="ubicacion" placeholder="Ubicación" onChange={handleChange} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Lista de Proyectos</h2>
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th>Nombre</th>
            <th>Código</th>
            <th>Estado</th>
            <th>Inicio</th>
            <th>Término</th>
          </tr>
        </thead>
        <tbody>
          {proyectos.map(p => (
            <tr key={p._id} className="text-center border-t">
              <td>{p.nombre}</td>
              <td>{p.codigo}</td>
              <td>{p.estado}</td>
              <td>{p.fechaInicio?.slice(0, 10)}</td>
              <td>{p.fechaTermino?.slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
