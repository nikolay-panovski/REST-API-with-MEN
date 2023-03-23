process.env.NODE_ENV="test";

const chai = require("chai");
const expect = chai.expect;
const should = chai.should();   // reminder: assertion styles and BDD vs TDD: https://www.chaijs.com/guide/styles/#differences
const chaiHttp = require("chai-http");
const server = require("../server.js");

chai.use(chaiHttp);

const Product = require("../models/product.js");
//const Task = require("../models/task.js");
const User = require("../models/user.js");


before((done) => {
    Product.deleteMany( { /* filter: none */ }, (error) => { /* no error handling */ } );
    done();
});

after((done) => {
    Product.deleteMany( { /* filter: none */ }, (error) => { /* no error handling */ } );
    done();
});



describe("/Product API test collection", () => {
    it("should return 0 products from a GET /api/products Request", (done) => {
        chai.request(server)
            .get("/api/products")
            .end( (error, response) => {
                response.should.have.status(200);
                expect(response.body).to.be.a("array");
                expect(response.body.length).to.be.equal(0);
                done();
            });
    });


});