import { Link } from "react-router-dom";
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { getCartCount, toggleCart } = useCart();
  const count = getCartCount();

  return (
    <nav className="bg-blue-600 p-4 text-white flex gap-4 items-center">
      <Link to="/" className="font-bold">🏠 Home</Link>
      <Link to="/users">Usuarios</Link>
      <Link to="/projects">Proyectos</Link>
      <Link to="/providers">Proveedores</Link>
      <Link to="/insumos">Insumos</Link>
      <Link to="/cotizaciones">Cotizaciones</Link>
      <Link to="/actas">Actas</Link>
      <Link to="/buscador">Buscador</Link>
      <Link to="/demo-carrito" className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-sm">🛒 Demo Carrito</Link>
      
      <button
        onClick={toggleCart}
        className="ml-auto bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded-md transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
        </svg>
        Carrito
        {count > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
    </nav>
  );
}
