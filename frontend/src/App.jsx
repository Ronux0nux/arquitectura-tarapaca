import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from './context/CartContext';
import { CotizacionesProvider } from './context/CotizacionesContext';
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Projects from "./pages/Projects";
import Providers from "./pages/Providers";
import Insumos from "./pages/Insumos";
import Cotizaciones from "./pages/Cotizaciones";
import ActasReunion from './pages/ActasReunion';
import BuscadorPage from './pages/BuscadorPage';
import DemoCarrito from './pages/DemoCarrito';
import HistorialCotizaciones from './pages/HistorialCotizaciones';
import CotizacionCartV2 from './components/CotizacionCartV2';
import CartButton from './components/CartButton';

export default function App() {
  return (
    <CartProvider>
      <CotizacionesProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/users" element={<Users />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/insumos" element={<Insumos />} />
            <Route path="/cotizaciones" element={<Cotizaciones />} />
            <Route path="/actas" element={<ActasReunion />} />
            <Route path="/buscador" element={<BuscadorPage />} />
            <Route path="/demo-carrito" element={<DemoCarrito />} />
            <Route path="/historial" element={<HistorialCotizaciones />} />
          </Routes>
          <CotizacionCartV2 />
          <CartButton />
        </Router>
      </CotizacionesProvider>
    </CartProvider>
  );
}
