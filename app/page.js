import { db } from "@/lib/db";
import { createClient } from '@libsql/client';
import Link from 'next/link';
import PeliculaCard from './components/PeliculaCard';
import CarruselEstrenos from './components/CarruselEstrenos';
import AppListener from './components/AppListener';
import BienvenidaCanal from './components/BienvenidaCanal';
import PeliculaCardPro from './components/PeliculaCardPro';
export const dynamic = 'force-dynamic';


const imagenGenerica = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop";

const limpiarNombre = (nombre) => {
  if (!nombre) return '';
  return nombre.replace(/\(series\)/gi, '').replace(/\(anime\)/gi, '').replace(/\(infantil\)/gi, '').trim();
};

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const paginaActual = Number(params?.page) || 1;
  const busqueda = params?.busqueda || '';
  const genero = params?.genero || '';
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
    <main className="min-h-screen bg-[#050507] text-white flex flex-col justify-between ...">
      <AppListener />
      <BienvenidaCanal />

      <div>
        <header className="w-full bg-[#030305]/90 border-b border-zinc-800/60 py-3.5 px-6 sticky top-0 z-50 backdrop-blur-xl">
          <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-4">
            
            {/* Logo y Eslogan Minimalista */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/" className="text-xl md:text-2xl font-black tracking-wider text-red-600 flex items-center gap-1.5">
                <span className="bg-red-600 text-white p-1 rounded-md text-xs">🎬</span> CineChapu
              </Link>
            </div>

            {/* Menú de Navegación con Estilo Moderno y Nuevos Íconos */}
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
              <Link href="/animacion" className="px-3 py-1 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all flex items-center gap-1.5">
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
            <form action="/" method="GET" className="relative w-44 sm:w-60 shrink-0">
              <input 
                type="text" 
                name="busqueda" 
                defaultValue={busqueda}
                placeholder="Buscar títulos..." 
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
            <Link href="/animacion" className="px-2.5 py-1 bg-[#111827] rounded-md whitespace-nowrap">⚡ Animación</Link>
            <Link href="/sagas" className="px-2.5 py-1 bg-[#111827] rounded-md whitespace-nowrap">🔮 Sagas</Link>
            <Link href="/favoritos" className="px-2.5 py-1 bg-[#111827] rounded-md whitespace-nowrap">💖 Favoritos</Link>
            <Link href="/actores" className="px-2.5 py-1 bg-[#111827] rounded-md whitespace-nowrap">🎭 Actores</Link>
          </nav>
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
          <div>
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/40 text-xs">
                <div className="text-zinc-400">
                  {busqueda && <span className="mr-2 text-red-500 font-semibold">Buscando: "{busqueda}"</span>}
                  {genero && <span className="mr-2 text-red-500 font-semibold">Coleccion: {genero}</span>}
                  Mostrando <span className="text-white font-bold">{elementosMostrar.length}</span> de <span className="text-white font-bold">{totalPeliculas}</span>
                </div>
                {(busqueda || genero) && (
                  <Link href="/" className="text-xs text-red-400 hover:underline">
                    Limpiar filtros ✕
                  </Link>
                )}
              </div>

              {elementosMostrar.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-4">
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
                      <PeliculaCardPro
                        key={`peli-${item.id}`}
                        pelicula={item} 
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
                    href={`/?${new URLSearchParams({ ...(busqueda && { busqueda }), ...(genero && { genero }), page: paginaActual - 1 })}`}
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
                    href={`/?${new URLSearchParams({ ...(busqueda && { busqueda }), ...(genero && { genero }), page: paginaActual + 1 })}`}
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
          </div>
        </section>
      </div>

      <footer className="w-full border-t border-zinc-900/60 bg-[#030305] py-6 text-center text-xs text-zinc-500">
        <p>CineChapu — Todos los derechos reservados</p>
      </footer>
    </main>
  );
}