(function () {
  'use strict';

  angular
    .module('geofoto')
    .controller('photoEditorController', photoEditorController);

    photoEditorController.$inject = ['$routeParams', '$location', 'photo', 'photofactory'];

    function photoEditorController($routeParams, $location, photo, photofactory) {
      var vm = this;
      var id = $routeParams.id;
      
      photofactory.showOnePhoto(id)
        .then(function (data) {
          // photofactory.showImage(id)
          //   .then(function(d) {
          //     vm.image.binaryData = 'data:image/jpg;base64,' + d[0];
          //   });
          vm.image = data[0];
          vm.image.binaryData = 'data:image/jpg;base64,' + photo;
          vm.image.title = data[0].title || data[0].filename;
        })
        .catch(function(data) {
          console.error(data);
        });

        vm.updateTitle = function() {
          var update = {};
          update.title = vm.image.newtitle;
          if (update.length !== 0) {
            photofactory.update(vm.image.filename, update)
              .then(function(data) {
                if (data === 200) {
                  vm.image.title = update.title;
                }
              })
          }
        }

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
        }
    }
})();
