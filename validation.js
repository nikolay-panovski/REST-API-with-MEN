const joi = require("joi");
const jwt = require("jsonwebtoken");


function registerValidation(data) {
    const schema = new joi.object(
        {
            username: joi.string().min(6).max(255).required(),
            email: joi.string().required(),
            password: joi.string().min(8).max(255).required()
        }
    );

    return schema.validate(data);
}


function loginValidation(data) {
    const schema = new joi.object(
        {
            email: joi.string().required(),
            password: joi.string().min(8).max(255).required()
        }
    );

    return schema.validate(data);
}


function verifyJWTToken(request, response, nextFunc) {
    const token = request.header("auth-token");
    if (!token) return response.status(401).json( { error: "Access Denied" } );

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        
        request.user = verified;
        nextFunc();
    }
    catch (e) {
        // ~~caught error param is not used, the error below is a fresh new property
        response.status(400).json( { error: "Token is not valid" } );
    }
}


module.exports = { registerValidation, loginValidation, verifyJWTToken };