const router = require("express").Router();
const taskModel = require("../models/task.js");
const userModel = require("../models/user.js");
const { verifyJWTToken } = require("../validation.js");


//function ArrayToTailoredObject(inputArray) { ...
//function ObjectToTailoredObject(inputObject) { ...


// GET: all stored tasks
// [REMOVE]: no single user would need to fetch all tasks in the entire collection, without any filtering/organization (well, not sure about managers)
router.get("/", (request, response) => {
    taskModel.find()
        .then( (tasksData) => { response.status(200).send( tasksData )} )
        .catch( (error) => { response.status(500).send( { error: error.message } )} );
});

// GET: specific task by ID
// the first /id is added to circumvent the problem where
// every URL query with one parameter is only checked against the first "/:parameter" route
// [USE]: task details page? (not planned properly)
router.get("/id/:id", (request, response) => {
    taskModel.findById(request.params.id)
        .then( (oneTaskData) => { response.status(200).send( oneTaskData )} )
        .catch( (error) => { response.status(500).send( { error: error.message } )} );
});

// GET: specific tasks by Visibility (TODO: restrict the full access to Manager users only, return only Personal tasks to others)
// TODO (multiple routes): ERROR instead of empty array on non-existent parameter (if-check tasksData)
// [USE]: for dashboard - filter between project tasks and personal tasks (the former needs an extra filter on task.assignee)
router.get("/visibility/:sv", (request, response) => {
    taskModel.find( { state_visibility: request.params.sv } )
        .then( (tasksData) => { response.status(200).send( tasksData )} )
        .catch( (error) => { response.status(500).send( { error: error.message } )} );
});

// GET: specific tasks by Project
// [REMOVE]: useful for dashboard organization and sorting, but those are dropped from current scope. NOT useful for meaningfully fetching user's current tasks.
router.get("/project/:pr", (request, response) => {
    taskModel.find( { project: request.params.pr } )
        .then( (tasksData) => { response.status(200).send( tasksData )} )
        .catch( (error) => { response.status(500).send( { error: error.message } )} );
});

router.get("/public/:userid", (request, response) => {
    taskModel.find( { project: { $ne: null } , assignee: request.params.userid } )
        .then( (tasksData) => { response.status(200).send( tasksData )} )
        .catch( (error) => { response.status(500).send( { error: error.message } )} );
});

// GET: specific tasks by Assignee !!! (combine with task.project === null for personal tasks)
// de facto allows getting the personal tasks of any user. there is probably no way to mitigate that without help from frontend.
router.get("/personal/:userid", (request, response) => {
    taskModel.find( { project: null, assignee: request.params.userid } )
        .then( (tasksData) => { response.status(200).send( tasksData )} )
        // Can we do any better with the error messages and the data that the frontend can use from them for the user?
        .catch( (error) => { response.status(500).send( { error: error.message } )} );
});


// POST: create new task
router.post("/create/", verifyJWTToken, (request, response) => {
    data = request.body;

    taskModel.create(data)
        .then( (insertedData) => { 
            // apply the second side of the "assignees" reference - task ID on user.
            userModel.findByIdAndUpdate(insertedData.assignee, { $push: { tasks: insertedData._id } } )
                .catch( (error) => { response.status(500).send( { error: error.message } ); } );

            response.status(201).send( { message: `Task "${insertedData.name}" created successfully.`,
                                        _id: insertedData._id } );
        } )
        .catch(       (error) => { response.status(500).send( { error: error.message } ); } );
});

// PATCH: update task by ID (only Name and Description allowed, at least for now)
// If only one of the two is sent, the rest is NOT updated(patched).
router.patch("/edit/:id", verifyJWTToken, (request, response) => {
    const newName = request.body.name;
    const newDesc = request.body.description;
    const newTimeReg = request.body.time_registered;

    // https://mongoosejs.com/docs/api/model.html#model_Model-findByIdAndUpdate
    // see update param, options param, and $set
    taskModel.findByIdAndUpdate(request.params.id, { $set: { name: newName, description: newDesc, time_registered: newTimeReg } }, { overwrite: false } )
        .then( (updatedData) => { response.status(200).send( { message: `Task "${updatedData.name}" updated successfully.` } ); } )
        .catch(      (error) => { response.status(500).send( { error: error.message } ); } );
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
                    response.status(404).send( { error: "Cannot delete Product with ID: " + id + ". It may not exist." } );
                }
                else response.status(200).send( { message: "Product successfully deleted." } );
            })
        .catch(error => { response.status(500).send( { error: error.message } ); } );
});


module.exports = router;