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

// Funcion auxiliar para buscar en TMDB usando Bearer Token
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

// Cuando reenvies o mandes mensajes al chat del bot
bot.on('text', async (ctx) => {
  const texto = ctx.message.text;
  const peliculas = texto.split('\n').map(p => p.trim()).filter(Boolean);

  await ctx.reply(`🔍 Recibi ${peliculas.length} peliculas. Procesando con TMDB (MX) y subiendo a Turso...`);

  let count = 0;

  for (const titulo of peliculas) {
    try {
      // 1. Limpieza inicial quitando extensiones y el ano entre parentesis para la busqueda en TMDB
      let busquedaLimpieza = titulo.replace(/\.mp4/gi, '').replace(/\.mkv/gi, '').replace(/\.avi/gi, '');
      busquedaLimpieza = busquedaLimpieza.replace(/\(\d{4}\)/g, '').trim();

      console.log(`Buscando en TMDB (MX): "${busquedaLimpieza}" (Original: "${titulo}")`);

      let results = await buscarEnTmdb(busquedaLimpieza);

      // 2. Si no encuentra nada y tiene dos puntos, probamos con lo que esta antes del ':'
      if (results.length === 0 && busquedaLimpieza.includes(':')) {
        const principal = busquedaLimpieza.split(':')[0].trim();
        console.log(`> Intento secundario sin subtitulo: "${principal}"`);
        results = await buscarEnTmdb(principal);
      }

      if (results.length > 0) {
        const peli = results[0];
        console.log(`> ¡Encontrado en TMDB!: "${peli.title}" (ID: ${peli.id})`);
        
        const resumen = peli.overview || '';
        const foto = peli.poster_path ? `https://image.tmdb.org/t/p/w500${peli.poster_path}` : '';

        // El nombre base mantiene el titulo tal cual vino para hacer el match en la base de datos
        const nombreBase = titulo.replace(/\.mp4/gi, '').replace(/\.mkv/gi, '').trim();

        // Actualizar en Turso solo resumen y foto
        const resultado = await db.execute({
          sql: `UPDATE peliculas SET resumen = ?, foto = ? WHERE LOWER(nombre) LIKE LOWER(?)`,
          args: [resumen, foto, `%${nombreBase}%`]
        });

        console.log(`> Filas actualizadas en Turso: ${resultado.rowsAffected}`);

        if (resultado.rowsAffected > 0) {
          count++;
        }
      } else {
        console.log(`❌ No se encontro nada en TMDB para: ${busquedaLimpieza}`);
      }
    } catch (err) {
      console.error(`Error procesando la pelicula "${titulo}":`, err.message);
    }
  }

  await ctx.reply(`✅ ¡Listo! Se actualizaron ${count} peliculas de ${peliculas.length} en Turso.`);
});

bot.launch();
console.log("🤖 Bot de Telegram corriendo y escuchando peliculas...");