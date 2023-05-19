const joi = require("joi");
const jwt = require("jsonwebtoken");


function registerValidation(data) {
    const schema = new joi.object(
        {
            name_first: joi.string().max(255).required(),
            name_last: joi.string().max(255).required(),
            email: joi.string().required(),
            password: joi.string().min(8).max(255).required(),
            company: joi.string(),
            // To export an ("enum") array such that an enum change won't break 7 other files in the application,
            // and use it here in valid(), use the array with JS spread syntax: valid(...array) to unpack it into parameters.
            role: joi.string().valid("Employee", "Manager").error(errors => {
                errors.forEach(error => {
                    if (error.code == "any.only") error.message = "Allowed roles are Employee and Manager. Certain values like Stakeholder and Client are explicitly considered but not supported in this version. Otherwise, check for typos, or faulty frontend options.";
                })
            })
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
        
        request.user = verified;    // QUESTION: why "user"? and where does "request" get reused for "user" to be inspected - nextFunc?
        nextFunc();
    }
    catch (e) {
        // ~~caught error param is not used, the error below is a fresh new property
        response.status(400).json( { error: "Token is not valid" } );
    }
}


module.exports = { registerValidation, loginValidation, verifyJWTToken };