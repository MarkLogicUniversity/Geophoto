(function() {
  'use strict';
  angular
    .module('geophoto')
    .controller('geoSearchController', geoSearchController);

    geoSearchController.$inject = ['photofactory'];

    function geoSearchController(photofactory) {
      var vm = this;
      vm.searching = false;
      var circle;

      var mapOptions = {
        zoom: 2,
        center: new google.maps.LatLng(10, 0),
        mapTypeId: google.maps.MapTypeId.ROAD
      };

      vm.map = new google.maps.Map(document.getElementById('map'), mapOptions);
      var drawingManager = new google.maps.drawing.DrawingManager({
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
          google.maps.drawing.OverlayType.CIRCLE
          ]
        },
        circleOptions: {
          fillColor: '#eee',
          fillOpacity: 0.6,
          strokeWeight: 1,
          clickable: false,
          editable: true,
          zIndex: 1
        }
      });

      drawingManager.setMap(vm.map);

      google.maps.event.addListener(drawingManager, 'circlecomplete', onCircleComplete);

      function onCircleComplete(shape) {
        if (shape == null || (!(shape instanceof google.maps.Circle))) return;

        if (circle != null) {
          circle.setMap(null);
          circle = null;
        }

        circle = shape;
        var radius = Math.round(circle.getRadius() * 0.000621371192);
        var lat = circle.getCenter().lat();
        var lng = circle.getCenter().lng();
        var search = {
          radius: radius,
          lat: lat,
          lng: lng
        };

        // radius_changed event listener (https://developers.google.com/maps/documentation/javascript/shapes)
        google.maps.event.addListener(shape, 'radius_changed', onCircleChanged);
        function onCircleChanged() {
          var radius = Math.round(circle.getRadius() * 0.000621371192);
          var lat = circle.getCenter().lat();
          var lng = circle.getCenter().lng();
          var search = {
            radius: radius,
            lat: lat,
            lng: lng
          };
          // initiate the search again
          geoSearch(search);
        }

        // center_changed event listener
        google.maps.event.addListener(shape, 'center_changed', onPointChanged);

        function onPointChanged() {
          var radius = Math.round(circle.getRadius() * 0.000621371192);
          var lat = circle.getCenter().lat();
          var lng = circle.getCenter().lng();
          var search = {
            radius: radius,
            lat: lat,
            lng: lng
          };

          // initiate the search again
          geoSearch(search);
        }

        geoSearch(search);

        function geoSearch(object) {
          vm.searching = true;
          photofactory.geoSearch(object).then(function(data) {
            vm.results = data;
          });
        }
      }
    }
})();
