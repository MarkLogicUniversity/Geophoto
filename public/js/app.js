(function() {
  'use strict';
  angular
    .module('geofoto', [
      'ngRoute'
    ])
    .config(config);

    function config($routeProvider, $httpProvider) {
      $httpProvider.interceptors.push('httpRequestInterceptor');
      /* standard AngularJS route configuration
      note that the 404 errors are handled by an HTTP interceptor
      */
      $routeProvider
        .when('/', {
            templateUrl: '/partials/main'
        })
        .when('/map', {
          templateUrl: '/partials/map',
          controller: 'MapController',
          controllerAs: 'vm'
        }).
        when('/geosearch', {
          templateUrl: '/partials/geosearch',
          controller: 'geoSearchController',
          controllerAs: 'vm'
        }).
        when('/textsearch', {
          templateUrl: '/partials/textsearch',
          controller: 'textSearchController',
          controllerAs: 'vm'
        }).
        when('/explorer', {
          templateUrl: '/partials/explorer'
        }).
        when('/import', {
          templateUrl: '/partials/importfiles'
        }).
        when('/edit/:id', {
          templateUrl: '/partials/edit',
          controller: 'photoEditorController',
          controllerAs: 'vm'
        }).
        when('/404', {
          templateUrl: 'partials/404'
        })
        .otherwise({
          redirectTo: '/'
        });
      }
})();
