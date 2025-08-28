
import React, { useState, useEffect } from 'react';
import CSVProviders from '../components/CSVProviders';

export default function Providers() {
  // Formulario de creación
  const [form, setForm] = useState({ nombre: '', rut: '', direccion: '', telefono: '', email: '', sitioWeb: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Pop-up vinculación
  const [showPopup, setShowPopup] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [providersList, setProvidersList] = useState([]);
  const [linkSuccess, setLinkSuccess] = useState(null);
  const [linkError, setLinkError] = useState(null);

  useEffect(() => {
    if (showPopup) {
      fetch('/api/projects')
        .then(res => res.json())
        .then(data => setProjects(data));
      fetch('/api/providers')
        .then(res => res.json())
        .then(data => setProvidersList(data));
    }
  }, [showPopup]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Error al crear proveedor');
      setSuccess('Proveedor creado exitosamente');
      setForm({ nombre: '', rut: '', direccion: '', telefono: '', email: '', sitioWeb: '' });
      setRefreshKey(k => k + 1); // fuerza refresco del listado
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkProvider = async (e) => {
    e.preventDefault();
    setLinkSuccess(null);
    setLinkError(null);
    try {
      const res = await fetch(`/api/projects/${selectedProject}/providers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: selectedProvider })
      });
      if (!res.ok) throw new Error('Error al vincular proveedor');
      setLinkSuccess('Proveedor vinculado exitosamente');
      setShowPopup(false);
    } catch (err) {
      setLinkError(err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🏢 Gestión de Proveedores</h1>

      {/* Formulario para agregar proveedor */}
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow flex flex-wrap gap-4 items-end">
  <input name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Nombre (texto)" className="border p-2 rounded w-40" maxLength={100} />
        <input name="rut" value={form.rut} onChange={e => {
          // Solo permitir números, guion y puntos
          const value = e.target.value.replace(/[^0-9\-\.]/g, '');
          handleChange({ target: { name: 'rut', value } });
        }} placeholder="RUT (ej: 12.345.678-9)" className="border p-2 rounded w-32" maxLength={15} />
  <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección (texto)" className="border p-2 rounded w-48" maxLength={255} />
        <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" className="border p-2 rounded w-32" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-2 rounded w-40" />
  <input name="sitioWeb" value={form.sitioWeb} onChange={handleChange} placeholder="Sitio Web (opcional)" className="border p-2 rounded w-40" />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{loading ? 'Agregando...' : 'Agregar Proveedor'}</button>
        {error && <span className="text-red-600 ml-4">{error}</span>}
        {success && <span className="text-green-600 ml-4">{success}</span>}
      </form>

      {/* Botón para abrir pop-up de vinculación */}
      <button onClick={() => setShowPopup(true)} className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Vincular proveedor a proyecto</button>

      {/* Pop-up de vinculación */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Vincular proveedor a proyecto</h2>
            <form onSubmit={handleLinkProvider} className="flex flex-col gap-4">
              <label>
                Proyecto:
                <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} required className="border p-2 rounded w-full">
                  <option value="">Selecciona un proyecto</option>
                  {projects.map(p => (
                    <option key={p.id || p._id} value={p.id || p._id}>{p.nombre}</option>
                  ))}
                </select>
              </label>
              <label>
                Proveedor:
                <select value={selectedProvider} onChange={e => setSelectedProvider(e.target.value)} required className="border p-2 rounded w-full">
                  <option value="">Selecciona un proveedor</option>
                  {providersList.map(pr => (
                    <option key={pr.id} value={pr.id}>{pr.nombre}</option>
                  ))}
                </select>
              </label>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowPopup(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Vincular</button>
              </div>
              {linkError && <span className="text-red-600">{linkError}</span>}
              {linkSuccess && <span className="text-green-600">{linkSuccess}</span>}
            </form>
          </div>
        </div>
      )}

      {/* Listado de proveedores */}
      <CSVProviders key={refreshKey} />
    </div>
  );
}
