// routes/nurse.js
const express = require('express');
const router = express.Router();
const nurseController = require('../controllers/nurseController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

router.use(auth);
router.use(roleCheck(['nurse']));

router.post('/mark-bed-available', nurseController.markBedAvailable);

module.exports = router;
