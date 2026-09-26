import { NextResponse } from 'next/server';
import { buscarPelicula } from '@/lib/peliculas'; // Asegúrate que apunte a tu archivo limpio

// Forzar que esta ruta sea 100% dinámica y nunca se ejecute en el build
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const nombre = searchParams.get('nombre');

  if (!nombre) {
    return NextResponse.json({ error: 'Falta el nombre' }, { status: 400 });
  }

  try {
    const resultado = await buscarPelicula(nombre);
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error en API route:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}