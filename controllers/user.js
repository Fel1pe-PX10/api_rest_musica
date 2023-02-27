const { validateUser } = require('../helpers/validate');


// ruta prueba
const test = (req, res) => {
    return res.json({
        status: 'success',
        message: 'user'
    })
}

const register = async(req, res) => {

    // Obtener datos del req
    const params = req.body;    

    // Comprobar datos mínimos obligatorios
    if(!params.name || !params.nick || !params.email || !params.password){
        return res.status(400).json({
            status: 'error',
            message: 'Datos mínimos incompletos'
        });
    }

    // Validación de datos
    try {
        validateUser(params);
    } catch (error) {
        console.log(error);

        return res.status(400).json({
            status: 'error',
            message: 'Validación de datos no superada'
        })
        
    }

    // Control usuarios duplicados

    // Cifrar contraseña


    // Crear objeto del usuario 

    // Guardar en la bbdd

    // Limpiar respuesta

    // Enviar respuesta
    return res.json({
        status: 'success',
        message: 'registro'
    })
}

module.exports = {
    test,
    register
}