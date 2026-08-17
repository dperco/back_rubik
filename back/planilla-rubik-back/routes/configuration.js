// routes/configuration.js
const express = require('express');
const router = express.Router();
const tableConfigController = require('../controllers/configuration');

// GET /api/configuration/columns/:section
router.get('/columns/:section', tableConfigController.getTableColumns);

// PUT /api/configuration/updateColumns  (Considerar cambiar a /columns o /columns/:section con PUT)
router.put('/updateColumns', tableConfigController.updateTableColumns);
// Sugerencia para una ruta más RESTful para actualizar:
// router.put('/columns/:section', tableConfigController.updateTableColumns);
// En este caso, `section` vendría de `req.params.section` y `columns` de `req.body.columns`.
// Y en el body de Postman solo enviarías:
// {
//   "columns": [ ... ]
// }

module.exports = router;