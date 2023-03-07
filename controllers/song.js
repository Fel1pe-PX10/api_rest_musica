
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

module.exports = {
    prueba,
    save
}