// services/CollaboratorService.js
const Collaborator = require("../models/collaborator"); // Ajustar la ruta si es necesario
const Project = require("../models/projects");
const logger = require('../config/logger');           // Importar  logger Winston

class CollaboratorService {
  async getAllCollaborators(searchQuery) {
    let query = { delete_at: null };
    if (searchQuery && String(searchQuery).trim()) {
      const searchRegex = { $regex: String(searchQuery).trim(), $options: "i" };
      query = {
        ...query,
        $or: [
          { first_name: searchRegex },
          { last_name: searchRegex },
          { email: searchRegex },
        ],
      };
      // logger.debug('Servicio: Buscando colaboradores con query:', query);
    } else {
      // logger.debug('Servicio: Obteniendo todos los colaboradores activos.');
    }
    return Collaborator.find(query).lean(); // Usar lean() para mejor rendimiento si solo lees datos
  }

  _normalizeAndValidateInput(data, isUpdate = false) { // Añadimos isUpdate para validaciones diferentes
    const {
      id, first_name, last_name, email, puesto_trabajo, estado, seniority,
      tecnologias = [],
      tecnologia = "",
      Proyectos: ProyectosFront = [],
      proyecto = "",
      rol = "",
      horasAsignadas = 0,
      fin_contrato
    } = data;

    // 1. Normalizar tecnologias del colaborador
    const techArrayCollaborator = Array.isArray(tecnologias) && tecnologias.length
      ? tecnologias.map(t => String(t).trim()).filter(Boolean)
      : (tecnologia ? [String(tecnologia).trim()].filter(Boolean) : []);

    // 2. Normalizar asignaciones de proyectos
    let projectAssignments = [];
    if (Array.isArray(ProyectosFront) && ProyectosFront.length) {
      projectAssignments = ProyectosFront.map(projAssign => {
        const assignRol = String(projAssign.rol || rol).trim() || "";
        const assignProyectos = String(projAssign.Proyectos || projAssign.nombre || "").trim();
        const assignTecnologias = String(projAssign.tecnologias || projAssign.tecnologia || techArrayCollaborator[0] || "").trim();
        const assignHoras = Number(projAssign.horasAsignadas || projAssign.horas || horasAsignadas) || 0;
        if (!assignProyectos) return null; // Si no hay nombre de proyecto, no es válida la asignación
        return { rol: assignRol, Proyectos: assignProyectos, tecnologias: assignTecnologias, horasAsignadas: assignHoras };
      }).filter(Boolean); // Filtrar nulos (asignaciones sin nombre de proyecto)
    } else if (proyecto && String(proyecto).trim()) {
      projectAssignments = [{
        rol: String(rol).trim() || "",
        Proyectos: String(proyecto).trim(),
        tecnologias: String(techArrayCollaborator[0] || "").trim(),
        horasAsignadas: Number(horasAsignadas) || 0
      }];
    }
    
    // 3. Validar campos obligatorios (diferente para creación y actualización)
    const missingFields = [];
    const requiredForCreation = { id, first_name, last_name, email, puesto_trabajo, estado, seniority };
    const fieldsToValidate = isUpdate ? data : requiredForCreation; // En update, solo validamos los que vienen

    for (const key in fieldsToValidate) {
        // Para la creación, todos los campos en requiredForCreation deben estar.
        // Para la actualización, solo validamos si el campo está presente en 'data' (updates).
        if (requiredForCreation.hasOwnProperty(key)) { // Si es un campo que normalmente es requerido
            if (!isUpdate && (fieldsToValidate[key] === undefined || fieldsToValidate[key] === null || String(fieldsToValidate[key]).trim() === "")) {
                 if (key === 'id' && fieldsToValidate[key] === 0) continue; // Permitir ID 0 si es válido
                 missingFields.push(key);
            } else if (isUpdate && data.hasOwnProperty(key) && (data[key] === null || String(data[key]).trim() === "")) {
                // Si en update se envía un campo requerido como vacío, es un error
                missingFields.push(`${key} (no puede estar vacío si se actualiza)`);
            }
        }
    }
        
    if (!isUpdate && !techArrayCollaborator.length) { // Para creación, tecnologias es requerido
        missingFields.push("tecnologias (del colaborador)");
    }
    
    if (!isUpdate) { // Para creación, validar roles en proyectos
        projectAssignments.forEach((pa, index) => {
          if (!pa.rol) missingFields.push(`rol (para proyecto ${pa.Proyectos || index + 1})`);
        });
    } // Para actualización, si se actualizan proyectos, el frontend debe enviar la estructura completa

    if (missingFields.length > 0) {
      const error = new Error(`Faltan campos obligatorios o están vacíos: ${missingFields.join(", ")}`);
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    // 4. Parsear ID y validar email (solo si se proveen o es creación)
    let numericId;
    if (id !== undefined) {
        numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
          const error = new Error("El ID del colaborador debe ser un número.");
          error.statusCode = 400; error.isOperational = true; throw error;
        }
    } else if (!isUpdate) { // ID es requerido para creación
        const error = new Error("El ID del colaborador es requerido.");
        error.statusCode = 400; error.isOperational = true; throw error;
    }


    if (email !== undefined && !/^\S+@\S+\.\S+$/.test(String(email).trim().toLowerCase())) {
        const error = new Error("Formato de email inválido.");
        error.statusCode = 400; error.isOperational = true; throw error;
    }
    if (fin_contrato && fin_contrato !== null && isNaN(new Date(fin_contrato).getTime())) {
        const error = new Error("Formato de 'fin_contrato' inválido.");
        error.statusCode = 400; error.isOperational = true; throw error;
    }


    return {
      numericId, // Puede ser undefined si es una actualización y no se está actualizando el ID (lo cual no se permite)
      first_name: first_name !== undefined ? String(first_name).trim() : undefined,
      last_name: last_name !== undefined ? String(last_name).trim() : undefined,
      email: email !== undefined ? String(email).trim().toLowerCase() : undefined,
      puesto_trabajo: puesto_trabajo !== undefined ? String(puesto_trabajo).trim() : undefined,
      estado: estado !== undefined ? String(estado).trim() : undefined,
      seniority: seniority !== undefined ? String(seniority).trim() : undefined,
      rol: rol !== undefined ? (String(rol).trim() || (projectAssignments.length > 0 ? projectAssignments[0].rol : "")) : undefined,
      techArrayCollaborator: techArrayCollaborator.length > 0 ? techArrayCollaborator : (isUpdate ? undefined : []),
      projectAssignments: projectAssignments.length > 0 ? projectAssignments : (isUpdate ? undefined : []),
      horasAsignadasColaborador: horasAsignadas !== undefined ? (Number(horasAsignadas) || 0) : undefined,
      fin_contrato: fin_contrato ? new Date(fin_contrato) : (fin_contrato === null ? null : undefined)
    };
  }


