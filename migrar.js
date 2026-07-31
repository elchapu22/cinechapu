import { createClient } from "@libsql/client";
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const db = createClient({
  url: "libsql://catalogo-peliculas-chapu.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODUzOTQxNDUsImlkIjoiMDE5ZmIxYzUtMzYwMS03YmM0LTk4ZGYtNWYzNDg4Y2FhZWRjIiwia2lkIjoiOVBRb1FvLUMtdzh5bWFQeWt5dlI3WnBWUXY1ck10M3I4VVdkUHJuakRMUSIsInJpZCI6IjU4ZmJkMDljLWNlMmUtNGJjZS04YjU1LTdkNDUyOTgzYWIxMyJ9.Q80179N0HQxJCmS1H6gsng_iRYPOEx4hXZC6YTZ5uvBhynpgd9Q9wpx90hPB1hZxVnB_MW6vnareXzdZXfU1Dg" // Reemplaza con tu token real
});

async function migrarCSV() {
  try {
    console.log("Leyendo y parseando el archivo CSV...");
    const contenido = fs.readFileSync('./peliculas_202607300338.csv', 'utf-8');
    
    // Parseamos usando csv-parse para manejar correctamente comas internas y comillas
    const registros = parse(contenido, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true
    });

    if (registros.length === 0) {
      console.log("El archivo CSV esta vacio.");
      return;
    }

    const headers = Object.keys(registros[0]);
    console.log(`Columnas detectadas: ${headers.join(', ')}`);

    // Creamos la tabla dinamicamente
    const columnasDef = headers.map(col => `"${col}" TEXT`).join(', ');
    await db.execute(`DROP TABLE IF EXISTS peliculas;`);
    await db.execute(`CREATE TABLE peliculas (${columnasDef});`);
    console.log("Tabla 'peliculas' recreada con exito.");

    console.log(`Insertando ${registros.length} filas en Turso...`);

    for (let i = 0; i < registros.length; i++) {
      const fila = registros[i];
      const keys = Object.keys(fila);
      const values = keys.map(k => fila[k]);
      
      const placeholders = keys.map(() => '?').join(', ');
      const sql = `INSERT INTO peliculas (${keys.map(h => `"${h}"`).join(', ')}) VALUES (${placeholders})`;

      try {
        await db.execute({
          sql: sql,
          args: values
        });
      } catch (err) {
        console.warn(`Error en registro ${i + 1}:`, err.message);
      }
    }

    console.log("¡Migracion completa y exitosa!");
  } catch (error) {
    console.error("Error general en la migracion:", error);
  }
}

migrarCSV();