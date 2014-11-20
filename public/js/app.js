'use strict';
var app = angular.module('geofoto', ['ngRoute', 'geofoto.controller', 'geofoto.service']);

app.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
  $httpProvider.interceptors.push('httpRequestInterceptor');

  /* standard AngularJS route configuration
  note that the 404 errors are handled by an HTTP interceptor
  */
  
  $routeProvider
      .when('/', {
          templateUrl: 'partials/main'
      })
      .when('/map', {
        templateUrl: 'partials/map',
        controller: 'MapController'
      }).
      when('/mapsearch', {
        templateUrl: '/partials/mapsearch',
        controller: 'MapSearchController'
      }).
      when('/explorer', {
        templateUrl: 'partials/explorer'
      }).
      when('/import', {
        templateUrl: 'partials/importfiles'
      }).
      when('/edit/:id', {
        templateUrl: 'partials/edit',
        controller: 'PhotoController'
      }).
      when('/404', {
        templateUrl: 'partials/404'
      })
      .otherwise({redirectTo: '/'});
}]);
