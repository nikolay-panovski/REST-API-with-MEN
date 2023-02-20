const joi = require("joi");

// validate registration
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


// validate login


// logic to verify our token (JSON Web Tokens JWT)


module.exports = { registerValidation };