  async registerCollaborator(rawData) {
    const validatedData = this._normalizeAndValidateInput(rawData, false); // false para creación
    const {
      numericId, first_name, last_name, email, puesto_trabajo, estado, seniority, rol,
      techArrayCollaborator, projectAssignments, horasAsignadasColaborador, fin_contrato
    } = validatedData;

    const existingByEmail = await Collaborator.findOne({ email, delete_at: null });
    if (existingByEmail) {
      const error = new Error(`Ya existe un colaborador activo con el email ${email}.`);
      error.statusCode = 409; error.isOperational = true; throw error;
    }
    const existingById = await Collaborator.findOne({ id: numericId, delete_at: null });
    if (existingById) {
      const error = new Error(`Ya existe un colaborador activo con el ID ${numericId}.`);
      error.statusCode = 409; error.isOperational = true; throw error;
    }

    const newCollaborator = new Collaborator({
      id: numericId,
      first_name,
      last_name,
      email,
      "Puesto de Trabajo": puesto_trabajo,
      estado,
      seniority,
      rol: puesto_trabajo,
      tecnologias: techArrayCollaborator,
      Proyectos: projectAssignments,
      horasAsignadas: horasAsignadasColaborador,
      "Fin de Contrato": fin_contrato,
      // created_at se establece por defecto
      delete_at: null,
    });
    
    try {
        const savedColab = await newCollaborator.save();
        logger.info(`Colaborador registrado: ${savedColab.first_name} ${savedColab.last_name} (ID: ${savedColab.id})`);
        return savedColab;
    } catch (dbError) {
        logger.error("Error de BD al registrar colaborador:", { message: dbError.message, stack: dbError.stack, data: rawData });
        if (dbError.name === 'ValidationError') {
            const error = new Error(`Error de validación: ${dbError.message}`);
            error.statusCode = 400; error.isOperational = true; error.details = dbError.errors; throw error;
        }
        if (dbError.code === 11000) {
            const field = Object.keys(dbError.keyPattern)[0];
            const error = new Error(`Ya existe un registro con ese valor para '${field}'.`);
            error.statusCode = 409; error.isOperational = true; throw error;
        }
        const error = new Error("Error interno al registrar el colaborador.");
        error.statusCode = 500; throw error;
    }
  }

