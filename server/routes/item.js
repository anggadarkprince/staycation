const express = require('express');
const router = express.Router();
const item = require('../controllers/item');
const {upload} = require('../middleware/multer');

router.get('/', item.index);
router.get('/view/:id', item.view);
router.get('/create', item.create);
router.post('/save', upload, item.save);
router.get('/edit/:id', item.edit);
router.post('/update/:id', upload, item.update);
router.delete('/delete/:id', item.delete);

module.exports = router;
