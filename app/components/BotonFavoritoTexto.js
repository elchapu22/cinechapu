"use client";
import { useState, useEffect } from 'react';

export default function BotonFavoritoTexto({ peliculaId }) {
  const [esFavorito, setEsFavorito] = useState(false);

  useEffect(() => {
    const favoritos = JSON.parse(localStorage.getItem('cinechapu_favoritos')) || [];
    setEsFavorito(favoritos.includes(peliculaId));
  }, [peliculaId]);

  const toggleFavorito = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let favoritos = JSON.parse(localStorage.getItem('cinechapu_favoritos')) || [];
    if (esFavorito) {
      favoritos = favoritos.filter(id => id !== peliculaId);
      setEsFavorito(false);
    } else {
      favoritos.push(peliculaId);
      setEsFavorito(true);
    }
    localStorage.setItem('cinechapu_favoritos', JSON.stringify(favoritos));
  };

  return (
    <button onClick={toggleFavorito} className={`w-full py-1.5 px-2 text-[10px] font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${esFavorito ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
      {esFavorito ? '❤️ Quitar' : '🤍 Guardar'}
    </button>
  );
}