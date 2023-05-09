const router = require("express").Router();
const user = require("../models/user.js");


// GET: current user info for header
// (might not be necessary if we preserve user info from register/login routes)
router.get("/headerinfo/:id", (request, response) => {
    user.findById(request.params.id)
        .then(foundUser => { response.status(200).send({
                    name: foundUser.name_first + " " + foundUser.name_last,
                    company: foundUser.company,
                    role: foundUser.role
                });
        })
        .catch(error => { response.status(500).send( { message: error.message } ); } );
});

// GET: current user role for conditional displays
// (might not be necessary if we preserve user info from register/login routes)
router.get("/roleinfo/:id", (request, response) => {
    user.findById(request.params.id)
        .then(foundUser => { response.status(200).send({
                    role: foundUser.role
                });
        })
        .catch(error => { response.status(500).send( { message: error.message } ); } );
});

module.exports = router;