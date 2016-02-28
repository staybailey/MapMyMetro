angular.module('cransit.map', [])
.controller('Map', function ($scope, Routes, routes) {

  /* route class 
  A route class instatiation is defined by routeObj properties
  and methods/properties for manipulating the routeObj
  */

  var Route = function (routeObj) {
    var output = {};
    output.selected = true;
    output.routeData = routeObj || {
      name: '',
      description: '',
      peak_frequency: null,
      daytime_frequency: null,
      offhours_frequency: null,
      service_start: null,
      service_end: null,
      shape: [],
      shape_id_0: Math.floor(Math.random() * 50000000) + 50000000,
      shape_id_1: Math.floor(Math.random() * 50000000) + 50000000,
      subway: true // Only subway routes can be edited
    };
    // The currently selected point in the route used to determine how the next point should be connected
    var selectedStop = null;
    var direction = false;
    // reverses the direction in which points get added to the route
    output.reverse = function () {
      direction = !direction;
    }
    // maps a point adding it to the route, with a particular icon if passed in 
    // lat can also be treated as a latLng object if lng is falsey
    var makeMarker = function (lat, lng, icon) {
      var position = lng ? new google.maps.LatLng(lat, lng) : lat;
      icon = icon || {
          url: '../assets/metroIcon.png',
          scaledSize: new google.maps.Size(0, 0)
        };
      var marker = new google.maps.Marker({
        position: position,
        map: $scope.map,
        title: "Station",
        icon: icon,
        draggable: true
      })
      return marker
    }
    // maps a stop point, adding it to the route.
    output.mapStop = function (lat, lng) {
      console.log('mapStop');
      var metroIcon = {
        url: '../assets/metroIcon.png',
        scaledSize: new google.maps.Size(30, 35)
      }
      return newPoint(makeMarker(lat, lng, metroIcon), 'stop');
    }

    output.mapPoint = function (lat, lng) {
      return newPoint(makeMarker(lat, lng), 'point');
    }
    var newPoint = function (marker, type) {
      marker.addListener('dblclick', function (event) {
          if (this.direction) {
            selectedStop = selectedStop.next || selectedStop.prev;
          } else {
            selectedStop = selectedStop.prev || selectedStop.next;
          }
          deleteStop(marker); // same as marker
      });
      marker.addListener('click', function (event) {
        selectedStop = marker;
        $scope.route = output;
      });
      marker.addListener('drag', function (event) {
        console.log(output.selected);
        console.log('Draging marker');
        updatePaths(marker)
      })
      marker.addListener('dragstart', function (event) {
        selectedStop = marker;
        $scope.route = output;
      });
      marker.point_type = type;
      addPoint(marker);
    };
    var makePoint = function (marker, prev, next) {
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
    var addPoint = function (marker) {
      if (selectedStop && direction) {
        selectedStop = makePoint(marker, selectedStop.prev, selectedStop);
      } else if (selectedStop) {
        selectedStop = makePoint(marker, selectedStop, selectedStop.next);        
      } else {
        selectedStop = makePoint(marker);
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
    var deleteStop = function (stop) {
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
    var updatePaths = function (stop) {
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
    output.setShape = function () {
      this.routeData.shape = getPositions();
      return this.routeData;
    }
    var getPositions = function () {
      var result = [];
      var stop = selectedStop;
      while (stop.prev) {
        stop = stop.prev;
      }
      while (stop) {
        console.log(stop);
        result.push({
          shape_pt_lat: stop.getPosition().lat(), 
          shape_pt_lon: stop.getPosition().lng(),
          point_type: stop.point_type });
        stop = stop.next;
      }
      return result;
    }; 
    if (output.routeData.shape) {  
      var shapeInit = output.routeData.shape;  
      for (var i = 0; i < output.routeData.shape.length; i++) {
        output.routeData.shape[i].point_type === 'stop' ? 
        output.mapStop(output.routeData.shape[i].shape_pt_lat, output.routeData.shape[i].shape_pt_lon) :
        output.mapPoint(output.routeData.shape[i].shape_pt_lat, output.routeData.shape[i].shape_pt_lon);
      }
    }  
    return output;
  };
  

  $scope.map;
  $scope.route = Route();
  $scope.routes = routes;
  
  $scope.displayRoute = function (route) {
    console.log(route);
    Routes.getShape({shape_id: route.shape_id_0})
    .then(function (shape) {
      route.shape = shape;
      $scope.route.selected = false;
      $scope.route = Route(route);
    })
    /*
    .then(function (result) {
      route.shape = result;
      $scope.route = Route(route);
    });
    */
  }
  
  $scope.saveRoute = function () {
    $scope.route.setShape();
    Routes.addOne($scope.route.routeData);
  }
  $scope.createRoute = function () {
    $scope.route.setShape();
    $scope.route = Route();
    routes.push($scope.routeData);
  }
  $scope.reverse = function () {
    $scope.route.reverse();
  }

  var initialize = function () {
    var mapCanvas = document.getElementById('map');
    var mapOptions = {
  	  center: new google.maps.LatLng(47.6097, -122.3331), // Seattle
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    $scope.map = new google.maps.Map(mapCanvas, mapOptions);
    $scope.map.addListener('click', function (event) {
    	return $scope.route.mapStop(event.latLng);
    });
  };

  initialize();
});

