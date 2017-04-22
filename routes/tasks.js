var express = require("express");
var router = express.Router();
var mongojs = require("mongojs");
var validator = require("express-validator");
var db = mongojs('mongodb://cpsc213:cpsc213@ds019826.mlab.com:19826/social-todo', ['tasks']);

// Get all tasks
router.get('/tasks', function(req, res, next) {
    db.tasks.find(function(err, tasks) {
        if (err) {
            res.send(err)
        } else {
            res.json(tasks);
        }
    });
})

// Get single task
router.get('/task/:dbid', function(req, res, next) {
    db.tasks.findOne({_id: mongojs.ObjectId(req.params.dbid)}, function(err, task) {
        if (err) {
            res.send(err)
        } else {
            res.json(task);
        }
    });
})

// add task
router.post('/task', function(req, res, next) {
    var task = req.body;
  // parse for errors first using express-validator
  
  // name
  req.checkBody('name', 'name must be less than 50 chars').isLength({min:1, max: 500});  
  
  // collaborator1
  req.checkBody('collaborator1', 'valid email required').optional({checkFalsy:true}).isEmail();
  //req.checkBody('collaborator1', 'email must be less than 50 chars').isLength({ max: 50});  
  
  // collaborator2
  req.checkBody('collaborator2', 'valid email required').optional({checkFalsy:true}).isEmail();
  //req.checkBody('collaborator2', 'email must be less than 50 chars').isLength({ max: 50});  
  
  // collaborator3
  req.checkBody('collaborator3', 'valid email required').optional({checkFalsy:true}).isEmail();
  //req.checkBody('collaborator3', 'email must be less than 50 chars').isLength({ max: 50});  

  // description
  req.checkBody('description', 'please write a description').notEmpty();
  req.checkBody('description', 'description must be less than 5000 chars').isLength({max: 5000});  
  
  var errors = req.validationErrors();
  
  if (errors) {
      req.session.errors = errors;
      res.redirect('/');
  } else {
      
      db.tasks.save(task, function(err, task) {
          if(err) {
              res.send(err);
          } else {
              res.json(task);
          }
      })
      console.log("task added");
  }
})

// Delete task
router.delete('/task/:dbid', function(req, res, next) {
    db.tasks.remove({_id: mongojs.ObjectId(req.params.dbid)}, function(err, task) {
        if (err) {
            res.send(err)
        } else {
            res.json(task);
        }
    });
})

module.exports = router;