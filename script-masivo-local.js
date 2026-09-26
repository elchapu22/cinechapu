import { createClient } from '@libsql/client';
import fetch from 'node-fetch';

// Token de TMDB
const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NmNjM2QxODNjOGM2NDM0ZDljYTBlNzIxZGE4ZjhjZSIsIm5iZiI6MTY1NjEzMTIzMC4wMzMsInN1YiI6IjYyYjY4ZTllMTk2OTBjMDA2MWM0NjFkMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.G5obyWUg_TlbrVRDOwa-lX6bCtBIo8o7oU8qoyfSFeQ';

// Conexión a tu base de datos local SQLite
const db = createClient({
  url: "file:cinechapu.db" // Apunta directo a tu archivo local en la raíz del proyecto
});

async function buscarEnTmdbPorNombre(nombrePeli) {
  let textoLimpio = nombrePeli.replace(/\.mp4/gi, '').replace(/\.mkv/gi, '').trim();
  let anioBusqueda = null;
  const matchAnio = textoLimpio.match(/\((\d{4})\)/);
  
  if (matchAnio) {
    anioBusqueda = matchAnio[1];
    textoLimpio = textoLimpio.replace(/\(\d{4}\)/, '').trim();
  }

  const options = { method: 'GET', headers: { accept: 'application/json', Authorization: `Bearer ${TMDB_TOKEN.trim()}` } };
  try {
    let results = [];
    if (anioBusqueda) {
      let urlTmdb = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(textoLimpio)}&language=es-MX&include_adult=false&region=MX&year=${anioBusqueda}`;
      let res = await fetch(urlTmdb, options);
      let data = await res.json();
      results = data.results || [];
    }

    if (results.length === 0) {
      let urlSinAnio = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(textoLimpio)}&language=es-MX&include_adult=false&region=MX`;
      let res2 = await fetch(urlSinAnio, options);
      let data2 = await res2.json();
      results = data2.results || [];
    }

    return results.length > 0 ? results[0] : null;
  } catch (err) {
    return null;
  }
}

async function buscarPorIdEnTmdb(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}?language=es-MX`;
  const options = { method: 'GET', headers: { accept: 'application/json', Authorization: `Bearer ${TMDB_TOKEN.trim()}` } };
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    return res.ok && data.id ? data : null;
  } catch { return null; }
}

async function obtenerDirector(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}/credits?language=es-MX`;
  const options = { method: 'GET', headers: { accept: 'application/json', Authorization: `Bearer ${TMDB_TOKEN.trim()}` } };
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    const crew = data.crew || [];
    const directorObj = crew.find(persona => persona.job === "Director");
    return directorObj ? directorObj.name : "Desconocido";
  } catch { return "Desconocido"; }
}

