import { createClient } from "@libsql/client";

// --- CLIENTE HÍBRIDO SEGURO PARA PRODUCCIÓN ---
function getDatabaseClient() {
    // Si estamos en producción (Fly.io), usamos obligatoriamente el volumen persistente
    const isProduction = process.env.NODE_ENV === "production";
    
    const dbPath = isProduction 
        ? "file:/app/data/cinechapu.db" 
        : (process.env.DATABASE_URL || "file:cinechapu.db");

    if (isProduction) {
        console.log(`📂 [CineChapu DB]: Usando SQLite en Volumen Persistente -> ${dbPath}`);
    } else {
        console.log(`🟢 [CineChapu DB]: Usando SQLite LOCAL -> ${dbPath}`);
    }

    return createClient({
        url: dbPath,
    });
}

export const db = getDatabaseClient();