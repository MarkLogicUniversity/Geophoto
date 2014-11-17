/*
 * Copyright 2014 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var should = require('should');

var fs     = require('fs');
var stream = require('stream');
var util   = require('util');

var concatStream = require('concat-stream');
var valcheck     = require('core-util-is');

var testconfig = require('../etc/test-config.js');

var marklogic = require('../');

var db = marklogic.createDatabaseClient(testconfig.restWriterConnection);
var dbReader = marklogic.createDatabaseClient(testconfig.restReaderConnection);

describe('document content', function(){
  describe('write', function(){
    // write and read formats
    describe('a JSON string', function(){
      before(function(done){
        db.documents.write({
          uri: '/test/write/string1.json',
          contentType: 'application/json',
          content: '{"key1":"value 1"}'
          }).
        result(function(response){done();}, done);
      });
      it('should read back the value', function(done){
        db.read('/test/write/string1.json').
          result(function(documents) {
            valcheck.isUndefined(documents).should.equal(false);
            documents.length.should.equal(1);
            var document = documents[0];
            valcheck.isUndefined(document).should.equal(false);
            document.should.have.property('content');
            document.content.should.have.property('key1');
            document.content.key1.should.equal('value 1');
            done();
            }, done);
      });
    });
    describe('a JSON object', function(){
      before(function(done){
        db.documents.write({
          uri: '/test/write/object1.json',
          contentType: 'application/json',
          content: {key1: "value 1"}
          }).
        result(function(response){done();}, done);
      });
      it('should read back the value', function(done){
        db.read('/test/write/object1.json').
          result(function(documents) {
            valcheck.isUndefined(documents).should.equal(false);
            documents.length.should.equal(1);
            var document = documents[0];
            valcheck.isUndefined(document).should.equal(false);
            document.should.have.property('content');
            document.content.should.have.property('key1');
            document.content.key1.should.equal('value 1');
            done();
            }, done);
      });
    });
    describe('a JSON buffer', function(){
      before(function(done){
        db.documents.write({
          uri: '/test/write/buffer1.json',
          contentType: 'application/json',
          content: new Buffer('{"key1":"value 1"}')
          }).
        result(function(response){done();}, done);
      });
      it('should read back the value', function(done){
        db.read('/test/write/buffer1.json').
          result(function(documents) {
            valcheck.isUndefined(documents).should.equal(false);
            documents.length.should.equal(1);
            documents[0].should.have.property('content');
            documents[0].content.should.have.property('key1');
            documents[0].content.key1.should.equal('value 1');
            done();
            }, done);
      });
    });
    describe('a JSON descriptor with a readable stream', function(){
      before(function(done){
        var readableString = new ValueStream('{"key1":"value 1"}');
        readableString.pause();
        db.documents.write({
          uri: '/test/write/stream1.json',
          contentType: 'application/json',
          content: readableString
          }).
        result(function(response){done();}, done);
      });
      it('should read back the value', function(done){
        db.read('/test/write/stream1.json').
          result(function(documents) {
            valcheck.isUndefined(documents).should.equal(false);
            documents.length.should.equal(1);
            documents[0].should.have.property('content');
            documents[0].content.should.have.property('key1');
            documents[0].content.key1.should.equal('value 1');
            done();
            }, done);
      });
    });
    describe('an XML string', function(){
      before(function(done){
        db.documents.write({
          uri: '/test/write/string1.xml',
          contentType: 'application/xml',
          content: '<doc>content 1</doc>'
          }).
        result(function(response){done();}, done);
      });
      it('should read back the content', function(done){
        db.read('/test/write/string1.xml').
          result(function(documents) {
            valcheck.isUndefined(documents).should.equal(false);
            documents.length.should.equal(1);
            var document = documents[0];
            valcheck.isUndefined(document).should.equal(false);
            document.should.have.property('content');
            document.content.should.containEql('<doc>content 1</doc>');
            done();
            }, done);
      });
    });
    describe('a repaired XML string', function(){
      var uri = '/test/write/repaired1.xml';
      before(function(done){
        db.documents.write({
          uri: uri,
          contentType: 'application/xml',
          repair: 'full',
          content: '<doc><child>content 1</doc>'
          }).
        result(function(response){done();}, done);
      });
      it('should read back the content', function(done){
        db.read(uri).
          result(function(documents) {
            valcheck.isArray(documents).should.equal(true);
            documents.length.should.equal(1);
            var document = documents[0];
            valcheck.isUndefined(document).should.equal(false);
            document.should.have.property('content');
            document.content.should.containEql('<doc><child>content 1</child></doc>');
            done();
            }, done);
      });
    });
    describe('a language-specified XML string', function(){
      var uri = '/test/write/lang1.xml';
      before(function(done){
        db.documents.write({
          uri: uri,
          contentType: 'application/xml',
          lang: 'fr',
          content: '<doc>oui</doc>'
          }).
        result(function(response){done();}, done);
      });
      it('should read back the content', function(done){
        db.read(uri).
          result(function(documents) {
            valcheck.isArray(documents).should.equal(true);
            documents.length.should.equal(1);
            var document = documents[0];
            valcheck.isUndefined(document).should.equal(false);
            document.should.have.property('content');
            document.content.should.containEql('<doc xml:lang="fr">oui</doc>');
            done();
            }, done);
      });
    });
    describe('a text string', function(){
      before(function(done){
        db.documents.write({
          uri: '/test/write/string1.txt',
          contentType: 'text/plain',
          content: 'text 1'
          }).
        result(function(response){done();}, done);
      });
      it('should read back the content', function(done){
        db.read('/test/write/string1.txt').
          result(function(documents) {
            valcheck.isUndefined(documents).should.equal(false);
            documents.length.should.equal(1);
            var document = documents[0];
            valcheck.isUndefined(document).should.equal(false);
            document.should.have.property('content');
            document.content.should.equal('text 1');
            done();
            }, done);
      });
      it('should assign a uri on the server', function(done){
        db.documents.write({
          extension: 'txt',
          directory: '/test/write/',
          contentType: 'text/plain',
          content: 'text with assigned extension'
          }).result().
        then(function(response) {
          valcheck.isUndefined(response).should.equal(false);
          var documents = response.documents;
          valcheck.isArray(documents).should.equal(true);
          documents.length.should.equal(1);
          var document = documents[0];
          valcheck.isUndefined(document).should.equal(false);
          document.should.have.property('uri');          
          return db.read(document.uri).result();
          }).
        then(function(documents){
          valcheck.isArray(documents).should.equal(true);
          documents.length.should.equal(1);
          var document = documents[0];
          valcheck.isUndefined(document).should.equal(false);
          document.should.have.property('content');
          document.content.should.equal('text with assigned extension');
          return db.remove(document.uri).result();
          }).
        then(function(documents){
          done();
          }, done);
      });
    });
    describe('a binary', function(){
      var binaryPath = './test-basic/data/mlfavicon.png';
      var uri = '/test/binary/test1.png';
      var binaryValue = null;
      before(function(done){
        this.timeout(3000);
        fs.createReadStream(binaryPath).
          pipe(concatStream({encoding: 'buffer'}, function(value) {
            binaryValue = value;
            done();
          }));
        });
      it('should write a binary descriptor with a Readable stream', function(done){
        this.timeout(3000);
        var uri = '/test/write/stream1.png';
        var readableBinary = new ValueStream(binaryValue);
        readableBinary.pause();
        db.documents.write({
          uri: uri,
          contentType: 'image/png',
          content: readableBinary
          }).result().
        then(function(response){
          valcheck.isUndefined(response).should.equal(false);
          response.should.have.property('documents');
          response.documents.should.have.property('length');
          response.documents.length.should.equal(1);
          response.documents[0].should.have.property('uri');
          response.documents[0].uri.should.equal(uri);
          return db.read(response.documents[0].uri).result();
          }, done).
        then(function(documents){
          valcheck.isArray(documents).should.equal(true);
          documents.should.have.property('length');
          documents.length.should.equal(1);
          documents[0].should.have.property('content');
          JSON.stringify(binaryValue).should.equal(
              JSON.stringify(documents[0].content)
              );
          done();
          }, done);
      });
      it('should write as a piped stream', function(done){
        this.timeout(3000);
        var ws = db.createWriteStream({
          uri:uri,
          contentType:'image/png'
          });
        ws.result(function(response) {
          valcheck.isUndefined(response).should.equal(false);
          response.should.have.property('documents');
          response.documents.length.should.equal(1);
          var document = response.documents[0];
          document.should.have.property('uri');
          document.uri.should.equal(uri);
          done();
          }, done);
        fs.createReadStream(binaryPath).pipe(ws);
      });
      it('should read as a stream', function(done){
        db.createReadStream(uri).on('error', done).
          pipe(
            concatStream({encoding: 'buffer'}, function(value) {
              valcheck.isUndefined(value).should.equal(false);
              JSON.stringify(binaryValue).should.equal(JSON.stringify(value));
              done();
              }).on('error', done)
            ).on('error', done);
      });
    });

    // write and read arity
    describe('two JSON documents', function(){
      before(function(done){
        db.documents.write([{
          uri: '/test/write/arrayString1.json',
          contentType: 'application/json',
          content: '{"key1":"value 1"}'
          }, {
          uri: '/test/write/arrayObject2.json',
          contentType: 'application/json',
          content: {key1: 'value 1'}
          }]).
        result(function(response){done();}, done);
      });
      it('should read back both values', function(done){
        db.read(
            '/test/write/arrayString1.json',
            '/test/write/arrayObject2.json'
            ).
        result(function(documents) {
          valcheck.isUndefined(documents).should.equal(false);
          documents.length.should.equal(2);
          for (var i=0; i < 2; i++) {
            var document = documents[i];
            valcheck.isUndefined(document).should.equal(false);
            document.should.have.property('content');
            document.content.should.have.property('key1');
            document.content.key1.should.equal('value 1');
          }
          done();
          }, done);
      });
    });
    describe('a JSON document in two chunks', function(){
      before(function(done){
        var writeStream = db.documents.createWriteStream({
            uri: '/test/write/writable1.json',
            contentType: 'application/json'
            });
        writeStream.result(function(response){done();}, done);

        writeStream.write('{"key1"', 'utf8');
        writeStream.write(       ':"value 1"}', 'utf8');
        writeStream.end();
      });
      it('should read back the value', function(done){
        db.createReadStream('/test/write/writable1.json').
          on('data', function(chunk) {
            valcheck.isUndefined(chunk).should.equal(false);
            var content = JSON.parse(chunk.toString());
            valcheck.isUndefined(content).should.equal(false);
            content.should.have.property('key1');
            content.key1.should.equal('value 1');
            done();
            }, done);
      });
    });

    describe('remove', function(){
      describe('a document', function(){
        before(function(done){
          db.documents.write({
            uri: '/test/remove/doc1.json',
            contentType: 'application/json',
            content: {key1: 'value 1'}
            }).
          result(function(response){done();}, done);
        });
        it('should not exist', function(done){
          db.remove('/test/remove/doc1.json').
            result(function(result) {
              return db.probe('/test/remove/doc1.json').result();
              }, done).
            then(function(document) {
              valcheck.isUndefined(document).should.equal(false);
              document.should.have.property('exists');
              document.exists.should.eql(false);
              done();
              }, done);
        });
      });
    });

    describe('check', function(){
      describe('a document', function(){
        before(function(done){
          db.documents.write({
            uri: '/test/check/doc1.json',
            contentType: 'application/json',
            content: {key1: 'value 1'}
            }).
            result(function(response){done();}, done);
        });
        it('should exist', function(done){
          db.probe('/test/check/doc1.json').
            result(function(document) {
              valcheck.isUndefined(document).should.equal(false);
              document.should.have.property('exists');
              document.exists.should.eql(true);
              done();
              }, done);
        });
      });
    });
  });
});

describe('document metadata', function(){
  describe('write', function(){
    describe('with content', function(){
      before(function(done){
        db.documents.write({
          uri: '/test/write/metaContent1.json',
          contentType: 'application/json',
          collections: ['collection1/0', 'collection1/1'],
          permissions: [
            {'role-name':'app-user',    capabilities:['read']},
            {'role-name':'app-builder', capabilities:['read', 'update']}
            ],
          properties: {
            property1: 'property value 1',
            property2: 'property value 2'
            },
          quality: 1,
          content: {key1: 'value 1'}
          },
        {contentType: 'application/json',
          collections: ['collectionDefault/0', 'collectionDefault/1'],
          permissions: [
            {'role-name':'app-user',    capabilities:['read']},
            {'role-name':'app-builder', capabilities:['read', 'update']}
            ],
          properties: {
            propertyDefault1: 'default property value 1',
            propertyDefault2: 'default property value 2'
            },
          quality: 2
          },
        {uri: '/test/write/metaContent2.json',
          contentType: 'application/json',
          content: {key2: 'value 2'}
          }).
        result(function(response){done();}, done);
      });
      it('should read back the metadata and content', function(done){
        db.read({uris:'/test/write/metaContent1.json', categories:['metadata', 'content']}).
          result(function(documents) {
            valcheck.isUndefined(documents).should.equal(false);
            documents.length.should.equal(1);
            var document = documents[0];
            document.collections.length.should.equal(2);
            for (var i=0; i < 2; i++) {
              document.collections[i].should.equal('collection1/'+i);
            }
            var permissionsFound = 0;
            document.permissions.forEach(function(permission){
              switch (permission['role-name']) {
              case 'app-user':
                permissionsFound++;
                permission.capabilities.length.should.equal(1);
                permission.capabilities[0].should.equal('read');
                break;
              case 'app-builder':
                permissionsFound++;
                permission.capabilities.length.should.equal(2);
                permission.capabilities.should.containEql('read');
                permission.capabilities.should.containEql('update');
                break;
              }
            });
            permissionsFound.should.equal(2);
            document.should.have.property('properties');
            document.properties.should.have.property('property1');
            document.properties.property1.should.equal('property value 1');
            document.properties.should.have.property('property2');
            document.properties.property2.should.equal('property value 2');
            document.quality.should.equal(1);
            document.content.key1.should.equal('value 1');
            done();
            }, done);
      });
      it('should read back default metadata and content', function(done){
        db.read({uris:'/test/write/metaContent2.json', categories:['metadata', 'content']}).
          result(function(documents) {
            valcheck.isUndefined(documents).should.equal(false);
            documents.length.should.equal(1);
            var document = documents[0];
            document.collections.length.should.equal(2);
            for (var i=0; i < 2; i++) {
              document.collections[i].should.equal('collectionDefault/'+i);
            }
            var permissionsFound = 0;
            document.permissions.forEach(function(permission){
              switch (permission['role-name']) {
              case 'app-user':
                permissionsFound++;
                permission.capabilities.length.should.equal(1);
                permission.capabilities[0].should.equal('read');
                break;
              case 'app-builder':
                permissionsFound++;
                permission.capabilities.length.should.equal(2);
                permission.capabilities.should.containEql('read');
                permission.capabilities.should.containEql('update');
                break;
              }
            });
            permissionsFound.should.equal(2);
            document.should.have.property('properties');
            document.properties.should.have.property('propertyDefault1');
            document.properties.propertyDefault1.should.equal('default property value 1');
            document.properties.should.have.property('propertyDefault2');
            document.properties.propertyDefault2.should.equal('default property value 2');
            document.quality.should.equal(2);
            document.content.key2.should.equal('value 2');
            done();
            }, done);
      });
    });
    describe('without content', function(){
      before(function(done){
        db.documents.write({
          uri: '/test/write/metaContent1.json',
          collections: ['collection2/0', 'collection2/1'],
          permissions: [
            {'role-name':'app-user',    capabilities:['read', 'update']},
            {'role-name':'app-builder', capabilities:['execute']}
            ],
          properties: {
            property1: 'property value 1',
            property2: 'property value 2'
            },
          quality: 2
          }).
        result(function(response){done();}, done);
      });
      it('should read back the all of the metadata', function(done){
        db.read({uris:'/test/write/metaContent1.json', categories:'metadata'}).
          result(function(documents) {
            valcheck.isUndefined(documents).should.equal(false);
            documents.length.should.equal(1);
            var document = documents[0];
            valcheck.isUndefined(document).should.equal(false);
            document.should.have.property('collections');
            document.collections.length.should.equal(2);
            for (var i=0; i < 2; i++) {
              document.collections[i].should.equal('collection2/'+i);
            }
            document.should.have.property('permissions');
            var permissionsFound = 0;
            document.permissions.forEach(function(permission){
              switch (permission['role-name']) {
              case 'app-user':
                permissionsFound++;
                permission.capabilities.length.should.equal(2);
                permission.capabilities.should.containEql('read');
                permission.capabilities.should.containEql('update');
                break;
              case 'app-builder':
                permissionsFound++;
                permission.capabilities.length.should.equal(1);
                permission.capabilities[0].should.equal('execute');
                break;
              }
            });
            permissionsFound.should.equal(2);
            document.should.have.property('properties');
            document.properties.should.have.property('property1');
            document.properties.property1.should.equal('property value 1');
            document.properties.should.have.property('property2');
            document.properties.property2.should.equal('property value 2');
            document.should.have.property('quality');
            document.quality.should.equal(2);
            document.should.not.have.property('content');
            done();
            }, done);
      });
      it('should read back collections metadata', function(done){
        db.read({uris:'/test/write/metaContent1.json', categories:'collections'}).
          result(function(documents) {
            valcheck.isUndefined(documents).should.equal(false);
            documents.length.should.equal(1);
            var document = documents[0];
            document.should.have.property('collections');
            document.collections.length.should.equal(2);
            for (var i=0; i < 2; i++) {
              document.collections[i].should.equal('collection2/'+i);
            }
            document.should.not.have.property('content');
            done();
            }, done);
      });
      it('should read back permissions metadata', function(done){
        db.read({uris:'/test/write/metaContent1.json', categories:'permissions'}).
          result(function(documents) {
            valcheck.isUndefined(documents).should.equal(false);
            documents.length.should.equal(1);
            var document = documents[0];
            document.should.have.property('permissions');
            var permissionsFound = 0;
            document.permissions.forEach(function(permission){
              switch (permission['role-name']) {
              case 'app-user':
                permissionsFound++;
                permission.capabilities.length.should.equal(2);
                permission.capabilities.should.containEql('read');
                permission.capabilities.should.containEql('update');
                break;
              case 'app-builder':
                permissionsFound++;
                permission.capabilities.length.should.equal(1);
                permission.capabilities[0].should.equal('execute');
                break;
              }
            });
            permissionsFound.should.equal(2);
            document.should.not.have.property('content');
            done();
            }, done);
      });
      it('should read back the properties metadata', function(done){
        db.read({uris:'/test/write/metaContent1.json', categories:'properties'}).
          result(function(documents) {
            valcheck.isUndefined(documents).should.equal(false);
            documents.length.should.equal(1);
            var document = documents[0];
            document.should.have.property('properties');
            document.properties.should.have.property('property1');
            document.properties.property1.should.equal('property value 1');
            document.properties.should.have.property('property2');
            document.properties.property2.should.equal('property value 2');
            document.should.not.have.property('content');
            done();
            }, done);
      });
      it('should read back the quality metadata', function(done){
        db.read({uris:'/test/write/metaContent1.json', categories:'quality'}).
          result(function(documents) {
            valcheck.isUndefined(documents).should.equal(false);
            documents.length.should.equal(1);
            var document = documents[0];
            document.should.have.property('quality');
            document.quality.should.equal(2);
            document.should.not.have.property('content');
            done();
            }, done);
      });
    });
  });
});

function ValueStream(value) {
  stream.Readable.call(this);
  this.value    = value;
}
util.inherits(ValueStream, stream.Readable);
ValueStream.prototype._read = function() {
  this.push(this.value);
  this.push(null);
};
