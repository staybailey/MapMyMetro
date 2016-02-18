angular.module('cransit', [
  'cransit.routes',
  'cransit.addroute',
  'cransit.map',
  'cransit.services',
  'ui.router']) 
.directive('navbar', function () {
  return {
    restrict: 'E',
    templateUrl: 'templates/navbar.html'
  };
})
.directive('addroute', function () { 
  return {
    restrict: 'E',
    templateUrl: 'templates/addRoute.html'
  };
})
/*
.directive('mymap', function () {
  return {
    restrict: 'E',
    template: '<div></div>',
    replace: true,
    link: function (scope, element, attrs) {

    }
  };
})
*/
.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/routes");

  $stateProvider
  .state('list', {
    templateUrl: 'ui-routes/list.html'
  })
  .state('list.routes', {
    url: '/routes',
    templateUrl: 'ui-routes/list.routes.html',
    controller: 'Routes',
    resolve: {
      routes: function (Routes) {
        return Routes.getAll();
      }
    }
  })
  .state('list.addRoute', {
    url: '/addroute',
    templateUrl: 'ui-routes/list.addRoute.html',
    controller: 'AddRoute'
  })
  .state('map', {
    url: '/map',
    templateUrl: 'ui-routes/map.html',
    controller: 'Map'
  });
})
// Add run stuff
.run(function () { 

});

