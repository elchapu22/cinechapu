import { createClient } from "@libsql/client";
import Link from "next/link";
import { db as sql } from "@/app/db";


export default async function ActorPage({ params }) {
  const { id } = await params;

  // 1. Buscar datos del actor
  const actorRes = await sql.execute({
    sql: "SELECT * FROM actores WHERE id = ?",
    args: [id]
  });
  const actor = actorRes.rows[0];

  if (!actor) {
    return (
      <main className="min-h-screen bg-[#0b0f19] text-white p-12 flex flex-col items-center justify-center">
        <p className="text-xl mb-4">Actor no encontrado</p>
        <Link href="/" className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg transition-colors">
          Volver al Inicio
        </Link>
      </main>
    );
  }

  // 2. Buscar todas las películas de este actor en Turso
  const peliculasRes = await sql.execute({
    sql: `
      SELECT p.*, pa.personaje 
      FROM peliculas p
      JOIN pelicula_actores pa ON p.id = pa.id_pelicula
      WHERE pa.id_actor = ?
    `,
    args: [id]
  });
  const peliculas = peliculasRes.rows;

  const limiteBio = 250;
  const tieneBioLarga = actor.biografia && actor.biografia.length > limiteBio;

  return (
    <main className="min-h-screen bg-[#0b0f19] text-white p-6 md:p-12">
      
      {/* Botón Volver */}
      <div className="max-w-[1400px] mx-auto mb-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold px-4 py-2 rounded-lg transition-colors border border-zinc-700/60 shadow"
        >
          ← Volver
        </Link>
      </div>

      {/* Cabecera estilo perfil con Biografía */}
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start gap-8 mb-12 bg-[#131b2e]/60 p-6 md:p-8 rounded-2xl border border-zinc-800/80 backdrop-blur shadow-xl">
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-red-600/50 shadow-xl flex-shrink-0 bg-zinc-800 mx-auto md:mx-0">
          <img 
            src={actor.foto_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"} 
            alt={actor.nombre} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-grow text-center md:text-left">
          <p className="text-xs uppercase tracking-widest text-red-500 font-bold mb-1">Actor / Actriz</p>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-2">{actor.nombre}</h1>
          <p className="text-zinc-400 text-sm mb-4">Filmografía disponible en la plataforma ({peliculas.length} películas)</p>
          
          {/* Biografía Inteligente con CSS puro */}
          {actor.biografia ? (
            <div className="border-t border-zinc-800/80 pt-4 mt-2 max-w-4xl text-zinc-300 text-sm leading-relaxed">
              {tieneBioLarga ? (
                <details className="group">
                  <p className="inline">
                    {actor.biografia.slice(0, limiteBio)}...
                  </p>
                  <summary className="text-red-500 hover:text-red-400 text-xs font-bold transition-colors uppercase tracking-wider inline list-none cursor-pointer ml-2">
                    <span className="group-open:hidden">▼ Leer más</span>
                    <span className="hidden group-open:inline">▲ Leer menos</span>
                  </summary>
                  <p className="mt-2 text-zinc-300">
                    {actor.biografia.slice(limiteBio)}
                  </p>
                </details>
              ) : (
                <p>{actor.biografia}</p>
              )}
            </div>
          ) : (
            <p className="text-zinc-500 italic text-xs mt-2 border-t border-zinc-800/80 pt-4">Sin biografía registrada.</p>
          )}
        </div>
      </div>

      {/* Grilla de Películas */}
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-xl font-bold mb-6 border-l-4 border-red-600 pl-3">Películas</h2>
        
        {peliculas.length === 0 ? (
          <p className="text-zinc-500 text-sm">No hay películas registradas para este actor todavía.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {peliculas.map((pelicula) => (
              <Link 
                key={pelicula.id} 
                href={`/pelicula/${pelicula.id}`}
                className="group bg-[#131b2e] rounded-xl overflow-hidden border border-zinc-800/60 hover:border-red-600/50 transition-all duration-300 hover:scale-105 shadow-lg flex flex-col"
              >
                <div className="relative aspect-[2/3] w-full bg-zinc-800 overflow-hidden">
                  <img 
                    src={pelicula.foto || pelicula.poster || pelicula.imagen || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500"} 
                    alt={pelicula.nombre}
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-amber-400">
                    ★ {pelicula.calificacion || "8.0"}
                  </div>
                </div>
                <div className="p-3 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-red-500 transition-colors">
                      {pelicula.nombre}
                    </h3>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      Personaje: {pelicula.personaje || "Reparto"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </main>
  );
}