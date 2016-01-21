angular.module('cransit.map', [])
.controller('Map', function ($scope, Routes) { 
  var route = function (name) {
    var output = {};
    output.name = name;
    output.selectedStop = null;
    output.daytime_frequency = 5;
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
    };
    output.addStop = function (marker) {
      if (output.selectedStop && $scope.direction) {
        output.selectedStop = makeStop(marker, output.selectedStop.prev, output.selectedStop);
      } else if (output.selectedStop) {
        output.selectedStop = makeStop(marker, output.selectedStop, output.selectedStop.next);        
      } else {
        output.selectedStop = makeStop(marker);
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
    output.updatePaths = function (stop) {
      if (stop.next) {
        var nextSegment = addSegment(stop, stop.next);
        stop.nextSegment.setMap(null);
        stop.next.prevSegment = nextSegment;
        stop.nextSegment = nextSegment;
      }
      if (stop.prev) {
        var prevSegment = addSegment(stop, stop.prev);
        stop.prevSegment.setMap(null);
        stop.prev.nextSegment = prevSegment;
        stop.prevSegment = prevSegment
      }
    }
    var getPositions = function () {
      var result = [];
      var stop = output.selectedStop;
      while (stop.prev) {
        stop = stop.prev;
      }
      while (stop) {
        console.log(stop);
        result.push({lat: stop.getPosition().lat(), lon: stop.getPosition().lng()});
        stop = stop.next;
      }
      return result;
    };
    output.getRouteData = function () {
      // DO STUFF TO GET ROUTE DATA
      result = {};
      result['route_id'] = 1; // FIX LATER
      result['route_short_name'] = output.name;
      result['trip_headsign'] = output.description || '';
      result['peak_frequency'] = output.peak_frequency || output.daytime_frequency;
      result['daytime_frequency'] = output.daytime_frequency;
      result['offhours_frequency'] = output.offhours_frequency || output.daytime_frequency;
      result['service_start'] = output.service_start || '6';
      result['service_end'] = output.service_end || '24';
      result['stops'] = getPositions();
      return result;
    }
    console.log(output.name);
    return output;
  };
  $scope.map;
  $scope.route;
  $scope.direction = false;
  $scope.saveRoute = function () {
    Routes.addOne($scope.route.getRouteData());
  }
  $scope.createRoute = function () {
    $scope.route = route('K line');
  }
  var initialize = function () {
    var mapCanvas = document.getElementById('map');
    var mapOptions = {
  	  center: new google.maps.LatLng(47.6097, -122.3331), // Seattle
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    $scope.map = new google.maps.Map(mapCanvas, mapOptions);
    // Effectively everything below here is for building a new route (plus $scope.start and $scope.end above)
    $scope.route = route('Y line');
    $scope.map.addListener('click', function (event) {
    	var metroIcon = {
    	  url: '../assets/metroIcon.png',
    	  scaledSize: new google.maps.Size(30, 35)
    	}
      var marker = new google.maps.Marker({
    	  position: event.latLng,
    	  map: $scope.map,
    	  title: "Station",
    	  icon: metroIcon,
        draggable: true
      });
      marker.addListener('dblclick', function (event) {
        if ($scope.route.direction) {
          $scope.route.selectedStop = $scope.route.selectedStop.next || $scope.route.selectedStop.prev;
        } else {
          $scope.route.selectedStop = $scope.route.selectedStop.prev || $scope.route.selectedStop.next;
        }
        $scope.route.deleteStop(marker); // same as marker
      });
      marker.addListener('click', function (event) {
        $scope.route.selectedStop = marker;
      });
      marker.addListener('drag', function (event) {
        $scope.route.updatePaths(marker)
      })
      marker.addListener('dragstart', function (event) {
        $scope.route.selectedStop = marker;
      });
      $scope.route.addStop(marker);
    });
  };

  initialize();
});

