'use strict';

var app = angular.module('geofoto.controller', []);

/*
controller for the header
it looks for the $location.path() value and applies the active CSS class if the path matches the currently visible path

There's a small trick here:
    var path = $location.path().substring(1);
    return url === path ? "active" : "";
would only match first class URLs such as /maps and /explorer

What about something like /maps/item? It should still put the active class to the 'Characters' menu. If path contains / then slice the array and get the first path ( === 'maps') and this will set the active flag to be true
*/
app.controller('NavController', ['$scope', '$location',
    function($scope, $location) {
        $scope.isActive = function(url) {
            var path = $location.path().substring(1);
            var index = path.indexOf('/');
            if (index !== -1) {
                path = path.slice(0, index);
            }
            return url === path ? "active" : "";
        };
    }
    ]);

/* The map controller is responsible for handling the display of the map. It uses the PhotoService to retrieve all the photos from the database */

app.controller('MapController', ['$scope', 'PhotoService',
    function($scope, PhotoService) {
        var infoWindow = new google.maps.InfoWindow(),
        numberOfCalls = 0,
        tmpMarkers = [],
        percentage = 0;

        // map options such as the initial coordinates and the zoom level
        var mapOptions = {
            zoom: 2,
            center: new google.maps.LatLng(10, 0),
            mapTypeId: google.maps.MapTypeId.ROAD
        };

        // assign the map to the $scope (note mapOptions)
        $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

        // creating an array for the markers on $scope
        $scope.markers = [];

        // function to create marker on the map
        var createMarker = function(data, max) {
          // every marker has to have a latitude, longitude and a title
            var latitude = data.location.coordinates[0],
            longitude    = data.location.coordinates[1];

            // the title of the marker is either going to be the title (which is a JSON key, if available) or the actual name of the file (which should be the case after the initial data load)
            var title = data.title || data.filename;

            /* creating a marker. Each marker has to have a map associated with it as well as a position.
            the position information is extracted out from the NoSQL database. The marker also has to have a unique ID which, in our case, is the name of the file.
            */
            var marker = {
                map: $scope.map,
                position: new google.maps.LatLng(latitude, longitude),
                title: title,
                id: data.filename,
            };

            /*the showImage function retrieves a binary stream of data representing the image itself which is then added to the <img> tag using the data-uri (data:image/jpg;base64) format
            */
            PhotoService.showImage(marker.id).success(function(d) {
                marker['binary'] = d[0];
                marker['content'] = '<div class="infoWindowContent"><img src="data:image/jpg;base64,' + marker.binary + '"></div>';

               // place marker on the map
               marker = new google.maps.Marker(marker);

               // markers can also have event listeners such as 'click'
               google.maps.event.addListener(marker, 'click', function() {
                infoWindow.setContent('<div class="infoWindowHeader"><h3>' + marker.title + '</h3><p><a href="#/edit/'+marker.id+'">edit</a></p></div>' + marker.content);
                infoWindow.open($scope.map, marker);
            });
              // helper variable to display percentage bar
              numberOfCalls++;

              if (numberOfCalls === max) {
                $scope.markers = tmpMarkers;
                $scope.markers.message = '';
              } else {
                tmpMarkers.push(marker);
                percentage = Math.round(numberOfCalls / max * 100);
                $scope.markers.message = 'Loading markers, please wait ...';
                $scope.markers.percentage = percentage;
            }
        });
};

  /*
  showAll() retrieves all photos and calls the createMarker function to display each photo as a marker on the map
  */
  PhotoService.showAll().success(function(data) {
      for (var i = 0; i < data.length; i++) {
          createMarker(data[i], data.length);
      }
  });

  //this function triggers the click event that will open an info window for the marker clicked
  $scope.openInfoWindow = function(e, selectedMarker) {
      e.preventDefault();
      google.maps.event.trigger(selectedMarker, 'click');
  };

}
]);

/* Map Search takes advantage of the google maps Drawing Manager
note that the radius specified by the Google Maps API is a valu in meters that need to be converted to miles
*/
app.controller('MapSearchController', ['$scope', 'PhotoService',
    function($scope, PhotoService) {
        var mapOptions = {
            zoom: 2,
            center: new google.maps.LatLng(10, 0),
            mapTypeId: google.maps.MapTypeId.ROAD
        };
        // creating map
        $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

        // Initialising a google drawing manager
        var drawingManager = new google.maps.drawing.DrawingManager({
            //drawingMode: google.maps.drawing.OverlayType.MARKER,
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
        drawingManager.setMap($scope.map);
        var circle;

        // adding an event listener (https://developers.google.com/maps/documentation/javascript/examples/circle-simple)
        google.maps.event.addListener(drawingManager, 'circlecomplete', onCircleComplete);

        //cirlce event listener
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
        }

        var geoSearch = function search (object) {
            PhotoService.search(object).success(function (data) {
                $scope.results = data;
            });
        };
    }
    ]);

/*
The PhotoController is responsible for allowing people to edit the photos
*/
app.controller('PhotoController', ['$scope', '$routeParams', '$location', '$route', 'PhotoService',
    function($scope, $routeParams, $location, $route, PhotoService) {
        $scope.editable = '';
        var id = $routeParams.id;
        PhotoService.showOne(id)
        .success(function (data, status, headers, config) {
            PhotoService.showImage(id).success(function(d) {
                $scope.image.binaryData = 'data:image/jpg;base64,' + d[0];
            });
            $scope.image = data[0];
            $scope.image.title = data[0].title || data[0].filename;
        })
        .error(function (data, status, headers, config) {
            console.log(data);
        });

        $scope.update = function() {
            var title = $scope.image.newtitle;
            if (title) {
                PhotoService.add($scope.image.filename, title).success(function (data) {
                  if (data === '200') {
                    $scope.image.title = title;
                  }
                });
            }
        };
    }
    ]);
