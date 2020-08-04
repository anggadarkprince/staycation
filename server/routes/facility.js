const express = require('express');
const router = express.Router();
const facility = require('../controllers/facility');
const {upload} = require('../middleware/multer');
const permissions = require('../config/permissions');
const authorization = require('../middleware/authorization');

router.get('/', authorization.isAuthorized(permissions.PERMISSION_FACILITY_VIEW), facility.index);
router.get('/view/:id', authorization.isAuthorized(permissions.PERMISSION_FACILITY_VIEW), facility.view);
router.get('/create', authorization.isAuthorized(permissions.PERMISSION_FACILITY_CREATE), facility.create);
router.post('/save', authorization.isAuthorized(permissions.PERMISSION_FACILITY_CREATE), upload.single("image"), facility.save);
router.get('/edit/:id', authorization.isAuthorized(permissions.PERMISSION_FACILITY_EDIT), facility.edit);
router.post('/update/:id', authorization.isAuthorized(permissions.PERMISSION_FACILITY_EDIT), upload.single("image"), facility.update);
router.delete('/delete/:id', authorization.isAuthorized(permissions.PERMISSION_FACILITY_DELETE), facility.delete);

module.exports = router;
