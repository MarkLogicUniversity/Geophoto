/* jshint node:true, esversion: 6 */

'use strict';

var metadataExtract = require('./metadata-extract');
var fs = require('fs');
var Promise   = require('bluebird');
var marklogic = require('marklogic');
var path = require('path');
var connection = {
  host: 'localhost',
  port: 8010,
  user: 'admin',
  password: 'admin'
};
var db = marklogic.createDatabaseClient(connection);
var pb = marklogic.patchBuilder;

var param = process.argv[2]; //path

var _docExists = function _docExists(docPath) {
  var promise = new Promise(function(resolve, reject) {
    db.documents.probe(docPath).result().
    then(function (response) {
      resolve(response.exists);
    }, function (error) {
      resolve(false);
    });
  });
  return promise;
};

var _processImport = (param) => {
  var promise = new Promise((resolve, reject) => {
    var result = [];
    var exists = fs.existsSync(param);
    if (exists) {
      if (fs.statSync(param).isDirectory()) {
        fs.readdirSync(param).filter((file) => {
          var extension = path.extname(file).toLowerCase();
          if (extension === '.jpg' || extension === '.jpeg') {
            result.push(param + '/' + file);
            resolve(result);
          }
        });
      } else if (fs.statSync(param).isFile()) {
        var extension = path.extname(param).toLowerCase();
        if (extension === '.jpg' || extension === '.jpeg') {
          result.push(param);
          resolve(result);
        }
      } else {
        reject(new Error('An error occured, path is not a file nor a folder: ' + path));
      }
    } else {
      reject(new Error('Location specified does not exist: ' + param));
    }
  });
  return promise;
};

var _importer = (file) => {
  var uri = file.split('/').pop().replace(/[&\/\\#,+()$~%'":*?<>{} ]/g, '');
  var metadataExtractor = new metadataExtract(file);
  var jsonURI = null;
  var country = null;
  return metadataExtractor.getData()
  .then((response) => {
    // Write the JSON doc to the database
    var uri = file.split('/').pop().replace(/[&\/\\#,+()$~%'":*?<>{} ]/g, '');
    var data = response;
    data.originalFilename = file;
    data.filename = uri;
    data.binary = '/binary/' + uri;
    jsonURI = '/image/' + uri + '.json';
    country = data.location.country;
    return db.documents.write({
      uri: jsonURI,
      contentType: 'application/json',
      collections: ['image'],
      content: data
    }).result();
  })
  .then((response) => {
    console.log('Inserted document with URI ' + response.documents[0].uri);

    // Find the IRI for this picture's country
    return db.graphs.sparql({
      contentType: 'application/sparql-results+json',
      query:
        `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
         select ?countryIRI
         where {
           ?countryIRI rdfs:label ?countryLabel .
         }`,
      bindings: {
        countryLabel: { value: country, lang: 'en'}
      }
    }).result();
  })
  .then((response) => {
    var countryIRI = response.results.bindings[0].countryIRI.value;

    return db.documents.patch(
      jsonURI,
      pb.insert(
        '/binary',
        'after',
        {
          "triples": [
            {
              "triple": {
                "subject": jsonURI,
                "predicate": 'takenIn',
                "object": countryIRI
              }
            }
          ]
        }
      )
    ).result();
  })
  .then(() => {
    // Write the binary doc to the database
    var ws = db.documents.createWriteStream({
      uri: '/binary/' + uri,
      contentType: 'image/jpeg',
      collections: ['binary']
    });
    var reader = fs.createReadStream(file);
    reader.pipe(ws);
    return ws.result();
  })
  .then((response) => {
    console.log('Inserted image with URI ' + response.documents[0].uri);
  })
  .catch((error) => {
    console.log(error);
  });
};

// if the country triples haven't been loaded yet, load them.
_docExists('http://marklogic.com/semantics/countries').then((exists) => {
  if (!exists) {
    db.graphs.write({
      uri: 'http://marklogic.com/semantics/countries',
      contentType: 'text/turtle',
      data: fs.createReadStream('../triples/all-countries.ttl')
    }).result().then((response) => {
      console.log('Loaded country triples: ' + JSON.stringify(response));
    }).catch((error) => {
      console.log('Error loading country triples: ' + error);
    });
  } else {
    console.log('Country triples already loaded');
  }
});

_processImport(param).then((files) => {
  files.forEach((file, index) => {
    setTimeout(() => {
      _importer(file);
    }, 5000 + (index * 1000));
  });
});
