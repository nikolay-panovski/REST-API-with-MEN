const mongoose = require("mongoose");
                                        

let projectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, maxLength: 255 },
        description: { type: String, required: false },
        company_client: { type: String, required: true /* type: "company" will NOT be created for this assignment */ },
        created_at: { type: Date, default: Date.now() },
        finished_at: { type: Date, min: /*created_at*/Date.now() },
        deadline: { type: Date, required: true },
        assignees: [ { type: mongoose.Schema.Types.ObjectId, ref: "user" } ],
        tasks: [ { type: mongoose.Schema.Types.ObjectId, ref: "task" } ],
    }
);


module.exports = mongoose.model("project", projectSchema);