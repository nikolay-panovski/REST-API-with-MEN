const router = require("express").Router();
const product = require("../models/product.js");
const { verifyJWTToken } = require("../validation.js");


function ArrayToTailoredObject(inputArray) {
    return inputArray.map(element => (
        {
            // replaceable by "return ObjectToTailoredObject(element)" (are there any side effects?)
            id: element._id,
            name: element.name,
            price: element.price,
            //uri: "/api/products/" + element._id
        }
    ));
}

function ObjectToTailoredObject(inputObject) {
    return {
        id: inputObject._id,
        name: inputObject.name,
        price: inputObject.price,
        
        // HATEOAS for this resource, I might or might not want that for some property later
        //uri: "/api/products/" + inputObject._id
    }
}


// we already have the general URL in server.js app.use("/api/products"), and we are not appending subdirs to it -> only "/" here
    
    // QUESTION: How does verifyToken obtain the other function listed here after it to pass it as its "next"
    // (in my case: "nextFunc") function?
router.post("/", verifyJWTToken, (request, response) => {
    // Take request body and turn it into data to add to the database:
    data = request.body;
    // Run the data through Mongoose schema and constructors (see const product),
    // create and insert new DB entries:
    product.insertMany(data)
        // THEN: Compose a response for the client.
        // Successful creation (201 Created) + echo the data for visibility.
        
        // SELF-EXERCISE/QUESTION: Send a compound message back including text like
        // "Successfully created product" PLUS the inserted data?
        .then(insertedData => { response.status(201).send(insertedData); })
        // CATCH: Something failed. Generic failure (500 Internal Server Error) + raw caught error message.
        .catch(      error => { response.status(500).send( { message: error.message } ); } );
});


router.get("/", (request, response) => {
    product.find()
        //.then(obtainedData => { response.status(200).send(ArrayToTailoredObject(obtainedData)); } )
        /**/
        .then((obtainedData) => {
            let responseArray = new Array();

            for (anObject of obtainedData) {
                responseArray.push(ObjectToTailoredObject(anObject));
            }

            response.status(200).send(responseArray);
        }
        /**/
        ).catch(error => { response.status(500).send( {message: error.message } ); } );
});


router.get("/random", (request, response) => {
    product.countDocuments()
        .then(count => {
            let random = Math.round(Math.random() * count );

            product.findOne().skip(random)
                .then(data => { response.status(200).send(ObjectToTailoredObject(data)) } )
                .catch(error => { response.status(500).send( { message: "Something failed when fetching a random document" } ) } );
        });
});

// Read all documents based on variable field (see Product Schema) and value
// Copied over from https://github.com/sspangsberg/MEN_RESTAPI_EASV_S23/blob/main/routes/product.js
router.get("/:field/:value", (request, response) => {   
    // [] brackets are required, we are not certain why but JS seems to consider request.params.field an invalid identifier:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#object_literals
    product.find({ [request.params.field]: { $regex: request.params.value, $options:'i'/*case-insensitive*/ } })
    .then (data => { response.send(data) })  
    .catch (err => { 
        response.status(500).send( { message: err.message } )
    })
});


// Read all products IN STOCK - GET
router.get("/instock", (request, response) => {
    // HARDCODED URL

    product.find( { inStock: true } )
        .then(obtainedData => { response.status(200).send(obtainedData); } )
        .catch(error => { response.status(500).send( { message: error.message } ); } );
});

router.get("/instock/:flag", (request, response) => {
    const fl = request.params.flag;

    product.find( { inStock: fl } )
        .then(obtainedData => { response.status(200).send(obtainedData); } )
        .catch(error => { response.status(500).send( { message: error.message } ); } );
});

// Read specific existing product by ID - GET
router.get("/:id", (request, response) => {
    product.findById(request.params.id)
        .then(obtainedData => { response.status(200).send(ObjectToTailoredObject(obtainedData)); } )
        .catch(error => { response.status(500).send( { message: error.message } ); } );
});


// Example in class: GET products/price/lt/1000 (lt = less than)
router.get("/price/:operator/:price", (request, response) => {
    const _operator = request.params.operator;
    const _price = request.params.price;
    
    let filterExpression;

    switch (_operator) {
        case "lt":
            filterExpression = { $lt: _price };
            break;
        case "lte":
            filterExpression = { $lte: _price };
            break;
        case "gt":
            filterExpression = { $gt: _price };
            break;
        case "gte":
            filterExpression = { $gte: _price };
            break;
        default:
            response.status(400).send( { message: "Bad price operator: " + _operator + ". Use lt, lte, gt, gte." } );
            return;
    }

    product.find( { price: filterExpression } )
        .then( (matchingData) => { response.status(200).send(ArrayToTailoredObject(matchingData)) } )
        .catch( (error) => response.status(500).send( { message: error.message } ) );
});


// Update specific existing product - PUT (notice: not PATCH here)
router.put("/:id", verifyJWTToken, (request, response) => {
    const id = request.params.id;

    product.findByIdAndUpdate(id, request.body) // by default, if a document is returned, it will be from BEFORE the update.
        .then(data => 
            {
                if (!data)    // product not found on MongoDB - possibly bad ID
                {
                    response.status(404).send( { message: "Cannot update Product with ID: " + id } );
                }
                else response.status(200).send( { message: "Product successfully updated." } );
            })
        .catch(error => { response.status(500).send( { message: error.message } ); } );
});

// Delete specific existing product - DELETE
router.delete("/:id", verifyJWTToken, (request, response) => {
    const id = request.params.id;

    product.findByIdAndDelete(id)
        .then(data => 
            {
                if (!data)    // product not found on MongoDB - possibly bad ID
                {
                    response.status(404).send( { message: "Cannot delete Product with ID: " + id } );
                }
                else response.status(200).send( { message: "Product successfully deleted." } );
            })
        .catch(error => { response.status(500).send( { message: error.message } ); } );
});


module.exports = router;