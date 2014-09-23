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

var testconfig = require('../etc/test-config.js');

var marklogic = require('../');

var db = marklogic.createDatabaseClient(testconfig.restWriterConnection);

describe('document patch', function(){
  var uri1 = '/test/patch/doc1.json';
  describe('with JSONPath', function() {
    before(function(done){
      db.documents.write({
        uri: uri1,
        collections: ['patchCollection1'],
        contentType: 'application/json',
        content: {
          id:              'patchDoc1',
          arrayParentKey:  ['existing value'],
          objectParentKey: {replacementKey: 'replaceable value'},
          deletableKey:    'deletable value'
          }
        }).
      result(function(response){done();}, done);
    });
    it('should insert, replace, and delete', function(done){
      var p = marklogic.patchBuilder;
      db.documents.patch(uri1,
          p.pathLanguage('jsonpath'),
          p.insert('$.arrayParentKey', 'last-child', 'appended value'),
          p.replace('$.objectParentKey.replacementKey', 'replacement value'),
          p.remove('$.deletableKey')
          ).
      result(function(response){
        db.read(uri1).
        result(function(documents) {
          var document = documents[0];
          document.should.be.ok;
          document.should.have.property('content');
          document.content.should.have.property('arrayParentKey');
          document.content.arrayParentKey.length.should.equal(2);
          document.content.arrayParentKey[1].should.equal('appended value');
          document.content.should.have.property('objectParentKey');
          document.content.objectParentKey.should.have.property('replacementKey');
          document.content.objectParentKey.replacementKey.should.equal('replacement value');
          document.should.not.have.property('deletableKey');
          done();}, done);
        }, done);
    });    
  });
  describe('with XPath', function() {
    before(function(done){
      db.documents.write({
        uri: uri1,
        collections: ['patchCollection1'],
        contentType: 'application/json',
        content: {
          id:              'patchDoc1',
          arrayParentKey:  ['existing value'],
          objectParentKey: {replacementKey: 'replaceable value'},
          deletableKey:    'deletable value'
          }
        }).
      result(function(response){done();}, done);
    });
    it('should insert, replace, and delete', function(done) {
      var p = marklogic.patchBuilder;
      db.documents.patch(uri1,
          p.insert('/node("arrayParentKey")', 'last-child', 'appended value'),
          p.replace('/node("objectParentKey")/node("replacementKey")',
              'replacement value'),
          p.remove('/node("deletableKey")')
          ).
      result(function(response){
        db.read(uri1).
        result(function(documents) {
          var document = documents[0];
          document.should.be.ok;
          document.should.have.property('content');
          document.content.should.have.property('arrayParentKey');
          document.content.arrayParentKey.length.should.equal(2);
          document.content.arrayParentKey[1].should.equal('appended value');
          document.content.should.have.property('objectParentKey');
          document.content.objectParentKey.should.have.property('replacementKey');
          document.content.objectParentKey.replacementKey.should.equal('replacement value');
          document.should.not.have.property('deletableKey');
          done();}, done);
        }, done);
    });    
  });    
  describe('for metadata', function() {
    before(function(done){
      db.documents.write({
        uri: uri1,
        contentType: 'application/json',
        collections: ['collection1/0', 'collection1/1'],
        permissions: [
          {'role-name':'app-user',    capabilities:['read']}
          ],
        properties: {
          property1: 'property value 1',
          property2: 'property value 2'
          },
        quality: 1,
        content: {key1: 'value 1'}
        }).
      result(function(response){done();}, done);
    });
    it('should insert, replace, and delete', function(done) {
      var p = marklogic.patchBuilder;
      db.documents.patch({uri:uri1, categories:['metadata'], operations:[
          p.insert('array-node("collections")/text()[. eq "collection1/1"]', 'before',
              'collection1/INSERTED_BEFORE'),
          p.insert('array-node("collections")', 'last-child',
              'collection1/INSERTED_LAST'),
          p.remove('array-node("collections")/text()[. eq "collection1/0"]'),
          p.replace('array-node("permissions")/object-node()[node("role-name") eq "app-user"]',
              {'role-name':'app-builder', capabilities:['read', 'update']}
              ),
          p.insert('object-node("properties")/text("property2")', 'before',
              {propertyINSERTED_BEFORE2: 'property value INSERTED_BEFORE'}),
          p.insert('object-node("properties")', 'last-child',
              {propertyINSERTED_LAST: 'property value INSERTED_LAST'}),
          p.remove('object-node("properties")/text("property1")'),
          p.replace('node("quality")', 2)
          ]}).
      result(function(response){
        db.read({uris:uri1, categories:['metadata']}).
        result(function(documents) {
          var document = documents[0];
          document.should.be.ok;
          document.collections.length.should.equal(3);
          document.collections[0].should.equal('collection1/INSERTED_BEFORE');
          document.collections[1].should.equal('collection1/1');
          document.collections[2].should.equal('collection1/INSERTED_LAST');
          document.should.have.property('permissions');
          var foundAppUser    = false;
          var foundAppBuilder = false;
          document.permissions.forEach(function(permission){
            switch (permission['role-name']) {
            case 'app-user':
              foundAppUser = true;
              break;
            case 'app-builder':
              foundAppBuilder = true;
              permission.capabilities.length.should.equal(2);
              break;
            }
          });
          foundAppUser.should.equal(false);
          foundAppBuilder.should.equal(true);
          document.should.have.property('properties');
          document.properties.should.have.property('propertyINSERTED_BEFORE2');
          document.properties.propertyINSERTED_BEFORE2.should.
            equal('property value INSERTED_BEFORE');
          document.properties.should.have.property('property2');
          document.properties.property2.should.equal('property value 2');
          document.properties.should.have.property('propertyINSERTED_LAST');
          document.properties.propertyINSERTED_LAST.should.
            equal('property value INSERTED_LAST');
          document.should.have.property('quality');
          document.quality.should.equal(2);
          done();}, done);
        }, done);
    });    
  });    
  // TODO: patch library
});
