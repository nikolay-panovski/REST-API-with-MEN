const router = require("express").Router();
const product = require("../models/product.js");


function returnTailoredObject(inputArray) {

    let outputArray = inputArray.map(element => (
        {
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




// Create new specific product(s) - POST
// we already have the general URL in server.js app.use("/api/products"), and we are not appending subdirs to it -> only "/" here
router.post("/", (request, response) => {
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

// Read all existing products - GET
    // SELF-EXERCISE: Try defining the steps in comments like above but alone, and then writing the code around them
    // (and from Mongoose documentation).
// Read specific existing product - GET


// Update specific existing product - PUT (notice: not PATCH here)
router.put("/:id", (request, response) => {
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
router.delete("/:id", (request, response) => {
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