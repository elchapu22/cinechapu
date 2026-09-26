import { NextResponse } from 'next/server';
import { createClient } from "@libsql/client";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Inicializar dentro de la función para que no rompa en el build estático
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL || "file:/app/data/cinechapu.db",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const resultado = await db.execute('SELECT * FROM peliculas');
    return NextResponse.json(resultado.rows);
  } catch (error) {
    console.error('Error al traer películas para favoritos:', error);
    // Devolvemos un array vacío en lugar de un error 500 para que el build no sufra
    return NextResponse.json([]); 
  }
}