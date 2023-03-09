
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');

const Song = require('../models/song');


// ruta prueba
const prueba = (req, res) => {
    return res.json({
        status: 'success',
        message: 'song'
    })
}

const save = async (req, res) => {
    
    // Obtener datos body
    const params = req.body;

    // Crear el objeto
    const song = new Song(params);

    // Guardar objeto en bbdd
    try {
        const songSave = await song.save();

        return res.json({
            status: 'success',
            message: 'song',
            songSave
        })
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({
            status: 'error',
            message: 'Error guardando la canción'
        })
    }
}

const getSong = async (req, res) => {

    // Obtener id de la canción
    const id = req.params.id;

    // Buscar canción y devolver
    try {
        const song = await Song.findById(id)
                                .populate('album');

        return res.json({
            status: 'success',
            message: 'Get Song',
            song
        });
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({
            status: 'error',
            message: 'Error consultando la canción'
        })
    }
}

const list = async (req, res) => {

    // Obtener id del album
    const idAlbum = req.params.idAlbum;    

    // Find y populate
    try {
        const list = await Song.find({album: idAlbum})
                                .populate({
                                    path: 'album',
                                    populate: {
                                        path: 'artist',
                                        model: 'Artist'
                                    }
                                })
        
        return res.json({
            status: 'success',
            message: 'Song list',
            list
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            status: 'error',
            message: 'Error consultando listados de canciones'
        })
        
    }
}

const update = async (req, res) => {

    // Obtener el id del album
    const id = req.params.id;

    // Obtener datos del body
    const params = req.body;

    // Respuesta
    try {

        const songUpdated = await Song.findByIdAndUpdate(id, params, {new: true});
        
        
        return res.json({
            status: 'success',
            message: 'Song Update',
            songUpdated
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            status: 'error',
            message: 'Error actualizando la canción del album'
        });
    }
}

const remove = async (req, res) => {

    // Obtener el id del artista de la url
    const id = req.params.id;
    
    try {
        // Consultar y eliminar artista
        const song = await Song.findByIdAndRemove(id);

        return res.json({
            status: 'success',
            message: 'Delete  artist',
            song
        });
    } catch (error) {
        console.log(error);

        throw new Error('Error intentado eliminar la canción');
    }
}

const upload = async(req, res) => {

    // Obtener id de la url
    const id = req.params.id;

    // Comprobar que es un id valido
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            status: 'error',
            message: 'No es un id valido'
        });
    }
    
    // Obtener fichero de imagen
    if(!req.file){
        return res.status(404).json({
            status: 'error',
            message: 'La petición no incluye el archivo'
        });
    }

    // Obtener el nombre de la imagen
    const file = req.file.originalname;

    // Obetener informacion de la imagen
    const imageSplit = file.split('\.');

    // Comprobar extension valida
    const extension = imageSplit[imageSplit.length-1];
    if(extension != 'mp3' && extension != 'ogg'){
        const filePath = req.file.path;
        const fileDelete = fs.unlinkSync(filePath);

        return res.status(400).json({
            status: 'error',
            message: 'La extensión no es válida',
        });
    }

    // Guardar imagen en ddbb
    try {
        const update = await Song.findByIdAndUpdate({_id: id}, {file:req.file.filename}, {new:true});

        if(update){
            return res.json({
                status: 'success',
                message: 'Song upload',
                update
            });
        }
        
    } catch (error) {
        console.log(error);

        throw new Error('Error al momento de guardar el nombre del archivo en la bbdd');
    }
}

const file = async (req, res) => {
    // Obtener parametro de la url
    const file = req.params.file

    //Montar el path real de la imagen
    const filePath = './uploads/songs/'+file;

    // Comprobar que existe el fichero
    fs.stat(filePath, (error, exist) => {
        if(error || !exist){
            return res.status(404).json({
                status: 'error',
                message: 'No existe la cancion',
            });
        }

        // devolver el fichero
        return res.sendfile(path.resolve(filePath));
    })

    
}

module.exports = {
    file,
    getSong,
    list,
    prueba,
    remove,
    save,
    update,
    upload
}