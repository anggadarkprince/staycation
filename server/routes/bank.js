const express = require('express');
const router = express.Router();
const bank = require('../controllers/bank');
const {upload} = require('../middleware/multer');

router.get('/', bank.index);
router.get('/view/:id', bank.view);
router.get('/create', bank.create);
router.post('/save', upload, bank.save);
router.get('/edit/:id', bank.edit);
router.post('/update/:id', upload, bank.update);
router.delete('/delete/:id', bank.delete);

module.exports = router;
