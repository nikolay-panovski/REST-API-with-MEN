// dependencies - main - Express (for NodeJS), Mongoose (for MongoDB)
const express = require("express");
const mongoose = require("mongoose");
const app = express();

// dependencies - Swagger
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs"); // OR: import YAML from "yamljs";
const swaggerDefinition = YAML.load("./swagger.yaml");
app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerDefinition));


// import routes used in this application (reference with or without .js does not matter)
// (products preserved for testing, but not developed anymore)
const productRoutes = require("./routes/product.js");

const projectRoutes = require("./routes/project.js");
const taskRoutes = require("./routes/task.js");
const authRoutes = require("./routes/auth.js");
const userCrudRoutes = require("./routes/user_crud.js");

// misc (setups):
// .env file
require("dotenv-flow").config();

// parse request of Content-Type JSON
app.use(express.json()); //app.use(bodyParser.json());


// Handle CORS + middleware (copied from KW, except CORS allowed origins)
app.use(function(request, response, nextFunc) {
    response.header("Access-Control-Allow-Origin", /*"*"*/ "http://localhost:5173"/*TODO: also add remote deployment URL (or only for the assignment enable wildcard to the left)*/);
    response.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE"); // If using .fetch and not axios
    response.header("Access-Control-Allow-Headers", "auth-token, Origin, X-Requested-With, Content-Type, Accept");
    nextFunc();
});


// -- MAIN (aka mongoose connect 
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


// use CRUD routes (aka POST/GET/PUT *or* PATCH/DELETE)
app.use("/api/product", productRoutes);

app.use("/api/project", projectRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/userAuth", authRoutes);
app.use("/api/user", userCrudRoutes);


const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => { console.log("Server is listening on port: " + PORT) } );


module.exports = server;