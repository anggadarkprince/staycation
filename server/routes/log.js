const express = require('express');
const router = express.Router();
const log = require('../controllers/activity-log');

router.get('/', log.index);
router.get('/view/:id', log.view);

module.exports = router;
