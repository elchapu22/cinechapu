import { createClient } from "@libsql/client";
import Link from 'next/link';
import PeliculaCard from '../../components/PeliculaCard';
import VolverSagas from '../../components/VolverSagas';

const sql = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const imagenGenerica = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop";

export default async function DetalleSagaPage({ params }) {
  const resolvedParams = await params;
  const slugCrudo = decodeURIComponent(resolvedParams.slug);

  const nombreSaga = slugCrudo.replace(/-/g, ' ');

  const resultado = await sql.execute({
    sql: `SELECT * FROM peliculas WHERE LOWER(TRIM(id_saga)) = LOWER(TRIM(?))`,
    args: [nombreSaga]
  });

  let peliculas = resultado.rows;

  // ORDENAMIENTO CRONOLOGICO PERFECTO EN JS:
  peliculas.sort((a, b) => {
    const matchA = a.nombre ? a.nombre.match(/\((\d{4})\)\s*$/) : null;
    const matchB = b.nombre ? b.nombre.match(/\((\d{4})\)\s*$/) : null;
    
    const anioA = matchA ? parseInt(matchA[1], 10) : 0;
    const anioB = matchB ? parseInt(matchB[1], 10) : 0;
    
    return anioA - anioB;
  });

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
          <div className="flex items-center gap-4 mb-6">
            <VolverSagas />
          </div>

          <h1 className="text-2xl font-extrabold text-white uppercase tracking-wider mb-2">{nombreSaga}</h1>
          <p className="text-xs text-zinc-400 mb-8">Mostrando <span className="text-white font-bold">{peliculas.length}</span> peliculas de la coleccion.</p>

          {peliculas.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {peliculas.map((pelicula) => (
                <PeliculaCard 
                  key={pelicula.id} 
                  item={JSON.parse(JSON.stringify(pelicula))} 
               />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-zinc-500 bg-[#131b2e]/30 rounded-lg border border-zinc-800/40">
              No se encontraron peliculas para esta saga.
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