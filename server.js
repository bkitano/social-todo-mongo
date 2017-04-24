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
var dbusers = mongojs('mongodb://cpsc213:cpsc213@ds019826.mlab.com:19826/social-todo', ['users']);
var dbtasks = mongojs('mongodb://cpsc213:cpsc213@ds019826.mlab.com:19826/social-todo', ['tasks']);

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


app.use('/', index);
app.use('/api', tasks);


//---------PAGES----------
app.get('/', function(req, res) {
    if(!req.session.email) {
        res.render('landing', {register_errors:req.session.register_errors, login_errors: req.session.login_errors});
    } else {
        var email = req.session.email;
        dbtasks.tasks.find( { $or: [ { "creator": email }, { "collaborator1":email }, { "collaborator2":email }, { "collaborator3":email } ] }, function(err, tasks) {
           if(err) {
               res.send(err);
           } else {
               var my_tasks = [];
               var shared_tasks = [];
               for (var i = 0; i < tasks.length; i ++) {
                   if(tasks[i].creator == email) {
                       my_tasks.push(tasks[i]);
                   } else {
                       shared_tasks.push(tasks[i]);
                   }
               }
               req.session.my_tasks = my_tasks;
               req.session.shared_tasks = shared_tasks;
               res.render('dashboard', {name: req.session.name, my_tasks:req.session.my_tasks, shared_tasks:req.session.shared_tasks, errors: req.session.errors});

           }
        });
    }
//     for (var i = 0; i < tasks.length; i++) {
//       if (tasks.creator == email) {
//           my_tasks.push(tasks[i])
//       } else {
//           shared_tasks.push(tasks[i]);
//       }
//   }
   
//   req.session.my_tasks = my_tasks;
//   req.session.shared_tasks = shared_tasks;
//   console.log("tasks retrieved from database: " + req.session.tasks.length);

})

// dbtasks.tasks.find({'creator':'asdf@asdf.com'}, function (err, tasks) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(tasks);
//     }
// })

//--------FOOTER----------
app.listen(port, function(req, res) {
    console.log('listening on port ' + port);
})