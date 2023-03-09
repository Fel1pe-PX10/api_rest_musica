const express = require('express');

const router = express.Router();

const multer = require('multer');

// Configuracion subida multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/songs/')
    },
    filename: (req, file, cb) => {
        cb(null, 'song-'+Date.now()+'-'+file.originalname)
    }
})
// Middleware de uploads
const updloads = multer({storage});

const auth = require('../middlewares/auth');


const { prueba, save, getSong, list, update, remove, upload, file } = require('../controllers/song');

router.get('/prueba', prueba);
router.post('/save', [auth], save);
router.get('/getSong/:id', [auth], getSong);
router.get('/list/:idAlbum', [auth], list);
router.put('/update/:id', [auth], update);
router.delete('/remove/:id', [auth], remove);
router.post('/upload/:id', [auth, updloads.single('file0')], upload);
router.get('/file/:file', [auth], file);

module.exports = router;