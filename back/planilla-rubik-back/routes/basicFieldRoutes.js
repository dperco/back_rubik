const r = require('express').Router();
const c = require('../controllers/basicFieldController');
r.get('/', c.getAll);
module.exports = r;
