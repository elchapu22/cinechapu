import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function buscarPelicula(nombrePelicula) {
  try {
    const nombreOriginal = decodeURIComponent(nombrePelicula).trim();
    
    // Limpiamos etiquetas secundarias pero CONSERVAMOS el ano y el formato original para hacer match exacto
    const nombreBase = nombreOriginal.replace(/\(series\)/gi, '').replace(/\(anime\)/gi, '').replace(/\(infantil\)/gi, '').trim();
    
    const matchAno = nombreOriginal.match(/\b(19\d{2}|20\d{2})\b/);
    const anoPelicula = matchAno ? matchAno[0] : '';

    // Buscamos primero por coincidencia exacta del nombre tal cual viene
    let query = `
      SELECT * FROM peliculas 
      WHERE LOWER(nombre) = LOWER(?)
      LIMIT 1;
    `;
    
    let result = await db.execute({
      sql: query,
      args: [nombreBase]
    });

    // Si no encuentra exacto, probamos con un LIKE flexible usando la base limpia
    if (result.rows.length === 0) {
      const queryFallback = `
        SELECT * FROM peliculas 
        WHERE LOWER(nombre) LIKE LOWER(?)
        ORDER BY (resumen IS NOT NULL AND resumen != '' AND resumen != 'null') DESC
        LIMIT 1;
      `;
      result = await db.execute({
        sql: queryFallback,
        args: [`%${nombreBase}%`]
      });
    }

    const row = result.rows[0] || null;

    if (!row) {
      return {
        anio: anoPelicula,
        director: 'Desconocido',
        generos: '',
        sinopsis: 'Sin resumen disponible.',
        resumen: 'Sin resumen disponible.',
        foto: ''
      };
    }

    const textoResumen = (row.resumen && String(row.resumen).trim() !== '' && row.resumen !== 'null') ? row.resumen : 'Sin resumen disponible.';
    const fotoPeli = (row.foto && String(row.foto).trim() !== '' && row.foto !== 'null') ? row.foto : '';

    return {
      anio: row.anio || row.ano || anoPelicula,
      director: row.director || '',
      generos: row.generos || '',
      sinopsis: textoResumen,
      resumen: textoResumen,
      foto: fotoPeli
    };

  } catch (error) {
    console.error('Error al consultar Turso:', error);
    return null;
  }
}