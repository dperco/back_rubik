// routes/personRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/personnelController');

router.post('/', ctrl.create);           // POST   /api/person
router.get('/', ctrl.getAll);            // GET    /api/person?page=1&limit=20
router.get('/:id', ctrl.getById);        // GET    /api/person/606d...
router.put('/:id', ctrl.update);         // PUT    /api/person/606d...
router.delete('/:id', ctrl.remove);      // DELETE /api/person/606d...

module.exports = router;
