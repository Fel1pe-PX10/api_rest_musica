
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');


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

const update = async (req, res) => {

    // Datos usuario identificado
    const userIdentity = req.user;

    // Obtener los datos a actualizar
    const userToUpdate = req.body;

    // comprobar usuarios almacenados y ver que no exista uno con la misma información a actualizar
    const userIsset = await User.find({
                                        $or: [
                                            { email: userToUpdate.email.toLowerCase() },
                                            { nick: userToUpdate.nick.toLowerCase() }
                                        ]
                                    }); 

    userIssetFlag = false;
    userIsset.forEach(user => {
        if(user && user._id != userIdentity.id) {
            userIssetFlag = true;
            console.log(user._id, userIdentity.id);
        }
    });

    if(userIssetFlag){
        return res.status(400).json({
            status: 'error',
            message: 'Existen datos con esos valore y no puede actualizarse el usuario actual'
        });
    }

    // Cifrar password si llega (si no borrar del objeto)
    if(userToUpdate.password){
        const pwd = await bcrypt.hash(userToUpdate.password, 10);
        userToUpdate.password = pwd;
    }
    else{
        delete userToUpdate.password;
    }

    // Actualizar informacion del usuario
    try {
        const userUpdate = await User.findByIdAndUpdate({_id: userIdentity.id}, userToUpdate, {new:true});

        return res.json({
            status: 'success',
            message: 'Usuario update',
            userUpdate
        });
        
    } catch (error) {
        console.log(error);

        throw new Error('Error al momento de actualizar el usuario');
        
    }
}

const upload = async(req, res) => {
    
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
        const update = await User.findByIdAndUpdate({_id: req.user.id}, {image:req.file.filename}, {new:true});

        if(update){
            return res.json({
                status: 'success',
                message: 'Usuario upload',
                update
            });
        }
        
    } catch (error) {
        console.log(error);

        throw new Error('Error al momento de guardar el nombre en la bbdd');
    }
}

const avatar = async (req, res) => {
    // Obtener parametro de la url
    const file = req.params.file

    //Montar el path real de la imagen
    const filePath = './uploads/avatars/'+file;

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
    avatar,
    login,
    getUser,
    register,
    test,
    update,
    upload
}