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

// Funcion para buscar pelicula por texto en TMDB
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

// NUEVA: Funcion para buscar película exacta por su ID numérico de TMDB
async function buscarPorIdEnTmdb(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}?language=es-MX`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${TMDB_TOKEN.trim()}`
    }
  };

  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    const data = await res.json();
    return data.id ? data : null;
  } catch (err) {
    console.error("Error en request TMDB por ID:", err.message);
    return null;
  }
}

// Funcion para obtener los creditos y sacar el Director
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

// Funcion limpia para sacar los actores
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
// Cuando mandes mensajes al bot
// Cuando mandes mensajes al bot
bot.on('text', async (ctx) => {
  const texto = ctx.message.text;
  const entradas = texto.split('\n').map(p => p.trim()).filter(Boolean);

  await ctx.reply(`🔍 Recibí ${entradas.length} elementos. Procesando en TMDB y Turso...`);

  let count = 0;

  for (const entrada of entradas) {
    try {
      let peli = null;

      // SI LA ENTRADA ES UN NÚMERO PURO, ES UN ID DE TMDB
      if (/^\d+$/.test(entrada)) {
        console.log(`Buscando por ID exacto en TMDB: ${entrada}`);
        peli = await buscarPorIdEnTmdb(entrada);
      } else {
        // SINO, ES TEXTO: Limpiamos el año para buscar bien en TMDB
        let textoLimpio = entrada.replace(/\.mp4/gi, '').replace(/\.mkv/gi, '').replace(/\.avi/gi, '').trim();
        let queryTmdb = textoLimpio.replace(/\(\d{4}\)/, '').trim();

        console.log(`Buscando por texto en TMDB (MX): "${queryTmdb}"`);

        let results = await buscarEnTmdb(queryTmdb);

        if (results.length === 0 && queryTmdb.includes(':')) {
          const principal = queryTmdb.split(':')[0].trim();
          results = await buscarEnTmdb(principal);
        }

        if (results.length > 0) {
          peli = results[0];
        }
      }

      if (peli) {
        console.log(`> ¡Encontrado en TMDB!: "${peli.title}" (ID TMDB: ${peli.id})`);
        
        const resumen = peli.overview || '';
        const foto = peli.poster_path ? `https://image.tmdb.org/t/p/w500${peli.poster_path}` : '';
        const anio = peli.release_date ? peli.release_date.split('-')[0] : '';
        const calificacion = peli.vote_average ? peli.vote_average.toFixed(1) : '';
        
        const director = await obtenerDirector(peli.id);
        const actores = await obtenerActores(peli.id);

        // TRUCO INFALIBLE: Traemos todas las películas de Turso para buscar la coincidencia exacta desde Node.js
        const { rows } = await db.execute("SELECT id, nombre FROM peliculas");
        
        // Función casera para normalizar textos (quita acentos, puntos, dos puntos y pasa a minúsculas)
        const normalizar = (str) => {
          return str.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // saca tildes
            .replace(/[.:,\-\(\)]/g, ' ') // saca símbolos
            .replace(/\s+/g, ' ') // espacios múltiples
            .trim();
        };

        const entradaNormalizada = normalizar(entrada.replace(/^\d+$/, peli.title)); // Si fue ID, usa el título de TMDB
        
        // Buscamos la película en el array de Turso que mejor coincida
        let peliculaEncontradaEnTurso = rows.find(row => {
          const nombreTursoNorm = normalizar(row.nombre);
          return nombreTursoNorm.includes(normalizar(peli.title)) || normalizar(peli.title).includes(nombreTursoNorm);
        });

        if (peliculaEncontradaEnTurso) {
          console.log(`> Matcheó con "${peliculaEncontradaEnTurso.nombre}" en Turso (ID interno: ${peliculaEncontradaEnTurso.id})`);

          // Actualizamos directo usando el ID exacto de la fila en Turso
          const resultado = await db.execute({
            sql: `UPDATE peliculas SET resumen = ?, foto = ?, director = ?, actores = ?, anio = ?, calificacion = ? WHERE id = ?`,
            args: [resumen, foto, director, actores, anio, calificacion, peliculaEncontradaEnTurso.id]
          });

          console.log(`> Filas actualizadas en Turso: ${resultado.rowsAffected}`);
          if (resultado.rowsAffected > 0) {
            count++;
          }
        } else {
          console.log(`❌ No se encontró coincidencia de nombre en Turso para actualizar.`);
        }

      } else {
        console.log(`❌ No se encontró nada en TMDB para: ${entrada}`);
      }
    } catch (err) {
      console.error(`Error procesando la entrada "${entrada}":`, err.message);
    }
  }

  await ctx.reply(`✅ ¡Listo! Se actualizaron ${count} películas correctamente en Turso.`);
});

bot.launch();
console.log("🤖 Bot de Telegram corriendo con soporte dual y limpieza de acentos/puntos...");