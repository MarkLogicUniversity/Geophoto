'use strict';
import * as extract from './extract';
import * as converter from './convert';
import * as geolookup from './geolookup';
import * as database from './database';
import * as semantic from './semantic';

var fs = require('fs');
var path = require('path');
require('es6-promise').polyfill();

var param = process.argv[2];
var offline = process.argv[3];
var uri = '';
var objectToInsert = {};

var processCommand = (param) => {
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

processCommand(param)
.then(files => {
  var counterValid = 0;
  var counter = 0;
  files.forEach(file => {
    extract.getGPSInformation(file)
    .then(GPSData => {
      counterValid++;
      extract.getModelInformation(file)
      .then(ModelData => {
        converter.convertGPSData(GPSData)
        .then(location => {
          if (!offline) {
            geolookup.makeRequest(location)
            .then(result => {
              //build up JSON object that will be inserted to the database
                uri = file.split('/').pop().replace(/[&\/\\#,+()$~%'":*?<>{} ]/g, '');
                objectToInsert.originalFilename = file;
                objectToInsert.filename = uri;
                objectToInsert.binary = '/binary/' + uri;
                objectToInsert.make = ModelData.make;
                objectToInsert.model = ModelData.model;
                objectToInsert.created = ModelData.created;
                objectToInsert.location = {
                  type: 'Point',
                  coordinates: [result.latitude, result.longitude],
                  city: result.city,
                  country: result.country
                };
                database.insert('JSON', '', objectToInsert)
                .then(response => {
                  console.log('JSON file inserted ', response.documents[0].uri);
                  counter++;
                  if (counter === counterValid) {
                    semantic.semantic();
                  }
                })
                .catch(error => {
                  console.log(error);
                });
                database.insert('JPEG', param, objectToInsert)
                .then(response => {
                  console.log('JPEG file inserted ', response.documents[0].uri);
                })
                .catch(error => {
                  console.log(error);
                });
            })
            .catch(error => {
              console.log(error);
            });
          } else {
            uri = file.split('/').pop().replace(/[&\/\\#,+()$~%'":*?<>{} ]/g, '');
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
              console.log('JSON file inserted ', response.documents[0].uri)
            })
            .catch(error => {
              console.log(error);
            });
            database.insert('JPEG', param, objectToInsert)
            .then(response => {
              console.log('JPEG file inserted ', response.documents[0].uri);
            })
            .catch(error => {
              console.log(error);
            });
          }
        });
      });
    });
  });
});
