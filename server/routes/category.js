const express = require('express');
const router = express.Router();
const category = require('../controllers/category');
const permissions = require('../config/permissions');
const authorization = require('../middleware/authorization');

router.get('/', category.index);
router.get('/view/:id', category.view);
router.get('/create', category.create);
router.post('/save', category.save);
router.get('/edit/:id', category.edit);
router.put('/update/:id', category.update);
router.delete('/delete/:id', category.delete);

module.exports = router;
