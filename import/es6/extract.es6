'use strict';
/*
Module to extract GPS data and Model/Make/date information
*/

require('es6-promise').polyfill();
var ExifImage  = require('exif-makernote-fix').ExifImage;

export var getGPSInformation = file => {
  var promise = new Promise((resolve, reject) => {
    new ExifImage({ image: file }, (error, exifData) => {
      if (error) {
        reject(console.log(error));
      } else {
        if (Object.getOwnPropertyNames(exifData.gps).length === 0) {
          reject(new Error('No GPS information for image: ' + file));
        } else {
          resolve(exifData.gps);
        }
      }
    });
  });
  return promise;
};

export var getModelInformation = file => {
  var promise = new Promise((resolve, reject) => {
    new ExifImage({ image: file}, (error, exifData) => {
      if (error) {
        reject(console.log(error));
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
