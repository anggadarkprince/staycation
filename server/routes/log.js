const express = require('express');
const router = express.Router();
const log = require('../controllers/activity-log');
const permissions = require('../config/permissions');
const authorization = require('../middleware/authorization');

router.get('/', authorization.isAuthorized(permissions.PERMISSION_LOG_VIEW), log.index);
router.get('/view/:id', authorization.isAuthorized(permissions.PERMISSION_LOG_VIEW), log.view);

module.exports = router;
