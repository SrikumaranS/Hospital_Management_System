const express = require('express');
const router = express.Router();
const {viewQueue, updateAppointmentStatus, createPrescription} = require('../controllers/doctorController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

router.use(auth);
router.use(roleCheck(['doctor']));

router.get('/appointments', viewQueue);
router.put('/appointments/status', updateAppointmentStatus);
router.post('/prescriptions', createPrescription);

module.exports = router;