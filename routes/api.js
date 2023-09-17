'use strict';

const mongodb = require("mongodb");
const mongoose = require("mongoose");

const password = process.env["PASSWORD"];
const uri = "mongodb+srv://user:" + password + "@cluster1.52mcawa.mongodb.net/issue_tracker_database?retryWrites=true&w=majority";

module.exports = function(app) {

  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  const issueSchema = new mongoose.Schema({
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: String,
    status_text: String,
    open: { type: Boolean, required: true },
    created_on: { type: Date, required: true },
    updated_on: { type: Date, required: true },
    project: String
  });

  const Issue = mongoose.model('Issue', issueSchema);

  app.route('/api/issues/:project')

    .get(function(req, res) {
      let project = req.params.project;
      let filterObject = Object.assign(req.query);
      filterObject["project"] = project;
      Issue.find(filterObject)
        .then((foundIssue) => {
          return res.json(foundIssue);
        })
        .catch((err) => {
          console.log(err);
        });
    })

    .post(function(req, res) {

      let project = req.params.project;

      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
        return res.json({ error: "required field(s) missing" });
      };

      let newIssue = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        status_text: req.body.status_text || "",
        open: true,
        created_on: new Date().toUTCString(),
        updated_on: new Date().toUTCString(),
        project: project
      });

      newIssue.save()
        .then((savedIssue) => {
          return res.json(savedIssue);
        })
        .catch((err) => {
          console.log(err);
        });

    })

    .put(function(req, res) {
      let project = req.params.project;
      let newObj = {};

      // return error if there is no id
      if (!req.body._id) {
        return res.json({ error: "missing _id" });
      };
      console.log("There is an ID");

      // return error if there are no update fields
      if (!req.body.issue_title && !req.body.issue_text && !req.body.created_by && !req.body.assigned_to && !req.body.status_text && !req.body.open) {
        return res.json({ error: "no update field(s) sent", "_id": req.body._id });
      };
      console.log("There is at least 1 update field");

      Object.keys(req.body).forEach((key) => {
        if (req.body[key] != "") {
          newObj[key] = req.body[key];
        };
      });
      console.log("newObj has been created: ", newObj);

      newObj["updated_on"] = new Date().toUTCString();
      console.log("updated_on has been added to newObj");

      Issue.findByIdAndUpdate(newObj._id, newObj)
        .then((updatedObject) => {
          console.log("The issue has been updated: ", updatedObject)
          console.log(!updatedObject);
          if (!updatedObject) {
            return res.json({ error: "could not update", "_id": newObj._id });
          };
          return res.json({ result: "successfully updated", _id: newObj._id });
        })
        .catch((err) => {
          console.log(err);
          console.log("The object could not be updated")
          return res.json({ error: 'could not update', '_id': req.body._id });
        });

    })

    .delete(function(req, res) {
      let project = req.params.project;
      if (!req.body._id) {
        return res.json({ error: 'missing _id' });
      };

      Issue.findByIdAndRemove(req.body._id)
        .then((deletedIssue) => {
          console.log("This issue has been deleted: ", deletedIssue);
          console.log(!deletedIssue);
          if (!deletedIssue) {
            return res.json({ error: "could not delete", "_id": req.body._id });
          };
          return res.json({ result: 'successfully deleted', '_id': req.body._id });
        })
        .catch((err) => {
          return res.json({ error: 'could not delete', '_id': req.body._id });
        });
    });

};