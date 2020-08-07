const express = require('express');
const router = express.Router();
const bank = require('../controllers/bank');
const permissions = require('../config/permissions');
const authorization = require('../middleware/authorization');
const {upload} = require('../middleware/multer');

router.get('/', authorization.isAuthorized(permissions.PERMISSION_BANK_VIEW), bank.index);
router.get('/view/:id', authorization.isAuthorized(permissions.PERMISSION_BANK_VIEW), bank.view);
router.get('/create', authorization.isAuthorized(permissions.PERMISSION_BANK_CREATE), bank.create);
router.post('/save', authorization.isAuthorized(permissions.PERMISSION_BANK_CREATE), upload.single("logo"), bank.save);
router.get('/edit/:id', authorization.isAuthorized(permissions.PERMISSION_BANK_EDIT), bank.edit);
router.post('/update/:id', authorization.isAuthorized(permissions.PERMISSION_BANK_EDIT), upload.single("logo"), bank.update);
router.delete('/delete/:id', authorization.isAuthorized(permissions.PERMISSION_BANK_DELETE), bank.delete);

module.exports = router;
