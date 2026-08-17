const stateprojectsService = require("../services/stateprojectsService");
const logger = require("../config/logger");

// const pruebastate = async (req, res, next) => {
//   try {
//     logger.info("Acceso a /api/stateprojects/test");
//     res.json({ message: "Controller de stateprojects funcionando correctamente 💅" });
//   } catch (err) {
//     next(err);
//   }
// };

const getAllStates = async (req, res, next) => {
  try {
    const states = await stateprojectsService.getAllStates();
    res.status(200).json(states);
  } catch (err) {
    next(err);
  }
};

// const getStateById = async (req, res, next) => {
//   try {
//     const state = await stateprojectsService.getStateById(req.params.id);
//     if (!state) {
//       return res.status(404).json({ message: "Estado no encontrado" });
//     }
//     res.status(200).json(state);
//   } catch (err) {
//     next(err);
//   }
// };

// const register = async (req, res, next) => {
//   try {
//     const { id, status } = req.body;

//     if (!id || String(id).trim() === "") {
//       const error = new Error("El campo 'id' es obligatorio.");
//       error.statusCode = 400;
//       error.isOperational = true;
//       throw error;
//     }

//     const saved = await stateprojectsService.registerState({ id, status });

//     res.status(201).json({
//       status: "success",
//       message: "Estado registrado correctamente",
//       data: saved
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// const updateState = async (req, res, next) => {
//   try {
//     const updated = await stateprojectsService.updateState(req.params.id, req.body);
//     res.status(200).json({
//       status: "success",
//       message: "Estado actualizado correctamente",
//       data: updated
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// const deleteState = async (req, res, next) => {
//   try {
//     const deleted = await stateprojectsService.deleteState(req.params.id);
//     res.status(200).json({
//       status: "success",
//       message: "Estado eliminado correctamente",
//       data: deleted
//     });
//   } catch (err) {
//     next(err);
//   }
// };

module.exports = {
//   pruebastate,
  getAllStates,
//   getStateById,
//   register,
//   updateState,
//   deleteState
};
