const express = require('express');
const router = express.Router();
const item = require('../controllers/item');
const permissions = require('../config/permissions');
const authorization = require('../middleware/authorization');

router.get('/', authorization.isAuthorized(permissions.PERMISSION_ITEM_VIEW), item.index);
router.get('/view/:id', authorization.isAuthorized(permissions.PERMISSION_ITEM_VIEW), item.view);
router.get('/create', authorization.isAuthorized(permissions.PERMISSION_ITEM_CREATE), item.create);
router.post('/save', authorization.isAuthorized(permissions.PERMISSION_ITEM_CREATE), item.save);
router.get('/edit/:id', authorization.isAuthorized(permissions.PERMISSION_ITEM_EDIT), item.edit);
router.put('/update/:id', authorization.isAuthorized(permissions.PERMISSION_ITEM_EDIT), item.update);
router.delete('/delete/:id', authorization.isAuthorized(permissions.PERMISSION_ITEM_DELETE), item.delete);
router.delete('/delete-image/:id', authorization.isAuthorized(permissions.PERMISSION_ITEM_EDIT), item.deleteImage);

module.exports = router;
