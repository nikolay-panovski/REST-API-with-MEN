const router = require("express").Router();
const project = require("../models/project.js");
const user = require("../models/user.js");
const { verifyJWTToken } = require("../validation.js");


// GET: current user projects for dashboard
// (might not be necessary if we preserve user info from register/login routes)
router.get("/currentuser/:id", (request, response) => {
    user.findById(request.params.id)
        .then(foundUser => { response.status(200).send({
                projects: foundUser.projects
            });
        })
        .catch(error => { response.status(500).send( { message: error.message } ); } );
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
        .catch(error => { response.status(500).send( { message: error.message } ); } );
});

router.post("/create", verifyJWTToken, (request, response) => {
    data = request.body;

    project.create(data)
        .then( (insertedData) => { 
            // apply the second side of the "assignees" reference - project ID on user.
            // project creation will always have the first assignee be the manager who creates it, so for user ID look at the first assignee.
            user.findByIdAndUpdate(insertedData.assignees[0], { $push: { projects: insertedData._id } } )
                .catch( (error) => { response.status(500).send( { message: error.message } ); } );

            response.status(201).send( { message: `Project "${insertedData.name}" created successfully.` } );
            } )
        .catch(       (error) => { response.status(500).send( { message: error.message } ); } );
});

    


module.exports = router;