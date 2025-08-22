import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from './context/CartContext';
import { CotizacionesProvider } from './context/CotizacionesContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import NavbarResponsive from "./components/NavbarResponsive";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Projects from "./pages/Projects";
import ProjectMaterials from "./pages/ProjectMaterials";
import Providers from "./pages/Providers";
import Insumos from "./pages/Insumos";
import Cotizaciones from "./pages/Cotizaciones";
import ActasReunion from './pages/ActasReunion';
import BuscadorPage from './pages/BuscadorPage';
import HistorialCotizaciones from './pages/HistorialCotizaciones';
import ConfiguracionPage from './pages/ConfiguracionPage';
import ExcelOnline from './pages/ExcelOnline';
import Presupuestos from './pages/Presupuestos';
import CotizacionCartV2 from './components/CotizacionCartV2';
import CartButton from './components/CartButton';
import CorporacionTarapaka from './pages/CorporacionTarapaka';

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <CotizacionesProvider>
            <Router>
              <Routes>
                {/* Página pública sin Navbar ni ProtectedRoute */}
                <Route path="/corporacion-tarapaka" element={<CorporacionTarapaka />} />
                {/* Rutas privadas */}
                <Route path="/" element={<ProtectedRoute><NavbarResponsive /><Home /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute requiredRole="admin"><NavbarResponsive /><Users /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute requiredPermission="proyectos"><NavbarResponsive /><Projects /></ProtectedRoute>} />
                <Route path="/projects/:id/materiales" element={<ProtectedRoute requiredPermission="proyectos"><NavbarResponsive /><ProjectMaterials /></ProtectedRoute>} />
                <Route path="/providers" element={<ProtectedRoute requiredPermission="proveedores"><NavbarResponsive /><Providers /></ProtectedRoute>} />
                <Route path="/insumos" element={<ProtectedRoute requiredPermission="materiales"><NavbarResponsive /><Insumos /></ProtectedRoute>} />
                <Route path="/cotizaciones" element={<ProtectedRoute requiredPermission="cotizaciones"><NavbarResponsive /><Cotizaciones /></ProtectedRoute>} />
                <Route path="/actas-reunion" element={<ProtectedRoute><NavbarResponsive /><ActasReunion /></ProtectedRoute>} />
                <Route path="/buscador" element={<ProtectedRoute><NavbarResponsive /><BuscadorPage /></ProtectedRoute>} />
                <Route path="/historial-cotizaciones" element={<ProtectedRoute><NavbarResponsive /><HistorialCotizaciones /></ProtectedRoute>} />
                <Route path="/configuracion" element={<ProtectedRoute><NavbarResponsive /><ConfiguracionPage /></ProtectedRoute>} />
                <Route path="/excel-online" element={<ProtectedRoute><NavbarResponsive /><ExcelOnline /></ProtectedRoute>} />
                <Route path="/presupuestos" element={<ProtectedRoute requiredPermission="proyectos"><NavbarResponsive /><Presupuestos /></ProtectedRoute>} />
                <Route path="/cotizacion-cart-v2" element={<ProtectedRoute><NavbarResponsive /><CotizacionCartV2 /></ProtectedRoute>} />
                <Route path="/cart-button" element={<ProtectedRoute><NavbarResponsive /><CartButton /></ProtectedRoute>} />
              </Routes>
            </Router>
          </CotizacionesProvider>
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
