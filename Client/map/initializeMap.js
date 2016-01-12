angular.module('cransit.map', [])
.controller('Map', function ($scope) { 
  var route = function (name) {
    var stops = [];
    var output = {};
    output.name = name;
    var makeStop = function (marker, index) {
      return {
        marker: marker, 
        prev: stops[index - 1], 
        next: stops[index + 1], 
        segment: addSegment(marker, index === 0 ? marker : stops[index - 1].marker)}
    }
    output.addStop = function (marker) {
      var index;
      var stop;
      if ($scope.marker) {
        index = 0;
        while (index < stops.length && stops[index].marker !== $scope.marker) {
          index++;
        }
        stops.splice(index + 1, 0, null);
        stop = makeStop(marker, index + 1)
        stops[index].next = stop;
        stops[index + 1] = stop;
        stops[index + 2].prev = stop;
        stops[index + 2].segment.setMap(null);
        stops[index + 2].segment = addSegment(stops[index + 2].marker, stop.marker);
      } else {
        index = stops.length;
        stop = makeStop(marker, index)
        stops[index] = stop;
        if (index > 0) {
          stops[index - 1].next = stop;
        }
      }     
    };
    var addSegment = function (marker1, marker2) {
      var segment = new google.maps.Polyline({
        path: [marker1.position, marker2.position],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
      segment.setMap($scope.map);
      return segment;
    };
    var deleteSegments = function (stop) {
      stop.segment.setMap(null);
      if (stop.next) {
        stop.next.segment.setMap(null);
      }
    }
    output.deleteStop = function (marker) {
      var index = 0;
      while (index < stops.length && stops[index].marker !== marker) {
        index++;
      }
      stops[index].marker.setMap(null);
      deleteSegments(stops[index]);
      stops.splice(index, 1);
      if (stops[index]) {
        stops[index ].segment = addSegment(stops[index].marker, stops[index - 1].marker);
        stops[index].prev = stops[index - 1];
        stops[index - 1].next = stops[index];
      }
      console.log($scope.marker);
    };   // Finish/confirm it works
    return output;
  };
  $scope.map;
  $scope.route;
  $scope.marker = false; 
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
        $scope.route.deleteStop(marker);
        $scope.marker !== marker && $scope.marker;
      });
      marker.addListener('click', function (event) {
        $scope.marker = !$scope.marker && marker;
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