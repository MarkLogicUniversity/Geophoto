'use strict';
Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

/*
Module to do semantic operations. It also insert a Serverside JavaScript (sjs)
file to the MarkLogic modules database
*/

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var _database = require('./database');

var database = _interopRequireWildcard(_database);

var _connection = require('./connection');

var fs = require('fs');
var marklogic = require('marklogic');
var db = marklogic.createDatabaseClient(_connection.connection);
var qb = marklogic.queryBuilder;

/*
this function tests for the existence of the module inserted
*/
var _moduleExists = function _moduleExists() {
  var promise = new Promise(function (resolve, reject) {
    db.config.extlibs.read('/ext/countries.sjs').result().then(function (response) {
      resolve(true);
    }, function (error) {
      resolve(false);
    });
  });
  return promise;
};

var _countryExists = function _countryExists(country) {
  var sparqlQuery = ['PREFIX db: <http://dbpedia.org/resource/> PREFIX onto: <http://dbpedia.org/ontology/>', 'ASK { db:' + country + ' ?p ?o }'];
  return db.graphs.sparql('application/sparql-results+json', sparqlQuery.join('\n')).result();
};

var semantic = function semantic() {
  _moduleExists().then(function (exists) {
    if (!exists) {
      db.config.extlibs.write({
        path: '/ext/countries.sjs',
        contentType: 'application/vnd.marklogic-javascript',
        source: fs.createReadStream('../sjs/countries.sjs')
      }).result().then(function (response) {
        console.log('Installed module: ' + response.path);
      })['catch'](function (error) {
        console.log('Error installing module ' + error);
      });
    }
    database.getCountries().then(function (countries) {
      var uniqueCountries = utils.unique(countries);
      uniqueCountries.forEach(function (uniqueCountry) {
        _countryExists(uniqueCountry).then(function (result) {
          if (!result.boolean) {
            console.log('Calling semantic info for: ' + uniqueCountry);
            return db.invoke({
              path: '/ext/countries.sjs',
              variables: { country: uniqueCountry }
            }).result(function (response) {
              console.log('RDF triple inserted ' + response[0].value);
            }, function (error) {
              console.log(JSON.stringify(error, null, 2));
            });
          } else {
            console.log(uniqueCountry + ' RDF triple already exists');
          }
        });
      });
    });
  });
};
exports.semantic = semantic;
