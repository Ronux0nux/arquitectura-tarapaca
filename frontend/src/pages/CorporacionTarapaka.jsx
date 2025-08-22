import React, { useEffect, useState, useRef } from 'react';

const carruselImages = [
  '/imagenes-carrusel/14.jpeg',
  '/imagenes-carrusel/19.jpeg',
  '/imagenes-carrusel/20.jpeg',
  '/imagenes-carrusel/21.jpeg',
  '/imagenes-carrusel/26.jpeg',

  // ...agrega más imágenes aquí
];

const equipo = [
  { nombre: 'Juan Pérez', foto: '/imagenes-carrusel/equipo1.jpg' },
  { nombre: 'María González', foto: '/imagenes-carrusel/equipo2.jpg' },
  { nombre: 'Carlos Rojas', foto: '/imagenes-carrusel/equipo3.jpg' },
  // ...agrega más integrantes aquí
];

const proyectos = [
  {
    nombre: 'Proyecto Plaza Central',
    ubicacion: 'Iquique, Tarapacá',
    imagen: '/imagenes-carrusel/proyecto1.jpg',
    descripcion: 'Remodelación de la plaza principal de la ciudad.'
  },
  {
    nombre: 'Centro Comunitario',
    ubicacion: 'Pozo Almonte, Tarapacá',
    imagen: '/imagenes-carrusel/proyecto2.jpg',
    descripcion: 'Construcción de espacio para actividades sociales.'
  },
  // ...agrega más proyectos aquí
];

export default function CorporacionTarapaka() {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % carruselImages.length);
    }, 3500);
    return () => clearTimeout(timeoutRef.current);
  }, [current]);

  const goToSlide = (idx) => setCurrent(idx);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header con carrusel automático */}
      <header className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src={carruselImages[current]}
          alt="Foto representativa"
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 text-center drop-shadow-lg">Corporación Tarapaka</h1>
          <h2 className="text-2xl md:text-3xl text-white mb-6 text-center drop-shadow">Construyendo Futuro en la Región</h2>
          <button
            className="bg-yellow-500 text-black font-semibold px-6 py-3 rounded shadow hover:bg-yellow-400 transition"
            onClick={() => document.getElementById('proyectos').scrollIntoView({ behavior: 'smooth' })}
          >
            Ver Proyectos Realizados
          </button>
        </div>
        {/* Miniaturas */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {carruselImages.map((img, idx) => (
            <button key={img} onClick={() => goToSlide(idx)} className={`w-16 h-10 rounded overflow-hidden border-2 ${current === idx ? 'border-yellow-500' : 'border-white'}`}>
              <img src={img} alt="miniatura" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </header>

      {/* Bloque de proyectos */}
      <section id="proyectos" className="py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Proyectos Realizados</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {proyectos.map((p) => (
            <div key={p.nombre} className="bg-gray-100 rounded-lg shadow p-4 flex flex-col items-center">
              <img src={p.imagen} alt={p.nombre} className="w-full h-48 object-cover rounded mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{p.nombre}</h3>
              <p className="text-sm text-gray-600 mb-1">Ubicación: {p.ubicacion}</p>
              <p className="text-gray-700 text-center">{p.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Equipo */}
      <section className="py-16 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Nuestro Equipo</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {equipo.map((e) => (
            <div key={e.nombre} className="bg-white rounded-lg shadow flex flex-col items-center p-6">
              <img src={e.foto} alt={e.nombre} className="w-24 h-24 object-cover rounded-full mb-4 border-4 border-yellow-500" />
              <span className="text-lg font-semibold text-gray-900">{e.nombre}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
