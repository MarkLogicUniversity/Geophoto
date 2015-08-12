(function () {
  'use strict';

  angular
    .module('geophoto')
    .controller('photoEditorController', photoEditorController);

    photoEditorController.$inject = ['$cacheFactory', '$routeParams', '$location', 'photofactory', 'data'];

    function photoEditorController($cacheFactory, $routeParams, $location, photofactory, data) {
      var vm = this;
      var id = $routeParams.id;
      // cache
      var cache = $cacheFactory.get('$http');

      vm.image = data[0].content;
      vm.image.title = data[0].content.title || data[0].content.filename;
      vm.image.description = data[0].content.description || 'No description yet.';

      var country = data[0].content.location.country;

      var cache = $cacheFactory.get('$http');
      var semanticCache = cache.get('/api/semantic/info/' + country);
      if (country && !semanticCache) {
        photofactory.semanticData(country).then(function(data) {
          vm.semantic = data;
        });
      } else {
        if (country) {
          var data = JSON.parse(semanticCache[1]);
          vm.semantic = data;
        }
      }

      vm.updateTitle = function() {
        var update = {};
        update.title = vm.image.title;
        if (update.length !== 0) {
          photofactory.update(vm.image.filename, update)
            .then(function(data) {
              if (data === 200) {
                var cache = $cacheFactory.get('$http');
                cache.remove('/api');
                cache.remove('/api/image/' + vm.image.filename);
                vm.image.title = update.title;
              }
            });
        }
      };

      vm.updateDescription = function() {
        var update = {};
        if (vm.image.description) {
          update.description = vm.image.description
        }
        if (update.length !== 0) {
          photofactory.update(vm.image.filename, update)
          .then(function(data) {
            if (data === 200) {
              var cache = $cacheFactory.get('$http');
              cache.remove('/api');
              cache.remove('/api/image/' + vm.image.filename);
              vm.image.description = update.description;
            }
          })
        }
      };
    }
})();
