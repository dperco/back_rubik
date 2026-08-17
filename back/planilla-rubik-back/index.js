



// 'use strict'

// // --- Carga de Módulos ---
// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const http = require('http');
// const { Server } = require("socket.io"); // Importar Server desde socket.io
// const axios = require('axios'); // Importar axios para hacer peticiones HTTP
// require('dotenv').config(); // Cargar variables de entorno

// // --- Módulos Personalizados ---
// const logger = require('./config/logger');
// const connection = require('./database/connection');

// // --- Inicialización ---
// const app = express();
// const port = process.env.PORT || 3900;

// // --- Middlewares ---
// app.use(cors()); // Configurar CORS
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// // --- Cargar Ficheros de Rutas de la API ---
// const userRoutes = require('./routes/user');
// const projectRoutes = require('./routes/projects');
// const collaboratorRoutes = require('./routes/collaborator');
// const configurationRoutes = require('./routes/configuration');
// const extraFieldRoutes = require('./routes/extraFieldRoutes');
// const notificationRoutes = require('./routes/notification');
// const personnelRoutes = require('./routes/personnelRoutes');
// const tecnologyRoutes = require('./routes/tecnology');
// const vacancieRoutes = require('./routes/vacancie');
// const basicFieldRoutes = require('./routes/basicFieldRoutes');
// const agentFailureRoutes = require('./routes/agentFailure');
// // --- Prefijos de Rutas de la API ---
// app.use('/api', userRoutes);
// app.use('/api', projectRoutes);
// app.use('/api', collaboratorRoutes);
// app.use('/api', configurationRoutes);
// app.use('/api', extraFieldRoutes);
// app.use('/api', notificationRoutes);
// app.use('/api', personnelRoutes);
// app.use('/api', tecnologyRoutes);
// app.use('/api', vacancieRoutes);
// app.use('/api', basicFieldRoutes);
// app.use('/api', agentFailureRoutes);
// // --- Creación del Servidor HTTP ---
// const server = http.createServer(app);

// // --- Configuración de Socket.IO ---
// const io = new Server(server, {
//     cors: {
//         origin: process.env.FRONTEND_URL || "http://localhost:3000",
//         methods: ["GET", "POST"]
//     }
// });

// // --- Lógica de Conexión de Socket.IO para Rubiko (VERSIÓN CORREGIDA) ---
// io.on('connection', (socket) => {
//     logger.info(`🤖 Un usuario se ha conectado al chat de Rubiko: ${socket.id}`);

//     // Listener para los mensajes del asistente Rubiko
//     socket.on('rubiko:message', async (message) => {
//         logger.info(`Mensaje para la IA: "${message}"`);
//         const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000/chat/';

//         try {
//             logger.info(`Enviando a la IA en: ${AI_ENGINE_URL}`);
//             const aiResponse = await axios.post(AI_ENGINE_URL, {
//                 query: message 
//             });

//             // --- ¡CORRECCIÓN APLICADA! ---
//             // 1. Obtenemos el objeto completo de la respuesta de la IA.
//             const responseObject = aiResponse.data; 
//             logger.info(`Respuesta recibida de la IA: ${JSON.stringify(responseObject)}`);

//             // 2. Enviamos el OBJETO COMPLETO de vuelta al frontend.
//             // El frontend ahora recibirá algo como: { answer: "...", details: "..." }
//             socket.emit('rubiko:response', responseObject);

//         } catch (error) {
//             // Manejo de errores mejorado
//             if (error.response) {
//                 logger.error(`Error del Motor de IA: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
//             } else if (error.request) {
//                 logger.error(`No se recibió respuesta del Motor de IA. Error: ${error.message}`);
//             } else {
//                 logger.error(`Error al configurar la petición a la IA: ${error.message}`);
//             }
            
//             // Enviamos un objeto de error estandarizado al frontend
//             // para que pueda manejarlo de forma consistente.
//             socket.emit('rubiko:response', {
//                 answer: "Lo siento, estoy teniendo algunos problemas técnicos para pensar. Por favor, inténtalo de nuevo más tarde.",
//                 details: "No se pudo establecer conexión con el motor de inteligencia artificial.",
//                 source: "error"
//             });
//         }
//     });

//     socket.on('disconnect', () => {
//         logger.info(`👋 Un usuario se ha desconectado del chat: ${socket.id}`);
//     });
// });

// // --- Conexión a la Base de Datos y Arranque del Servidor ---
// connection().then(() => {
//     logger.info("Conexión a la base de datos establecida correctamente!!");

//     // Ponemos a escuchar el 'server' de HTTP, que incluye Express y Socket.IO.
//     server.listen(port, () => {
//         logger.info(`API NODE para Rubik arrancada en: http://localhost:${port}`);
//     });
    
// }).catch(err => {
//     logger.error("Error al conectar a la base de datos:", err);
// });   


'use strict'

// --- Carga de Módulos ---
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const axios = require('axios');
require('dotenv').config();

// --- Módulos Personalizados ---
const logger = require('./config/logger');
const connection = require('./database/connection');

const app = express();
const port = process.env.PORT || 3900;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// --- Cargar Rutas (Añade las tuyas aquí) ---
// const userRoutes = require('./routes/user');
// app.use('/api', userRoutes);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// --- LÓGICA DE SOCKET.IO CORREGIDA ---
io.on('connection', (socket) => {
    logger.info(`🤖 Un usuario se ha conectado al chat de Rubiko: ${socket.id}`);

    socket.on('rubiko:message', async (data) => { // Recibimos el objeto 'data'
        
        // 1. Desestructuramos el objeto para obtener sus partes
        const { query, history } = data;

        // 2. Usamos 'query' (el string) para el log
        logger.info(`Mensaje para la IA: "${query}" con historial de ${history.length} turnos.`);
        
        const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000/chat';

        try {
            logger.info(`Enviando a la IA en: ${AI_ENGINE_URL}`);
            
            // 3. Construimos el cuerpo de la petición a la IA con las partes correctas.
            //    La clave 'chat_history' debe coincidir con la que espera Pydantic en la IA.
            const aiResponse = await axios.post(AI_ENGINE_URL, {
                query: query,
                chat_history: history 
            });

            const responseText = aiResponse.data.answer;
            socket.emit('rubiko:response', responseText);

        } catch (error) {
            if (error.response) {
                logger.error(`Error del Motor de IA: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                logger.error(`No se recibió respuesta del Motor de IA. Error: ${error.message}`);
            } else {
                logger.error(`Error al configurar la petición a la IA: ${error.message}`);
            }
            socket.emit('rubiko:response', "Lo siento, estoy teniendo algunos problemas técnicos para pensar. Por favor, inténtalo de nuevo más tarde.");
        }
    });

    socket.on('disconnect', () => {
        logger.info(`👋 Un usuario se ha desconectado del chat: ${socket.id}`);
    });
});  

// --- Arranque del Servidor ---
connection().then(() => {
    logger.info("Conexión a la base de datos establecida correctamente!!");
    server.listen(port, () => {
        logger.info(`API NODE para Rubik arrancada en: http://localhost:${port}`);
    });
}).catch(err => {
    logger.error("Error al conectar a la base de datos:", err);
});