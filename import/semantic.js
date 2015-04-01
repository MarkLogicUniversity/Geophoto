"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
"use strict";
/*
Module to do semantic operations. It also insert a Serverside JavaScript (sjs)
file to the MarkLogic modules database
*/

var utils = _interopRequireWildcard(require("./utils"));

var database = _interopRequireWildcard(require("./database"));

var connection = require("./connection").connection;

var fs = require("fs");
var marklogic = require("marklogic");
var db = marklogic.createDatabaseClient(connection);
var qb = marklogic.queryBuilder;

/*
this function tests for the existence of the module inserted
*/
var _moduleExists = function () {
  var promise = new Promise(function (resolve, reject) {
    db.config.extlibs.read("/ext/countries.sjs").result().then(function (response) {
      resolve(true);
    }, function (error) {
      resolve(false);
    });
  });
  return promise;
};

var _countryExists = function (country) {
  var sparqlQuery = ["PREFIX db: <http://dbpedia.org/resource/> PREFIX onto: <http://dbpedia.org/ontology/>", "ASK { db:" + country + " ?p ?o }"];
  return db.graphs.sparql("application/sparql-results+json", sparqlQuery.join("\n")).result();
};

var semantic = function () {
  _moduleExists().then(function (exists) {
    if (!exists) {
      db.config.extlibs.write({
        path: "/ext/countries.sjs",
        contentType: "application/vnd.marklogic-javascript",
        source: fs.createReadStream("../sjs/countries.sjs")
      }).result().then(function (response) {
        console.log("Installed module: " + response.path);
      })["catch"](function (error) {
        console.log("Error installing module " + error);
      });
    }
    database.getCountries().then(function (countries) {
      var uniqueCountries = utils.unique(countries);
      uniqueCountries.forEach(function (uniqueCountry) {
        _countryExists(uniqueCountry).then(function (result) {
          if (!result.boolean) {
            console.log("Calling semantic info for: " + uniqueCountry);
            return db.invoke({
              path: "/ext/countries.sjs",
              variables: { country: uniqueCountry }
            }).result(function (response) {
              console.log("RDF triple inserted " + response[0].value);
            }, function (error) {
              console.log(JSON.stringify(error, null, 2));
            });
          } else {
            console.log(uniqueCountry + " RDF triple already exists");
          }
        });
      });
    });
  });
};
exports.semantic = semantic;
