// Setting up the Database for the Geophoto application, including the indexes
var request = require('request');
var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');

var username="admin"; // update if required
var password="admin"; // update if required

function readFile(filename, enc){
  return new Promise(function (fulfill, reject){
    fs.readFile(__dirname + path.sep + filename, enc, function (err, res){
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

// Create the application server and the content and modules databases. 
function bootstrap() {
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
}

// Remove the application completely
function wipe() {
  readFile('01-rest-instance-config.json')
    .then(
      function (restConfig) {
        var config = JSON.parse(restConfig);
        console.log('Removing application server and the databases.');
        return applyConfig('/v1/rest-apis/' + config['rest-api'].name + '?include=content&include=modules', 'DELETE', null);
      })
    .catch(function (error) {
      console.log('Wipe failed: ' + error.errorResponse.statusCode + '; ' + error.errorResponse.message);
    });
}

switch (process.argv[2]) {
  case 'bootstrap':
    bootstrap();
    break;
  case 'wipe':
    wipe();
    break;
  default:
    console.log('Usage: ' + process.argv[0] + ' ' + path.relative('.', process.argv[1]) + ' [bootstrap|wipe]');
}
