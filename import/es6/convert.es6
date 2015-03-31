'use strict';
/*
Module to convert EXIF GPS data to decimal numbers
*/

require('es6-promise').polyfill();

export var convertGPSData = location => {
  var promise = new Promise((resolve, reject) => {
    if (typeof location === 'object') {

      if (location.GPSLatitudeRef === 'S') {
        location.GPSLatitude[0] = -location.GPSLatitude[0];
      }

      if (location.GPSLongitudeRef === 'W') {
        location.GPSLongitude[0] = -location.GPSLongitude[0];
      }

      var decimalLocation         = {};
      var absoluteDegreeLatitude  = Math.abs(Math.round(location.GPSLatitude[0] * 1000000));
      var absoluteMinuteLatitude  = Math.abs(Math.round(location.GPSLatitude[1] * 1000000));
      var absoluteSecondLatitude  = Math.abs(Math.round(location.GPSLatitude[2] * 1000000));

      var absoluteDegreeLongitude = Math.abs(Math.round(location.GPSLongitude[0] * 1000000));
      var absoluteMinuteLongitude = Math.abs(Math.round(location.GPSLongitude[1] * 1000000));
      var absoluteSecondLongitude = Math.abs(Math.round(location.GPSLongitude[2] * 1000000));

      var latitudeSign            = location.GPSLatitude[0] < 0 ? -1 : 1;
      var longitudeSign           = location.GPSLongitude[0] < 0 ? -1 : 1;

      decimalLocation.latitude  = Math.round(absoluteDegreeLatitude + (absoluteMinuteLatitude/60) + (absoluteSecondLatitude/3600)) * latitudeSign/1000000;
      decimalLocation.longitude = Math.round(absoluteDegreeLongitude + (absoluteMinuteLongitude/60) + (absoluteSecondLongitude/3600)) * longitudeSign/1000000;

      resolve(decimalLocation); //notice promise resolve

    } else {
      reject('Error: parameter is not of type location but ', typeof location);
    }
  });
  return promise;
}
