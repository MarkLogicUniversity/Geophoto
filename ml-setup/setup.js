// Setting up the Database for the Geophoto application, including the indexes
var Promise = require('bluebird');
var fs = require("fs");
var path = require('path');
var request = Promise.promisify(require("request"));

var username = 'admin'; // update if required
var password = 'admin'; // update if required
var hostname = 'localhost';
var port = 8002;
var baseURL = 'http://' + hostname + ':' + port;

function readFile(filename, enc){
  return fs.readFileSync(__dirname + path.sep + filename, enc);
}

function getAuth() {
  return {
    user: username,
    password: password,
    sendImmediately: false
  };
}

function applyConfig(path, method, config) {
  return request(
    {
      url: baseURL + path,
      method: method,
      auth: getAuth(),
      headers: {
        'Content-type': 'application/json'
      },
      json: config
    });
}

// Check whether the REST API application server has already been made
function checkForAppServer(restConfig) {
  return request
    ({
      url: baseURL + '/v1/rest-apis/' + restConfig['rest-api'].name,
      auth: getAuth()
    });
}

// Create the application server and the content and modules databases. 
function bootstrap() {
  var restConfig = JSON.parse(readFile('01-rest-instance-config.json'));

  checkForAppServer(restConfig)
    .then(function (response) {
      // If the app server does not already exist, create it and the databases
      // that go with it.

      if (response[0].statusCode === 404) {
        // the Application Server has not already been set up
        console.log('Setting up the application server and the databases - ');
        return applyConfig('/v1/rest-apis', 'POST', restConfig);
      } else if (response[0].statusCode === 200) {
        console.log('App server already setup; skipping');
      } else {
        // Something else went wrong
        throw {
          errorResponse: {
            statusCode: response[0].statusCode,
            message: response[0].message
          }
        };
      }
    })
    .then(function() {
      console.log('Setting up the indexes - ');
      var dbConfig = JSON.parse(readFile('02-database-config.json'));
      return applyConfig('/manage/v2/databases/geophoto-content/properties', 'PUT', dbConfig);
    })
    .catch(
      function (error) {
        if (typeof error.errorResponse !== 'undefined') {
          console.log('Setup failed: ' + error.errorResponse.statusCode + '; ' + error.errorResponse.message);
        } else {
          console.log('Setup failed: ' + error);
        }
      })
    .done(
      function() {
        console.log('Bootstrap complete.');
      });
}

// Remove the application from MarkLogic completely
function wipe() {
  var restConfig = JSON.parse(readFile('01-rest-instance-config.json'));

  console.log('Removing application server and the databases.');
  applyConfig('/v1/rest-apis/' + restConfig['rest-api'].name + '?include=content&include=modules', 'DELETE', null)
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
