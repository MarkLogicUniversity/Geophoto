'use strict';
/*
Module to do semantic operations. It also insert a Serverside JavaScript (sjs)
file to the MarkLogic modules database
*/

import * as utils from './utils';
import * as database from './database';
import {connection} from './connection';

var fs = require('fs');
var marklogic = require('marklogic');
var db = marklogic.createDatabaseClient(connection);
var qb = marklogic.queryBuilder;

/*
this function tests for the existence of the module inserted
*/
var _moduleExists = () => {
  var promise = new Promise((resolve, reject) => {
    db.config.extlibs.read('/ext/countries.sjs').result()
    .then((response) => {
      resolve(true);
    }, (error) => {
      resolve(false);
    });
  });
  return promise;
}

var _countryExists = (country) => {
  var sparqlQuery = [
  'PREFIX db: <http://dbpedia.org/resource/> PREFIX onto: <http://dbpedia.org/ontology/>',
  'ASK { db:' + country + ' ?p ?o }'
  ];
  return db.graphs.sparql('application/sparql-results+json', sparqlQuery.join('\n')).result();
};

export var semantic = () => {
  _moduleExists().then(function(exists) {
    if (!exists) {
      db.config.extlibs.write({
        path: '/ext/countries.sjs',
        contentType: 'application/vnd.marklogic-javascript',
        source: fs.createReadStream('../sjs/countries.sjs')
      }).result().then((response) => {
        console.log('Installed module: ' + response.path);
      }).catch((error => {
        console.log('Error installing module ' + error);
      }));
    }
    database.getCountries().then((countries) => {
      var uniqueCountries = utils.unique(countries);
      uniqueCountries.forEach(function(uniqueCountry) {
        _countryExists(uniqueCountry).then(function(result) {
          if (!result.boolean) {
            console.log('Calling semantic info for: ' + uniqueCountry);
            return db.invoke({
              path: '/ext/countries.sjs',
              variables: {country: uniqueCountry}
            }).result((response) => {
              console.log('RDF triple inserted ' + response[0].value);
            }, (error) => {
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
