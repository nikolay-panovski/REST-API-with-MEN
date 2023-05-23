const router = require("express").Router();
const project = require("../models/project.js");
const user = require("../models/user.js");
const task = require("../models/task.js");
const { verifyJWTToken } = require("../validation.js");


// GET: current user projects for dashboard
// (might not be necessary if we preserve user info from register/login routes)
router.get("/currentuser/:id", (request, response) => {
    user.findById(request.params.id)
        .then(foundUser => { response.status(200).send({
                projects: foundUser.projects
            });
        })
        .catch(error => { response.status(500).send( { error: error.message } ); } );
});

// GET: all projects (of the company, of which here there is one)
router.get("/all", (request, response) => {
    project.find( /*{ company_developer: request.params.<currentUser>}*/ )
        .then(foundProjects => { response.status(200).send(foundProjects)})
        .catch(error => { response.status(500).send( { error: error.message } ); } );
});

// GET: specific project (from button link) for project page
router.get("/:id", (request, response) => {
    project.findById(request.params.id)
        .then(foundProject => { response.status(200).send({
            name: foundProject.name,
            description: foundProject.description,
            company_client: foundProject.company_client,
            created_at: foundProject.created_at,
            finished_at: foundProject.finished_at,
            deadline: foundProject.deadline,
            assignees: foundProject.assignees,
            tasks: foundProject.tasks
            });
        })
        .catch(error => { response.status(500).send( { error: error.message } ); } );
});

// GET: all tasks of a specifc project by ID (for project page)
// in full document form of the included tasks, so that they can be rendered by frontend
router.get("/tasks/:id", (request, response) => {
    project.findById(request.params.id)
        .then((foundProject) => {
            foundProject.populate("tasks")
                .then( (fullProject) => { response.status(200).send(fullProject); } )
                .catch(error => { response.status(500).send( { error: "Document population failure! " + error.message } ); } );
        })
        .catch(error => { response.status(500).send( { error: error.message } ); } );
});

router.post("/create", verifyJWTToken, (request, response) => {
    data = request.body;

    project.create(data)
        .then( (insertedData) => { 
            // apply the second side of the "assignees" reference - project ID on user.
            // project creation will always have the first assignee be the manager who creates it, so for user ID look at the first assignee.
            user.findByIdAndUpdate(insertedData.assignees[0], { $push: { projects: insertedData._id } } )
                .catch( (error) => { response.status(500).send( { error: error.message } ); } );

            response.status(201).send( { message: `Project "${insertedData.name}" created successfully.`,
                                         _id: insertedData._id } );
            } )
        .catch(       (error) => { response.status(500).send( { error: error.message } ); } );
});

    


module.exports = router;