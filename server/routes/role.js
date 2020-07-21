const express = require('express');
const router = express.Router();
const role = require('../controllers/role');
const permissions = require('../config/permissions');
const authorization = require('../middleware/authorization');

router.get('/', authorization.isAuthorized(permissions.PERMISSION_ROLE_VIEW), role.index);
router.get('/view/:id', authorization.isAuthorized(permissions.PERMISSION_ROLE_VIEW), role.view);
router.get('/create', authorization.isAuthorized(permissions.PERMISSION_ROLE_CREATE), role.create);
router.post('/save', authorization.isAuthorized(permissions.PERMISSION_ROLE_CREATE), role.save);
router.get('/edit/:id', authorization.isAuthorized(permissions.PERMISSION_ROLE_EDIT), role.edit);
router.put('/update/:id', authorization.isAuthorized(permissions.PERMISSION_ROLE_EDIT), role.update);
router.delete('/delete/:id', authorization.isAuthorized(permissions.PERMISSION_ROLE_DELETE), role.delete);

module.exports = router;
