const router = require("express").Router();
const user = require("../models/user");


// Registration - POST
router.post("/register", async (request, response) => {

});

router.post("/login", async (request, response) => {

});

// QUESTION: any other way to export files to other files than module.exports?
module.exports = router;