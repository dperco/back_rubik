const StateProject = require("../models/stateprojects");
const logger = require("../config/logger");

// ✅ Obtener todos los estados
const getAllStates = async () => {
  logger.info("Buscando todos los estados de proyecto");
  return await StateProject.find().sort({ createdAt: -1 });
};

// // ✅ Obtener uno por ID
// const getStateById = async (id) => {
//   logger.debug(`Buscando estado con ID: ${id}`);
//   return await StateProject.findById(id);
// };

// // ✅ Registrar nuevo estado
// const registerState = async ({ id, status }) => {
//   logger.debug(`Intentando registrar estado: ${id}`);

//   const exists = await StateProject.findOne({ id });
//   if (exists) {
//     logger.warn(`Intento de crear estado duplicado: ${id}`);
//     const error = new Error("Ya existe un estado con ese ID.");
//     error.statusCode = 400;
//     error.isOperational = true;
//     throw error;
//   }

//   const newState = new StateProject({ id, status });
//   const saved = await newState.save();
//   logger.info(`Estado registrado con ID: ${saved._id}`);
//   return saved;
// };

// // ✅ Actualizar estado
// const updateState = async (id, data) => {
//   logger.debug(`Intentando actualizar estado ID: ${id}`);

//   const updated = await StateProject.findByIdAndUpdate(id, data, { new: true });
//   if (!updated) {
//     logger.warn(`No se encontró el estado con ID: ${id} para actualizar`);
//     const error = new Error("Estado no encontrado");
//     error.statusCode = 404;
//     error.isOperational = true;
//     throw error;
//   }

//   logger.info(`Estado actualizado correctamente ID: ${id}`);
//   return updated;
// };

// // ✅ Eliminar estado
// const deleteState = async (id) => {
//   logger.debug(`Intentando eliminar estado ID: ${id}`);

//   const deleted = await StateProject.findByIdAndDelete(id);
//   if (!deleted) {
//     logger.warn(`No se encontró el estado con ID: ${id} para eliminar`);
//     const error = new Error("Estado no encontrado");
//     error.statusCode = 404;
//     error.isOperational = true;
//     throw error;
//   }

//   logger.info(`Estado eliminado correctamente ID: ${id}`);
//   return deleted;
// };

module.exports = {
  getAllStates,
//   getStateById,
//   registerState,
//   updateState,
//   deleteState,
};
