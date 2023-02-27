const express = require('express');

const router = express.Router();


const { prueba } = require('../controllers/album');

router.get('/prueba', prueba);

module.exports = router;