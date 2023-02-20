const mongoose = require("mongoose");

//const Schema = mongoose.Schema;   // cmd alias

let productSchema = new mongoose.Schema(
    
    // product definition via properties

    // tutorial product (tangible that one buys from an e-shop):

    // { name: String
    //   description: String, optional
    //   price: Number
    //   inStock: Boolean }

    // a JSON Schema looks much like a JSON.
    // "required" is a built-in validator in Mongoose: https://mongoosejs.com/docs/validation.html#built-in-validators
    {
        name: {type: String},                            // NOTE: Mongoose seems to not require type to be in " ".
        description: {type: String, required: false},    // But default JSON Schemas seem to have {"type": "String" (or other) }.
        price: {type: Number},
        inStock: {type: Boolean}
    }


    // TODO: Add the provided pre() hook code for __v versioning!

    // TODO: define my own "product" type to practice on scheming/creating for this assignment.
    // (Twitch streams? or random videos? or just images?)
    // TODO: write a Schema for it!
)

module.exports = mongoose.model("product", productSchema);
/**
 * https://mongoosejs.com/docs/models.html
 * "The first argument is the singular name of the collection your model is for.
 * Mongoose automatically looks for the plural, lowercased version of your model name.
 * Thus, for the example above," the model 'product' SHOULD BE for the 'products' collection in the database,
 * IF I understand correctly.
 **/