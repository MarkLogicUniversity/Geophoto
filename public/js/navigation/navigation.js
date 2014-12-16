(function() {
  'use strict';
  angular
    .module('geofoto').
    controller('NavigationController', NavigationController);

    NavigationController.$inject = ['$location'];

    function NavigationController($location) {
      var vm = this;
      vm.isActive = function(url) {
        var path = $location.path().substring(1);
        var index = path.indexOf('/');
        if (index !== -1) {
            path = path.slice(0, index);
        }
        return url === path ? 'active' : '';
      };
    }
})();
