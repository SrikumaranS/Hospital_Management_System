const express = require('express');
const router = express.Router();
const { registerPatient, loginPatient } = require('../controllers/patientAuth');
const loginEmployee = require('../controllers/employeeAuth');

router.post('/patient/register', registerPatient);

router.post('/patient/login', loginPatient);

router.post('/employee/login', loginEmployee);

module.exports = router;