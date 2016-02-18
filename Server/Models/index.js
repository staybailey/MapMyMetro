var db = require('../DB');

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
  var vals = []
  for (var i = 0; i < params.length; i++) {
    vals.push(data[params[i]]);
  }
  return 'INSERT INTO ' + table + ' (' + listParams(params) + ') VALUES (' + listValues(vals) + ')';
}

var del = function (table, identifiers) {
  var str = 'DELETE FROM ' + table + ' WHERE "' + identifiers[0][0] + '" = "' + identifiers[0][1] + '"'
  for (var i = 1; i < identifiers.length; i++) {
    str += ' AND WHERE "' + identifiers[i][0] + '" = "' + identifiers[i][1] + '"';
  }
} 

var simpleroutesParams = ['route_id', 'route_short_name', 'trip_headsign', 
            'peak_frequency', 'daytime_frequency', 'offhours_frequency', 'service_start', 'service_end'];

var shapesParams = ['shape_id', 'shape_pt_lat', 'shape_pt_lon', 'shape_pt_sequence', 'shape_dist_traveled'];

module.exports = {

  routes: {
    get: function (req, res) {
      var query = "SELECT * FROM simpleroutes";
      db(query, function (results) {
        var output = {results: results};
        output = JSON.stringify(output);
        res.end(output);
      });
    },

    post: function (data, res) {
      var query = insert('simpleroutes', simpleroutesParams, data);
      db(query, function () {
        // Nothing doing
        res.end('');
      });
      var stop = {}
      for (var i = 0; i < data.stops.length; i++) { // need error check
        stop['shape_pt_lat'] = data.stops[i]['lat'];
        stop['shape_pt_lon'] = data.stops[i]['lon'];
        stop['shape_pt_sequence'] = i;
        stop['shape_dist_traveled'] = -1 // N/A
        stop['shape_id'] = 7777; // dummy value
        query = insert('shapes', shapesParams, data);
      }
      
    },

    // MAKE SURE DATA IS FORMATED CORRECTLY
    delete: function (data, res) {
      var query = del('simpleroutes', data);
      db(query, function () {
        // Nothing doing
        res.end('');
      })
    },

    // put:
  },

  subway: {
    get: function (req, res) {
      
    },

    post: function (data) {

    },

    delete: function (data) {

    },

    // put:
  },

  // SHOULD HANDLE BUSWAYS??????
  bus: {
    get: function (req, res) {
      
    },

    post: function (data, res) {

    },

    delete: function (data, res) {

    },
    // put:
  }
};