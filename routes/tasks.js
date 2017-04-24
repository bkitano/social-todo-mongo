var express = require("express");
var router = express.Router();
var mongojs = require("mongojs");
var validator = require("express-validator");
var dbtasks = mongojs('mongodb://cpsc213:cpsc213@ds019826.mlab.com:19826/social-todo', ['tasks']);

// // Get all tasks
// router.get('/tasks', function(req, res, next) {
//     db.tasks.find(function(err, tasks) {
//         if (err) {
//             res.send(err)
//         } else {
//             res.json(tasks);
//         }
//     });
// })

// Completed task
router.post('/task/:taskid/completed', function(req, res, next) {
    var completed;
    dbtasks.tasks.find({"_id":mongojs.ObjectId(req.params.taskid)}, function(err, task) {
        if (err) {
            console.log(err);
        } else {
            completed = task[0].completed;
            dbtasks.tasks.update({"_id":mongojs.ObjectId(req.params.taskid)}, {$set: {"completed":!completed}});
        }
    })
    res.redirect('/');
})

// add task
router.post('/task/create', function(req, res, next) {
    var task = {
        "creator": req.session.email,
        "name": req.body.name,
        "description": req.body.description,
        "collaborator1": req.body.collaborator1,
        "collaborator2": req.body.collaborator2,
        "collaborator3": req.body.collaborator3,
        "completed": false
    };
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
      
      dbtasks.tasks.save(task, function(err, task) {
          if(err) {
              res.send(err);
              req.session.errors = err;
              res.redirect('/');
          } else {
              console.log("task added (/api/task/create): " + task)
              res.redirect('/');
          }
      })
      console.log("task added");
  }
})

// Delete task
router.post('/task/:taskid/delete', function(req, res, next) {
    dbtasks.tasks.remove({_id: mongojs.ObjectId(req.params.taskid)}, function(err, task) {
        if (err) {
            res.send(err)
        } else {
            res.redirect('/');
        }
    });
})

module.exports = router;