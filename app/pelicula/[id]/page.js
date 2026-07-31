import { createClient } from '@libsql/client';
import Link from 'next/link';

// Configuracion de Turso
const db = createClient({
  url: "libsql://catalogo-peliculas-chapu.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODUzOTQxNDUsImlkIjoiMDE5ZmIxYzUtMzYwMS03YmM0LTk4ZGYtNWYzNDg4Y2FhZWRjIiwia2lkIjoiOVBRb1FvLUMtdzh5bWFQeWt5dlI3WnBWUXY1ck10M3I4VVdkUHJuakRMUSIsInJpZCI6IjU4ZmJkMDljLWNlMmUtNGJjZS04YjU1LTdkNDUyOTgzYWIxMyJ9.Q80179N0HQxJCmS1H6gsng_iRYPOEx4hXZC6YTZ5uvBhynpgd9Q9wpx90hPB1hZxVnB_MW6vnareXzdZXfU1Dg"
});

const imagenGenerica = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop";

export default async function DetallePelicula({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // 1. Consultamos la película actual
  const resultado = await db.execute({
    sql: `SELECT * FROM peliculas WHERE id = ?`,
    args: [id]
  });
  
  const pelicula = resultado.rows[0];

  if (!pelicula) {
    return (
      <main className="min-h-screen bg-[#141414] text-white p-6 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Pelicula no encontrada</h1>
        <Link href="/" className="bg-red-600 px-4 py-2 rounded text-white font-medium hover:bg-red-700">
          Volver al catalogo
        </Link>
      </main>
    );
  }

  // 2. Buscamos la siguiente película (el primer ID mayor al actual)
  const resultadoSiguiente = await db.execute({
    sql: `SELECT id FROM peliculas WHERE id > ? ORDER BY id ASC LIMIT 1`,
    args: [id]
  });

  const siguientePelicula = resultadoSiguiente.rows[0];

  return (
    <main className="min-h-screen bg-[#141414] text-white p-6 md:p-12">
      {/* Barra superior con Volver y Siguiente */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center text-sm">
        <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
          ← Volver al catalogo
        </Link>

        {siguientePelicula && (
          <Link 
            href={`/pelicula/${siguientePelicula.id}`} 
            className="text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-4 py-1.5 rounded-lg transition-all shadow"
          >
            Siguiente →
          </Link>
        )}
      </div>

      <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div className="aspect-[2/3] bg-zinc-800 rounded overflow-hidden relative">
          <img 
            src={pelicula.foto || imagenGenerica} 
            alt={pelicula.nombre} 
            className="object-cover w-full h-full"
          />
        </div>

        <div className="md:col-span-2 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-3">{pelicula.nombre}</h1>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              {pelicula.resumen || "Pelicula alojada en canal privado de Netflix."}
            </p>
          </div>

          {pelicula.link ? (
            <a 
              href={pelicula.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium text-center py-3 px-6 rounded transition-colors"
            >
              Ver Pelicula en Telegram
            </a>
          ) : (
            <div className="bg-zinc-800 text-zinc-400 py-3 px-6 rounded text-center text-sm">
              No hay un enlace de video configurado
            </div>
          )}
        </div>
      </div>
    </main>
  );
}