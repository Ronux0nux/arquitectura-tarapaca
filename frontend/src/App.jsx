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
import Chatbot from './components/Chatbot';

import CartButton from './components/CartButton';
import CorporacionTarapaka from './pages/CorporacionTarapaka';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import { useLocation, Navigate } from 'react-router-dom';

export default function App() {
  // ...existing code...

  function RequireAuth({ children }) {
    const { user } = useAuth();
    const location = useLocation();
    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
  }

  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <CotizacionesProvider>
            <Router>
              <CotizacionCartV2 />
              <Chatbot />
              <Routes>
                {/* Login page always accessible */}
                <Route path="/login" element={<Login />} />
                {/* Página pública sin Navbar ni ProtectedRoute */}
                <Route path="/corporacion-tarapaka" element={<CorporacionTarapaka />} />
                {/* Protected routes: require authentication */}
                <Route path="/" element={<RequireAuth><NavbarResponsive /><Home /></RequireAuth>} />
                <Route path="/users" element={<RequireAuth><NavbarResponsive /><Users /></RequireAuth>} />
                <Route path="/projects" element={<RequireAuth><NavbarResponsive /><Projects /></RequireAuth>} />
                <Route path="/projects/:id/materiales" element={<RequireAuth><NavbarResponsive /><ProjectMaterials /></RequireAuth>} />
                <Route path="/providers" element={<RequireAuth><NavbarResponsive /><Providers /></RequireAuth>} />
                <Route path="/insumos" element={<RequireAuth><NavbarResponsive /><Insumos /></RequireAuth>} />
                <Route path="/cotizaciones" element={<RequireAuth><NavbarResponsive /><Cotizaciones /></RequireAuth>} />
                <Route path="/actas-reunion" element={<RequireAuth><NavbarResponsive /><ActasReunion /></RequireAuth>} />
                <Route path="/buscador" element={<RequireAuth><NavbarResponsive /><BuscadorPage /></RequireAuth>} />
                <Route path="/historial-cotizaciones" element={<RequireAuth><NavbarResponsive /><HistorialCotizaciones /></RequireAuth>} />
                <Route path="/configuracion" element={<RequireAuth><NavbarResponsive /><ConfiguracionPage /></RequireAuth>} />
                <Route path="/excel-online" element={<RequireAuth><NavbarResponsive /><ExcelOnline /></RequireAuth>} />
                <Route path="/presupuestos" element={<RequireAuth><NavbarResponsive /><Presupuestos /></RequireAuth>} />
                <Route path="/cart-button" element={<RequireAuth><NavbarResponsive /><CartButton /></RequireAuth>} />
              </Routes>
            </Router>
          </CotizacionesProvider>
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
