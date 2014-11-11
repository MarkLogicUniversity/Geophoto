'use strict';

var app = angular.module('geofoto.controller', []);

/*
controller for the header
it looks for the $location.path() value and applies the active CSS class if the path matches the currently visible path

There's a small trick here:
    var path = $location.path().substring(1);
    return url === path ? "active" : "";
would only match first class URLs such as /characters and /books

What about /characters/darthvader? It should still put the active class to the 'Characters' menu. If path contains / then slice the array and get the first path (==-'characters') and this will set the active flag to be true
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

app.controller('MapController', ['$scope', 'PhotoService',
    function($scope, PhotoService) {
        var infoWindow = new google.maps.InfoWindow(),
        numberOfCalls = 0,
        tmpMarkers = [],
        percentage = 0;

        var mapOptions = {
            zoom: 2,
            center: new google.maps.LatLng(10, 0),
            mapTypeId: google.maps.MapTypeId.ROAD
        };

        // creating map
        $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

        $scope.markers = [];
        
        // function to create marker on the map
        var createMarker = function(data, max) {
            var latitude = data.location.coordinates[0],
            longitude = data.location.coordinates[1],
            title = '';

            var title = data.title || data.filename;

            var marker = {
                map: $scope.map,
                position: new google.maps.LatLng(latitude, longitude),
                title: title,
                id: data.filename,
            };
            
            PhotoService.showImage(marker.id).success(function(d) {
                marker['binary'] = d[0];
                marker['content'] = '<div class="infoWindowContent"><img src="data:image/jpg;base64,' + marker.binary + '"></div>';

               // place marker

               marker = new google.maps.Marker(marker);    

               google.maps.event.addListener(marker, 'click', function(){
                infoWindow.setContent('<div class="infoWindowHeader"><h3>' + marker.title + '</h3><p><a href="#/edit/'+marker.id+'">edit</a></p></div>' + marker.content);
                infoWindow.open($scope.map, marker);
            });

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

PhotoService.showAll().success(function(data) {
    for (var i = 0; i < data.length; i++) {
        createMarker(data[i], data.length);
    }
});

$scope.openInfoWindow = function(e, selectedMarker) {
    e.preventDefault();
    google.maps.event.trigger(selectedMarker, 'click');
};

$scope.edit = function(id) {
    PhotoService.showOne(id).success(function(data) {
        console.log(data);
    });
};
}
]);

app.controller('MapSearchController', ['$scope', 'PhotoService',
    function($scope, PhotoService) {
        var mapOptions = {
            zoom: 2,
            center: new google.maps.LatLng(10, 0),
            mapTypeId: google.maps.MapTypeId.ROAD
        };
        // creating map
        $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

        // Geo drawer
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
        
        google.maps.event.addListener(drawingManager, 'circlecomplete', onCircleComplete);
        

        //cirlce event listener
        function onCircleComplete(shape) {
            console.log('called');
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
                console.log('radius changed');

                // initiate the search again
                geoSearch(search);
            }

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
                console.log('center moved');

                // initiate the search again
                geoSearch(search);
            }

            geoSearch(search);

            // console.log('radius : ', circle.getRadius());
            // console.log('radius in miles: ', Math.round(circle.getRadius() * 0.000621371192));
            // console.log('lat', circle.getCenter().lat());
            // console.log('lng', circle.getCenter().lng());
        }

        

        var geoSearch = function search (object) {
            PhotoService.search(object).success(function (data) {
                $scope.results = data;
            });
        };
    }
    ]);

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
                    $route.reload();
                });
            }
        };
    }
    ]);