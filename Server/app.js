var express = require('express');
var db = require('./db');

var parser = require('body-parser');

var router = require('./router.js');

var staticData = require('/filereader/dataParser.js');

var app = express();
module.exports.app = app;

app.set("port", 3000);

app.use(parser.json());

app.use("/api", router);

app.use(express.static(__dirname + "/../client"));

if (!module.parent) {
  app.listen(app.get("port"));
  console.log("Listening on", app.get("port"));
}