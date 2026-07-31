import { createClient } from '@libsql/client';
import Link from 'next/link';

const db = createClient({
  url: "libsql://catalogo-peliculas-chapu.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiI2NmM4NWMwMy1jNzRjLTQ2ZGUtYTA0Yi04Mzc0NWI4NTlmZDAiLCJpYXQiOjE3ODU0OTAzODcsImtpZCI6IjlQUW9Rby1DLXc4eW1hUHlreXZSN1pwVlF2NXJNdDNyOFVXZFBybmpETFEiLCJyaWQiOiIxYjNlM2NmOC01OTQ1LTQxZTUtOTM1MS1iMjYxMzEyMDI3MzQifQ.la9HjEBj4hT1xqRzhWgHBzbAAqguS0NH7RdOx9M4YRtAHZz2PxK7EwlNfHxJ-gk3W6HJ-NfXHLMTVAWSiR3pBA"
});

const imagenGenerica = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop";

export default async function DetallePelicula({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // 1. Película actual
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

  // 2. Buscar la película ANTERIOR (el ID más alto que sea menor al actual)
  const resultadoAnterior = await db.execute({
    sql: `SELECT id FROM peliculas WHERE id < ? ORDER BY id DESC LIMIT 1`,
    args: [id]
  });
  const anteriorPelicula = resultadoAnterior.rows[0];

  // 3. Buscar la película SIGUIENTE (el ID más bajo que sea mayor al actual)
  const resultadoSiguiente = await db.execute({
    sql: `SELECT id FROM peliculas WHERE id > ? ORDER BY id ASC LIMIT 1`,
    args: [id]
  });
  const siguientePelicula = resultadoSiguiente.rows[0];

  return (
    <main className="min-h-screen bg-[#141414] text-white p-6 md:p-12">
      {/* Barra superior: Volver a la izquierda, y Anterior/Siguiente juntos a la derecha */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center text-sm">
        <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
          ← Volver al catalogo
        </Link>

        <div className="flex items-center gap-2">
          {anteriorPelicula && (
            <Link 
              href={`/pelicula/${anteriorPelicula.id}`} 
              className="text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3.5 py-1.5 rounded-lg transition-all shadow"
            >
              ← Anterior
            </Link>
          )}

          {siguientePelicula && (
            <Link 
              href={`/pelicula/${siguientePelicula.id}`} 
              className="text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3.5 py-1.5 rounded-lg transition-all shadow"
            >
              Siguiente →
            </Link>
          )}
        </div>
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
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{pelicula.nombre}</h1>
            
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mb-3">
              {pelicula.anio && pelicula.anio !== "NULL" && (
                <span className="bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 text-zinc-300">
                  {pelicula.anio}
                </span>
              )}
              {pelicula.calificacion && pelicula.calificacion !== "NULL" && (
                <span className="text-yellow-400 font-semibold flex items-center gap-1">
                  ⭐ {pelicula.calificacion} / 10
                </span>
              )}
              {pelicula.director && pelicula.director !== "NULL" && (
                <span className="text-zinc-400">
                  Director: <strong className="text-zinc-200">{pelicula.director}</strong>
                </span>
              )}
            </div>

            {/* Actores principales */}
            {pelicula.actores && pelicula.actores !== "NULL" && (
              <div className="text-xs text-zinc-400 mb-4">
                Elenco principal: <strong className="text-zinc-300">{pelicula.actores}</strong>
              </div>
            )}

            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              {pelicula.resumen && pelicula.resumen !== "NULL" ? pelicula.resumen : "Película alojada en canal privado de Telegram."}
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