var marklogic = require('marklogic');
var fs = require('fs');
var path = require('path');

var connection = {
  host: 'localhost',
  port: 5003,
  user: 'admin',
  password: 'admin'
};
var db = marklogic.createDatabaseClient(connection);
var qb = marklogic.queryBuilder;

export var insert = (type, param, data) => {
  if (type === 'JSON') {
    return db.documents.write({
      uri: '/image/' + data.filename + '.json',
      contentType: 'application/json',
      collections: ['image'],
      content: data
    }).result();
  } else if (type === 'JPEG') {
    var extension = path.extname(param).toLowerCase();
    if (!extension) {
      param = param + '/' + data.originalFilename;
    }
    var ws = db.documents.createWriteStream({
      uri: '/binary/' + data.filename,
      contentType: 'image/jpeg',
      collections: ['binary']
    });
    fs.createReadStream(param).pipe(ws);
    return ws.result();
  } else { }
};
