const mongoose = require("mongoose");

let userSchema = new mongoose.Schema(
    {
        username: {type: String, required: true, min: 6, max: 255},
        email: {type: String, required: true},
        password: {type: String, required: true, min: 8, max: 255},
        creationDate: {type: Date, default: Date.now}
    }
)

module.exports = mongoose.model("user", userSchema);