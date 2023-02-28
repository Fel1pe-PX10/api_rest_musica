
const jwt = require('jwt-simple')
const moment = require('moment');

const { secretKey } = require('../services/jwt');

const auth = (req, res, next) => {
    
    if(!req.headers.authorization){
        return res.status(403).json({
            status: 'error',
            message: 'No tiene cabecera de autenticación'
        })
    }

    const token = req.headers.authorization.replace(/['"]+/g, '');

    
    try {
        const payload = jwt.decode(token, secretKey);
        if(payload.exp <= moment().unix()){
            return res.status(401).json({
                status: 'error',
                message: 'Token expirado'
            })
        }

        req.user = payload;
        
    } catch (error) {
        console.log(error);

        return res.status(404).json({
            status: 'error',
            message: 'Token invalido'
        })
    }

    next();
}

module.exports = auth;
