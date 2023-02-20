const mongoose = require("mongoose");

let userSchema = new mongoose.Schema(
    // This is how much I could think is required for a user, based on nothing (no design):
    // {
    // username: String
    // password?: String }

    {
        username: {type: String, required: true, min: 6, max: 255},
        email: {type: String, required: true},
        password: {type: String, required: true, min: 8, max: 255},
        creationDate: {type: Date, default: Date.now}
    }
)

module.exports = mongoose.model("user", userSchema);