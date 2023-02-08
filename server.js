const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
require("dotenv-flow").config();    // .env file


// function definitions (I don't plan to get into anonymous functions in JS)
function a(request, response) {


    response
    .status(200)
    .send(
        {
            message: "Welcome to the MEN RESTful API"
        }
    )
}

// upcoming: routes (CRUD, aka POST/GET/PATCH/DELETE)
app.get("/api/welcome2", a);

mongoose.set("strictQuery", true);
mongoose.connect(
    process.env.DBHOST,     // uri
    {                       // options
        useUnifiedTopology: true,
        useNewUrlParser: true
    }
).catch(
    error => console.log("Error connecting to MongoDB: " + error)
);
//mongoose.connection.once("open", () => console.log("Successfully connected to MongoDB"));


const PORT = process.env.PORT || 4000;

function testPrintPort() {
    console.log("Server is listening on port: " + PORT);
}


app.listen(PORT, testPrintPort);

module.exports = app;