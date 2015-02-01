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

      var loadCanvas = function(dataURL) {
        var canvas = document.getElementById('photo-canvas');
        var context = canvas.getContext('2d');
        var imageObj = new Image();
        imageObj.src = dataURL;
        var width = imageObj.width;
        var height = imageObj.height;

        canvas.width = width / 5;
        canvas.height = height / 5;

        imageObj.onload = function() {
          var inMemoryCanvas = document.createElement('canvas');
          inMemoryCanvas.width = width / 2;
          inMemoryCanvas.height = height / 2;
          var inMemoryContext = inMemoryCanvas.getContext('2d');

          inMemoryContext.drawImage(imageObj, 0, 0, width / 2, height / 2);
          inMemoryContext.drawImage(inMemoryCanvas, 0, 0, width / 2, height / 2, 0, 0, width / 5, height / 5);
          context.drawImage(inMemoryCanvas, 0, 0, width / 5, height / 5, 0, 0, width / 5, height / 5);
        };

      }

      loadCanvas(vm.image.binaryData);

      vm.test = function() {
        var canvas = document.getElementById('photo-canvas');
        var context = canvas.getContext('2d');
        var imageObj = new Image();
        imageObj.src = vm.image.binaryData;
        var width = imageObj.width;
        var height = imageObj.height;

        canvas.width = width;
        canvas.height = height;

        imageObj.onload = function() {
          var inMemoryCanvas = document.createElement('canvas');
          inMemoryCanvas.width = width;
          inMemoryCanvas.height = height;
          var inMemoryContext = inMemoryCanvas.getContext('2d');

          inMemoryContext.drawImage(imageObj, 0, 0, width, height);
          context.drawImage(inMemoryCanvas, 0, 0, width * 5, height * 5, 0, 0, width * 5, height * 5);
          var img = inMemoryCanvas.toDataURL('image/jpeg;', 1.0);
          var socket = io.connect('http://localhost:3001');
          socket.emit('foo', {id: vm.image.filename, img:img});
        };





      };

      vm.overlay = false;
      vm.toggleOverlay = function(overlay) {
        if (overlay) {
          vm.overlay = !vm.overlay;
        } else {
          vm.overlay = !vm.overlay;
        }
      };

      vm.vintage = function(vintageValue) {
        if (vintageValue) {
          editor.vintage();
        } else {
          editor.reset();
        }
      };

      vm.lomo = function(lomoValue) {
        if (lomoValue) {
          editor.lomo();
        } else {
          editor.reset();
        }
      };

      vm.glowingSun = function(glowingSunValue) {
        if (glowingSunValue) {
          editor.glowingSun();
        } else {
          editor.reset();
        }
      };

      vm.nostalgia = function(nostalgiaValue) {
        if (nostalgiaValue) {
          editor.nostalgia();
        } else {
          editor.reset();
        }
      }

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
