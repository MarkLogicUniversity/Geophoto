'use strict';
/*
Model to do a reverse geolookup using the yahoo api
*/

var https = require('https');
require('es6-promise').polyfill();

export var makeRequest = location => {
  var promise = new Promise((resolve, reject) => {
    var result = '';
    var city = '';
    var country = '';
    var returnData = {};
    if (typeof location === 'object') {
      var key = '';
      var options = {
        hostname: 'maps.googleapis.com',
        path: '/maps/api/geocode/json?latlng=' + location.latitude + ',' + location.longitude + '&key=' + key,
        method: 'GET'
      };
      var request = https.request(options, (response) => {
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          result += chunk;
        });

        response.on('end', () => {
          var data = JSON.parse(result);
          data.results[0].address_components
          .filter((components) => {
            return components.types.indexOf('locality') > -1;
          })
          .map((locality) => {
            city = locality.long_name;
          });

          data.results[0].address_components
          .filter((components) => {
            return components.types.indexOf('country') > -1;
          })
          .map((countryComponent) => {
            country = countryComponent.long_name;
          });

          returnData = {
            city: city,
            country: country,
            latitude: location.latitude,
            longitude: location.longitude
          }
          resolve(returnData);
        });

      });

      request.on('error', error => {
        reject(error);
      });

      request.end();

    } else {
      reject('Error: parameter is not of type location but ' + typeof location);
    }
  });
  return promise;
};
