'use strict';

// route handler for the API
var marklogic =require('./node-client-api/lib/marklogic.js'),
    connection = require('./dbsettings').connection,
    db = marklogic.createDatabaseClient(connection),
    q = marklogic.queryBuilder,
    p = marklogic.patchBuilder,
    _ = require('lodash');

var selectAll = function selectAll(callback) {
    var docs = [];
    db.documents.query(q.where(q.collection('image')).slice(0,300)).result(function(documents) {
        documents.forEach(function (document) {
            docs.push(document.content);
        });
        callback(docs);
    });
};

var selectOne = function selectOne(uri, callback) {
    var oneDocument = [];
    db.documents.read('/image/' + uri + '.json').result().then(function (doc) {
        doc.forEach(function (d) {
            oneDocument.push(d.content);
        });
        callback(oneDocument);
    })
};

var selectImageData = function selectImageData(uri, callback) {
    var imageData = [];
    db.documents.read('/binary/' + uri).result().then(function (data) {
        data.forEach(function (d) {
            imageData.push(new Buffer(d.content, 'binary').toString('base64'));
        });
        callback(imageData);
    });
};

var patchDocument = function(uri, update, callback) {
    db.documents.read('/image/' + uri + '.json')
        .result()
        .then(function(document) {
            var oldDocument = document[0].content;
            if (oldDocument.title === 'undefined') {
                oldDocument.title = update; 
            } else {
                oldDocument['title'] = update;
                var newDocument = oldDocument;
            }

            return db.documents.write({
                uri: document[0].uri,
                collection: 'image',
                content: newDocument
            }).result(function (response) {
                callback(newDocument);
            });
        });
};

var geoSearch = function search (object, callback) {
    var docs = [];
    var radius = parseInt(object.radius);
    var lat = parseFloat(object.lat);
    var lng = parseFloat(object.lng);
    db.documents.query(
        q.where(
            q.collection('image'),
                q.geoPath(
                   'location/coordinates',
                    q.circle(radius, lat, lng)
                )
            ).slice(0,300).withOptions({categories:['content']})
        ).result(function(documents) {
            documents.forEach(function (document) {
                docs.push(document.content);
            })
            callback(docs);
        });
};

var apiindex = function(req, res) {
    selectAll(function(documents) {
        res.json(documents);
    });
};

var apiimage = function(req, res) {
    var id = req.params.id;
    var doc = [];
    selectOne(id, function (oneDocument) {
        if (oneDocument.length !== 0) {
            res.json(oneDocument);
        } else {
            res.status(404).end();
        }
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

};

var apisearch = function(req, res) {
    var radius = req.params.radius;
    var lat = req.params.lat;
    var lng = req.params.lng;
    
    var search = {
        radius: radius,
        lat: lat,
        lng: lng
    };

    geoSearch(search, function (data) {
        res.json(data);
    });
};

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
        add: apiadd,
        search: apisearch
    }
};