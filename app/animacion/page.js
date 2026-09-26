import { db as sql } from "@/lib/db";
import { createClient } from "@libsql/client";
import Link from 'next/link';
export const dynamic = 'force-dynamic';
import PeliculaCardPro from '../components/PeliculaCardPro';


const imagenGenerica = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop";

const limpiarNombre = (nombre) => {
  if (!nombre) return '';
  return nombre.replace(/\(series\)/gi, '').replace(/\(anime\)/gi, '').replace(/\(infantil\)/gi, '').trim();
};

export default async function AnimacionPage({ searchParams }) {
  const params = await searchParams;
  const paginaActual = Number(params?.page) || 1;
  const busqueda = params?.busqueda || '';
  const porPagina = 24;
  const offset = (paginaActual - 1) * porPagina;

  let contenidoPaginado = [];
  let totalContenido = 0;

  // Consulta adaptada con LIMIT y OFFSET reales para que funcione la paginación
  if (busqueda) {
    const resultado = await sql.execute({
      sql: `SELECT * FROM peliculas 
            WHERE (LOWER(tags) LIKE '%infantil%' OR LOWER(tags) LIKE '%anime%' OR LOWER(tags) LIKE '%animacion%')
            AND LOWER(nombre) LIKE ? 
            ORDER BY id LIMIT ? OFFSET ?`,
      args: [`%${busqueda.toLowerCase()}%`, porPagina, offset]
    });
    contenidoPaginado = resultado.rows;

    const totalResultado = await sql.execute({
      sql: `SELECT COUNT(*) as count FROM peliculas 
            WHERE (LOWER(tags) LIKE '%infantil%' OR LOWER(tags) LIKE '%anime%' OR LOWER(tags) LIKE '%animacion%')
            AND LOWER(nombre) LIKE ?`,
      args: [`%${busqueda.toLowerCase()}%`]
    });
    totalContenido = Number(totalResultado.rows[0].count);
  } else {
    const resultado = await sql.execute({
      sql: `SELECT * FROM peliculas 
            WHERE LOWER(tags) LIKE '%infantil%' 
               OR LOWER(tags) LIKE '%anime%' 
               OR LOWER(tags) LIKE '%animacion%' 
            ORDER BY id LIMIT ? OFFSET ?`,
      args: [porPagina, offset]
    });
    contenidoPaginado = resultado.rows;

    const totalResultado = await sql.execute({
      sql: `SELECT COUNT(*) as count FROM peliculas 
            WHERE LOWER(tags) LIKE '%infantil%' 
               OR LOWER(tags) LIKE '%anime%' 
               OR LOWER(tags) LIKE '%animacion%'`
    });
    totalContenido = Number(totalResultado.rows[0].count);
  }

  const totalPaginas = Math.ceil(totalContenido / porPagina) || 1;

  // --- LÓGICA DE AGRUPAMIENTO DE SAGAS ---
  const peliculasSuelta = [];
  const sagasAgrupadas = {};

  contenidoPaginado.forEach((item) => {
    if (item.id_saga) {
      if (!sagasAgrupadas[item.id_saga]) {
        sagasAgrupadas[item.id_saga] = {
          esSaga: true,
          id: item.id_saga,
          nombre: `Coleccion ${limpiarNombre(item.nombre).split(' y ')[0].split(' el ')[0].split(' en ')[0]}`,
          foto: item.foto,
          cantidad: 1
        };
      } else {
        sagasAgrupadas[item.id_saga].cantidad += 1;
      }
    } else {
      peliculasSuelta.push({ ...item, esSaga: false });
    }
  });

  const elementosMostrar = [...Object.values(sagasAgrupadas), ...peliculasSuelta];

  return (
    <main className="min-h-screen bg-[#030305] text-white flex flex-col justify-between selection:bg-red-600 selection:text-white">
      <div>
        {/* Header Estilo Streaming Pro con Navegación Horizontal y Fondo Negro Profundo */}
        <header className="w-full bg-[#030305]/90 border-b border-zinc-900/80 py-3.5 px-6 sticky top-0 z-50 backdrop-blur-xl">
          <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-4">
            
            {/* Logo y Eslogan Minimalista */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/" className="text-xl md:text-2xl font-black tracking-wider text-red-600 flex items-center gap-1.5">
                <span className="bg-red-600 text-white p-1 rounded-md text-xs">🎬</span> CineChapu
              </Link>
            </div>

            {/* Menú de Navegación en Cápsula */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 bg-[#111827]/70 border border-zinc-800/80 px-3 py-1.5 rounded-full shadow-inner">
              <Link href="/" className="px-3 py-1 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all flex items-center gap-1.5">
                <span>🏠</span> Inicio
              </Link>
              <Link href="/peliculas" className="px-3 py-1 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all flex items-center gap-1.5">
                <span>🍿</span> Películas
              </Link>
              <Link href="/series" className="px-3 py-1 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all flex items-center gap-1.5">
                <span>📺</span> Series
              </Link>
              <Link href="/animacion" className="px-3 py-1 rounded-full text-xs font-medium text-white bg-zinc-800/95 transition-all flex items-center gap-1.5">
                <span>⚡</span> Animación
              </Link>
              <Link href="/sagas" className="px-3 py-1 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all flex items-center gap-1.5">
                <span>🔮</span> Sagas
              </Link>
              <Link href="/favoritos" className="px-3 py-1 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all flex items-center gap-1.5">
                <span>💖</span> Favoritos
              </Link>
              <Link href="/actores" className="px-3 py-1 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all flex items-center gap-1.5">
                <span>🎭</span> Actores
              </Link>
            </nav>

            {/* Buscador Estilizado */}
            <form action="/animacion" method="GET" className="relative w-44 sm:w-60 shrink-0">
              <input 
                type="text" 
                name="busqueda" 
                defaultValue={busqueda}
                placeholder="Buscar animación..." 
                className="w-full bg-[#111a2e] border border-zinc-700/80 rounded-full px-4 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-600 transition-all shadow-sm pr-9 placeholder:text-zinc-500"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer text-xs">
                🔍
              </button>
            </form>
          </div>

          {/* Menú inferior deslizable para pantallas medianas o celulares */}
          <nav className="flex lg:hidden items-center justify-start sm:justify-center gap-2 text-xs text-zinc-300 font-medium mt-3 pt-2.5 border-t border-zinc-800/50 overflow-x-auto pb-1 scrollbar-none">
            <Link href="/" className="px-2.5 py-1 bg-[#111827] rounded-md whitespace-nowrap">🏠 Inicio</Link>
            <Link href="/peliculas" className="px-2.5 py-1 bg-[#111827] rounded-md whitespace-nowrap">🍿 Películas</Link>
            <Link href="/series" className="px-2.5 py-1 bg-[#111827] rounded-md whitespace-nowrap">📺 Series</Link>
            <Link href="/animacion" className="px-2.5 py-1 bg-red-600 text-white rounded-md whitespace-nowrap">⚡ Animación</Link>
            <Link href="/sagas" className="px-2.5 py-1 bg-[#111827] rounded-md whitespace-nowrap">🔮 Sagas</Link>
            <Link href="/favoritos" className="px-2.5 py-1 bg-[#111827] rounded-md whitespace-nowrap">💖 Favoritos</Link>
            <Link href="/actores" className="px-2.5 py-1 bg-[#111827] rounded-md whitespace-nowrap">🎭 Actores</Link>
          </nav>
        </header>

        <section className="max-w-[1500px] mx-auto px-6 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between bg-[#111827]/50 border border-zinc-800/80 rounded-xl p-4 backdrop-blur shadow-lg">
              <div className="text-xs text-zinc-400">
                <span className="text-red-500 font-semibold mr-2">Catálogo de Animación e Infantil</span>
                Mostrando <span className="text-white font-bold">{elementosMostrar.length}</span> de <span className="text-white font-bold">{totalContenido}</span> resultados
              </div>
              {busqueda && (
                <Link href="/animacion" className="text-xs text-red-400 hover:underline">Limpiar filtro ✕</Link>
              )}
            </div>

            {elementosMostrar.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {elementosMostrar.map((item) => (
                  <PeliculaCardPro
                    key={item.esSaga ? `saga-${item.id}` : `peli-${item.id}`}
                    pelicula={{
                      ...item,
                      nombre: item.esSaga ? item.nombre : limpiarNombre(item.nombre)
                    }}
                    esSaga={item.esSaga}
                    cantidadSaga={item.cantidad}
                    imagenGenerica={imagenGenerica}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-zinc-500 bg-[#111827]/30 rounded-lg border border-zinc-800/40">
                No se encontraron contenidos de animación.
              </div>
            )}

            {/* Controles de Paginación */}
            <div className="flex justify-center items-center gap-3 mt-12 mb-8">
              {paginaActual > 1 ? (
                <Link href={`/animacion?page=${paginaActual - 1}${busqueda ? `&busqueda=${busqueda}` : ''}`} className="bg-[#111827] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-4 py-1.5 rounded text-xs font-medium">← Anterior</Link>
              ) : (
                <span className="bg-[#0f1523] border border-zinc-900 text-zinc-700 px-4 py-1.5 rounded text-xs cursor-not-allowed">← Anterior</span>
              )}
              <span className="text-xs text-zinc-400">Página <strong className="text-white">{paginaActual}</strong> de {totalPaginas}</span>
              {paginaActual < totalPaginas ? (
                <Link href={`/animacion?page=${paginaActual + 1}${busqueda ? `&busqueda=${busqueda}` : ''}`} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-xs font-medium">Siguiente →</Link>
              ) : (
                <span className="bg-[#0f1523] border border-zinc-900 text-zinc-700 px-4 py-1.5 rounded text-xs cursor-not-allowed">Siguiente →</span>
              )}
            </div>

          </div>
        </section>
      </div>

      <footer className="w-full border-t border-zinc-900/60 bg-[#030305] py-6 text-center text-xs text-zinc-500">
        <p>CineChapu — Todos los derechos reservados</p>
      </footer>
    </main>
  );
}