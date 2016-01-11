
angular.module('cransit.map', [])
.controller('Map', function ($scope) {
  $scope.route = function () {
    var stops = [];
    var segments = [null]; // ugly, but first stop does not have segment
    var addStop = function (marker) {
      stops.push(marker);
      stops.addSegment(stops.length - 1, Math.max(stops.length - 2, 0));
    }
    var addSegment = function (stop1, stop2) {
      var segment = new google.maps.Polyline({
        path: [stops[stop1].position, stops[stop2].position],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      })
      segments[stop1] = segment;
      segment.setMap($scope.map);
      }
    }
    // Finish/confirm it works
  }
  $scope.start = null
  $scope.end = null
  $scope.map; 
  var initialize = function () {
    var mapCanvas = document.getElementById('map');
    var mapOptions = {
  	  center: new google.maps.LatLng(47.6097, -122.3331), // Seattle
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    $scope.map = new google.maps.Map(mapCanvas, mapOptions);
    // Effectively everything below here is for building a new route (plus $scope.start and $scope.end above)
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
        addStop(marker);
        extendLine();
    })
  };

  var addStop = function (marker) {
  	var node = {value: marker, next: null, prev: null};
  	if ($scope.start) {
      $scope.end.next = node;
      node.prev = $scope.end;
      $scope.end = node;
  	} else {
      $scope.start = node;
  	  $scope.end = node;
  	}
  };

  var extendLine = function () {
    var segment = new google.maps.Polyline({
    	path: [$scope.end.prev.value.position, $scope.end.value.position],
    	geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    })
    segment.setMap($scope.map);
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