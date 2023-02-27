const express = require('express');

const router = express.Router();


const { test, register } = require('../controllers/user');

router.get('/prueba', test);
router.post('/register', register);

module.exports = router;