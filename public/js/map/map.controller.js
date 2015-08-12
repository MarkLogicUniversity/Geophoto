(function() {
  'use strict';
  angular
    .module('geophoto')
    .controller('MapController', MapController);

    MapController.$inject = ['$cacheFactory', 'photofactory'];

    function MapController($cacheFactory, photofactory) {
      var vm            = this;
      //sorting
      vm.order = {
        sortBy: 'data.created',
        reverse: false
      }

      var infoWindow    = new google.maps.InfoWindow();
      var tmpMarkers    = [];
      var numberOfCalls = 0;
      var photoData     = '';

      var mapOptions    = {
        zoom: 2,
        center: new google.maps.LatLng(10, 0),
        mapTypeId: google.maps.MapTypeId.ROAD
      };

      // caching
      var cache = $cacheFactory.get('$http');
      var dataCache = cache.get('/api');

      vm.map = new google.maps.Map(document.getElementById('map'), mapOptions);

      var createMarker = function(photoData) {
        var binaryCache = cache.get('/api/imagedata/' + photoData.filename);
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
          if (!binaryCache) {
            infoWindow.setContent('<div class="infoWindowHeader"><span class="title">' + marker.title + '</span> <span><a href="#/edit/' + marker.id + '" class="btn btn-warning btn-xs"><i class="glyphicon glyphicon-pencil"></i></a></span></div>' + '<div class="infoWindowContent"><img class="img-rounded" src="' + photoData.binary + '"></div>');
            infoWindow.open(vm.map, point);
          } else {
            var binaryData = JSON.parse(binaryCache[1]);
            infoWindow.setContent('<div class="infoWindowHeader"><span class="title">' + marker.title + '</span> <span><a href="#/edit/' + marker.id + '" class="btn btn-warning btn-xs"><i class="glyphicon glyphicon-pencil"></i></a></span></div>' + '<div class="infoWindowContent"><img class="img-rounded" src="' + photoData.binary + '"></div>');
            infoWindow.open(vm.map, point);
          }
        });
      };
      if (!dataCache) {
        photofactory.showAllPhotos()
        .then(function(data) {
          vm.photos = data;
          for (var i = 0, max = data.length; i < max; i++) {
              createMarker(data[i].content);
          }
        });
      } else {
        var data = JSON.parse(dataCache[1]);
        vm.photos = data;
        for (var i = 0, max = data.length; i < max; i++) {
            createMarker(data[i].content);
        }
      }

      vm.openInfoWindow = function(e, selectedMarker) {
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
      };
    }
  })();
