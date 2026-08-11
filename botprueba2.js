import { Telegraf, Markup } from 'telegraf';
import { createClient } from '@libsql/client';
import fetch from 'node-fetch';

const bot = new Telegraf('8603200955:AAHj8BI0zjT62tI8L_IXHgT-IQRc2LAveSg');
const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NmNjM2QxODNjOGM2NDM0ZDljYTBlNzIxZGE4ZjhjZSIsIm5iZiI6MTY1NjEzMTIzMC4wMzMsInN1YiI6IjYyYjY4ZTllMTk2OTBjMDA2MWM0NjFkMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.G5obyWUg_TlbrVRDOwa-lX6bCtBIo8o7oU8qoyfSFeQ';

const db = createClient({
  url: "libsql://catalogo-peliculas-chapu.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODUzOTQxNDUsImlkIjoiMDE5ZmIxYzUtMzYwMS03YmM0LTk4ZGYtNWYzNDg4Y2FhZWRjIiwia2lkIjoiOVBRb1FvLUMtdzh5bWFQeWt5dlI3WnBWUXY1ck10M3I4VVdkUHJuakRMUSIsInJpZCI6IjU4ZmJkMDljLWNlMmUtNGJjZS04YjU1LTdkNDUyOTgzYWIxMyJ9.Q80179N0HQxJCmS1H6gsng_iRYPOEx4hXZC6YTZ5uvBhynpgd9Q9wpx90hPB1hZxVnB_MW6vnareXzdZXfU1Dg"
});

const esperaManual = new Map();

async function buscarEnTmdb(query) {
  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=es-MX&include_adult=false&region=MX`;
  const options = { method: 'GET', headers: { accept: 'application/json', Authorization: `Bearer ${TMDB_TOKEN.trim()}` } };
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    return data.results || [];
  } catch (err) { return []; }
}

async function buscarPorIdEnTmdb(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}?language=es-MX`;
  const options = { method: 'GET', headers: { accept: 'application/json', Authorization: `Bearer ${TMDB_TOKEN.trim()}` } };
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    const data = await res.json();
    return data.id ? data : null;
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

async function obtenerActores(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}/credits?language=es-MX`;
  const options = { method: 'GET', headers: { accept: 'application/json', Authorization: `Bearer ${TMDB_TOKEN.trim()}` } };
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    const cast = data.cast || [];
    const actoresArray = cast.slice(0, 4).map(actor => actor.name);
    return actoresArray.length > 0 ? actoresArray.join(', ') : "Desconocido";
  } catch { return "Desconocido"; }
}

bot.on('text', async (ctx) => {
  const entrada = ctx.message.text.trim();
  if (entrada.startsWith('/')) return;
  const chatId = ctx.chat.id;

  let peli = null;
  let idTursoForzado = null;
  let tmdbIdAProcesar = null;

  if (esperaManual.has(chatId) && /^\d+$/.test(entrada)) {
    tmdbIdAProcesar = esperaManual.get(chatId);
    idTursoForzado = entrada;
    esperaManual.delete(chatId);
  } else if (entrada.includes(':')) {
    const partes = entrada.split(':');
    tmdbIdAProcesar = partes[0].trim();
    idTursoForzado = partes[1].trim();
  } else if (/^\d+$/.test(entrada)) {
    tmdbIdAProcesar = entrada;
  } else {
    let textoLimpio = entrada.replace(/\.mp4/gi, '').replace(/\.mkv/gi, '').trim();
    
    let anioBusqueda = null;
    const matchAnio = textoLimpio.match(/\((\d{4})\)/);
    
    if (matchAnio) {
      anioBusqueda = matchAnio[1];
      textoLimpio = textoLimpio.replace(/\(\d{4}\)/, '').trim();
    }

    let urlTmdb = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(textoLimpio)}&language=es-MX&include_adult=false&region=MX`;
    if (anioBusqueda) {
      urlTmdb += `&year=${anioBusqueda}`;
    }

    const options = { method: 'GET', headers: { accept: 'application/json', Authorization: `Bearer ${TMDB_TOKEN.trim()}` } };
    try {
      const res = await fetch(urlTmdb, options);
      const data = await res.json();
      const results = data.results || [];
      if (results.length > 0) peli = results[0];
    } catch (err) {}
  }

  if (!peli && tmdbIdAProcesar) {
    peli = await buscarPorIdEnTmdb(tmdbIdAProcesar);
  }

  if (!peli) {
    return ctx.reply(`❌ No encontre nada en TMDB para: "${entrada}"`);
  }

  if (idTursoForzado) {
    const resumen = peli.overview || '';
    const foto = peli.poster_path ? `https://image.tmdb.org/t/p/w500${peli.poster_path}` : '';
    const anio = peli.release_date ? peli.release_date.split('-')[0] : '';
    const calificacion = peli.vote_average ? peli.vote_average.toFixed(1) : '';
    const director = await obtenerDirector(peli.id);
    const actores = await obtenerActores(peli.id);

    await db.execute({
      sql: `UPDATE peliculas SET resumen = ?, foto = ?, director = ?, actores = ?, anio = ?, calificacion = ? WHERE id = ?`,
      args: [resumen, foto, director, actores, anio, calificacion, idTursoForzado]
    });

    const fotoUrl = peli.poster_path ? `https://image.tmdb.org/t/p/w500${peli.poster_path}` : null;
    const mensajeExito = `✅ ¡Actualizado manualmente con exito!\n\nPelicula TMDB: *${peli.title}*\nAplicado al ID de Turso: \`${idTursoForzado}\``;

    if (fotoUrl) {
      return ctx.replyWithPhoto(fotoUrl, { caption: mensajeExito, parse_mode: 'Markdown' });
    } else {
      return ctx.reply(mensajeExito, { parse_mode: 'Markdown' });
    }
  }

  const fotoUrl = peli.poster_path ? `https://image.tmdb.org/t/p/w500${peli.poster_path}` : null;
  const anioPeli = peli.release_date ? peli.release_date.split('-')[0] : 'S/F';

  const tituloBusquedaSql = `%${peli.title.replace(/[:.,]/g, '').trim()}%`;
  
  const { rows } = await db.execute({
    sql: `SELECT id, nombre FROM peliculas WHERE LOWER(nombre) LIKE LOWER(?) LIMIT 5`,
    args: [tituloBusquedaSql]
  });

  let sugerencias = rows;
  if (sugerencias.length === 0) {
    const resBackup = await db.execute("SELECT id, nombre FROM peliculas ORDER BY id DESC LIMIT 5");
    sugerencias = resBackup.rows;
  }

  const botones = sugerencias.map(s => [
    Markup.button.callback(`${s.nombre} (ID: ${s.id})`, `upd_${peli.id}_${s.id}`)
  ]);

  // Boton manual e incorporamos el de cancelar abajo
  botones.push([Markup.button.callback(`✏ Ingresar ID de Turso a mano`, `manual_${peli.id}`)]);
  botones.push([Markup.button.callback(`❌ Cancelar`, `cancelar`)]);

  const textoMensaje = `🎬 Encontre en TMDB: **${peli.title}** (${anioPeli})\n\nMira la foto arriba 👆. ¿A cual de estas peliculas queres aplicarle los datos?`;

  if (fotoUrl) {
    await ctx.replyWithPhoto(fotoUrl, {
      caption: textoMensaje,
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(botones)
    });
  } else {
    await ctx.reply(textoMensaje, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(botones)
    });
  }
});

