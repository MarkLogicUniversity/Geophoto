'use strict';
/**
 * ======================
 * Exif to NoSQL conversion
 * ======================
 * Takes a path as the first argument and gathers all
 * JPEG images (Exif is onlysupported in JPEG  and TIFF images
 * (JPEG 2000, png and gif are *not* supported))
 *
 * The GPS data is stored as an array of numbers - e.g.:
 * GPSLatitude: [ 10, 25, 22.682 ] - these numbers represent degrees,
 * minutes and seconds. In order for databases to understand these values
 * they need to be converted to decimal numbers.
 *
 * If the GPSLatitudeRef is South (or in other words, if the
 * Latitude Degree is between 0 and -90) the sign of the decimal
 * number changes. Also, if the GPSLongitudeRef is West
 * (or again, if the Longitude Degree is between 0 and -180) the sign of
 * the decimal number changes.
 *
 * Here's a very basic system to help you visualise the sign change:
 *      N (+)
 *  E (+)   W (-)
 *      S  (-)
 *
 * The Exif information is extracted using
 * this node module: https://github.com/gomfunkel/node-exif
 *
 * TODO: (homework?)
 *  - check for already existing image in db
 *  - add index after all data has been loaded
 *  - stop listening for events when all data has been loaded
 *  - recursive folder navigation
 */

