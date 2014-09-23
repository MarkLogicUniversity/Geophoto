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
var assert = require('assert');
var should = require('should');
var q = require('../lib/query-builder.js');

describe('query-builder', function() {
  it('should create an and-query', function(){
    assert.deepEqual(
        q.and(q.collection('foo')),
        {'and-query':{queries:[
          {'collection-query': {uri:['foo']}}
          ]}}
        );
    assert.deepEqual(
        q.and([q.collection('foo')]),
        {'and-query':{queries:[
          {'collection-query': {uri:['foo']}}
          ]}}
        );
    assert.deepEqual(
        q.and(q.collection('foo'), q.ordered(true)),
        {'and-query':{queries:[
          {'collection-query': {uri:['foo']}}
          ], ordered: true}}
        );
    assert.deepEqual(
        q.and([q.collection('foo')], q.ordered(true)),
        {'and-query':{queries:[
          {'collection-query': {uri:['foo']}}
          ], ordered: true}}
        );
    assert.deepEqual(
        q.and([q.collection('foo'), q.ordered(true)]),
        {'and-query':{queries:[
          {'collection-query': {uri:['foo']}}
          ], ordered: true}}
        );
    assert.deepEqual(
        q.and(q.collection('foo'), q.collection('bar')),
        {'and-query':{queries:[
          {'collection-query': {uri:['foo']}},
          {'collection-query': {uri:['bar']}}
          ]}}
        );
    assert.deepEqual(
        q.and([q.collection('foo'), q.collection('bar')]),
        {'and-query':{queries:[
          {'collection-query': {uri:['foo']}},
          {'collection-query': {uri:['bar']}}
          ]}}
        );
    assert.deepEqual(
        q.and(q.collection('foo'), q.collection('bar'), q.ordered(true)),
        {'and-query':{queries:[
          {'collection-query': {uri:['foo']}},
          {'collection-query': {uri:['bar']}}
          ], ordered: true}}
        );
    assert.deepEqual(
        q.and([q.collection('foo'), q.collection('bar')], q.ordered(true)),
        {'and-query':{queries:[
          {'collection-query': {uri:['foo']}},
          {'collection-query': {uri:['bar']}}
          ], ordered: true}}
        );
    assert.deepEqual(
        q.and([q.collection('foo'), q.collection('bar'), q.ordered(true)]),
        {'and-query':{queries:[
          {'collection-query': {uri:['foo']}},
          {'collection-query': {uri:['bar']}}
          ], ordered: true}}
        );
  });

  it('should create an and-not-query', function(){
    assert.deepEqual(
        q.andNot(q.collection('foo'), q.collection('bar')),
        {'and-not-query':{
          'positive-query': {'collection-query': {uri:['foo']}},
          'negative-query': {'collection-query': {uri:['bar']}}
        }}
        );
    assert.deepEqual(
        q.andNot([q.collection('foo'), q.collection('bar')]),
        {'and-not-query':{
          'positive-query': {'collection-query': {uri:['foo']}},
          'negative-query': {'collection-query': {uri:['bar']}}
        }}
        );
  });

  it('should create an attribute name', function(){
    assert.deepEqual(
        q.attribute('foo', 'bar'),
        {element:{name: 'foo'}, attribute:{name: 'bar'}}
        );
    assert.deepEqual(
        q.attribute(['foo', 'bar']),
        {element:{name: 'foo'}, attribute:{name: 'bar'}}
        );
    assert.deepEqual(
        q.attribute('foo', 'bar', 'baz'),
        {element:{ns: 'foo', name: 'bar'}, attribute:{name: 'baz'}}
        );
    assert.deepEqual(
        q.attribute(q.qname('foo'), 'bar', 'baz'),
        {element:{name: 'foo'}, attribute:{ns: 'bar', name: 'baz'}}
        );
    assert.deepEqual(
        q.attribute(['foo', 'bar', 'baz']),
        {element:{ns: 'foo', name: 'bar'}, attribute:{name: 'baz'}}
        );
    assert.deepEqual(
        q.attribute('foo', 'bar', 'baz', 'quix'),
        {element:{ns: 'foo', name: 'bar'}, attribute:{ns: 'baz', name: 'quix'}}
        );
    assert.deepEqual(
        q.attribute(['foo', 'bar', 'baz', 'quix']),
        {element:{ns: 'foo', name: 'bar'}, attribute:{ns: 'baz', name: 'quix'}}
        );
    assert.deepEqual(
        q.attribute(['foo', 'bar'], ['baz', 'quix']),
        {element:{ns: 'foo', name: 'bar'}, attribute:{ns: 'baz', name: 'quix'}}
        );
    assert.deepEqual(
        q.attribute(['foo', 'bar'], 'baz', 'quix'),
        {element:{ns: 'foo', name: 'bar'}, attribute:{ns: 'baz', name: 'quix'}}
        );
  });

  it('should create a boost-query', function(){
    assert.deepEqual(
        q.boost(q.collection('foo'), q.collection('bar')),
        {'boost-query':{
          'matching-query': {'collection-query': {uri:['foo']}},
          'boosting-query': {'collection-query': {uri:['bar']}}
        }}
        );
    assert.deepEqual(
        q.boost([q.collection('foo'), q.collection('bar')]),
        {'boost-query':{
          'matching-query': {'collection-query': {uri:['foo']}},
          'boosting-query': {'collection-query': {uri:['bar']}}
        }}
        );
  });

  it('should create a box region', function(){
    assert.deepEqual(
        q.box(1.1, 2.2, 3.3, 4.4),
        {box:{south:1.1, west:2.2, north:3.3, east:4.4}}
        );
    assert.deepEqual(
        q.box([1.1, 2.2, 3.3, 4.4]),
        {box:{south:1.1, west:2.2, north:3.3, east:4.4}}
        );
    assert.deepEqual(
        q.box(q.southWestNorthEast(1.1, 2.2, 3.3, 4.4)),
        {box:{south:1.1, west:2.2, north:3.3, east:4.4}}
        );
  });

  it('should create a circle region', function(){
    assert.deepEqual(
        q.circle(3.3, 1.1, 2.2),
        {circle:{radius:3.3, point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.circle([3.3, 1.1, 2.2]),
        {circle:{radius:3.3, point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.circle(3.3, [1.1, 2.2]),
        {circle:{radius:3.3, point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.circle(3.3, q.latlon(1.1, 2.2)),
        {circle:{radius:3.3, point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.circle(3.3, q.point(1.1, 2.2)),
        {circle:{radius:3.3, point:[{latitude:1.1, longitude:2.2}]}}
        );
  });

  it('should create a collection-query', function(){
    assert.deepEqual(
        q.collection('foo'),
        {'collection-query':{uri:['foo']}}
        );
    assert.deepEqual(
        q.collection(['foo']),
        {'collection-query':{uri:['foo']}}
        );
    assert.deepEqual(
        q.collection('foo', 'bar'),
        {'collection-query':{uri:['foo', 'bar']}}
        );
    assert.deepEqual(
        q.collection(['foo', 'bar']),
        {'collection-query':{uri:['foo', 'bar']}}
        );
  });

  it('should create a datatype', function(){
    assert.deepEqual(
        q.datatype('string'),
        {datatype: 'xs:string'}
        );
    assert.deepEqual(
        q.datatype(['string']),
        {datatype: 'xs:string'}
        );
    assert.deepEqual(
        q.datatype('string', 'collation'),
        {datatype: 'xs:string', collation: 'collation'}
        );
    assert.deepEqual(
        q.datatype(['string', 'collation']),
        {datatype: 'xs:string', collation: 'collation'}
        );
  });

  it('should create a directory-query', function(){
    assert.deepEqual(
        q.directory('foo'),
        {'directory-query':{uri:['foo']}}
        );
    assert.deepEqual(
        q.directory(['foo']),
        {'directory-query':{uri:['foo']}}
        );
    assert.deepEqual(
        q.directory('foo', true),
        {'directory-query':{uri:['foo'], infinite: true}}
        );
    assert.deepEqual(
        q.directory(['foo'], true),
        {'directory-query':{uri:['foo'], infinite: true}}
        );
    assert.deepEqual(
        q.directory('foo', 'bar'),
        {'directory-query':{uri:['foo', 'bar']}}
        );
    assert.deepEqual(
        q.directory(['foo', 'bar']),
        {'directory-query':{uri:['foo', 'bar']}}
        );
    assert.deepEqual(
        q.directory('foo', 'bar', true),
        {'directory-query':{uri:['foo', 'bar'], infinite: true}}
        );
    assert.deepEqual(
        q.directory(['foo', 'bar'], true),
        {'directory-query':{uri:['foo', 'bar'], infinite: true}}
        );
  });

  it('should create a document-query', function(){
    assert.deepEqual(
        q.document('foo'),
        {'document-query':{uri:['foo']}}
        );
    assert.deepEqual(
        q.document(['foo']),
        {'document-query':{uri:['foo']}}
        );
    assert.deepEqual(
        q.document('foo', 'bar'),
        {'document-query':{uri:['foo', 'bar']}}
        );
    assert.deepEqual(
        q.document(['foo', 'bar']),
        {'document-query':{uri:['foo', 'bar']}}
        );
  });

  it('should create a document-fragment-query', function(){
    assert.deepEqual(
        q.documentFragment(q.collection('foo')),
        {'document-fragment-query':{'collection-query': {uri:['foo']}}}
        );
    assert.deepEqual(
        q.documentFragment([q.collection('foo')]),
        {'document-fragment-query':{'collection-query': {uri:['foo']}}}
        );
  });

  it('should create an element name', function(){
    assert.deepEqual(
        q.element('foo'),
        {element:{name: 'foo'}}
        );
    assert.deepEqual(
        q.element(['foo']),
        {element:{name: 'foo'}}
        );
    assert.deepEqual(
        q.element(q.qname('foo')),
        {element:{name: 'foo'}}
        );
    assert.deepEqual(
        q.element('foo', 'bar'),
        {element:{ns: 'foo', name: 'bar'}}
        );
    assert.deepEqual(
        q.element(['foo', 'bar']),
        {element:{ns: 'foo', name: 'bar'}}
        );
    assert.deepEqual(
        q.element(q.qname('foo', 'bar')),
        {element:{ns: 'foo', name: 'bar'}}
        );
  });

  it('should create a field name', function(){
    assert.deepEqual(
        q.field('foo'),
        {field: 'foo'}
        );
    assert.deepEqual(
        q.field(['foo']),
        {field: 'foo'}
        );
  });

  it('should create a fragment scope', function(){
    assert.deepEqual(
        q.fragmentScope('documents'),
        {'fragment-scope': 'documents'}
        );
    assert.deepEqual(
        q.fragmentScope(['documents']),
        {'fragment-scope': 'documents'}
        );
  });

  it('should create geo-attribute-pair queries', function(){
    assert.deepEqual(
        q.geoAttributePair('parent', 'latitude', 'longitude', q.latlon(1.1, 2.2)),
        {'geo-attr-pair-query':{parent:{name:'parent'},
          lat:{name:'latitude'}, lon:{name:'longitude'},
          point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.geoAttributePair(q.qname('parent'), q.qname('latitude'), q.qname('longitude'),
            q.point(1.1, 2.2)),
        {'geo-attr-pair-query':{parent:{name:'parent'},
          lat:{name:'latitude'}, lon:{name:'longitude'},
          point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.geoAttributePair(q.attribute('parent', 'latitude'),
            q.attribute('parent', 'longitude'),
            q.point(1.1, 2.2)),
        {'geo-attr-pair-query':{parent:{name:'parent'},
          lat:{name:'latitude'}, lon:{name:'longitude'},
          point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.geoAttributePair([q.qname('parent'), q.qname('latitude'), q.qname('longitude'),
                            q.point(1.1, 2.2)]),
        {'geo-attr-pair-query':{parent:{name:'parent'},
          lat:{name:'latitude'}, lon:{name:'longitude'},
          point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.geoAttributePair('parent', 'latitude', 'longitude', q.latlon(1.1, 2.2),
            q.fragmentScope('documents'), q.geoOption('boundaries-included')),
        {'geo-attr-pair-query':{parent:{name:'parent'},
          lat:{name:'latitude'}, lon:{name:'longitude'},
          point:[{latitude:1.1, longitude:2.2}],
          'fragment-scope': 'documents',
          'geo-option':['boundaries-included']}}
        );
  });

  it('should create geo-element queries', function(){
    assert.deepEqual(
        q.geoElement('parent', 'element', q.latlon(1.1, 2.2)),
        {'geo-elem-query':{parent:{name:'parent'},
          element:{name:'element'},
          point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.geoElement(q.qname('parent'), q.qname('element'), q.point(1.1, 2.2)),
        {'geo-elem-query':{parent:{name:'parent'},
          element:{name:'element'},
          point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.geoElement(q.element('parent'), q.element('element'), q.point(1.1, 2.2)),
        {'geo-elem-query':{parent:{name:'parent'},
          element:{name:'element'},
          point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.geoElement([q.qname('parent'), q.qname('element'), q.point(1.1, 2.2)]),
        {'geo-elem-query':{parent:{name:'parent'},
          element:{name:'element'},
          point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.geoElement('parent', 'element', q.latlon(1.1, 2.2), q.fragmentScope('documents'),
            q.geoOption('boundaries-included')),
        {'geo-elem-query':{parent:{name:'parent'},
          element:{name:'element'},
          point:[{latitude:1.1, longitude:2.2}],
          'fragment-scope': 'documents',
          'geo-option':['boundaries-included']}}
        );
  });

  it('should create geo-element-pair queries', function(){
    assert.deepEqual(
        q.geoElementPair('parent', 'latitude', 'longitude', q.latlon(1.1, 2.2)),
        {'geo-elem-pair-query':{parent:{name:'parent'},
          lat:{name:'latitude'}, lon:{name:'longitude'},
          point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.geoElementPair(q.qname('parent'), q.qname('latitude'), q.qname('longitude'),
            q.point(1.1, 2.2)),
        {'geo-elem-pair-query':{parent:{name:'parent'},
          lat:{name:'latitude'}, lon:{name:'longitude'},
          point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.geoElementPair(q.element('parent'), q.element('latitude'), q.element('longitude'),
            q.point(1.1, 2.2)),
        {'geo-elem-pair-query':{parent:{name:'parent'},
          lat:{name:'latitude'}, lon:{name:'longitude'},
          point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.geoElementPair([q.qname('parent'), q.qname('latitude'), q.qname('longitude'),
                          q.point(1.1, 2.2)]),
        {'geo-elem-pair-query':{parent:{name:'parent'},
          lat:{name:'latitude'}, lon:{name:'longitude'},
          point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.geoElementPair('parent', 'latitude', 'longitude', q.latlon(1.1, 2.2),
            q.fragmentScope('documents'), q.geoOption('boundaries-included')),
        {'geo-elem-pair-query':{parent:{name:'parent'},
          lat:{name:'latitude'}, lon:{name:'longitude'},
          point:[{latitude:1.1, longitude:2.2}],
          'fragment-scope': 'documents',
          'geo-option':['boundaries-included']}}
        );
  });

  it('should create geo-path queries', function(){
    assert.deepEqual(
        q.geoPath('foo', q.latlon(1.1, 2.2)),
        {'geo-path-query':{'path-index':{text: 'foo', namespaces: ''},
          point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.geoPath('foo', [1.1, 2.2]),
        {'geo-path-query':{'path-index':{text: 'foo', namespaces: ''},
          point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.geoPath(q.pathIndex('foo', {bar: 'baz'}), q.point(1.1, 2.2)),
        {'geo-path-query':{'path-index':{text: 'foo', namespaces: {bar: 'baz'}},
          point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.geoPath(['foo', {bar: 'baz'}], [1.1, 2.2]),
        {'geo-path-query':{'path-index':{text: 'foo', namespaces: {bar: 'baz'}},
          point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.geoPath([q.pathIndex('foo', {bar: 'baz'}), q.point(1.1, 2.2)]),
        {'geo-path-query':{'path-index':{text: 'foo', namespaces: {bar: 'baz'}},
          point:[{latitude:1.1, longitude:2.2}]}}
        );
    assert.deepEqual(
        q.geoPath(q.pathIndex('foo', {bar: 'baz'}), q.point(1.1, 2.2),
            q.fragmentScope('documents'), q.geoOption('boundaries-included')),
        {'geo-path-query':{'path-index':{text: 'foo', namespaces: {bar: 'baz'}},
          point:[{latitude:1.1, longitude:2.2}],
          'fragment-scope': 'documents',
          'geo-option':['boundaries-included']}}
        );
  });

  it('should create geo options', function(){
    assert.deepEqual(
        q.geoOption('boundaries-included'),
        {'geo-option':['boundaries-included']}
        );
    assert.deepEqual(
        q.geoOption(['boundaries-included']),
        {'geo-option':['boundaries-included']}
        );
    assert.deepEqual(
        q.geoOption('boundaries-included', 'boundaries-latitude-excluded'),
        {'geo-option':['boundaries-included', 'boundaries-latitude-excluded']}
        );
    assert.deepEqual(
        q.geoOption(['boundaries-included', 'boundaries-latitude-excluded']),
        {'geo-option':['boundaries-included', 'boundaries-latitude-excluded']}
        );
  });

  it('should create a heatmap facet', function(){
    assert.deepEqual(
        q.geoElement('parent', 'element',
            q.heatmap(2, 3, q.southWestNorthEast(1.1, 2.2, 3.3, 4.4))),
        {'geo-elem':{parent:{name:'parent'},
          element:{name:'element'},
          heatmap:{latdivs:2, londivs:3, s:1.1, w:2.2, n:3.3, e:4.4}}}
        );
    assert.deepEqual(
        q.geoElement('parent', 'element',
            q.heatmap(2, 3, 1.1, 2.2, 3.3, 4.4)),
        {'geo-elem':{parent:{name:'parent'},
          element:{name:'element'},
          heatmap:{latdivs:2, londivs:3, s:1.1, w:2.2, n:3.3, e:4.4}}}
        );
  });

  it('should create a locks-query', function(){
    assert.deepEqual(
        q.locks(q.collection('foo')),
        {'locks-query':{'collection-query': {uri:['foo']}}}
        );
    assert.deepEqual(
        q.locks([q.collection('foo')]),
        {'locks-query':{'collection-query': {uri:['foo']}}}
        );
  });

  it('should create a near-query', function(){
    assert.deepEqual(
        q.near(q.collection('foo'), q.collection('bar')),
        {'near-query':{queries:[
          {'collection-query': {uri:['foo']}},
          {'collection-query': {uri:['bar']}}
          ]}}
        );
    assert.deepEqual(
        q.near([q.collection('foo'), q.collection('bar')]),
        {'near-query':{queries:[
          {'collection-query': {uri:['foo']}},
          {'collection-query': {uri:['bar']}}
          ]}}
        );
    assert.deepEqual(
        q.near(q.collection('foo'), q.collection('bar'), 3),
        {'near-query':{queries:[
          {'collection-query': {uri:['foo']}},
          {'collection-query': {uri:['bar']}}
          ], distance: 3}}
        );
    assert.deepEqual(
        q.near([q.collection('foo'), q.collection('bar')], 3),
        {'near-query':{queries:[
          {'collection-query': {uri:['foo']}},
          {'collection-query': {uri:['bar']}}
          ], distance: 3}}
        );
    assert.deepEqual(
        q.near([q.collection('foo'), q.collection('bar'), 3]),
        {'near-query':{queries:[
          {'collection-query': {uri:['foo']}},
          {'collection-query': {uri:['bar']}}
          ], distance: 3}}
        );
    assert.deepEqual(
        q.near(q.collection('foo'), q.collection('bar'), 3, q.weight(4)),
        {'near-query':{queries:[
          {'collection-query': {uri:['foo']}},
          {'collection-query': {uri:['bar']}}
          ], distance: 3, weight: 4}}
        );
    assert.deepEqual(
        q.near([q.collection('foo'), q.collection('bar')], 3, q.weight(4)),
        {'near-query':{queries:[
          {'collection-query': {uri:['foo']}},
          {'collection-query': {uri:['bar']}}
          ], distance: 3, weight: 4}}
        );
    assert.deepEqual(
        q.near([q.collection('foo'), q.collection('bar'), 3, q.weight(4)]),
        {'near-query':{queries:[
          {'collection-query': {uri:['foo']}},
          {'collection-query': {uri:['bar']}}
          ], distance: 3, weight: 4}}
        );
    assert.deepEqual(
        q.near(q.collection('foo'), q.collection('bar'), 3, q.weight(4),
            q.ordered(true)),
        {'near-query':{queries:[
          {'collection-query': {uri:['foo']}},
          {'collection-query': {uri:['bar']}}
          ], distance: 3, weight: 4, ordered: true}}
        );
    assert.deepEqual(
        q.near([q.collection('foo'), q.collection('bar')], 3, q.weight(4),
            q.ordered(true)),
        {'near-query':{queries:[
          {'collection-query': {uri:['foo']}},
          {'collection-query': {uri:['bar']}}
          ], distance: 3, weight: 4, ordered: true}}
        );
    assert.deepEqual(
        q.near([q.collection('foo'), q.collection('bar'), 3, q.weight(4),
                q.ordered(true)]),
        {'near-query':{queries:[
          {'collection-query': {uri:['foo']}},
          {'collection-query': {uri:['bar']}}
          ], distance: 3, weight: 4, ordered: true}}
        );
  });

  it('should create a not-query', function(){
    assert.deepEqual(
        q.not(q.collection('foo')),
        {'not-query':{'collection-query': {uri:['foo']}}}
        );
    assert.deepEqual(
        q.not([q.collection('foo')]),
        {'not-query':{'collection-query': {uri:['foo']}}}
        );
  });

  it('should create a not-in-query', function(){
    assert.deepEqual(
        q.notIn(q.collection('foo'), q.collection('bar')),
        {'not-in-query':{
          'positive-query': {'collection-query': {uri:['foo']}},
          'negative-query': {'collection-query': {uri:['bar']}}
        }}
        );
    assert.deepEqual(
        q.notIn([q.collection('foo'), q.collection('bar')]),
        {'not-in-query':{
          'positive-query': {'collection-query': {uri:['foo']}},
          'negative-query': {'collection-query': {uri:['bar']}}
        }}
        );
  });

  it('should create an or-query', function(){
    assert.deepEqual(
        q.or(q.collection('foo')),
        {'or-query':{queries:[
          {'collection-query': {uri:['foo']}}
          ]}}
        );
    assert.deepEqual(
        q.or([q.collection('foo')]),
        {'or-query':{queries:[
          {'collection-query': {uri:['foo']}}
          ]}}
        );
    assert.deepEqual(
        q.or(q.collection('foo'), q.collection('bar')),
        {'or-query':{queries:[
          {'collection-query': {uri:['foo']}},
          {'collection-query': {uri:['bar']}}
          ]}}
        );
    assert.deepEqual(
        q.or([q.collection('foo'), q.collection('bar')]),
        {'or-query':{queries:[
          {'collection-query': {uri:['foo']}},
          {'collection-query': {uri:['bar']}}
          ]}}
        );
  });

  it('should create a path index', function(){
    assert.deepEqual(
        q.pathIndex('foo'),
        {'path-index': {text: 'foo', namespaces: ''}}
        );
    assert.deepEqual(
        q.pathIndex(['foo']),
        {'path-index': {text: 'foo', namespaces: ''}}
        );
    assert.deepEqual(
        q.pathIndex('foo', {bar: 'baz'}),
        {'path-index': {text: 'foo', namespaces: {bar: 'baz'}}}
        );
    assert.deepEqual(
        q.pathIndex(['foo', {bar: 'baz'}]),
        {'path-index': {text: 'foo', namespaces: {bar: 'baz'}}}
        );
  });

  it('should create a properties-query', function(){
    assert.deepEqual(
        q.properties(q.collection('foo')),
        {'properties-query':{'collection-query': {uri:['foo']}}}
        );
    assert.deepEqual(
        q.properties([q.collection('foo')]),
        {'properties-query':{'collection-query': {uri:['foo']}}}
        );
  });

  it('should create a point', function(){
    assert.deepEqual(
        q.point(1.1, 2.2),
        {point:[{latitude:1.1, longitude:2.2}]}
        );
    assert.deepEqual(
        q.point([1.1, 2.2]),
        {point:[{latitude:1.1, longitude:2.2}]}
        );
    assert.deepEqual(
        q.point(q.latlon(1.1, 2.2)),
        {point:[{latitude:1.1, longitude:2.2}]}
        );
  });

  it('should create a polygon', function(){
    assert.deepEqual(
        q.polygon([1.1, 2.2], [3.3, 4.4]),
        {polygon:{point:[{latitude:1.1, longitude:2.2}, {latitude:3.3, longitude:4.4}]}}
        );
    assert.deepEqual(
        q.polygon(q.point(1.1, 2.2), q.point(3.3, 4.4)),
        {polygon:{point:[{latitude:1.1, longitude:2.2}, {latitude:3.3, longitude:4.4}]}}
        );
    assert.deepEqual(
        q.polygon([q.point(1.1, 2.2), q.point(3.3, 4.4)]),
        {polygon:{point:[{latitude:1.1, longitude:2.2}, {latitude:3.3, longitude:4.4}]}}
        );
    assert.deepEqual(
        q.polygon(q.latlon(1.1, 2.2), q.latlon(3.3, 4.4)),
        {polygon:{point:[{latitude:1.1, longitude:2.2}, {latitude:3.3, longitude:4.4}]}}
        );
    assert.deepEqual(
        q.polygon([q.latlon(1.1, 2.2), q.latlon(3.3, 4.4)]),
        {polygon:{point:[{latitude:1.1, longitude:2.2}, {latitude:3.3, longitude:4.4}]}}
        );
  });

  it('should create a property name', function(){
    assert.deepEqual(
        q.property ('foo'),
        {'json-property': 'foo'}
        );
    assert.deepEqual(
        q.property(['foo']),
        {'json-property': 'foo'}
        );
  });

  it('should create a QName', function(){
    assert.deepEqual(
        q.qname('foo'),
        {qname:{name: 'foo'}}
        );
    assert.deepEqual(
        q.qname(['foo']),
        {qname:{name: 'foo'}}
        );
    assert.deepEqual(
        q.qname('foo', 'bar'),
        {qname:{ns: 'foo', name: 'bar'}}
        );
    assert.deepEqual(
        q.qname(['foo', 'bar']),
        {qname:{ns: 'foo', name: 'bar'}}
        );
  });

  it('should create a range query', function(){
    assert.deepEqual(
        q.range('foo', 1),
        {'range-query':{
          'json-property': 'foo',
          'range-operator': 'EQ',
          value: [1]
          }}
        );
    assert.deepEqual(
        q.range(q.property('foo'), 1),
        {'range-query':{
          'json-property': 'foo',
          'range-operator': 'EQ',
          value: [1]
          }}
        );
    assert.deepEqual(
        q.range('foo', 1, 2),
        {'range-query':{
          'json-property': 'foo',
          'range-operator': 'EQ',
          value: [1, 2]
          }}
        );
    assert.deepEqual(
        q.range('foo', [1, 2]),
        {'range-query':{
          'json-property': 'foo',
          'range-operator': 'EQ',
          value: [1, 2]
          }}
        );
    assert.deepEqual(
        q.range(['foo', 1, 2]),
        {'range-query':{
          'json-property': 'foo',
          'range-operator': 'EQ',
          value: [1, 2]
          }}
        );
    assert.deepEqual(
        q.range('foo', '>', 1),
        {'range-query':{
          'json-property': 'foo',
          'range-operator': 'GT',
          value: [1]
          }}
        );
    assert.deepEqual(
        q.range('foo', 'xs:int', '>=', 1),
        {'range-query':{
          'json-property': 'foo',
          type: 'xs:int',
          'range-operator': 'GE',
          value: [1]
          }}
        );
    assert.deepEqual(
        q.range('foo', q.datatype('int'), '>=', 1),
        {'range-query':{
          'json-property': 'foo',
          type: 'xs:int',
          'range-operator': 'GE',
          value: [1]
          }}
        );
    assert.deepEqual(
        q.range('foo', 'xs:string', '=', 'one', 'two'),
        {'range-query':{
          'json-property': 'foo',
          type: 'xs:string',
          'range-operator': 'EQ',
          value: ['one', 'two']
          }}
        );
    assert.deepEqual(
        q.range('foo', q.datatype('string'), '=', 'one', 'two'),
        {'range-query':{
          'json-property': 'foo',
          type: 'xs:string',
          'range-operator': 'EQ',
          value: ['one', 'two']
          }}
        );
    assert.deepEqual(
        q.range('foo', q.datatype('string'), '=', ['one', 'two']),
        {'range-query':{
          'json-property': 'foo',
          type: 'xs:string',
          'range-operator': 'EQ',
          value: ['one', 'two']
          }}
        );
    assert.deepEqual(
        q.range(['foo', q.datatype('string'), '=', 'one', 'two']),
        {'range-query':{
          'json-property': 'foo',
          type: 'xs:string',
          'range-operator': 'EQ',
          value: ['one', 'two']
          }}
        );
    assert.deepEqual(
        q.range('foo', 1, q.fragmentScope('properties')),
        {'range-query':{
          'json-property': 'foo',
          'range-operator': 'EQ',
          value: [1],
          'fragment-scope': 'properties'
          }}
        );
    assert.deepEqual(
        q.range('foo', 1, q.rangeOptions('cached')),
        {'range-query':{
          'json-property': 'foo',
          'range-operator': 'EQ',
          value: [1],
          'range-option':['cached']
          }}
        );
  });

  it('should create range options', function(){
    assert.deepEqual(
        q.rangeOptions('cached'),
        {'range-option':['cached']}
        );
    assert.deepEqual(
        q.rangeOptions(['cached']),
        {'range-option':['cached']}
        );
    assert.deepEqual(
        q.rangeOptions('cached', 'min-occurs=3'),
        {'range-option':['cached', 'min-occurs=3']}
        );
    assert.deepEqual(
        q.rangeOptions(['cached', 'min-occurs=3']),
        {'range-option':['cached', 'min-occurs=3']}
        );
  });

  it('should create a scope query (container-query)', function(){
    assert.deepEqual(
        q.scope('foo', q.collection('bar')),
        {'container-query':{
          'json-property': 'foo',
          'collection-query':{uri:['bar']}
          }}
        );
    assert.deepEqual(
        q.scope(['foo', q.collection('bar')]),
        {'container-query':{
          'json-property': 'foo',
          'collection-query':{uri:['bar']}
          }}
        );
    assert.deepEqual(
        q.scope(q.element('foo'), q.collection('bar')),
        {'container-query':{
          'element': {name: 'foo'},
          'collection-query':{uri:['bar']}
          }}
        );
    assert.deepEqual(
        q.scope([q.element('foo'), q.collection('bar')]),
        {'container-query':{
          'element': {name: 'foo'},
          'collection-query':{uri:['bar']}
          }}
        );
    assert.deepEqual(
        q.scope('foo', q.fragmentScope('documents'), q.collection('bar')),
        {'container-query':{
          'json-property': 'foo',
          'fragment-scope': 'documents',
          'collection-query':{uri:['bar']}
          }}
        );
    assert.deepEqual(
        q.scope(['foo', q.fragmentScope('documents'), q.collection('bar')]),
        {'container-query':{
          'json-property': 'foo',
          'fragment-scope': 'documents',
          'collection-query':{uri:['bar']}
          }}
        );
    assert.deepEqual(
        q.scope(q.element('foo'), q.fragmentScope('documents'),
            q.collection('bar')),
        {'container-query':{
          'element': {name: 'foo'},
          'fragment-scope': 'documents',
          'collection-query':{uri:['bar']}
          }}
        );
    assert.deepEqual(
        q.scope([q.element('foo'), q.fragmentScope('documents'),
                     q.collection('bar')]),
        {'container-query':{
          'element': {name: 'foo'},
          'fragment-scope': 'documents',
          'collection-query':{uri:['bar']}
          }}
        );
  });

  it('should create a term-query', function(){
    assert.deepEqual(
        q.term('foo'),
        {'term-query':{text:['foo']}}
        );
    assert.deepEqual(
        q.term(['foo']),
        {'term-query':{text:['foo']}}
        );
    assert.deepEqual(
        q.term('foo', q.weight(2)),
        {'term-query':{text:['foo'], weight: 2}}
        );
    assert.deepEqual(
        q.term(['foo'], q.weight(2)),
        {'term-query':{text:['foo'], weight: 2}}
        );
    assert.deepEqual(
        q.term(['foo', q.weight(2)]),
        {'term-query':{text:['foo'], weight: 2}}
        );
    assert.deepEqual(
        q.term('foo', 'bar'),
        {'term-query':{text:['foo', 'bar']}}
        );
    assert.deepEqual(
        q.term(['foo', 'bar']),
        {'term-query':{text:['foo', 'bar']}}
        );
    assert.deepEqual(
        q.term('foo', 'bar', q.weight(2)),
        {'term-query':{text:['foo', 'bar'], weight: 2}}
        );
    assert.deepEqual(
        q.term(['foo', 'bar'], q.weight(2)),
        {'term-query':{text:['foo', 'bar'], weight: 2}}
        );
    assert.deepEqual(
        q.term(['foo', 'bar', q.weight(2)]),
        {'term-query':{text:['foo', 'bar'], weight: 2}}
        );
  });

  it('should create term options', function(){
    assert.deepEqual(
        q.termOptions('stemmed'),
        {'term-option':['stemmed']}
        );
    assert.deepEqual(
        q.termOptions(['stemmed']),
        {'term-option':['stemmed']}
        );
    assert.deepEqual(
        q.termOptions('stemmed', 'case-sensitive'),
        {'term-option':['stemmed', 'case-sensitive']}
        );
    assert.deepEqual(
        q.termOptions(['stemmed', 'case-sensitive']),
        {'term-option':['stemmed', 'case-sensitive']}
        );
  });

  it('should create a value query', function(){
    assert.deepEqual(
        q.value('foo', 'one'),
        {'value-query':{
          'json-property': 'foo',
          text: ['one']
          }}
        );
    assert.deepEqual(
        q.value('foo', ['one']),
        {'value-query':{
          'json-property': 'foo',
          text: ['one']
          }}
        );
    assert.deepEqual(
        q.value(['foo', 'one']),
        {'value-query':{
          'json-property': 'foo',
          text: ['one']
          }}
        );
    assert.deepEqual(
        q.value('foo', 'one', 'two'),
        {'value-query':{
          'json-property': 'foo',
          text: ['one', 'two']
          }}
        );
    assert.deepEqual(
        q.value('foo', ['one', 'two']),
        {'value-query':{
          'json-property': 'foo',
          text: ['one', 'two']
          }}
        );
    assert.deepEqual(
        q.value(['foo', 'one', 'two']),
        {'value-query':{
          'json-property': 'foo',
          text: ['one', 'two']
          }}
        );
    assert.deepEqual(
        q.value('foo', 'one', q.fragmentScope('properties')),
        {'value-query':{
          'json-property': 'foo',
          text: ['one'],
          'fragment-scope': 'properties'
          }}
        );
    assert.deepEqual(
        q.value('foo', 'one', q.termOptions('stemmed')),
        {'value-query':{
          'json-property': 'foo',
          text: ['one'],
          'term-option':['stemmed']
          }}
        );
    assert.deepEqual(
        q.value('foo', 'one', q.weight(2)),
        {'value-query':{
          'json-property': 'foo',
          text: ['one'],
          weight: 2
          }}
        );
  });

  it('should create a word query', function(){
    assert.deepEqual(
        q.word('foo', 'one'),
        {'word-query':{
          'json-property': 'foo',
          text: ['one']
          }}
        );
    assert.deepEqual(
        q.word('foo', ['one']),
        {'word-query':{
          'json-property': 'foo',
          text: ['one']
          }}
        );
    assert.deepEqual(
        q.word(['foo', 'one']),
        {'word-query':{
          'json-property': 'foo',
          text: ['one']
          }}
        );
    assert.deepEqual(
        q.word('foo', 'one', 'two'),
        {'word-query':{
          'json-property': 'foo',
          text: ['one', 'two']
          }}
        );
    assert.deepEqual(
        q.word('foo', ['one', 'two']),
        {'word-query':{
          'json-property': 'foo',
          text: ['one', 'two']
          }}
        );
    assert.deepEqual(
        q.word(['foo', 'one', 'two']),
        {'word-query':{
          'json-property': 'foo',
          text: ['one', 'two']
          }}
        );
    assert.deepEqual(
        q.word('foo', 'one', q.fragmentScope('properties')),
        {'word-query':{
          'json-property': 'foo',
          text: ['one'],
          'fragment-scope': 'properties'
          }}
        );
    assert.deepEqual(
        q.word('foo', 'one', q.termOptions('stemmed')),
        {'word-query':{
          'json-property': 'foo',
          text: ['one'],
          'term-option':['stemmed']
          }}
        );
    assert.deepEqual(
        q.word('foo', 'one', q.weight(2)),
        {'word-query':{
          'json-property': 'foo',
          text: ['one'],
          weight: 2
          }}
        );
  });

  it('should specify a constraint', function(){
    assert.deepEqual(
        q.collection('foo', q.bind('constraint1')),
        {collection:{
          prefix: 'foo'
          },
          name:'constraint1'}
        );
    assert.deepEqual(
        q.scope('foo', q.bind('constraint1')),
        {'container':{'json-property': 'foo'},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.scope('foo', q.bind('constraint1'), q.fragmentScope('properties')),
        {'container':{'json-property': 'foo', 'fragment-scope': 'properties'},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.geoAttributePair('parent', 'latitude', 'longitude', q.bind('constraint1')),
        {'geo-attr-pair':{parent:{name:'parent'},
          lat:{name:'latitude'}, lon:{name:'longitude'}},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.geoAttributePair('parent', 'latitude', 'longitude', q.bind('constraint1'),
            q.geoOption('boundaries-included')),
        {'geo-attr-pair':{parent:{name:'parent'},
          lat:{name:'latitude'}, lon:{name:'longitude'},
          'geo-option':['boundaries-included']},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.geoAttributePair('parent', 'latitude', 'longitude', q.bind('constraint1'),
            q.fragmentScope('properties')),
        {'geo-attr-pair':{parent:{name:'parent'},
          lat:{name:'latitude'}, lon:{name:'longitude'},
          'fragment-scope': 'properties'},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.geoElement('parent', 'element', q.bind('constraint1')),
        {'geo-elem':{parent:{name:'parent'},
          element:{name:'element'}},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.geoElement('parent', 'element', q.bind('constraint1'),
            q.geoOption('boundaries-included')),
        {'geo-elem':{parent:{name:'parent'},
          element:{name:'element'},
          'geo-option':['boundaries-included']},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.geoElement('parent', 'element', q.bind('constraint1'),
            q.fragmentScope('properties')),
        {'geo-elem':{parent:{name:'parent'},
          element:{name:'element'},
          'fragment-scope': 'properties'},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.geoElementPair('parent', 'latitude', 'longitude', q.bind('constraint1')),
        {'geo-elem-pair':{parent:{name:'parent'},
          lat:{name:'latitude'}, lon:{name:'longitude'}},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.geoElementPair('parent', 'latitude', 'longitude', q.bind('constraint1'),
            q.geoOption('boundaries-included')),
        {'geo-elem-pair':{parent:{name:'parent'},
          lat:{name:'latitude'}, lon:{name:'longitude'},
          'geo-option':['boundaries-included']},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.geoElementPair('parent', 'latitude', 'longitude', q.bind('constraint1'),
            q.fragmentScope('properties')),
        {'geo-elem-pair':{parent:{name:'parent'},
          lat:{name:'latitude'}, lon:{name:'longitude'},
          'fragment-scope': 'properties'},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.geoPath('foo', q.bind('constraint1')),
        {'geo-path':{'path-index':{text: 'foo', namespaces: ''}},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.geoPath('foo', q.bind('constraint1'), q.geoOption('boundaries-included')),
        {'geo-path':{'path-index':{text: 'foo', namespaces: ''},
          'geo-option':['boundaries-included']},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.geoPath('foo', q.bind('constraint1'), q.fragmentScope('properties')),
        {'geo-path':{'path-index':{text: 'foo', namespaces: ''},
          'fragment-scope': 'properties'},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.range('key1', q.bind('constraint1')),
        {range:{'json-property': 'key1'},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.range('key1', q.bind('constraint1'), q.rangeOptions('cached')),
        {range:{'json-property': 'key1', 'range-option':['cached']},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.range('key1', q.bind('constraint1'), q.fragmentScope('properties')),
        {range:{'json-property': 'key1', 'fragment-scope': 'properties'},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.value('key1', q.bind('constraint1')),
        {value:{'json-property': 'key1'},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.value('key1', q.bind('constraint1'), q.termOptions('stemmed')),
        {value:{'json-property': 'key1', 'term-option':['stemmed']},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.value('key1', q.bind('constraint1'), q.fragmentScope('properties')),
        {value:{'json-property': 'key1', 'fragment-scope': 'properties'},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.word('key1', q.bind('constraint1')),
        {word:{'json-property': 'key1'},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.word('key1', q.bind('constraint1'), q.termOptions('stemmed')),
        {word:{'json-property': 'key1', 'term-option':['stemmed']},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.word('key1', q.bind('constraint1'), q.fragmentScope('properties')),
        {word:{'json-property': 'key1', 'fragment-scope': 'properties'},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.parseBindings(
          q.value('key1', q.bind('constraint1')),
          q.word('key2', q.bind('constraint2'))
          ),
        {constraint:[
          {value:{'json-property': 'key1'}, name:'constraint1'},
          {word:{'json-property': 'key2'}, name:'constraint2'}
          ]}
        );
    assert.deepEqual(
        q.parsedFrom('word1 AND word2'),
        {parsedQuery:{qtext:'word1 AND word2'}}
        );
    assert.deepEqual(
        q.parsedFrom('constraint1:value1 AND constraint2:word2',
            q.parseBindings(
                q.value('key1', q.bind('constraint1')),
                q.word('key2', q.bind('constraint2'))
                )),
        {parsedQuery:{qtext:'constraint1:value1 AND constraint2:word2',
          constraint:[
                {value:{'json-property': 'key1'}, name:'constraint1'},
                {word:{'json-property': 'key2'}, name:'constraint2'}
                ]}}
        );
    assert.deepEqual(
        q.word('key1', q.bindDefault()),
        {'default':{word:{'json-property': 'key1'}}}
        );
    assert.deepEqual(
        q.word('key1', q.bindDefault(), q.termOptions('stemmed')),
        {'default':{word:{'json-property': 'key1', 'term-option':['stemmed']}}}
        );
    assert.deepEqual(
        q.word('key1', q.bindDefault(), q.fragmentScope('properties')),
        {'default':{word:{'json-property': 'key1', 'fragment-scope': 'properties'}}}
        );
    assert.deepEqual(
        q.word('key1', q.bindDefault(), q.weight(2)),
        {'default':{word:{'json-property': 'key1', weight: 2}}}
        );
    assert.deepEqual(
        q.bindEmptyAs('all-results'),
        {empty:{'apply': 'all-results'}}
        );
    assert.deepEqual(
        q.bindEmptyAs('no-results'),
        {empty:{'apply': 'no-results'}}
        );
    assert.deepEqual(
        q.parseFunction('module1', q.bind('constraint1')),
        {custom:{parse: {
            apply: 'parse',
            ns:    'http://marklogic.com/query/custom/module1',
            at:    '/ext/marklogic/query/custom/module1.xqy'
            },
            facet:false},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.parseFunction('module1', q.bind('constraint1'), q.termOptions('stemmed')),
        {custom:{parse: {
            apply: 'parse',
            ns:    'http://marklogic.com/query/custom/module1',
            at:    '/ext/marklogic/query/custom/module1.xqy'
            },
            'term-option':['stemmed'],
            facet:false},
          name:'constraint1'}
        );
    assert.deepEqual(
        q.parsedFrom('word1',
            q.parseBindings(
                q.word('key1', q.bindDefault())
                )),
        {parsedQuery:{qtext:'word1',
          term:{
                'default':{word:{'json-property': 'key1'}}
                }}}
        );
    assert.deepEqual(
        q.parsedFrom('',
            q.parseBindings(
                q.bindEmptyAs('all-results')
                )),
        {parsedQuery:{qtext:'',
          term:{
                empty:{'apply': 'all-results'}
                }}}
        );
  });

  it('should specify a facet', function(){
    assert.deepEqual(
        q.facet('key1'),
        {range:{
          'json-property': 'key1',
          facet: true,
          type: 'xs:string'
          },
          name:'key1'}
        );
    assert.deepEqual(
        q.facet(q.field('field2')),
        {range:{
          field: 'field2',
          facet: true,
          type: 'xs:string'
          },
          name:'field2'}
        );
    assert.deepEqual(
        q.facet('facet3', 'key3'),
        {range:{
          'json-property': 'key3',
          facet: true,
          type: 'xs:string'
          },
          name:'facet3'}
        );
    assert.deepEqual(
        q.facet('facet4', q.field('field4')),
        {range:{
          field: 'field4',
          facet: true,
          type: 'xs:string'
          },
          name:'facet4'}
        );
    assert.deepEqual(
        q.facet('key5', q.facetOptions('item-frequency', 'descending')),
        {range:{
          'json-property': 'key5',
          facet: true,
          type: 'xs:string',
          'facet-option': ['item-frequency', 'descending']
          },
          name:'key5'}
        );
    assert.deepEqual(
        q.facet('key6',
            q.bucket('bucket6A',     '<', 60),
            q.bucket('bucket6B', 60, '<', 65),
            q.bucket('bucket6C', 65, '<'    )),
        {range:{
          'json-property': 'key6',
          facet: true,
          type: 'xs:string',
          bucket:[
              {name: 'bucket6A', label: 'bucket6A', lt: 60},
              {name: 'bucket6B', label: 'bucket6B', ge: 60, lt: 65},
              {name: 'bucket6C', label: 'bucket6C', ge: 65}]
          },
          name:'key6'
          }
        );
    assert.deepEqual(
        q.facet('key7',
            q.bucket('bucket7A', q.anchor('now',  'P0D', '<', 'P1D')),
            q.bucket('bucket7B', q.anchor('now', '-P7D', '<', 'P1D'))),
        {range:{
          'json-property': 'key7',
          facet: true,
          type: 'xs:string',
          'computed-bucket':[
              {name: 'bucket7A', label: 'bucket7A', anchor: 'now',
                ge:  'P0D', lt: 'P1D'},
              {name: 'bucket7B', label: 'bucket7B', anchor: 'now',
                ge: '-P7D', lt: 'P1D'}]
          },
          name:'key7'
          }
        );
    assert.deepEqual(
        q.facet('key8',
            q.bucket('bucket8A',
                q.anchor('-P30D',  'P0H'), '<', q.anchor('now',  'P0H')),
            q.bucket('bucket8B',
                q.anchor('-P30D', '-P7H'), '<', q.anchor('now', '-P7H'))),
        {range:{
          'json-property': 'key8',
          facet: true,
          type: 'xs:string',
          'computed-bucket':[
              {name: 'bucket8A', label: 'bucket8A',
                  'ge-anchor': '-P30D', ge:  'P0H',
                  'lt-anchor': 'now',   lt: 'P0H'},
              {name: 'bucket8B', label: 'bucket8B',
                  'ge-anchor': '-P30D', ge: '-P7H',
                  'lt-anchor': 'now',   lt: '-P7H'}]
          },
          name:'key8'
          }
        );
    assert.deepEqual(
        q.facet('facet9', q.collection()),
        {collection:{
          facet: true
          },
          name:'facet9'}
        );
    assert.deepEqual(
        q.facet('facet10', q.calculateFunction('module1')),
        {custom:{
          'start-facet': {
            apply: 'start-facet',
            ns:    'http://marklogic.com/query/custom/module1',
            at:    '/ext/marklogic/query/custom/module1.xqy'
            },
          'finish-facet': {
            apply: 'finish-facet',
            ns:    'http://marklogic.com/query/custom/module1',
            at:    '/ext/marklogic/query/custom/module1.xqy'
            },
          facet: true
          },
          name:'facet10'}
        );
  });
});

describe('document query', function(){
  describe('with query builder', function(){
    it('should build a where clause', function(){
      var built = q.where(
          q.value('key1', 'value 1')
      );
      built.should.have.property('whereClause');
      built.whereClause.should.have.property('query');
      built.whereClause.query.should.have.property('queries');
      built.whereClause.query.queries.length.should.equal(1);
      built.whereClause.query.queries[0].should.have.property('value-query');
    });
    it('should build a where clause with fragment scope', function(){
      var built = q.where(
          q.value('key1', 'value 1'), q.fragmentScope('properties')
      );
      built.should.have.property('whereClause');
      built.whereClause.should.have.property('query');
      built.whereClause.query.should.have.property('queries');
      built.whereClause.query.queries.length.should.equal(1);
      built.whereClause.query.queries[0].should.have.property('value-query');
      built.whereClause.should.have.property('fragment-scope');
      built.whereClause['fragment-scope'].should.equal('properties');
    });
    it('should build a where clause with QBE', function(){
      var built = q.where(
          q.byExample({
            key1: {$word:'value 1'}
            })
      );
      built.should.have.property('whereClause');
      built.whereClause.should.have.property('$query');
      built.whereClause.$query.should.have.property('key1');
      built.whereClause.$query.key1.should.have.property('$word');
    });
    it('should build a where clause with qtext', function(){
      var built = q.where(
          q.parsedFrom('constraint1:value1 AND constraint2:word2',
              q.parseBindings(
                  q.value('key1', q.bind('constraint1')),
                  q.word('key2', q.bind('constraint2'))
                  ))
      );
      built.should.have.property('whereClause');
      built.whereClause.should.have.property('parsedQuery');
      built.whereClause.parsedQuery.qtext.should.equal('constraint1:value1 AND constraint2:word2');
      built.whereClause.parsedQuery.should.have.property('constraint');
      built.whereClause.parsedQuery.constraint.length.should.equal(2);
      built.whereClause.parsedQuery.constraint[0].name.should.equal('constraint1');
      built.whereClause.parsedQuery.constraint[1].name.should.equal('constraint2');
    });
    it('should build a where clause with default and empty bindings', function(){
      var built = q.where(
          q.parsedFrom('constraint1:word1 word2',
              q.parseBindings(
                  q.word('key1', q.bind('constraint1')),
                  q.word('key2', q.bindDefault()),
                  q.bindEmptyAs('all-results')
                  )),
          q.value('key1', 'value 1')
      );
      built.should.have.property('whereClause');
      built.whereClause.should.have.property('parsedQuery');
      built.whereClause.parsedQuery.qtext.should.equal('constraint1:word1 word2');
      built.whereClause.parsedQuery.should.have.property('constraint');
      built.whereClause.parsedQuery.constraint.length.should.equal(1);
      built.whereClause.parsedQuery.constraint[0].name.should.equal('constraint1');
      built.whereClause.parsedQuery.should.have.property('term');
      built.whereClause.parsedQuery.term.should.have.property('default');
      built.whereClause.parsedQuery.term.should.have.property('empty');
      built.whereClause.should.have.property('query');
      built.whereClause.query.should.have.property('queries');
      built.whereClause.query.queries.length.should.equal(1);
      built.whereClause.query.queries[0].should.have.property('value-query');
    });
    it('should build a calculate clause', function(){
      var built = q.calculate(
          q.facet('key1'),
          q.facet(q.field('field2'))
      );
      built.should.have.property('calculateClause');
      built.calculateClause.should.have.property('constraint');
      built.calculateClause.constraint.length.should.equal(2);
      built.calculateClause.constraint[0].name.should.equal('key1');
      built.calculateClause.constraint[1].name.should.equal('field2');
    });
    it('should build an orderBy clause', function(){
      var built = q.orderBy(
          'key1',
          q.field('field1'),
          q.sort('key2', 'ascending'),
          q.score('logtf'),
          q.sort(q.score(), 'descending')
      );
      built.should.have.property('orderByClause');
      built.orderByClause.should.have.property('sort-order');
      built.orderByClause['sort-order'].length.should.equal(5);
      built.orderByClause['sort-order'][0]['json-property'].should.equal('key1');
      built.orderByClause['sort-order'][1].field.should.equal('field1');
      built.orderByClause['sort-order'][2]['json-property'].should.equal('key2');
      built.orderByClause['sort-order'][2].direction.should.equal('ascending');
      built.orderByClause['sort-order'][3].score.should.equal('logtf');
      built.orderByClause['sort-order'][4].should.have.property('score');
      built.orderByClause['sort-order'][4].direction.should.equal('descending');
    });
    it('should build a slice clause with start page and page length', function(){
      var built = q.slice(11, 10);
      built.should.have.property('sliceClause');
      built.sliceClause['page-start'].should.equal(11);
      built.sliceClause['page-length'].should.equal(10);
    });
    it('should build a slice clause with start page', function(){
      var built = q.slice(11);
      built.should.have.property('sliceClause');
      built.sliceClause['page-start'].should.equal(11);
    });
    it('should build a slice clause without a page', function(){
      var built = q.slice(0);
      built.should.have.property('sliceClause');
      built.sliceClause['page-length'].should.equal(0);
    });
    it('should build with all clauses', function(){
      var built = q.where(
          q.value('key1', 'value 1')
      ).calculate(
          q.facet('key2')
      ).orderBy(
          'key3'
      ).slice(11, 10);
      built.should.have.property('whereClause');
      built.whereClause.should.have.property('query');
      built.whereClause.query.should.have.property('queries');
      built.whereClause.query.queries.length.should.equal(1);
      built.whereClause.query.queries[0].should.have.property('value-query');
      built.should.have.property('calculateClause');
      built.calculateClause.should.have.property('constraint');
      built.calculateClause.constraint.length.should.equal(1);
      built.calculateClause.constraint[0].name.should.equal('key2');
      built.should.have.property('orderByClause');
      built.orderByClause.should.have.property('sort-order');
      built.orderByClause['sort-order'].length.should.equal(1);
      built.orderByClause['sort-order'][0]['json-property'].should.equal('key3');
      built.should.have.property('sliceClause');
      built.sliceClause['page-start'].should.equal(11);
      built.sliceClause['page-length'].should.equal(10);
    });
    it('should initialize and modify a query', function(){
      // serialize to JSON so the seed has no functions
      var seed = q.where(
          q.collection('foo')
      );
      var marshalled = JSON.stringify(seed);
      var unmarshalled = JSON.parse(marshalled);
      var built = q.copyFrom(unmarshalled).slice(11, 10);
      built.should.have.property('whereClause');
      built.whereClause.should.have.property('query');
      built.whereClause.query.should.have.property('queries');
      built.whereClause.query.queries.length.should.equal(1);
      built.whereClause.query.queries[0].should.have.property('collection-query');
      built.should.have.property('sliceClause');
      built.sliceClause['page-start'].should.equal(11);
      built.sliceClause['page-length'].should.equal(10);
    });
  });
});
