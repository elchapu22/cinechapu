import { createClient } from "@libsql/client";
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const dbRemoto = createClient({
  url: "libsql://catalogo-peliculas-chapu.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODUzOTQxNDUsImlkIjoiMDE5ZmIxYzUtMzYwMS03YmM0LTk4ZGYtNWYzNDg4Y2FhZWRjIiwia2lkIjoiOVBRb1FvLUMtdzh5bWFQeWt5dlI3WnBWUXY1ck10M3I4VVdkUHJuakRMUSIsInJpZCI6IjU4ZmJkMDljLWNlMmUtNGJjZS04YjU1LTdkNDUyOTgzYWIxMyJ9.Q80179N0HQxJCmS1H6gsng_iRYPOEx4hXZC6YTZ5uvBhynpgd9Q9wpx90hPB1hZxVnB_MW6vnareXzdZXfU1Dg"
});

async function sincronizarNuevasPorNombre() {
  try {
    console.log("Leyendo el archivo peliculas_neon_nuevas.csv...");
    const archivoCsv = fs.readFileSync('peliculas_neon_nuevas.csv', 'utf-8');
    const registros = parse(archivoCsv, {
      columns: true,
      skip_empty_lines: true
    });

    console.log(`Se encontraron ${registros.length} películas en el CSV de Neon.`);

    // Traemos los nombres que ya existen en Turso (normalizados en minúsculas y sin espacios extra)
    const resultadoExistentes = await dbRemoto.execute("SELECT nombre FROM peliculas");
    const nombresEnTurso = new Set(resultadoExistentes.rows.map(r => String(r.nombre).trim().toLowerCase()));

    console.log(`Turso tiene actualmente ${nombresEnTurso.size} películas únicas.`);

    let insertadas = 0;

    for (const p of registros) {
      const nombreLimpio = String(p.nombre || '').trim().toLowerCase();
      
      // Si el nombre NO está en Turso, lo agregamos
      if (nombreLimpio && !nombresEnTurso.has(nombreLimpio)) {
        await dbRemoto.execute({
          sql: `INSERT INTO peliculas (id, nombre, link, tags, id_saga, foto, resumen, calificacion, director, anio, actores) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            Number(p.id), 
            p.nombre || '', 
            p.link || '', 
            p.tags || '', 
            p.id_saga || '', 
            p.foto || '', 
            p.resumen || '', 
            p.calificacion || '', 
            p.director || '', 
            p.anio || '', 
            p.actores || ''
          ]
        });
        nombresEnTurso.add(nombreLimpio); // Lo agregamos al Set para evitar duplicados dentro del mismo CSV
        insertadas++;
        console.log(`-> Agregada nueva: [ID ${p.id}] ${p.nombre}`);
      }
    }

    console.log(`\n¡Sincronización completada con éxito! Se agregaron ${insertadas} películas nuevas.`);
  } catch (error) {
    console.error("Error durante la sincronización:", error);
  }
}

sincronizarNuevasPorNombre();