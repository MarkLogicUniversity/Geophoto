(function() {
  'use strict';
  angular
    .module('geofoto')
    .factory('photofactory', photofactory);

    photofactory.$inject = ['$http'];

    function photofactory($http) {
      return {
        showAllPhotos: showAllPhotos,
        showOnePhoto: showOnePhoto,
        showImage: showImage,
        update: update,
        geoSearch: geoSearch
      };

      function showAllPhotos() {
        return $http
          .get('/api')
          .then(complete)
          .catch(failed);
      }

      function showOnePhoto(id) {
        return $http
          .get('/api/image/' + id)
          .then(complete)
          .catch(failed);
      }

      function showImage(id) {
        return $http
          .get('/api/imagedata/' + id)
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

      function complete(response) {
        return response.data
      }

      function failed(error) {
        console.error(error.statusText);
      }
    }

})();
