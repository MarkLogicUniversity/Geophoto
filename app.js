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
app.set('view engine', 'jade');
app.use('/components', express.static(__dirname + '/components'));
app.use('/public', express.static(__dirname + '/public'));
app.use('/workarea', express.static(__dirname + '/workarea'));
app.use('/views', express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({extended: true}));
app.use(methodOverride());

if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

router.route('/').get(routes.index);

router.route('/api/').get(apiroutes.index);
router.route('/api/image/:id').get(apiroutes.image);
router.route('/api/imagedata/:id').get(apiroutes.imagedata);
router.route('/api/image/add/:id/:update').post(apiroutes.add);
router.route('/api/:id').get(apiroutes.image);

//route declaration for the partials
router.route('/partials/:name').get(routes.partials);

app.use('/', router);

app.listen(app.get('port'));
console.log('Magic happens on port 3000');