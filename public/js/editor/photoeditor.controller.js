(function () {
  'use strict';

  angular
    .module('geofoto')
    .controller('photoEditorController', photoEditorController);

    photoEditorController.$inject = ['$routeParams', '$location', 'photofactory'];

    function photoEditorController($routeParams, $location, photofactory) {
      var vm = this;
      var id = $routeParams.id;
      vm.editable;

      photofactory.showOnePhoto(id)
        .then(function (data) {
          photofactory.showImage(id)
            .then(function(d) {
              vm.image.binaryData = 'data:image/jpg;base64,' + d[0];
            });
            vm.image = data[0];
            vm.image.title = data[0].title || data[0].filename;
        })
        .catch(function(data) {
          console.error(data);
        });

        vm.update = function() {
          var update = {};
          if (vm.image.description) {
            update.description = vm.image.description
          }
          update.title = vm.image.newtitle;
          if (update.length !== 0) {
            photofactory.update(vm.image.filename, update)
              .then(function(data) {
                if (data === '200') {
                  vm.image.title = update.title;
                }
              })
          }
        }
    }
})();