var fs = require('fs'),
    ExifImage = require('exif').ExifImage,
    marklogic =require('./../node-client-api/lib/marklogic.js'),
    connection = require('./../dbsettings').connection,
    db = marklogic.createDatabaseClient(connection),
    q = marklogic.queryBuilder;

    // function to insert data into the database
    var insertData = function insertData(data, path) {
        if(path.toLowerCase().substr(-4) === '.jpg' || path.toLowerCase().substr(-5) === '.jpeg') {
            var file = path;
        } else {
            var file = path + '/' + data.filename;
        }

        db.documents.write({
            uri: '/image/' + data.filename + '.json',
            contentType: 'application/json',
            collections: ['image'],
            content: data
        }).result(function (response) {
            console.log('Successfully inserted ', response.documents[0].uri);
        });

        db.documents.write({
            uri: '/binary/' + data.filename,
            contentType: 'image/jpeg',
            collections: ['binary'],
            content: fs.readFileSync(file)
        }).result(function (response) {
            console.log('Successfully inserted ', response.documents[0].uri);
        });
    }

    // function to convert degrees, minutes and seconds to decimal values
    var convertDegreesToDecimal = function convertDegreesToDecimal(degree, minute, second, sign) {
        var absoluteDegree,
            absoluteMinute,
            absoluteSecond,
            decimal;

        // make sure that all arguments are provided
        if (degree && minute && second && sign) {

            // convert values to decimals
            absoluteDegree = Math.abs(Math.round(degree * 1000000));
            absoluteMinute = Math.abs(Math.round(minute * 1000000));
            absoluteSecond = Math.abs(Math.round(second * 1000000));
            decimal = Math.round(absoluteDegree + (absoluteMinute/60) + (absoluteSecond/3600)) * sign/1000000
            return decimal;
        } else {
            console.log('Missing arguments - please provide degrees, minutes, seconds and a sign');
        }
    }

    // function to extract GPS data and convert that to decimal lat/long values
    var extractAndConvertGPSData = function extractAndConvertGPSData(location) {

        // only progress if the location is a valid data object
        if (typeof location === 'object') {

            // everything south of the equator has a negative latitude value
            if (location.latitudeReference === 'S') {
                location.latitude[0] = -location.latitude[0];
            }

            // everything west from the prime meridian has a negative longitude value
            if (location.longitudeReference === 'W') {
                location.longitude[0] = -location.longitude[0];
            }

            // the object that will hold the new, decimal lat/long pair
            var decimalLocation = {};
            var absoluteDegreeLatitude = Math.abs(Math.round(location.latitude[0] * 1000000));
            var absoluteMinuteLatitude = Math.abs(Math.round(location.latitude[1] * 1000000));
            var absoluteSecondLatitude = Math.abs(Math.round(location.latitude[2] * 1000000));

            var absoluteDegreeLongitude = Math.abs(Math.round(location.longitude[0] * 1000000));
            var absoluteMinuteLongitude = Math.abs(Math.round(location.longitude[1] * 1000000));
            var absoluteSecondLongitude = Math.abs(Math.round(location.longitude[2] * 1000000));

            var latitudeSign = location.latitude[0] < 0 ? -1 : 1;
            var longitudeSign = location.longitude[0] < 0 ? -1 : 1;

            decimalLocation.latitude =     Math.round(absoluteDegreeLatitude + (absoluteMinuteLatitude/60) + (absoluteSecondLatitude/3600)) * latitudeSign/1000000;
            decimalLocation.longitude = Math.round(absoluteDegreeLongitude + (absoluteMinuteLongitude/60) + (absoluteSecondLongitude/3600)) * longitudeSign/1000000;
            return decimalLocation;
        }
    }

    /**
     * function that extracts GPS information from the file(s) using the ExifImage library
     * it also builds up a location object (this is a sample):
     *
     * location = {
     *  latitude: [11, 22, 33.44],
     *  latitudeReference = S,
     *  longitude: [44, 33, 22.11],
     *  longitudeReference = W
     * }
     *
     */
    var getGPSInfo = function getGPSInfo(loc, callback) {

        // if the supplied first argument is a directory, loop through it
        if (typeof loc === 'object') {
            loc.forEach(function(file) {

                // convert the content of the image file to binary
                // this is later used in HTML as <img src="data:image/jpg;base64,[binary]>
                // var binary = new Buffer(fs.readFileSync(file), 'binary').toString('base64');
                new ExifImage({ image: file}, function(error, exifData) {
                    if (error) {
                        console.log('Error with ExifImage library: ' + error);
                    } else {
                        if (Object.getOwnPropertyNames(exifData.gps).length === 0) {
                            console.log('No GPS information for image: ' + file);
                        } else {
                            var location = {};
                            var gpsData = exifData.gps;
                            location.latitude = gpsData.GPSLatitude;
                            location.latitudeReference = gpsData.GPSLatitudeRef;
                            location.longitude = gpsData.GPSLongitude;
                            location.longitudeReference = gpsData.GPSLongitudeRef;

                            var extractedLocation = extractAndConvertGPSData(location);
                            var filenameInDatabase = file.split('/').pop();
                            callback({
                                filename: filenameInDatabase,
                                location: {
                                    type: 'Point',
                                    coordinates: [extractedLocation.latitude, extractedLocation.longitude]
                                },
                                binary: '/binary/' + filenameInDatabase
                            });
                            console.log('Successfully extracted GPS information from ' + file);
                        }
                    }
                });
            });
        }
        // handle single files as well that have jpg and jpeg extensions
        else if (loc.toLowerCase().substr(-4) === '.jpg' || loc.toLowerCase().substr(-5) === '.jpeg') {
            // convert the content of the image file to binary
            // this is later used in HTML as <img src="data:image/jpg;base64,[binary]>
            // var binary = new Buffer(fs.readFileSync(loc), 'binary').toString('base64');

            new ExifImage({ image: loc}, function(error, exifData) {
                if (error) {
                    console.log('Error with ExifImage library: ' + error);
                } else {
                    if (Object.getOwnPropertyNames(exifData.gps).length === 0) {
                        console.log('No GPS information for image: ' + loc);
                    } else {
                        var location = {};
                        var gpsData = exifData.gps;
                        location.latitude = gpsData.GPSLatitude;
                        location.latitudeReference = gpsData.GPSLatitudeRef;
                        location.longitude = gpsData.GPSLongitude;
                        location.longitudeReference = gpsData.GPSLongitudeRef;
                        var extractedLocation = extractAndConvertGPSData(location);
                        var filenameInDatabase = loc.split('/').pop();;
                        callback({
                            filename: filenameInDatabase,
                            location: {
                                type: 'Point',
                                coordinates: [extractedLocation.latitude, extractedLocation.longitude]
                            },
                            binary: '/binary/' + filenameInDatabase
                        });
                        console.log('Successfully extracted GPS information from ' + loc);
                    }
                }
            });
        }
    }

    // function to run the import process
    var importProcess = function importProcess(callback) {
        // get the path as the first agrument
        var arg = process.argv[2],

                // make sure the argument exists (either file or folder)
                exists = fs.existsSync(arg),

                // store the collection of files in an array
                files = [];

        if (exists) {

            // check whether the path is a directory
            if (fs.statSync(arg).isDirectory()) {
                fs.readdirSync(arg).filter(function(file) {
                    // only process files with jpg extension
                    if (file.toLowerCase().substr(-4) === '.jpg' || file.toLowerCase().substr(-5) === '.jpeg') {
                        files.push(arg + '/' + file);
                    }
                });

                // extract the GPS data out of the files
                getGPSInfo(files, function(data) {

                    // insert data to database
                    insertData(data, arg);
                });
            }

            // handle the scenario where the argument is a file
            else if (fs.statSync(arg).isFile()) {

                // extract GPS data out of one file
                getGPSInfo(arg, function(data) {
                    // insert data to database
                    insertData(data, arg);
                });
            }
        }

        // invalid or no argument provided
        else {
            arg = arg === undefined ? 'not supplied' : arg;
            console.log('The argument ' + arg + ' is not a valid path/file.');
            process.exit(1);
        }
    }
    // run the app
    importProcess();
