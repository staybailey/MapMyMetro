angular.module('cransit', [
  'cransit.routes',
  'cransit.addroute',
  'cransit.services',
  'ui.router']) {

})
.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/routes");

  $stateProvider
  .state('list', {
    templateUrl: 'app/ui-routes/list.html'
  })
  .state('list.routes', {
    url: '/routes',
    templateUrl: 'app/ui-routes/list.routes.html',
    controller: 'Routes',
    resolve: {
      routes: function (Routes) {
        return Routes.getAll();
      }
    }
  })
  .state('list.addRoute', {
    url: '/addroute',
    templateUrl: 'app/ui-routes/list.addRoute.html',
    controller: 'AddRoute'
  });
})
// Add run stuff
.run(function ($scope) { 

});

