const router = require("express").Router();
const user = require("../models/user");
const { registerValidation, loginValidation } = require("../validation.js");
const bcrypt = require("bcrypt");


// Registration - POST
router.post("/register", async (request, response) => {
    // Validate the user input (via library: joi):
    // TODO: What if this was indeed only contained in this file after all? + What if no joi package?

    // import only "error" param from the function return value (it IS name-dependent)
    const { error } = registerValidation(request.body);
    if (error) {
        return response.status(400).json( { error: error.details[0].message } );
    }


    // - Email: is it already registered?
    const emailExists = await user.findOne( { email: request.body.email } );
    if (emailExists) {
        return response.status(400).json( { error: "Email already exists!" } );
    }

    // - Password: hash (via another library: bcrypt)
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(request.body.password, salt);
    // OR: const password = await bcrypt.hash(request.body.password, 10); where 10 = # rounds to generate salt (see genSalt())

    // Finally: Create a new user object and save it in database
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

    // ~~we don't even have to store/retrieve the salt manually, smh
    const isPasswordValid = await bcrypt.compare(request.body.password, userEntry.password);
    if (!isPasswordValid) {
        // More serious issue: Never tell a user their email OR their password is wrong, always do so collectively.
        return response.status(400).json( { error: "Wrong password!" } );
    }
});

// QUESTION: any other way to export files to other files than module.exports?
module.exports = router;