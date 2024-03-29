const router = require("express").Router();
const user = require("../models/user");
const { registerValidation, loginValidation } = require("../validation.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// Registration - POST
router.post("/register", async (request, response) => {
    // Validate the user input (via library: joi):
    // QUESTION: What if this was indeed only contained in this file after all? + What if no joi package?

    // import only "error" param from the function return value (it IS name-dependent)
    const { error } = registerValidation(request.body);
    if (error) {
        return response.status(400).json( { error: error.details[0].message } );
    }


    const emailExists = await user.findOne( { email: request.body.email } );
    if (emailExists) {
        return response.status(400).json( { error: "Email already exists!" } );
    }

    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(request.body.password, salt);
    // OR: const password = await bcrypt.hash(request.body.password, 10); where 10 = # rounds to generate salt (see genSalt())

    const userObject = new user({
        username: request.body.username,
        email: request.body.email,
        password: password
    })

    try {
        const savedUser = await userObject.save();

        response.json( { error: null, data: savedUser._id } );
    }
    catch (error) {
        response.status(400).json( { error } );
    }
});

router.post("/login", async (request, response) => {
    const { error } = loginValidation(request.body);
    if (error) {
        return response.status(400).json( { error: error.details[0].message } );
    }

    const userEntry = await user.findOne( { email: request.body.email } );
    if (!userEntry) {
        return response.status(400).json( { error: "Email does not exist in the database!" } );
    }

    const isPasswordValid = await bcrypt.compare(request.body.password, userEntry.password);
    if (!isPasswordValid) {
        return response.status(400).json( { error: "Wrong email or password!" } );
    }


    const token = jwt.sign(
        {                                           // payload
            name: userEntry.name,
            id: userEntry._id
        },
        process.env.TOKEN_SECRET,                   // TOKEN_SECRET
        {                                           // object Options (here: expiration time only)
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );

    
    response.header("auth-token", token).json({
        error: null,
        data: { token }
    });
    // CAN DO: On a front-end app that works together with this, save/cache the token (also matters how often it expires).
    // This comes with the implication that the front-end app is tied to the backend/server/database, and NOT the user, if I understand correctly.
});

// QUESTION: any other way to export files to other files than module.exports?
module.exports = router;