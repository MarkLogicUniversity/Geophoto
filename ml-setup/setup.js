// Setting up the Database for the Geophoto application, including the indexes
var request = require('request');
var Promise = require('bluebird');
var fs = require('fs');

var username="admin"; // update if required
var password="admin"; // update if required

function readFile(filename, enc){
  return new Promise(function (fulfill, reject){
    fs.readFile(filename, enc, function (err, res){
      if (err) reject(err);
      else fulfill(res);
    });
  });
}

function applyConfig(path, method, config) {
  return new Promise(function (fulfill, reject) {
    request(
      {
        url: 'http://localhost:8002' + path,
        method: method,
        auth: {
          user: username,
          password: password,
          sendImmediately: false
        },
        headers: {
          'Content-type': 'application/json'
        },
        json: config
      },
      function(error, response, body) {
        var code = response.statusCode;
        if (code >= 200 && code < 300) {
          fulfill(response);
        }

        reject(body);
      }
    );
  });
}

readFile('01-rest-instance-config.json')
  .then(
    function (restConfig) {
      console.log('Setting up the application server and the databases - ');
      return applyConfig('/v1/rest-apis', 'POST', JSON.parse(restConfig));
    })
  .then(function() { return readFile('02-database-config.json'); })
  .then(function(dbConfig) {
    console.log('Setting up the indexes - ');
    return applyConfig('/manage/v2/databases/geophoto-content/properties', 'PUT', JSON.parse(dbConfig));
  })
  .catch(
    function (error) {
      console.log('Problem: ' + error.errorResponse.statusCode + '; ' + error.errorResponse.message);
    });

