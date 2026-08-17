// services/ProjectService.js
const Project = require("../models/projects"); // Ajustar la ruta si es necesario
const Colab = require("../models/collaborator");
const logger = require('../config/logger');   // Importar el logger Winston

class ProjectService {
  _calculateContractStatus(project) {
    let alertLevel = null;
    let message = null;
    let daysRemaining = null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Usar 'endDate' consistententemente. Si el modelo usa 'Fecha_Fin', cambia aquí.
    const contractEndDateField = project.endDate;

    if (contractEndDateField) {
      const contractEnd = new Date(contractEndDateField);
      if (!isNaN(contractEnd.getTime())) {
        contractEnd.setHours(0, 0, 0, 0);
        const diffTime = contractEnd.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysRemaining = diffDays;

        if (diffDays <= 30) {
          alertLevel = diffDays < 0 ? "expired" : (diffDays === 0 ? "due_today" : "warning");
          message =
            diffDays < 0
              ? `Proyecto vencido hace ${Math.abs(diffDays)} día(s)`
              : (diffDays === 0 ? "Proyecto vence hoy" : `Proyecto vence en ${diffDays} día(s)`);
        } else {
          alertLevel = "on_time";
          message = `Proyecto vigente, vence en ${diffDays} día(s)`;
        }
      } else {
        message = "Fecha de fin inválida en el proyecto.";
        alertLevel = "error_date";
        logger.warn(`Proyecto ID ${project.taxonId || project._id}: Fecha de fin inválida ('${contractEndDateField}')`);
      }
    } else {
      message = "Proyecto sin fecha de fin definida.";
      alertLevel = "no_date";
    }
    return { daysRemaining, alertLevel, message };
  }

  async getAllProjectsWithStatus(searchQuery) {
    const baseFilter = { delete_at: null };

    // Usar 'name' para la búsqueda. Si el modelo usa 'Nombre', cambia aquí.
    if (searchQuery && String(searchQuery).trim()) {
      baseFilter.name = { $regex: String(searchQuery).trim(), $options: "i" };
    }

    const projects = await Project.find(baseFilter).lean(); // .lean() para mejor rendimiento
    
    const enrichedProjects = projects.map((project) => {
      const contractStatus = this._calculateContractStatus(project);
      return {
        ...project, // Ya es un POJO debido a .lean()
        contractStatus,
      };
    });

    return enrichedProjects;
  }

