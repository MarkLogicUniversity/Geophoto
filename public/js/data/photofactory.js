(function() {
  'use strict';
  angular
    .module('geophoto')
    .factory('photofactory', photofactory);

    photofactory.$inject = ['$http'];

    function photofactory($http) {
      return {
        showAllPhotos: showAllPhotos,
        showOnePhoto: showOnePhoto,
        update: update,
        geoSearch: geoSearch,
        textSearch: textSearch,
        semanticData: semanticData
      };

      function showAllPhotos() {
        return $http
          .get('/api', {cache: true})
          .then(complete)
          .catch(failed);
      }

      function showOnePhoto(id) {
        return $http
          .get('/api/image/' + id, {cache: true})
          .then(complete)
          .catch(failed);
      }

      function update(id, update) {
        var update = JSON.stringify(update);
        return $http
          .post('/api/image/update/' + id + '/' + update)
          .then(complete)
          .catch(failed);
      }

      function geoSearch(object) {
        return $http
          .get('/api/image/search/' + object.radius + '/' + object.lat + '/' + object.lng)
          .then(complete)
          .catch(failed);
      }

      function textSearch(term) {
        return $http
          .get('/api/image/search/' + term)
          .then(complete)
          .catch(failed);
      }

      function semanticData(country) {
        return $http
          .get('/api/semantic/info/' + country, {cache: true})
          .then(complete)
          .catch(failed);
      }

      function complete(response) {
        return response.data
      }

      function failed(error) {
        console.error(error.statusText);
      }
    }

})();
