const express = require('express');
const router = express.Router();
const setting = require('../controllers/setting');
const permissions = require('../config/permissions');
const authorization = require('../middleware/authorization');

router.get('/', authorization.isAuthorized(permissions.PERMISSION_SETTING_EDIT), setting.index);
router.put('/', authorization.isAuthorized(permissions.PERMISSION_SETTING_EDIT), setting.update);

module.exports = router;
