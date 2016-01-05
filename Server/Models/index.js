var db = require('../DB');

var listParams = function (array) {
  var str = '"' + array[0] + '"';  
  for (var i = 1; i < array.length; i++) {
    str += ', "' + array[i] + '"';
  }
  return str;
}

var insert = function (table, params, data) {
  var vals = []
  for (var i = 0; i < params.length; i++) {
    output.push(data[params[i]]);
  }
  return 'INTERT INTO ' + table + ' (' + listParams(params) + ') VALUES (' + listParams(vals) + ')';
}

var del = function (table, identifiers) {
  var str = 'DELETE FROM ' + table + ' WHERE "' + identifiers[0][0] + '" = "' + identifiers[0][1] + '"'
  for (var i = 1; i < identifiers.length; i++) {
    str += ' AND WHERE "' + identifiers[i][0] + '" = "' + identifiers[i][1] + '"';
  }
} 

var simpleroutesParams = ['route_id', 'route_short_name', 'trip_headsign', 
            'peak_frequency', 'daytime_frequency', 'offhours_frequency', 'service_start', 'service_end']

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