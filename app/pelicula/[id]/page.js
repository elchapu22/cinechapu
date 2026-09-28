import { db as sql } from "@/lib/db";
import { createClient } from "@libsql/client";
import Link from 'next/link';


export default async function DetallePeliculaPage({ params }) {
  const { id } = await params;

  console.log("🎯 ID recibido por URL en Next.js:", id);

  // 1. Traemos la película de la base de datos
  const resultadoPelicula = await sql.execute({
    sql: "SELECT * FROM peliculas WHERE id = ?",
    args: [id]
  });
  
  console.log("🎯 Resultado de la consulta de la película:", resultadoPelicula);

  const pelicula = resultadoPelicula.rows[0];

  if (!pelicula) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white flex items-center justify-center">
        <p>Película no encontrada</p>
      </div>
    );
  }

  // 2. Video de fondo
  const videoIdFondo = pelicula.video_fondo || pelicula.trailer || "dQw4w9WgXcQ"; 

  // 3. Traemos el reparto real incluyendo el id del actor
  let reparto = [];
  try {
    const resultadoReparto = await sql.execute({
      sql: `
        SELECT a.id, a.nombre, a.foto_url, pa.personaje 
        FROM pelicula_actores pa
        JOIN actores a ON pa.id_actor = a.id
        WHERE pa.id_pelicula = ?
      `,
      args: [id]
    });
    reparto = resultadoReparto.rows;
  } catch (error) {
    console.log("Error al traer actores:", error);
  }

  // Respaldo por si no hay actores cargados
  if (reparto.length === 0) {
    reparto = [
      { id: 1, nombre: "Actor de prueba", personaje: "Personaje 1", foto_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" }
    ];
  }

  return (
    <main className="min-h-screen bg-[#090d16] text-white selection:bg-red-600 selection:text-white pb-20">
      
      {/* 🌟 HERO CON VIDEO DE FONDO DE YOUTUBE */}
      <div className="relative w-full h-[75vh] min-h-[550px] flex items-end pb-12 px-6 lg:px-16 overflow-hidden">
        
        {/* Contenedor del video de YouTube en bucle de fondo */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-50">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoIdFondo}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoIdFondo}&disablekb=1&modestbranding=1`}
            title="Background video"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] md:w-[150%] md:h-[150%] object-cover"
            allow="autoplay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090d16] via-transparent to-[#090d16]/80" />
        </div>

        {/* Información y botones principales */}
        <div className="relative z-10 max-w-4xl flex flex-col items-start gap-4">
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-lg">
            {pelicula.nombre}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-zinc-300 font-medium">
            <span className="text-red-500 font-bold border border-red-500/30 px-2 py-0.5 rounded bg-red-950/30">HD</span>
            <span>{pelicula.genero || 'Película'}</span>
            <span>•</span>
            <span>{pelicula.anio || pelicula.ano || '2026'}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              ★ {pelicula.calificacion || '7.0'}
            </span>
          </div>

          <p className="text-zinc-300 text-sm md:text-base leading-relaxed line-clamp-3 max-w-2xl">
            {pelicula.resumen || pelicula.sinopsis || 'Sin descripción disponible para esta película en este momento.'}
          </p>

          <div className="flex items-center gap-4 mt-2">
            <a 
              href={pelicula.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-red-600/30 cursor-pointer text-sm md:text-base"
            >
              ▶ Ver en Telegram
            </a>

            {/* 🔙 Botón Volver agregado */}
            <Link 
              href="/"
              className="bg-zinc-800/80 hover:bg-zinc-700 text-white font-bold px-5 py-3 rounded-lg flex items-center gap-2 transition-colors border border-zinc-700 cursor-pointer text-sm md:text-base"
            >
              ← Volver
            </Link>
            
            <button className="bg-zinc-800/80 hover:bg-zinc-700 text-white font-bold w-11 h-11 rounded-lg flex items-center justify-center transition-colors border border-zinc-700 cursor-pointer" title="Agregar a favoritos">
              +
            </button>

            <button className="bg-zinc-800/80 hover:bg-zinc-700 text-white font-medium px-4 py-3 rounded-lg flex items-center gap-2 transition-colors border border-zinc-700 text-sm cursor-pointer">
              👥 Similares
            </button>
          </div>

        </div>
      </div>

      {/* 🌟 SECCIÓN DE REPARTO (CAST) */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-16 mt-12">
        <h2 className="text-xl font-bold text-white mb-6 border-l-4 border-red-600 pl-3">
          Reparto
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {reparto.map((actor, index) => (
            <Link 
              key={index} 
              href={`/actores/${actor.id}`}
              className="bg-[#131b2e]/60 border border-zinc-800/80 rounded-xl p-3 flex items-center gap-3 backdrop-blur shadow hover:border-red-500/50 transition-colors group cursor-pointer"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-zinc-800">
                <img 
                  src={actor.foto_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"} 
                  alt={actor.nombre} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-white truncate group-hover:text-red-500 transition-colors">{actor.nombre}</h4>
                <p className="text-[10px] text-zinc-400 truncate">{actor.personaje || 'Actor'}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </main>
  );
}