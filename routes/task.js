const router = require("express").Router();
const taskModel = require("../models/task.js");
const { verifyJWTToken } = require("../validation.js");

// define properties to map uniquely for the current object Model:
function ArrayToTailoredObject(inputArray) {
    return inputArray.map(element => (
        {
            id: element._id,
            name: element.name,
            description: element.description,
            state_visibility: element.state_visibility,
            state_completion: element.state_completion,
            created_at: element.created_at,
            time_estimated: element.time_estimated,
            time_registered: element.time_registered
            // TODO missing/future properties
        }
    ));
}

function ObjectToTailoredObject(inputObject) {
    return {
        id: inputObject._id,
        name: inputObject.name,
        description: inputObject.description,
        state_visibility: inputObject.state_visibility,
        state_completion: inputObject.state_completion,
        created_at: inputObject.created_at,
        time_estimated: inputObject.time_estimated,
        time_registered: inputObject.time_registered
        // TODO missing/future properties
        
        // HATEOAS for this resource, I might or might not want that for some property later
        //uri: "/api/tasks/" + inputObject._id
    }
}

// GET: all stored tasks
router.get("/", (request, response) => {
    taskModel.find()
        .then( (tasksData) => { response.status(200).send( ArrayToTailoredObject(tasksData) )} )
        .catch( (error) => { response.status(500).send( { message: error.message } )} );
});

// GET: specific task by ID
// the first /id is added to circumvent the problem where
// every URL query with one parameter is only checked against the first "/:parameter" route
router.get("/id/:id", (request, response) => {
    taskModel.findById(request.params.id)
        .then( (oneTaskData) => { response.status(200).send( ObjectToTailoredObject(oneTaskData) )} )
        .catch( (error) => { response.status(500).send( { message: error.message } )} );
});

// GET: specific task by Name
// WARNING: URL queries are case sensitive (without extra code) and spaces have to be replaced by "%20" (at least in Chrome).
router.get("/:name", (request, response) => {
    taskModel.findOne( { name: request.params.name } )
        .then( (tasksData) => { response.status(200).send( ObjectToTailoredObject(tasksData) )} )
        .catch( (error) => { response.status(500).send( { message: error.message } )} );
});

// GET: specific task by Visibility (TODO: restrict the full access to Manager users only, return only Personal tasks to others)
// TODO (multiple routes): ERROR instead of empty array on non-existent parameter (if-check tasksData)
router.get("/visibility/:sv", (request, response) => {
    taskModel.find( { state_visibility: request.params.sv } )
        .then( (tasksData) => { response.status(200).send( ArrayToTailoredObject(tasksData) )} )
        .catch( (error) => { response.status(500).send( { message: error.message } )} );
});

// GET: specific task by Completion
router.get("/completion/:sc", (request, response) => {
    taskModel.find( { state_completion: request.params.sc } )
        .then( (tasksData) => { response.status(200).send( ArrayToTailoredObject(tasksData) )} )
        .catch( (error) => { response.status(500).send( { message: error.message } )} );
});

// TODO: GETs: created_at(? - if any role needs that for something), finished_at(? - see left), and missing properties


// POST: create new task
router.post("/create/", verifyJWTToken, (request, response) => {
    data = request.body;    // we expect exactly one document (without validation this is bad if multiple are attempted)
    // TODO: Can we validate data here and throw a 4xx error already if the format is invalid?

    taskModel.create(data)  // there is no insertOne()
        .then( (insertedData) => { response.status(201).send( { message: `Task "${insertedData.name}" created successfully.` } ); } )
        .catch(       (error) => { response.status(500).send( { message: error.message } ); } );
});

// PATCH: update task by ID (only Name and Description allowed, at least for now)
// If only one of the two is sent, the rest is NOT updated(patched).
router.patch("/edit/:id", verifyJWTToken, (request, response) => {
    const newName = request.body.name;
    const newDesc = request.body.description;

    // https://mongoosejs.com/docs/api/model.html#model_Model-findByIdAndUpdate
    // see update param, options param, and $set
    taskModel.findByIdAndUpdate(request.params.id, { $set: { name: newName, description: newDesc} }, { overwrite: false } )
        .then( (updatedData) => { response.status(200).send( { message: `Task "${updatedData.name}" updated successfully.` } ); } )
        .catch(      (error) => { response.status(500).send( { message: error.message } ); } );
});

// DELETE: task by ID (+ validation - TODO: upgrade to "Manager only" + "always on Personal")
router.delete("/delete/:id", verifyJWTToken, (request, response) => {
    taskModel.findByIdAndDelete(request.params.id)
        .then(data => 
            {
                if (!data)      // product not found on MongoDB - possibly bad ID
                                // EDIT: this seems off, this check probably should be before deletion.
                                // Right now I am getting 500 from catch, "id is not defined".
                {
                    response.status(404).send( { message: "Cannot delete Product with ID: " + id + ". It may not exist." } );
                }
                else response.status(200).send( { message: "Product successfully deleted." } );
            })
        .catch(error => { response.status(500).send( { message: error.message } ); } );
});

// TODO: DELETE: design choice for whether I need any others. Deleting by non-unique fields is dangerous.

module.exports = router;