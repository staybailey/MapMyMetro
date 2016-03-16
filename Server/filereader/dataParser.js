var csv = require('csv');
var fs = require('fs');
var path = require('path');
var db = require('../DB');
var models = require('../Models');
var xml2js = require('xml2js');

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
      var stopTable = {};
      for (var i = 0; i < tables.stops.length; i++) {
        stopTable[tables.stops[i][0]] = {lat: tables.stops[i][4], lon: tables.stops[i][5]};
      }
      var inputData = simpleroutes();
      insertSimpleroutes(inputData);
      insertShapes(inputData, stopTable);
      //buildNodes(/*inputData*/);
    }
  }); 
};


var simpleroutesParams = ['id', 'name', 'description', 'peak_frequency', 'daytime_frequency', 
  'offhours_frequency', 'service_start', 'service_end', 'shape_id_0', 'shape_id_1', 'subway'];

var shapesParams = ['shape_id', 'shape_pt_lat', 'shape_pt_lon', 'shape_pt_sequence', 
  'shape_dist_traveled', 'point_type'];

var nodesParams = ['id', 'point_type', 'lat', 'lon'];

var edgesParams = ['start_node', 'end_node', 'weight'];

var nodes_routes_joinParams = ['node', 'route'];

var insertSimpleroutes = function (inputData) {
  var query = insert('simpleroutes', simpleroutesParams, inputData);
  console.log(query);
  db(query, function () {
    console.log('simpleroutes entered DB succesfully');   
  })
}

