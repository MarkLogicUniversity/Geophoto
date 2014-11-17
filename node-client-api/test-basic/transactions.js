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

describe('transaction', function(){
  describe('with commit', function(){
    this.timeout(5000);
    var uri = '/test/txn/commit1.json';
    before(function(done){
      db.probe(uri).result(function(document){
        if (document.exists) {
          db.remove(uri).
            result(function(response) {done();}, done);          
        } else {
          done();
        }
      }, done);
    });
    it('should read from a write in the same transaction', function(done){
      var tid = null;
      db.transactions.open().result().
      then(function(response) {
        tid = response.txid;
        return db.documents.write({
          txid: tid,
          uri: uri,
          contentType: 'application/json',
          content: {txKey: tid}
          }).result();
        }).
      then(function(response) {
        return db.read({uris:uri, txid:tid}).result();
        }).
      then(function(documents) {
        documents.length.should.equal(1);
        var document = documents[0];
        document.should.be.ok;
        document.should.have.property('content');
        document.content.should.have.property('txKey');
        document.content.txKey.should.equal(tid);
        return db.probe(uri).result();
        }).
      then(function(response) {
        response.should.be.ok;
        response.exists.should.eql(false);
        return db.transactions.commit(tid).result();
        }).
      then(function(response) {
        return db.read(uri).result();
        }).
      then(function(documents) {
        documents.length.should.equal(1);
        var document = documents[0];
        document.should.be.ok;
        document.should.have.property('content');
        document.content.should.have.property('txKey');
        document.content.txKey.should.equal(tid);
        db.remove(uri).
          result(function(response) {done();}, done);
        },
        function(primaryError){
          db.transactions.rollback(tid).result(function(data){
            done(primaryError);
          }, function(secondaryError){
            done(primaryError);
          });
        });
    });
  });
  describe('with rollback', function(){
    this.timeout(5000);
    var uri = '/test/txn/rollback1.json';
    before(function(done){
      db.probe(uri).result(function(document){
        if (document.exists) {
          db.remove(uri).
            result(function(response) {done();}, done);          
        } else {
          done();
        }
      }, done);
    });
    it('should rollback a write', function(done){
      var tid = null;
      db.transactions.open().result().
      then(function(response) {
        tid = response.txid;
        return db.documents.write({
          txid: tid,
          uri: uri,
          contentType: 'application/json',
          content: {txKey: tid}
          }).result();
        }).
      then(function(response) {
        return db.read({uris:uri, txid:tid}).result();
        }).
      then(function(documents) {
        documents.length.should.equal(1);
        var document = documents[0];
        document.should.be.ok;
        document.should.have.property('content');
        document.content.should.have.property('txKey');
        document.content.txKey.should.equal(tid);
        return db.transactions.rollback(tid).result();
        }).
      then(function(response) {
        return db.probe(uri).result();
        }).
      then(function(response) {
        response.should.be.ok;
        response.exists.should.eql(false);
        done();
        }, done);
    });
  });
  describe('transaction status', function(){
    this.timeout(5000);
    var uri = '/test/txn/read1.json';
    it('should read an open transaction', function(done){
      var tid = null;
      db.transactions.open().result().
      then(function(response) {
        tid = response.txid;
        return db.documents.write({
          txid: tid,
          uri: uri,
          contentType: 'application/json',
          content: {txKey: tid}
          }).result();
        }).
      then(function(response) {
        return db.transactions.read(tid).result();
        }).
      then(function(response) {
        // TODO: pre-parse based on accept header
        var status = JSON.parse(response)['transaction-status'];
        var hostId        = status.host['host-id'];
        var transactionId = status['transaction-id'];
        tid.should.equal(hostId+'_'+transactionId);
        return db.transactions.rollback(tid).result();
        }).
      then(function(response) {
        response.should.be.ok;
        done();
        }, done);
    });
  });
});
