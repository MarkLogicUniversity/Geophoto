'use strict';
var app = angular.module('geofoto', []);

app.service('PhotoService', ['$http',
    function($http) {
        return {
            showAll: function() {
                return $http.get('/api');
            },
            showImage: function(id) {
                return $http.get('/api/imagedata/'+id)
            }
        }
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
            var latitude = data.location.coordinates[1],
                longitude = data.location.coordinates[0];

            var marker = new google.maps.Marker({
                map: $scope.map,
                position: new google.maps.LatLng(latitude, longitude),
                title: data.filename,
                id: data.filename,
            });
            
            PhotoService.showImage(marker.id).success(function(d) {
                marker['binary'] = d[0].binary;
                marker['content'] = '<div class="infoWindowContent"><img width="300" src="data:image/jpg;base64,' + marker.binary + '"></div>';

                google.maps.event.addListener(marker, 'click', function(){
                    infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
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
    }
]);