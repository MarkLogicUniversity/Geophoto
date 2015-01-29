(function() {
  'use strict';
  angular
    .module('geofoto')
    .controller('MapController', MapController);

    MapController.$inject = ['photofactory'];

    function MapController(photofactory) {
      var vm            = this;
      var infoWindow    = new google.maps.InfoWindow();
      var tmpMarkers    = [];
      var numberOfCalls = 0;
      var photoData = '';

      var mapOptions = {
        zoom: 2,
        center: new google.maps.LatLng(10, 0),
        mapTypeId: google.maps.MapTypeId.ROAD
      };

      vm.map = new google.maps.Map(document.getElementById('map'), mapOptions);

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
        vm.markers    = [];

        tmpMarkers.push(point);
        vm.markers = tmpMarkers;

        google.maps.event.addListener(point, 'click', function() {
          photofactory.showImage(photoData.filename)
          .then(function(binaryData) {
            infoWindow.setContent('<div class="infoWindowHeader"><span class="title">' + marker.title + '</span> <span><a href="#/edit/' + marker.id + '" class="btn btn-warning btn-xs"><i class="glyphicon glyphicon-pencil"></i></a></span></div>' + '<div class="infoWindowContent"><img class="img-rounded" src="data:image/jpg;base64,' + binaryData[0] + '"></div>');
            infoWindow.open(vm.map, point);
          });
        });
      };
      photofactory.showAllPhotos()
      .then(function(data) {
        vm.photos = data;
        for (var i = 0, max = data.length; i < max; i++) {
            createMarker(data[i]);
        }
      });

      vm.openInfoWindow = function(e, selectedMarker) {
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
      };
    }
  })();
