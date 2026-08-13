import { createClient } from '@libsql/client';
import Link from 'next/link';
import PeliculaCard from './components/PeliculaCard';
import CarruselEstrenos from './components/CarruselEstrenos';
import AppListener from './components/AppListener';
import BienvenidaCanal from './components/BienvenidaCanal';

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
  const anio = params?.anio || '';
  const porPagina = 24;
  const offset = (paginaActual - 1) * porPagina;

  let peliculasPaginadas = [];
  let totalPeliculas = 0;

  const ultimasSubidasResult = await db.execute(`
    SELECT * FROM peliculas 
    ORDER BY RANDOM() 
    LIMIT 50
  `);
  const ultimasSubidas = JSON.parse(JSON.stringify(ultimasSubidasResult.rows));

  let tagBusqueda = "";
  if (genero === "Charlie Chaplin") {
    tagBusqueda = "chaplin";
  } else if (genero === "Cantinflas") {
    tagBusqueda = "cantinflas";
  } else if (genero === "Pedro Infante") {
    tagBusqueda = "pedro-infante";
  } else if (genero === "Elvis Presley") {
    tagBusqueda = "elvis";
  } else if (genero === "Mundial 2026") {
    tagBusqueda = "mundial-2026";
  } else {
    tagBusqueda = genero;
  }

