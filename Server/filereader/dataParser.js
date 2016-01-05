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


