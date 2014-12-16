(function() {
  'use strict';
  angular
    .module('geofoto')
    .controller('MapController', MapController);

    MapController.$inject = ['photofactory'];

    function MapController(photofactory) {
      var vm            = this;
      var infoWindow    = new google.maps.InfoWindow();
      var numberOfCalls = 0;
      var tmpMarkers    = [];
      var percentage    = 0;

      var mapOptions = {
        zoom: 2,
        center: new google.maps.LatLng(10, 0),
        mapTypeId: google.maps.MapTypeId.ROAD
      };

      vm.map = new google.maps.Map(document.getElementById('map'), mapOptions);

      vm.markers = [];

      var createMarker = function(data, max) {
        // every marker has to have a latitude, longitude and a title
        var latitude  = data.location.coordinates[0];
        var longitude = data.location.coordinates[1];

        var title = data.title || data.filename;

        var marker = {
          map: vm.map,
          position: new google.maps.LatLng(latitude, longitude),
          title: title,
          id: data.filename,
        };

        photofactory.showImage(marker.id).then(function(d) {
          marker['binary'] = d[0];
          marker['content'] = '<div class="infoWindowContent"><img src="data:image/jpg;base64,' + marker.binary + '"></div>';

          marker = new google.maps.Marker(marker);

          google.maps.event.addListener(marker, 'click', function() {
            infoWindow.setContent('<div class="infoWindowHeader"><h3>' + marker.title + '</h3><p><a href="#/edit/'+marker.id+'">edit</a></p></div>' + marker.content);
            infoWindow.open(vm.map, marker);
          });

          numberOfCalls++;

          if (numberOfCalls === max) {
            vm.markers = tmpMarkers;
            vm.markers.message = '';
          } else {
            tmpMarkers.push(marker);
            percentage = Math.round(numberOfCalls / max * 100);
            vm.markers.message = 'Loading markers, please wait ...';
            vm.markers.percentage = percentage;
          }
        });
      };

      photofactory.showAllPhotos().then(function(data) {
        for (var i = 0; i < data.length; i++) {
          createMarker(data[i], data.length);
        }
      });

      vm.openInfoWindow = function(e, selectedMarker) {
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
      };
    }
  })();