if (busqueda) {
    const resPeli = await db.execute({
      sql: `SELECT * FROM peliculas WHERE LOWER(nombre) LIKE ? ORDER BY id LIMIT 50 OFFSET ?`,
      args: [`%${busqueda.toLowerCase()}%`, offset]
    });
    peliculasPaginadas = JSON.parse(JSON.stringify(resPeli.rows));

    const resTotal = await db.execute({
      sql: `SELECT COUNT(*) as count FROM peliculas WHERE LOWER(nombre) LIKE ?`,
      args: [`%${busqueda.toLowerCase()}%`]
    });
    totalPeliculas = Number(resTotal.rows[0].count);

  } else if (genero) {
    const resPeli = await db.execute({
      sql: `SELECT * FROM peliculas WHERE tags LIKE ? ORDER BY id LIMIT 50 OFFSET ?`,
      args: [`%${tagBusqueda}%`, offset]
    });
    peliculasPaginadas = JSON.parse(JSON.stringify(resPeli.rows));

    const resTotal = await db.execute({
      sql: `SELECT COUNT(*) as count FROM peliculas WHERE tags LIKE ?`,
      args: [`%${tagBusqueda}%`]
    });
    totalPeliculas = Number(resTotal.rows[0].count);

  } else if (letra) {
    const resPeli = await db.execute({
      sql: `SELECT * FROM peliculas WHERE LOWER(nombre) LIKE ? ORDER BY id LIMIT 50 OFFSET ?`,
      args: [`${letra.toLowerCase()}%`, offset]
    });
    peliculasPaginadas = JSON.parse(JSON.stringify(resPeli.rows));

    const resTotal = await db.execute({
      sql: `SELECT COUNT(*) as count FROM peliculas WHERE LOWER(nombre) LIKE ?`,
      args: [`${letra.toLowerCase()}%`]
    });
    totalPeliculas = Number(resTotal.rows[0].count);

  } else if (anio) {
    const resPeli = await db.execute({
      sql: `SELECT * FROM peliculas WHERE nombre LIKE ? ORDER BY id LIMIT 50 OFFSET ?`,
      args: [`%(${anio})`, offset]
    });
    peliculasPaginadas = JSON.parse(JSON.stringify(resPeli.rows));

    const resTotal = await db.execute({
      sql: `SELECT COUNT(*) as count FROM peliculas WHERE nombre LIKE ?`,
      args: [`%(${anio})`]
    });
    totalPeliculas = Number(resTotal.rows[0].count);

  } else {
    const resPeli = await db.execute({
      sql: `
        SELECT * FROM peliculas 
        ORDER BY 
          CASE 
            WHEN nombre LIKE '%(2026)%' THEN 1 
            WHEN nombre LIKE '%(2025)%' THEN 2 
            ELSE 3 
          END, 
          RANDOM() 
        LIMIT 50 OFFSET ?
      `,
      args: [offset]
    });
    peliculasPaginadas = JSON.parse(JSON.stringify(resPeli.rows));

    const resTotal = await db.execute(`SELECT COUNT(*) as count FROM peliculas`);
    totalPeliculas = Number(resTotal.rows[0].count);
  }

  const totalPaginas = Math.ceil(totalPeliculas / porPagina) || 1;

  const todosLosNombresRes = await db.execute(`SELECT nombre FROM peliculas`);
  const todosLosNombres = JSON.parse(JSON.stringify(todosLosNombresRes.rows));

  const anosDisponibles = [...new Set(
    todosLosNombres.map(p => {
      const match = p.nombre ? p.nombre.match(/\((\d{4})\)$/) : null;
      return match ? match[1] : null;
    }).filter(Boolean)
  )].sort((a, b) => b - a);

  const peliculasSuelta = [];
  const sagasAgrupadas = {};

  peliculasPaginadas.forEach((item) => {
    if (item.id_saga) {
      if (!sagasAgrupadas[item.id_saga]) {
        sagasAgrupadas[item.id_saga] = {
          esSaga: true,
          id: item.id_saga,
          nombre: `Coleccion ${limpiarNombre(item.nombre).split(' - ')[0].split(' | ')[0]}`,
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
    <main className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between selection:bg-red-600 selection:text-white overflow-x-hidden w-full max-w-full">
      <AppListener />
      <BienvenidaCanal />

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

            <nav className="flex items-center justify-center gap-6 text-xs md:text-sm text-zinc-400 font-medium my-4">
              <Link href="/" className="hover:text-white transition-colors">🏠 Inicio</Link>
              <Link href="/peliculas" className="hover:text-white transition-colors">🎬 Peliculas</Link>
              <Link href="/series" className="hover:text-white transition-colors">📺 Series</Link>
              <Link href="/animacion" className="hover:text-white transition-colors">🚀 Animacion</Link>
              <Link href="/sagas" className="hover:text-white transition-colors">🔥 Sagas</Link>
              <Link href="/favoritos" className="hover:text-white transition-colors">❤️ Favoritos</Link>
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
                  {genero && <span className="mr-2 text-red-500 font-semibold">Coleccion: {genero}</span>}
                  {anio && <span className="mr-2 text-red-500 font-semibold">Año: {anio}</span>}
                  Mostrando <span className="text-white font-bold">{elementosMostrar.length}</span> de <span className="text-white font-bold">{totalPeliculas}</span>
                </div>
                {(busqueda || letra || genero || anio) && (
                  <Link href="/" className="text-xs text-red-400 hover:underline">
                    Limpiar filtros ✕
                  </Link>
                )}
              </div>

              {elementosMostrar.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {elementosMostrar.map((item) => (
                    item.esSaga ? (
                      <Link 
                        key={`saga-${item.id}`}
                        href={`/sagas/${item.id}`}
                        className="bg-[#131b2e]/60 rounded-lg overflow-hidden border border-zinc-800/80 transition-all duration-200 hover:scale-105 hover:border-zinc-700 shadow-lg flex flex-col group relative"
                      >
                        <div className="aspect-[2/3] w-full bg-zinc-900 relative overflow-hidden">
                          <img src={item.foto || imagenGenerica} alt={item.nombre} className="object-cover w-full h-full group-hover:opacity-90 transition-opacity" />
                          <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-md z-10 border border-red-800">
                            SAGA ({item.cantidad})
                          </div>
                        </div>
                        <div className="p-2.5 flex-1 flex flex-col justify-between">
                          <h3 className="text-[11px] font-medium text-zinc-300 line-clamp-2 leading-snug">{item.nombre}</h3>
                        </div>
                      </Link>
                    ) : (
                      <PeliculaCard 
                        key={`peli-${item.id}`} 
                        item={item} 
                        imagenGenerica={imagenGenerica} 
                      />
                    )
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
                    href={`/?${new URLSearchParams({ ...(busqueda && { busqueda }), ...(letra && { letra }), ...(genero && { genero }), ...(anio && { anio }), page: paginaActual - 1 })}`}
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
                    href={`/?${new URLSearchParams({ ...(busqueda && { busqueda }), ...(letra && { letra }), ...(genero && { genero }), ...(anio && { anio }), page: paginaActual + 1 })}`}
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
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Colecciones Populares</h3>
                <div className="flex flex-wrap gap-2">
                  {["Cantinflas", "Pedro Infante", "Charlie Chaplin", "Elvis Presley", "Mundial 2026"].map((coleccion) => (
                    <Link
                      key={coleccion}
                      href={`/?genero=${coleccion}`}
                      className="bg-[#1a2540] hover:bg-red-600 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-zinc-700/50"
                    >
                      {coleccion}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-[#131b2e]/40 border border-zinc-800/80 rounded-xl p-4 shadow-xl">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Filtrar por Año</h3>
                <div className="flex flex-wrap gap-1.5">
                  {anosDisponibles.map((a) => (
                    <Link
                      key={a}
                      href={`/?anio=${a}`}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-colors border ${
                        anio === a 
                          ? 'bg-red-600 text-white border-red-500' 
                          : 'bg-[#1a2540] hover:bg-red-600 text-zinc-300 hover:text-white border-zinc-700/50'
                      }`}
                    >
                      {a}
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