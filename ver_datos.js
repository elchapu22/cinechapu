import { createClient } from "@libsql/client";

// Usá exactamente la misma URL y authToken que tenés en tu bot.js funcionando
const db = createClient({
  url: "libsql://catalogo-peliculas-chapu.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODUzOTQxNDUsImlkIjoiMDE5ZmIxYzUtMzYwMS03YmM0LTk4ZGYtNWYzNDg4Y2FhZWRjIiwia2lkIjoiOVBRb1FvLUMtdzh5bWFQeWt5dlI3WnBWUXY1ck10M3I4VVdkUHJuakRMUSIsInJpZCI6IjU4ZmJkMDljLWNlMmUtNGJjZS04YjU1LTdkNDUyOTgzYWIxMyJ9.Q80179N0HQxJCmS1H6gsng_iRYPOEx4hXZC6YTZ5uvBhynpgd9Q9wpx90hPB1hZxVnB_MW6vnareXzdZXfU1Dg"
});

async function verSaga() {
  try {
    // Buscamos todas las que tengan exactamente ese texto en id_saga (o que lo incluyan)
    const result = await db.execute({
      sql: "SELECT id, nombre, id_saga FROM peliculas WHERE LOWER(id_saga) LIKE ?;",
      args: ["%mad max%"]
    });

    console.table(result.rows);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

verSaga();