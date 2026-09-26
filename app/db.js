import { createClient } from "@libsql/client";
import path from "path";
import fs from "fs";

function getDatabaseClient() {
    // Si estamos en la nube (Fly.io), usamos la carpeta del disco persistente /app/data
    // Si estamos en local, usamos el archivo de la raíz del proyecto
    const dbPath = process.env.NODE_ENV === "production" 
        ? "/app/data/cinechapu.db" 
        : "cinechapu.db";

    console.log(`🟢 [CineChapu DB]: Conectando a SQLite en -> ${dbPath}`);

    return createClient({
        url: `file:${dbPath}`,
    });
}

export const db = getDatabaseClient();