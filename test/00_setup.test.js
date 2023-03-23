process.env.NODE_ENV="test";

const Product = require("../models/product.js");
//const Task = require("../models/task.js");
const User = require("../models/user.js");


before((done) => {
    Product.deleteMany( { /* filter: none */ }, (error) => { /* no error handling */ } );
    User.deleteMany( { /* filter: none */ }, (error) => { console.log(error); } );
    done();
});

after((done) => {
    Product.deleteMany( { /* filter: none */ }, (error) => { /* no error handling */ } );
    User.deleteMany( { /* filter: none */ }, (error) => { console.log(error); } );
    done();
});