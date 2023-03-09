const options = {
    openapi: '3.0.0'          
}

const swaggerAutogen = require("swagger-autogen")(options);

// set up params required for generation
const outputFile = "swagger-output.json";

const endpointsFiles = ["./routes/*.js"]
//const endpointsFiles = ["/routes/product.js", "/routes/auth.js"];  // "NOTE: if you use the express Router, you must pass in the 
                                                                     //   'endpointsFiles' only the root file where the route starts,
                                                                     //   such as: index.js, app.js, routes.js, ...""

const doc = {
  info: {
    version: '1.0.0',
    title: 'REST API with MEN',
    description: `This is a student API made for a course.
    Contains the basics - CRUD operations for minimal registered and guest users.\n
    Content domain: Products (TODO: replace with something else)`,
  },
  host: 'localhost:4000',      // by default: 'localhost:3000'
  basePath: '/api/products/',  // by default: '/'; ~~if all paths went through /products, then that would go here
  schemes: ['http'],   // by default: ['http']
  consumes: [],  // by default: ['application/json']
  produces: [],  // by default: ['application/json']
  tags: [        // by default: empty Array
    {
      name: 'GET Routes',
      description: 'Routes that return information from the database. Not protected.',
    },
    {
        name: 'POST Routes',
        description: 'Routes that add to the database. Create a user and authenticate to use these.',
    },
  ],
  securityDefinitions: {},  // by default: empty object
  definitions: {},          // by default: empty object (Swagger 2.0)
  components: {             // by default: empty object (OpenAPI 3.x)
    schemas: {
      Product: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          price: { type: "string" },
          inStock: { type: "boolean" }
        }
      },
      User: {
        type: "object",
        properties: {
          username: { type: "string" },
          email: { type: "string" },
          password: { type: "string" }
        }
      }
    },
    securitySchemes: {
      ApiKeyAuth: {
          type: 'apiKey', 
          in: 'header',     
          name: 'auth-token'
      }        
    }
  }
};


swaggerAutogen(outputFile, endpointsFiles, doc)
    .then( () => { require("./server.js")/* root file*/; })
    .catch( (error) => { console.log(error) } );