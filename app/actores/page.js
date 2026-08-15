import { createClient } from '@libsql/client';
import Link from 'next/link';
import BuscadorActores from './BuscadorActores';

const db = createClient({
  url: "libsql://catalogo-peliculas-chapu.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODUzOTQxNDUsImlkIjoiMDE5ZmIxYzUtMzYwMS03YmM0LTk4ZGYtNWYzNDg4Y2FhZWRjIiwia2lkIjoiOVBRb1FvLUMtdzh5bWFQeWt5dlI3WnBWUXY1ck10M3I4VVdkUHJuakRMUSIsInJpZCI6IjU4ZmJkMDljLWNlMmUtNGJjZS04YjU1LTdkNDUyOTgzYWIxMyJ9.Q80179N0HQxJCmS1H6gsng_iRYPOEx4hXZC6YTZ5uvBhynpgd9Q9wpx90hPB1hZxVnB_MW6vnareXzdZXfU1Dg"
});

export default async function ActoresPage() {
  // Traemos todas las películas para extraer los actores
  const resultado = await db.execute("SELECT actores FROM peliculas WHERE actores IS NOT NULL AND actores != 'NULL'");
  
  // Procesamos los actores: separamos por comas, limpiamos espacios y filtramos únicos
  const setActores = new Set();
  resultado.rows.forEach(row => {
    if (row.actores) {
      row.actores.split(',').forEach(actor => {
        const actorLimpio = actor.trim();
        if (actorLimpio) setActores.add(actorLimpio);
      });
    }
  });

  const actoresUnicos = Array.from(setActores).sort((a, b) => a.localeCompare(b));

  return (
    <main className="min-h-screen bg-[#141414] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">Actores / Elencos 🎭</h1>
          <p className="text-zinc-400 text-sm">Explorá las películas agrupadas por sus protagonistas principales.</p>
        </div>
        <Link href="/" className="text-sm text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg transition-colors">
          🏠 Volver al Inicio
        </Link>
      </div>

      {/* Renderizamos nuestro Buscador Vivo de Actores */}
      <BuscadorActores actoresUnicos={actoresUnicos} />
    </main>
  );
}