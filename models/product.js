const mongoose = require("mongoose");

let productSchema = new mongoose.Schema(
    // a JSON Schema looks much like a JSON.
    // "required" is a built-in validator in Mongoose: https://mongoosejs.com/docs/validation.html#built-in-validators
    {
        name: {type: String},                            // NOTE: Mongoose seems to not require type to be in " ".
        description: {type: String, required: false},    // But default JSON Schemas seem to have {"type": "String" (or other) }.
        price: {type: Number},
        inStock: {type: Boolean}
    }
)

// Pre to the hook for Mongoose's "findOneAndUpdate" function.
// I.e. this function right before findOneAndUpdate() when that is called.
// Here: Overwrite any __v (document version) keys for existing documents and set the incremental for future "__v"s to +1.
productSchema.pre('findOneAndUpdate', function() {
    const update = this.getUpdate();
    if (update.__v != null) {
      delete update.__v;
    }
    const keys = ['$set', '$setOnInsert'];
    for (const key of keys) {
      if (update[key] != null && update[key].__v != null) {
        delete update[key].__v;
        if (Object.keys(update[key]).length === 0) {
          delete update[key];
        }
      }
    }
    update.$inc = update.$inc || {};
    update.$inc.__v = 1;
});

module.exports = mongoose.model("product", productSchema);
/**
 * https://mongoosejs.com/docs/models.html
 * "The first argument is the singular name of the collection your model is for.
 * Mongoose automatically looks for the plural, lowercased version of your model name."
 **/