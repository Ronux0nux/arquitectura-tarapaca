import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from './context/CartContext';
import { CotizacionesProvider } from './context/CotizacionesContext';
import { NotificationProvider } from './context/NotificationContext';
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
import DemoCarrito from './pages/DemoCarrito';
import HistorialCotizaciones from './pages/HistorialCotizaciones';
import ConfiguracionPage from './pages/ConfiguracionPage';
import ExcelOnline from './pages/ExcelOnline';
import CotizacionCartV2 from './components/CotizacionCartV2';
import CartButton from './components/CartButton';

export default function App() {
  return (
    <NotificationProvider>
      <CartProvider>
      <CotizacionesProvider>
        <Router>
          <NavbarResponsive />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/users" element={<Users />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id/materiales" element={<ProjectMaterials />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/insumos" element={<Insumos />} />
            <Route path="/cotizaciones" element={<Cotizaciones />} />
            <Route path="/actas" element={<ActasReunion />} />
            <Route path="/buscador" element={<BuscadorPage />} />
            <Route path="/demo-carrito" element={<DemoCarrito />} />
            <Route path="/Demo de cotizaciones" element={<DemoCarrito />} />
            <Route path="/historial" element={<HistorialCotizaciones />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />
            <Route path="/excel" element={<ExcelOnline />} />
          </Routes>
          <CotizacionCartV2 />
          <CartButton />
        </Router>
      </CotizacionesProvider>
    </CartProvider>
    </NotificationProvider>
  );
}
