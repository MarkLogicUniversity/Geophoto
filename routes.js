'use strict';

// route handler for the API
var marklogic  = require('marklogic'),
    connection = require('./dbsettings').connection,
    db         = marklogic.createDatabaseClient(connection),
    qb         = marklogic.queryBuilder,
    p          = marklogic.patchBuilder;

/*
function to select all documents from the database - the query is restricted to
retrieve images from the 'image' collection. The 'image' collection consists of
documents that are describing the image itself but they have no binary data. The
binary data is only linked

e.g.

{
  "filename": "IMG_6193.jpg",
  "location": {
  "type": "Point",
  "coordinates": [
    43.7385,
    7.429167
    ]
  },
  "binary": "/binary/IMG_6193.jpg"
}
*/
var selectAll = function selectAll(callback) {
    var docs = [];
    db.documents.query(qb.where(qb.collection('image')).slice(0,300)).result(function(documents) {
        documents.forEach(function(document) {
            docs.push(document.content);
        });
        callback(docs);
    });
};

/* This function selects one image from the database */
var selectOne = function selectOne(uri, callback) {
    var oneDocument = [];
    db.documents.read('/image/' + uri + '.json').result().then(function (doc) {
        doc.forEach(function (d) {
            oneDocument.push(d.content);
        });
        callback(oneDocument);
    })
};

/* This function is responsible for retrieving the binary data from the database.
Once the data is retrieve it is converted to a base64 encoded string. In the frontend
this data is then used as a data-uri to build up the image itself
*/
var selectImageData = function selectImageData(uri, callback) {
    var imageData = [];
    db.documents.read('/binary/' + uri).result().then(function (data) {
        data.forEach(function (d) {
            imageData.push(new Buffer(d.content, 'binary').toString('base64'));
        });
        callback(imageData);
    });
};

/* This function updates the document. From the frontend we are allowed to set/change
the title of an image.
*/
var updateDocument = function(uri, update, callback) {
  update = JSON.parse(update);
  var description = update.description;
  var newDocument = {};
  db.documents.read('/image/' + uri + '.json')
    .result()
    .then(function(document) {
      if (update.title) {
        var title = update.title;
        document[0].content.title = title;
      }
      if (description) {
        document[0].content.description = description;
      }
      newDocument = document[0].content;
      document[0].collections = ['image'];
      return db.documents.write(document[0])
        .result();
    })
    .then(function(document) {
      callback(newDocument);
    });
  };

/* This function is responsible for doing a geospatial search

Geospatial search in MarkLogic uses a geo object (in thise case a geo path)
and it also has support for 4 geospatial types. We have circle, square, polygon
and point. In this function we are using the geospatial circle
*/
var geoSearch = function search(object, callback) {
    var docs = [],
    radius   = parseInt(object.radius),
    lat      = parseFloat(object.lat),
    lng      = parseFloat(object.lng);

    db.documents.query(
        qb.where(
            qb.collection('image'),
                qb.geoPath(
                   'location/coordinates',
                    qb.circle(radius, lat, lng)
                )
            ).slice(0,300).withOptions({categories:['content']})
        ).result(function(documents) {
            documents.forEach(function(document) {
                docs.push(document.content);
            });
            callback(docs);
        });
};

var textSearch = function textSearch(term, callback) {
  var docs = [];
  db.documents.query(
    qb.where(
      qb.term(term)
    )
  ).result(function(documents) {
    documents.forEach(function(document) {
      docs.push(document.content);
    })
    callback(docs);
  });
};
/*
When specified the function below are making use of ExpressJS' req.params object
that contains the URL parameters that are sent with the request so:
if the route configuration contains:
/api/:id then the following URL http://localhost/api/image1234 will have a
'req.params.id' value that we can capture.
*/

/* wrapper function for selectAll() to retrieve all documents */
var apiindex = function(req, res) {
    selectAll(function(documents) {
        res.json(documents);
    });
};

/* wrapper function to retrieve one document information */
var apiimage = function(req, res) {
    var id = req.params.id;
    var doc = [];
    selectOne(id, function(oneDocument) {
        if (oneDocument.length !== 0) {
            res.json(oneDocument);
        } else {
            res.status(404).end();
        }
    });
};

/* wrapper function to retrieve image data */
var apiimagedata = function(req, res) {
    var id = req.params.id;
    var doc = [];
    selectImageData(id, function(imageData) {
        res.json(imageData);
    });
};

/* wrapper function to update a document's title */
var apiupdate = function(req, res) {
    var id = req.params.id;
    var update = req.params.update;
    updateDocument(id, update, function(data) {
        res.json(200);
    });

};

/* wrapper function for the geospatial search */

var apigeosearch = function(req, res) {
    var radius = req.params.radius;
    var lat    = req.params.lat;
    var lng    = req.params.lng;

    var search = {
        radius: radius,
        lat: lat,
        lng: lng
    };

    geoSearch(search, function(data) {
        res.json(data);
    });
};

var apitextsearch = function(req, res) {
  var term = req.params.term;

  textSearch(term, function(data) {
    res.json(data);
  });
}

var appindex = function(req, res) {
    res.render('index');
};

/* this route configuration is needed as we are using jade files */
var partials = function partials(req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
};

/* making both the app and api functions available via exports
*/
module.exports = {
    app: {
        index: appindex,
        partials: partials
    },
    api : {
        index: apiindex,
        image: apiimage,
        imagedata: apiimagedata,
        update: apiupdate,
        geosearch: apigeosearch,
        textsearch: apitextsearch
    }
};
