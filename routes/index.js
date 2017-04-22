var express = require("express");
var router = express.Router();
var exphbs = require("express-handlebars");
var mongojs = require("mongojs");
var expressValidator = require("express-validator");
var db = mongojs('mongodb://cpsc213:cpsc213@ds019826.mlab.com:19826/social-todo', ['users']);
var session = require("express-session");
var bodyParser = require("body-parser");

router.use(bodyParser.json());
router.use(expressValidator()); // this line must be immediately after any of the bodyParser middlewares!

router.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true }
}))

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
      req.session.errors = errors;
      res.locals.errors = errors;
    console.log(req.session.errors);
  } else {
      db.users.save(user, function(err, user){
          if (err) {
              res.send(err);
          } else {
              req.session.user = user.email;
              res.json(user);
          }
      })
    console.log("user added");
  }
res.redirect('/');
})

router.post('/user/login', function(req, res, next) {
  var login = {
      email: req.body.email,
      password: req.body.password
  };
  
  db.users.findOne({email: login.email}, function(err, user) {
      if(err || !user) {
          res.send(err);
      } else {
          if (user.password == login.password) {
              req.session.user = user._id;
              res.send(req.session.user);
          }
      }
  })
  
  
  
})

module.exports = router;