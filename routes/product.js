const router = require("express").Router();
const product = require("../models/product.js");
const { verifyToken } = require("../validation.js");


function ArrayToTailoredObject(inputArray) {

    let outputArray = inputArray.map(element => (
        {
            // replaceable by "return ObjectToTailoredObject(element)" (are there any side effects?)
            id: element._id,
            name: element.name,
            price: element.price,

            // HATEOAS for this resource - read up your materials for this week:
            // (hardcoded string is a bad practice)
            uri: "/api/products/" + element._id
        }
    ));

    return outputArray;
}

function ObjectToTailoredObject(inputObject) {
    return {
        id: inputObject._id,
        name: inputObject.name,
        price: inputObject.price,

        uri: "/api/products/" + inputObject._id
    }
}


// Create new specific product(s) - POST
// we already have the general URL in server.js app.use("/api/products"), and we are not appending subdirs to it -> only "/" here
// QUESTION: How does verifyToken obtain the other function listed here after it to pass it as its "next"
// (in my case: "nextFunc") function?
router.post("/", verifyToken, (request, response) => {
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

/**
// Read all existing products - GET
    // SELF-EXERCISE: Try defining the steps in comments like above but alone, and then writing the code around them
    // (and from Mongoose documentation).
router.get("/", (request, response) => {
    // Request is to main URL - respond with all products.
    // GET everything in database - find() query with no filter.
    product.find()
        // THEN: Compose a response for the client.
        // Successful GET (200 OK) + send the data.
        .then(obtainedData => { response.status(200).send(obtainedData); } )
        // CATCH: Something failed. Generic failure (500 Internal Server Error) + raw caught error message.
        .catch(error => { response.status(500).send( {message: error.message } ); } );

        //.then(response.status(200).send(data))    // where data = product.find(), or at least that was the intention
});
/**/

// !! Same as above but we modify the data before sending it back to the GET - see Array/ObjectToTailoredObject()
// We CAN also enforce JWT validation on Read routes - if even the data that can be *read* is too sensitive.
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
    // get a random product
    product.countDocuments()
        .then(count => {
            // get a random number between 0 and count
            // * count is a problem if we hit 1 on Math.random() (but Math.random's range is said to be [0; 1) );
            // * (count - 1) is a problem if we have 0 documents
            let random = Math.round(Math.random() * count );

            // Skip method (fetch) one document at "random" offset
            // (we still need to query all documents)
            product.findOne().skip(random)
                .then(data => { response.status(200).send(ObjectToTailoredObject(data)) } )
                .catch(error => { response.status(500).send( { message: "Wow, you couldn't fetch a random document" } ) } );
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

// Read specific existing product - GET
// :id here indicates TO EXPRESS to expect a parameter.
// CORRESPONDS TO request.params.<key>, so: "/:myid" -> request.params.myid
router.get("/:id", (request, response) => {
    // Request is to specific id URL - filter response to that id.

    // !! Does NOT correspond to Query > Query Parameters > anything, really. What are the works behind the magic of "/:id" ???

    product.findById(request.params.id)     // equivalent (almost) to findOne({ _id: id }) for MongoDB
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
router.put("/:id", verifyToken, (request, response) => {
    const id = request.params.id;

    // ~~update intricacies (POST vs PUT vs PATCH stuff) safeguarded by being forced to a Mongoose method, lame...
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
router.delete("/:id", verifyToken, (request, response) => {
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