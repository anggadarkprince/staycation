const express = require('express');
const router = express.Router();
const bank = require('../controllers/bank');

router.get('/', bank.index);
router.get('/view/:id', bank.view);
router.get('/create', bank.create);
router.post('/save', bank.save);
router.get('/edit/:id', bank.edit);
router.put('/update/:id', bank.update);
router.delete('/delete/:id', bank.delete);

module.exports = router;
