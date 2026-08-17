// Importar dotenv para cargar las variables de entorno
require("dotenv").config();
const mongoose = require("mongoose");
const connection = async () => {
  try {
    // Obténer las variables de entorno
    const username = process.env.MONGO_USER;
    const password = process.env.MONGO_PASSWORD;
    const dbName = process.env.MONGO_DB;
    const host = process.env.MONGO_HOST;
    const port = process.env.MONGO_PORT;
    // Verificar si las variables de entorno están correctamente cargadas
    if (!username || !password || !dbName || !host || !port) {
      throw new Error("Faltan algunas variables de entorno necesarias.");
    }
    console.log("Conectando con MongoDB...");
    const uri = process.env.MONGO_HOST;

    await mongoose.connect(uri);
    console.log("Conectado a MongoDB: Rubik");
  } catch (error) {
    console.error("Error al conectar a MongoDB:");
    console.error("Mensaje:", error.message);
    console.error("Pila de ejecución:", error.stack);
    if (error.name === "MongoNetworkError") {
      console.error("Detalles de red:", error.message);
    }
    // Si el error es de la URI, muestra más detalles
    if (error.name === "MongoParseError") {
      console.error("Error al analizar la URI de conexión:", error.message);
    }
  }
};
// Exportar la función de conexión para usarla en otros archivos
module.exports = connection;
