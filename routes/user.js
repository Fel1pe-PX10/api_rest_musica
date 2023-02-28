const express = require('express');

const router = express.Router();


const { test, register, login } = require('../controllers/user');

router.get('/prueba', test);
router.post('/register', register);
router.post('/login', login);

module.exports = router;