
// services/UserService.js
const bcrypt = require("bcrypt");
const User = require("../models/user"); // Ajustar la ruta si es necesario
const jwtService = require("./jwt"); // Ajustar la ruta si el archivo jwt.js está en otro lugar
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const logger = require('../config/logger'); // Importar tu logger Winston
require("dotenv").config(); // Asegúrarse que esto solo se llame una vez en la app (usualmente en index.js)
                           // Si ya está en index.js,  quitarlo de aquí y otros servicios.

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

class UserService {
  constructor() {
    this.baseUrl = process.env.BACKEND_URL || "https://rubik-dev.app.mindfactory.ar/api/user";
    this.frontendUrl = process.env.FRONTEND_URL || "https://rubik-dev.app.mindfactory.ar";
  }

  async getAllUsers() {
    // No hay errores esperados aquí que necesiten isOperational,
    // si falla la DB, será un error 500 que el middleware global capturará.
    return User.find({ delete_at: null }).select("-password -temporalToken -created_at -delete_at");
  }

  async _sendAdminAuthorizationEmail(userData, authToken) {
    const mailOptions = {
      from: `Plataforma Rubik <${process.env.EMAIL_USER}>`, // Mejor incluir un nombre
      to: process.env.ADMIN_EMAIL,
      subject: "Nueva solicitud de registro de usuario",
      html: `
            <h2>Nueva solicitud de registro</h2>
            <p>Solicitud de registro en la plataforma con los siguientes datos:</p>
            <ul>
                <li>Nombre: ${userData.name}</li>
                <li>Email: ${userData.email}</li>
                <li>Rol: ${userData.rol}</li>
            </ul>
            <p>Por favor, autoriza o rechaza la solicitud:</p>
            <div>
                <a href="${this.baseUrl}/authorize/${authToken}/approve" 
                   style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                   Aprobar
                </a>
                <a href="${this.baseUrl}/authorize/${authToken}/reject" 
                   style="display: inline-block; background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                   Rechazar
                </a>
            </div>
        `,
    };
    // Este método es interno, si falla, el error se propagará al método que lo llama.
    await transporter.sendMail(mailOptions);
  }

