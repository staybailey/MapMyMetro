angular.module('transitCrayons', [
  'Routes'
  'ui.router']) {

}.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
  $urlRouterProvider.otherwise("/routes");

  $stateProvider
  .state('/list.routes', {
    url: '/routes',
    templateUrl: 'app/ui-routes/routes.html',
    controller: 'Routes',
    /*
    resolve: {
      links: function (Links) {
        return Links.getAll();
      }
    */
  })
  .state('list.addRoute', {
    url: '/addRoute',
    templateUrl: 'app/ui-routes/addRoute.html',
    controller: 'addRoute'
  })