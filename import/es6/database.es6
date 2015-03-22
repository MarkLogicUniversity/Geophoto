var marklogic = require('marklogic');
var connection = {
  host: 'localhost',
  port: 5003,
  user: 'admin',
  password: 'admin'
};
var db = marklogic.createDatabaseClient(connection);
var qb = marklogic.queryBuilder;

export var insert = (type, data) => {
  console.log(data);
  if (type === 'JSON') {
    return db.documents.write({
      uri: '/image/' + data.filename + '.json',
      contentType: 'application/json',
      collections: ['image'],
      content: data
    }).result();
  } else if (type === 'JPEG') {
    var ws = db.documents.createWriteStream({
      uri: '/binary/' + data.filename,
      contentType: 'image/jpeg',
      collections: ['binary']
    });
    return ws.result();
    fs.createReadStream(data.filename).pipe(ws);
  } else { }
};
