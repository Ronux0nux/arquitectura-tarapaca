import { useEffect, useState } from "react";
import axios from "axios";

export default function Insumos() {
  const [insumos, setInsumos] = useState([]);
  const [newInsumo, setNewInsumo] = useState({ nombre: "", unidad: "", precioActual: 0, proveedorId: "" });
  const [file, setFile] = useState(null);

  const API_URL = "http://localhost:5000/api/insumos";
  const UPLOAD_URL = "http://localhost:5000/api/dataset/upload-dataset";

  useEffect(() => {
    fetchInsumos();
  }, []);

  const fetchInsumos = async () => {
    const res = await axios.get("http://localhost:5000/api/insumos");
    setInsumos(res.data);
  };

  const createInsumo = async () => {
    await axios.post(API_URL, newInsumo);
    setNewInsumo({ nombre: "", unidad: "", precioActual: 0, proveedorId: "" });
    fetchInsumos();
  };

  const deleteInsumo = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchInsumos();
  };

  const handleFileUpload = async () => {
    if (!file) return alert("Selecciona un archivo CSV primero");
    const formData = new FormData();
    formData.append("file", file);
    await axios.post(UPLOAD_URL, formData);
    fetchInsumos();
    alert("Dataset subido y procesado");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Insumos</h1>

      {/* Formulario para crear insumo */}
      <div className="mb-4 space-y-2">
        <input
          className="border p-2"
          placeholder="Nombre"
          value={newInsumo.nombre}
          onChange={(e) => setNewInsumo({ ...newInsumo, nombre: e.target.value })}
        />
        <input
          className="border p-2"
          placeholder="Unidad"
          value={newInsumo.unidad}
          onChange={(e) => setNewInsumo({ ...newInsumo, unidad: e.target.value })}
        />
        <input
          type="number"
          className="border p-2"
          placeholder="Precio Actual"
          value={newInsumo.precioActual}
          onChange={(e) => setNewInsumo({ ...newInsumo, precioActual: e.target.value })}
        />
        <button className="bg-blue-500 text-white px-4 py-2" onClick={createInsumo}>
          Crear Insumo
        </button>
      </div>

      {/* Botón para subir CSV */}
      <div className="mb-4">
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
        <button className="bg-green-600 text-white px-4 py-2 ml-2" onClick={handleFileUpload}>
          Subir Dataset CSV
        </button>
      </div>

      {/* Tabla de insumos */}
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Unidad</th>
            <th className="border p-2">Precio Actual</th>
            <th className="border p-2">Precio Referencia Público</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {insumos.map((i) => (
            <tr key={i._id}>
              <td className="border p-2">{i.nombre}</td>
              <td className="border p-2">{i.unidad}</td>
              <td className="border p-2">${i.precioActual}</td>
              <td className="border p-2 text-blue-600">
                {i.precioReferencia ? `$${i.precioReferencia}` : "No disponible"}
              </td>
              <td className="border p-2">
                <button
                  className="bg-red-500 text-white px-2 py-1"
                  onClick={() => deleteInsumo(i._id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
