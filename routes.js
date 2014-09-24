'use strict';

// route handler for the API
var marklogic =require('./node-client-api/lib/marklogic.js'),
    connection = require('./dbsettings').connection,
    db = marklogic.createDatabaseClient(connection),
    q = marklogic.queryBuilder;

var selectAll = function selectAll(callback) {
    var docs = [];
    db.query(q.where('').slice(1,300)).result(function(documents) {
        documents.forEach(function (document) {
            docs.push(document.content);
        });
        callback(docs);
    });
};

var selectOne = function selectOne(uri, callback) {
    var oneDocument = [];
    db.read('/' + uri).result().then(function (doc) {
        doc.forEach(function (d) {
            oneDocument.push(d.content);
        });
        callback(oneDocument);
    })
};

var selectImageData = function selectImageData(uri, callback) {
    var imageData = [];
    db.read('/' + uri + '.json').result().then(function (data) {
        data.forEach(function (d) {
            imageData.push(d.content);
        });
        callback(imageData);
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

var appindex = function(req, res) {
    res.render('index', {page: 'index'});
};

var appimportfiles = function(req, res) {
    res.render('importfiles', {page: 'importfiles'});
};

var appmap = function(req, res) {
    res.render('map', {page: 'map'});
};

var appexplorer = function(req, res) {
    res.render('explorer', {page: 'explorer'});
};

module.exports = {
    app: {
        index: appindex,
        importfiles: appimportfiles,
        map: appmap,
        explorer: appexplorer
    },
    api : {
        index: apiindex,
        image: apiimage,
        imagedata: apiimagedata
    }
};