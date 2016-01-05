var express = require('express');
var db = require('/DB');
var models = require('/Models');

var parser = require('body-parser');

var router = require('./router.js');

var staticData = require('/filereader/dataParser.js');

var simpleroutesParams = ['route_id', 'route_short_name', 'trip_headsign', 
            'peak_frequency', 'daytime_frequency', 'offhours_frequency', 'service_start', 'service_end'];

// INITIIALIZE DATABASE WITH TRANSIT DATA
var parsedCSVs = staticData.getStaticData();

var staticSimpleRoutes = staticData.simpleroutes(parsedCSVs);

for (var key in staticSimpleRoutes) {
  var query = models.insert('simpleroutes', simpleroutesParams, staticSimpleRoutes[key]);
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