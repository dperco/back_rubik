// routes/vacancie.js
const express = require("express");
const router = express.Router();
const VacanController = require("../controllers/vacancie");

// Definir rutas RESTful (sugerencia)
// GET /api/vacancie/ -> Listar todas las vacantes (con búsqueda opcional)
// POST /api/vacancie/ -> Registrar nueva vacante
// GET /api/vacancie/:id -> Obtener vacante por ID
// PUT /api/vacancie/:id -> Actualizar vacante por ID
// DELETE /api/vacancie/:id -> Eliminar (soft delete) vacante por ID

// Rutas ajustadas para ser más estándar:
router.get("/", VacanController.prueVacan); // Ruta raíz para listar, antes era /vacancie
router.post("/", VacanController.register); // Ruta raíz para registrar, antes era /register

// Rutas con ID como parámetro
router.get("/:id", VacanController.getVacancieById);    // Antes era /buscar/:id
router.put("/:id", VacanController.editVacan);        // Antes era /editar/:id
router.delete("/:id", VacanController.Eliminar);      // Antes era /eliminar/:id (método POST)

// Si se prefiere mantener los nombres de ruta originales, puedes hacerse, pero
// las convenciones RESTful suelen ser más claras.
// Ejemplo manteniendo las rutas originales (comentar las de arriba y descomenta estas):
/*
router.get("/vacancie",VacanController.prueVacan);
router.post("/register", VacanController.register);
router.get("/buscar/:id", VacanController.getVacancieById);
router.put("/editar/:id", VacanController.editVacan);
router.post("/eliminar/:id", VacanController.Eliminar); // NOTA: Usar DELETE sería más semántico
*/

module.exports = router;