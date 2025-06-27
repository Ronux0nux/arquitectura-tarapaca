import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Projects from "./pages/Projects";
import Providers from "./pages/Providers";
import Insumos from "./pages/Insumos";
import Cotizaciones from "./pages/Cotizaciones";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users" element={<Users />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/providers" element={<Providers />} />
        <Route path="/insumos" element={<Insumos />} />
        <Route path="/cotizaciones" element={<Cotizaciones />} />
      </Routes>
    </Router>
  );
}
