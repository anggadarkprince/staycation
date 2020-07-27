const express = require('express');
const router = express.Router();
const account = require('../controllers/account');
const {upload} = require('../middleware/multer');
const permissions = require('../config/permissions');
const authorization = require('../middleware/authorization');

router.get('/', authorization.isAuthorized(permissions.PERMISSION_ACCOUNT_EDIT), account.index);
router.post('/update', authorization.isAuthorized(permissions.PERMISSION_ACCOUNT_EDIT), upload.single("avatar"), account.update);

module.exports = router;
