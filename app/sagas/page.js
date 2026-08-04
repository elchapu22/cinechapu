import { createClient } from "@libsql/client";
import Link from 'next/link';

const sql = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const imagenGenerica = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop";

export default async function SagasPage() {
  const resultado = await sql.execute({
    sql: `SELECT * FROM peliculas WHERE id_saga IS NOT NULL AND TRIM(id_saga) != '' ORDER BY id_saga, id`
  });
  
  const peliculas = resultado.rows;

  const sagasAgrupadas = peliculas.reduce((acc, pelicula) => {
    const saga = pelicula.id_saga.trim();
    if (!acc[saga]) {
      acc[saga] = {
        nombre: saga,
        peliculas: [],
        portada: pelicula.foto || imagenGenerica
      };
    }
    acc[saga].peliculas.push(pelicula);
    if (acc[saga].portada === imagenGenerica && pelicula.foto) {
      acc[saga].portada = pelicula.foto;
    }
    return acc;
  }, {});

  const listaSagas = Object.values(sagasAgrupadas);

  return (
    <main className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between selection:bg-red-600 selection:text-white">
      <div>
        <header className="w-full bg-[#070b14] border-b border-zinc-800/80 pt-8 pb-6 px-6 relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto flex flex-col items-center text-center">
            <Link href="/" className="text-2xl md:text-3xl font-black tracking-widest text-red-600 mb-2">CineChapu</Link>
            <p className="text-zinc-400 text-xs md:text-sm mb-6 font-medium">Peliculas, Series & Animes</p>
            
            <nav className="flex items-center justify-center gap-6 text-xs md:text-sm text-zinc-400 font-medium my-4">
              <Link href="/" className="hover:text-white transition-colors">🏠 Inicio</Link>
              <Link href="/peliculas" className="hover:text-white transition-colors">🎬 Peliculas</Link>
              <Link href="/series" className="hover:text-white transition-colors">📺 Series</Link>
              <Link href="/animacion" className="hover:text-white transition-colors">🚀 Animacion</Link>
              <Link href="/sagas" className="text-white font-bold transition-colors">🔥 Sagas</Link>
            </nav>
          </div>
        </header>

        <section className="max-w-[1400px] mx-auto px-6 py-8">
          <h1 className="text-xl font-bold text-red-500 mb-6">Coleccion de Sagas</h1>

          {listaSagas.length > 0 ? (
            // Identico a la grilla de la pagina principal: 6 columnas en lg
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {listaSagas.map((saga) => (
                <Link 
                  key={saga.nombre} 
                  href={`/sagas/${encodeURIComponent(saga.nombre)}`}
                  className="bg-[#131b2e]/60 rounded-lg overflow-hidden border border-zinc-800/80 transition-all duration-200 hover:scale-105 hover:border-zinc-700 shadow-lg flex flex-col group"
                >
                  <div className="aspect-[2/3] w-full bg-zinc-900 relative overflow-hidden">
                    <img 
                      src={saga.portada} 
                      alt={saga.nombre} 
                      className="object-cover w-full h-full group-hover:opacity-90 transition-opacity" 
                    />
                  </div>
                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <h3 className="text-[11px] font-bold text-zinc-200 uppercase tracking-wide truncate leading-snug">
                      {saga.nombre}
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      {saga.peliculas.length} peliculas
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-zinc-500 bg-[#131b2e]/30 rounded-lg border border-zinc-800/40">
              No se encontraron sagas cargadas.
            </div>
          )}
        </section>
      </div>

      <footer className="w-full border-t border-zinc-800/40 bg-[#070b14] py-6 text-center text-xs text-zinc-500">
        <p>CineChapu — Todos los derechos reservados</p>
      </footer>
    </main>
  );
}