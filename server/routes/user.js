const express = require('express');
const router = express.Router();
const user = require('../controllers/user');
const {upload} = require('../middleware/multer');

router.get('/', user.index);
router.get('/view/:id', user.view);
router.get('/create', user.create);
router.post('/save', upload, user.save);
router.get('/edit/:id', user.edit);
router.post('/update/:id', upload, user.update);
router.delete('/delete/:id', user.delete);

module.exports = router;