  async getProjectByTaxonId(taxonId) {
    const numericTaxonId = parseInt(taxonId, 10);
    if (isNaN(numericTaxonId)) {
        const error = new Error("El taxonId del proyecto proporcionado no es un número válido.");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
    }
    // .lean() opcional aquí si solo se va  a devolver
    const project = await Project.findOne({ taxonId: numericTaxonId, delete_at: null });
    if (!project) {
      const error = new Error(`Proyecto con taxonId ${numericTaxonId} no encontrado o ha sido eliminado.`);
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    // Para enriquecer con status si es necesario al obtener uno solo:
    // const contractStatus = this._calculateContractStatus(project.toObject());
    // return { ...project.toObject(), contractStatus };
    return project;
  }

  async registerProject(projectData) {
    const {
      managerId, managerName, managerVisibleInOrgChart,
      taxonId, name, client, status, phase, projectType,
      startDate, endDate, image,
      assignedPersons = [],  // <-- Desestructuramos assignedPersons
    } = projectData;

    const numericTaxonId = parseInt(taxonId, 10);
    if (isNaN(numericTaxonId)) {
      const error = new Error("El taxonId del proyecto debe ser un número válido.");
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    const existingByTaxonId = await Project.findOne({ taxonId: numericTaxonId, delete_at: null });
    if (existingByTaxonId) {
      const error = new Error(`Ya existe un proyecto activo con el taxonId '${numericTaxonId}'.`);
      error.statusCode = 409;
      error.isOperational = true;
      throw error;
    }

    const newProject = new Project({
      managerId: managerId || null,
      managerName: managerName || null,
      managerVisibleInOrgChart: managerVisibleInOrgChart !== undefined ? managerVisibleInOrgChart : true,
      taxonId: numericTaxonId,
      name: String(name).trim(),
      Nombre: String(name).trim(),
      client: client ? String(client).trim() : null,
      status: status ? String(status).trim() : null,
      phase: phase ? String(phase).trim() : null,
      projectType: projectType ? String(projectType).trim() : null,
      startDate,
      endDate,
      Fecha_Fin: endDate,
      image: image || null,
      assignedPersons, // <-- Incluimos assignedPersons
      delete_at: null,
    });

    try {
      const savedProject = await newProject.save();
      logger.info(`Proyecto registrado: ${savedProject.name} (TaxonID: ${savedProject.taxonId})`);
      return savedProject;
    } catch (dbError) {
      logger.error("Error de base de datos al guardar proyecto:", { message: dbError.message, stack: dbError.stack });
      if (dbError.name === 'ValidationError') {
        const error = new Error(`Error de validación: ${dbError.message}`);
        error.statusCode = 400;
        error.isOperational = true;
        error.details = dbError.errors;
        throw error;
      }
      if (dbError.code === 11000) {
        const field = Object.keys(dbError.keyPattern)[0];
        const error = new Error(`Ya existe un proyecto con ese valor para el campo '${field}'.`);
        error.statusCode = 409;
        error.isOperational = true;
        throw error;
      }
      const error = new Error("Error interno al guardar el proyecto.");
      error.statusCode = 500;
      throw error;
    }
  }

  async updateProject(taxonId, updates) {
    const numericTaxonId = parseInt(taxonId, 10);
    if (isNaN(numericTaxonId)) {
        const error = new Error("El taxonId proporcionado para actualizar no es un número válido.");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
    }

    const allowedUpdates = { ...updates };
    delete allowedUpdates.taxonId; // No se puede cambiar taxonId
    delete allowedUpdates.delete_at;
    delete allowedUpdates.created_at;

    // Normalizar y mapear campos si es necesario
    if (updates.hasOwnProperty('name')) allowedUpdates.name = String(updates.name).trim();
    if (updates.hasOwnProperty('Nombre') && updates.name) allowedUpdates.Nombre = String(updates.name).trim(); // Si Nombre se basa en name
    if (updates.hasOwnProperty('client')) allowedUpdates.client = String(updates.client).trim();
    if (updates.hasOwnProperty('status')) allowedUpdates.status = String(updates.status).trim();
    if (updates.hasOwnProperty('phase')) allowedUpdates.phase = String(updates.phase).trim();
    if (updates.hasOwnProperty('projectType')) allowedUpdates.projectType = String(updates.projectType).trim();
    
    if (updates.hasOwnProperty('startDate')) {
        allowedUpdates.startDate = new Date(updates.startDate);
    }
    if (updates.hasOwnProperty('endDate')) {
        allowedUpdates.endDate = new Date(updates.endDate);
        allowedUpdates.Fecha_Fin = allowedUpdates.endDate; // Si Fecha_Fin se actualiza con endDate
    }

    if (Object.keys(allowedUpdates).length === 0) {
        const error = new Error("No se proporcionaron datos válidos para actualizar el proyecto.");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
    }
    
    // Añadir campos de auditoría
    allowedUpdates.last_edited_on = new Date();
    // allowedUpdates.last_edited_by = req.user.id; // Si esta info


    const updatedProject = await Project.findOneAndUpdate(
      { taxonId: numericTaxonId, delete_at: null },
      allowedUpdates,
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      const error = new Error(`Proyecto con taxonId ${numericTaxonId} no encontrado, ya eliminado, o no se pudo actualizar.`);
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    logger.info(`Proyecto actualizado: ${updatedProject.name} (TaxonID: ${numericTaxonId})`);
    return updatedProject;
  }

  async softDeleteProject(taxonId) {
    const numericTaxonId = parseInt(taxonId, 10);
    if (isNaN(numericTaxonId)) {
        const error = new Error("El taxonId proporcionado para eliminar no es un número válido.");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
    }

    const projectToUpdate = await Project.findOneAndUpdate(
      { taxonId: numericTaxonId, delete_at: null },
      { $set: { delete_at: new Date() } },
      { new: true }
    );

    if (!projectToUpdate) {
      const existing = await Project.findOne({ taxonId: numericTaxonId });
      if (!existing) {
        const error = new Error(`Proyecto con taxonId ${numericTaxonId} no encontrado.`);
        error.statusCode = 404;
        error.isOperational = true;
        throw error;
      } else {
        const error = new Error(`El proyecto con taxonId ${numericTaxonId} ya está marcado como eliminado.`);
        error.statusCode = 400;
        error.isOperational = true;
        error.deleted_at = existing.delete_at;
        throw error;
      }
    }
    logger.info(`Proyecto marcado como eliminado: ${projectToUpdate.name} (TaxonID: ${numericTaxonId})`);
    return { message: "Proyecto marcado como eliminado correctamente", taxonId: numericTaxonId, deleted_at: projectToUpdate.delete_at };
  }

  async updateAssignedPerson(taxonId, id, fieldsToUpdate) {
    const setObj = {};
    for (const key in fieldsToUpdate) {
      setObj[`assignedPersons.$.${key}`] = fieldsToUpdate[key];
    }

    const updatedProject = await Project.findOneAndUpdate(
      { taxonId, "assignedPersons.id": id },
      { $set: setObj },
      { new: true }
    );

    if (updatedProject) {
      const colab = await Colab.findOne({ id: Number(id) });
      if (colab && Array.isArray(colab.Proyectos)) {
        const idx = colab.Proyectos.findIndex(
          (p) => p.Proyectos === updatedProject.name 
        );
        if (idx !== -1) {
          for (const key in fieldsToUpdate) {
            if (colab.Proyectos[idx][key] !== undefined) {
              colab.Proyectos[idx][key] = fieldsToUpdate[key];
            }
          }
          await colab.save();
        }
      }
    }

    return updatedProject;
  }

  async addAssignedPerson(taxonId, person) {
    const updatedProject = await Project.findOneAndUpdate(
      { taxonId },
      { $push: { assignedPersons: person } },
      { new: true }
    );

    if (updatedProject && person.id) {
      const proyectoInfo = {
        rol: person.rol,
        Proyectos: updatedProject.name, 
        tecnologías: Array.isArray(person.tecnologias) ? person.tecnologias.join(", ") : "",
        horasAsignadas: person.horasAsignadas,
      };

      await Colab.findOneAndUpdate(
        { id: Number(person.id) },
        { $push: { Proyectos: proyectoInfo } }
      );
    }

    return updatedProject;
  }

  async removeAssignedPerson(taxonId, id) {
    const updatedProject = await Project.findOneAndUpdate(
      { taxonId },
      { $pull: { assignedPersons: { id } } },
      { new: true }
    );

    if (updatedProject) {
      const projectName = updatedProject.name;

      await Colab.findOneAndUpdate(
        { id: Number(id) },
        { $pull: { Proyectos: { Proyectos: projectName } } }
      );
    }

    return updatedProject;
  }
}

module.exports = new ProjectService();