"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var extract = _interopRequireWildcard(require("./extract"));

var converter = _interopRequireWildcard(require("./convert"));

var geolookup = _interopRequireWildcard(require("./geolookup"));

var database = _interopRequireWildcard(require("./database"));

var fs = require("fs");
require("es6-promise").polyfill();

var objectToInsert = {};
var path = process.argv[2];

var processCommand = function (path) {
  var promise = new Promise(function (resolve, reject) {
    var result = [];
    var exists = fs.existsSync(path);
    if (exists) {
      if (fs.statSync(path).isDirectory()) {
        fs.readdirSync(path).filter(function (file) {
          if (file.toLowerCase().substr(-4) === ".jpg" || file.toLowerCase().substr(-5) === ".jpeg") {
            result.push(path + "/" + file); //have to rebuild the path to the image's location
            resolve(result);
          }
        });
      } else if (fs.statSync(path).isFile()) {
        result.push(path);
        resolve(result);
      } else {
        reject(new Error("An error occured, path is not a file nor a folder: ", path));
        console.log(new Error("An error occured, path is not a file nor a folder: ", path));
      }
    } else {
      reject(new Error("Location specified does not exist: ", path));
      console.log(new Error("Location specified does not exist: ", path));
    }
  });
  return promise;
};

processCommand(path).then(function (files) {
  files.forEach(function (file) {
    extract.getGPSInformation(file).then(function (data) {
      var filenameInDatabase = file.split("/").pop();
      objectToInsert.filename = filenameInDatabase;
      objectToInsert.binary = "/binary/" + filenameInDatabase;
      return converter.convertGPSData(data);
    }).then(function (location) {
      objectToInsert.location = {
        type: "Point",
        coordinates: [location.latitude, location.longitude]
      };

      return geolookup.makeRequest(location);
    }).then(function (result) {
      objectToInsert.location.city = result.query.results.Result.city;
      objectToInsert.location.country = result.query.results.Result.country;
      return extract.getModelInformation(file);
    }).then(function (info) {
      objectToInsert.make = info.make;
      objectToInsert.model = info.model;
      objectToInsert.created = info.created;
      database.insert("JSON", objectToInsert);
      database.insert("JPEG", objectToInsert);
      //console.log(objectToInsert);
    });
  });
});
