// controllers/projects.js
// const connection = require("../database/connection"); // Ya no es necesario si se maneja globalmente
const ProjectService = require("../services/ProjectService");
const logger = require("../config/logger"); // Para logging específico si se necesita

const pruebaProjec = async (req, res, next) => {
  // Añadido next
  // try { // express-async-errors maneja esto
  const searchQuery = req.query.search;
  // logger.info(`Solicitando proyectos con estado, búsqueda: '${searchQuery || ''}'`);
  const projectsWithStatus = await ProjectService.getAllProjectsWithStatus(
    searchQuery
  );
  return res.status(200).json({
    status: "success",
    count: projectsWithStatus.length,
    data: projectsWithStatus,
  });
  // } catch (error) {
  //   next(error); // Pasar al middleware de error global
  // }
};

const register = async (req, res, next) => {
  // Añadido next
  // try {
  const projectData = req.body;

  // Validación detallada de campos requeridos y formato de fechas en el controlador
  const requiredFields = [
    "taxonId",
    "name",
    "client",
    "status",
    "phase",
    "projectType",
    "startDate",
    "endDate",
  ];
  const missingFields = [];
  for (const field of requiredFields) {
    if (
      projectData[field] === undefined ||
      projectData[field] === null ||
      String(projectData[field]).trim() === ""
    ) {
      // Excepción para taxonId si puede ser 0 y es válido
      if (field === "taxonId" && projectData[field] === 0) continue;
      missingFields.push(field);
    }
  }
  if (missingFields.length > 0) {
    const error = new Error(
      `Datos incompletos. Faltan los siguientes campos: ${missingFields.join(
        ", "
      )}`
    );
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  // Validar que taxonId sea un número
  if (isNaN(parseInt(projectData.taxonId, 10))) {
    const error = new Error("El campo 'taxonId' debe ser un número válido.");
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  // Validar formato de fechas
  if (isNaN(new Date(projectData.startDate).getTime())) {
    const error = new Error("Formato de 'startDate' inválido. Use YYYY-MM-DD.");
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  if (isNaN(new Date(projectData.endDate).getTime())) {
    const error = new Error("Formato de 'endDate' inválido. Use YYYY-MM-DD.");
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  // Verificar que endDate no sea anterior a startDate
  if (new Date(projectData.endDate) < new Date(projectData.startDate)) {
    const error = new Error("'endDate' no puede ser anterior a 'startDate'.");
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  // Preparar datos para el servicio (convirtiendo fechas a objetos Date)
  const dataForService = {
    ...projectData,
    taxonId: parseInt(projectData.taxonId, 10), // Asegurar que taxonId sea número
    startDate: new Date(projectData.startDate),
    endDate: new Date(projectData.endDate),
  };

  // logger.debug("Controlador: Datos para registrar proyecto:", dataForService);
  const savedProject = await ProjectService.registerProject(dataForService);
  // logger.info("Controlador: Proyecto guardado:", { taxonId: savedProject.taxonId, name: savedProject.name });

  return res.status(201).json({
    status: "success",
    message: "Proyecto registrado exitosamente",
    project: savedProject,
  });
  // } catch (error) {
  //   next(error);
  // }
};

const getProjectByID = async (req, res, next) => {
  // Añadido next
  // try {
  const { taxonId } = req.params;
  if (!taxonId || isNaN(parseInt(taxonId, 10))) {
    const error = new Error(
      "El taxonId del proyecto debe ser un número válido y es requerido."
    );
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  // logger.info(`Solicitando proyecto por TaxonID: ${taxonId}`);
  const project = await ProjectService.getProjectByTaxonId(taxonId);
  return res.status(200).json({
    status: "success",
    data: project,
  });
  // } catch (error) {
  //   next(error);
  // }
};

const editProject = async (req, res, next) => {
  // Añadido next
  // try {
  const { taxonId } = req.params;
  const updates = req.body;

  if (!taxonId || isNaN(parseInt(taxonId, 10))) {
    const error = new Error(
      "El taxonId del proyecto debe ser un número válido y es requerido en la URL."
    );
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  if (Object.keys(updates).length === 0) {
    const error = new Error(
      "No se enviaron datos para actualizar el proyecto."
    );
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  // Validar formato de fechas si se envían para actualizar
  if (updates.startDate && isNaN(new Date(updates.startDate).getTime())) {
    const error = new Error(
      "Formato de 'startDate' inválido para la actualización. Use YYYY-MM-DD."
    );
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  if (updates.endDate && isNaN(new Date(updates.endDate).getTime())) {
    const error = new Error(
      "Formato de 'endDate' inválido para la actualización. Use YYYY-MM-DD."
    );
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  // Verificar que endDate no sea anterior a startDate si ambas se actualizan
  const currentStartDate = updates.startDate
    ? new Date(updates.startDate)
    : null;
  const currentEndDate = updates.endDate ? new Date(updates.endDate) : null;

  if (currentEndDate && currentStartDate && currentEndDate < currentStartDate) {
    const error = new Error(
      "'endDate' no puede ser anterior a 'startDate' en la actualización."
    );
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  // Si solo se actualiza una de las fechas,  cargar el proyecto actual para comparar.
  // Por simplicidad, esta validación se hace si ambas están presentes en 'updates'.

  // logger.debug(`Controlador: Datos para editar proyecto TaxonID ${taxonId}:`, updates);
  const updatedProject = await ProjectService.updateProject(taxonId, updates);
  // logger.info("Controlador: Proyecto actualizado:", { taxonId: updatedProject.taxonId, name: updatedProject.name });

  return res.status(200).json({
    status: "success",
    message: "Proyecto actualizado correctamente",
    project: updatedProject,
  });
  // } catch (error) {
  //   next(error);
  // }
};

const eliminar = async (req, res, next) => {
  // Añadido next, Soft delete
  // try {
  const { taxonId } = req.params;
  if (!taxonId || isNaN(parseInt(taxonId, 10))) {
    const error = new Error(
      "El taxonId del proyecto debe ser un número válido y es requerido en la URL para eliminar."
    );
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  // logger.info(`Solicitando eliminar (soft delete) proyecto TaxonID: ${taxonId}`);
  const result = await ProjectService.softDeleteProject(taxonId);
  // logger.info("Controlador: Proyecto marcado como eliminado:", result);

  return res.status(200).json({
    status: "success",
    message: result.message,
    taxonId: result.taxonId,
    deleted_at: result.deleted_at,
  });
  // } catch (error) {
  //   next(error);
  // }
};

const addAssignedPerson = async (req, res, next) => {
  const { taxonId } = req.params;
  const person = req.body;

  if (isNaN(+taxonId)) throwBadRequest("'taxonId' inválido en URL");

  const required = [
    "name",
    "id",
    "rol",
    "horasAsignadas",
    "tecnologias",
    "seniority",
  ];
  const miss = required.filter(
    (f) => person[f] === undefined || person[f] === null || person[f] === ""
  );
  if (miss.length)
    throwBadRequest(`Datos incompletos. Faltan: ${miss.join(", ")}`);

  if (isNaN(+person.horasAsignadas))
    throwBadRequest("'horasAsignadas' debe ser numérico");
  if (!Array.isArray(person.tecnologias))
    throwBadRequest("'tecnologias' debe ser un array de strings");

  const project = await ProjectService.addAssignedPerson(+taxonId, person);
  return res
    .status(200)
    .json({ status: "success", message: "Persona asignada", project });
};



const removeAssignedPerson = async (req, res, next) => {
  const { taxonId } = req.params;
  const { id } = req.body;

  if (isNaN(+taxonId)) throwBadRequest("'taxonId' inválido en URL");

  const project = await ProjectService.removeAssignedPerson(
    +taxonId,
    id
  );

  if (!project) {
    return res
      .status(404)
      .json({
        status: "error",
        message: "Proyecto no encontrado o persona no asignada",
      });
  }

  return res.status(200).json({
    status: "success",
    message: "Persona eliminada del proyecto",
    project,
  });
};

const updateAssignedPerson = async (req, res, next) => {
  const { taxonId } = req.params;
  const { id, ...fieldsToUpdate } = req.body;

  if (isNaN(+taxonId)) throwBadRequest("'taxonId' inválido en URL");
  if (!id) throwBadRequest("Falta 'dni' en el body");

  // Validar que haya al menos un campo a actualizar
  if (Object.keys(fieldsToUpdate).length === 0)
    throwBadRequest("No se enviaron campos para actualizar");

  const project = await ProjectService.updateAssignedPerson(+taxonId, id, fieldsToUpdate);

  if (!project) {
    return res.status(404).json({
      status: "error",
      message: "Proyecto no encontrado o persona no asignada",
    });
  }

  return res.status(200).json({
    status: "success",
    message: "Persona asignada actualizada",
    project,
  });
};

module.exports = {
  pruebaProjec,
  register,
  getProjectByID,
  editProject,
  eliminar,
  addAssignedPerson,
  removeAssignedPerson,
  updateAssignedPerson,
};
