// routes/staff.js
const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

router.use(auth);
router.use(roleCheck(['staff']));

router.post('/assign-bed-nurse', staffController.assignBedAndNurse);
router.post('/discharge-patient', staffController.dischargePatient);

module.exports = router;
