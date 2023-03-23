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
const productRoutes = require("./routes/product.js");
const taskRoutes = require("./routes/task.js");
const authRoutes = require("./routes/auth.js");

// misc (setups):
// .env file
require("dotenv-flow").config();

// parse request of Content-Type JSON
app.use(express.json()); //app.use(bodyParser.json());


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


// CRUD routes (aka POST/GET/PUT *or* PATCH/DELETE)
// TODO?: Redefine these if I need more specific route URLs (for example, some product routes not falling under /api/products)
app.use("/api/products", productRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/user", authRoutes);


const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => { console.log("Server is listening on port: " + PORT) } );


module.exports = server;