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

var fs = require('fs');
var concatStream = require('concat-stream');
var valcheck = require('core-util-is');

var testconfig = require('../etc/test-config.js');

var marklogic = require('../');
var q = marklogic.queryBuilder;

var db = marklogic.createDatabaseClient(testconfig.restWriterConnection);
var restAdminDB = marklogic.createDatabaseClient(testconfig.restAdminConnection);

describe('extension libraries', function(){
  var dbPath = '/marklogic/query/custom/directoryConstraint.xqy';
  var fsPath = './test-basic/data/directoryConstraint.xqy';
  describe('when configuring', function() {
    it('should write the extension library', function(done){
      this.timeout(3000);
      fs.createReadStream(fsPath).
      pipe(concatStream({encoding: 'string'}, function(source) {
        restAdminDB.config.extlibs.write(dbPath, 'application/xquery', source).
        result(function(response){done();}, done);
      }));
    });
    it('should read the extension library', function(done){
      restAdminDB.config.extlibs.read(dbPath).
      result(function(source){
        (!valcheck.isNullOrUndefined(source)).should.equal(true);
        done();
      }, done);
    });
    it('should list the extension libraries', function(done){
      restAdminDB.config.extlibs.list().
      result(function(response){
        response.should.have.property('assets');
        response.assets.length.should.be.greaterThan(0);
        done();
      }, done);
    });
    it('should delete the extension library', function(done) {
      restAdminDB.config.extlibs.remove(dbPath).
      result(function(response){
        done();
      }, done);
    });
    // TODO: test streaming of source and list
  });

  describe('when using', function() {
    before(function(done){
      this.timeout(3000);
      fs.createReadStream(fsPath).
      pipe(concatStream({encoding: 'string'}, function(source) {
        restAdminDB.config.extlibs.write(dbPath, 'application/xquery', source).result().
        then(function(response) {
          db.documents.write({
            uri: '/test/extlib/queryDoc1.json',
            collections: ['constraintList'],
            contentType: 'application/json',
            content: {
              rangeKey1:         'constraintValue',
              constraintQueryKey:'constraint query value'
              }
            }).
          result(function(response){done();}, done);
          }, done);
      }));
    });
    after(function(done) {
      restAdminDB.config.extlibs.remove(dbPath).
      result(function(response){done();}, done);
    });
    it('a custom constraint to parse', function(done){
      db.query(
        q.where(
          q.parsedFrom('dirs:/test/',
            q.parseBindings(
              q.parseFunction('directoryConstraint', q.bind('dirs'))
              ))
          )
        ).
      result(function(documents) {
        documents.should.be.ok;
        documents.length.should.be.greaterThan(0);
        done();
      }, done);
    });
    it('a custom constraint for facet calculation', function(done){
      db.query(
          q.where().
          calculate(
              q.facet('directories', q.calculateFunction('directoryConstraint'))
              ).
          slice(0)
          ).
          result(function(response) {
            response.should.have.property('facets');
            response.facets.should.have.property('directories');
            response.facets.directories.should.have.property('facetValues');
            response.facets.directories.facetValues.length.should.be.greaterThan(0);
            done();
          }, done);
    });
    it('should merge constraints', function(done) {
      db.query(
          q.where(
              q.parsedFrom('range:constraintValue dirs:/test/',
                q.parseBindings(
                  q.range('rangeKey1', q.bind('range'),
                      q.rangeOptions('max-occurs=10')),
                  q.parseFunction('directoryConstraint', q.bind('dirs'))
                  ))
              ).
          calculate(
              q.facet('range', 'rangeKey1', q.facetOptions('item-frequency')),
              q.facet('dirs', q.calculateFunction('directoryConstraint'))
              ).
          slice(0)
          ).
          result(function(response) {
            response.should.have.property('facets');
            response.facets.should.have.property('dirs');
            response.facets.dirs.should.have.property('facetValues');
            response.facets.dirs.facetValues.length.should.be.greaterThan(0);
            response.facets.should.have.property('range');
            response.facets.range.should.have.property('facetValues');
            response.facets.range.facetValues.length.should.be.greaterThan(0);
            done();
          }, done);
      // TODO: mix of implicit bindings for facets and explicit bindings
    });
  });
});
