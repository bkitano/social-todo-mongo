'use strict;'
//-------CONSTANTS--------

// local things
var port = process.env.port || 8080;

// modules
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var exphbs = require("express-handlebars");
var session = require("express-session");

var mongojs = require("mongojs");
var db = mongojs('mongodb://cpsc213:cpsc213@ds019826.mlab.com:19826/social-todo', ['users']);

var tasks = require('./routes/tasks');
var index = require("./routes/index");
var expressValidator = require("express-validator");

//-------MIDDLEWEAR-------
// express
var app = express();

// express-session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))

// bodyParser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(expressValidator()); // this line must be immediately after any of the bodyParser middlewares!

// handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


//app.use('/', index);
app.use('/api', tasks);

//---------PAGES----------
app.get('/', function(req, res) {
    console.log(req.session.errors);
    res.render('landing', {errors: req.session.errors, user: req.session.user});
})

app.post('/user/register', function(req, res, next) {
    // name validators
    var user = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    };
    
  req.checkBody('name', 'need name').notEmpty();
  req.checkBody('name', 'name must be less than 50 chars').isLength({max: 50});  
  
  // email validators
  req.checkBody('email', 'valid email required').isEmail();
  req.checkBody('email', 'email required').notEmpty();
  req.checkBody('email', 'email must be less than 50 chars').isLength({max: 50});  

  // password validators
  req.checkBody('password', 'please choose a password').notEmpty();
  req.checkBody('password', 'password must be less than 50 chars').isLength({max: 50});  

  // confirm_password validators
  req.checkBody('passwordConfirmation', 'please confirm your password').notEmpty();
  req.checkBody('passwordConfirmation', 'your passwords do not match').equals(req.body.password);
  
  var errors = req.validationErrors();    
  
  if (errors) {
      req.session.errors = errors;
      //res.locals.errors = errors;
    console.log(req.session.errors);
  } else {
      db.users.save(user, function(err, user){
          if (err) {
              res.send(err);
          } else {
              req.session.user = user.email;
          }
      })
    console.log("user added");
  }
req.session.save(function(err) {
  if(err) throw err;
  res.redirect('/');
    })
})

//--------FOOTER----------
app.listen(port, function(req, res) {
    console.log('listening on port ' + port);
})