// Setting up the Database for the Geophoto application, including the indexes
var request = require('request');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require("fs"));
var path = require('path');
var prequest = Promise.promisify(require("request"));

var username="admin"; // update if required
var password="admin"; // update if required

function readFile(filename, enc){
  return fs.readFileAsync(__dirname + path.sep + filename, enc);
}

function getAuth() {
  return {
    user: username,
    password: password,
    sendImmediately: false
  };
}

function applyConfig(path, method, config) {
  return new Promise(function (fulfill, reject) {
    request(
      {
        url: 'http://localhost:8002' + path,
        method: method,
        auth: getAuth(),
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

// Check whether the REST API application server has already been made
function checkForAppServer(restConfig) {
  return prequest
    ({
      url: 'http://localhost:8002/v1/rest-apis/' + restConfig['rest-api'].name,
      auth: getAuth()
    });
}

// If the app server does not already exist, create it and the databases that
// go with it. The response parameter is the response to a request to get
// information about the app server.
function createIfNeeded(response) {
  if (response[0].statusCode === 404) {
    // the Application Server has not already been set up
    console.log('Setting up the application server and the databases - ');
    return applyConfig('/v1/rest-apis', 'POST', restConfig.value());
  } else {
    console.log('App server already setup; skipping');
  }
}

// Create the application server and the content and modules databases. 
function bootstrap() {
  var restConfig =
    readFile('01-rest-instance-config.json')
      .then(JSON.parse);

  restConfig.then(checkForAppServer)
    .then(createIfNeeded)
    .then(function() { return readFile('02-database-config.json'); })
    .then(JSON.parse)
    .then(function(dbConfig) {
      console.log('Setting up the indexes - ');
      return applyConfig('/manage/v2/databases/geophoto-content/properties', 'PUT', dbConfig);
    })
    .catch(
      function (error) {
        if (typeof error === 'object') {
          console.log('Problem: ' + error.errorResponse.statusCode + '; ' + error.errorResponse.message);
        } else {
          console.log('Problem: ' + error);
        }
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
