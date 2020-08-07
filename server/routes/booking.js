const express = require('express');
const router = express.Router();
const booking = require('../controllers/booking');
const permissions = require('../config/permissions');
const authorization = require('../middleware/authorization');
const {upload} = require('../middleware/multer');

router.get('/', authorization.isAuthorized(permissions.PERMISSION_BOOKING_VIEW), booking.index);
router.get('/view/:id', authorization.isAuthorized(permissions.PERMISSION_BOOKING_VIEW), booking.view);
router.get('/print/:id', authorization.isAuthorized(permissions.PERMISSION_BOOKING_VIEW), booking.print);
router.get('/create', authorization.isAuthorized(permissions.PERMISSION_BOOKING_CREATE), booking.create);
router.post('/save', authorization.isAuthorized(permissions.PERMISSION_BOOKING_CREATE), booking.save);
router.get('/edit/:id', authorization.isAuthorized(permissions.PERMISSION_BOOKING_EDIT), booking.edit);
router.put('/update/:id', authorization.isAuthorized(permissions.PERMISSION_BOOKING_EDIT), booking.update);
router.get('/payment/:id', authorization.isAuthorized(permissions.PERMISSION_BOOKING_EDIT), booking.payment);
router.post('/payment/:id', authorization.isAuthorized(permissions.PERMISSION_BOOKING_EDIT), upload.single("proof_payment"), booking.updatePayment);
router.delete('/delete/:id', authorization.isAuthorized(permissions.PERMISSION_BOOKING_DELETE), booking.delete);
router.put('/approve/:id', authorization.isAuthorized(permissions.PERMISSION_BOOKING_EDIT), booking.approve);
router.put('/reject/:id', authorization.isAuthorized(permissions.PERMISSION_BOOKING_EDIT), booking.reject);

module.exports = router;
