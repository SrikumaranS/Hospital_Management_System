const express = require('express');
const router = express.Router();
const {bookAppointment, viewAppointments} = require('../controllers/patientController');
const auth = require('../middlewares/auth');

router.use(auth);

router.post('/appointment', bookAppointment);
router.get('/appointments', viewAppointments);
router.get('/prescriptions', getPrescriptions);

module.exports = router;
