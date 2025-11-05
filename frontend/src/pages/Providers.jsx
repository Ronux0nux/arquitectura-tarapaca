
import React, { useState, useEffect } from 'react';

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
  const [form, setForm] = useState({ nombre: '', rut: '', direccion: '', telefono: '', email: '', sitioweb: '', rubros: '' });
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(null);
  const [linkError, setLinkError] = useState(null);

  // Cargar proyectos y proveedores cuando sea necesario
  useEffect(() => {
    if (showPopup) {
      fetch('/api/projects')
        .then(res => res.json())
        .then(data => setProjects(data));
    }
  }, [showPopup]);

  // Cargar proveedores al montar y cuando refreshKey cambie
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const res = await fetch('/api/providers');
        if (!res.ok) throw new Error('Error cargando proveedores');
        const data = await res.json();
        setProvidersList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al cargar providers:', err);
        setProvidersList([]);
      }
    };
    loadProviders();
  }, [refreshKey]);
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
  const rutRegex = /^\d{1,2}\.?(\d{3})\.?(\d{3})-([\dkK])$/;
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
  const value = e.target.value.replace(/[^0-9kK-]/g, '');
      setForm({ ...form, rut: value });
      // Validación de formato: números, guion y k/K al final
  const rutRegex = /^\d{1,2}\.?(\d{3})\.?(\d{3})-([\dkK])$/;
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
  const rutRegex = /^\d{1,2}\.?(\d{3})\.?(\d{3})-([\dkK])$/;
    if (!rutRegex.test(form.rut)) {
      setRutError('Formato de RUT inválido. Ejemplo: 12.345.678-9 o 12.345.678-k');
      return;
    }
    setRutError(null);
    setLoading(true);
    try {
      // Convertir rubros a array
      const rubrosArray = form.rubros ? form.rubros.split(',').map(r => r.trim()) : [];
      const res = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, rubros: rubrosArray })
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
      setForm({ nombre: '', rut: '', direccion: '', telefono: '', email: '', sitioweb: '', rubros: '' });
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

  // Mostrar todo (limpiar búsqueda y recargar)
  const handleShowAll = () => {
    setSearch('');
    setRefreshKey(k => k + 1);
  };

  // Exportar proveedores a CSV (simple)
  const exportProvidersCSV = () => {
    try {
      const rows = [
        ['ID','Nombre','DNI/CIF','Dirección','Teléfono','Email','Sitio Web','Rubros']
      ];
      providersList.forEach(p => {

  const direccion = p.direccion || '';
        rows.push([
          p.id || p._id || '',
          p.nombre || '',
          p.rut || '',
          direccion,
          p.telefono || '',
          p.email || '',
          p.sitioweb || '',
          Array.isArray(p.rubros) ? p.rubros.join(', ') : (p.rubros || '')
        ]);
      });
      const csvContent = rows.map(r => r.map(cell => `"${String(cell || '').replace(/"/g,'""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `proveedores_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exportando CSV:', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🏢 Gestión de Proveedores</h1>

      {/* Barra superior: búsqueda y botones (ordenadas por prioridad) */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input + Buscar button (button next to input) */}
        <div className="flex items-center gap-3 w-full md:w-1/2">
          <div className="flex w-full">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Ingrese su búsqueda"
              className="flex-1 p-3 border rounded-l focus:outline-none"
              aria-label="Buscar proveedores"
            />
            <button
              onClick={() => { /* trigger explicit search (reactive already) */ }}
              className="bg-green-500 text-white px-4 py-2 rounded-r hover:bg-green-600"
              aria-label="Buscar proveedores"
            >Buscar</button>
          </div>
        </div>

        {/* Primary actions: creación y navegación */}
        <div className="flex items-center gap-3">
          {/* Crear proveedor - botón principal */}
          <button onClick={() => setShowCreateModal(true)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium">Nuevo proveedor</button>

          {/* Mostrar todo - recarga lista */}
          <button onClick={handleShowAll} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Mostrar Todo</button>
        </div>

        {/* Secondary actions: exportar y vincular (menos prioridad) */}
        <div className="flex items-center gap-3">
          <button onClick={exportProvidersCSV} title="Exportar CSV" className="bg-teal-400 text-white px-3 py-2 rounded hover:bg-teal-500">📥 Exportar</button>
          <button onClick={() => setShowPopup(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Vincular proveedor</button>
        </div>
      </div>

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
      <div className="mt-2 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2 p-4 border-b">Listado de Proveedores</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="px-4 py-3"> </th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">NOMBRE</th>
                <th className="px-4 py-3">DNI/CIF</th>
                <th className="px-4 py-3">DIRECCIÓN</th>
                <th className="px-4 py-3">TELEFONO</th>
                <th className="px-4 py-3">EMAIL</th>
                <th className="px-4 py-3">SITIO WEB</th>
                <th className="px-4 py-3">RUBROS</th>
                <th className="px-4 py-3"> </th>
              </tr>
            </thead>
            <tbody>
              {providersList
                .filter(pr => {
                  const term = search.toLowerCase();
                  return (
                    !term ||
                    pr.nombre?.toLowerCase().includes(term) ||
                    pr.rut?.toLowerCase().includes(term) ||
                    pr.direccion?.toLowerCase().includes(term) ||
                    pr.email?.toLowerCase().includes(term) ||
                    pr.telefono?.toLowerCase().includes(term) ||
                    pr.sitioweb?.toLowerCase().includes(term) ||
                    (Array.isArray(pr.rubros) ? pr.rubros.join(', ').toLowerCase().includes(term) : (pr.rubros?.toLowerCase().includes(term)))
                  );
                })
                .map((pr, idx) => {
                  const direccion = pr.direccion || '';
                  return (
                    <tr key={pr.id || pr._id || idx} className={`${idx % 2 === 0 ? 'bg-gray-50' : ''}`}>
                      <td className="px-4 py-4 text-center">👥</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{pr.id || pr._id || ''}</td>
                      <td className="px-4 py-4 font-medium text-blue-700">{pr.nombre}</td>
                      <td className="px-4 py-4">{pr.rut || ''}</td>
                      <td className="px-4 py-4">{direccion}</td>
                      <td className="px-4 py-4">{pr.telefono || ''}</td>
                      <td className="px-4 py-4">{pr.email || ''}</td>
                      <td className="px-4 py-4 break-words">{pr.sitioweb || ''}</td>
                      <td className="px-4 py-4">{Array.isArray(pr.rubros) ? pr.rubros.join(', ') : (pr.rubros || '')}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleEditClick(pr)} className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500">✏️</button>
                          <button onClick={async () => {
                            if (!window.confirm('¿Eliminar proveedor?')) return;
                            try {
                              const res = await fetch(`/api/providers/${pr.id || pr._id}`, { method: 'DELETE' });
                              if (res.ok) { setRefreshKey(k => k + 1); }
                            } catch (e) { console.error(e); }
                          }} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
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
      {/* Modal de creación de proveedor (nuevo) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={() => setShowCreateModal(false)}>&times;</button>
            <h2 className="text-2xl font-bold mb-4">Nuevo Proveedor</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Nombre" className="border p-2 rounded" maxLength={100} />
              <input name="rut" value={form.rut} onChange={handleChange} required placeholder="RUT (ej: 12.345.678-9 o 12.345.678-k)" className="border p-2 rounded" maxLength={15} />
              {rutError && <span className="text-red-600">{rutError}</span>}
              <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección" className="border p-2 rounded" maxLength={255} />
              <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" className="border p-2 rounded" />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-2 rounded" />
              <input name="sitioweb" value={form.sitioweb} onChange={handleChange} placeholder="Sitio Web (opcional)" className="border p-2 rounded" />
              <input name="rubros" value={form.rubros} onChange={handleChange} placeholder="Rubros (separados por coma)" className="border p-2 rounded" />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{loading ? 'Agregando...' : 'Agregar Proveedor'}</button>
              </div>
              {error && <span className="text-red-600">{error}</span>}
              {success && <span className="text-green-600">{success}</span>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
