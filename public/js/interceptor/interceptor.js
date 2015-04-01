(function() {
  'use strict';
  angular
    .module('geophoto')
    .factory('httpRequestInterceptor', httpRequestInterceptor);

    httpRequestInterceptor.$inject = ['$q', '$location'];

    function httpRequestInterceptor($q, $location) {
      return {
        response: response,
        responseError: responseError
      };

      function response(response) {
        return response;
      }

      function responseError(rejection) {
        if (rejection.status === 404) {
          $location.path('/404');
        }
        return $q.reject(rejection);
      }
    }
})();
