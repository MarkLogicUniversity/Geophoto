var http = require('http');

var location = {};
location.latitude = 41.8915;
location.longitude = 12.491667;

var options = {
  hostname: 'query.yahooapis.com',
  path: '/v1/public/yql?q=select%20*%20from%20geo.placefinder%20where%20text%3D%22' + location.latitude + '%2C' + location.longitude + '%22%20and%20gflags%3D%22R%22&format=json',
  method: 'GET'
};
http.request(options, function(res) {
  console.log(res);
  res.setEncoding('utf8');
  res.on('data', function(chunk) {
    console.log(chunk);
  });
});

// req.on('error', function(error) {
//   console.log(error);
// });










// var ExifImage  = require('exif-makernote-fix').ExifImage;
// function getGPSInformation(file) {
//   new ExifImage({ image: file}, function(error, exifData) {
//     console.log(exifData);
//   });
// };
//
// getGPSInformation('../data/photos/IMG_0132.jpg');


// var marklogic = require('marklogic');
// var connection = {
//   host: 'localhost',
//   port: 5003,
//   user: 'admin',
//   password: 'admin'
// };
// var db = marklogic.createDatabaseClient(connection);
// var qb = marklogic.queryBuilder;
// var query = [
//  'PREFIX db: <http://dbpedia.org/resource/>',
//  'PREFIX onto: <http://dbpedia.org/ontology/>',
//  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>',
//  'PREFIX prop: <http://dbpedia.org/property/>',
//  'SELECT * ',
//  'WHERE {',
//  'OPTIONAL { db:United_States onto:capital ?capital . }',
//  'OPTIONAL { db:United_States prop:imageFlag ?imageFlag . }}'
// ];
//
// //'OPTIONAL { db: "United States" prop:imageFlat ?imageFlag. }',
// db.graphs.sparql('application/sparql-results+json', query.join('\n'))
// .result(function(result) {
//   // console.log(result.results.bindings[0].capital.value);
//   console.log(result.results.bindings[0].capital.value);
//   console.log(result.results.bindings[0].imageFlag.value);
// }, function(error) {
//   console.log(error);
// });
