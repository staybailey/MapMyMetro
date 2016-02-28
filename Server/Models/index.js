var db = require('../DB');


// Formats values for an entry from an array to a SQL valid string of column names
var listParams = function (array) {
  var str = array[0];  
  for (var i = 1; i < array.length; i++) {
    str += ', ' + array[i];
  }
  return str;
};

// Formats values for an entry from an array to a SQL valid string
var listValues = function (collection, params) {
  var str = '';
  if (Array.isArray(collection)) {
    str += '"' + collection[0] + '"';  
    for (var i = 1; i < collection.length; i++) {
      str += ', "' + collection[i] + '"';
    }
  } else {
    for (var i = 0; i < params.length; i++) {
      if (str.length !== 0) {
        str += ', ';
      }
      str += '"' + collection[params[i]] + '"';
    }
  }
  return str;
};

// Function takes a table name, the table's column names and a single entry's worth of data
// and writes a query for inserting it into the database.
var insertOne = function (table, params, data) {
  var vals = []
  for (var i = 0; i < params.length; i++) {
    vals.push(data[params[i]]);
  }
  return 'INSERT INTO ' + table + ' (' + listParams(params) + ') VALUES (' + listValues(vals, params) + ')';
};

// Function takes a table name, the table's column names and a collection of data
// and writes a query for inserting them into the database.
var insert = function (table, params, data) {
  var str = '';
  if (Array.isArray(data)) {
    for (var i = 0; i < data.length; i++) {
      if (str.length !== 0) {
        str += ', ';
      }
      str += '(' + listValues(data[i], params) + ')';
    }
  } else {
    for (var key in data) {
      if (str.length !== 0) {
        str += ', ';
      }
      str += '(' + listValues(data[key], params) + ')';
    }
  }
  return 'INSERT INTO ' + table + ' (' + listParams(params) + ') VALUES ' + str;
};
/*
var update = function (table, param, value, indentifier, data) {
  var str = '';
  if (Array.isArray(data)) {
    for (var i = 0; i < data.length; i++) {
      if (str.length !== 0) {
        str += ', ';
      }
      str += data[i];
    }
  } else {
    for (var key in data) {
      if (str.length !== 0) {
        str += ', ';
      }
      str += data[key];
    }
  }
  return 'UPDATE ' + table + ' SET ' + param + ' = ' + value + ' WHERE ' + indentifier + ' IN (' + str + ')';
}


var del = function (table, identifiers) {
  var str = 'DELETE FROM ' + table + ' WHERE "' + identifiers[0][0] + '" = "' + identifiers[0][1] + '"'
  for (var i = 1; i < identifiers.length; i++) {
    str += ' AND WHERE "' + identifiers[i][0] + '" = "' + identifiers[i][1] + '"';
  }
}; 
*/
var simpleroutesParams = ['name', 'description', 'peak_frequency', 'daytime_frequency', 
'offhours_frequency', 'service_start', 'service_end', 'shape_id_0', 'shape_id_1', 'subway'];

var shapesParams = ['shape_id', 'shape_pt_lat', 'shape_pt_lon', 'shape_pt_sequence', 'shape_dist_traveled', 'point_type'];

var cleanShape = function (shape, shape_id) {
  var stops = []
  for (var i = 0; i < shape.length; i++) {
    var stop = {};
    stop['shape_pt_lat'] = shape[i]['shape_pt_lat'];
    stop['shape_pt_lon'] = shape[i]['shape_pt_lon'];
    stop['point_type'] = shape[i]['point_type'];
    stop['shape_pt_sequence'] = i;
    stop['shape_dist_traveled'] = -1; // N/A
    stop['shape_id'] = shape_id;          
    stops.push(stop);
  }
  return stops;
}

module.exports = {

  insert: insert,
  insertOne: insertOne,

  routes: {
    // Gets all the basic route info. Does not get the shape array.
    get: function (req, res) {
      var query = 'SELECT * FROM simpleroutes';
      db(query, function (results) {
        var output = {results: results};
        output = JSON.stringify(output);
        res.end(output);
      });
    },

    // posts a new route to DB with basic data in simple routes and the shape into shapes table
    // Client side shape only has lat, lon and type so other values added by cleanShape
    post: function (data, res) {
      var query = insertOne('simpleroutes', simpleroutesParams, data);
      db(query, function () {
        query = insert('shapes', shapesParams, cleanShape(data.shape, data.shape_id_0));
        db(query, function () {
          query = insert('shapes', shapesParams, cleanShape(data.shape.reverse(), data.shape_id_1));
          db(query, function () {
            res.end('');
          })
        });
      });
    },

    put: function (data, res) {
      var query = 'with clean as (DELETE from shapes where shape_id = ' + data.shape_id + ') ';
      query += insert('shapes', shapesParams, cleanShape(data.shape, data.shape_id));
      db(query, function () {
        res.end('');
      })
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

  shapes: {
    get: function (req, res) {
      var query = 'SELECT * from shapes where shape_id = ' + req.body;
      db(query, function (results) {
        res.json(results);
      })
    },

    post: function (data, res) {
      
    },
 
    // currently doing get request
    put: function (data, res) {
      var query = 'SELECT * from shapes where shape_id = ' + data.shape_id;
      db(query, function (results) {
        res.json(results);
      });
    },

    delete: function (data) {

    },
  },

  // SHOULD HANDLE BUSWAYS??????
  /*
  bus: {
    get: function (req, res) {
      
    },

    post: function (data, res) {

    },

    delete: function (data, res) {

    },
    // put:
  }
  */
};