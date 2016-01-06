var express = require('express');
var db = require('./DB');

var parser = require('body-parser');

var router = require('./router.js');

var staticData = require('./filereader/dataParser.js');

// INITIIALIZE DATABASE WITH TRANSIT DATA
// Parse txt files
staticData.getStaticData();

// console.log(parsedCSVs);

// Convert static files into simpleroutes format
// var staticSimpleRoutes = staticData.simpleroutes(parsedCSVs);

// insert each simple route, insert into the database
/*
for (var key in staticSimpleRoutes) {
  var query = insert('simpleroutes', simpleroutesParams, staticSimpleRoutes[key]);
  db(query, function () {
    // Data inserted
  });
}
*/

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