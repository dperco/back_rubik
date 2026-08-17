// routes/tecnology.js
const express = require("express");
const router = express.Router();
const tecnoController = require("../controllers/tecnology")

//definir rutas
router.get("/tecnology",tecnoController.pruebatecno); // GET para obtener recursos es más estándar
// router.get("/",tecnoController.pruebatecno); // Podría ser /api/technology/
//buscar tecnologia por id
router.get("/:id", tecnoController.getTecnoByID); // GET para obtener un recurso específico por ID
router.post("/register", tecnoController.register);
// router.post("/", tecnoController.register); // Podría ser /api/technology/

//  implementar editar y eliminar:
router.put("/:id", tecnoController.edittecno);
router.delete("/:id", tecnoController.Eliminar); // DELETE para eliminar recursos


//exportar ruter
module.exports = router;