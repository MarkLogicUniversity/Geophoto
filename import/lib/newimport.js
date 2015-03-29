"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var extract = _interopRequireWildcard(require("./extract"));

var converter = _interopRequireWildcard(require("./convert"));

var geolookup = _interopRequireWildcard(require("./geolookup"));

var database = _interopRequireWildcard(require("./database"));

var semantic = _interopRequireWildcard(require("./semantic"));

var fs = require("fs");
var path = require("path");
require("es6-promise").polyfill();

var param = process.argv[2];
var offline = process.argv[3];
var uri = "";
var objectToInsert = {};

var processCommand = function (param) {
  var promise = new Promise(function (resolve, reject) {
    var result = [];
    var exists = fs.existsSync(param);
    if (exists) {
      if (fs.statSync(param).isDirectory()) {
        fs.readdirSync(param).filter(function (file) {
          var extension = path.extname(file).toLowerCase();
          if (extension === ".jpg" || extension === ".jpeg") {
            result.push(param + "/" + file);
            resolve(result);
          }
        });
      } else if (fs.statSync(param).isFile()) {
        var extension = path.extname(param).toLowerCase();
        if (extension === ".jpg" || extension === ".jpeg") {
          result.push(param);
          resolve(result);
        }
      } else {
        reject(new Error("An error occured, path is not a file nor a folder: " + path));
      }
    } else {
      reject(new Error("Location specified does not exist: " + param));
    }
  });
  return promise;
};

processCommand(param).then(function (files) {
  var counterValid = 0;
  var counter = 0;
  files.forEach(function (file) {
    extract.getGPSInformation(file).then(function (GPSData) {
      counterValid++;
      extract.getModelInformation(file).then(function (ModelData) {
        converter.convertGPSData(GPSData).then(function (location) {
          if (!offline) {
            geolookup.makeRequest(location).then(function (result) {
              //build up JSON object that will be inserted to the database
              uri = file.split("/").pop().replace(/[&\/\\#,+()$~%'":*?<>{} ]/g, "");
              objectToInsert.originalFilename = file;
              objectToInsert.filename = uri;
              objectToInsert.binary = "/binary/" + uri;
              objectToInsert.make = ModelData.make;
              objectToInsert.model = ModelData.model;
              objectToInsert.created = ModelData.created;
              objectToInsert.location = {
                type: "Point",
                coordinates: [result.latitude, result.longitude],
                city: result.city,
                country: result.country
              };
              database.insert("JSON", "", objectToInsert).then(function (response) {
                console.log("JSON file inserted ", response.documents[0].uri);
                counter++;
                if (counter === counterValid) {
                  semantic.semantic();
                }
              })["catch"](function (error) {
                console.log(error);
              });
              database.insert("JPEG", param, objectToInsert).then(function (response) {
                console.log("JPEG file inserted ", response.documents[0].uri);
              })["catch"](function (error) {
                console.log(error);
              });
            })["catch"](function (error) {
              console.log(error);
            });
          } else {
            uri = file.split("/").pop().replace(/[&\/\\#,+()$~%'":*?<>{} ]/g, "");
            objectToInsert.originalFilename = file;
            objectToInsert.filename = uri;
            objectToInsert.binary = "/binary/" + uri;
            objectToInsert.make = ModelData.make;
            objectToInsert.model = ModelData.model;
            objectToInsert.created = ModelData.created;
            objectToInsert.location = {
              type: "Point",
              coordinates: [location.latitude, location.longitude]
            };
            database.insert("JSON", "", objectToInsert).then(function (response) {
              console.log("JSON file inserted ", response.documents[0].uri);
            })["catch"](function (error) {
              console.log(error);
            });
            database.insert("JPEG", param, objectToInsert).then(function (response) {
              console.log("JPEG file inserted ", response.documents[0].uri);
            })["catch"](function (error) {
              console.log(error);
            });
          }
        });
      });
    });
  });
});
