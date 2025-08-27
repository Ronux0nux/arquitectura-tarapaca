import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function NavbarResponsive() {
  const { getCartCount, toggleCart } = useCart();
  const { user, logout, canAccess } = useAuth();
  const count = getCartCount();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Función para determinar si una ruta está activa
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Componente para enlaces con indicador de página activa
  const NavLink = ({ to, children, className = "", onClick }) => {
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
  const DropdownGroup = ({ title, children, groupKey }) => {
    const isOpen = activeDropdown === groupKey;
    return (
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(isOpen ? null : groupKey)}
          className="flex items-center gap-2 px-3 py-2 hover:bg-blue-700 rounded-md w-full text-left"
        >
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

  // Cerrar menús cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
  <nav className="bg-[#03045e] text-white shadow-xl border-b-4 border-[#0077b6]">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Icono Tara a la izquierda, clickeable para ir a Home */}
          <NavLink to="/" className="flex items-center">
            <div className="flex items-center bg-[#023e8a] hover:bg-[#0077b6] transition-colors rounded-xl px-3 py-2 shadow-md border border-[#0077b6]">
              <img src="/logo192.png" alt="Logo Tara" className="w-10 h-10 mr-2 drop-shadow-lg" />
              <span className="text-white font-extrabold text-xl tracking-wide drop-shadow">Tarapaka</span>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
            
            {/* Administración */}
            {(canAccess('all') || canAccess('proveedores') || user?.role === 'admin') && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-blue-200 text-sm font-medium">Admin</span>
                  {user?.role === 'admin' && <NavLink to="/users">Usuarios</NavLink>}
                  {canAccess('proveedores') && <NavLink to="/providers">Proveedores</NavLink>}
                </div>
                <Separator />
              </>
            )}

            {/* Gestión de construcción */}
            {canAccess('proyectos') && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-blue-200 text-sm font-medium">Administración</span>
                  <NavLink to="/projects">Proyectos</NavLink>
                </div>
                <Separator />
              </>
            )}

            {/* Herramientas */}
            <div className="flex items-center gap-2">
              <span className="text-blue-200 text-sm font-medium"> 🛠️Construcción</span>
              <NavLink to="/buscador">Buscador de Materiales</NavLink>
              <NavLink to="/presupuestos">Presupuestos</NavLink>
              <NavLink to="/excel-online">📊Excel Online</NavLink>
            </div>

            <Separator />

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

            {/* User Menu */}
            <div className="relative user-menu">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-lg">{user?.avatar || '👤'}</span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-blue-200 capitalize">{user?.role}</p>
                </div>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    🚪 Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

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
              {(canAccess('all') || canAccess('proveedores') || user?.role === 'admin') && (
                <DropdownGroup title="Administración" groupKey="admin">
                  {user?.role === 'admin' && <NavLink to="/users" onClick={closeMenu}>Usuarios</NavLink>}
                  {canAccess('proveedores') && <NavLink to="/providers" onClick={closeMenu}>Proveedores</NavLink>}
                </DropdownGroup>
              )}

              {/* Gestión de construcción */}
              {canAccess('proyectos') && (
                <DropdownGroup title="Administración" groupKey="proyectos">
                  <NavLink to="/projects" onClick={closeMenu}>Proyectos</NavLink>
                </DropdownGroup>
              )}

              {/* Herramientas */}
              <DropdownGroup title=" 🔧Herramientas" groupKey="tools">
                <NavLink to="/buscador" onClick={closeMenu}>Buscador de Materiales</NavLink>
                <NavLink to="/presupuestos" onClick={closeMenu}>Gestión de Materiales</NavLink>
                <NavLink to="/excel-online" onClick={closeMenu}>Cotización de Materiales</NavLink>
              </DropdownGroup>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
