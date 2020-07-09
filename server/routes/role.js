const express = require('express');
const router = express.Router();
const role = require('../controllers/role');

router.get('/', role.index);
router.get('/view/:id', role.view);
router.get('/create', role.create);
router.post('/save', role.save);
router.get('/edit/:id', role.edit);
router.put('/update/:id', role.update);
router.delete('/delete/:id', role.delete);

module.exports = router;
