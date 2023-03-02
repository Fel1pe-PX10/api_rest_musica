const express = require('express');
const router = express.Router();

const multer = require('multer');

// Configuracion subida multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/avatars/')
    },
    filename: (req, file, cb) => {
        cb(null, 'avatar-'+Date.now()+'-'+file.originalname)
    }
})
// Middleware de uploads
const updloads = multer({storage});


const auth = require('../middlewares/auth');


const { test, register, login, getUser, update, upload, avatar } = require('../controllers/user');

router.get('/prueba', test);
router.post('/register', register);
router.post('/login', login);
router.get('/profile/:id', [auth], getUser);
router.put('/update', [auth], update);
router.post('/upload', [auth, updloads.single('file0')], upload);
router.get('/avatar/:file', [auth], avatar);

module.exports = router;