const express = require('express');

const router = express.Router();

const multer = require('multer');

// Configuracion subida multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/albums/')
    },
    filename: (req, file, cb) => {
        cb(null, 'album-'+Date.now()+'-'+file.originalname)
    }
})
// Middleware de uploads
const updloads = multer({storage});

const auth = require('../middlewares/auth');

const { prueba, save, getAlbum, list, update, upload, image, remove } = require('../controllers/album');

router.get('/prueba', prueba);
router.post('/save', [auth], save);
router.get('/getAlbum/:id', [auth], getAlbum);
router.get('/list/:id', [auth], list);
router.put('/update/:id', [auth], update);
router.delete('/remove/:id', [auth], remove);
router.post('/upload/:id', [auth, updloads.single('file0')], upload);
router.get('/image/:file', [auth], image);

module.exports = router;