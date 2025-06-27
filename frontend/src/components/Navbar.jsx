import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 text-white flex gap-4">
      <Link to="/" className="font-bold">🏠 Home</Link>
      <Link to="/users">Usuarios</Link>
      <Link to="/projects">Proyectos</Link>
      <Link to="/providers">Proveedores</Link>
      <Link to="/insumos">Insumos</Link>
      <Link to="/cotizaciones">Cotizaciones</Link>
    </nav>
  );
}
