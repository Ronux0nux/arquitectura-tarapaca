import React from 'react';
import BuscadorMateriales from '../components/BuscadorMateriales';

const BuscadorPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🔍 Buscador de Materiales</h1>
          <p className="text-gray-600">Encuentra materiales de construcción y compara precios usando SerpApi</p>
        </div>
        <BuscadorMateriales />
      </div>
    </div>
  );
};

export default BuscadorPage;
