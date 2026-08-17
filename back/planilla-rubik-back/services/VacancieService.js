// services/VacancieService.js
const Vacan = require("../models/vacancie"); // Ajustar la ruta si el modelo está en otro lugar
const logger = require('../config/logger');   // Importa tu logger Winston

class VacancieService {
  async getAllVacancies(searchQuery) {
    let query = { delete_at: null }; // Por defecto, no mostrar las borradas lógicamente
    if (searchQuery && String(searchQuery).trim()) {
      const searchTrimmed = String(searchQuery).trim();
      const searchRegex = { $regex: searchTrimmed, $options: "i" };
      query = {
        ...query,
        $or: [
          { Nombre: searchRegex },
          { Vacante: searchRegex },
          { Seniority: searchRegex },
        ],
      };
      // logger.debug('Buscando vacantes con query:', query); // Ejemplo de log
    } else {
      // logger.debug('Obteniendo todas las vacantes activas.'); // Ejemplo de log
    }
    // Considerar excluir campos si no son necesarios en la lista general, ej: .select('-some_internal_field')
    return Vacan.find(query);
  }

  async registerVacancy(vacancieData) {
    // La validación de campos requeridos principales la hace el controlador.
    // Aquí podemos añadir validaciones de negocio o transformaciones.

    // Validar si ya existe una vacante con el mismo ID numérico (si 'id' es provisto por el cliente y debe ser único)
    if (vacancieData.id !== undefined && vacancieData.id !== null) {
        const numericId = parseInt(vacancieData.id, 10);
        if (isNaN(numericId)) {
            const error = new Error("El ID de la vacante proporcionado no es un número válido.");
            error.statusCode = 400;
            error.isOperational = true;
            throw error;
        }
        const existingById = await Vacan.findOne({ id: numericId, delete_at: null });
        if (existingById) {
            const error = new Error(`Ya existe una vacante activa con el ID ${numericId}.`);
            error.statusCode = 409; // Conflict
            error.isOperational = true;
            throw error;
        }
        vacancieData.id = numericId; // Usar el ID parseado
    } else {
        // Si el ID no es provisto o es null/undefined, y el modelo NO lo autogenera
        // (y no es el _id de MongoDB), se necesitaría una estrategia para generarlo aquí
        // o lanzar un error si es mandatorio. Si el modelo Vacan tiene un campo 'id'
        // que no es el _id y es requerido, esta lógica debe asegurar que se provea.
        // Si 'id' es opcional o es el _id de MongoDB, esta parte no es necesaria.
        // Se asume que el  'id' es un campo que se espera del cliente y es numérico.
        if (vacancieData.id === undefined) { // Si se espera un id numérico
             const error = new Error("El ID numérico de la vacante es requerido.");
             error.statusCode = 400;
             error.isOperational = true;
             throw error;
        }
    }


    const newVacan = new Vacan({
      id: vacancieData.id,
      manager_id: vacancieData.manager_id,
      manager_name: vacancieData.manager_name,
      manager_visible_in_org_chart: vacancieData.manager_visible_in_org_chart !== undefined ? vacancieData.manager_visible_in_org_chart : true,
      taxonId: vacancieData.taxonId,
      Nombre: String(vacancieData.Nombre).trim(), // Normalizar
      Vacante: String(vacancieData.Vacante).trim(), // Normalizar
      Tiempo: Number(vacancieData.Tiempo), // Asegurar que sea número
      'Fecha de pedido': new Date(vacancieData.fecha_de_pedido), // Guardar como Date
      'Fecha de inicio': new Date(vacancieData.fecha_de_inicio), // Guardar como Date
      Seniority: String(vacancieData.Seniority).trim(), // Normalizar
      created_at: new Date(),
      delete_at: null,
    });

    try {
      const savedVacancy = await newVacan.save();
      logger.info(`Vacante registrada: ${savedVacancy.Nombre} (ID: ${savedVacancy.id || savedVacancy._id})`);
      return savedVacancy;
    } catch (dbError) {
      // Capturar errores de Mongoose (ej. validación del schema, error de unicidad si hay índices)
      logger.error("Error de base de datos al guardar vacante:", { message: dbError.message, stack: dbError.stack, data: vacancieData });
      if (dbError.name === 'ValidationError') {
        const error = new Error(`Error de validación al registrar la vacante: ${dbError.message}`);
        error.statusCode = 400;
        error.isOperational = true;
        error.details = dbError.errors; // Puede ser útil para el frontend
        throw error;
      }
      // Si es un error de duplicidad de MongoDB (código 11000)
      if (dbError.code === 11000) {
        const field = Object.keys(dbError.keyPattern)[0];
        const error = new Error(`Ya existe una vacante con ese valor para '${field}'.`);
        error.statusCode = 409; // Conflict
        error.isOperational = true;
        throw error;
      }
      // Otro error de base de datos
      const error = new Error("Error interno al guardar la vacante en la base de datos.");
      error.statusCode = 500;
      throw error; // No es operacional porque el mensaje es genérico y el problema es de DB
    }
  }

