
const jwt = require('jwt-simple');
const moment = require('moment');
const { removeListener } = require('../models/user');

// Clave secreta
const secretKey = 'L1Clav3Sr3cret4';

const createToken = (user) => {
    const payload = {
        id: user._id,
        nombre: user.name,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
    };

    return jwt.encode(payload, secretKey);
}

module.exports = {
    secretKey,
    createToken
}