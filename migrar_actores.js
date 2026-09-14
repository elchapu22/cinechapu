import { createClient } from "@libsql/client";
import dotenv from "dotenv";

// Forzamos a que lea el archivo .env.local que usa Next.js
dotenv.config({ path: ".env.local" });

const sql = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrarActores() {
  console.log("🚀 Iniciando la migración de actores...");

  try {
    // 1. Traemos todas las películas que tengan la columna actores con contenido
    const resultadoPeliculas = await sql.execute(`
      SELECT id, nombre, actores 
      FROM peliculas 
      WHERE actores IS NOT NULL AND actores != ''
    `);

    const peliculas = resultadoPeliculas.rows;
    console.log(`🎬 Se encontraron ${peliculas.length} películas con actores en texto plano.`);

    let totalVinculaciones = 0;

    for (const pelicula of peliculas) {
      const peliculaId = pelicula.id;
      const textoActores = pelicula.actores;

      // Separamos los actores por coma
      const listaNombres = textoActores.split(",");

      for (let nombreCrudo of listaNombres) {
        const nombreActor = nombreCrudo.trim(); // Limpiamos espacios

        if (!nombreActor) continue;

        // 2. Verificamos si el actor ya existe en la tabla 'actores'
        let actorRes = await sql.execute({
          sql: "SELECT id FROM actores WHERE nombre = ?",
          args: [nombreActor]
        });

        let actorId;

        if (actorRes.rows.length > 0) {
          actorId = actorRes.rows[0].id;
        } else {
          // Si no existe, lo insertamos
          const insertActorRes = await sql.execute({
            sql: "INSERT INTO actores (nombre) VALUES (?)",
            args: [nombreActor]
          });
          actorId = Number(insertActorRes.lastInsertRowid);
        }

        // 3. Verificamos si la relación ya existe para evitar duplicados
        const relacionCheck = await sql.execute({
          sql: "SELECT * FROM pelicula_actores WHERE id_pelicula = ? AND id_actor = ?",
          args: [peliculaId, actorId]
        });

        if (relacionCheck.rows.length === 0) {
          await sql.execute({
            sql: "INSERT INTO pelicula_actores (id_pelicula, id_actor) VALUES (?, ?)",
            args: [peliculaId, actorId]
          });
          totalVinculaciones++;
        }
      }
      console.log(`✔ Procesada: ${pelicula.nombre}`);
    }

    console.log(`\n🎉 ¡Migración finalizada con éxito! Se crearon/verificaron ${totalVinculaciones} relaciones de actores.`);
  } catch (error) {
    console.error("❌ Ocurrió un error durante la migración:", error);
  }
}

migrarActores();