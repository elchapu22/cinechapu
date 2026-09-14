import Link from 'next/link';

export default function PeliculaCardPro({ pelicula, item }) {
  const p = pelicula || item;
  
  if (!p) return null;

  const urlImagen = p.foto || p.imagen || p.poster || p.url_imagen;
  const tituloPeli = p.nombre || p.titulo || 'Película';
  const calificacionPeli = p.calificacion || p.rating;
  const anioPeli = p.anio || p.year || 'Estreno';

  // Determinamos si es una saga o una película normal para la ruta correcta
  const rutaDestino = p.esSaga ? `/sagas/${p.id}` : `/pelicula/${p.id}`;

  return (
    <Link 
      href={rutaDestino} 
      className="group relative flex flex-col bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800/80 hover:border-red-600/60 transition-all duration-300 shadow-lg hover:shadow-red-950/20"
    >
      
      {/* Contenedor de la Portada */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
        {urlImagen ? (
          <img
            src={urlImagen}
            alt={tituloPeli}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-600 text-xs">Sin imagen</div>
        )}

        {/* Etiqueta de SAGA si corresponde */}
        {p.esSaga && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-md z-10 border border-red-800">
            SAGA ({p.cantidad})
          </div>
        )}

        {/* Etiqueta de Puntuación (si no es saga o si tiene calificación) */}
        {calificacionPeli && !p.esSaga && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10 shadow-md z-10">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-white text-xs font-bold">{calificacionPeli}</span>
          </div>
        )}
      </div>

      {/* Información inferior */}
      <div className="p-3 flex flex-col justify-between flex-grow bg-[#121214]">
        <h3 className="text-white text-xs sm:text-sm font-semibold line-clamp-1 group-hover:text-red-500 transition-colors">
          {tituloPeli}
        </h3>
        <span className="text-zinc-500 text-[11px] mt-1">
          {anioPeli}
        </span>
      </div>

    </Link>
  );
}