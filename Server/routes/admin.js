const express = require('express');
const router = express.Router();
const {createUser, getUserRole, updateUser, deleteUser} = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

router.use(auth);
router.use(roleCheck(['admin']));

router.post('/users',createUser);

router.get('/users/:role', getUserRole);

router.put('/user/:id', updateUser);

router.delete('/user/:id', deleteUser);

module.exports = router;