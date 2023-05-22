const router = require("express").Router();
const taskModel = require("../models/task.js");
const projectModel = require("../models/project.js");
const userModel = require("../models/user.js");
const { verifyJWTToken } = require("../validation.js");

// define properties to map uniquely for the current object Model:
// [REMOVE]: use filters during model finding instead?
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
// [REMOVE]: no single user would need to fetch all tasks in the entire collection, without any filtering/organization (well, not sure about managers)
router.get("/", (request, response) => {
    taskModel.find()
        .then( (tasksData) => { response.status(200).send( ArrayToTailoredObject(tasksData) )} )
        .catch( (error) => { response.status(500).send( { message: error.message } )} );
});

// GET: specific task by ID
// the first /id is added to circumvent the problem where
// every URL query with one parameter is only checked against the first "/:parameter" route
// [USE]: task details page? (not planned properly)
router.get("/id/:id", (request, response) => {
    taskModel.findById(request.params.id)
        .then( (oneTaskData) => { response.status(200).send( oneTaskData )} )
        .catch( (error) => { response.status(500).send( { message: error.message } )} );
});

// GET: specific tasks by Visibility (TODO: restrict the full access to Manager users only, return only Personal tasks to others)
// TODO (multiple routes): ERROR instead of empty array on non-existent parameter (if-check tasksData)
// [USE]: for dashboard - filter between project tasks and personal tasks (the former needs an extra filter on task.assignee)
router.get("/visibility/:sv", (request, response) => {
    taskModel.find( { state_visibility: request.params.sv } )
        .then( (tasksData) => { response.status(200).send( ArrayToTailoredObject(tasksData) )} )
        .catch( (error) => { response.status(500).send( { message: error.message } )} );
});

// GET: specific tasks by Project
// [REMOVE]: useful for dashboard organization and sorting, but those are dropped from current scope. NOT useful for meaningfully fetching user's current tasks.
router.get("/project/:pr", (request, response) => {
    taskModel.find( { project: request.params.pr } )
        .then( (tasksData) => { response.status(200).send( tasksData )} )
        .catch( (error) => { response.status(500).send( { message: error.message } )} );
});

router.get("/public/:userid", (request, response) => {
    taskModel.find( { project: { $ne: null } , assignee: request.params.userid } )
        .then( (tasksData) => { response.status(200).send( tasksData )} )
        .catch( (error) => { response.status(500).send( { message: error.message } )} );
});

// GET: specific tasks by Assignee !!! (combine with task.project === null for personal tasks)
// de facto allows getting the personal tasks of any user. there is probably no way to mitigate that without help from frontend.
router.get("/personal/:userid", (request, response) => {
    taskModel.find( { project: null, assignee: request.params.userid } )
        .then( (tasksData) => { response.status(200).send( tasksData )} )
        // Can we do any better with the error messages and the data that the frontend can use from them for the user?
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

// TEST POST: create new task with finalized model, do not pass "assignee" ObjectId in body
// but still assign a ref to a default user that already exists
// DO NOT EVEN THINK ABOUT USING THIS IN PRODUCTION (THE FRONTEND) !!
//
// Incorrect logic in creating this route: see this answer https://stackoverflow.com/a/44288255
// populate() fails inexplicably (probably because it gets nothing *to populate with*), but it is not what I want anyway.
router.post("/dirty/create/", async (request, response) => {
    data = request.body;

    let testAssignee = await userModel.findOne( { name_first: "Admin" } );

    // create() is syntactic sugar for new Model().save(): https://mongoosejs.com/docs/api/model.html#Model.create()
    // It isn't graceful to the database when doing anything other than a response in the .then that might fail on its own!
    // Consider using new Model() and later save() instead.
    taskModel.create(data)
        .then( (insertedData) => { testAssignee.tasks.push(insertedData);
                                   testAssignee.save();
                                   response.status(200).send( { message: "Now check the Admin user..." } );
                                 } )
        .catch( (error) => { response.status(500).send( { message: error.message } ); } );
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


// TODO: ORGANIZE !!
// COPIED FROM PROJECTS FOR TESTING
// GET: current user tasks for "free tasks" on dashboard
// (might not be necessary if we preserve user info from register/login routes)
router.get("/currentuser/:id", (request, response) => {
    userModel.findById(request.params.id)
    .then(foundUser => { 
        let tasksIDsArray = foundUser.tasks;
        let tasksArray = new Array();
        for (const taskID of tasksIDsArray) {
            fetch("http://localhost:4000/api/task/id/" + taskID)
                .then(taskResponse => { console.log(taskResponse.body); tasksArray.push(taskResponse.body); })
                .catch(error => { console.log(error); } );
        }

        response.status(200).send({
            tasks: tasksArray
        });
    })
    .catch(error => { response.status(500).send( { message: error.message } ); } );


});

module.exports = router;