(function () {
  'use strict';

  angular
    .module('geofoto')
    .controller('photoEditorController', photoEditorController);

    photoEditorController.$inject = ['$routeParams', '$location', 'photofactory', 'photo', 'data'];

    function photoEditorController($routeParams, $location, photofactory, photo, data) {
      var vm = this;
      var id = $routeParams.id;
      vm.image = data[0].content;
      vm.image.binaryData = 'data:image/jpg;base64,' + photo;
      vm.image.title = data[0].content.title || data[0].content.filename;
      vm.image.description = data[0].content.description || 'No description yet.';

      vm.updateTitle = function() {
        var update = {};
        update.title = vm.image.title;
        if (update.length !== 0) {
          photofactory.update(vm.image.filename, update)
            .then(function(data) {
              if (data === 200) {
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
            if (data === '200') {
              vm.image.title = update.title;
            }
          })
        }
      };
    }
})();
