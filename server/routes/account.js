const express = require('express');
const router = express.Router();
const account = require('../controllers/account');
const {upload} = require('../middleware/multer');

router.get('/', account.index);
router.post('/update', upload, account.update);

module.exports = router;
