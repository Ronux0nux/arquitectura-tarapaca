
import React, { useState, useEffect } from 'react';
import CSVProviders from '../components/CSVProviders';

export default function Providers() {
  // Estado para búsqueda de proveedores
  const [search, setSearch] = useState('');
  // Estado para edición de proveedor
  const [editProvider, setEditProvider] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: '', rut: '', direccion: '', telefono: '', email: '', sitioWeb: '', rubros: '' });
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  // Formulario de creación
  const [form, setForm] = useState({ nombre: '', rut: '', direccion: '', telefono: '', email: '', sitioweb: '' });
  const [rutError, setRutError] = useState(null);
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
    // Refrescar lista si se cierra modal de edición
    if (!editProvider) {
      fetch('/api/providers')
        .then(res => res.json())
        .then(data => setProvidersList(data));
    }
  }, [showPopup]);
  // Abrir modal de edición y cargar datos
  const handleEditClick = (provider) => {
    setEditProvider(provider);
    setEditForm({
      nombre: provider.nombre || '',
      rut: provider.rut || '',
      direccion: provider.direccion || '',
      telefono: provider.telefono || '',
      email: provider.email || '',
      sitioweb: provider.sitioweb || '',
      rubros: Array.isArray(provider.rubros) ? provider.rubros.join(', ') : (provider.rubros || '')
    });
    setEditError(null);
    setEditSuccess(null);
  };

  // Cambios en el formulario de edición
  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Guardar cambios del proveedor
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(null);
    setEditLoading(true);
    // Validar RUT
    const rutRegex = /^\d{1,2}\.?(\d{3})\.?(\d{3})\-([\dkK])$/;
    if (!rutRegex.test(editForm.rut)) {
      setEditError('Formato de RUT inválido. Ejemplo: 12.345.678-9 o 12.345.678-k');
      setEditLoading(false);
      return;
    }
    // rubros como array
    const rubrosArray = editForm.rubros ? editForm.rubros.split(',').map(r => r.trim()) : [];
    try {
      const res = await fetch(`/api/providers/${editProvider.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, rubros: rubrosArray })
      });
      if (!res.ok) {
        let errorMsg = 'Error al editar proveedor';
        try {
          const data = await res.json();
          if (data && data.error) errorMsg = data.error;
        } catch {}
        throw new Error(errorMsg);
      }
      setEditSuccess('Proveedor actualizado exitosamente');
      // Espera breve para mostrar mensaje y luego cerrar modal
      setTimeout(() => {
        setEditProvider(null);
        setEditSuccess(null);
        setRefreshKey(k => k + 1);
      }, 1000);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'rut') {
      const value = e.target.value.replace(/[^0-9kK\-]/g, '');
      setForm({ ...form, rut: value });
      // Validación de formato: números, guion y k/K al final
      const rutRegex = /^\d{1,2}\.?(\d{3})\.?(\d{3})\-([\dkK])$/;
      if (value && !rutRegex.test(value)) {
        setRutError('Formato de RUT inválido. Ejemplo: 12.345.678-9 o 12.345.678-k');
      } else {
        setRutError(null);
      }
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    // Validar RUT antes de enviar
    const rutRegex = /^\d{1,2}\.?(\d{3})\.?(\d{3})\-([\dkK])$/;
    if (!rutRegex.test(form.rut)) {
      setRutError('Formato de RUT inválido. Ejemplo: 12.345.678-9 o 12.345.678-k');
      return;
    }
    setRutError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        let errorMsg = 'Error al crear proveedor';
        try {
          const data = await res.json();
          if (data && data.error) errorMsg = data.error;
        } catch {}
        throw new Error(errorMsg);
      }
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
  <input name="rut" value={form.rut} onChange={handleChange} required placeholder="RUT (ej: 12.345.678-9 o 12.345.678-k)" className="border p-2 rounded w-32" maxLength={15} />
  {rutError && <span className="text-red-600 ml-4">{rutError}</span>}
  <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección (texto)" className="border p-2 rounded w-48" maxLength={255} />
  <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" className="border p-2 rounded w-32" />
  <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-2 rounded w-40" />
  <input name="sitioweb" value={form.sitioweb} onChange={handleChange} placeholder="Sitio Web (opcional)" className="border p-2 rounded w-40" />
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
      {/* Listado de proveedores con botón editar */}
      {/* Campo de búsqueda */}
      <div className="mb-6 flex justify-center">
        <div className="relative w-full max-w-xl">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Buscar proveedor..."
            className="pl-10 pr-4 py-2 w-full rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none shadow-sm text-lg transition-all"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl pointer-events-none">🔍</span>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Listado de Proveedores</h2>
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Nombre</th>
              <th className="border px-2 py-1">RUT</th>
              <th className="border px-2 py-1">Dirección</th>
              <th className="border px-2 py-1">Teléfono</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Sitio Web</th>
              <th className="border px-2 py-1">Rubros</th>
              <th className="border px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {providersList
              .filter(pr => {
                const term = search.toLowerCase();
                return (
                  pr.nombre?.toLowerCase().includes(term) ||
                  pr.rut?.toLowerCase().includes(term) ||
                  pr.direccion?.toLowerCase().includes(term) ||
                  pr.email?.toLowerCase().includes(term) ||
                  pr.telefono?.toLowerCase().includes(term) ||
                  pr.sitioweb?.toLowerCase().includes(term) ||
                  (Array.isArray(pr.rubros) ? pr.rubros.join(', ').toLowerCase().includes(term) : (pr.rubros?.toLowerCase().includes(term)))
                );
              })
              .map(pr => (
                <tr key={pr.id}>
                  <td className="border px-2 py-1">{pr.nombre}</td>
                  <td className="border px-2 py-1">{pr.rut}</td>
                  <td className="border px-2 py-1">{pr.direccion}</td>
                  <td className="border px-2 py-1">{pr.telefono}</td>
                  <td className="border px-2 py-1">{pr.email}</td>
                  <td className="border px-2 py-1">{pr.sitioweb}</td>
                  <td className="border px-2 py-1">{Array.isArray(pr.rubros) ? pr.rubros.join(', ') : pr.rubros}</td>
                  <td className="border px-2 py-1">
                    <button className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600" onClick={() => handleEditClick(pr)}>Editar</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal de edición de proveedor */}
      {editProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={() => setEditProvider(null)}>&times;</button>
            <h2 className="text-2xl font-bold mb-4">Editar Proveedor</h2>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
              <input name="nombre" value={editForm.nombre} onChange={handleEditFormChange} required placeholder="Nombre" className="border p-2 rounded" maxLength={100} />
              <input name="rut" value={editForm.rut} onChange={handleEditFormChange} required placeholder="RUT (ej: 12.345.678-9 o 12.345.678-k)" className="border p-2 rounded" maxLength={15} />
              <input name="direccion" value={editForm.direccion} onChange={handleEditFormChange} placeholder="Dirección" className="border p-2 rounded" maxLength={255} />
              <input name="telefono" value={editForm.telefono} onChange={handleEditFormChange} placeholder="Teléfono" className="border p-2 rounded" />
              <input name="email" value={editForm.email} onChange={handleEditFormChange} placeholder="Email" className="border p-2 rounded" />
              <input name="sitioweb" value={editForm.sitioweb} onChange={handleEditFormChange} placeholder="Sitio Web (opcional)" className="border p-2 rounded" />
              <input name="rubros" value={editForm.rubros} onChange={handleEditFormChange} placeholder="Rubros (separados por coma)" className="border p-2 rounded" />
              <button type="submit" disabled={editLoading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{editLoading ? 'Guardando...' : 'Guardar cambios'}</button>
              {editError && <span className="text-red-600">{editError}</span>}
              {editSuccess && <span className="text-green-600">{editSuccess}</span>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
