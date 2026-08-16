import { createClient } from "@libsql/client";
import Link from 'next/link';
export const dynamic = 'force-dynamic';

const sql = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

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

  const filtroTags = `(LOWER(TRIM(tags)) = 'animacion' OR LOWER(TRIM(tags)) LIKE '%animacion%')`;

  if (busqueda) {
    const resultado = await sql.execute({
      sql: `SELECT * FROM peliculas 
            WHERE (LOWER(tags) LIKE '%infantil%' OR LOWER(tags) LIKE '%anime%' OR LOWER(tags) LIKE '%animacion%' OR LOWER(tags) LIKE '%animacion%')
            AND LOWER(nombre) LIKE ? 
            ORDER BY id LIMIT ? OFFSET ?`,
      args: [`%${busqueda.toLowerCase()}%`, porPagina, offset]
    });
    contenidoPaginado = resultado.rows;

    const totalResultado = await sql.execute({
      sql: `SELECT COUNT(*) as count FROM peliculas 
            WHERE (LOWER(tags) LIKE '%infantil%' OR LOWER(tags) LIKE '%anime%' OR LOWER(tags) LIKE '%animacion%' OR LOWER(tags) LIKE '%animacion%')
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
               OR LOWER(tags) LIKE '%animacion%' 
            ORDER BY id LIMIT 200`,
      args: []
    });
    contenidoPaginado = resultado.rows;

    const totalResultado = await sql.execute({
      sql: `SELECT COUNT(*) as count FROM peliculas 
            WHERE LOWER(tags) LIKE '%infantil%' 
               OR LOWER(tags) LIKE '%anime%' 
               OR LOWER(tags) LIKE '%animacion%' 
               OR LOWER(tags) LIKE '%animacion%'`
    });
    totalContenido = Number(totalResultado.rows[0].count);
  }

  const totalPaginas = Math.ceil(totalContenido / porPagina) || 1;

  // --- 🔥 MAGIA PARA AGRUPAR LAS SAGAS AQUI 🔥 ---
  const peliculasSuelta = [];
  const sagasAgrupadas = {};

  contenidoPaginado.forEach((item) => {
    // Si tiene id_saga (asumiendo que asi se llama tu columna en Turso)
    if (item.id_saga) {
      if (!sagasAgrupadas[item.id_saga]) {
        // Creamos la "Super Tarjeta" para la saga
        sagasAgrupadas[item.id_saga] = {
          esSaga: true, // Etiqueta para saber que es un grupo
          id: item.id_saga,
          // Si tenes el nombre de la saga en la BD ponelo aca. Sino, intentamos deducirlo del nombre:
          nombre: `Coleccion ${limpiarNombre(item.nombre).split(' y ')[0].split(' el ')[0].split(' en ')[0]}`,
          foto: item.foto, // Usamos la foto de la primera peli
          cantidad: 1 // Contador de cuantas pelis encontro de esta saga
        };
      } else {
        // Si ya existe la saga, solo sumamos al contador
        sagasAgrupadas[item.id_saga].cantidad += 1;
      }
    } else {
      // Si no tiene saga, va a las sueltas
      peliculasSuelta.push({ ...item, esSaga: false });
    }
  });

  // Juntamos todo en un solo array final para dibujar en pantalla
  const elementosMostrar = [...Object.values(sagasAgrupadas), ...peliculasSuelta];
  // ------------------------------------------------

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
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/40 text-xs">
            <div className="text-zinc-400">
              <span className="text-red-500 font-semibold mr-2">Catalogo de Animacion e Infantil</span>
              Mostrando <span className="text-white font-bold">{elementosMostrar.length}</span> resultados agrupados
            </div>
          </div>

          {elementosMostrar.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {elementosMostrar.map((item) => (
                <Link 
                  key={item.esSaga ? `saga-${item.id}` : `peli-${item.id}`} 
                  // 👇 Aca mandamos a la ruta de SAGA o de PELICULA dependiendo que sea
                  href={item.esSaga ? `/sagas/${item.id}` : `/pelicula/${item.id}`}
                  className="bg-[#131b2e]/60 rounded-lg overflow-hidden border border-zinc-800/80 transition-all duration-200 hover:scale-105 hover:border-zinc-700 shadow-lg flex flex-col group relative"
                >
                  <div className="aspect-[2/3] w-full bg-zinc-900 relative overflow-hidden">
                    <img src={item.foto || imagenGenerica} alt={item.nombre} className="object-cover w-full h-full group-hover:opacity-90 transition-opacity" />
                    
                    {/* 👇 Etiqueta visual si es una saga agrupada */}
                    {item.esSaga && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-md z-10 border border-red-800">
                        SAGA ({item.cantidad})
                      </div>
                    )}

                  </div>
                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <h3 className="text-[11px] font-medium text-zinc-300 line-clamp-2 leading-snug">
                      {item.esSaga ? item.nombre : limpiarNombre(item.nombre)}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-zinc-500 bg-[#131b2e]/30 rounded-lg border border-zinc-800/40">
              No se encontraron contenidos de animacion.
            </div>
          )}
        </section>
      </div>

      <footer className="w-full border-t border-zinc-800/40 bg-[#090d16] py-6 text-center text-xs text-zinc-500">
        <p>CineChapu — Todos los derechos reservados</p>
      </footer>
    </main>
  );
}