import { createClient } from "@libsql/client";
import Link from 'next/link';

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

  // --- 🔥 MAGIA PARA AGRUPAR LAS SAGAS Y COMPLETAR EXACTAMENTE 24 TARJETAS 🔥 ---
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
  // ------------------------------------------------------------------------

  return (
    <main className="min-h-screen bg-[#090d16] text-white flex flex-col justify-between selection:bg-red-600 selection:text-white">
      <div>
        <header className="w-full border-b border-zinc-800/60 bg-[#090d16]/90 backdrop-blur sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="text-xl font-black tracking-widest text-red-600">CineChapu</Link>
            <nav className="flex items-center gap-6 text-xs md:text-sm text-zinc-400 font-medium">
              <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
              <Link href="/peliculas" className="text-white hover:text-red-500 transition-colors">Peliculas</Link>
              <Link href="/series" className="hover:text-white transition-colors">Series</Link>
              <Link href="/animacion" className="hover:text-white transition-colors">Animacion</Link>
            </nav>
            <form action="/peliculas" method="GET" className="w-full md:w-72">
              <input 
                type="text" 
                name="busqueda" 
                defaultValue={busqueda}
                placeholder="Buscar pelicula..." 
                className="w-full bg-[#131b2e] border border-zinc-800 rounded-full px-4 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-600 transition-colors"
              />
            </form>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {elementosMostrar.map((item) => (
                    item.esSaga ? (
                      /* 👇 Tarjeta especial para Sagas */
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
                      /* 👇 Tarjeta normal de película */
                      <Link 
                        key={`pelicula-${item.id}`} 
                        href={`/pelicula/${item.id}`}
                        className="bg-[#131b2e]/60 rounded-lg overflow-hidden border border-zinc-800/80 transition-all duration-200 hover:scale-105 hover:border-zinc-700 shadow-lg flex flex-col group"
                      >
                        <div className="aspect-[2/3] w-full bg-zinc-900 relative overflow-hidden">
                          <img src={item.foto || imagenGenerica} alt={item.nombre} className="object-cover w-full h-full group-hover:opacity-90 transition-opacity" />
                        </div>
                        <div className="p-2.5 flex-1 flex flex-col justify-between">
                          <h3 className="text-[11px] font-medium text-zinc-300 line-clamp-2 leading-snug">{limpiarNombre(item.nombre)}</h3>
                        </div>
                      </Link>
                    )
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

            <aside className="w-full lg:w-72 shrink-xl flex flex-col gap-6 sticky top-24">
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