bot.action(/^upd_(\d+)_(\d+)$/, async (ctx) => {
  const tmdbId = ctx.match[1];
  const tursoId = ctx.match[2];
  esperaManual.delete(ctx.chat.id); // Limpiamos por las dudas

  await ctx.answerCbQuery("Actualizando pelicula...");

  const peli = await buscarPorIdEnTmdb(tmdbId);
  if (!peli) {
    return ctx.editMessageCaption("❌ Hubo un error al recuperar los datos de TMDB.");
  }

  const resumen = peli.overview || '';
  const foto = peli.poster_path ? `https://image.tmdb.org/t/p/w500${peli.poster_path}` : '';
  const anio = peli.release_date ? peli.release_date.split('-')[0] : '';
  const calificacion = peli.vote_average ? peli.vote_average.toFixed(1) : '';
  const director = await obtenerDirector(peli.id);
  const actores = await obtenerActores(peli.id);

  await db.execute({
    sql: `UPDATE peliculas SET resumen = ?, foto = ?, director = ?, actores = ?, anio = ?, calificacion = ? WHERE id = ?`,
    args: [resumen, foto, director, actores, anio, calificacion, tursoId]
  });

  await ctx.editMessageCaption(`✅ ¡Actualizado con exito!\n\nPelicula TMDB: *${peli.title}*\nAplicado al ID de Turso: \`${tursoId}\``, { parse_mode: 'Markdown' });
});

bot.action(/^manual_(\d+)$/, async (ctx) => {
  const tmdbId = ctx.match[1];
  const chatId = ctx.chat.id;
  
  esperaManual.set(chatId, tmdbId);

  await ctx.answerCbQuery("Modo manual activado");
  
  // Mensaje manual con su propio boton de cancelar por si te arrepentis ahi mismo
  await ctx.editMessageCaption(
    `✏ **Modo Manual Activado**\n\nManda al chat **unicamente el numero de ID de Turso** pelado (por ejemplo: \`1710\`).`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[Markup.button.callback(`❌ Cancelar`, `cancelar`)]])
    }
  );
});

// 🔥 ACCION DE CANCELAR: Limpia la memoria y te deja el mensaje limpio
bot.action('cancelar', async (ctx) => {
  esperaManual.delete(ctx.chat.id);
  await ctx.answerCbQuery("Operacion cancelada");
  await ctx.editMessageCaption("❌ Operacion cancelada. Podes buscar otra pelicula cuando quieras.", { parse_mode: 'Markdown' });
});

bot.launch();
console.log("🤖 Bot interactivo con boton de cancelar corriendo...");