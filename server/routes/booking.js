const express = require('express');
const router = express.Router();
const booking = require('../controllers/booking');
const permissions = require('../config/permissions');
const authorization = require('../middleware/authorization');

router.get('/', authorization.isAuthorized(permissions.PERMISSION_BOOKING_VIEW), booking.index);
router.get('/view/:id', authorization.isAuthorized(permissions.PERMISSION_BOOKING_VIEW), booking.view);
//router.get('/create', authorization.isAuthorized(permissions.PERMISSION_BOOKING_CREATE), booking.create);
//router.post('/save', authorization.isAuthorized(permissions.PERMISSION_BOOKING_CREATE), booking.save);
//router.get('/edit/:id', authorization.isAuthorized(permissions.PERMISSION_BOOKING_EDIT), booking.edit);
//router.post('/update/:id', authorization.isAuthorized(permissions.PERMISSION_BOOKING_EDIT), booking.update);
router.delete('/delete/:id', authorization.isAuthorized(permissions.PERMISSION_BOOKING_DELETE), booking.delete);

module.exports = router;
