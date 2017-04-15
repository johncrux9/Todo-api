var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res){
    res.send('Todo API Root');
});

// GET /todos?completed=true&q=house
app.get('/todos', function(req, res){
    // converts to json and sends it
    var query = req.query;
    var where = {};

    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
          $like: '%' + query.q + '%'
        };
    }

    db.todo.findAll({where: where}).then(function (todos) {
        res.json(todos);
    }, function (e) {
        res.status(500).send();
    });

    // var filteredTodos = todos;
    //
    // if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true')
    // {
    //     filteredTodos = _.where(filteredTodos, {completed : true});
    // } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
    //     filteredTodos = _.where(filteredTodos, {completed : false});
    // }
    //
    // if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
    //     filteredTodos = _.filter(filteredTodos, function (element) {
    //         if (element.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1) {
    //             return true;
    //         } else {
    //             return false;
    //         }
    //     });
    // }
    //
    // res.json(filteredTodos);
});


// GET /todos/:id
// : allows passing of a param, and you can use req.params. to get the param off the request
app.get('/todos/:id', function(req, res){
    var todoId = parseInt(req.params.id, 10);

    // find and return as JSON
    // 404 if not found
    // 500 if error

    db.todo.findById(todoId).then(function (todo) {
        if (todo) {
            res.json(todo.toJSON());
        }  else {
            res.status(404).send();
        }
    }, function (e) {
        res.status(500).send();
    });

    // var matchedTodo = _.findWhere(todos, {id: todoId});
    //
    // if (matchedTodo) {
    //     res.json(matchedTodo);
    // } else {
    //     res.status(404).send();
    // }
});

// POST /todos
app.post('/todos', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    // call create on db.todo
    //   in then, respond with 200 and value of 200
    //   catch e, res.status(400).json(e)
    db.todo.create(body).then(function (todo) {
        res.json(todo.toJSON());
    }, function (e) {
        res.status(400).json(e);
    });


    // if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    //     return res.status(400).send();
    // }
    //
    // // set body.description to be trimmed value
    // body.description = body.description.trim();
    //
    // // add id field to body
    // body["id"] = todoNextId++;
    //
    // // add body to todos array, push body into array
    // todos.push(body);
    //
    // res.json(body);
});

// DELETE /todos/:id

app.delete('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);

    // find, 404 if not there
    db.todo.destroy({
        where: {
            id: todoId
        }
    }).then(function (rowsDeleted) {
        if (rowsDeleted === 0) {
            res.status(404).json({
                error: 'No todo with id'
            });
        } else {
            res.status(204).send();
        }
    }, function (e) {
       res.status(500).send();
    });

    // var matchedTodo = _.findWhere(todos, {id: todoId});
   //
   // if (!matchedTodo) {
   //     res.status(404).json({"error" : "no todo found with that id"});
   // } else {
   //     todos = _.without(todos, matchedTodo);
   //     res.json(matchedTodo);
   // }
});

// PUT /todos/:id
app.put('/todos/:id', function(req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    //var validAttributes = {};
    var attributes = {};
    var todoId = parseInt(req.params.id, 10);
    // var matchedTodo = _.findWhere(todos, {id: todoId});
    //
    // if (!matchedTodo) {
    //     return res.status(404).send();
    // }

    // true if it has this property
    if (body.hasOwnProperty('completed')) {
        //&& _.isBoolean(body.completed)) {
        attributes.completed = body.completed;
    }
    // else if (body.hasOwnProperty('completed')) {
    //     return res.status(400).send();
    // } else {
    //     // Never provided attribute, no problem here
    // }

    if (body.hasOwnProperty('description')) {
        //&& _.isString(body.completed) && body.description.trim().length > 0) {
        attributes.description = body.description;
    }
    // else if (body.hasOwnProperty('description')) {
    //     return res.status(400).send();
    // }

    // _.extend(matchedTodo, validAttributes);
    // res.json(matchedTodo);

    db.todo.findById(todoId).then(function (todo) {
        if (todo) {
            todo.update(attributes).then(function (todo) {
                res.json(todo.toJSON());
            }, function (e) {
                res.status(400).json(e);
            });
        } else {
            res.status(404).send();
        }
    }, function () {
        res.status(500).send();
    });
});

db.sequelize.sync().then(function () {
    app.listen(PORT, function() {
        console.log('Express listening on port ' + PORT + '!');
    });
});