'use strict';

const ExifImage = require('exif-makernote-fix').ExifImage;
const Promise   = require('bluebird');
const https     = require('https');
const fs        = require('fs');

module.exports = class MetaDataExtractor {
  constructor(image) {
    this.image = image;
  }

  getData() {
    let city = '';
    let country = '';
    return new Promise((resolve, reject) => {
      let data = {};
      this._getImageMetadata(this.image)
      .then((metadata) => {
        data.make = metadata.make;
        data.model = metadata.model;
        data.created = metadata.created;
        return this._convertGPSToDecimal(metadata.gps);
      })
      .then((decimalLocation) => {
        data.location = {};
        data.location.type = 'Point';
        data.location.coordinates = [decimalLocation.latitude, decimalLocation.longitude];
        return data.location.coordinates;
      })
      .then((coordinates) => {
        return this._reverseGeoLookup(coordinates[0], coordinates[1]);
      })
      .then((reverseGeoLookup) => {
        reverseGeoLookup.results[0].address_components
        .filter((components) => {
          return components.types.indexOf('locality') > -1;
        })
        .map((locality) => {
          city = locality.long_name;
        });

        reverseGeoLookup.results[0].address_components
        .filter((components) => {
          return components.types.indexOf('country') > -1;
        })
        .map((countryComponent) => {
          country = countryComponent.long_name;
        });

        data.location.city = city;
        data.location.country = country;
        resolve(data);
      })
      .catch((error) => {
        reject(error);
        console.log(error)
      });
    });
  }

  _getImageMetadata() {
    return new Promise((resolve, reject) => {
      new ExifImage({ image: this.image }, (error, exifData) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          if (Object.getOwnPropertyNames(exifData.gps).length === 0) {
            reject('No GPS information for image: ' + this.image);
            fs.unlink(this.image, (error, undefined) => {
              if (error) {
                console.log(error);
              }
              console.log('Temporary imaga ' + this.image + ' deleted');
            });
          } else {
            var match = exifData.exif.CreateDate.match(/^(\d+)\:(\d+)\:(\d+) (\d+)\:(\d+)\:(\d+)$/);
            var created = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]).getTime();
            var metadata = {};
            metadata.make = exifData.image.Make;
            metadata.model = exifData.image.Model;
            metadata.created = created;
            metadata.gps = exifData.gps
            resolve(metadata);
          }
        }
      });
    });
  }

  _convertGPSToDecimal(gps) {
    // do the GPS maths
    if (gps.GPSLatitudeRef === 'S') {
      gps.GPSLatitude[0] = -gps.GPSLatitude[0];
    }

    if (gps.GPSLongitudeRef === 'W') {
      gps.GPSLongitude[0] = -gps.GPSLongitude[0];
    }

    var decimalLocation = {};
    var absoluteDegreeLatitude = Math.abs(Math.round(gps.GPSLatitude[0] * 1000000));
    var absoluteMinuteLatitude = Math.abs(Math.round(gps.GPSLatitude[1] * 1000000));
    var absoluteSecondLatitude = Math.abs(Math.round(gps.GPSLatitude[2] * 1000000));

    var absoluteDegreeLongitude = Math.abs(Math.round(gps.GPSLongitude[0] * 1000000));
    var absoluteMinuteLongitude = Math.abs(Math.round(gps.GPSLongitude[1] * 1000000));
    var absoluteSecondLongitude = Math.abs(Math.round(gps.GPSLongitude[2] * 1000000));

    var latitudeSign = gps.GPSLatitude[0] < 0 ? -1 : 1;
    var longitudeSign = gps.GPSLongitude[0] < 0 ? -1 : 1;

    decimalLocation.latitude = Math.round(absoluteDegreeLatitude + (absoluteMinuteLatitude/60) + (absoluteSecondLatitude/3600)) * latitudeSign/1000000;
    decimalLocation.longitude = Math.round(absoluteDegreeLongitude + (absoluteMinuteLongitude/60) + (absoluteSecondLongitude/3600)) * longitudeSign/1000000;
    return {
      latitude: decimalLocation.latitude,
      longitude: decimalLocation.longitude
    }
  }

  _reverseGeoLookup(latitude, longitude) {
    const key = '';
    var options = {
      hostname: 'maps.googleapis.com',
      path: '/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&key=' + key,
      method: 'GET'
    };

    var promiseRequest = Promise.method((options) => {
      return new Promise((resolve, reject) => {
        var request = https.request(options, (response) => {
          // Bundle the result
          var result = '';

          // Build the body
          response.on('data', (chunk) => {
            result += chunk;
          });

          // Resolve the promise when the response ends
          response.on('end', () => {
            var data = JSON.parse(result);
            resolve(data);
          });
        });

        // Handle errors
        request.on('error', (error) => {
          console.log('Problem with request:', error.message);
          reject(error);
        });

        // Must always call .end() even if there is no data being written to the request body
        request.end();
      });
    });

    return promiseRequest(options);
  }

}
