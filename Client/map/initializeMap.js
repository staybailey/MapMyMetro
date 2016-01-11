
angular.module('cransit.map', [])
.controller('Map', function ($scope) {
  $scope.stops = [];
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
    	  //size: new google.maps.Size(30, 30),
    	 // origin: new google.maps.Point(0, 0),
    	 // anchor: new google.maps.Point(0, 30),
    	  url: '../assets/metroIcon.png',
    	  scaledSize: new google.maps.Size(30, 30)
    	}
        var marker = new google.maps.Marker({
    	  position: event.latLng,
    	  map: $scope.map,
    	  title: "Station",
    	  icon: metroIcon
        });
        console.log(marker.position);
    })
  };
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