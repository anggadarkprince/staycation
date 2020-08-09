const express = require('express');
const router = express.Router();
const consoleController = require('../controllers/console');

router.get('/report-weekly', consoleController.reportWeekly);

module.exports = router;
