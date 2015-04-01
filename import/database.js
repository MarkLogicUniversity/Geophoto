"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var connection = require("./connection").connection;

var fs = require("fs");
var path = require("path");
var marklogic = require("marklogic");

var db = marklogic.createDatabaseClient(connection);
var qb = marklogic.queryBuilder;

var insert = function (type, param, data) {
  if (type === "JSON") {
    return db.documents.write({
      uri: "/image/" + data.filename + ".json",
      contentType: "application/json",
      collections: ["image"],
      content: data
    }).result();
  } else if (type === "JPEG") {
    var extension = path.extname(param).toLowerCase();
    if (!extension) {
      param = param + "/" + data.originalFilename;
    }
    var ws = db.documents.createWriteStream({
      uri: "/binary/" + data.filename,
      contentType: "image/jpeg",
      collections: ["binary"]
    });
    fs.createReadStream(param).pipe(ws);
    return ws.result();
  } else {
    console.log("Insert type has to be either \"JPEG\" or \"JSON\". Currenty it is set to " + type);
  }
};

exports.insert = insert;
var getCountries = function () {
  var countries = [];
  var promise = new Promise(function (resolve, reject) {
    db.documents.query(qb.where(qb.collection("image")).orderBy(qb.sort("filename")).slice(0, 300) //return 300 documents "per page" (pagination)
    ).result().then(function (documents) {
      documents.forEach(function (document) {
        countries.push(document.content.location.country.replace(" ", "_")); //also removing spaces
        resolve(countries);
      });
    })["catch"](function (error) {
      console.log(error);
    });
  });
  return promise;
};
exports.getCountries = getCountries;
