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
            <ProtectedRoute>
              <NavbarResponsive />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route 
                  path="/users" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Users />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/projects" 
                  element={
                    <ProtectedRoute requiredPermission="proyectos">
                      <Projects />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/projects/:id/materiales" 
                  element={
                    <ProtectedRoute requiredPermission="proyectos">
                      <ProjectMaterials />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/providers" 
                  element={
                    <ProtectedRoute requiredPermission="proveedores">
                      <Providers />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/insumos" 
                  element={
                    <ProtectedRoute requiredPermission="materiales">
                      <Insumos />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/cotizaciones" 
                  element={
                    <ProtectedRoute requiredPermission="cotizaciones">
                      <Router>
                        <Routes>
                          {/* Página pública sin Navbar ni ProtectedRoute */}
                          <Route path="/corporacion-tarapaka" element={<CorporacionTarapaka />} />
                          {/* Resto de rutas protegidas y privadas */}
                          <Route path="/" element={<Home />} />
                          <Route 
                            path="/users" 
                            element={
                              <ProtectedRoute requiredRole="admin">
                                <Users />
                              </ProtectedRoute>
                            }
                          />
                          <Route 
                            path="/projects" 
                            element={
                              <ProtectedRoute requiredPermission="proyectos">
                                <Projects />
                              </ProtectedRoute>
                            }
                          />
                          <Route 
                            path="/projects/:id/materiales" 
                            element={<ProjectMaterials />} 
                          />
                          <Route path="/providers" element={<Providers />} />
                          <Route path="/insumos" element={<Insumos />} />
                          <Route path="/cotizaciones" element={<Cotizaciones />} />
                          <Route path="/actas-reunion" element={<ActasReunion />} />
                          <Route path="/buscador" element={<BuscadorPage />} />
                          <Route path="/historial-cotizaciones" element={<HistorialCotizaciones />} />
                          <Route path="/configuracion" element={<ConfiguracionPage />} />
                          <Route path="/excel-online" element={<ExcelOnline />} />
                          <Route path="/presupuestos" element={<Presupuestos />} />
                          <Route path="/cotizacion-cart-v2" element={<CotizacionCartV2 />} />
                          <Route path="/cart-button" element={<CartButton />} />
                        </Routes>
                      </Router>
                  element={
                    <ProtectedRoute requiredPermission="proyectos">
                      <Presupuestos />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/excel" 
                  element={
                    <ProtectedRoute>
                      <ExcelOnline />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
              <CotizacionCartV2 />
              <CartButton />
            </ProtectedRoute>
          </Router>
        </CotizacionesProvider>
      </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
