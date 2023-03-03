const express = require('express');

const router = express.Router();

const auth = require('../middlewares/auth');


const { prueba, save } = require('../controllers/artist');

router.get('/prueba', prueba);
router.post('/save', [auth], save);

module.exports = router;