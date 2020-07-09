const express = require('express');
const router = express.Router();
const user = require('../controllers/user');

router.get('/', user.index);
router.get('/view/:id', user.view);
router.get('/create', user.create);
router.post('/save', user.save);
router.get('/edit/:id', user.edit);
router.put('/update/:id', user.update);
router.delete('/delete/:id', user.delete);

module.exports = router;
