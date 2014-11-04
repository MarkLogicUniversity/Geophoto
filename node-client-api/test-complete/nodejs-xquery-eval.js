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
var dbEval = marklogic.createDatabaseClient(testconfig.restEvaluatorConnection);
var dbAdmin = marklogic.createDatabaseClient(testconfig.restAdminConnection);

describe('Server xquery eval test', function(){

  it('should do simple xquery eval', function(done){
    dbEval.xqueryEval('fn:true()').result(function(values) {
      console.log(values);
      done();
    }, done);
  });

  it('should do more complex xquery eval with string', function(done){
    dbEval.xqueryEval('let $s := "hello"' + 
                      'let $t := "world"' +
                      'return fn:concat($s, " ", $t)')
    .result(function(values) {
      console.log(values);
      done();
    }, done);
  });

  it('should do more complex xquery eval with xml node', function(done){
    dbEval.xqueryEval('for $i in (1, 2), $j in ("a", "b")' + 
                      'return <oneEval>i is {$i} and js is {$j}</oneEval>')
    .result(function(values) {
      console.log(values);
      done();
    }, done);
  });

  it('should do more complex xquery eval with json', function(done){
    dbEval.xqueryEval('let $object := json:object()' + 
                      'let $_ := map:put($object, "a", 111)' +
                      'return xdmp:to-json($object)')
    .result(function(values) {
      console.log(values);
      done();
    }, done);
  });

});
