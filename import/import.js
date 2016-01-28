'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _extract = require('./extract');

var extract = _interopRequireWildcard(_extract);

var _convert = require('./convert');

var converter = _interopRequireWildcard(_convert);

var _geolookup = require('./geolookup');

var geolookup = _interopRequireWildcard(_geolookup);

var _database = require('./database');

var database = _interopRequireWildcard(_database);

var _semantic = require('./semantic');

var semantic = _interopRequireWildcard(_semantic);

var fs = require('fs');
var path = require('path');
require('es6-promise').polyfill();

var param = process.argv[2]; //path
var offline = process.argv[3]; //'offline' mode
var objectToInsert = {}; //final object to be inserted

/*
processImport function returns a promise containing all the jpg and/or jpeg
files from a given folder that is provided as a paramter (2nd argument for the
script)
*/
var processImport = function processImport(param) {
  var promise = new Promise(function (resolve, reject) {
    var result = [];
    var exists = fs.existsSync(param);
    if (exists) {
      if (fs.statSync(param).isDirectory()) {
        fs.readdirSync(param).filter(function (file) {
          var extension = path.extname(file).toLowerCase();
          if (extension === '.jpg' || extension === '.jpeg') {
            result.push(param + '/' + file);
            resolve(result);
          }
        });
      } else if (fs.statSync(param).isFile()) {
        var extension = path.extname(param).toLowerCase();
        if (extension === '.jpg' || extension === '.jpeg') {
          result.push(param);
          resolve(result);
        }
      } else {
        reject(new Error('An error occured, path is not a file nor a folder: ' + path));
      }
    } else {
      reject(new Error('Location specified does not exist: ' + param));
    }
  });
  return promise;
};

processImport(param).then(function (files) {
  var counterValid = 0; //counter for the number of inserted json docs
  var counter = 0; //counter for the currently inserted json docs
  files.forEach(function (file) {
    extract.getGPSInformation(file) //extract GPS information for the files
    .then(function (GPSData) {
      counterValid++; //only insert files that have GPS Data
      extract.getModelInformation(file) //extract model and make info
      .then(function (ModelData) {
        converter.convertGPSData(GPSData) //convert GPS data
        .then(function (location) {
          if (offline && offline === 'offline') {
            /*
            the URI for the documents has to be modified as some filename may
            contain invalid characters
            */
            var uri = file.split('/').pop().replace(/[&\/\\#,+()$~%'":*?<>{} ]/g, '');
            /*
            building up the data object that will be inserted to the database
            */
            objectToInsert.originalFilename = file;
            objectToInsert.filename = uri;
            objectToInsert.binary = '/binary/' + uri;
            objectToInsert.make = ModelData.make;
            objectToInsert.model = ModelData.model;
            objectToInsert.created = ModelData.created;
            objectToInsert.location = {
              type: 'Point',
              coordinates: [location.latitude, location.longitude]
            };
            database.insert('JSON', '', objectToInsert).then(function (response) {
              console.log('JSON file inserted ', response.documents[0].uri);
            })['catch'](function (error) {
              console.log(error);
            });
            database.insert('JPEG', file, objectToInsert).then(function (response) {
              console.log('JPEG file inserted ', response.documents[0].uri);
            })['catch'](function (error) {
              console.log(error);
            });
          } else if (!offline && offline !== 'offline') {
            // if the 'offline' parameter was not passed in
            console.log(file);
            //console.log('processing file ', location)
            geolookup.makeRequest(location).then(function (result) {
              console.log(result);
              var uri = file.split('/').pop().replace(/[&\/\\#,+()$~%'":*?<>{} ]/g, '');
              objectToInsert.originalFilename = file;
              objectToInsert.filename = uri;
              objectToInsert.binary = '/binary/' + uri;
              objectToInsert.make = ModelData.make;
              objectToInsert.model = ModelData.model;
              objectToInsert.created = ModelData.created;
              objectToInsert.location = {
                type: 'Point',
                coordinates: [location.latitude, location.longitude]
              };
              objectToInsert.location.city = result.city;
              objectToInsert.location.country = result.country;
              database.insert('JSON', '', objectToInsert).then(function (response) {
                console.log('JSON file inserted ', response.documents[0].uri);
                counter++; //increase counter for the inserted document count
                /*
                if the inserted document counter is equal to the max documents
                prepared for insert call the semantic function and insert some
                RDF data
                */
                if (counter === counterValid) {
                  semantic.semantic();
                }
              })['catch'](function (error) {
                console.log(error);
              });
              database.insert('JPEG', file, objectToInsert).then(function (response) {
                console.log('JPEG file inserted ', response.documents[0].uri);
              })['catch'](function (error) {
                console.log(error);
              });
            })['catch'](function (error) {
              console.log(error);
            });
          }
        })['catch'](function (error) {
          console.log('Error with convertGPSData ' + error);
        });
      })['catch'](function (error) {
        console.log('Error with getModelInformation ' + error);
      });
    })['catch'](function (error) {
      console.log('Error with getGPSInformation ' + error);
    });
  });
})['catch'](function (error) {
  console.log('Error with processImport ' + error);
});
