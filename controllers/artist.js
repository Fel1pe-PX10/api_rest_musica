
const Artist = require('../models/artist');

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

module.exports = {
    prueba,
    save
}