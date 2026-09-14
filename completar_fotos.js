import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const TMDB_TOKEN = process.env.TMDB_API_KEY;

const tmdbHeaders = {
  accept: 'application/json',
  Authorization: `Bearer ${TMDB_TOKEN}`
};

async function buscarIdTmdbPorNombreYAnio(nombre, anio) {
  try {
    let textoLimpio = nombre.replace(/\.mp4/gi, '').replace(/\.mkv/gi, '').replace(/\(.*?\)/g, '').trim();
    
    // 1. Intentar con año si lo tiene
    if (anio) {
      let url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(textoLimpio)}&language=es-MX&include_adult=false&year=${anio}`;
      let res = await fetch(url, { headers: tmdbHeaders });
      let data = await res.json();
      if (data.results && data.results.length > 0) return data.results[0].id;
    }

    // 2. Intentar sin año
    let url2 = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(textoLimpio)}&language=es-MX&include_adult=false`;
    let res2 = await fetch(url2, { headers: tmdbHeaders });
    let data2 = await res2.json();
    if (data2.results && data2.results.length > 0) return data2.results[0].id;

    return null;
  } catch (err) {
    return null;
  }
}

async function obtenerTrailer(movieId) {
  try {
    let url = `https://api.themoviedb.org/3/movie/${movieId}/videos?language=es-MX`;
    let res = await fetch(url, { headers: tmdbHeaders });
    let data = await res.json();
    let videos = data.results || [];

    if (videos.length === 0) {
      url = `https://api.themoviedb.org/3/movie/${movieId}/videos?language=es-ES`;
      res = await fetch(url, { headers: tmdbHeaders });
      data = await res.json();
      videos = data.results || [];
    }

    if (videos.length === 0) {
      url = `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`;
      res = await fetch(url, { headers: tmdbHeaders });
      data = await res.json();
      videos = data.results || [];
    }

    const videoOficial = videos.find(v => v.site === "YouTube" && v.type === "Trailer") 
                      || videos.find(v => v.site === "YouTube" && v.type === "Teaser")
                      || videos.find(v => v.site === "YouTube");

    return videoOficial ? videoOficial.key : "";
  } catch {
    return "";
  }
}

async function procesarActoresYRelacion(movieId, tursoId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}/credits?language=es-MX`;
  try {
    const res = await fetch(url, { headers: tmdbHeaders });
    const data = await res.json();
    const cast = data.cast || [];
    const topActores = cast.slice(0, 100);

    for (const actorData of topActores) {
      const nombreActor = actorData.name;
      const personaje = actorData.character || "Reparto";
      const fotoActor = actorData.profile_path ? `https://image.tmdb.org/t/p/w500${actorData.profile_path}` : null;

      // Consultar detalle para la biografía si se puede
      let biografia = null;
      try {
        const urlDetail = `https://api.themoviedb.org/3/person/${actorData.id}?language=es-MX`;
        const resDetail = await fetch(urlDetail, { headers: tmdbHeaders });
        const personaDetail = await resDetail.json();
        biografia = personaDetail.biography || null;
      } catch (e) {}

      let resActor = await db.execute({
        sql: `SELECT id FROM actores WHERE nombre = ?`,
        args: [nombreActor]
      });

      let idActor;
      if (resActor.rows.length > 0) {
        idActor = resActor.rows[0].id;
        await db.execute({
          sql: `UPDATE actores SET foto_url = COALESCE(?, foto_url), biografia = COALESCE(?, biografia) WHERE id = ?`,
          args: [fotoActor, biografia, idActor]
        });
      } else {
        const insertRes = await db.execute({
          sql: `INSERT INTO actores (nombre, foto_url, biografia) VALUES (?, ?, ?)`,
          args: [nombreActor, fotoActor, biografia]
        });
        idActor = insertRes.lastInsertRowid;
        if (!idActor) {
          const checkNuevo = await db.execute({ sql: `SELECT id FROM actores WHERE nombre = ?`, args: [nombreActor] });
          idActor = checkNuevo.rows[0].id;
        }
      }

      await db.execute({
        sql: `INSERT OR IGNORE INTO pelicula_actores (id_pelicula, id_actor, personaje) VALUES (?, ?, ?)`,
        args: [tursoId, idActor, personaje]
      });
    }

    return topActores.slice(0, 4).map(a => a.name).join(', ');
  } catch (err) {
    return "Desconocido";
  }
}

async function ejecutarSincronizacionTotal() {
  console.log("🚀 Iniciando Sincronización Total de Películas, Actores y Tráilers...\n");

  try {
    const pelisRes = await db.execute("SELECT id, nombre, anio FROM peliculas");
    const pelis = pelisRes.rows;
    console.log(`🎬 Encontradas ${pelis.length} películas en total para procesar.`);

    let procesadas = 0;

    for (const peli of pelis) {
      console.log(`\n🔍 Procesando: ${peli.nombre} (${peli.anio || 'S/F'})`);
      const tmdbId = await buscarIdTmdbPorNombreYAnio(peli.nombre, peli.anio);

      if (!tmdbId) {
        console.log(`⚠ No se encontró en TMDB (Contenido custom/propio): ${peli.nombre}`);
        continue;
      }

      // Obtener trailer y actores
      const videoFondo = await obtenerTrailer(tmdbId);
      const actoresTexto = await procesarActoresYRelacion(tmdbId, peli.id);

      // Actualizar la película con su tráiler y texto de actores resumen
      await db.execute({
        sql: `UPDATE peliculas SET video_fondo = ?, actores = COALESCE(?, actores) WHERE id = ?`,
        args: [videoFondo, actoresTexto, peli.id]
      });

      procesadas++;
      console.log(`✔ Sincronizada con éxito (TMDB ID: ${tmdbId}) -> Tráiler: ${videoFondo ? '🟢' : '❌'}`);

      // Pausa anti-bloqueo
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`\n🎉 ¡Sincronización total finalizada! Películas procesadas: ${procesadas}/${pelis.length}`);

  } catch (error) {
    console.error("❌ Error en la sincronización:", error);
  }
}

ejecutarSincronizacionTotal();