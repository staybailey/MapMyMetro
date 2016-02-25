angular.module('cransit.routes', [])
.controller('Routes', function ($scope, routes, Routes) {
  $scope.data = {};
  $scope.data.routes = routes;
})