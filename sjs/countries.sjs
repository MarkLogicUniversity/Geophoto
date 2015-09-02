// get triples about the country from DBPedia and insert them into MarkLogic.
declareUpdate();

var sem = require('/MarkLogic/semantics.xqy');

var prefixes = 'PREFIX db: <http://dbpedia.org/resource/> PREFIX onto: <http://dbpedia.org/ontology/> PREFIX prop: <http://dbpedia.org/property/> PREFIX foaf: <http://xmlns.com/foaf/0.1/> ';

var constructString = fn.concat(
  'db:' + country + ' onto:capital ?capital. ',
  'db:' + country + ' prop:areaKm ?areaKm. ',
  'db:' + country + ' prop:currencyCode ?currencyCode. ',
  'db:' + country + ' prop:imageFlag ?imageFlag. ',
  'db:' + country + ' prop:imageMap ?imageMap. ',
  'db:' + country + ' prop:timeZone ?timeZone. ',
  'db:' + country + ' onto:abstract ?abstract. ',
  'db:' + country + ' onto:anthem ?anthem. ',
  'db:' + country + ' foaf:homepage ?homepage. '
);

var whereString = fn.concat(
  'OPTIONAL { db:' + country + ' onto:capital ?capital. } ',
  'OPTIONAL { db:' + country + ' prop:areaKm ?areaKm. } ',
  'OPTIONAL { db:' + country + ' prop:currencyCode ?currencyCode. } ',
  'OPTIONAL { db:' + country + ' prop:imageFlag ?imageFlag. } ',
  'OPTIONAL { db:' + country + ' prop:imageMap ?imageMap. } ',
  'OPTIONAL { db:' + country + ' prop:timeZone ?timeZone. } ',
  'OPTIONAL { db:' + country + ' onto:abstract ?abstract. }',
  'OPTIONAL { db:' + country + ' onto:anthem ?anthem. } ',
  'OPTIONAL { db:' + country + ' foaf:homepage ?homepage. } '
);

var filterString = 'FILTER(langMatches(lang(?abstract), "EN"))';

var sparqlQuery = xdmp.urlEncode(prefixes + 'CONSTRUCT {' + constructString + ' } WHERE { ' + whereString + filterString + ' }');
var endpoint = 'http://dbpedia.org/sparql?query=';
var suffix = '&format=text%2Fplain';
var qFinal = fn.concat(endpoint, sparqlQuery, suffix); 
var dbPediaResponse = xdmp.httpGet(qFinal);
var header = dbPediaResponse.next();
var dbPediaTriples = dbPediaResponse.next();
var triplesForInsert = sem.rdfParse(dbPediaTriples.value, 'ntriple');

sem.rdfInsert(triplesForInsert, null, null, 'country-data');
