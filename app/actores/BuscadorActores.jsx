'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BuscadorActores({ actoresUnicos }) {
  const [busqueda, setBusqueda] = useState('');

  // Filtramos la lista de actores en tiempo real según lo que escribas
  const actoresFiltrados = actoresUnicos.filter(actor => 
  actor.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      {/* Input de Búsqueda */}
      <div className="max-w-6xl mx-auto mb-8">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar actor o actriz..."
          className="w-full md:w-96 bg-[#131b2e] border border-zinc-800 rounded-full px-5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-600 transition-colors shadow-lg"
        />
        {busqueda && (
          <span className="text-xs text-zinc-500 ml-4">
            Mostrando {actoresFiltrados.length} de {actoresUnicos.length} actores
          </span>
        )}
      </div>

      {/* Grilla de Actores Filtrados */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {actoresFiltrados.map((actor, index) => (
          <Link 
            key={index}
            href={`/actores/${encodeURIComponent(actor)}`}
            className="bg-zinc-900 border border-zinc-800 hover:border-red-600 p-4 rounded-lg text-center transition-all duration-300 group flex items-center justify-center min-h-[80px]"
          >
            <span className="text-sm font-semibold text-zinc-300 group-hover:text-white">
              {actor}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}