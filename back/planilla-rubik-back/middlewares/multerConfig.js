// middlewares/multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Para verificar/crear carpetas
const logger = require('../config/logger');

const uploadDir = path.join(__dirname, '../public/uploads/');

// Asegurarse de que el directorio de subida exista
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
    logger.info(`Directorio de subida creado en: ${uploadDir}`);
}


// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de archivos (opcional, para aceptar solo ciertos tipos de archivos)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
    cb(null, true);
  } else {
    logger.warn(`Intento de subir archivo no permitido: ${file.originalname} (${file.mimetype})`);
    // Crear un error que el manejador de errores pueda identificar
    const err = new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (jpeg, png, gif).');
    err.isOperational = true; // Marcar como error esperado
    err.statusCode = 400;
    cb(err, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // Límite de 5MB por archivo
  },
  fileFilter: fileFilter
});

module.exports = upload;