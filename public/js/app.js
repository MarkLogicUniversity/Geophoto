'use strict';
var app = angular.module('geofoto', ['ngRoute', 'geofoto.controller', 'geofoto.service']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/main'
        })
        .when('/map', {
          templateUrl: 'partials/map',
          controller: 'MapController'
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
        })
        .otherwise({redirectTo: '/'});
}]);