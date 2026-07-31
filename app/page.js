import { createClient } from '@libsql/client';
import Link from 'next/link';
import PeliculaCard from './components/PeliculaCard';
import CarruselEstrenos from './components/CarruselEstrenos';

// Configuracion de Turso
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const imagenGenerica = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop";

const limpiarNombre = (nombre) => {
  if (!nombre) return '';
  return nombre.replace(/\(series\)/gi, '').replace(/\(anime\)/gi, '').replace(/\(infantil\)/gi, '').trim();
};

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const paginaActual = Number(params?.page) || 1;
  const busqueda = params?.busqueda || '';
  const letra = params?.letra || '';
  const genero = params?.genero || '';
  const porPagina = 24;
  const offset = (paginaActual - 1) * porPagina;

  let peliculasPaginadas = [];
  let totalPeliculas = 0;

  // Consultas optimizadas con Turso y serializadas a objetos planos
  const ultimasSubidasResult = await db.execute(`
    SELECT * FROM peliculas 
    ORDER BY id DESC 
    LIMIT 15
  `);
  const ultimasSubidas = JSON.parse(JSON.stringify(ultimasSubidasResult.rows));

  if (busqueda) {
    const resPeli = await db.execute({
      sql: `SELECT * FROM peliculas WHERE LOWER(nombre) LIKE ? ORDER BY id LIMIT ? OFFSET ?`,
      args: [`%${busqueda.toLowerCase()}%`, porPagina, offset]
    });
    peliculasPaginadas = JSON.parse(JSON.stringify(resPeli.rows));

    const resTotal = await db.execute({
      sql: `SELECT COUNT(*) as count FROM peliculas WHERE LOWER(nombre) LIKE ?`,
      args: [`%${busqueda.toLowerCase()}%`]
    });
    totalPeliculas = Number(resTotal.rows[0].count);

  } else if (genero) {
    const resPeli = await db.execute({
      sql: `SELECT * FROM peliculas WHERE tags LIKE ? ORDER BY id LIMIT ? OFFSET ?`,
      args: [`%${genero}%`, porPagina, offset]
    });
    peliculasPaginadas = JSON.parse(JSON.stringify(resPeli.rows));

    const resTotal = await db.execute({
      sql: `SELECT COUNT(*) as count FROM peliculas WHERE tags LIKE ?`,
      args: [`%${genero}%`]
    });
    totalPeliculas = Number(resTotal.rows[0].count);

  } else if (letra) {
    const resPeli = await db.execute({
      sql: `SELECT * FROM peliculas WHERE LOWER(nombre) LIKE ? ORDER BY id LIMIT ? OFFSET ?`,
      args: [`${letra.toLowerCase()}%`, porPagina, offset]
    });
    peliculasPaginadas = JSON.parse(JSON.stringify(resPeli.rows));

    const resTotal = await db.execute({
      sql: `SELECT COUNT(*) as count FROM peliculas WHERE LOWER(nombre) LIKE ?`,
      args: [`${letra.toLowerCase()}%`]
    });
    totalPeliculas = Number(resTotal.rows[0].count);

  } else {
    const resPeli = await db.execute({
      sql: `SELECT * FROM peliculas ORDER BY id LIMIT ? OFFSET ?`,
      args: [porPagina, offset]
    });
    peliculasPaginadas = JSON.parse(JSON.stringify(resPeli.rows));

    const resTotal = await db.execute(`SELECT COUNT(*) as count FROM peliculas`);
    totalPeliculas = Number(resTotal.rows[0].count);
  }

  const totalPaginas = Math.ceil(totalPeliculas / porPagina) || 1;

  return (
    <main className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between selection:bg-red-600 selection:text-white">
      <div>
        <header className="w-full bg-[#070b14] border-b border-zinc-800/80 pt-8 pb-6 px-6 relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto flex flex-col items-center text-center">
            <Link href="/" className="text-2xl md:text-3xl font-black tracking-widest text-red-600 mb-2">CineChapu</Link>
            <p className="text-zinc-400 text-xs md:text-sm mb-6 font-medium">Peliculas, Series & Animes</p>
            
            <form action="/" method="GET" className="w-full max-w-2xl relative mb-6">
              <input 
                type="text" 
                name="busqueda" 
                defaultValue={busqueda}
                placeholder="Search..." 
                className="w-full bg-[#111a2e] border border-zinc-700/80 rounded-full px-6 py-3 text-sm text-zinc-200 focus:outline-none focus:border-red-600 transition-colors shadow-2xl pl-6 pr-12"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer">
                🔍
              </button>
            </form>

            <nav className="flex items-center gap-8 text-sm text-zinc-300 font-medium">
              <Link href="/" className="hover:text-red-500 transition-colors flex items-center gap-1.5">🏠 Inicio</Link>
              <Link href="/peliculas" className="hover:text-red-500 transition-colors flex items-center gap-1.5">🎬 Peliculas</Link>
              <Link href="/series" className="hover:text-red-500 transition-colors flex items-center gap-1.5">📺 Series</Link>
              <Link href="/animacion" className="hover:text-red-500 transition-colors flex items-center gap-1.5">🚀 Animacion</Link>
            </nav>
          </div>
        </header>

        <section className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-lg">📅</span>
              <h2 className="text-white font-bold text-lg md:text-xl tracking-wide">Ultimas peliculas subidas al canal</h2>
            </div>
          </div>

          <CarruselEstrenos 
            ultimasSubidas={ultimasSubidas} 
            imagenGenerica={imagenGenerica} 
          />
        </section>

        <section className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/40 text-xs">
                <div className="text-zinc-400">
                  {busqueda && <span className="mr-2 text-red-500 font-semibold">Buscando: "{busqueda}"</span>}
                  {letra && <span className="mr-2 text-red-500 font-semibold">Letra: {letra.toUpperCase()}</span>}
                  {genero && <span className="mr-2 text-red-500 font-semibold">Genero: {genero}</span>}
                  Mostrando <span className="text-white font-bold">{peliculasPaginadas.length}</span> de <span className="text-white font-bold">{totalPeliculas}</span> resultados
                </div>
                {(busqueda || letra || genero) && (
                  <Link href="/" className="text-xs text-red-400 hover:underline">
                    Limpiar filtros ✕
                  </Link>
                )}
              </div>

              {peliculasPaginadas.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {peliculasPaginadas.map((item) => (
                    <PeliculaCard 
                      key={item.id} 
                      item={item} 
                      imagenGenerica={imagenGenerica} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-zinc-500 bg-[#131b2e]/30 rounded-lg border border-zinc-800/40">
                  No se encontraron peliculas.
                </div>
              )}

              <div className="flex items-center justify-center gap-4 mt-8 py-4">
                {paginaActual > 1 ? (
                  <Link 
                    href={`/?${new URLSearchParams({ ...(busqueda && { busqueda }), ...(letra && { letra }), ...(genero && { genero }), page: paginaActual - 1 })}`}
                    className="px-4 py-2 bg-[#131b2e] border border-zinc-800 rounded-lg text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
                  >
                    ← Anterior
                  </Link>
                ) : (
                  <span className="px-4 py-2 bg-[#131b2e]/40 border border-zinc-900 rounded-lg text-xs text-zinc-600 cursor-not-allowed">
                    ← Anterior
                  </span>
                )}

                <span className="text-xs text-zinc-400 font-medium">
                  Pagina <span className="text-white font-bold">{paginaActual}</span> de <span className="text-white font-bold">{totalPaginas}</span>
                </span>

                {paginaActual < totalPaginas ? (
                  <Link 
                    href={`/?${new URLSearchParams({ ...(busqueda && { busqueda }), ...(letra && { letra }), ...(genero && { genero }), page: paginaActual + 1 })}`}
                    className="px-4 py-2 bg-[#131b2e] border border-zinc-800 rounded-lg text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
                  >
                    Siguiente →
                  </Link>
                ) : (
                  <span className="px-4 py-2 bg-[#131b2e]/40 border border-zinc-900 rounded-lg text-xs text-zinc-600 cursor-not-allowed">
                    Siguiente →
                  </span>
                )}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#131b2e]/40 border border-zinc-800/80 rounded-xl p-4 shadow-xl">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Generos Populares</h3>
                <div className="flex flex-wrap gap-2">
                  {["Accion", "Comedia", "Drama", "Terror", "Aventura", "Ciencia Ficcion", "Suspenso", "Animacion"].map((gen) => (
                    <Link
                      key={gen}
                      href={`/?genero=${gen}`}
                      className="bg-[#1a2540] hover:bg-red-600 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-zinc-700/50"
                    >
                      {gen}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-[#131b2e]/40 border border-zinc-800/80 rounded-xl p-4 shadow-xl">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Filtrar por Letra</h3>
                <div className="grid grid-cols-6 gap-1.5">
                  {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => (
                    <Link
                      key={l}
                      href={`/?letra=${l}`}
                      className="h-8 flex items-center justify-center bg-[#1a2540] hover:bg-red-600 text-zinc-300 hover:text-white rounded text-xs font-bold transition-colors border border-zinc-700/50"
                    >
                      {l}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="w-full border-t border-zinc-800/40 bg-[#070b14] py-6 text-center text-xs text-zinc-500">
        <p>CineChapu — Todos los derechos reservados</p>
      </footer>
    </main>
  );
}