// routes/projects.js
const express = require("express");
const router = express.Router();
const ProjecController = require("../controllers/projects");



// router.get("/all", ProjecController.mostrarTodosProyectos); 
router.get("/", ProjecController.pruebaProjec);       // Antes era /proyecto
router.post("/register", ProjecController.register);        // Antes era /register

router.get("/:taxonId", ProjecController.getProjectByID); // Antes era /buscar/:taxonId
router.put("/:taxonId", ProjecController.editProject);  // Antes era /editar/:taxonId
router.post("/:taxonId", ProjecController.eliminar);  // Antes era POST /eliminar/:taxonId

router.post("/:taxonId/assigned-persons", ProjecController.addAssignedPerson); // Añadir persona asignada a un proyecto
router.delete("/:taxonId/assigned-persons", ProjecController.removeAssignedPerson); // Eliminar persona asignada de un proyecto
router.put("/:taxonId/assignedPersons", ProjecController.updateAssignedPerson); // Editar persona asignada a un proyecto
// Si se prefiere mantener las rutas originales (comenta las de arriba y descomenta estas):
/*
router.get("/proyecto",ProjecController.pruebaProjec);
router.post("/register", ProjecController.register);
router.get("/buscar/:taxonId", ProjecController.getProjectByID);
router.put("/editar/:taxonId", ProjecController.editProject);
router.post("/eliminar/:taxonId", ProjecController.eliminar); // Usar DELETE sería más semántico
*/

module.exports = router;