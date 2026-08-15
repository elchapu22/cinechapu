'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const imagenGenerica = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop";

export default function FavoritosPage() {
  const [peliculas, setPeliculas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarFavoritos() {
      try {
        const guardados = localStorage.getItem('cinechapu_favoritos');
        if (!guardados) {
          setCargando(false);
          return;
        }

        const ids = JSON.parse(guardados);
        if (!Array.isArray(ids) || ids.length === 0) {
          setCargando(false);
          return;
        }

        const res = await fetch('/api/favoritos-data');
        const todas = await res.json();

        if (Array.isArray(todas)) {
          const matches = todas.filter((peli) => ids.includes(peli.id));
          setPeliculas(matches);
        }
      } catch (err) {
        console.error('Error al cargar favoritos:', err);
      } finally {
        setCargando(false);
      }
    }

    cargarFavoritos();
  }, []);

  const quitarDeFavoritos = (id, e) => {
    e.preventDefault();
    const guardados = localStorage.getItem('cinechapu_favoritos');
    if (guardados) {
      const ids = JSON.parse(guardados);
      const nuevosIds = ids.filter((favId) => favId !== id);
      localStorage.setItem('cinechapu_favoritos', JSON.stringify(nuevosIds));
      
      setPeliculas(peliculas.filter((peli) => peli.id !== id));
    }
  };

  return (
    <main className="min-h-screen bg-[#070b14] text-white p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-red-600">Mis Favoritos 🤍</h1>
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          🏠 Volver al Inicio
        </Link>
      </div>

      {cargando ? (
        <p className="text-zinc-400">Cargando favoritos...</p>
      ) : peliculas.length === 0 ? (
        <p className="text-zinc-400">No tenés películas guardadas en favoritos todavía.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {peliculas.map((peli) => (
            <div key={peli.id} className="bg-zinc-900 p-3 rounded-lg relative group flex flex-col justify-between">
              <Link href={`/pelicula/${peli.id}`} className="flex flex-col h-full">
                <div className="aspect-[2/3] w-full bg-zinc-950 relative overflow-hidden rounded mb-2">
                <img 
                  src={peli.foto || imagenGenerica} 
                  alt={peli.nombre} 
                  className="w-full h-full object-cover rounded transition-transform duration-300 group-hover:scale-105" 
                />
                </div>
                <h2 className="font-semibold text-sm line-clamp-2">{peli.nombre}</h2>
              </Link>

              <button
                onClick={(e) => quitarDeFavoritos(peli.id, e)}
                className="absolute top-5 right-5 bg-black/70 hover:bg-red-600 text-white p-2 rounded-full transition-colors duration-200 shadow-lg"
                title="Quitar de favoritos"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}