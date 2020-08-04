const express = require('express');
const router = express.Router();
const category = require('../controllers/category');
const permissions = require('../config/permissions');
const authorization = require('../middleware/authorization');

router.get('/', authorization.isAuthorized(permissions.PERMISSION_CATEGORY_VIEW), category.index);
router.get('/view/:id', authorization.isAuthorized(permissions.PERMISSION_CATEGORY_VIEW), category.view);
router.get('/create', authorization.isAuthorized(permissions.PERMISSION_CATEGORY_VIEW), category.create);
router.post('/save', authorization.isAuthorized(permissions.PERMISSION_CATEGORY_VIEW), category.save);
router.get('/edit/:id', authorization.isAuthorized(permissions.PERMISSION_CATEGORY_VIEW), category.edit);
router.put('/update/:id', authorization.isAuthorized(permissions.PERMISSION_CATEGORY_VIEW), category.update);
router.delete('/delete/:id', authorization.isAuthorized(permissions.PERMISSION_CATEGORY_VIEW), category.delete);

module.exports = router;
