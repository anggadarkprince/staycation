const express = require('express');
const router = express.Router();
const role = require('../controllers/role');

router.get('/', role.index);
router.get('/create', role.create);
router.post('/save', role.save);
router.get('/edit', role.edit);
router.put('/update', role.update);
router.delete('/delete', role.delete);

module.exports = router;
