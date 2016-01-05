angular.module('cransit.addroute', [])
.controller('AddRoute', function ($scope, Routes) {
  $scope.route = {};
  $scope.count = 700
  $scope.addRoute = function () {
    $scope.route['route_id'] = 1; // FIX LATER
    $scope.route['route_short_name'] = $scope.name || $scope.count++;
    $scope.route['trip_headsign'] = $scope.description || '';
    $scope.route['peak_frequency'] = $scope.peak_frequency || $scope.daytime_frequency;
    $scope.route['daytime_frequency'] = $scope.daytime_frequency;
    $scope.route['offhours_frequency'] = $scope.offhours_frequency || $scope.daytime_frequency;
    $scope.route['service_start'] = $scope.service_start || '6';
    $scope.route['service_end'] = $scope.service_end || '24';
    // NEED TO BE ABLE TO ADD STOPS AND POSSIBLY STREET INFO
    Routes.addOne($scope.route);
  }
})