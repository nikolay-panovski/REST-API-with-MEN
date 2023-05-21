const router = require("express").Router();
const user = require("../models/user");
const { registerValidation, loginValidation } = require("../validation.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// Registration - POST
// ONLY USE THIS ROUTE THROUGH TESTING CLIENTS! FRONTEND WILL NOT PROVIDE A METHOD TO CALL THIS!
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
        name_first: request.body.name_first,
        name_last: request.body.name_last,
        email: request.body.email,
        password: password,
        company: "100%DEV",     // will not implement company model or use register route on frontend, this is hardcoded only to visualize that
        role: request.body.role,    // same story here, but I might want to insert both managers and employees in the database, or check for theoretical future errors...
        projects: new Array(),
        tasks: new Array(),
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

    let result =
    {
        error: "",
        data:
        {
            token: "",
            userHandle: ""
        }
    }

    const { err } = loginValidation(request.body);
    if (err) {
        result.error = err.details[0].message;
        result.data.token = null;
        result.data.userHandle = null;
        return response.status(400).json(result);
    }

    const userEntry = await user.findOne( { email: request.body.email } );
    if (!userEntry) {
        result.error = "Email does not exist in the database!";
        result.data.token = null;
        result.data.userHandle = null;
        return response.status(400).json(result);
    }

    const isPasswordValid = await bcrypt.compare(request.body.password, userEntry.password);
    if (!isPasswordValid) {
        result.error = "Wrong email or password!";
        result.data.token = null;
        result.data.userHandle = null;
        return response.status(400).json(result);
    }


    const token = jwt.sign(
        {                                           // payload
            name: userEntry.name_first + " " + userEntry.name_last,
            id: userEntry._id
        },
        process.env.TOKEN_SECRET,                   // TOKEN_SECRET
        {                                           // object Options (here: expiration time only)
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );

    result.error = null;
    result.data.token = token;
    result.data.userHandle = userEntry._id;
    // This produces a response with header { auth-token: <JWT token here> }
    // *and* also sends the { error ; data } object below as the response BODY (which also contains the token).
    response.header("auth-token", token).json(result);
    // CAN DO: On a front-end app that works together with this, save/cache the token (also matters how often it expires).
    // This comes with the implication that the front-end app is tied to the backend/server/database, and NOT the user, if I understand correctly.
});

// QUESTION: any other way to export files to other files than module.exports?
module.exports = router;