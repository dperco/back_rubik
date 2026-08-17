// routes/collaborator.js
const express = require("express");
const router = express.Router();
const ColaController = require("../controllers/collaborator");



router.get("/", ColaController.pruebaColab);        // Antes era /colaborador
router.post("/", ColaController.register);      // Antes era /register

// Asumiendo que 'id' es el identificador en la URL para estas operaciones
router.put("/:id", ColaController.editColab);       // Antes era /editar/:id
router.post("/:id", ColaController.Eliminar);    // Antes era POST /eliminar/:id
router.get("/:id", ColaController.getCollaboratorById);//buscar colaborador por ID
router.get("/contracts/expirations", ColaController.checkContractExpiration); // Ruta más específica
router.delete("/:id/proyectos", ColaController.removeProyecto);



module.exports = router;