  async registerUser(userData) {
    const existingUser = await User.findOne({
      email: userData.email.toLowerCase(),
      delete_at: null // Solo considerar usuarios activos o pendientes, no los borrados
    });
    if (existingUser) {
      const error = new Error("El correo electrónico ya está registrado.");
      error.statusCode = 409; // 409 Conflict es más apropiado
      error.isOperational = true;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const authToken = crypto.randomBytes(32).toString("hex");

    const userToSave = new User({
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      rol: userData.rol,
      status: "pending",
      temporalToken: authToken,
      // created_at se establece por defecto en el modelo
    });

    try {
      await this._sendAdminAuthorizationEmail(userData, authToken);
    } catch (emailError) {
      logger.error("Error al enviar email de autorización al admin durante el registro:", {
          message: emailError.message,
          stack: emailError.stack, // Loguear stack para errores de envío de email
          userEmail: userData.email
      });
      // Lanzar un error más genérico al usuario, pero específico para el log
      const error = new Error("Se produjo un error al intentar enviar el email de verificación al administrador. Por favor, contacta al soporte.");
      error.statusCode = 500; // Error del servidor porque el email no se pudo enviar
      // No marcar como isOperational=true a menos que queramos que el mensaje exacto llegue al usuario
      // En este caso, es un fallo del sistema de envío de email.
      throw error;
    }
    
    const savedUser = await userToSave.save();
    const { password, temporalToken, ...userToReturn } = savedUser.toObject();
    return userToReturn;
  }

  async processAuthorization(token, action) {
    const user = await User.findOne({ temporalToken: token });
    if (!user) {
      const error = new Error("Solicitud de autorización ya procesada, inválida o el token ha expirado.");
      error.statusCode = 410; // 410 Gone es bueno para tokens de un solo uso
      error.isOperational = true;
      throw error;
    }
     if(user.status !== 'pending') {
      const error = new Error(`Esta solicitud ya fue procesada. Estado actual del usuario: ${user.status}.`);
      error.statusCode = 409; // Conflict
      error.isOperational = true;
      throw error;
    }


    let emailSubject, emailHtml, userStatusMessage;

    if (action === "approve") {
      user.status = "active";
      userStatusMessage = "Usuario aprobado.";
      emailSubject = "¡Tu registro ha sido aprobado!";
      emailHtml = `<h2>¡Registro Aprobado!</h2><p>Hola ${user.name},</p><p>Tu solicitud de registro ha sido aprobada. Ya puedes acceder al sistema.</p><a href="${this.frontendUrl}/login" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Iniciar Sesión</a>`;
    } else if (action === "reject") {
      user.status = "rejected";
      userStatusMessage = "Usuario rechazado.";
      emailSubject = "Tu solicitud de registro ha sido rechazada";
      emailHtml = `<h2>Registro Rechazado</h2><p>Hola ${user.name},</p><p>Lamentamos informarte que tu solicitud de registro ha sido rechazada.</p>`;
    } else {
      const error = new Error("Acción de autorización no válida. Debe ser 'approve' o 'reject'.");
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    user.temporalToken = undefined;
    await user.save();

    try {
      await transporter.sendMail({
        from: `Plataforma Rubik <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: emailSubject,
        html: emailHtml,
      });
    } catch (emailError) {
        // Loguear el error pero no fallar la operación principal (el usuario ya fue aprobado/rechazado)
        logger.error(`Error al enviar email de ${action} al usuario ${user.email}:`, {
            message: emailError.message,
            stack: emailError.stack
        });
    }
    return { message: userStatusMessage, userEmail: user.email };
  }

  async loginUser(email, password) {
    const user = await User.findOne({ email: email.toLowerCase(), delete_at: null });
    if (!user) {
      const error = new Error("Credenciales inválidas."); // Mensaje genérico para no revelar si el email existe
      error.statusCode = 401; // Unauthorized
      error.isOperational = true;
      throw error;
    }
    
    // 'delete_at' ya está cubierto por la query, pero una doble verificación no daña
    // if (user.delete_at) { ... }

    if (user.status === "pending") {
      const error = new Error("Tu cuenta está pendiente de aprobación por un administrador.");
      error.statusCode = 403; // Forbidden
      error.isOperational = true;
      error.userStatus = user.status;
      throw error;
    }
    if (user.status === "rejected") {
      const error = new Error("Tu cuenta ha sido rechazada. Por favor, contacta al soporte.");
      error.statusCode = 403; // Forbidden
      error.isOperational = true;
      error.userStatus = user.status;
      throw error;
    }
    if (user.status !== "active") { // Cualquier otro estado no activo
      const error = new Error(`El estado de tu cuenta (${user.status}) no permite el inicio de sesión.`);
      error.statusCode = 403; // Forbidden
      error.isOperational = true;
      error.userStatus = user.status;
      throw error;
    }


    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      const error = new Error("Credenciales inválidas."); // Mensaje genérico
      error.statusCode = 401; // Unauthorized
      error.isOperational = true;
      throw error;
    }

    const token = jwtService.createToken(user);
    const { password: _, created_at, delete_at, temporalToken, ...userWithoutSensitiveData } = user.toObject();
    
    return { user: userWithoutSensitiveData, token };
  }

  async updateUserByEmail(email, updateData) {
    const allowedUpdates = {};
    if (updateData.hasOwnProperty('rol')) allowedUpdates.rol = updateData.rol;
    if (updateData.hasOwnProperty('status')) allowedUpdates.status = updateData.status;
    if (updateData.hasOwnProperty('name')) allowedUpdates.name = updateData.name; // Permitir actualizar nombre

    // No permitir actualizar campos críticos directamente por esta vía general
    delete allowedUpdates.email;
    delete allowedUpdates.password;
    delete allowedUpdates.temporalToken;


    if (Object.keys(allowedUpdates).length === 0) {
        const error = new Error("No se proporcionaron datos válidos para actualizar.");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase(), delete_at: null }, // Solo usuarios activos/existentes no borrados
      allowedUpdates,
      { new: true, runValidators: true } // runValidators para aplicar validaciones del schema
    ).select("-password -temporalToken -delete_at -created_at");

    if (!updatedUser) {
      const error = new Error("Usuario no encontrado o no se pudo actualizar.");
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    return updatedUser;
  }

  async softDeleteUserByEmail(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const error = new Error("Usuario con el email proporcionado no existe.");
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (user.delete_at) {
      const error = new Error("Este usuario ya está marcado como eliminado.");
      error.statusCode = 400; // Bad Request o 409 Conflict
      error.isOperational = true;
      error.delete_at = user.delete_at;
      throw error;
    }

    user.delete_at = new Date();
    user.status = "deleted"; // Actualizar estado también
    user.temporalToken = undefined; // Invalidar tokens temporales
    const deletedUser = await user.save();
    
    const { password, temporalToken, ...userData } = deletedUser.toObject();
    return userData;
  }

  async requestPasswordReset(email) {
    const user = await User.findOne({ email: email.toLowerCase(), delete_at: null });
    if (!user) {
      // No revelar si el email existe o no por seguridad.
      // El controlador dará un mensaje genérico. Este error es para el log.
      logger.warn(`Intento de reseteo de contraseña para email no existente o borrado: ${email}`);
      const error = new Error("Usuario no encontrado para reseteo de contraseña."); // Mensaje interno
      error.statusCode = 404; // Internamente sabemos que no se encontró
      error.isOperational = false; // No es para el cliente directamente
      throw error;
    }

    if (user.status !== 'active') {
        const error = new Error(`La cuenta asociada a ${email} no está activa (estado: ${user.status}). No se puede restablecer la contraseña.`);
        error.statusCode = 403; // Forbidden
        error.isOperational = true; // El cliente puede saber esto
        throw error;
    }
    
    // Aquí se podría generar un token de reseteo y guardarlo en el usuario con expiración
    // const resetToken = crypto.randomBytes(20).toString('hex');
    // user.resetPasswordToken = resetToken;
    // user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    // await user.save();
    // const resetUrl = `${this.frontendUrl}/reset-password/${resetToken}`;

    // Por ahora, usando la lógica original con enlace directo, pero añadiendo email al link
    const resetLink = `${this.frontendUrl}/pages/resetpws?email=${encodeURIComponent(user.email)}`;


    try {
      await transporter.sendMail({
        from: `Plataforma Rubik <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Restablecer tu contraseña",
        html: `
          <p>Hola ${user.name},</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
          <p>Haz clic en el siguiente botón para cambiar tu contraseña:</p>
          <a href="${resetLink}" 
             style="display: inline-block; background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
             Cambiar Contraseña
          </a>
          <p>Si no solicitaste un cambio de contraseña, puedes ignorar este correo.</p>
        `,
      });
    } catch (emailError) {
        logger.error("Error al enviar email de recuperación de contraseña:", {
            message: emailError.message,
            stack: emailError.stack,
            userEmail: user.email
        });
        const error = new Error("No se pudo enviar el email de recuperación. Por favor, intenta de nuevo más tarde.");
        error.statusCode = 500; // Error del servidor (sistema de email)
        // No es 'isOperational' porque el mensaje es genérico y el problema es interno.
        throw error;
    }
    // El controlador debe dar un mensaje genérico al usuario
    return { message: "Email de solicitud de reseteo enviado (si el usuario existe y está activo)." };
  }

  async resetUserPassword(email, newPassword) {
    // Sería mejor verificar con un token de reseteo aquí.
    const user = await User.findOne({ email: email.toLowerCase(), delete_at: null });
    if (!user) {
      const error = new Error("Usuario no encontrado o enlace de reseteo inválido/expirado.");
      error.statusCode = 404; // O 400 Bad Request
      error.isOperational = true;
      throw error;
    }
    // if (!user.resetPasswordToken || user.resetPasswordToken !== tokenFromParams || user.resetPasswordExpires < Date.now()) {
    //     const error = new Error("Token de reseteo inválido o expirado.");
    //     error.statusCode = 400; error.isOperational = true; throw error;
    // }
    if (user.status !== 'active') {
        const error = new Error(`La cuenta no está activa y no se puede cambiar la contraseña.`);
        error.statusCode = 403; error.isOperational = true; throw error;
    }


    user.password = await bcrypt.hash(newPassword, 10);
    // user.resetPasswordToken = undefined; // Limpiar token de reseteo
    // user.resetPasswordExpires = undefined;
    await user.save();
    return { message: "Contraseña actualizada con éxito. Ya puedes iniciar sesión." };
  }
}

module.exports = new UserService();