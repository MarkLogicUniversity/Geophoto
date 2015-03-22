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
