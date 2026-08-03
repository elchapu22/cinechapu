'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Cache global en memoria del navegador para no reconsultar a Turso por la misma pelicula
const cachePeliculas = {};

const limpiarNombre = (nombre) => {
  if (!nombre) return '';
  return nombre.replace(/\(series\)/gi, '').replace(/\(anime\)/gi, '').replace(/\(infantil\)/gi, '').trim();
};

export default function PeliculaCard({ item, imagenGenerica }) {
  const [infoPelicula, setInfoPelicula] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [cargado, setCargado] = useState(false);

  // Usamos el hook oficial de Next.js para leer los parámetros de la URL sin errores de hidratación
  const searchParams = useSearchParams();

  const handleMouseEnter = async () => {
    if (cargado || cargando) return;
    const nombreLimpio = limpiarNombre(item.nombre);

    if (cachePeliculas[nombreLimpio]) {
      setInfoPelicula(cachePeliculas[nombreLimpio]);
      setCargado(true);
      return;
    }

    setCargando(true);
    try {
      const res = await fetch(`/api/peliculas?nombre=${encodeURIComponent(nombreLimpio)}`);
      const data = await res.json();
      cachePeliculas[nombreLimpio] = data;
      setInfoPelicula(data);
      setCargado(true);
    } catch (error) {
      console.error('Error al traer info de la pelicula:', error);
    } finally {
      setCargando(false);
    }
  };

  const textoResumen = infoPelicula?.resumen || infoPelicula?.sinopsis;
  const fotoActual = infoPelicula?.foto || item.foto || imagenGenerica;

  // Construimos la URL manteniendo los filtros actuales de manera segura
  const queryString = searchParams.toString();
  const urlDetalle = queryString ? `/pelicula/${item.id}?${queryString}` : `/pelicula/${item.id}`;

  return (
    <div className="relative group" onMouseEnter={handleMouseEnter}>
      <Link 
        href={urlDetalle}
        className="bg-[#131b2e]/60 rounded-lg overflow-hidden border border-zinc-800/80 transition-all duration-200 hover:scale-105 hover:border-zinc-700 shadow-lg flex flex-col h-full block"
      >
        <div className="aspect-[2/3] w-full bg-zinc-900 relative overflow-hidden">
          <img src={fotoActual} alt={item.nombre} className="object-cover w-full h-full group-hover:opacity-90 transition-opacity" />
        </div>
        <div className="p-2.5 flex-1 flex flex-col justify-between">
          <h3 className="text-[11px] font-medium text-zinc-300 line-clamp-2 leading-snug capitalize">{limpiarNombre(item.nombre)}</h3>
        </div>
      </Link>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-72 bg-[#182236] border border-zinc-700/80 rounded-xl shadow-2xl p-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50 text-left">
        <h4 className="text-sm font-bold text-white mb-1 line-clamp-2">
          {limpiarNombre(item.nombre)}
        </h4>

        <div className="flex flex-wrap gap-2 text-[10px] text-zinc-300 mb-2 font-medium">
          {infoPelicula?.anio && <span className="bg-zinc-800 px-1.5 py-0.5 rounded">📅 {infoPelicula.anio}</span>}
          {infoPelicula?.director && <span className="bg-zinc-800 px-1.5 py-0.5 rounded line-clamp-1">🎬 {infoPelicula.director}</span>}
        </div>

        {infoPelicula?.generos && (
          <p className="text-[10px] text-red-400 font-semibold mb-2">
            {infoPelicula.generos}
          </p>
        )}

        <div className="text-zinc-300 leading-relaxed text-[11px]">
          {cargando && <p className="text-zinc-400 italic">Buscando detalles...</p>}
          {!cargando && (textoResumen && textoResumen !== 'Sin resumen disponible.' ? textoResumen : 'Sin resumen disponible.')}
        </div>
      </div>
    </div>
  );
}