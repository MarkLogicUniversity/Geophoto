'use strict';
var http = require('http');
require('es6-promise').polyfill();

export var makeRequest = location => {
  var promise = new Promise((resolve, reject) => {
    if (typeof location === 'object') {
      var options = {
        hostname: 'query.yahooapis.com',
        path: '/v1/public/yql?q=select%20*%20from%20geo.placefinder%20where%20text%3D%22' + location.latitude + '%2C' + location.longitude + '%22%20and%20gflags%3D%22R%22&format=json',
        method: 'GET'
      };
      var request = http.request(options, response => {
        response.setEncoding('utf8');
        response.on('data', chunk => {
          resolve(JSON.parse(chunk));
        });
      });

      request.on('error', error => {
        reject(error);
      });

      request.end();

    } else {
      reject('Error: parameter is not of type location but ', typeof location);
    }
  });
  return promise;
};
