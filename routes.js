'use strict';

// route handler for the API
var marklogic =require('./node-client-api/lib/marklogic.js'),
    connection = require('./dbsettings').connection,
    db = marklogic.createDatabaseClient(connection),
    q = marklogic.queryBuilder,
    p = marklogic.patchBuilder;

var selectAll = function selectAll(callback) {
    var docs = [];
    db.query(q.where(q.collection('image')).slice(0,300)).result(function(documents) {
        documents.forEach(function (document) {
            docs.push(document.content);
        });
        callback(docs);
    });
};

var selectOne = function selectOne(uri, callback) {
    var oneDocument = [];
    db.read('/image/' + uri + '.json').result().then(function (doc) {
        doc.forEach(function (d) {
            oneDocument.push(d.content);
        });
        callback(oneDocument);
    })
};

var selectImageData = function selectImageData(uri, callback) {
    var imageData = [];
    db.read('/binary/' + uri).result().then(function (data) {
        data.forEach(function (d) {
            imageData.push(new Buffer(d.content, 'binary').toString('base64'));
        });
        callback(imageData);
    });
};

var patchDocument = function(uri, update, callback) {
    db.read('/image/' + uri + '.json').result().
    then(function(document) {
        if (document[0].content.title) {
            db.patch('/image/' + uri + '.json',
                p.pathLanguage('jsonpath'),
                p.replace('$.title', update)
            ).result().
            then(function(response) {
                callback(console.log('updated', response));
            });        
        } else {
            db.patch('/image/' + uri + '.json',
                p.pathLanguage('jsonpath'),
                p.replaceInsert('$.title', '$.filename', 'after', {title: update})
            ).result().
            then(function(response) {
                callback(console.log('updated', response));
            });
        }
    });
    
};

var apiindex = function(req, res) {
    var docs = [];
    selectAll(function(documents) {
        res.json(documents);
    });
};

var apiimage = function(req, res) {
    var id = req.params.id;
    var doc = [];
    selectOne(id, function (oneDocument) {
        res.json(oneDocument);
    });
};

var apiimagedata = function(req, res) {
    var id = req.params.id;
    var doc = [];
    selectImageData(id, function (imageData) {
        res.json(imageData);
    });
    // selectImageData(id, function(doc) {
    //     console.log(doc);
    //     res.json(doc);
    // })
};

var apiadd = function(req, res) {
    var id = req.params.id;
    var update = req.params.update;
    patchDocument(id, update, function (data) {
        res.json(200);
    });

}

var appindex = function(req, res) {
    res.render('index');
};

var partials = function partials(req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
};

module.exports = {
    app: {
        index: appindex,
        partials: partials
    },
    api : {
        index: apiindex,
        image: apiimage,
        imagedata: apiimagedata,
        add: apiadd
    }
};