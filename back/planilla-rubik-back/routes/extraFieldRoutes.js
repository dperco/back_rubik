const r = require('express').Router();
const c = require('../controllers/extraFieldController');
r.post('/', c.create);
r.get('/',  c.getAll);
r.put('/:id', c.update);
r.delete('/:id', c.remove);
module.exports = r;
