
const bcrypt = require('bcrypt');


const User = require('../models/user');

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
    const userDb = await User.find({
                                $or: [
                                    {email: params.email},
                                    {nick: params.nick}
                                ]
                                });
    console.log(userDb.length);
    if(userDb && userDb.length > 0){
        return res.status(400).json({
            status: 'error',
            message: 'El usuario ya se encuentra registrado en el sistema'
        })
    }

    // Cifrar contraseña
    const pwd = await bcrypt.hash(params.password, 10);
    params.password = pwd;

    // Crear objeto del usuario 
    const userToSave = new User(params);

    // Guardar en la bbdd
    try{
        await userToSave.save();

        // Limpiar respuesta
        const userCreated = userToSave.toObject();
        delete userCreated.password;
        delete userCreated.role;

        return res.json({
            status: 'success',
            message: 'Usuario guardado',
            userCreated
        })

    }catch(error){
        console.log(error);

        throw new Error('Error almacenando el usuario');
    }
}

module.exports = {
    test,
    register
}