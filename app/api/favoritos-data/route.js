import { NextResponse } from 'next/server';
import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const resultado = await db.execute('SELECT * FROM peliculas');
    return NextResponse.json(resultado.rows);
  } catch (error) {
    console.error('Error al traer películas para favoritos:', error);
    return NextResponse.json({ error: 'Error al obtener los datos' }, { status: 500 });
  }
}