'use strict';
process.env.NODE_ENV = 'development';

var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    app = express(),
    router = express.Router(),
    routes = require('./routes').app,
    apiroutes = require('./routes').api;

app.set('port', 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use('/components', express.static(__dirname + '/components'));
app.use('/public', express.static(__dirname + '/public'));
app.use('/workarea', express.static(__dirname + '/workarea'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({extended: true}));
app.use(methodOverride());

if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

router.route('/').get(routes.index);
router.route('/map').get(routes.map);
router.route('/explorer').get(routes.explorer);
router.route('/import').get(routes.importfiles);

router.route('/api/').get(apiroutes.index);
router.route('/api/image/:id').get(apiroutes.image);
router.route('/api/imagedata/:id').get(apiroutes.imagedata);

app.use('/', router);

app.listen(app.get('port'));
console.log('Magic happens on port 3000');