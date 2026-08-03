'use client';
import { useRef, useEffect } from 'react';
import Link from 'next/link';

const limpiarNombre = (nombre) => {
  if (!nombre) return '';
  return nombre.replace(/\(series\)/gi, '').replace(/\(anime\)/gi, '').replace(/\(infantil\)/gi, '').trim();
};

export default function CarruselEstrenos({ ultimasSubidas, imagenGenerica }) {
  const scrollRef = useRef(null);
  let isDown = false;
  let startX;
  let scrollLeft;

  // --- EFECTO DE AUTOPLAY (MOVIMIENTO AUTOMÁTICO) ---
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      // Si el usuario está interactuando o arrastrando, no hacemos auto-scroll para molestarlo
      if (isDown) return;

      // Calculamos cuánto se desplaza (ej: ancho de una tarjeta aprox o un valor fijo)
      const scrollAmount = 200; 
      
      // Si llega al final, vuelve al principio suavemente
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }, 3500); // Se mueve solo cada 3.5 segundos (podes ajustarlo)

    return () => clearInterval(interval);
  }, [isDown]);

  const handleMouseDown = (e) => {
    isDown = true;
    scrollRef.current.classList.add('cursor-grabbing');
    startX = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown = false;
    if (scrollRef.current) scrollRef.current.classList.remove('cursor-grabbing');
  };

  const handleMouseUp = () => {
    isDown = false;
    if (scrollRef.current) scrollRef.current.classList.remove('cursor-grabbing');
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div 
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className="flex flex-row gap-4 overflow-x-auto scrollbar-none pb-4 scroll-smooth w-full cursor-grab select-none"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
    >
      {ultimasSubidas.map((item) => (
        <Link 
          key={item.id} 
          href={`/pelicula/${item.id}`}
          draggable="false"
          className="w-[140px] sm:w-[160px] min-w-[140px] sm:min-w-[160px] bg-[#131b2e]/60 rounded-xl overflow-hidden border border-zinc-800/85 transition-all duration-300 hover:scale-105 hover:border-red-600 shadow-xl flex-shrink-0 group flex flex-col"
        >
          <div className="w-full h-[210px] bg-zinc-900 relative overflow-hidden pointer-events-none">
            <img 
              src={item.foto || imagenGenerica} 
              alt={item.nombre} 
              draggable="false"
              className="object-cover w-full h-full group-hover:opacity-90 transition-opacity select-none" 
            />
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
              NUEVO
            </div>
          </div>
          <div className="p-2.5 pointer-events-none">
            <h3 className="text-[11px] font-semibold text-zinc-200 line-clamp-1 leading-snug capitalize">{limpiarNombre(item.nombre)}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}