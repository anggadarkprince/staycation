const express = require('express');
const router = express.Router();
const user = require('../controllers/user');
const {upload} = require('../middleware/multer');
const permissions = require('../config/permissions');
const authorization = require('../middleware/authorization');

router.get('/', authorization.isAuthorized(permissions.PERMISSION_USER_VIEW), user.index);
router.get('/view/:id', authorization.isAuthorized(permissions.PERMISSION_USER_VIEW), user.view);
router.get('/create', authorization.isAuthorized(permissions.PERMISSION_USER_CREATE), user.create);
router.post('/save', authorization.isAuthorized(permissions.PERMISSION_USER_CREATE), upload.single("avatar"), user.save);
router.get('/edit/:id', authorization.isAuthorized(permissions.PERMISSION_USER_EDIT), user.edit);
router.post('/update/:id', authorization.isAuthorized(permissions.PERMISSION_USER_EDIT), upload.single("avatar"), user.update);
router.delete('/delete/:id', authorization.isAuthorized(permissions.PERMISSION_USER_DELETE), user.delete);

module.exports = router;
