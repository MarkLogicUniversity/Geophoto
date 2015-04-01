'use strict';
import * as extract from './extract';
import * as converter from './convert';
import * as geolookup from './geolookup';
import * as database from './database';
import * as semantic from './semantic';

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
var processImport = (param) => {
  var promise = new Promise((resolve, reject) => {
    var result = [];
    var exists = fs.existsSync(param);
    if (exists) {
      if (fs.statSync(param).isDirectory()) {
        fs.readdirSync(param).filter(file => {
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

processImport(param)
.then(files => {
  var counterValid = 0; //counter for the number of inserted json docs
  var counter = 0; //counter for the currently inserted json docs
  files.forEach(file => {
    extract.getGPSInformation(file) //extract GPS information for the files
    .then(GPSData => {
      counterValid++; //only insert files that have GPS Data
      extract.getModelInformation(file) //extract model and make info
      .then(ModelData => {
        converter.convertGPSData(GPSData) //convert GPS data
        .then(location => {
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
            database.insert('JSON', '', objectToInsert)
            .then(response => {
              console.log('JSON file inserted ', response.documents[0].uri);
            })
            .catch(error => {
              console.log(error);
            });
            database.insert('JPEG', file, objectToInsert)
            .then(response => {
              console.log('JPEG file inserted ', response.documents[0].uri);
            })
            .catch(error => {
              console.log(error);
            });
          } else if (!offline && offline !== 'offline') { // if the 'offline' parameter was not passed in
            geolookup.makeRequest(location)
            .then(result => {
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
              database.insert('JSON', '', objectToInsert)
              .then(response => {
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
              })
              .catch(error => {
                console.log(error);
              });
              database.insert('JPEG', file, objectToInsert)
              .then(response => {
                console.log('JPEG file inserted ', response.documents[0].uri);
              })
              .catch(error => {
                console.log(error);
              });
            }).
            catch(error => {
              console.log(error);
            });
          }
        })
        .catch(error => {
          console.log('Error with convertGPSData ' + error);
        });
      })
      .catch(error => {
        console.log('Error with getModelInformation ' + error);
      });
    })
    .catch(error => {
      console.log('Error with getGPSInformation ' + error);
    });
  });
})
.catch(error => {
  console.log('Error with processImport ' + error);
});
