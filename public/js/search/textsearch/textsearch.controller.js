(function() {
  'use strict';
  angular
  .module('geophoto')
  .controller('textSearchController', textSearchController);

  textSearchController.$inject = ['photofactory'];

  function textSearchController(photofactory) {
    var vm = this;
    vm.results = [];
    vm.search = function() {
      if (vm.term || vm.term.length !== 0) {
        photofactory.textSearch(vm.term)
        .then(function(data) {
          vm.results = data;
        })
        .catch(function(error) {
          console.error(error);
        });
      } else {
        vm.results = [];
      }
    };
  }
})();
