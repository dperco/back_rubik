// controllers/collaborator.js
// const connection = require("../database/connection"); // Ya no es necesario si se maneja globalmente
const CollaboratorService = require("../services/CollaboratorService");
const logger = require('../config/logger'); // Para logging específico si se necesita

const pruebaColab = async (req, res, next) => { // Añadido next
  // try { // express-async-errors maneja esto
    const searchQuery = req.query.search;
    // logger.info(`Controlador: Solicitando colaboradores, búsqueda: '${searchQuery || ''}'`);
    const collaborators = await CollaboratorService.getAllCollaborators(searchQuery);
    return res.status(200).json(collaborators);
  // } catch (error) {
  //   next(error); // Pasar al middleware de error global
  // }
};

const register = async (req, res, next) => { // Añadido next
  // try {
    const collaboratorData = req.body;

    // Validación básica de entrada en el controlador (el servicio hará más)
    if (!collaboratorData.id || isNaN(parseInt(collaboratorData.id, 10))) {
        const error = new Error("ID del colaborador es requerido y debe ser un número.");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
    }
    if (!collaboratorData.email || !/^\S+@\S+\.\S+$/.test(collaboratorData.email)) {
        const error = new Error("Email es requerido y debe tener un formato válido.");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
    }
    //  añadir más validaciones aquí para campos como first_name, last_name, etc.
    // que el servicio también verificará.
    const requiredFields = ['first_name', 'last_name', 'puesto_trabajo', 'estado', 'seniority'];
    for (const field of requiredFields) {
        if (!collaboratorData[field] || String(collaboratorData[field]).trim() === '') {
            const error = new Error(`El campo '${field}' es requerido y no puede estar vacío.`);
            error.statusCode = 400; error.isOperational = true; throw error;
        }
    }
    if ((!collaboratorData.tecnologias || !collaboratorData.tecnologias.length) && !collaboratorData.tecnologia) {
        const error = new Error("Se requiere al menos una tecnologia para el colaborador.");
        error.statusCode = 400; error.isOperational = true; throw error;
    }
    if (collaboratorData.fin_contrato && isNaN(new Date(collaboratorData.fin_contrato).getTime())) {
        const error = new Error("Formato de 'fin_contrato' inválido. Use YYYY-MM-DD.");
        error.statusCode = 400; error.isOperational = true; throw error;
    }


    // logger.debug("Controlador: Datos recibidos para registrar colaborador:", collaboratorData);
    const savedCollaborator = await CollaboratorService.registerCollaborator(collaboratorData);
    // logger.info("Controlador: Colaborador guardado:", { id: savedCollaborator.id, email: savedCollaborator.email });

    return res.status(201).json({
      status: "success",
      message: "Colaborador registrado correctamente.",
      Colab: savedCollaborator,
    });
  // } catch (error) {
  //   next(error);
  // }
};

const editColab = async (req, res, next) => { // Añadido next
  // try {
    const { id } = req.params;
    const updates = req.body;

    if (!id || isNaN(parseInt(id, 10))) {
        const error = new Error("El ID del colaborador debe ser un número válido y es requerido en la URL.");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
    }
    if (Object.keys(updates).length === 0) {
      const error = new Error("No se enviaron datos para actualizar.");
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }
    if (updates.fin_contrato && updates.fin_contrato !== null && isNaN(new Date(updates.fin_contrato).getTime())) {
        const error = new Error("Formato de 'fin_contrato' inválido para la actualización. Use YYYY-MM-DD o null.");
        error.statusCode = 400; error.isOperational = true; throw error;
    }
    if (updates.email && !/^\S+@\S+\.\S+$/.test(updates.email)) { // Si se permite actualizar email
        const error = new Error("Formato de email inválido para la actualización.");
        error.statusCode = 400; error.isOperational = true; throw error;
    }


    // logger.debug(`Controlador: Payload para editar colaborador ID ${id}:`, updates);
    const updatedCollaborator = await CollaboratorService.updateCollaborator(id, updates);
    // logger.info("Controlador: Colaborador actualizado:", { id: updatedCollaborator.id });

    return res.status(200).json({
      status: "success",
      message: "Colaborador actualizado correctamente.",
      Colab: updatedCollaborator,
    });
  // } catch (error) {
  //   next(error);
  // }
};

const Eliminar = async (req, res, next) => { // Añadido next, Soft delete
  // try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id, 10))) {
        const error = new Error("El ID del colaborador debe ser un número válido y es requerido en la URL para eliminar.");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
    }

    // logger.info(`Controlador: Solicitando eliminar (soft delete) colaborador ID: ${id}`);
    const result = await CollaboratorService.softDeleteCollaborator(id);
    // logger.info("Controlador: Colaborador marcado como eliminado:", result);

    return res.status(200).json({
      status: "success",
      message: result.message,
      id: result.id,
      deleted_at: result.deleted_at
    });
  // } catch (error) {
  //   next(error);
  // }
};

const checkContractExpiration = async (req, res, next) => { // Añadido next
  // try {
    // logger.info("Controlador: Verificando expiración de contratos de colaboradores.");
    const contractStatusInfo = await CollaboratorService.checkCollaboratorContractExpirations();
    return res.status(200).json({
      status: "success",
      count: contractStatusInfo.length,
      data: contractStatusInfo,
    });
  // } catch (error) {
  //   next(error);
  // }
};

const getCollaboratorById = async (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id, 10))) {
    const error = new Error("El ID del colaborador debe ser un número válido y es requerido en la URL.");
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  const collaborator = await CollaboratorService.getCollaboratorById(id);

  if (!collaborator) {
    return res.status(404).json({
      status: "error",
      message: "Colaborador no encontrado.",
    });
  }

  return res.status(200).json({
    status: "success",
    collaborator,
  });
};

const removeProyecto = async (req, res, next) => {
  const { id } = req.params; 
  const { Proyectos } = req.body; 

  if (!id || !Proyectos) {
    return res.status(400).json({ status: "error", message: "Faltan datos" });
  }

  const colaborador = await CollaboratorService.removeProyectoFromColaborador(Number(id), Proyectos);

  if (!colaborador) {
    return res.status(404).json({ status: "error", message: "Colaborador no encontrado" });
  }

  return res.status(200).json({
    status: "success",
    message: "Proyecto eliminado del colaborador",
    colaborador,
  });
};

module.exports = {
  pruebaColab,
  register,
  editColab,
  Eliminar,
  checkContractExpiration,
  getCollaboratorById,
  removeProyecto,
};