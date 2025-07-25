import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useCart } from '../context/CartContext';
import NotificationBell from './NotificationBell';

export default function NavbarResponsive() {
  const { getCartCount, toggleCart } = useCart();
  const count = getCartCount();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Función para determinar si una ruta está activa
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Componente para enlaces con indicador de página activa
  const NavLink = ({ to, children, className = "", icon = "", onClick }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`
          relative px-3 py-2 rounded-md transition-all duration-200 
          hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap
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
    <div className="h-6 w-px bg-blue-400 mx-2 hidden lg:block"></div>
  );

  // Componente para dropdown en móvil
  const DropdownGroup = ({ title, icon, children, groupKey }) => {
    const isOpen = activeDropdown === groupKey;
    return (
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(isOpen ? null : groupKey)}
          className="flex items-center gap-2 px-3 py-2 hover:bg-blue-700 rounded-md w-full text-left"
        >
          <span>{icon}</span>
          <span className="text-sm font-medium">{title}</span>
          <svg
            className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="ml-4 mt-1 space-y-1 border-l-2 border-blue-400 pl-2">
            {children}
          </div>
        )}
      </div>
    );
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Home */}
          <NavLink to="/" icon="🏠" className="font-bold text-lg">
            Home
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
            {/* 🧑‍💼 Administración */}
            <div className="flex items-center gap-2">
              <span className="text-blue-200 text-sm font-medium">👥</span>
              <NavLink to="/users" icon="👨‍💼">Usuarios</NavLink>
              <NavLink to="/providers" icon="🏢">Proveedores</NavLink>
            </div>

            <Separator />

            {/* 📊 Gestión de proyectos */}
            <div className="flex items-center gap-2">
              <span className="text-blue-200 text-sm font-medium">📊</span>
              <NavLink to="/projects" icon="🏗️">Proyectos</NavLink>
              <NavLink to="/insumos" icon="📦">Insumos</NavLink>
              <NavLink to="/cotizaciones" icon="💰">Cotizaciones</NavLink>
              <NavLink to="/actas" icon="📄">Actas</NavLink>
            </div>

            <Separator />

            {/* 🔎 Herramientas */}
            <div className="flex items-center gap-2">
              <span className="text-blue-200 text-sm font-medium">🔧</span>
              <NavLink to="/buscador" icon="🔍">Buscador</NavLink>
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
              <span className="text-blue-200 text-sm font-medium">🛒</span>
              <NavLink 
                to="/Demo de cotizaciones" 
                icon="🛍️"
                className="bg-green-600 hover:bg-green-700"
              >
                Demo
              </NavLink>
            </div>
          </div>

          {/* Right side elements */}
          <div className="flex items-center gap-3">
            {/* Notificaciones */}
            <NotificationBell />
            
            {/* Carrito */}
            <button
              onClick={toggleCart}
              className="bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded-md transition-colors flex items-center gap-2 relative"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
              </svg>
              <span className="hidden sm:inline">Carrito</span>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-blue-700 rounded-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 border-t border-blue-500 pt-4">
            <div className="space-y-2">
              {/* Administración */}
              <DropdownGroup title="Administración" icon="👥" groupKey="admin">
                <NavLink to="/users" icon="👨‍💼" onClick={closeMenu}>Usuarios</NavLink>
                <NavLink to="/providers" icon="🏢" onClick={closeMenu}>Proveedores</NavLink>
              </DropdownGroup>

              {/* Gestión de proyectos */}
              <DropdownGroup title="Proyectos" icon="📊" groupKey="projects">
                <NavLink to="/projects" icon="🏗️" onClick={closeMenu}>Proyectos</NavLink>
                <NavLink to="/insumos" icon="📦" onClick={closeMenu}>Insumos</NavLink>
                <NavLink to="/cotizaciones" icon="💰" onClick={closeMenu}>Cotizaciones</NavLink>
                <NavLink to="/actas" icon="📄" onClick={closeMenu}>Actas</NavLink>
              </DropdownGroup>

              {/* Herramientas */}
              <DropdownGroup title="Herramientas" icon="🔧" groupKey="tools">
                <NavLink to="/buscador" icon="🔍" onClick={closeMenu}>Buscador</NavLink>
                <NavLink 
                  to="/configuracion" 
                  icon="⚙️" 
                  className="bg-gray-600 hover:bg-gray-700"
                  onClick={closeMenu}
                >
                  Config
                </NavLink>
              </DropdownGroup>

              {/* Compras */}
              <DropdownGroup title="Compras" icon="🛒" groupKey="shopping">
                <NavLink 
                  to="/Demo de cotizaciones" 
                  icon="🛍️"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={closeMenu}
                >
                  Demo Carrito
                </NavLink>
              </DropdownGroup>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
