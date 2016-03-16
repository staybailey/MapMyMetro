angular.module('cransit.services', [])
.factory('Routes', function ($http) {
  var addOne = function (route) {
    return $http({
      method: 'POST',
      url: '/api/routes',
      data: route // MAY NEED DEFAULTS HERE
    });
  };

  var getAll = function () {
    return $http({
      method: 'GET',
      url: '/api/routes' // NOTE THAT IT IS API AND CHANGE IN SERVER IF NECESSARY
    })
    .then(function (resp) {
      return resp.data.results;
    });
  };

  var getShape = function (shape_id) {
    return $http({
      method: 'PUT',
      url: '/api/shapes',
      data: shape_id
    })
    .then(function (resp) {
      return resp.data;
    })
  };

  return {
    getAll: getAll,
    addOne: addOne,
    getShape: getShape
  };
})
.factory('Roads', function ($http) {
  var getRoads = function () {
    return $http({
      method: 'GET',
      url: '/api/roads',
    })
    .then(function (resp) {
      return resp.data;
    })
  }
  return {
    getRoads: getRoads
  }
})
