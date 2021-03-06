var express = require('express');
var mongojs = require('mongojs');
var pmongo = require('promised-mongo');
var path = require('path');
var bodyParser  = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var hbs = require('hbs');
var fs = require('fs');

module.exports = Config;

function Config(app, mongoStore) {
  config = require('./config.json');

  app.set('config', config);

  app.set('mongoURL', config.mongoURL);

  var mongoClient = pmongo(app.get('mongoURL'));

  app.set('mongoClient', mongoClient);

  app.set('sessionStore', new mongoStore({
    url: app.get('mongoURL')
  }));

  app.set('view engine', 'html');
  app.engine('html', hbs.__express);
  app.set('views', path.join(__dirname, '..', '/views/'));

  var partialsDir = path.join(__dirname, '..', '/views/partials');

  fs.readdirSync(partialsDir).forEach(function (filename) {
    var matches = /^([^.]+).html$/.exec(filename),
      template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');

    hbs.registerPartial(matches[1], template);
  });

  app.use(express.static(path.join(__dirname, '..', '/public')));

  app.use(cookieParser(app.get("config").session.secret));

  app.use(session({
    secret: app.get("config").session.secret,
    store: app.get('sessionStore'),
    resave: false,
    saveUninitialized: true
  }));

  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(bodyParser.json());
}