  async updateCollaborator(id, updates) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
        const error = new Error("El ID del colaborador proporcionado para actualizar no es un número válido.");
        error.statusCode = 400; error.isOperational = true; throw error;
    }

    const currentColab = await Collaborator.findOne({ id: numericId, delete_at: null });
    if (!currentColab) {
      const error = new Error(`Colaborador con ID ${numericId} no encontrado o ha sido eliminado.`);
      error.statusCode = 404; error.isOperational = true; throw error;
    }

    // Normalizar y validar solo los campos que vienen en 'updates'
    // _normalizeAndValidateInput puede ser muy estricto para updates, así que manejamos campos específicos
    const fieldsToUpdate = {};

    // Campos directos (string, number, estado, seniority)
    ['first_name', 'last_name', 'estado', 'seniority', 'rol'].forEach(key => {
        if (updates.hasOwnProperty(key)) fieldsToUpdate[key] = String(updates[key]).trim();
    });
    if (updates.hasOwnProperty('puesto_trabajo')) {
        fieldsToUpdate["Puesto de Trabajo"] = String(updates.puesto_trabajo).trim();
    }
    if (updates.hasOwnProperty('horasAsignadas')) { // Lógica de sumar horas
        const currentHours = currentColab.horasAsignadas || 0;
        fieldsToUpdate.horasAsignadas = currentHours + (Number(updates.horasAsignadas) || 0);
    } else if (updates.hasOwnProperty('setHorasAsignadas')) { // Opción para establecer horas directamente
        fieldsToUpdate.horasAsignadas = Number(updates.setHorasAsignadas) || 0;
    }


    // tecnologias del colaborador
    if (updates.hasOwnProperty('tecnologias') || updates.hasOwnProperty('tecnologia')) {
        const techInput = updates.tecnologias || [];
        const techSingleInput = updates.tecnologia || "";
        fieldsToUpdate.tecnologias = Array.isArray(techInput) && techInput.length
            ? techInput.map(t => String(t).trim()).filter(Boolean)
            : (techSingleInput ? [String(techSingleInput).trim()].filter(Boolean) : []);
    }

    // Proyectos
    if (updates.hasOwnProperty('Proyectos') || updates.hasOwnProperty('proyecto')) {
        const { projectAssignments } = this._normalizeAndValidateInput({ // Usar para normalizar la estructura de proyectos
            Proyectos: updates.Proyectos,
            proyecto: updates.proyecto,
            rol: updates.rol || currentColab.rol,
            tecnologias: fieldsToUpdate.tecnologias || currentColab.tecnologias,
            horasAsignadas: updates.horasAsignadas // O las horas específicas del proyecto si se envían así
        }, true); // true para isUpdate, relaja algunas validaciones de campos requeridos
        fieldsToUpdate.Proyectos = projectAssignments;
    }

    // Fin de contrato
    if (updates.hasOwnProperty('fin_contrato')) {
        if (updates.fin_contrato) {
            fieldsToUpdate["fin_contrato"] = new Date(updates.fin_contrato);
            if (isNaN(fieldsToUpdate["fin_contrato"].getTime())) {
                const error = new Error("Formato de 'fin_contrato' inválido para la actualización.");
                error.statusCode = 400; error.isOperational = true; throw error;
            }
        } else { // Permitir establecer a null
            fieldsToUpdate["fin_contrato"] = null;
        }
    }
    
    // Campos de auditoría
    if (updates.last_edited_by) fieldsToUpdate.last_edited_by = updates.last_edited_by;
    fieldsToUpdate.last_edited_on = new Date();

    if (Object.keys(fieldsToUpdate).filter(k => k !== 'last_edited_on' && k !== 'last_edited_by').length === 0) {
        const error = new Error("No se proporcionaron datos válidos para actualizar (o solo campos de auditoría sin cambios reales).");
        error.statusCode = 400; error.isOperational = true; throw error;
    }


    try {
        const updatedColab = await Collaborator.findOneAndUpdate(
          { id: numericId, delete_at: null },
          fieldsToUpdate,
          { new: true, runValidators: true }
        );
        // findOneAndUpdate no devuelve error si no encuentra, sino null. Ya lo chequeamos con currentColab.
        // if (!updatedColab) { ... } // Este chequeo es redundante si currentColab ya fue verificado.
        logger.info(`Colaborador actualizado: ID ${numericId}`);
        return updatedColab;
    } catch (dbError) {
        logger.error("Error de BD al actualizar colaborador:", { message: dbError.message, stack: dbError.stack, id: numericId });
        if (dbError.name === 'ValidationError') {
            const error = new Error(`Error de validación: ${dbError.message}`);
            error.statusCode = 400; error.isOperational = true; error.details = dbError.errors; throw error;
        }
        const error = new Error("Error interno al actualizar el colaborador.");
        error.statusCode = 500; throw error;
    }
  }

  async softDeleteCollaborator(id) {
    const numericId = parseInt(id, 10);
     if (isNaN(numericId)) {
        const error = new Error("El ID del colaborador proporcionado para eliminar no es un número válido.");
        error.statusCode = 400; error.isOperational = true; throw error;
    }

    const colab = await Collaborator.findOne({ id: numericId });
    if (!colab) {
      const error = new Error(`Colaborador con ID ${numericId} no encontrado.`);
      error.statusCode = 404; error.isOperational = true; throw error;
    }
    if (colab.delete_at) {
      const error = new Error(`El colaborador con ID ${numericId} ya está marcado como eliminado.`);
      error.statusCode = 400; error.isOperational = true; error.deleted_at = colab.delete_at; throw error;
    }

    colab.delete_at = new Date();
    await colab.save();
    logger.info(`Colaborador marcado como eliminado: ID ${numericId}`);
    return { message: "Colaborador marcado como eliminado correctamente", id: numericId, deleted_at: colab.delete_at };
  }

  async checkCollaboratorContractExpirations() {
    const activeColabs = await Collaborator.find({
      delete_at: null,
      "Fin de Contrato": { $ne: null, $exists: true },
    }).lean();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results = activeColabs
      .map(colab => {
        const contractEndDate = colab["Fin de Contrato"];
        if (!contractEndDate) return null;
        const contractEnd = new Date(contractEndDate);
        if (isNaN(contractEnd.getTime())) {
            logger.warn(`Fecha de Fin de Contrato inválida para colaborador ID ${colab.id || colab._id} durante la verificación.`);
            return null;
        }
        contractEnd.setHours(0, 0, 0, 0);
        const diffTime = contractEnd.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 30) {
          return {
            id: colab.id,
            first_name: colab.first_name,
            last_name: colab.last_name,
            daysRemaining: diffDays,
            alertLevel: diffDays < 0 ? "expired" : (diffDays === 0 ? "due_today" : "warning"),
            message: diffDays < 0 ? `Contrato vencido hace ${Math.abs(diffDays)} día(s)` : (diffDays === 0 ? `Contrato vence hoy` : `Contrato vence en ${diffDays} día(s)`),
          };
        }
        return null;
      })
      .filter(Boolean);
      logger.info(`Verificación de expiración de contratos de Colaboradores completada. Encontrados: ${results.length}`);
      return results;
  }

  async getCollaboratorById(id) {
    return Collaborator.findOne({ id: Number(id), delete_at: null });
  }

  /**
 * Elimina un proyecto del array Proyectos de un colaborador.
 * @param {Number} colaboradorId - ID del colaborador
 * @param {String} proyecto - Valor del campo Proyectos a eliminar
 * @returns {Promise<Object>} - El colaborador actualizado
 */
async removeProyectoFromColaborador(id, proyecto) {
  // 1. Eliminar el proyecto del colaborador
  const colaborador = await Collaborator.findOneAndUpdate(
    { id: id },
    { $pull: { Proyectos: { Proyectos: proyecto } } },
    { new: true }
  );

  // 2. Eliminar al colaborador del array assignedPersons del proyecto
  await Project.findOneAndUpdate(
    { name: proyecto },
    { $pull: { assignedPersons: { id: String(id) } } }
  );

  return colaborador;
}
}
  
module.exports = new CollaboratorService();