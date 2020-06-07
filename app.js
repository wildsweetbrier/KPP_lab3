const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const port = process.env.PORT || 5050;
const ObjectId = mongodb.ObjectId;
const MongoClient = mongodb.MongoClient;

const mongoUrl = "mongodb://localhost:27017/tasks";
let mongo;
MongoClient.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(function (client) {
  mongo = client.db();
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

//==========EXPRESS ROUTES===========//
app.get("/", function (req, res) {
  res.redirect("/tasks");
});
app.get("/tasks", function (req, res) {
  mongo
    .collection("tasks")
    .find()
    .toArray()
    .then(function (tasks) {
      res.render("index", { tasks });
    });
});
app.get("/tasks/new", function (req, res) {
  res.render("new.ejs");
});
//submit btn route
app.post("/newtodo", function (req, res) {
  console.log("Submited");
  mongo
    .collection("tasks")
    .insertOne({ name: req.body.item, completed: false })
    .then(function () {
      res.redirect("/tasks");
    });
});
app.post("/tasks/:id/complete", (req, res) => {
  mongo
    .collection("tasks")
    .findOne({
      _id: ObjectId(req.params.id),
    })
    .then(function (task) {
      mongo
        .collection("tasks")
        .updateOne(
          {
            _id: ObjectId(req.params.id),
          },
          {
            $set: {
              completed: !task.completed,
            },
          }
        )
        .then(function () {
          res.redirect("/");
        });
    });
});

app.get("/tasks/:id/edit", function (req, res) {
  let id = req.params.id;
  return res.render("edit.ejs", { taskId: id });
});

app.post("/edittask/:id", function (req, res) {
  let taskId = req.params.id;
  let newTask = req.body.item;
  mongo
    .collection("tasks")
    .updateOne({ _id: new ObjectId(taskId) }, { $set: { name: newTask } })
    .then(function () {
      res.redirect("/");
    });
});
app.post("/tasks/:id", function (req, res) {
  mongo
    .collection("tasks")
    .deleteOne({ _id: ObjectId(req.params.id) })
    .then(function () {
      res.redirect("/");
    });
});
//catch all routes
app.get("*", function (req, res) {
  res.send("<h1>Ivalid Page</h1>");
});

//server listeining on port 5050

app.listen(port, () => {
  console.log("Server started on port 5050");
});
