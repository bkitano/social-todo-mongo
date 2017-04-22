'use strict;'
//-------CONSTANTS--------

// local things
var port = process.env.port || 8080;

// modules
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var exphbs = require("express-handlebars");

var tasks = require('./routes/tasks');
var index = require("./routes/index");

//-------MIDDLEWEAR-------
// express
var app = express();

// bodyParser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


app.use('/', index);
app.use('/api', tasks);

//---------PAGES----------
app.get('/', function(req, res) {
    res.render('landing');
})

//--------FOOTER----------
app.listen(port, function(req, res) {
    console.log('listening on port ' + port);
})