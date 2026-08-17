//importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment");

//clave secreta

const secret = "CLAVE_SECRETA_Mauri_10";

//CREAR UNA FUNCION PARA GENERAR TOKENS
exports.createToken = (user) => {
    const payload ={
        id : user.id,
        name : user.name,
        surname : user.surname,
        email : user.email,
        imagen: user.imagen,
        iat : moment().unix(),
        exp : moment().add(30, "days").unix()
    }
    //devolver jwt token codificado
    return jwt.encode(payload, secret);
};


