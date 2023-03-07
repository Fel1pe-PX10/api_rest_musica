const fs       = require('fs');
const mongoose = require('mongoose');
const path     = require('path');

const Album = require('../models/album');

// ruta prueba
const prueba = (req, res) => {
    return res.json({
        status: 'success',
        message: 'album'
    })
}

const save = async (req, res) => {

    // Obtener datos body
    const params = req.body;

    // Crear objeto a guardar
    const album = new Album(params);

    // Guardar objeto en la bbdd
    try {
        await album.save();
        
        return res.json({
            status: 'success',
            message: 'album save',
            params
        })
    } catch (error) {
        console.log(error);

        throw new Error('Error guardando el album');
    }
}

const getAlbum = async(req, res) => {

    // Obtener id del album
    const id = req.params.id;

    // Find y populate de la info
    try {
        const albumInfo = await Album.findById(id)
                                .populate('artist');
                                
        return res.json({
            status: 'success',
            message: 'album',
            albumInfo
        });
    } catch (error) {
        console.log(error);

        throw new Error('Error consultando el album');
    }
}

const list = async (req, res) => {

    // Obtener el id del artista
    const artistId = req.params.id;

    // Obtener todos los albums del artista
    try {
        const albums = await Album.find({artist: artistId})
                                    .populate('artist');
        
        return res.json({
            status: 'success',
            message: 'Album list',
            albums
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            status: 'error',
            message: 'Error consultando los albums del artista'
        });
    }

    
}

const update = async (req, res) => {

    // Obtener el id del album
    const id = req.params.id;

    // Obtener datos del body
    const params = req.body;

    // Respuesta
    try {

        const albumUpdated = await Album.findByIdAndUpdate(id, params, {new: true});
        
        
        return res.json({
            status: 'success',
            message: 'Album list',
            albumUpdated
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            status: 'error',
            message: 'Error actualizando el album del artista'
        });
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
            message: 'La petición no incluye la imagen'
        });
    }

    // Obtener el nombre de la imagen
    const image = req.file.originalname;

    // Obetener informacion de la imagen
    const imageSplit = image.split('\.');

    // Comprobar extension valida
    const extension = imageSplit[imageSplit.length-1];
    if(extension != 'png' && extension != 'jpeg' && extension != 'gif' && extension != 'jpg'){
        const filePath = req.file.path;
        const fileDelete = fs.unlinkSync(filePath);

        return res.status(400).json({
            status: 'error',
            message: 'La extensión no es válida',
        });
    }

    // Guardar imagen en ddbb
    try {
        const update = await Album.findByIdAndUpdate({_id: id}, {image:req.file.filename}, {new:true});

        if(update){
            return res.json({
                status: 'success',
                message: 'Album upload',
                update
            });
        }
        
    } catch (error) {
        console.log(error);

        throw new Error('Error al momento de guardar el nombre de la imagen en la bbdd');
    }
}

const image = async (req, res) => {
    // Obtener parametro de la url
    const file = req.params.file

    //Montar el path real de la imagen
    const filePath = './uploads/albums/'+file;

    // Comprobar que existe el fichero
    fs.stat(filePath, (error, exist) => {
        if(error || !exist){
            return res.status(404).json({
                status: 'error',
                message: 'No existe la imagen',
            });
        }

        // devolver el fichero
        return res.sendfile(path.resolve(filePath));
    })

    
}

module.exports = {
    getAlbum,
    image,
    list,
    prueba,
    save,
    update,
    upload
}