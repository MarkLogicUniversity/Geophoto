(function() {
  'use strict';
  angular
  .module('geofoto')
  .controller('textSearchController', textSearchController);

  textSearchController.$inject = ['photofactory'];

  function textSearchController(photofactory) {
    var vm = this;
    vm.search = function() {
      photofactory.textSearch(vm.term)
      .then(function(data) {
        vm.results = data;
      })
      .catch(function(error) {
        console.error(error);
      });
    }
  }
})();
