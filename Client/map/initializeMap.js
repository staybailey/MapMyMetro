
angular.module('cransit.map', [])
.controller('Map', function ($scope) {
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
  }
  var extendLine = function () {
    var segment = new google.maps.Polyline({
    	path: [$scope.end.prev.value.position, $scope.end.value.position],
    	geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    })
    segment.setMap($scope.map);
  }
  var setStops = function () {
  	var marker = new google.maps.Marker({
  	  position: new google.maps.LatLng(47.6500, 122.3400),
  	  map: $scope.map
  	});
  };
  initialize();
  setStops();

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