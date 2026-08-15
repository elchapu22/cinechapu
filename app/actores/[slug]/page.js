import { createClient } from '@libsql/client';
import Link from 'next/link';
import PeliculaCard from '../../components/PeliculaCard';

const db = createClient({
  url: "libsql://catalogo-peliculas-chapu.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODUzOTQxNDUsImlkIjoiMDE5ZmIxYzUtMzYwMS03YmM0LTk4ZGYtNWYzNDg4Y2FhZWRjIiwia2lkIjoiOVBRb1FvLUMtdzh5bWFQeWt5dlI3WnBWUXY1ck10M3I4VVdkUHJuakRMUSIsInJpZCI6IjU4ZmJkMDljLWNlMmUtNGJjZS04YjU1LTdkNDUyOTgzYWIxMyJ9.Q80179N0HQxJCmS1H6gsng_iRYPOEx4hXZC6YTZ5uvBhynpgd9Q9wpx90hPB1hZxVnB_MW6vnareXzdZXfU1Dg"
});

export default async function PeliculasPorActor({ params }) {
  const resolvedParams = await params;
  const actorSlug = decodeURIComponent(resolvedParams.slug);

  // Buscamos las películas que contengan al actor en su campo de actores
  const resultado = await db.execute({
    sql: `SELECT * FROM peliculas WHERE actores LIKE ?`,
    args: [`%${actorSlug}%`]
  });

  const peliculas = resultado.rows;

  return (
    <main className="min-h-screen bg-[#141414] text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <Link href="/actores" className="text-xs text-red-500 hover:underline mb-1 inline-block">
            ← Volver a la lista de actores
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">Películas con <span className="text-red-600">{actorSlug}</span></h1>
          <p className="text-xs text-zinc-400 mt-1">Mostrando {peliculas.length} películas</p>
        </div>
        <Link href="/" className="text-sm text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg transition-colors">
          🏠 Inicio
        </Link>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {peliculas.map((pelicula) => (
          <PeliculaCard 
            key={pelicula.id} 
            item={JSON.parse(JSON.stringify(pelicula))} 
          />
        ))}
      </div>
    </main>
  );
}