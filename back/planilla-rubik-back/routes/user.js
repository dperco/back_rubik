

// routes/user.js
const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const upload = require('../middlewares/multerConfig'); // Importar tu configuración de Multer
const logger = require('../config/logger');         // Importar tu logger Winston
// const UserService = require('../services/UserService'); // Si se  necesita llamar al servicio directamente aquí

// Rutas públicas y de autenticación
router.get("/prueba", UserController.pruebauser); // Ruta de prueba general
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/authorize/:token/:action", UserController.handleAuthorization); // Para activación de cuenta
router.post("/auth/editpws", UserController.editPassword); // Solicitud de reseteo de contraseña
router.post("/auth/resetpassword", UserController.resetPassword); // Reseteo de contraseña

// Rutas que podrían requerir autenticación en una aplicación real
// Por ahora, las mantenemos como en el original. Si se añade un middleware de autenticación,
// se aplicaría aquí. Ejemplo: router.put("/update/:email", authMiddleware, UserController.updateUser);

router.put("/update/:email", UserController.updateUser);
router.post("/delete/:email", UserController.deleteUser); // Cambiado a DELETE semánticamente, aunque uses POST

// --- Ejemplo de Ruta para Subida de Imagen de Perfil ---
// Asumir que se tiene un UserController.updateProfileImage o un UserService.updateProfileImage
// El 'profileImageField' debe coincidir con el 'name' del input file en el formulario del frontend.
router.post(
  "/profile/:userId/image", // :userId podría ser el email o el _id de MongoDB
  upload.single('profileImageField'), // 'profileImageField' es el nombre del campo en el form-data
  async (req, res, next) => { // Usamos next para pasar errores al manejador global
    try {
      if (!req.file) {
        logger.warn(`Intento de subida de imagen de perfil sin archivo para usuario ${req.params.userId}`);
        // Crear un error operacional para que el manejador global lo tome
        const err = new Error('No se subió ningún archivo.');
        err.statusCode = 400;
        err.isOperational = true; // Marcar como error esperado
        return next(err);
      }

      const userId = req.params.userId; // Podría ser email o _id
      const filePath = `/public/uploads/${req.file.filename}`; // Ruta relativa para acceder al archivo

      // --- Lógica para actualizar la imagen del usuario ---
      // Aquí se  llamaría a un método del UserController o UserService
      // Ejemplo (se necesitaría implementar esto en el UserController/UserService):
      // await UserController.handleProfileImageUpload(req, res, next);
      // O, si se prefiere manejarlo directamente aquí (menos ideal para separación de concerns):
      // await UserService.updateUserImage(userId, filePath);
      // --- Fin Lógica para actualizar ---

      // Por ahora, solo respondemos con éxito y la información del archivo
      logger.info(`Imagen de perfil subida: ${req.file.filename} para usuario/ID ${userId}. Ruta: ${filePath}`);
      res.status(200).json({
        status: 'success',
        message: 'Imagen de perfil subida exitosamente!',
        data: {
          filePath: filePath,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          uploadedFilename: req.file.filename
        }
      });
    } catch (error) {
      // Si tu UserService.updateUserImage lanzar un error (ej. usuario no encontrado),
      // `express-async-errors` debería pasarlo al manejador global.
      // Si se  quiere manejarlo aquí explícitamente:
      logger.error(`Error al procesar subida de imagen para ${req.params.userId}: ${error.message}`);
      // Asegurarse que el error tenga statusCode para el manejador global
      if (!error.statusCode) error.statusCode = 500;
      next(error); // Pasar al manejador de errores global
    }
  }
);


// --- Manejo de Errores Específico de Multer para estas rutas de usuario ---
// Colócarlo DESPUÉS de todas las rutas que usen 'upload' en este archivo de router.
router.use((err, req, res, next) => {
  if (err instanceof upload.constructor.MulterError) { // Verificar si es un MulterError
    logger.warn(`Error de Multer en rutas de usuario: ${err.message} (code: ${err.code})`);
    let message = `Error al subir archivo: ${err.message}`;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'El archivo es demasiado grande. El límite es 5MB.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Campo de archivo inesperado o demasiados archivos.';
    }
    return res.status(400).json({ status: 'fail', message: message });
  } else if (err && err.message && err.message.startsWith('Tipo de archivo no permitido')) {
    // Este es el error personalizado del fileFilter en multerConfig.js
    logger.warn(`Error de tipo de archivo en rutas de usuario: ${err.message}`);
    return res.status(400).json({ status: 'fail', message: err.message });
  }
  // Si no es un error de Multer o del filtro conocido, pasar al siguiente manejador de errores (el global)
  next(err);
});


module.exports = router;