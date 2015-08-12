(function() {
  'use strict';
  angular
    .module('geophoto', [
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
          controllerAs: 'vm',
          //resolve the photo route - only display this partial when image has loaded
          resolve: {
            data: function($cacheFactory, $route, photofactory) {
              var id = $route.current.params.id;
              var cache = $cacheFactory.get('$http');
              var dataCache = cache.get('/api/image/' + id);
              if (!dataCache) {
                var data = photofactory.showOnePhoto(id);
                return data;
              } else {
                return JSON.parse(dataCache[1]);
              }

            }
          }
        }).
        when('/404', {
          templateUrl: '/partials/404'
        })
        .otherwise({
          redirectTo: '/'
        });
      }
})();
