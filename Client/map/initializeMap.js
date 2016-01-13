angular.module('cransit.map', [])
.controller('Map', function ($scope) { 
  var route = function (name) {
    var output = {};
    var direction = false;
    output.name = name;
    var makeStop = function (marker, prev, next) {
      console.log(prev, "AND", next)
      var nextSegment;
      var prevSegment;
      if (prev) {
        prevSegment = addSegment(marker, prev);
        marker.prev = prev;
        marker.prev.next = marker;
        marker.prevSegment = prevSegment; 
        if (next) {
          marker.prev.nextSegment.setMap(null);
        }
        marker.prev.nextSegment = prevSegment;
      }
      if (next) {
        nextSegment = addSegment(marker, next);
        marker.next = next;
        marker.next.prev = marker;
        marker.nextSegment = nextSegment;
        if (prev) {
          marker.next.prevSegment.setMap(null);
        }
        marker.next.prevSegment = nextSegment;
      }
      return marker;
    }
    output.addStop = function (marker) {
      if ($scope.stop && direction) {
        $scope.stop = makeStop(marker, $scope.stop.prev, $scope.stop);
      } else if ($scope.stop) {
        $scope.stop = makeStop(marker, $scope.stop, $scope.stop.next);        
      } else {
        $scope.stop = makeStop(marker);
      }     
    };
    var addSegment = function (prev, next) {
      var segment = new google.maps.Polyline({
        path: [prev.position, next.position],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
      segment.setMap($scope.map);
      return segment;
    };
    output.deleteStop = function (stop) {
      if (stop.prev && stop.next) {
        stop.prev.next = stop.next;
        stop.next.prev = stop.prev;
        stop.prev.nextSegment.setMap(null);
        stop.next.prevSegment.setMap(null);
        var segment = addSegment(stop.prev, stop.next)
        stop.next.prevSegment = segment;
        stop.prev.nextSegment = segment;
      } else if (stop.next) {
        stop.next.prev = null;
        stop.next.prevSegment.setMap(null);
      } else if (stop.prev) {
        stop.prev.next = null;
        stop.prev.nextSegment.setMap(null);
      }
      stop.setMap(null);
    };   // Finish/confirm it works
    return output;
  };
  $scope.map;
  $scope.route;
  $scope.stop = null; 
  var initialize = function () {
    var mapCanvas = document.getElementById('map');
    var mapOptions = {
  	  center: new google.maps.LatLng(47.6097, -122.3331), // Seattle
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    $scope.map = new google.maps.Map(mapCanvas, mapOptions);
    // Effectively everything below here is for building a new route (plus $scope.start and $scope.end above)
    $scope.route = route();
    $scope.map.addListener('click', function (event) {
    	var metroIcon = {
    	  url: '../assets/metroIcon.png',
    	  scaledSize: new google.maps.Size(30, 35)
    	}
      var marker = new google.maps.Marker({
    	  position: event.latLng,
    	  map: $scope.map,
    	  title: "Station",
    	  icon: metroIcon
      });
      marker.addListener('dblclick', function (event) {
        $scope.stop = $scope.stop.prev || $scope.stop.next;
        $scope.route.deleteStop(marker); // same as marker
      });
      marker.addListener('click', function (event) {
        $scope.stop = marker;
      });
      $scope.route.addStop(marker);
    });
  };

  initialize();
});

/*
var initialize = function () {
  var mapCanvas = document.getElementById('map');
  var mapOptions = {
  	center: new google.maps.LatLng(44.5403, -78.5463),
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(mapCanvas, mapOptions);
};
google.maps.event.addDomListener(window, 'load', initialize)
*/