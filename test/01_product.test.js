
const chai = require("chai");
const expect = chai.expect;
const should = chai.should();   // reminder: assertion styles and BDD vs TDD: https://www.chaijs.com/guide/styles/#differences
const chaiHttp = require("chai-http");
const server = require("../server.js");

chai.use(chaiHttp);



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

    it("should allow an Authenticated User to POST a new product successfully", (done) => {
        // ~~big function warning

        // 1) make request to register a new user (no DB clutter as we drop it before a test suite)
        const newUser = {
            username: "Mr Burns",
            email: "burns@springfield.com",
            password: "12345678"
        }

        chai.request(server)
            .post("/api/user/register")
            .send(newUser)
            .end( (error, response) => {
                // expect registration to go fine:
                expect(response.status, "User was NOT registered fine, error: " + response.status ).to.be.equal(200);
                expect(response.body).to.be.a("object");
                expect(response.body.error).to.be.equal(null);  // ~~the most powerful line (prints the error), trumped by status

                const newUserLogIn = {
                    //username: newUser.username,
                    email: newUser.email,
                    password: newUser.password
                }


                // 2) Log in for token:
                chai.request(server)
                    .post("/api/user/login")
                    .send(newUserLogIn)
                    .end( (error, response) => {
                        // expect login to go fine:
                        expect(response.status).to.be.equal(200);
                        expect(response.body.error).to.be.equal(null);
                        // AND save token:
                        const token = response.body.data.token;


                        // 3) Auth'd user - Create new product:

                        let newProduct = {
                            name: "Test Product",
                            description: "Test Description",
                            price: 1200,
                            inStock: false
                        }

                        chai.request(server)
                            .post("/api/products")
                            .set( {"auth-token": token } )
                            .send(newProduct)
                            .end( (error, response) => {
                                expect(response.status).to.be.equal(201);
                                // since we POST products with insertMany and de facto allow posting multiple at once, result is an array:
                                expect(response.body).to.be.a('array');
                                // but here we are testing with 1 new product:
                                expect(response.body.length).to.be.eql(1);

                                // sanity check that the saved/returned product is the same one we sent:
                                const savedProduct = response.body[0];
                                expect(savedProduct.name).to.be.equal(newProduct.name);
                                expect(savedProduct.description).to.be.equal(newProduct.description);
                                expect(savedProduct.price).to.be.equal(newProduct.price);
                                expect(savedProduct.inStock).to.be.equal(newProduct.inStock);


                                // can continue with: deleting the product at the end

                                done();
                            });
                    });
            });
    });

    it("should NOT allow invalid input to register user and proceed", (done) => {

        let user = {
            username: "Peter Petersen",
            email: "mail@petersen.com",
            password: "123" //Faulty password - Joi/validation should catch this...
        }
        chai.request(server)
            .post('/api/user/register')
            .send(user)
            .end((err, res) => {
                                
                // Asserts
                //expect(res.status).to.be.equal(400); //normal expect with no custom output message
                expect(res.status, "Status is not 400 (NOT FOUND)").to.be.equal(400); //custom output message at fail
                
                expect(res.body).to.be.a('object');
                expect(res.body.error).to.be.equal("\"password\" length must be at least 8 characters long");  
                done();              
            });
    });
});