var express = require("express");
var router = express.Router();
var exphbs = require("express-handlebars");
var mongojs = require("mongojs");
var expressValidator = require("express-validator");
var dbusers = mongojs('mongodb://cpsc213:cpsc213@ds019826.mlab.com:19826/social-todo', ['users']);
var session = require("express-session");
var bodyParser = require("body-parser");

router.use(bodyParser.json());
router.use(expressValidator()); // this line must be immediately after any of the bodyParser middlewares!

router.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))

//-------REGISTER----------

router.post('/user/register', function(req, res, next) {
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
      req.session.register_errors = errors;
    console.log(req.session.register_errors);
  } else {
      dbusers.users.save(user, function(err, user){
          if (err) {
              res.send(err);
          } else {
              req.session.email = user.email;
          }
      })
    console.log("user added");
  }
res.redirect('/');
})

//------LOGIN--------

router.post('/user/login', function(req, res, next) {
  var login = {
      email: req.body.email,
      password: req.body.password
  }; 
  
  dbusers.users.findOne({email: login.email}, function(err, user) {
      if (err) {
          throw err;
      } else {
          if(user == null) {
              req.session.login_errors = "no user found";
                //console.log("no user found " + req.session.errors.msg);
          } else {
              if (user.password !== login.password) {
                  req.session.login_errors = "wrong password";
              } else {
                req.session.email = user.email;
                req.session.name = user.name;
              }
        }
      }
      res.redirect('/');
  })
  
  
router.get('/user/logout', function(req, res, next) {
    req.session.email = null;
    req.session.errors = null;
    req.session.login_errors = null;
    req.session.register_errors = null;
    res.redirect('/');
})

  
  
})

module.exports = router;