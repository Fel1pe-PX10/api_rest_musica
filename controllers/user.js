
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');


const User = require('../models/user');

const { validateUser } = require('../helpers/validate');

const { findOne } = require('../models/user');

const { createToken } = require('../services/jwt');


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

const login = async (req, res) => {
    // Obtener los parametros de la peticion
    const params = req.body;

    // Comprobar que llegan completos
    if(!params.email || !params.password){
        return res.status(400).json({
            status: 'error',
            message: 'Credenciales incompletas'
        });
    }

    // Comprobar que existe el usuario en la bbddd
    try {
        const userDb = await User.findOne({email: params.email}).select('+password +role');
        
        if(!userDb){
            return res.status(404).json({
                status: 'error',
                message: 'No existe un usuario con ese correo'
            });
        }
        
        // Comprobar contraseña
        const pwd = await bcrypt.compareSync(params.password, userDb.password);

        if(!pwd){
            return res.status(400).json({
                status: 'error',
                message: 'Error de credenciales'
            });
        }

        // Crear token jwt
        const token = createToken(userDb);

        // Devolver datos usuarios y token
        return res.json({
            status: 'success',
            message: 'Usuario Login',
            userDb,
            token
        })


    } catch (error) {
        console.log(error);
        throw new Error('Error consultando al usuario o sus credenciales');
    }
}

const getUser = async(req, res) => {
    // Obtener id del usuario de la url
    const id = req.params.id;

    // Consulta del usuario
    try {
        // Comprueba si es un id valido de mongoose
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'No es un id valido'
            });
        }

        const userDb = await User.findById(id);
    
        if(!userDb){
            return res.status(404).json({
                status: 'error',
                message: 'No existe un usuario con ese id'
            });
        }

        return res.json({
            status: 'success',
            message: 'Usuario profile',
            userDb,
            identity: req.user
        })
    } catch (error) {
        console.log(error);
        throw new Error('Error consultando al usuario');
    }
}

module.exports = {
    login,
    getUser,
    test,
    register
}