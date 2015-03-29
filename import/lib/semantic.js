"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var utils = _interopRequireWildcard(require("./utils"));

var database = _interopRequireWildcard(require("./database"));

var connection = require("./connection").connection;

var fs = require("fs");
var marklogic = require("marklogic");
var db = marklogic.createDatabaseClient(connection);
var qb = marklogic.queryBuilder;

var semantic = function () {
  database.getCountries().then(function (countries) {
    var uniqueCountries = utils.unique(countries);
    uniqueCountries.forEach(function (uniqueCountry) {
      console.log("Calling semantic info for: " + uniqueCountry);
      return db.invoke({
        path: "/ext/countries.sjs",
        variables: { country: uniqueCountry }
      }).result(function (response) {
        console.log("RDF triple inserted " + response[0].value);
      }, function (error) {
        console.log(JSON.stringify(error, null, 2));
      });
    });
  });
};

// db.config.extlibs.write({
//   path: '/countries.sjs',
//   contentType: 'application/vnd.marklogic-javascript',
//   source: fs.createReadStream('/Users/tamaspiros/Desktop/tamas/countries.sjs')
// }).result().then((response) => {
//   console.log('Installed module: ' + response.path);
//
//   // (2) Invoke the module
//   database.getCountries().then((countries) => {
//     var uniqueCountries = utils.unique(countries);
//     uniqueCountries.forEach(function(uniqueCountry) {
//       return db.invoke({
//         path: '/ext/' + response.path,
//         variables: {country: uniqueCountry}
//       }).result((response) => {
//         console.log(JSON.stringify(response, null, 2));
//       }, (error) => {
//         console.log(JSON.stringify(error, null, 2));
//       });
//     });
//
//     });
//
//   }, (error) => {
//       console.log(JSON.stringify(error, null, 2));
//   });
// };
exports.semantic = semantic;
