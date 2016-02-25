var csv = require('csv');
var fs = require('fs');
var path = require('path');
var db = require('../DB');
var models = require('../Models');

var insert = models.insert;
var insertOne = models.insertOne;

var tables = {
  agency: 'agency',
  routes: 'routes',
  shapes: 'shapes',
  stops: 'stops',
  stop_times: 'stop_times',
  trips: 'trips',
  calendar: 'calendar'
};

var indexOf = function (val, arr) {
  for (var i = 0; i < arr.length; i++) {
    if (val === arr[i]) {
      return i;
    }
  }
  return -1;
}

var getStaticData = function () {
  filesToArray('agency', ['routes', 'shapes', 'stops', 'stop_times', 'trips', 'calendar']);
};

var filesToArray = function (key, next) {
  var p;
  var data;
  p = path.join(__dirname, '/google_daily_transit/' + key + '.txt');
  data = fs.readFileSync(p, 'utf8');
  csv.parse(data, {delimiter: ','}, function (err, results) {
    tables[key] = results;
    console.log(key);
    if (next.length > 0) {
      filesToArray(next.pop(), next);
    } else {
      // Done getting parsing csvs
      console.log('done csving');
      var inputData = simpleroutes();
      insertSimpleroutes(inputData);
      insertShapes(inputData);
    }
  }); 
};


var simpleroutesParams = ['name', 'description', 
            'peak_frequency', 'daytime_frequency', 'offhours_frequency', 'service_start', 'service_end', 'shape_id', 'subway'];

var shapesParams = ['shape_id', 'shape_pt_lat', 'shape_pt_lon', 'shape_pt_sequence', 'shape_dist_traveled', 'point_type'];


var insertSimpleroutes = function (inputData) {
  var query = insert('simpleroutes', simpleroutesParams, inputData);
  console.log(query);
  db(query, function () {
      // inserted into DB
  })
}

insertShapes = function (inputData) {
  var arr = [];
  var shape_ids = [];
  var stopsList = [];
  for (var key in inputData) {
    shape_ids.push(inputData[key].shape_id);
    stopsList.push(inputData[key].stopsSeq);
  }
  for (var i = 0; i < tables.shapes.length; i++) {
    var index = indexOf(tables.shapes[i][0], shape_ids);
    if (index !== -1) {
      if (indexOf(tables.shapes[i][3], stopsList[index]) !== -1) {
        tables.shapes[i].push('stop');        
      } else {
        tables.shapes[i].push('point');
      }
      arr.push(tables.shapes[i]);
    }
  }
  console.log(arr.length, arr[0]);
  var query = insert('shapes', shapesParams, arr);
  //console.log(query);
  db(query, function () {
    //inserted shapes into DB
  })
}

// takes a string of the format ab:cd:ef and returns the number abcdef
var time = function (time) {
  var arr = time.split(':');
  var output = Number(arr[0]) * 10000 + Number(arr[1]) * 100 + Number(arr[2]);
  return output;
};

// returns array of service ids that are for weekday service
var weekday = function (calendar) {
  var output = [];
  for (var i = 0; i < calendar.length; i++) {
    // if service runs Tuesday through Thursday it must be a form of typical service
    if (calendar[i][2] === '1' && calendar[i][3] === '1' && calendar[i][4] === '1') {
      output.push(calendar[i][0]);
    }
  }
  return output;
};

// returns an array of trips that are valid for the given serviceids
var weekdayTrips = function (trips, serviceIds) {
  var output = [];
  for (var i = 0; i < trips.length; i++) {
    for (var j = 0; j < serviceIds.length; j++) {
      // if service id of trip matches weekday serviceId
      if (trips[i][1] === serviceIds[j]) {
        output.push(trips[i]); 
      }
    }
  }
  return output;
};

// Assumes RTDS is sorted by R
// Returns an obj with route being index for its service_start, and service_end 
var getServiceSpan = function (RTDS) {
  var output = {};
  var bestStart = null;
  var bestEnd = null;
  var route = RTDS[0][0];
  for (var i = 0; i < RTDS.length; i++) {
    if (route !== RTDS[i][0]) {
      if (bestStart !== null) {
        output[route] = [bestStart, bestEnd];
      }
      bestStart = null;
      bestEnd = null;
      route = RTDS[i][0];
    } else if (bestStart === null) {
      bestStart = RTDS[i][2];
      bestEnd = RTDS[i][2];
    } else {
      bestStart = Math.min(bestStart, RTDS[i][2]);
      bestEnd = Math.max(bestEnd, RTDS[i][2]);
    }
  }
  return output
};

