import { Link, useLocation } from "react-router-dom";
import { useCart } from '../context/CartContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { getCartCount, toggleCart } = useCart();
  const count = getCartCount();
  const location = useLocation();

  // Función para determinar si una ruta está activa
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Componente para enlaces con indicador de página activa
  const NavLink = ({ to, children, className = "", icon = "" }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={`
          relative px-3 py-2 rounded-md transition-all duration-200 
          hover:bg-blue-700 flex items-center gap-2
          ${active ? 'bg-blue-800 font-semibold border-b-2 border-white' : ''}
          ${className}
        `}
      >
        {icon && <span>{icon}</span>}
        {children}
        {active && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"></div>
        )}
      </Link>
    );
  };

  // Componente para separadores
  const Separator = () => (
    <div className="h-6 w-px bg-blue-400 mx-2"></div>
  );

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Home */}
        <NavLink to="/" icon="🏠" className="font-bold">
          Home
        </NavLink>

        <Separator />

        {/* 🧑‍💼 Administración */}
        <div className="flex items-center gap-2">
          <span className="text-blue-200 text-sm font-medium">👥 Admin</span>
          <NavLink to="/users" icon="👨‍💼">
            Usuarios
          </NavLink>
          <NavLink to="/providers" icon="🏢">
            Proveedores
          </NavLink>
        </div>

        <Separator />

        {/* 📊 Gestión de proyectos */}
        <div className="flex items-center gap-2">
          <span className="text-blue-200 text-sm font-medium">📊 Proyectos</span>
          <NavLink to="/projects" icon="🏗️">
            Proyectos
          </NavLink>
          <NavLink to="/insumos" icon="📦">
            Insumos
          </NavLink>
          <NavLink to="/cotizaciones" icon="💰">
            Cotizaciones
          </NavLink>
          <NavLink to="/actas" icon="📄">
            Actas
          </NavLink>
        </div>

        <Separator />

        {/* 🔎 Herramientas */}
        <div className="flex items-center gap-2">
          <span className="text-blue-200 text-sm font-medium">🔧 Tools</span>
          <NavLink to="/buscador" icon="🔍">
            Buscador
          </NavLink>
          <NavLink 
            to="/configuracion" 
            icon="⚙️"
            className="bg-gray-600 hover:bg-gray-700"
          >
            Config
          </NavLink>
        </div>

        <Separator />

        {/* 🛒 Compras */}
        <div className="flex items-center gap-2">
          <span className="text-blue-200 text-sm font-medium">🛒 Compras</span>
          <NavLink 
            to="/Demo de cotizaciones" 
            icon="🛍️"
            className="bg-green-600 hover:bg-green-700"
          >
            Demo Carrito
          </NavLink>
        </div>

        {/* Elementos del lado derecho */}
        <div className="ml-auto flex items-center gap-3">
          {/* Campana de notificaciones */}
          <NotificationBell />
          
          {/* Botón del carrito */}
          <button
            onClick={toggleCart}
            className="bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded-md transition-colors flex items-center gap-2 relative"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
            </svg>
            <span className="hidden sm:inline">Carrito</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