async function obtenerTrailer(movieId) {
  const options = { method: 'GET', headers: { accept: 'application/json', Authorization: `Bearer ${TMDB_TOKEN.trim()}` } };
  try {
    let url = `https://api.themoviedb.org/3/movie/${movieId}/videos?language=es-MX`;
    let res = await fetch(url, options);
    let data = await res.json();
    let videos = data.results || [];

    if (videos.length === 0) {
      url = `https://api.themoviedb.org/3/movie/${movieId}/videos?language=es-ES`;
      res = await fetch(url, options);
      data = await res.json();
      videos = data.results || [];
    }

    if (videos.length === 0) {
      url = `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`;
      res = await fetch(url, options);
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
  const options = { method: 'GET', headers: { accept: 'application/json', Authorization: `Bearer ${TMDB_TOKEN.trim()}` } };
  
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    const cast = data.cast || [];
    const topActores = cast.slice(0, 100); // Trae hasta 100 actores como pediste

    for (const actorData of topActores) {
      const nombreActor = actorData.name;
      const personaje = actorData.character || "Reparto";
      const fotoActor = actorData.profile_path ? `https://image.tmdb.org/t/p/w500${actorData.profile_path}` : null;

      let resActor = await db.execute({
        sql: `SELECT id FROM actores WHERE nombre = ?`,
        args: [nombreActor]
      });

      let idActor;
      if (resActor.rows.length > 0) {
        idActor = resActor.rows[0].id;
        if (fotoActor) {
          await db.execute({
            sql: `UPDATE actores SET foto_url = ? WHERE id = ? AND (foto_url IS NULL OR foto_url = '')`,
            args: [fotoActor, idActor]
          });
        }
      } else {
        const insertRes = await db.execute({
          sql: `INSERT INTO actores (nombre, foto_url) VALUES (?, ?)`,
          args: [nombreActor, fotoActor]
        });
        idActor = insertRes.lastInsertRowid;
        if (!idActor) {
          const checkNuevo = await db.execute({ sql: `SELECT id FROM actores WHERE nombre = ?`, args: [nombreActor] });
          if (checkNuevo.rows.length > 0) {
            idActor = checkNuevo.rows[0].id;
          }
        }
      }

      if (idActor) {
        await db.execute({
          sql: `INSERT OR IGNORE INTO pelicula_actores (id_pelicula, id_actor, personaje) VALUES (?, ?, ?)`,
          args: [tursoId, idActor, personaje]
        });
      }
    }

    return topActores.slice(0, 4).map(a => a.name).join(', ');
  } catch (err) {
    console.error(`Error procesando actores para peli ID ${tursoId}:`, err.message);
    return "Desconocido";
  }
}

async function iniciarMigracionMasiva() {
  console.log("🚀 [CineChapu]: Iniciando actualización masiva en base local...");

  try {
    // Traemos todas las películas cargadas en local
    const resultadoPeliculas = await db.execute("SELECT id, nombre FROM peliculas");
    const peliculas = resultadoPeliculas.rows;

    console.log(`📦 Encontradas ${peliculas.length} películas en total para procesar.`);

    let contador = 1;
    for (const peliLocal of peliculas) {
      console.log(`\n--------------------------------------------------`);
      console.log(`[${contador}/${peliculas.length}] Procesando: "${peliLocal.nombre}" (ID Local: ${peliLocal.id})`);

      // Buscar en TMDB por nombre de la película local
      const peliTmdb = await buscarEnTmdbPorNombre(peliLocal.nombre);

      if (!peliTmdb) {
        console.log(`❌ No se encontró en TMDB: ${peliLocal.nombre}`);
        contador++;
        continue;
      }

      const resumen = peliTmdb.overview || '';
      const foto = peliTmdb.poster_path ? `https://image.tmdb.org/t/p/w500${peliTmdb.poster_path}` : '';
      const anio = peliTmdb.release_date ? peliTmdb.release_date.split('-')[0] : '';
      const calificacion = peliTmdb.vote_average ? peliTmdb.vote_average.toFixed(1) : '';
      
      console.log(`🔍 Encontrado en TMDB: ${peliTmdb.title} (${anio})`);

      const director = await obtenerDirector(peliTmdb.id);
      const videoFondo = await obtenerTrailer(peliTmdb.id);
      const actoresTexto = await procesarActoresYRelacion(peliTmdb.id, peliLocal.id);

      // Actualizar la película local con todos sus metadatos, tráiler y actores principales en texto
      await db.execute({
        sql: `UPDATE peliculas SET resumen = ?, foto = ?, director = ?, actores = ?, anio = ?, calificacion = ?, video_fondo = ? WHERE id = ?`,
        args: [resumen, foto, director, actoresTexto, anio, calificacion, videoFondo, peliLocal.id]
      });

      console.log(`✅ ¡Actualizado con éxito! (Tráiler: ${videoFondo ? 'Sí' : 'No'}, Actores vinculados: OK)`);
      contador++;

      // Pequeña pausa para no saturar la API de TMDB
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`\n🎉 ¡Migración y actualización masiva completada con éxito en la base local!`);
  } catch (error) {
    console.error("❌ Error crítico en el proceso masivo:", error);
  }
}

iniciarMigracionMasiva();