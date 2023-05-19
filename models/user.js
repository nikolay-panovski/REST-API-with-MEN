const mongoose = require("mongoose");

let userSchema = new mongoose.Schema(
    {
        name_first: {type: String, required: true, max: 255},
        name_last: {type: String, required: true, max: 255},
        email: {type: String, required: true
            /*supposed to be "unique", but unique is not a Mongoose validator: https://mongoosejs.com/docs/validation.html#the-unique-option-is-not-a-validator 
              can use https://www.npmjs.com/package/mongoose-unique-validator instead */},
        company: {type: String/*, required: true*/},
        role: {type: String, enum: ["Employee", "Manager", "Stakeholder"/*not guaranteed to remain*/], default: "Employee"},
        password: {type: String, required: true, min: 8, max: 255
            /*match:RegExp corresponding to "1 uppercase, 1 lowercase, 1 special, 1 number"? (out of scope)*/},
        projects: [ { type: mongoose.Schema.Types.ObjectId, ref: "project" } ],
        tasks: [ { type: mongoose.Schema.Types.ObjectId, ref: "task" } ],
        //time_registered_total: []?    // what is the usage of this?
    }
)

module.exports = mongoose.model("user", userSchema);