const express = require('express');
const router = express.Router();
const item = require('../controllers/item');
const {upload} = require('../middleware/multer');
const permissions = require('../config/permissions');
const authorization = require('../middleware/authorization');

router.get('/', authorization.isAuthorized(permissions.PERMISSION_ITEM_VIEW), item.index);
router.get('/view/:id', authorization.isAuthorized(permissions.PERMISSION_ITEM_VIEW), item.view);
router.get('/create', authorization.isAuthorized(permissions.PERMISSION_ITEM_CREATE), item.create);
router.post('/save', authorization.isAuthorized(permissions.PERMISSION_ITEM_CREATE), upload, item.save);
router.get('/edit/:id', authorization.isAuthorized(permissions.PERMISSION_ITEM_EDIT), item.edit);
router.post('/update/:id', authorization.isAuthorized(permissions.PERMISSION_ITEM_EDIT), upload, item.update);
router.delete('/delete/:id', authorization.isAuthorized(permissions.PERMISSION_ITEM_DELETE), item.delete);

module.exports = router;
