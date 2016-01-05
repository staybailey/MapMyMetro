var express = require('express');
var db = require('/DB');
var models = require('/Models');

var parser = require('body-parser');

var router = require('./router.js');

var staticData = require('/filereader/dataParser.js');

// MOVE THESE FOR FUNCS INTO SERVICES LATER
var simpleroutesParams = ['route_id', 'route_short_name', 'trip_headsign', 
            'peak_frequency', 'daytime_frequency', 'offhours_frequency', 'service_start', 'service_end'];

var listParams = function (array) {
  var str = array[0];  
  for (var i = 1; i < array.length; i++) {
    str += ', ' + array[i];
  }
  return str;
}

var listValues = function (array) {
    var str = '"' + array[0] + '"';  
  for (var i = 1; i < array.length; i++) {
    str += ', "' + array[i] + '"';
  }
  return str;
};

var insert = function (table, params, data) {
  return 'INSERT INTO ' + table + ' (' + listParams(params) + ') VALUES (' + listValues(data) + ')';
}

// INITIIALIZE DATABASE WITH TRANSIT DATA
// Parse txt files
var parsedCSVs = staticData.getStaticData();

// Convert static files into simpleroutes format
var staticSimpleRoutes = staticData.simpleroutes(parsedCSVs);

// insert each simple route, insert into the database
for (var key in staticSimpleRoutes) {
  var query = insert('simpleroutes', simpleroutesParams, staticSimpleRoutes[key]);
  db(query, function () {
    // Data inserted
  });
}

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