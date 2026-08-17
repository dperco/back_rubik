const technologiesService = require("../services/technologiesService");

// Obtener todas las tecnologías
const getAllTechnologies = async (req, res, next) => {
  const techs = await technologiesService.getAllTechnologies();
  return res.status(200).json({ status: "success", data: techs });
};

// Agregar una nueva tecnología
const addTechnology = async (req, res, next) => {
  const { id, name } = req.body;
  if (!id || !name) {
    return res.status(400).json({ status: "error", message: "Faltan campos obligatorios" });
  }
  const tech = await technologiesService.addTechnology({ id, name });
  return res.status(201).json({ status: "success", data: tech });
};

// Editar una tecnología
const editTechnology = async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ status: "error", message: "Falta el nombre" });
  }
  const tech = await technologiesService.editTechnology(id, name);
  if (!tech) {
    return res.status(404).json({ status: "error", message: "Tecnología no encontrada" });
  }
  return res.status(200).json({ status: "success", data: tech });
};

// Borrar una tecnología
const deleteTechnology = async (req, res, next) => {
  const { id } = req.params;
  const tech = await technologiesService.deleteTechnology(id);
  if (!tech) {
    return res.status(404).json({ status: "error", message: "Tecnología no encontrada" });
  }
  return res.status(200).json({ status: "success", message: "Tecnología eliminada" });
};

module.exports = {
  getAllTechnologies,
  addTechnology,
  editTechnology,
  deleteTechnology,
};