
// controllers/userController.js
const UserService = require("../services/UserService"); // Asumiendo que ya existe este servicio
const logger = require('../config/logger'); // Para logging específico del controlador si es necesario

// Ejemplo de cómo se vería un método
const login = async (req, res, next) => { // Añade 'next'
  // try { // express-async-errors maneja el try-catch para funciones async
    const params = req.body;

    // Validaciones 
    if (!params.email || !params.password) {
      const error = new Error("Faltan email o contraseña.");
      error.statusCode = 400;
      error.isOperational = true; // Es un error esperado del cliente
      throw error; // express-async-errors lo pasará a next(error)
    }

    const { user, token } = await UserService.loginUser(params.email, params.password);
    // Si UserService.loginUser lanza un error, express-async-errors lo capturará

    return res.status(200).json({
      status: "success",
      message: "Usuario logueado correctamente",
      user,
      token,
    });
  // } catch (error) {
  //   // Ya no se necesita este catch si se usa express-async-errors y un middleware de error global
  //   // logger.error(`Error en login controller: ${error.message}`); // El middleware global ya loguea
  //   // next(error); // Pasa el error al middleware global
  // }
};

const register = async (req, res, next) => {
    const params = req.body;
    if (!params.name || !params.email || !params.password || !params.rol) {
        const err = new Error("Faltan datos requeridos para el registro.");
        err.statusCode = 400;
        err.isOperational = true;
        throw err;
    }
    // logger.info('Registrando nuevo usuario:', { email: params.email, name: params.name }); // Ejemplo de log
    const registeredUser = await UserService.registerUser(params);
    return res.status(201).json({
        status: "success",
        message: "Solicitud de registro enviada. Pendiente de autorización.",
        user: registeredUser,
    });
};


const pruebauser = async (req, res, next) => {
    const users = await UserService.getAllUsers(); // Suponiendo que este método existe y puede fallar
    return res.status(200).json(users);
};

const handleAuthorization = async (req, res, next) => {
    const { token, action } = req.params;
    const result = await UserService.processAuthorization(token, action);
    // Para links de email, es común enviar HTML simple, no JSON
    // Si UserService lanza un error, irá al manejador global, que responde JSON.
    
    if (result.error) { // Suponiendo que el  servicio puede devolver una estructura con error
        return res.status(result.statusCode || 400).send(result.message);
    }
    return res.send(`${result.message} Puede cerrar esta ventana.`);
};

const updateUser = async (req, res, next) => {
    const email = req.params.email;
    const updates = req.body;
    const updatedUser = await UserService.updateUserByEmail(email, updates);
    return res.status(200).json({
        status: "success", message: "Usuario actualizado correctamente", user: updatedUser,
    });
};

const deleteUser = async (req, res, next) => {
    const email = req.params.email;
    const deletedUserData = await UserService.softDeleteUserByEmail(email);
    return res.status(200).json({
        status: "success", message: "Usuario marcado como eliminado", user: deletedUserData,
    });
};

const editPassword = async (req, res, next) => { // Solicitud de reseteo
    const { email } = req.body;
    if (!email) {
        const err = new Error("Email es requerido para solicitar reseteo.");
        err.statusCode = 400; err.isOperational = true; throw err;
    }
    try {
        await UserService.requestPasswordReset(email);
        // Mensaje genérico al usuario por seguridad
        return res.status(200).json({ message: "Si tu correo está registrado y activo, recibirás un email con instrucciones." });
    } catch (error) {
        // Si el servicio lanza un error 404 (usuario no encontrado/activo),
        // aún así devolvemos el mensaje genérico por seguridad.
        // El logger global ya registrará el error real.
        if (error.statusCode === 404 && !error.isOperational) {
             logger.warn(`Intento de reseteo para email no procesable (controlador): ${email}`);
             return res.status(200).json({ message: "Si tu correo está registrado y activo, recibirás un email con instrucciones." });
        }
        next(error); // Otros errores (ej. fallo al enviar email) pasan al global
    }
};

const resetPassword = async (req, res, next) => {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email || !newPassword || !confirmPassword) {
        const err = new Error("Faltan datos para el reseteo de contraseña.");
        err.statusCode = 400; err.isOperational = true; throw err;
    }
    if (newPassword !== confirmPassword) {
        const err = new Error("Las contraseñas no coinciden.");
        err.statusCode = 400; err.isOperational = true; throw err;
    }
    await UserService.resetUserPassword(email, newPassword);
    return res.status(200).json({ message: "Contraseña actualizada con éxito." });
};


module.exports = {
  pruebauser,
  register,
  login,
  handleAuthorization,
  updateUser,
  deleteUser,
  editPassword,
  resetPassword,
  // No hay handleProfileImageUpload aquí porque eliminamos falta lógica de Multer para imagenes
};