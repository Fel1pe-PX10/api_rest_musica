const express = require('express');

const router = express.Router();


const auth = require('../middlewares/auth');


const { test, register, login, getUser } = require('../controllers/user');

router.get('/prueba', test);
router.post('/register', register);
router.post('/login', login);
router.get('/profile/:id', [auth], getUser);

module.exports = router;