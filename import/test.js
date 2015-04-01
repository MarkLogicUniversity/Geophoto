var fs = require('fs');
var path = require('path');
var input = process.argv[2];
require("es6-promise").polyfill();
var extract = require("./extract");
var converter = require("./convert");
var geolookup = require("./geolookup");
var database = require("./database");
var semantic = require("./semantic");

var processImport = function (param) {
  var promise = new Promise(function (resolve, reject) {
    var exists = fs.existsSync(param);
    if (exists) {
      if (fs.statSync(param).isDirectory()) {
        fs.readdir(param, function (error, file) {
          if (error) {
            console.log(error);
          }
          var extension = path.extname(file).toLowerCase();
          if (extension === ".jpg" || extension === ".jpeg") {
            resolve(file); //returns an array
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
var obj = {};

processImport(input)
.then(function(files) {
  return files;
})
.then(function(files) {
  files.forEach(function(file) {
    file = input + '/' + file;

    extract.getinformation(file)
    .then(function(data) {
      obj.model = data.model;
      obj.make = data.make
      obj.created = data.created;
      return converter.convertGPSData(data.gps);
    })
    .then(function(converted) {
      obj.location = converted;
      //console.log(obj);
      return geolookup.makeRequest(obj)
    })
    .then(function(result) {
      console.log(result);
    })
  });
});



//
//
// var fs = require('fs');
// var marklogic = require('marklogic');
// var connection = {
//   host: 'localhost',
//   port: 5003,
//   user: 'admin',
//   password: 'admin'
// };
// require('es6-promise').polyfill();
// var db = marklogic.createDatabaseClient(connection);
// var qb = marklogic.queryBuilder;
//
//
// var _countryExists = function(country) {
//   var sparqlQuery = [
//   'PREFIX db: <http://dbpedia.org/resource/> PREFIX onto: <http://dbpedia.org/ontology/>',
//   'ASK { db:' + country + ' ?p ?o }'
//   ];
//   return db.graphs.sparql('application/sparql-results+json', sparqlQuery.join('\n')).result();
// };
//
// _countryExists('Colombia').then(function(result) {
//   console.log(result.boolean);
// });
//
//
// // // get countries
// //
// // function getCountries() {
// //   var countries = [];
// //   var promise = new Promise(function(resolve, reject) {
// //     db.documents.query(
// //       qb.where(
// //         qb.collection('image')
// //       )
// //       .orderBy(
// //         qb.sort('filename')
// //       )
// //       .slice(0,300) //return 300 documents "per page" (pagination)
// //     )
// //     .result()
// //     .then(function(documents) {
// //       documents.forEach(function(document) {
// //         countries.push(document.content.location.country.replace(" ", "_")); //also removing spaces
// //         resolve(countries);
// //       });
// //     });
// //   });
// //   return promise;
// // }
// //
// // var unique = function(array) {
// //     return array.reduce(function(accum, current) {
// //         if (accum.indexOf(current) < 0) {
// //             accum.push(current);
// //         }
// //         return accum;
// //     }, []);
// // };
// //
//
//
// // (1) Install the module in the modules database
// //     Note: You do not need to install on every invocation.
// //     It is included here to make the example self-contained.
// // var moduleExists = function() {
// //   var promise = new Promise(function(resolve, reject) {
// //     db.config.extlibs.read('/ext/countriexxs.sjs').result()
// //     .then(function(response) {
// //       resolve(true);
// //     }, function(error) {
// //       resolve(false);
// //     });
// //   });
// //   return promise;
// // }
// //
// // moduleExists().then(function(data) { console.log(data); });
// // db.config.extlibs.write({
// //   path: '/countries.sjs',
// //   contentType: 'application/vnd.marklogic-javascript',
// //   source: fs.createReadStream('/Users/tamaspiros/Desktop/tamas/countries.sjs')
// // }).result().then(function(response) {
// //   console.log('Installed module: ' + response.path);
//
//   // // (2) Invoke the module
//   // getCountries().then(function(countries) {
//   //   var uniqueCountries = unique(countries);
//   //   uniqueCountries.forEach(function(uniqueCountry) {
//   //     return db.invoke({
//   //       path: '/ext/' + response.path,
//   //       variables: {country: uniqueCountry}
//   //     }).result(function(response) {
//   //       console.log(JSON.stringify(response, null, 2));
//   //     }, function(error) {
//   //       console.log(JSON.stringify(error, null, 2));
//   //     });
//   //   });
//   //
//   // });
//
// // }, function(error) {
// //     console.log(JSON.stringify(error, null, 2));
// // });
//
//
// //
// //
// //
// //
// //
// //
// //
// //
// //
// // // var http = require('http');
// // //
// // // var location = {};
// // // location.latitude = 41.8915;
// // // location.longitude = 12.491667;
// // //
// // // var options = {
// // //   hostname: 'query.yahooapis.com',
// // //   path: '/v1/public/yql?q=select%20*%20from%20geo.placefinder%20where%20text%3D%22' + location.latitude + '%2C' + location.longitude + '%22%20and%20gflags%3D%22R%22&format=json',
// // //   method: 'GET'
// // // };
// // // http.request(options, function(res) {
// // //   console.log(res);
// // //   res.setEncoding('utf8');
// // //   res.on('data', function(chunk) {
// // //     console.log(chunk);
// // //   });
// // // });
// //
// // // req.on('error', function(error) {
// // //   console.log(error);
// // // });
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// // // var ExifImage  = require('exif-makernote-fix').ExifImage;
// // // function getGPSInformation(file) {
// // //   new ExifImage({ image: file}, function(error, exifData) {
// // //     console.log(exifData);
// // //   });
// // // };
// // //
// // // getGPSInformation('../data/photos/IMG_0132.jpg');
// //
//
// // var marklogic = require('marklogic');
// // var connection = {
// //   host: 'localhost',
// //   port: 5003,
// //   user: 'admin',
// //   password: 'admin'
// // };
// // var db = marklogic.createDatabaseClient(connection);
// // var qb = marklogic.queryBuilder;
// // var query = [
// //  'PREFIX db: <http://dbpedia.org/resource/>',
// //  'PREFIX onto: <http://dbpedia.org/ontology/>',
// //  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>',
// //  'PREFIX prop: <http://dbpedia.org/property/>',
// //  'SELECT * ',
// //  'WHERE {',
// //  'OPTIONAL { db:United_States onto:capital ?capital . }',
// //  'OPTIONAL { db:United_States prop:imageFlag ?imageFlag . }}'
// // ];
// //
// // //'OPTIONAL { db: "United States" prop:imageFlat ?imageFlag. }',
// // db.graphs.sparql('application/sparql-results+json', query.join('\n'))
// // .result(function(result) {
// //   // console.log(result.results.bindings[0].capital.value);
// //   console.log(result.results.bindings[0].capital.value);
// //   console.log(result.results.bindings[0].imageFlag.value);
// // }, function(error) {
// //   console.log(error);
// // });
