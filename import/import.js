'use strict';

var metadataExtract = require('./metadata-extract');
var fs = require('fs');
var Promise   = require('bluebird');
var marklogic = require('marklogic');
var path = require('path');
var connection = {
  host: 'localhost',
  port: 5003,
  user: 'admin',
  password: 'admin'
};
var db = marklogic.createDatabaseClient(connection);

var param = process.argv[2]; //path

var _moduleExists = function _moduleExists() {
  var promise = new Promise(function(resolve, reject) {
    db.config.extlibs.read('/ext/countrysemantics.sjs').result().
    then(function (response) {
      resolve(true);
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

_moduleExists().then((exists) => {
  if (!exists) {
    db.config.extlibs.write({
      path: '/ext/countrysemantics.sjs',
      contentType: 'application/vnd.marklogic-javascript',
      source: fs.createReadStream('countrysemantics.sjs')
    }).result().then((response) => {
      console.log('Installed module: ' + response.path);
    }).catch((error) => {
      console.log('Error installing module ' + error);
    });
  } else {
    console.log('Not installing /ext/countrysemantics.sjs');
  }
});

var _importer = (file) => {
  var file = file;
  var uri = file.split('/').pop().replace(/[&\/\\#,+()$~%'":*?<>{} ]/g, '');
  var metadataExtractor = new metadataExtract(file);
  return metadataExtractor.getData()
  .then((response) => {
    var uri = file.split('/').pop().replace(/[&\/\\#,+()$~%'":*?<>{} ]/g, '');
    var data = response;
    data.originalFilename = file;
    data.filename = uri;
    data.binary = '/binary/' + uri;
    return db.documents.write({
      uri: '/image/' + uri + '.json',
      contentType: 'application/json',
      collections: ['image'],
      content: data
    }).result();
  })
  .then((response) => {
    console.log('Inserted document with URI ' + response.documents[0].uri);
    return db.documents.read(response.documents[0].uri).result();
  })
  .then((response) => {
    var country = response[0].content.location.country.replace(' ', '_');
    var sparqlQuery = [
      'PREFIX db: <http://dbpedia.org/resource/>',
      'PREFIX onto: <http://dbpedia.org/ontology/>',
      'ASK { db:' + country + ' ?p ?o }'
    ];
    db.graphs.sparql('application/sparql-results+json', sparqlQuery.join('\n')).result()
    .then((SPARQLresponse) => {
      if (!SPARQLresponse.boolean) {
        return db.invoke({
          path: '/ext/countrysemantics.sjs',
          variables: { country: country }
        }).result();
      } else {
        return { message: 'No semantic data inserted for ' + country };
      }
    })
    .then((response) => {
      if (response.message) {
        console.log(response.message)
      } else {
        console.log('Triple for ' + country + ' inserted with URI: ' + response[0].value);
      }
    })
    .catch((error) => {
      console.log(error)
    });
  })
  .then(() => {
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
    console.log(error)
  });
};

_processImport(param).then((files) => {
  files.forEach((file, index) => {
    setTimeout(() => {
      _importer(file);
    }, 5000 + (index * 1000));
  });
});
