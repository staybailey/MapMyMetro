angular.module('cransit.routes', [])
.controller('Routes', function ($scope, routes) {
  $scope.data = {};
  $scope.data.routes = routes
})