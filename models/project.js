const mongoose = require("mongoose");
                                        

let projectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, maxLength: 255
            /*, unique: true? // maybe it is not required by design, also unique IS NOT A VALIDATOR:
                              // https://mongoosejs.com/docs/faq.html#unique-doesnt-work */ },
        description: { type: String, required: false },
        company_stakeholder: { type: String, required: true /* type: ObjectId w/ ref: "company"? // uh oh... */ },
        cs_contact_person: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        company_deliverer: { type: String, required: true /* type: ObjectId w/ ref: "company"? // uh oh... */ },
        cd_contact_person: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        created_at: { type: Date, default: Date.now() },
        finished_at: { type: Date, required: true, min: created_at },
        deadline: { type: Date, required: true },
        assignees: [ { type: mongoose.Schema.Types.ObjectId, ref: "user" } ],
        tasks: [ { type: mongoose.Schema.Types.ObjectId, ref: "task" } ],
        //time_registered_total: []?    // what is the usage of this within a project and not an individual task?
    }
);


module.exports = mongoose.model("project", projectSchema);