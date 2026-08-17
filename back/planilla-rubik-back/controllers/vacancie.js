// controllers/vacancie.js
// const connection = require("../database/connection"); // Ya no es necesario si se maneja globalmente
const VacancieService = require("../services/VacancieService");
const logger = require('../config/logger'); // Para logging específico si se necesita

const prueVacan = async (req, res, next) => { // Añadido next
  // try { // express-async-errors maneja esto
    // await connection(); // Considera si es necesario
    const searchQuery = req.query.search;
    // logger.info(`Solicitando vacantes, búsqueda: '${searchQuery || ''}'`);
    const vacancies = await VacancieService.getAllVacancies(searchQuery);
    return res.status(200).json(vacancies);
  // } catch (error) {
  //   next(error); // Pasar al middleware de error global
  // }
};

const register = async (req, res, next) => { // Añadido next
  // try { // express-async-errors maneja esto
    const vacancieData = req.body;

    // Validación básica de campos requeridos en el controlador
    const requiredFields = ['id', 'manager_id', 'manager_name', 'Nombre', 'Vacante', 'fecha_de_pedido', 'fecha_de_inicio', 'Seniority'];
    const missingFields = [];
    for (const field of requiredFields) {
        if (vacancieData[field] === undefined || vacancieData[field] === null || String(vacancieData[field]).trim() === "") {
            // Excepción para 'id' si puede ser 0 y es válido (aunque usualmente los IDs son > 0)
            if (field === 'id' && vacancieData[field] === 0) continue;
            missingFields.push(field);
        }
    }
    if (vacancieData.Tiempo == null) { // Tiempo puede ser 0 pero no null/undefined
        missingFields.push('Tiempo');
    }

    if (missingFields.length > 0) {
      const error = new Error(`Faltan datos obligatorios o están vacíos: ${missingFields.join(", ")}.`);
      error.statusCode = 400;
      error.isOperational = true;
      throw error; // express-async-errors lo pasará a next(error)
    }
    // Validar formato de fechas (el servicio las convertirá a Date, pero una validación temprana es buena)
    if (isNaN(new Date(vacancieData.fecha_de_pedido).getTime())) {
        const error = new Error("Formato de 'fecha_de_pedido' inválido.");
        error.statusCode = 400; error.isOperational = true; throw error;
    }
    if (isNaN(new Date(vacancieData.fecha_de_inicio).getTime())) {
        const error = new Error("Formato de 'fecha_de_inicio' inválido.");
        error.statusCode = 400; error.isOperational = true; throw error;
    }


    // logger.debug("Controlador: Datos para registrar vacante:", vacancieData);
    const savedVacancy = await VacancieService.registerVacancy(vacancieData);
    // logger.info("Controlador: Vacante registrada:", { id: savedVacancy.id, nombre: savedVacancy.Nombre });

    return res.status(201).json({
      status: "success",
      message: "Vacante registrada correctamente",
      vacancie: savedVacancy,
    });
  // } catch (error) {
  //   next(error); // Pasar al middleware de error global
  // }
};

const getVacancieById = async (req, res, next) => { // Añadido next
  // try {
    const { id } = req.params;
     if (!id || isNaN(parseInt(id, 10))) { // Validar que ID es numérico
        const error = new Error("El ID de la vacante debe ser un número válido y es requerido.");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
    }
    // logger.info(`Solicitando vacante por ID: ${id}`);
    const vacant = await VacancieService.getVacancyById(id);
    return res.status(200).json({
      status: "success",
      data: vacant,
    });
  // } catch (error) {
  //   next(error);
  // }
};

const editVacan = async (req, res, next) => { // Añadido next
  // try {
    const { id } = req.params;
    const updates = req.body;

    if (!id || isNaN(parseInt(id, 10))) {
        const error = new Error("El ID de la vacante debe ser un número válido y es requerido en la URL.");
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
    // Validar formato de fechas si se actualizan
    if (updates.fecha_de_pedido && isNaN(new Date(updates.fecha_de_pedido).getTime())) {
        const error = new Error("Formato de 'fecha_de_pedido' inválido para la actualización.");
        error.statusCode = 400; error.isOperational = true; throw error;
    }
    if (updates.fecha_de_inicio && isNaN(new Date(updates.fecha_de_inicio).getTime())) {
        const error = new Error("Formato de 'fecha_de_inicio' inválido para la actualización.");
        error.statusCode = 400; error.isOperational = true; throw error;
    }


    // logger.debug(`Controlador: Datos para editar vacante ID ${id}:`, updates);
    const updatedVacancie = await VacancieService.updateVacancy(id, updates);
    // logger.info("Controlador: Vacante actualizada:", { id: updatedVacancie.id, nombre: updatedVacancie.Nombre });

    return res.status(200).json({
      status: "success",
      message: "Vacante actualizada correctamente",
      vacancie: updatedVacancie,
    });
  // } catch (error) {
  //   next(error);
  // }
};

const Eliminar = async (req, res, next) => { // Añadido next, Soft delete
  // try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id, 10))) {
        const error = new Error("El ID de la vacante debe ser un número válido y es requerido en la URL para eliminar.");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
    }

    // logger.info(`Solicitando eliminar (soft delete) vacante ID: ${id}`);
    const result = await VacancieService.softDeleteVacancy(id);
    // logger.info("Controlador: Vacante marcada como eliminada:", result);

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

module.exports = {
  prueVacan,
  register,
  getVacancieById,
  editVacan,
  Eliminar,
};