import { createClient } from "@libsql/client";
import Link from 'next/link';

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

  if (busqueda) {
    const resultado = await sql.execute({
      sql: `SELECT * FROM peliculas 
            WHERE (LOWER(tags) LIKE '%infantil%' OR LOWER(tags) LIKE '%anime%' OR LOWER(tags) LIKE '%animacion%' OR LOWER(tags) LIKE '%animación%')
            AND LOWER(nombre) LIKE ? 
            ORDER BY id LIMIT ? OFFSET ?`,
      args: [`%${busqueda.toLowerCase()}%`, porPagina, offset]
    });
    contenidoPaginado = resultado.rows;

    const totalResultado = await sql.execute({
      sql: `SELECT COUNT(*) as count FROM peliculas 
            WHERE (LOWER(tags) LIKE '%infantil%' OR LOWER(tags) LIKE '%anime%' OR LOWER(tags) LIKE '%animacion%' OR LOWER(tags) LIKE '%animación%')
            AND LOWER(nombre) LIKE ?`,
      args: [`%${busqueda.toLowerCase()}%`]
    });
    totalContenido = Number(totalResultado.rows[0].count);
  } else {
    const resultado = await sql.execute({
      sql: `SELECT * FROM peliculas 
            WHERE LOWER(tags) LIKE '%infantil%' OR LOWER(tags) LIKE '%anime%' OR LOWER(tags) LIKE '%animacion%' OR LOWER(tags) LIKE '%animación%' 
            ORDER BY id LIMIT ? OFFSET ?`,
      args: [porPagina, offset]
    });
    contenidoPaginado = resultado.rows;

    const totalResultado = await sql.execute({
      sql: `SELECT COUNT(*) as count FROM peliculas 
            WHERE LOWER(tags) LIKE '%infantil%' OR LOWER(tags) LIKE '%anime%' OR LOWER(tags) LIKE '%animacion%' OR LOWER(tags) LIKE '%animación%'`
    });
    totalContenido = Number(totalResultado.rows[0].count);
  }

  const totalPaginas = Math.ceil(totalContenido / porPagina) || 1;

  return (
    <main className="min-h-screen bg-[#090d16] text-white flex flex-col justify-between selection:bg-red-600 selection:text-white">
      <div>
        <header className="w-full border-b border-zinc-800/60 bg-[#090d16]/90 backdrop-blur sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="text-xl font-black tracking-widest text-red-600">NETFLIX PRIVADO</Link>
            <nav className="flex items-center gap-6 text-xs md:text-sm text-zinc-400 font-medium">
              <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
              <Link href="/peliculas" className="hover:text-white transition-colors">Películas</Link>
              <Link href="/series" className="hover:text-white transition-colors">Series</Link>
              <Link href="/animacion" className="text-white hover:text-red-500 transition-colors">Animacion</Link>
            </nav>
            <form action="/animacion" method="GET" className="w-full md:w-72">
              <input 
                type="text" 
                name="busqueda" 
                defaultValue={busqueda}
                placeholder="Buscar animación..." 
                className="w-full bg-[#131b2e] border border-zinc-800 rounded-full px-4 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-600 transition-colors"
              />
            </form>
          </div>
        </header>

        <section className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/40 text-xs">
            <div className="text-zinc-400">
              <span className="text-red-500 font-semibold mr-2">Catálogo de Animación e Infantil</span>
              Mostrando <span className="text-white font-bold">{contenidoPaginado.length}</span> de <span className="text-white font-bold">{totalContenido}</span>
            </div>
          </div>

          {contenidoPaginado.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {contenidoPaginado.map((item) => (
                <Link 
                  key={item.id} 
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
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-zinc-500 bg-[#131b2e]/30 rounded-lg border border-zinc-800/40">
              No se encontraron contenidos de animación.
            </div>
          )}
        </section>
      </div>

      <footer className="w-full border-t border-zinc-800/40 bg-[#090d16] py-6 text-center text-xs text-zinc-500">
        <p>NETFLIX PRIVADO — Todos los derechos reservados</p>
      </footer>
    </main>
  );
}