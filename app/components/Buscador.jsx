'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Buscador({ peliculas }) {
  const [busqueda, setBusqueda] = useState('');

  // 1. Vamos a ver en la consola del navegador que le llega a este componente
  console.log("Total de peliculas recibidas en Buscador:", peliculas?.length);
  if (peliculas && peliculas.length > 0) {
    console.log("Ejemplo de pelicula 0:", peliculas[0]);
  }

  const peliculasFiltradas = peliculas.filter((pelicula) => {
    if (!pelicula) return false;

    const query = busqueda.toLowerCase().trim();
    if (!query) return true;

    const nombre = (pelicula.nombre || '').toLowerCase();
    const resumen = (pelicula.resumen || '').toLowerCase();
    const director = (pelicula.director || '').toLowerCase();
    const actores = (pelicula.actores || '').toLowerCase();
    const tags = (pelicula.tags || '').toLowerCase();

    return (
      nombre.includes(query) ||
      resumen.includes(query) ||
      director.includes(query) ||
      actores.includes(query) ||
      tags.includes(query)
    );
  });

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <input
          type="text"
          placeholder="Escribi para buscar al instante..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
        />
      </div>

      <div className="mb-4 text-center text-zinc-400 text-sm">
        Buscando: "{busqueda}" | Mostrando {peliculasFiltradas.length} de {peliculas.length} peliculas
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {peliculasFiltradas.length > 0 ? (
          peliculasFiltradas.map((pelicula) => (
            <Link 
              href={`/peliculas/${pelicula.id}`}
              key={pelicula.id} 
              className="group relative bg-zinc-900 rounded-md overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 hover:z-10 cursor-pointer border border-zinc-800 block"
            >
              <div className="aspect-[2/3] w-full bg-zinc-800 relative">
                {pelicula.foto ? (
                  <img 
                    src={pelicula.foto} 
                    alt={pelicula.nombre}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-500 text-xs p-2 text-center">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="p-3 bg-zinc-900">
                <h3 className="font-medium text-sm truncate text-zinc-100 group-hover:text-red-500 transition-colors" title={pelicula.nombre}>
                  {pelicula.nombre}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                  {pelicula.resumen || "Pelicula alojada en canal privado."}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-zinc-500">
            No se encontro ninguna pelicula con "{busqueda}".
          </div>
        )}
      </div>
    </div>
  );
}