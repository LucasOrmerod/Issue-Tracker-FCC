const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let putId;

suite('Functional Tests', function() {

  suite("POST to /api/issues/{project}", function() {

    test("Create an issue with every field", function(done) {
      chai.request(server)
        .post("/api/issues/apitest")
        .send({
          issue_title: "Hello World",
          issue_text: "Lorem ipsum dolor sit amet",
          created_by: "Create an issue with every field",
          assigned_to: "Lorem ipsum dolor sit amet",
          status_text: "Lorem ipsum dolor sit amet"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Hello World");
          assert.equal(res.body.issue_text, "Lorem ipsum dolor sit amet");
          assert.equal(res.body.created_by, "Create an issue with every field");
          assert.equal(res.body.assigned_to, "Lorem ipsum dolor sit amet");
          assert.equal(res.body.status_text, "Lorem ipsum dolor sit amet");
          assert.equal(res.body.project, "apitest");
          putId = res.body._id;
          console.log("The id variable is equal to: " + putId);
          done();
        });
    });

    test("Create an issue with required fields", function(done) {
      chai.request(server)
        .post("/api/issues/apitest")
        .send({
          issue_title: "Hello World Again",
          issue_text: "Lorem ipsum dolor sit amet",
          created_by: "Create an issue with every field",
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Hello World Again");
          assert.equal(res.body.issue_text, "Lorem ipsum dolor sit amet");
          assert.equal(res.body.created_by, "Create an issue with every field");
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "");
          assert.equal(res.body.project, "apitest");
          done();
        });
    });

    test("Create an issue without required fields", function(done) {
      chai.request(server)
        .post("/api/issues/apitest")
        .send({
          issue_title: "Hello World Again",
          issue_text: "Lorem ipsum dolor sit amet"
        })
        .end(function(err, res) {
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });

  });

  suite("PUT to /api/issues/{project}", function() {

    test("Update one field on an issue", function(done) {
      chai.request(server)
        .put("/api/issues/apitest")
        .send({
          issue_title: "Hello World",
          _id: putId
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, putId);
          done();
        });
    });

    test("Update multiple fields on an issue", function(done) {
      chai.request(server)
        .put("/api/issues/apitest")
        .send({
          issue_title: "Hello World",
          issue_text: "Hello World",
          _id: putId
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, putId);
          done();
        });
    });

    test("Update an issue with missing _id", function(done) {
      chai.request(server)
        .put("/api/issues/apitest")
        .send({
          issue_title: "Hello World"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });

    test("Update an issue with no fields to update", function(done) {
      chai.request(server)
        .put("/api/issues/apitest")
        .send({
          _id: putId
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "no update field(s) sent");
          assert.equal(res.body._id, putId);
          done();
        });
    });

    test("Update an issue with an invalid _id", function(done) {
      chai.request(server)
        .put("/api/issues/apitest")
        .send({
          _id: "INVALID",
          issue_text: "Hello World"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not update");
          assert.equal(res.body._id, "INVALID");
          done();
        });
    });

  });

  suite("GET to /api/issues/{project}", function() {

    test("View issues on a project", function(done) {
      chai.request(server)
        .get("/api/issues/apitest")
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.typeOf(res.body, "array");
          done();
        });
    });

    test("View issues on a project with one filter", function(done) {
      chai.request(server)
        .get("/api/issues/apitest?open=true")
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.typeOf(res.body, "array");
          done();
        });
    });

    test("View issues on a project with multiple filters", function(done) {
      chai.request(server)
        .get("/api/issues/apitest?open=true&title=Loremipsum")
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.typeOf(res.body, "array");
          done();
        });
    });

  });

  suite("DELETE to /api/issues/{project}", function() {

    test("Delete an issue", function(done) {
      chai.request(server)
        .delete("/api/issues/apitest")
        .send({
          _id: putId
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully deleted");
          assert.equal(res.body._id, putId);
          done();
        });
    });

    test("Delete an issue with an invalid _id", function(done) {
      chai.request(server)
        .delete("/api/issues/apitest")
        .send({
          _id: "INVALID"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not delete");
          assert.equal(res.body._id, "INVALID");
          done();
        });
    });

    test("Delete an issue with a missing _id", function(done) {
      chai.request(server)
        .delete("/api/issues/apitest")
        .send({})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });

    // https://forum.freecodecamp.org/t/personal-library-functional-tests-blocking-fcc-tests/583400/3
    after(function() {
      chai.request(server).get("/api");
    });
  });

});
