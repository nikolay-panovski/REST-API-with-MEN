const mongoose = require("mongoose");   // SyntaxError: Cannot use import statement outside a module
                                        // aka, I assume: cannot import the entirety of mongoose and simply call it mongoose
                                        

let taskSchema = new mongoose.Schema(
    // Note: Consider "validator" for advanced validation. https://github.com/validatorjs/validator.js#validators
    // But, it only compares strings, and is another extra package import.
    {
        // Assuming that a String/Number/Date can be added as explicitly "null" until further knowledge supplied.
        name: { type: String, required: true, maxLength: 255 },
        description: { type: String, required: false },
        state_visibility: { type: String, enum: ["Personal", "Unpublished", "Published"], default: "Personal" },
        state_completion: { type: String, enum: ["Incomplete", "Completed", "Cancelled"], default: "Incomplete" },
        //project: { type: mongoose.Schema.Types.ObjectId, ref: "projects" },   // careful - leave refs for later
        //assignee: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        created_at: { type: Date, default: Date.now() },
        finished_at: { type: Date, required: false/* remove when finalized */ /* good to have: validation for being After created_at*/ },
        //deadline: { type: Date | ObjectId ref with ref: project.deadline },
        time_estimated: { type: Number /* where Number = minutes; formatted separately */, default: 0 },
        time_registered: { type: Number /* see above */, default: 0 }
        //assigned_at: { type: Date, /* see finished_at*/ }
    }
);

/** WARNING! While the mongoose Schema validation governs client-side creation
  * (a new document cannot be PUT on the database without passing this validation),
  * on MongoDB we are free to insert ANY documents without that validation!
  * On GET the defaults and requireds (currently) produce a complete sensible document
  * according to this Schema, but those values do NOT exist in the database itself!
  * I.e., trying to query a task by state will NOT find any in a database that only has
  * documents with "name", even if they implicitly have a default (matching) state!
  */


module.exports = mongoose.model("task", taskSchema);