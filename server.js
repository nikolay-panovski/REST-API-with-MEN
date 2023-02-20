// import dependencies
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();

// import routes (reference with or without .js does not matter)
const productRoutes = require("./routes/product.js");
const authRoutes = require("./routes/auth.js");

// .env file
require("dotenv-flow").config();


// parse request of Content-Type JSON
app.use(bodyParser.json());


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


// welcome route (the "Hello, world!" of this set of exercises)
app.get("/api/welcome", (request, response) => {
    response.status(200).send( { message: "Welcome to the MEN RESTful API" } );
});

// CRUD routes (aka POST/GET/PUT *or* PATCH/DELETE)
app.use("/api/products", productRoutes);
app.use("/api/user", authRoutes);


const PORT = process.env.PORT || 4000;

function testPrintPort() {
    console.log("Server is listening on port: " + PORT);
}


app.listen(PORT, testPrintPort);