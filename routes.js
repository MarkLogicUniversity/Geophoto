'use strict';

// route handler for the API
var marklogic =require('./node-client-api/lib/marklogic.js'),
    connection = require('./dbsettings').connection,
    db = marklogic.createDatabaseClient(connection),
    q = marklogic.queryBuilder;

var selectAll = function selectAll(callback) {
    db.query(q.where('').slice(1,300)).result(function(documents) {
        callback(documents);
    });
};

var selectOne = function selectOne(uri, callback) {
    db.read('/' + uri).result().then(function (doc) {
        //console.log(doc);
        callback(doc.content);
    })
};

var selectImageData = function selectImageData(uri, callback) {
    db.read('/' + uri + '.json').result().then(function (data) {
        //console.log(data);
        //console.log(data);
        callback(data);
    });
};


var apiindex = function(req, res) {
    var docs = [];
    selectAll(function(documents){
        documents.forEach(function (document) {
            docs.push(document.content);
            
        });
        res.json(docs);
    });
};

var apiimage = function(req, res) {
    var id = req.params.id;
    var doc = [];
    selectOne(id, function (document) {
        document.forEach(function (d) {
            doc.push(d.content);
        })
        res.json(doc);
    });
};

var apiimagedata = function(req, res) {
    var id = req.params.id;
    var doc = [];
    selectImageData(id, function (document) {
        document.forEach(function (d) {
            doc.push(d.content);
            
        });
        res.json(doc);
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