'use strict';
process.env.NODE_ENV = 'development';

var express        = require('express');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var path           = require('path');
var app            = express();
var router         = express.Router();
var routes         = require('./routes').app;
var apiroutes      = require('./routes').api;

app.set('port', 4000);
app.set('view engine', 'jade');
app.use('/components', express.static(__dirname + '/components'));
app.use('/public', express.static(path.normalize(path.join(__dirname, '/public'))));
app.use('/views', express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({extended: true}));

app.use(methodOverride());

if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

/*
Basic route configuration
*/
router.route('/').get(routes.index);
router.route('/api/').get(apiroutes.index);
router.route('/api/image/:id').get(apiroutes.image);
router.route('/api/image/search/:radius/:lat/:lng').get(apiroutes.search);
router.route('/api/image/search/:term').get(apiroutes.search);
//router.route('/api/imagedata/:id').get(apiroutes.imagedata);
router.route('/api/image/update/:id/:update').post(apiroutes.update);
router.route('/api/semantic/info/:country').get(apiroutes.semantic);
router.route('/api/:id').get(apiroutes.image);

//route declaration for the partials
router.route('/partials/:name').get(routes.partials);

//route to display images
router.route('/binary/:id').get(apiroutes.imagedata);

app.use('/', router);

app.listen(app.get('port'));
console.log('Magic happens on port ' + app.get('port'));
