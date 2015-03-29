var fs = require('fs');
var marklogic = require('marklogic');
var connection = {
  host: 'localhost',
  port: 5003,
  user: 'admin',
  password: 'admin'
};
require('es6-promise').polyfill();
var db = marklogic.createDatabaseClient(connection);
var qb = marklogic.queryBuilder;
// get countries

function getCountries() {
  var countries = [];
  var promise = new Promise(function(resolve, reject) {
    db.documents.query(
      qb.where(
        qb.collection('image')
      )
      .orderBy(
        qb.sort('filename')
      )
      .slice(0,300) //return 300 documents "per page" (pagination)
    )
    .result()
    .then(function(documents) {
      documents.forEach(function(document) {
        countries.push(document.content.location.country.replace(" ", "_")); //also removing spaces
        resolve(countries);
      });
    });
  });
  return promise;
}

var unique = function(array) {
    return array.reduce(function(accum, current) {
        if (accum.indexOf(current) < 0) {
            accum.push(current);
        }
        return accum;
    }, []);
};

// (1) Install the module in the modules database
//     Note: You do not need to install on every invocation.
//     It is included here to make the example self-contained.
db.config.extlibs.write({
  path: '/countries.sjs',
  contentType: 'application/vnd.marklogic-javascript',
  source: fs.createReadStream('/Users/tamaspiros/Desktop/tamas/countries.sjs')
}).result().then(function(response) {
  console.log('Installed module: ' + response.path);

  // // (2) Invoke the module
  // getCountries().then(function(countries) {
  //   var uniqueCountries = unique(countries);
  //   uniqueCountries.forEach(function(uniqueCountry) {
  //     return db.invoke({
  //       path: '/ext/' + response.path,
  //       variables: {country: uniqueCountry}
  //     }).result(function(response) {
  //       console.log(JSON.stringify(response, null, 2));
  //     }, function(error) {
  //       console.log(JSON.stringify(error, null, 2));
  //     });
  //   });
  //
  // });

}, function(error) {
    console.log(JSON.stringify(error, null, 2));
});


//
//
//
//
//
//
//
//
//
// // var http = require('http');
// //
// // var location = {};
// // location.latitude = 41.8915;
// // location.longitude = 12.491667;
// //
// // var options = {
// //   hostname: 'query.yahooapis.com',
// //   path: '/v1/public/yql?q=select%20*%20from%20geo.placefinder%20where%20text%3D%22' + location.latitude + '%2C' + location.longitude + '%22%20and%20gflags%3D%22R%22&format=json',
// //   method: 'GET'
// // };
// // http.request(options, function(res) {
// //   console.log(res);
// //   res.setEncoding('utf8');
// //   res.on('data', function(chunk) {
// //     console.log(chunk);
// //   });
// // });
//
// // req.on('error', function(error) {
// //   console.log(error);
// // });
//
//
//
//
//
//
//
//
//
//
// // var ExifImage  = require('exif-makernote-fix').ExifImage;
// // function getGPSInformation(file) {
// //   new ExifImage({ image: file}, function(error, exifData) {
// //     console.log(exifData);
// //   });
// // };
// //
// // getGPSInformation('../data/photos/IMG_0132.jpg');
//

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
