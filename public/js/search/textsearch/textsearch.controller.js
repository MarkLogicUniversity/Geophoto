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
        console.log(vm.results);
      })
      .catch(function(error) {
        console.error(error);
      });
    }
  }
})();
