import { NextResponse } from 'next/server';
import { db } from '@/app/db'; // Importa tu conexión centralizada y segura

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const resultado = await db.execute('SELECT * FROM peliculas');
    return NextResponse.json(resultado.rows);
  } catch (error) {
    console.error('Error al traer películas para favoritos:', error);
    // Devolvemos un array vacío para que el build no colapse si la DB está vacía
    return NextResponse.json([]); 
  }
}