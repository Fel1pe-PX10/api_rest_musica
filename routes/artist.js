const express = require('express');

const router = express.Router();

const multer = require('multer');

// Configuracion subida multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/artists/')
    },
    filename: (req, file, cb) => {
        cb(null, 'artists-'+Date.now()+'-'+file.originalname)
    }
})
// Middleware de uploads
const updloads = multer({storage});

const auth = require('../middlewares/auth');


const { prueba, save, getArtist, list, update, remove, upload, image } = require('../controllers/artist');


router.get('/prueba', prueba);
router.post('/save', [auth], save);
router.get('/get/:id', [auth], getArtist);
router.get('/list/:page?', [auth], list);
router.put('/update/:id', [auth], update);
router.delete('/remove/:id', [auth], remove);
router.post('/upload/:id', [auth, updloads.single('file0')], upload);
router.get('/image/:file', [auth], image);

module.exports = router;