(function() {
  'use strict';
  angular
    .module('geofoto')
    .controller('textSearchController', textSearchController);

    textSearchController.$inject = ['photofactory'];

    function textSearchController(photofactory) {
      var vm = this;
      vm.message = 'hello';
    }
})();
