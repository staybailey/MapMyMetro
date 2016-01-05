var csv = require('csv-parse');
var fs = require('fs');
var underscore = require('underscore');

var tables = {
  agency: 'agency',
  routes: 'routes',
  shapes: 'shapes',
  stops: 'stops',
  stop_times: 'stop_times',
  trips: 'trips',
  calendar: 'calendar'
}

var filesToArray = function () {
  var path;
  var data;
  for (var key in tables) {
    path = '/../google_daily_transit/' + key + '.txt';
    data = fs.readFileSync(path);
    tables[key] = csv(data); 
  }
}

// returns array of service ids that are for weekday service
var weekday = function (calendar) {
  var output = [];
  for (var i = 0; i < calendar.length; i++) {
    // if service runs Monday through Thursday
    if (calendar[i][1] && calendar[i][2] && calendar[i][3] && calendar[i][4]) {
      output.push(calendar[i][0]);
    }
  }
  return output;
}

// returns an array of trips that are valid for the given serviceids
var weekdayTrip = function (trips, serviceIds) {
  var output = [];
  for (var i = 0; i < trips.length; i++) {
    for (var j = 0; j < serviceIds.length; j++) {
      // if service id of trip matches weekday serviceId
      if (trips[i][1] === serviceIds[j];
        output.push(trips[i]);
      }
    }
  }
  return output;
}

// Assumes RTDS is sorted by R
// Returns an array w/ route, service_start, and service_end 
var getServiceSpan = function (RTDS) {
  var output = [];
  var bestStart = null;
  var bestEnd = null;
  route = RTDS[0][0];
  for (var i = 0; i < RTDS.length; i++) {
    if (route !== RTDS[i][0]) {
      if (bestStart !== null) {
        output.push([route, bsetStart, bestEnd]);
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
}

var makeRouteTripDepartureStopArray = function (routes, trips, stop_times, twoDirs) {
  var output = [];
  for (var i = 0; i < routes.length; i++) {
    for (var j = 0; j < trips.length; j++) {
      // trip is going in the 1 direction (arbitrary choice) and trip is a trip of route
      if (routes[i][0] === trips[j][0] && (trips[j][5] === 1 || twoDirs)) {
        for (var k = 0; k < stop_times.length; k++) {
          // trips_id matches stop_times trip
          if (trips[j][2] === stop_times[k][0]) {
            // Array of route_id, trip_id, departure_time and stop_id
            output.push([routes[i][0], trips[j][2], time(stop_times[k][2]), stop_times[3]])
          }
        }
      }
    }
  }
  return output;
}

var time = function (time) {
  var arr = time.split(':');
  var output = Number(arr[0]) * 10000 + Number(arr[1]) * 100 + Number(arr[2]);
  return output;
}

var cleanFrequency = function (estimate) {
  var minutes = Math.floor((estimate + 39) / 100); // 39 second "1 off buffer"
  return minutes;
}

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
}

var 

