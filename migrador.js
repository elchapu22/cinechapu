import { createClient } from "@libsql/client";
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const dbRemoto = createClient({
  url: "libsql://catalogo-peliculas-chapu.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODUzOTQxNDUsImlkIjoiMDE5ZmIxYzUtMzYwMS03YmM0LTk4ZGYtNWYzNDg4Y2FhZWRjIiwia2lkIjoiOVBRb1FvLUMtdzh5bWFQeWt5dlI3WnBWUXY1ck10M3I4VVdkUHJuakRMUSIsInJpZCI6IjU4ZmJkMDljLWNlMmUtNGJjZS04YjU1LTdkNDUyOTgzYWIxMyJ9.Q80179N0HQxJCmS1H6gsng_iRYPOEx4hXZC6YTZ5uvBhynpgd9Q9wpx90hPB1hZxVnB_MW6vnareXzdZXfU1Dg"
});

async function subirPorListaDeIds() {
  try {
    // 1. Leemos el archivo chiquito de IDs
    const archivoIds = fs.readFileSync('a_subir.csv', 'utf-8');
    const listaIds = parse(archivoIds, { columns: true, skip_empty_lines: true }).map(r => Number(r.id));

    // 2. Leemos el archivo gigante con toda la data
    const archivoCompleto = fs.readFileSync('peliculas_todas.csv', 'utf-8');
    const catalogo = parse(archivoCompleto, { columns: true, skip_empty_lines: true });

    let cont = 0;

    // 3. Buscamos cada ID en el catálogo comparando como números
    for (const idBuscado of listaIds) {
      const peli = catalogo.find(p => Number(p.id) === idBuscado);
      
      if (peli) {
        const resultado = await dbRemoto.execute({
          sql: `INSERT OR REPLACE INTO peliculas (id, nombre, link, tags, id_saga, foto, resumen, calificacion, director, anio, actores) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            Number(peli.id),
            peli.nombre || '', 
            peli.link || '', 
            peli.tags || '', 
            peli.id_saga || '', 
            peli.foto || '', 
            peli.resumen || '', 
            peli.calificacion || '', 
            peli.director || '', 
            peli.anio || '', 
            peli.actores || ''
          ]
        });
        console.log(`✅ Actualizada/Subida: ${peli.nombre} (ID ${idBuscado}) - Filas afectadas: ${resultado.rowsAffected}`);
        cont++;
      } else {
        console.log(`⚠️ No encontré el ID ${idBuscado} en el catálogo grande.`);
      }
    }
    console.log(`\n¡Listo! Se procesaron ${cont} películas.`);
  } catch (error) {
    console.error("❌ Error detallado:", error.message);
  }
}

subirPorListaDeIds();