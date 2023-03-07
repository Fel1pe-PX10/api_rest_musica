
const fs                 = require('fs');
const mongoose           = require('mongoose');
const mongoosePagination = require('mongoose-pagination');
const path               = require('path');

const Album  = require('../models/album');
const Artist = require('../models/artist');
const Song   = require('../models/song');

// ruta prueba
const prueba = (req, res) => {
    return res.json({
        status: 'success',
        message: 'artist'
    })
}

const save = async (req, res) => {

    // Obtener datos del body
    const params = req.body;

    // Crear el objeto a guardar
    const artist = new Artist(params);

    // Guardarlo en bbdd
    try {
        await artist.save();

        return res.json({
            status: 'success',
            message: 'save artist',
            artist
        });

    } catch (error) {
        console.log(error);

        throw new Error('Error guardando el artista');
    }
}

const getArtist = async (req, res) => {

    // Obtener id de la url
    const id = req.params.id;

    // Valida si el id enviado es valido
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            status: 'error',
            message: 'No es un id valido'
        });
    }

    // Find a la bbdd
    try {
        const artist = await Artist.findById(id);
        
        return res.json({
            status: 'success',
            message: 'Get artist',
            artist
        });
    } catch (error) {
        console.log(error);

        throw new Error('Error consultando al artista');
    }

}

const list = async (req, res) => {

    // Pagina pasada por url
    const page = (!req.params.page) ? 1 : req.params.page;

    const itemsPerPage = 5;

    // Find a la base y al contador
    try {
        const [total, artists] = await Promise.all([
            Artist.countDocuments(),
            Artist.find()
                    .sort('name')
                    .paginate(page, itemsPerPage)
        ])
    
    
        return res.json({
            status: 'success',
            message: 'List artist',
            total,
            artists
        });
        
    } catch (error) {
        console.log(error);

        throw new Error('Error consultado el listado de artistas');
    }
}

const update = async (req, res) => {

    // Obtener id de la url
    const id = req.params.id;

    // Comprobar que es un id valido
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            status: 'error',
            message: 'No es un id valido'
        });
    }

    // Obtener datos Body
    const data = req.body;

    // Buscar y actualizar datos artista
    try {
        const userUpdate = await Artist.findByIdAndUpdate(id, data, {new: true});
    
        return res.json({
            status: 'success',
            message: 'Put  artist',
            userUpdate
        });
        
    } catch (error) {
        console.log(error);

        throw new Error('Error actualizando al artista');
    }
}

const remove = async (req, res) => {

    // Obtener el id del artista de la url
    const id = req.params.id;
    
    try {
        // Consultar y eliminar artista
        const artist = await Artist.findByIdAndRemove(id);

        // Eliminar los albunes
        const album = await Album.findOneAndDelete({artist: id});

        // Eliminar canciones
        const song = await Song.findOneAndDelete({album: album._id});

        
        
        return res.json({
            status: 'success',
            message: 'Delete  artist',
            artist,
            album,
            song
        });
    } catch (error) {
        console.log(error);

        throw new Error('Error intentado eliminar el artista');
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
        const update = await Artist.findByIdAndUpdate({_id: id}, {image:req.file.filename}, {new:true});

        if(update){
            return res.json({
                status: 'success',
                message: 'Artist upload',
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
    const filePath = './uploads/artists/'+file;

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
    getArtist,
    list,
    image,
    prueba,
    remove,
    save,
    update,
    upload
}