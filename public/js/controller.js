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
            zoom: 3,
            center: new google.maps.LatLng(52.0400, 0.7600),
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
        }

        $scope.edit = function(id) {
            PhotoService.showOne(id).success(function(data) {
                console.log(data);
            });
        }
    }
]);

app.controller('PhotoController', ['$scope', '$routeParams', '$route', 'PhotoService',
    function($scope, $routeParams, $route, PhotoService) {

        var id = $routeParams.id;
        PhotoService.showOne(id).success(function (data) {
            PhotoService.showImage(id).success(function(d) {
                $scope.image.binaryData = 'data:image/jpg;base64,' + d[0];
            });
            $scope.image = data[0];
            $scope.image.title = data[0].title || data[0].filename;
        });

        $scope.update = function() {
            var title = $scope.image.newtitle;
            PhotoService.add($scope.image.filename, title).success(function (data) {
                $route.reload();
            });
        }
    }
]);