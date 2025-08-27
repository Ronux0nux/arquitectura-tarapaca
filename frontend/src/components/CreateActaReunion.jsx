import React, { useState } from 'react';

export default function CreateActaReunion({ onCreate }) {
  const [form, setForm] = useState({
    titulo: '',
    info_breve: '',
    proposito: '',
    descripcion: '',
    asistentes: [''],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAsistenteChange = (idx, value) => {
    const newAsistentes = [...form.asistentes];
    newAsistentes[idx] = value;
    setForm((prev) => ({ ...prev, asistentes: newAsistentes }));
  };

  const addAsistente = () => {
    setForm((prev) => ({ ...prev, asistentes: [...prev.asistentes, ''] }));
  };

  const removeAsistente = (idx) => {
    setForm((prev) => ({ ...prev, asistentes: prev.asistentes.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onCreate) onCreate(form);
  };

  return (
    <form className="bg-white rounded-lg shadow-md p-6" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Nueva Acta de Reunión</h2>
      <div className="mb-4">
        <label className="block font-medium mb-1">Título</label>
        <input name="titulo" value={form.titulo} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Información breve</label>
        <input name="info_breve" value={form.info_breve} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Propósito</label>
        <input name="proposito" value={form.proposito} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Descripción de las cosas realizadas</label>
        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} required />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Asistentes</label>
        {form.asistentes.map((asistente, idx) => (
          <div key={idx} className="flex items-center mb-2">
            <input
              value={asistente}
              onChange={(e) => handleAsistenteChange(idx, e.target.value)}
              className="flex-1 border rounded px-3 py-2"
              placeholder={`Nombre del asistente #${idx + 1}`}
              required
            />
            <button type="button" onClick={() => removeAsistente(idx)} className="ml-2 text-red-500">✕</button>
          </div>
        ))}
        <button type="button" onClick={addAsistente} className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded">Agregar asistente</button>
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold">Crear Acta</button>
    </form>
  );
}
