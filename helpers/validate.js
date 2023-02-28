const validator = require('validator');

const validateUser = (params) => {
    const name = !validator.isEmpty(params.name) &&
                    validator.isLength(params.name, {min: 3, max: 60});

    const nick = !validator.isEmpty(params.nick) &&
                    validator.isLength(params.nick, {min: 2, max: 60});

    const email = !validator.isEmpty(params.email) &&
                    validator.isEmail(params.email);

    const password = !validator.isEmpty(params.password) &&
                        validator.isLength(params.password, {min: 4, max: 20});
                    
    if(params.surname){
        const surname = !validator.isEmpty(params.surname) &&
                        validator.isLength(params.surname, {min: 3, max: 60});
        
        if(!surname){
            throw new Error('Error de datos en el Apellido');
        }
    }
   

    if(!name || !nick || !email || !password){
        throw new Error('Error de datos en los campos obligatorios');
    }
} 

module.exports = {
    validateUser
}