  async getVacancyById(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
        const error = new Error("El ID de vacante proporcionado no es un número válido.");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
    }
    const vacant = await Vacan.findOne({ id: numericId, delete_at: null });
    if (!vacant) {
      const error = new Error(`Vacante con ID ${numericId} no encontrada o ha sido eliminada.`);
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    return vacant;
  }

  async updateVacancy(id, updates) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
        const error = new Error("El ID de vacante proporcionado para actualizar no es un número válido.");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
    }

    const allowedUpdates = { ...updates };
    // No permitir actualizar 'id', 'created_at', 'delete_at' directamente.
    delete allowedUpdates.id;
    delete allowedUpdates.created_at;
    delete allowedUpdates.delete_at;
    delete allowedUpdates.taxonId; // Si taxonId no debe ser modificable después de creado

    // Mapear nombres de campos si vienen diferentes del frontend y asegurar tipos
    if (updates.hasOwnProperty('fecha_de_pedido')) {
        allowedUpdates['Fecha de pedido'] = new Date(updates.fecha_de_pedido);
        if (!updates.fecha_de_pedido) delete allowedUpdates['Fecha de pedido']; // Si se envía vacío, no actualizar
        delete allowedUpdates.fecha_de_pedido;
    }
    if (updates.hasOwnProperty('fecha_de_inicio')) {
        allowedUpdates['Fecha de inicio'] = new Date(updates.fecha_de_inicio);
         if (!updates.fecha_de_inicio) delete allowedUpdates['Fecha de inicio'];
        delete allowedUpdates.fecha_de_inicio;
    }
    if (updates.hasOwnProperty('Nombre')) allowedUpdates.Nombre = String(updates.Nombre).trim();
    if (updates.hasOwnProperty('Vacante')) allowedUpdates.Vacante = String(updates.Vacante).trim();
    if (updates.hasOwnProperty('Tiempo')) allowedUpdates.Tiempo = Number(updates.Tiempo);
    if (updates.hasOwnProperty('Seniority')) allowedUpdates.Seniority = String(updates.Seniority).trim();

    if (Object.keys(allowedUpdates).length === 0) {
        const error = new Error("No se proporcionaron datos válidos para actualizar la vacante.");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
    }
    // Añadir campos de auditoría si los tenemos
    allowedUpdates.last_edited_on = new Date();
    // allowedUpdates.last_edited_by = req.user.id; // Si tenemos la info del usuario que edita

    const updatedVacancie = await Vacan.findOneAndUpdate(
      { id: numericId, delete_at: null },
      allowedUpdates,
      { new: true, runValidators: true }
    );

    if (!updatedVacancie) {
      const error = new Error(`Vacante con ID ${numericId} no encontrada, ya eliminada, o no se pudo actualizar.`);
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    logger.info(`Vacante actualizada: ${updatedVacancie.Nombre} (ID: ${numericId})`);
    return updatedVacancie;
  }

  async softDeleteVacancy(id) {
    const numericId = parseInt(id, 10);
     if (isNaN(numericId)) {
        const error = new Error("El ID de vacante proporcionado para eliminar no es un número válido.");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
    }

    const vacant = await Vacan.findOne({ id: numericId });
    if (!vacant) {
      const error = new Error(`Vacante con ID ${numericId} no encontrada.`);
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (vacant.delete_at) {
      const error = new Error(`La vacante con ID ${numericId} ya está marcada como eliminada.`);
      error.statusCode = 400;
      error.isOperational = true;
      error.deleted_at = vacant.delete_at;
      throw error;
    }

    vacant.delete_at = new Date();
    await vacant.save();
    logger.info(`Vacante marcada como eliminada: ${vacant.Nombre} (ID: ${numericId})`);
    return { message: "Vacante marcada como eliminada correctamente", id: numericId, deleted_at: vacant.delete_at };
  }
}

module.exports = new VacancieService();