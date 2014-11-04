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
var q = marklogic.queryBuilder;

var db = marklogic.createDatabaseClient(testconfig.restReaderConnection);
var dbWriter = marklogic.createDatabaseClient(testconfig.restWriterConnection);
var dbAdmin = marklogic.createDatabaseClient(testconfig.restAdminConnection);

describe('document query slice test', function(){
  before(function(done){
    this.timeout(3000);
// NOTE: must create a string range index on rangeKey1 and rangeKey2
    dbWriter.documents.write({
      uri: '/test/query/matchDir/doc1.json',
      collections: ['matchCollection1'],
      contentType: 'application/json',
      content: {
        title: 'Vannevar Bush',
        popularity: 5,
        id: '0011',
        date: '2005-01-01',
        price: {
             amt: 0.1
           },
        p: 'Vannevar Bush wrote an article for The Atlantic Monthly'
        }
      }, { 
      uri: '/test/query/matchDir/doc2.json',
      collections: ['matchCollection1', 'matchCollection2'],
      contentType: 'application/json',
      content: {
        title: 'The Bush article',
        popularity: 4,
        id: '0012',
        date: '2006-02-02',
        price: {
             amt: 0.12
           },
        p: 'The Bush article described a device called a Memex'
        }
      }, { 
      uri: '/test/query/matchDir/doc3.json',
      collections: ['matchCollection2'],
      contentType: 'application/json',
      content: {
        title: 'For 1945',
        popularity: 3,
        id: '0013',
        date: '2007-03-03',
        price: {
             amt: 1.23
           },
        p: 'For 1945, the thoughts expressed in the Atlantic Monthly were groundbreaking'
        }
      }, { 
      uri: '/test/query/matchDir/doc4.json',
      collections: [],
      contentType: 'application/json',
      content: {
        title: 'Vannevar served',
        popularity: 5,
        id: '0024',
        date: '2008-04-04',
        price: {
             amt: 12.34
           },
        p: 'Vannevar served as a prominent policymaker and public intellectual'
        }
      }, { 
        uri: '/test/query/matchList/doc5.json',
        collections: ['matchList'],
        contentType: 'application/json',
        content: {
          title: 'The memex',
          popularity: 5,
          id: '0026',
          date: '2009-05-05',
          price: {
               amt: 123.45
             },
          p: 'The Memex, unfortunately, had no automated search feature'
          }
        }).
    result(function(response){done();}, done);
  });

  it('should do document query with slice with index 1 and page 10', function(done){
    db.documents.query(
      q.where(
        q.directory('/test/query/matchDir/')
        ).
      slice(1, 10)
      ).result(function(response) {
        var document = response[0];
        response.length.should.equal(4);
        //console.log(JSON.stringify(response, null, 4));
        done();
      }, done);
  });

  it('should do document query with slice with index 3 and page 10', function(done){
    db.documents.query(
      q.where(
        q.directory('/test/query/matchDir/')
        ).
      slice(3, 10)
      ).result(function(response) {
        var document = response[0];
        response.length.should.equal(2);
        //console.log(JSON.stringify(response, null, 4));
        done();
      }, done);
  });

  it('should do document query with slice with index 5 and page 10', function(done){
    db.documents.query(
      q.where(
        q.directory('/test/query/matchDir/')
        ).
      slice(5, 10)
      ).result(function(response) {
        var document = response[0];
        response.length.should.equal(0);
        //console.log(JSON.stringify(response, null, 4));
        done();
      }, done);
  });

  it('should do document query with slice with negative index', function(done){
    db.documents.query(
      q.where(
        q.directory('/test/query/matchDir/')
        ).
      slice(-1, 10)
      ).
      result(function(response) {
        response.should.equal('SHOULD HAVE FAILED');
        done();
      }, function(error) {
        //console.log(error);
        error.body.errorResponse.message.should.equal('REST-INVALIDTYPE: (rest:INVALIDTYPE) Invalid type in start: -1 is not a value of type unsignedLong');
        error.statusCode.should.equal(400);
        done();
      });
  });

  it('should do document query with slice with index 1 and page 1', function(done){
    db.documents.query(
      q.where(
        q.directory('/test/query/matchDir/')
        ).
      slice(1, 1)
      ).result(function(response) {
        var document = response[0];
        response.length.should.equal(1);
        //console.log(JSON.stringify(response, null, 4));
        done();
      }, done);
  });

  it('should do document query with slice with index 3 and page 2', function(done){
    db.documents.query(
      q.where(
        q.directory('/test/query/matchDir/')
        ).
      slice(3, 2)
      ).result(function(response) {
        var document = response[0];
        response.length.should.equal(2);
        //console.log(JSON.stringify(response, null, 4));
        done();
      }, done);
  });

  it('should do document query with slice with negative page', function(done){
    db.documents.query(
      q.where(
        q.directory('/test/query/matchDir/')
        ).
      slice(1, -1)
      ).
      result(function(response) {
        response.should.equal('SHOULD HAVE FAILED');
        done();
      }, function(error) {
        //console.log(error);
        error.body.errorResponse.message.should.equal('REST-INVALIDTYPE: (rest:INVALIDTYPE) Invalid type in pageLength: -1 is not a value of type unsignedLong');
        error.statusCode.should.equal(400);
        done();
      });
  });

  it('should remove all documents', function(done){
    dbAdmin.documents.removeAll({all:true}).
    result(function(response) {
    response.should.be.ok;
    done();
    }, done);
  });
});
