var csv = require('csv');
var fs = require('fs');
var underscore = require('underscore');
var path = require('path');

var tables = {
  agency: 'agency',
  routes: 'routes',
  shapes: 'shapes',
  stops: 'stops',
  stop_times: 'stop_times',
  trips: 'trips',
  calendar: 'calendar'
};


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
      simpleroutes();
    }
  }); 
};



// takes a string of the format ab:cd:ef and returns the number abcdef
var time = function (time) {
  var arr = time.split(':');
  var output = Number(arr[0]) * 10000 + Number(arr[1]) * 100 + Number(arr[2]);
  return output;
};

// returns array of service ids that are for weekday service
// WORKING
var weekday = function (calendar) {
  var output = [];
  for (var i = 0; i < calendar.length; i++) {
    // if service runs Monday through Thursday
    if (calendar[i][1] === '1' && calendar[i][2] === '1' && calendar[i][3] === '1' && calendar[i][4] === '1') {
      output.push(calendar[i][0]);
    }
  }
  return output;
};

// returns an array of trips that are valid for the given serviceids
// WORKING SEEMINGLY
var weekdayTrips = function (trips, serviceIds) {
  var output = [];
  for (var i = 0; i < trips.length; i++) {
    for (var j = 0; j < serviceIds.length; j++) {
      // if service id of trip matches weekday serviceId
      if (trips[i][1] === serviceIds[j]) {
        output.push(trips[i]);
        if (serviceIds[j] !== '77443') {
          console.log(serviceIds[j]);
        } 
      }
    }
  }
  return output;
};

// Assumes RTDS is sorted by R
// Returns an obj with route being index for its service_start, and service_end 
// WORKING
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

// WORKING
var getNames = function (routes) {
  var output = {};
  for (var i = 0; i < routes.length; i++) {
    output[routes[i][0]] = [routes[i][2], routes[i][4]];
  }
  return output;
};

// Seemingly Works
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
            output.push([routes[i][0], trips[j][2], time(stop_times[k][2]), stop_times[k][3]])
          }
        }
      }
    }
  }
  for(var test = 0; test < output.length; test += 1000) {
    console.log(output[test]);
  }
  return output;
};

var cleanFrequency = function (estimate) {
  var minutes = Math.floor((estimate + 39) / 100); // 39 second "1 off buffer"
  return minutes;
};

var findDayFrequency = function (RTDS) {
  var route = RTDS[0][0]
  var twelveStop = false;
  var best = null;
  var output = [];
  for (var i = 0; i < RTDS.length; i++) {
    if (route !== RTDS[i][0]) {
      if (best !== null) {
        output.push([route, cleanFrequency(best)]);
      }
      route = RTDS[i][0];
      best = null;
      twelveStop = false;
    } else if (!twelveStop && RTDS[i][2] >= time('12:00:00')) {
      twelveStop = RTDS[i];
    } else if (twelveStop[3] === RTDS[i][3]) {
      var current = RTDS[i][2] - twelveStop[2];
      if (best === null) {
        best = current;
      } else if (RTDS[i][2] - twelveStop > 0) {
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
  console.log('gotweekdayTrips:' /*trips*/);
  var RTDS = makeRouteTripDepartureStopArray(tables.routes, trips, tables.stop_times);
  console.log('gotRTDS:' /*RTDS*/);
  var dayRoutes = findDayFrequency(RTDS);
  console.log('gotDayRotues:'/*dayRoutes*/);
  var names = getNames(tables.routes);
  var serviceSpans = getServiceSpan(RTDS);
  console.log('gotServiceSpans');
  var output = {};
  for (var i = 0; i < dayRoutes.length; i++) {
    output[dayRoutes[i][0]] = [dayRoutes[i][0], null, null, dayRoutes[i][1], dayRoutes[i][1], dayRoutes[i][1], null, null];
  }
  for (var key in output) {
    output[key][1] = names[key][0];
    output[key][2] = names[key][1];
    output[key][6] = serviceSpans[key][0];
    output[key][7] = serviceSpans[key][1];
  }
  console.log('simpleroutes: ', output);
  return output;
};

module.exports = {
  simpleroutes: simpleroutes,
  getStaticData: getStaticData
};
