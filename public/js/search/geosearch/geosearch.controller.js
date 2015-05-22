(function() {
  'use strict';
  angular
    .module('geophoto')
    .controller('geoSearchController', geoSearchController);

    geoSearchController.$inject = ['photofactory'];

    function geoSearchController(photofactory) {
      var vm = this;
      var infoWindow    = new google.maps.InfoWindow();
      vm.searching = false;
      var circle;
      var tmpMarkers    = [];

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

      var createMarker = function(photoData) {
        var latitude  = photoData.location.coordinates[0];
        var longitude = photoData.location.coordinates[1];
        var title     = photoData.title || photoData.filename;
        var marker    = {
          map: vm.map,
          position: new google.maps.LatLng(latitude, longitude),
          id: photoData.filename,
          data: photoData,
          title: title
        };
        var point     = new google.maps.Marker(marker);

        tmpMarkers.push(point);
        vm.markers = tmpMarkers;

        google.maps.event.addListener(point, 'click', function() {
          photofactory.showImage(photoData.filename)
          .then(function(binaryData) {
            infoWindow.setContent('<div class="infoWindowHeader"><span class="title">' + marker.title + '</span> <span><a href="#/edit/' + marker.id + '" class="btn btn-warning btn-xs"><i class="glyphicon glyphicon-pencil"></i></a></span></div>' + '<div class="infoWindowContent"><img class="img-rounded" src="data:image/jpg;base64,' + binaryData + '"></div>');
            infoWindow.open(vm.map, point);
          });
        });
      };



      var deleteAllMarkers = function() {
        if (vm.markers) {
          for(var i = 0, max = tmpMarkers.length;  i < max; i++) {
            tmpMarkers[i].setMap(null);
          }
          tmpMarkers = [];
        }
      }

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

      function geoSearch(object) {
        vm.searching = true;
        photofactory.geoSearch(object).then(function(data) {
          vm.results = data;
          deleteAllMarkers();
          for (var i = 0, max = data.length; i < max; i++) {
              createMarker(data[i].content);
          }
        });
      }

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
        // center_changed event listener
        google.maps.event.addListener(shape, 'center_changed', onPointChanged);

        geoSearch(search);

      }
    }
})();
