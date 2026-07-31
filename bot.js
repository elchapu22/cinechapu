import { Telegraf } from 'telegraf';
import { createClient } from '@libsql/client';
import fetch from 'node-fetch';

// Configura tus tokens
const bot = new Telegraf('8603200955:AAHj8BI0zjT62tI8L_IXHgT-IQRc2LAveSg');
const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NmNjM2QxODNjOGM2NDM0ZDljYTBlNzIxZGE4ZjhjZSIsIm5iZiI6MTY1NjEzMTIzMC4wMzMsInN1YiI6IjYyYjY4ZTllMTk2OTBjMDA2MWM0NjFkMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.G5obyWUg_TlbrVRDOwa-lX6bCtBIo8o7oU8qoyfSFeQ';

const db = createClient({
  url: "libsql://catalogo-peliculas-chapu.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODUzOTQxNDUsImlkIjoiMDE5ZmIxYzUtMzYwMS03YmM0LTk4ZGYtNWYzNDg4Y2FhZWRjIiwia2lkIjoiOVBRb1FvLUMtdzh5bWFQeWt5dlI3WnBWUXY1ck10M3I4VVdkUHJuakRMUSIsInJpZCI6IjU4ZmJkMDljLWNlMmUtNGJjZS04YjU1LTdkNDUyOTgzYWIxMyJ9.Q80179N0HQxJCmS1H6gsng_iRYPOEx4hXZC6YTZ5uvBhynpgd9Q9wpx90hPB1hZxVnB_MW6vnareXzdZXfU1Dg"
});

// Funcion para buscar pelicula en TMDB
async function buscarEnTmdb(query) {
  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=es-MX&include_adult=false&region=MX`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${TMDB_TOKEN.trim()}`
    }
  };

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("Error en request TMDB:", err.message);
    return [];
  }
}

// Funcion para obtener los creditos y sacar el Director (respetando tu estructura)
async function obtenerDirector(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}/credits?language=es-MX`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${TMDB_TOKEN.trim()}`
    }
  };

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    const crew = data.crew || [];
    const directorObj = crew.find(persona => persona.job === "Director");
    return directorObj ? directorObj.name : "Desconocido";
  } catch (err) {
    console.error("Error obteniendo director:", err.message);
    return "Desconocido";
  }
}

// NUEVA función limpia para sacar los actores sin romper nada
async function obtenerActores(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}/credits?language=es-MX`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${TMDB_TOKEN.trim()}`
    }
  };

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    const cast = data.cast || [];
    const actoresArray = cast.slice(0, 4).map(actor => actor.name);
    return actoresArray.length > 0 ? actoresArray.join(', ') : "Desconocido";
  } catch (err) {
    console.error("Error obteniendo actores:", err.message);
    return "Desconocido";
  }
}

// Cuando mandes mensajes al bot
bot.on('text', async (ctx) => {
  const texto = ctx.message.text;
  const peliculas = texto.split('\n').map(p => p.trim()).filter(Boolean);

  await ctx.reply(`🔍 Recibí ${peliculas.length} películas. Buscando en TMDB (con director y actores) y actualizando Turso...`);

  let count = 0;

  for (const titulo of peliculas) {
    try {
      let busquedaLimpieza = titulo.replace(/\.mp4/gi, '').replace(/\.mkv/gi, '').replace(/\.avi/gi, '');
      busquedaLimpieza = busquedaLimpieza.replace(/\(\d{4}\)/g, '').trim();

      console.log(`Buscando in TMDB (MX): "${busquedaLimpieza}"`);

      let results = await buscarEnTmdb(busquedaLimpieza);

      if (results.length === 0 && busquedaLimpieza.includes(':')) {
        const principal = busquedaLimpieza.split(':')[0].trim();
        results = await buscarEnTmdb(principal);
      }

      if (results.length > 0) {
        const peli = results[0];
        console.log(`> ¡Encontrado!: "${peli.title}" (ID: ${peli.id})`);
        
        const resumen = peli.overview || '';
        const foto = peli.poster_path ? `https://image.tmdb.org/t/p/w500${peli.poster_path}` : '';
        const anio = peli.release_date ? peli.release_date.split('-')[0] : '';
        const calificacion = peli.vote_average ? peli.vote_average.toFixed(1) : '';
        
        // Obtenemos director y actores con tus funciones
        const director = await obtenerDirector(peli.id);
        const actores = await obtenerActores(peli.id);

        const nombreBase = titulo.replace(/\.mp4/gi, '').replace(/\.mkv/gi, '').trim();

        // Actualizamos todos los campos en Turso incluyendo actores
        const resultado = await db.execute({
          sql: `UPDATE peliculas SET resumen = ?, foto = ?, director = ?, actores = ?, anio = ?, calificacion = ? WHERE LOWER(nombre) LIKE LOWER(?)`,
          args: [resumen, foto, director, actores, anio, calificacion, `%${nombreBase}%`]
        });

        console.log(`> Filas actualizadas en Turso: ${resultado.rowsAffected}`);

        if (resultado.rowsAffected > 0) {
          count++;
        }
      } else {
        console.log(`❌ No se encontró nada en TMDB para: ${busquedaLimpieza}`);
      }
    } catch (err) {
      console.error(`Error procesando la película "${titulo}":`, err.message);
    }
  }

  await ctx.reply(`✅ ¡Listo! Se actualizaron ${count} películas con director, actores y detalles en Turso.`);
});

bot.launch();
console.log("🤖 Bot de Telegram corriendo con soporte de Director y Actores...");