insertShapes = function (inputData, stopTable) {
  var arr = [];
  var shape_ids = [];
  var stopsList = [];
  for (var key in inputData) {
    shape_ids.push(inputData[key].shape_id_0);
    stopsList.push(inputData[key].stop_seq_0);
    shape_ids.push(inputData[key].shape_id_1);
    stopsList.push(inputData[key].stop_seq_1);
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
  var query = insert('shapes', shapesParams, arr);
  db(query, function () {
    console.log('shapes entered DB succesfully');
    var stops = {};
    for (var routeID in inputData) {
      var route = inputData[routeID];
      for (var i = 0; i < route.stops_0.length; i++) {
        // edge needed to nearest map node
        console.log(route.stop_times_0[i]);
        var startStopTime = route.stop_times_0[i];
        if (!stops[route.stops_0[i]]) {
          // lat lon location, routes for route stop join table, and edges for edges.
          stops[route.stops_0[i]] = {id: route.stops_0[i], 
                                     lat: stopTable[route.stops_0[i]].lat, 
                                     lon: stopTable[route.stops_0[i]].lon,
                                     point_type: 'stop', 
                                     routes: {}, 
                                     edges: {}};
        }
        stops[route.stops_0[i]].routes[routeID] = true;      
        for (var j = i + 1; j < route.stops_0.length; j++) {
          var rph = 60 / route.daytime_frequency; // routesPerHour
          var timeDif = route.stop_times_0[j] - startStopTime;
          if (stops[route.stops_0[i]]['edges'][route.stops_0[j]]) {
            var oldrph = stops[route.stops_0[i]]['edges'][route.stops_0[j]].rph;
            var oldtime = stops[route.stops_0[i]]['edges'][route.stops_0[j]].time;
            stops[route.stops_0[i]]['edges'][route.stops_0[j]].rph += rph;
            stops[route.stops_0[i]]['edges'][route.stops_0[j]].time = 
              (oldtime * oldrph + timeDif * rph) / (oldrph + rph);
          } else {
            stops[route.stops_0[i]]['edges'][route.stops_0[j]] = {rph: rph, time: timeDif};
          }
        }
      }
    }
    for (var routeID in inputData) {
      var route = inputData[routeID];
      for (var i = 0; i < route.stops_1.length; i++) {
        // edge needed to nearest map node
        console.log(route.stop_times_1[i]);
        var startStopTime = route.stop_times_1[i];
        if (!stops[route.stops_1[i]]) {
          // lat lon location, routes for route stop join table, and edges for edges.
          stops[route.stops_1[i]] = {id: route.stops_1[i], 
                                     lat: stopTable[route.stops_1[i]].lat, 
                                     lon: stopTable[route.stops_1[i]].lon,
                                     point_type: 'stop', 
                                     routes: {}, 
                                     edges: {}};
        }
        stops[route.stops_1[i]].routes[routeID] = true;      
        for (var j = i + 1; j < route.stops_1.length; j++) {
          var rph = 60 / route.daytime_frequency; // routesPerHour
          var timeDif = route.stop_times_1[j] - startStopTime;
          if (stops[route.stops_1[i]]['edges'][route.stops_1[j]]) {
            var oldrph = stops[route.stops_1[i]]['edges'][route.stops_1[j]].rph;
            var oldtime = stops[route.stops_1[i]]['edges'][route.stops_1[j]].time;
            stops[route.stops_1[i]]['edges'][route.stops_1[j]].rph += rph;
            stops[route.stops_1[i]]['edges'][route.stops_1[j]].time = 
              (oldtime * oldrph + timeDif * rph) / (oldrph + rph);
          } else {
            stops[route.stops_1[i]]['edges'][route.stops_1[j]] = {rph: rph, time: timeDif};
          }
        }
      }
    }
    query = insert('nodes', nodesParams, stops);
    console.log(query);
    db(query, function () {
      console.log('stops entered db succesfully');   
      var stop_route_join_array = [];
      for (var stop in stops) {
        for (var rt in stops[stop].routes) {
          stop_route_join_array.push({route: rt, node: stop});
        }
      }
      query = insert('nodes_routes_join', nodes_routes_joinParams, stop_route_join_array);
      db(query, function () {
        console.log('nodes_routes_join data entered db');
        var edges = [];
          for (var stop in stops) {
            for (var edge in stops[stop].edges) {
              edges.push({start_node: stop, end_node: edge, 
                weight: (3600 / stops[stop].edges[edge].rph) + stops[stop].edges[edge].time});
            }
          }
          query = insert('edges', edgesParams, edges);
          db(query, function () {
            console.log('inserted edges');
          });
      })
    })

    /*
    var stopsArr = [null];
    var stopsToDBArray = {};
    var count = 1;
    for (var stop in stops) {
      stopsArr[count] = stops[stop];
      stopsArr[count].dbEdges = {};
      stopsToDBArray[stop] = count;
      count++;
    }

    for (var i = 1; i < stopsArr.length; i++) {
      for (var key in stopsArr[i].edges) {
        stopsArr[i].edges
      }
    }
    */
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

// Returns an array of four item tuples of form [route_id, trip_id, stop_time, stop_id, stop_seq, shape_id, trip_direction]
var makeRouteTripDepartureStopArray = function (routes, trips, stop_times, direction) {
  var output = [];
  for (var i = 0; i < routes.length; i++) {
    for (var j = 0; j < trips.length; j++) {
      // trip is going in the 1 direction (arbitrary choice) and trip is a trip of route
      if (routes[i][0] === trips[j][0] && (trips[j][5] === direction)) {
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
  var stopTimes = [];
  for (var i = 0; i < RTDS.length; i++) {
    if (route !== RTDS[i][0]) {
      if (best !== null) {
        output[route] = {
          frequency: best,
          shape_id: twelveStop[5],
          stops: stops,
          stopsSeq: stopsSeq,
          stopTimes: stopTimes
        }
        //output.push([route, cleanFrequency(best), twelveStop[5], stops, stopsSeq]);
      }
      route = RTDS[i][0];
      best = null;
      twelveStop = false;
      stops = [];
      stopsSeq = [];
      stopTimes = [];
    } else if (!twelveStop && RTDS[i][2] >= time('12:00:00') && RTDS[i][2] < time('13:40:00')) {
      twelveStop = RTDS[i];
      count = i;
      while (RTDS[count][1] === twelveStop[1]) {
        count--;
      }
      count++;
      while (RTDS[count][1] === twelveStop[1]) {
        stops.push(RTDS[count][3]);
        stopTimes.push(RTDS[count][2]);
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

// returns an array of simpleroute data.
var simpleroutes = function () {
  var weekdayServiceIds = weekday(tables.calendar);
  console.log('got weekday:' /*weekdayServiceIds*/);
  var trips = weekdayTrips(tables.trips, weekdayServiceIds);
  console.log('gotweekdayTrips:', trips.length /*trips*/);
  var RTDS1 = makeRouteTripDepartureStopArray(tables.routes, trips, tables.stop_times, '1');
  console.log('gotRTDS1:', RTDS1.length, ' should ~=', trips.length * 20 /*RTDS1*/);
  var RTDS0 = makeRouteTripDepartureStopArray(tables.routes, trips, tables.stop_times, '0');
  console.log('gotRTDS0:', RTDS0.length, ' should ~=', trips.length * 20 /*RTDS0*/);
  var dayRoutes1 = findDayFrequency(RTDS1);
  var dayRoutes0 = findDayFrequency(RTDS0);
  console.log('gotDayRotues:', dayRoutes1.length, dayRoutes0.length);
  var names = getNames(tables.routes);
  var serviceSpans = getServiceSpan(RTDS1);
  console.log('gotServiceSpans');
  var output = {}; // Insert will ignore this value meaning first value in DB === output[1]
  for (var route in dayRoutes1) {
    if (dayRoutes0[route]) {
      var frequency = cleanFrequency((dayRoutes0[route].frequency + dayRoutes1[route].frequency) / 2);
      output[route] = {
        id: route,
        daytime_frequency: frequency,
        peak_frequency: frequency,
        offhours_frequency: frequency,
        shape_id_1: dayRoutes1[route].shape_id,
        shape_id_0: dayRoutes0[route].shape_id,
        subway: (100479 === route), // Link is a hardcoded subway
        stops_1: dayRoutes1[route].stops,
        stops_0: dayRoutes0[route].stops,
        stop_seq_1: dayRoutes1[route].stopsSeq,
        stop_seq_0: dayRoutes0[route].stopsSeq,
        stop_times_1: dayRoutes1[route].stopTimes,
        stop_times_0: dayRoutes0[route].stopTimes,
        name: names[route][0],
        description: names[route][1],
        service_start: serviceSpans[route][0],
        service_end: serviceSpans[route][1]
      };
    }
    //console.log(dayRoutes1.shape_id);
    //console.log(dayRoutes0.shape_id);
  }
  return output;
};

var getXML = function () {
  var parser = new xml2js.Parser()
  var p = path.join(__dirname, '/testmap.xml');
  fs.readFile(p, function (err, data) {
    parser.parseString(data, function (err, data) {
      var output = [];
      var points = {};
      for (var key in data) {     
        var ways = data[key]['way'];
        var way;
        for (way in ways) {
          if (Array.isArray(ways[way]['tag'])) {
            for (var i = 0; i < ways[way]['tag'].length; i++) {
              if (ways[way]['tag'][i]['$']['k'] === 'highway') {
                var v = ways[way]['tag'][i]['$']['v'];
                if (v === 'trunk' || v === 'primary' || v === 'secondary' || v === 'tertiary' || v === 'unclassified' || v === 'residential') {
                  if (Array.isArray(ways[way]['nd'])) {
                    for (var j = 0; j < ways[way]['nd'].length; j++) {
                      var point = ways[way]['nd'][j]['$']['ref'];
                      if (points[point]) {
                        points[point]++;
                      } else {
                        points[point] = 1;
                      }
                    }
                  }
                }
              }
            }
          }
        }
        for (way in ways) {
          if (Array.isArray(ways[way]['tag'])) {
            for (var i = 0; i < ways[way]['tag'].length; i++) {
              if (ways[way]['tag'][i]['$']['k'] === 'highway') {
                var v = ways[way]['tag'][i]['$']['v'];
                if (v === 'trunk' || v === 'primary' || v === 'secondary' || v === 'tertiary' || v === 'unclassified' || v === 'residential') {
                  if (Array.isArray(ways[way]['nd'])) {
                    var prev = null;
                    for (var j = 0; j < ways[way]['nd'].length; j++) {
                      var point = ways[way]['nd'][j]['$']['ref'];
                      if (typeof points[point] === 'number' && points[point] > 1) {
                        points[point] = {edges: {}, point_type: 'intersection'};
                      }
                      if (typeof points[point] === 'object') {
                        if (prev) {
                          points[point]['edges'][prev] = true;
                        }
                        prev = point;
                      } else {
                        delete points[point];
                      }
                    }
                  }
                }
              }
            }
          }      
        }
        for (var i = 0; i < data[key]['node'].length; i++) {
          if (points[data[key]['node'][i]['$']['id']]) {
            points[data[key]['node'][i]['$']['id']].lat = data[key]['node'][i]['$']['lat'];
            points[data[key]['node'][i]['$']['id']].lon = data[key]['node'][i]['$']['lon'];
          }
        }
        var pointsArr = [];
        var pointsArrMap = {};
        var count = 0;
        for (var point in points) {
          pointsArr[count] = points[point];
          pointsArrMap[point] = count;
          count++;
        }
        var query = insert('nodes', nodesParams, pointsArr);
        db(query, function () {
          console.log('inserted nodes');
          var edges = [];
          for (var i = 0; i < pointsArr.length; i++) {
            for (var edge in pointsArr[i].edges) {
              edges.push({start_node: i + 1, end_node: pointsArrMap[edge] + 1, weight: 5});
              edges.push({start_node: pointsArrMap[edge] + 1, end_node: i + 1, weight: 5});
            }
          }
          query = insert('edges', edgesParams, edges);
          db(query, function () {
            console.log('inserted edges');
          });
        });
      }
    });
  });
}

var buildNodes = function (inputData) {
  getXML();
}

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