// returns obj with route_id being key and value being a tuple 
// tuple value 0 being the short name and value 1 being the description
var getNames = function (routes) {
  var output = {};
  for (var i = 0; i < routes.length; i++) {
    output[routes[i][0]] = [routes[i][2], routes[i][4]];
  }
  return output;
};

// Returns an array of four item tuples of form [route_id, trip_id, stop_time, stop_id]
var makeRouteTripDepartureStopArray = function (routes, trips, stop_times) {
  var output = [];
  for (var i = 0; i < routes.length; i++) {
    for (var j = 0; j < trips.length; j++) {
      // trip is going in the 1 direction (arbitrary choice) and trip is a trip of route
      if (routes[i][0] === trips[j][0] && (trips[j][5] === '1')) {
        for (var k = 0; k < stop_times.length; k++) {
          // trips_id matches stop_times trip
          if (trips[j][2] === stop_times[k][0]) {
            // Array of route_id, trip_id, departure_time and stop_id
            output.push([routes[i][0], trips[j][2], time(stop_times[k][2]), stop_times[k][3], stop_times[k][4], trips[j][7]]);
          }
        }
      }
    }
  }
  return output;
};

var cleanFrequency = function (estimate) {
  var minutes = Math.floor((estimate + 39) / 100); // 39 second "1 off buffer"
  return minutes;
};

// returns array of tuples with route_id, the frequency, the shape_id and stops array of
// tuple stop id and sequence
var findDayFrequency = function (RTDS) {
  var route = RTDS[0][0]
  var twelveStop = false;
  var best = null;
  var output = [];
  var current;
  var count;
  var stops = [];
  var stopsSeq = [];
  for (var i = 0; i < RTDS.length; i++) {
    if (route !== RTDS[i][0]) {
      if (best !== null) {
        output.push([route, cleanFrequency(best), twelveStop[5], stops, stopsSeq]);
      }
      route = RTDS[i][0];
      best = null;
      twelveStop = false;
      stops = [];
      stopsSeq = [];
    } else if (!twelveStop && RTDS[i][2] >= time('12:00:00') && RTDS[i][2] < time('13:40:00')) {
      twelveStop = RTDS[i];
      count = i;
      while (RTDS[count][1] === twelveStop[1]) {
        count--;
      }
      count++;
      while (RTDS[count][1] === twelveStop[1]) {
        stops.push(RTDS[count][3]);
        stopsSeq.push(RTDS[count][4]);
        count++;
      }
    } else if (twelveStop[3] === RTDS[i][3]) {
      current = Math.abs(RTDS[i][2] - twelveStop[2]);
      if (best === null) {
        best = current;
      } else if (current > 0) {
        best = Math.min(current, best);
      }
    }
  }
  return output;
};

var simpleroutes = function () {
  var weekdayServiceIds = weekday(tables.calendar);
  console.log('got weekday:' /*weekdayServiceIds*/);
  var trips = weekdayTrips(tables.trips, weekdayServiceIds);
  console.log('gotweekdayTrips:', trips.length /*trips*/);
  var RTDS = makeRouteTripDepartureStopArray(tables.routes, trips, tables.stop_times);
  console.log('gotRTDS:', RTDS.length, ' should ~=', trips.length * 20 /*RTDS*/);
  var dayRoutes = findDayFrequency(RTDS);
  console.log('gotDayRotues:', dayRoutes.length);
  var names = getNames(tables.routes);
  var serviceSpans = getServiceSpan(RTDS);
  console.log('gotServiceSpans');
  var output = {};
  for (var i = 0; i < dayRoutes.length; i++) {
    output[dayRoutes[i][0]] = {
      daytime_frequency: dayRoutes[i][1],
      peak_frequency: dayRoutes[i][1],
      offhours_frequency: dayRoutes[i][1],
      shape_id: dayRoutes[i][2],
      subway: (100479 === dayRoutes[i][0] ? true : false), // Link is a hardcoded subway
      stops: dayRoutes[i][3],
      stopsSeq: dayRoutes[i][4]
    }
  }
  for (var key in output) {
    output[key].name = names[key][0];
    output[key].description = names[key][1];
    output[key].service_start = serviceSpans[key][0];
    output[key].service_end = serviceSpans[key][1];
  }
  return output;
};

module.exports = {
  simpleroutes: simpleroutes,
  getStaticData: getStaticData
};

/* simpleroutes abstracts only the information that we actual need namely.
The name and description
The three types of frequency
The service start and end
A shape_id for the service
*/