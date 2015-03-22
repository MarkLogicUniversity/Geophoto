"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
"use strict";
require("es6-promise").polyfill();
var ExifImage = require("exif-makernote-fix").ExifImage;
var getGPSInformation = function (file) {
  var promise = new Promise(function (resolve, reject) {
    new ExifImage({ image: file }, function (error, exifData) {
      if (error) {
        console.log("Error with ExifImage library: ", error);
        reject(new Error("Error", error));
      } else {
        if (Object.getOwnPropertyNames(exifData.gps).length === 0) {
          console.log("No GPS information for image: " + file);
          resolve("No GPS information for image: " + file);
        } else {
          resolve(exifData.gps);
        }
      }
    });
  });
  return promise;
};

exports.getGPSInformation = getGPSInformation;
var getModelInformation = function (file) {
  var promise = new Promise(function (resolve, reject) {
    new ExifImage({ image: file }, function (error, exifData) {
      if (error) {
        console.log("Error with ExifImage library: ", error);
        reject(new Error("Error", error));
      } else {
        var match = exifData.exif.CreateDate.match(/^(\d+)\:(\d+)\:(\d+) (\d+)\:(\d+)\:(\d+)$/);
        var created = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]).getTime();
        var info = {};
        info.make = exifData.image.Make;
        info.model = exifData.image.Model;
        info.created = created;
        resolve(info);
      }
    });
  });
  return promise;
};
exports.getModelInformation = getModelInformation;
