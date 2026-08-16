import { createClient } from "@libsql/client";
import Link from 'next/link';
import PeliculaCard from '../components/PeliculaCard';


const limpiarNombre = (nombre) => {
  if (!nombre) return '';
  return nombre
    .replace(/\(series\)/gi, '')
    .replace(/\(anime\)/gi, '')
    .replace(/\(infantil\)/gi, '')
    .trim();
};

const sql = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const imagenGenerica = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop";

export default async function PeliculasPage({ searchParams }) {
  const params = await searchParams;
  const paginaActual = Number(params?.page) || 1;
  const busqueda = params?.busqueda || '';
  const letra = params?.letra || '';
  const porPagina = 24;
  const offset = (paginaActual - 1) * porPagina;

  let peliculasPaginadas = [];
  let totalPeliculas = 0;

  if (busqueda) {
    const resultado = await sql.execute({
      sql: "SELECT * FROM peliculas WHERE LOWER(nombre) NOT LIKE '%(series)%' AND LOWER(nombre) LIKE ? ORDER BY id DESC LIMIT 50 OFFSET ?",
      args: [`%${busqueda.toLowerCase()}%`, offset]
    });
    peliculasPaginadas = resultado.rows;

    const totalResultado = await sql.execute({
      sql: "SELECT COUNT(*) as count FROM peliculas WHERE LOWER(nombre) NOT LIKE '%(series)%' AND LOWER(nombre) LIKE ?",
      args: [`%${busqueda.toLowerCase()}%`]
    });
    totalPeliculas = Number(totalResultado.rows[0].count);
  } else if (letra) {
    const resultado = await sql.execute({
      sql: "SELECT * FROM peliculas WHERE LOWER(nombre) NOT LIKE '%(series)%' AND LOWER(nombre) LIKE ? ORDER BY id DESC LIMIT 50 OFFSET ?",
      args: [`${letra.toLowerCase()}%`, offset]
    });
    peliculasPaginadas = resultado.rows;

    const totalResultado = await sql.execute({
      sql: "SELECT COUNT(*) as count FROM peliculas WHERE LOWER(nombre) NOT LIKE '%(series)%' AND LOWER(nombre) LIKE ?",
      args: [`${letra.toLowerCase()}%`]
    });
    totalPeliculas = Number(totalResultado.rows[0].count);
  } else {
    const resultado = await sql.execute({
      sql: "SELECT * FROM peliculas WHERE LOWER(nombre) NOT LIKE '%(series)%' ORDER BY id DESC LIMIT 50 OFFSET ?",
      args: [offset]
    });
    peliculasPaginadas = resultado.rows;

    const totalResultado = await sql.execute({
      sql: "SELECT COUNT(*) as count FROM peliculas WHERE LOWER(nombre) NOT LIKE '%(series)%'"
    });
    totalPeliculas = Number(totalResultado.rows[0].count);
  }

  const totalPaginas = Math.ceil(totalPeliculas / porPagina) || 1;
  const abecedario = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const peliculasSuelta = [];
  const sagasAgrupadas = {};

  peliculasPaginadas.forEach((item) => {
    if (item.id_saga) {
      if (!sagasAgrupadas[item.id_saga]) {
        sagasAgrupadas[item.id_saga] = {
          esSaga: true,
          id: item.id_saga,
          nombre: `Colección ${limpiarNombre(item.nombre).split(' - ')[0].split(' | ')[0]}`,
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

  const elementosMostrar = [...Object.values(sagasAgrupadas), ...peliculasSuelta].slice(0, porPagina);

  return (
    <main className="min-h-screen bg-[#090d16] text-white flex flex-col justify-between selection:bg-red-600 selection:text-white">
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

            <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs md:text-sm text-zinc-400 font-medium my-4">
              <Link href="/" className="hover:text-white transition-colors">🏠 Inicio</Link>
              <Link href="/peliculas" className="hover:text-white transition-colors">🎬 Peliculas</Link>
              <Link href="/series" className="hover:text-white transition-colors">📺 Series</Link>
              <Link href="/animacion" className="hover:text-white transition-colors">🚀 Animacion</Link>
              <Link href="/sagas" className="hover:text-white transition-colors">🔥 Sagas</Link>
              <Link href="/favoritos" className="hover:text-white transition-colors">❤️ Favoritos</Link>
              <Link href="/actores">🎭Actores</Link>
            </nav>
          </div>
        </header>

        <section className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/40 text-xs">
                <div className="text-zinc-400">
                  <span className="text-red-500 font-semibold mr-2">Catalogo de Peliculas</span>
                  Mostrando <span className="text-white font-bold">{elementosMostrar.length}</span> de <span className="text-white font-bold">{totalPeliculas}</span>
                </div>
                {(busqueda || letra) && (
                  <Link href="/peliculas" className="text-xs text-red-400 hover:underline">Limpiar filtros ✕</Link>
                )}
              </div>

              {elementosMostrar.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {elementosMostrar.map((item) => (
                    <PeliculaCard 
                      key={item.esSaga ? `saga-${item.id}` : `pelicula-${item.id}`} 
                      item={{ 
                          ...item, 
                          nombre: item.esSaga ? item.nombre : limpiarNombre(item.nombre) 
                      }} 
                      imagenGenerica={imagenGenerica}
                      esSaga={item.esSaga}
                      cantidadSaga={item.cantidad}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-zinc-500 bg-[#131b2e]/30 rounded-lg border border-zinc-800/40">
                  No se encontraron peliculas.
                </div>
              )}

              <div className="flex justify-center items-center gap-3 mt-12 mb-8">
                {paginaActual > 1 ? (
                  <Link href={`/peliculas?page=${paginaActual - 1}${busqueda ? `&busqueda=${busqueda}` : ''}${letra ? `&letra=${letra}` : ''}`} className="bg-[#131b2e] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-4 py-1.5 rounded text-xs font-medium">← Anterior</Link>
                ) : (
                  <span className="bg-[#0f1523] border border-zinc-900 text-zinc-700 px-4 py-1.5 rounded text-xs cursor-not-allowed">← Anterior</span>
                )}
                <span className="text-xs text-zinc-400">Pagina <strong className="text-white">{paginaActual}</strong> de {totalPaginas}</span>
                {paginaActual < totalPaginas ? (
                  <Link href={`/peliculas?page=${paginaActual + 1}${busqueda ? `&busqueda=${busqueda}` : ''}${letra ? `&letra=${letra}` : ''}`} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-xs font-medium">Siguiente →</Link>
                ) : (
                  <span className="bg-[#0f1523] border border-zinc-900 text-zinc-700 px-4 py-1.5 rounded text-xs cursor-not-allowed">Siguiente →</span>
                )}
              </div>
            </div>

            <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6 sticky top-24">
              <div className="bg-[#131b2e]/50 border border-zinc-800/80 rounded-xl p-4 shadow-lg backdrop-blur">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 pb-2 border-b border-zinc-800">Filtrar por Letra</h3>
                <div className="grid grid-cols-6 gap-1.5">
                  {abecedario.map((l) => (
                    <Link key={l} href={`/peliculas?letra=${l}`} className={`text-center text-xs font-bold py-1.5 rounded transition-colors ${letra === l ? 'bg-red-600 text-white' : 'bg-[#090d16] hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300'}`}>
                      {l}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>

      <footer className="w-full border-t border-zinc-800/40 bg-[#090d16] py-6 text-center text-xs text-zinc-500">
        <p>CineChapu — Todos los derechos reservados</p>
      </footer>
    </main>
  );
}