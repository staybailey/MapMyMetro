var latLonToString = function (lat, lon) {
	return '' + lat + ',' + lon;
}

/* 
info = {route -> next}

if P is a stop.
  Continue forward with all routes noting initial stop, current route and time.
  When storing a point in the map note the initial stop and the time it took to 
  reach that point from that stop

*/




// Graph each graph node is named by it's lat/lon combo value
// It's value is an object of edges (defined by lat/lon combo value) and a type (stop or intersection)
var mapGraph = function () {
  var output = {};
  var storage = {};
  output.addNode = function (lat, lon, info) {
  	var latLonStr = latLonToString(lat, lon);
    if (!storage[latLonStr]) {
      storage[latLonStr] = {edges: {}};
      if (info) {
      	storage[latLonStr].info = info;
      }
    }
  }
  output.addEdge = function (lat1, lon1, lat2, lon2, value) {
  	var latLonStr1 = latLonToString(lat1, lon1);
  	var latLonStr2 = latLonToString(lat2, lon2);
  	if (storage[latLonStr1] && storage[latLonStr2]) {
  	  storage[latLonStr1].edges[latLonStr2] = value;
  	}
  }
  output.changeInfo = function (lat, lon, info) {
  	var latLonStr = latLonToString(lat, lon);
    if (storage[latLonStr]) {
  	  storage[latLonStr].info = info;
  	}
  }
  output.getTravelTimes = function (lat, lon) {
    var time = 60;
    var map = {};
    var threads = [];
    var helper = function (latLonStr, time, route) {
      var current = storage[latLonStr];
      if (!current.info && (!map[latLonStr])) { // not a bus stop
        for (var edge in current.edges) {
          helper(edge, current.edges[edge]);
        }
      }
    }
  }
}