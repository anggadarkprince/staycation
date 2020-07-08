const express = require('express');
const router = express.Router();
const category = require('../controllers/category');

router.get('/', category.index);
router.get('/create', category.create);
router.post('/save', category.save);
router.get('/edit/:id', category.edit);
router.put('/update/:id', category.update);
router.delete('/delete/:id', category.delete);

module.exports = router;
