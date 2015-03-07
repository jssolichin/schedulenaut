/**
 * Created by Jonathan on 2/26/2015.
 */
var express = require('express');
var router = express.Router();

var db = require('./api/initialization.js')();

router.get('/', function (req, res) {
    res.json({message: 'hooray! welcome to our api!'});
});
router.get('/event/:id', function (req, res) {
    var id = req.params.id;

    sqlTest = "SELECT * FROM events WHERE id = '" + id + "'";

    db.get(sqlTest, function (err, row) {
        if (row === undefined)
            res.json({message: '404 not found'});
        else
            res.json(row);
    });

});
router.put('/event/:id', function (req, res) {
    var id = req.params.id;

    var updateQuery = '';
    for (key in req.body) {
        updateQuery += key + " = '" + req.body[key] + "',";
    }

    sqlUpdate = "UPDATE events SET " + updateQuery.substring(0, updateQuery.length - 1) + " WHERE id = '" + id + "'";

    db.run(sqlUpdate, function (err, row) {
        if (row === undefined)
            res.json({message: 'Something went wrong!'});
        else
            res.json(row);
    });

});
router.post('/event', function (req, res) {
    var id = req.body.name.replace(/[^a-z0-9]+/g, '-');
    var description = req.body.description ? "'" + req.body.description + "'" : null;

    sqlTest = "select count(0) AS 'length' from (SELECT id FROM events WHERE id LIKE '" + id + "%')";
    db.each(sqlTest, function (err, rows) {
        if (rows !== undefined && rows.length != 0)
            id += '-' + rows.length;

        sqlRequest = "INSERT INTO 'events' values ('" + id + "', '" + req.body.name + "', 1, -1, '" + req.body.dates + "'," + description + ")";

        db.run(sqlRequest, function (err) {
            if (err !== null)
                console.log(err);
            else
                console.log(id + " Added");
        });

        res.json({id: id});
    });
});

router.post('/brushes', function (req, res) {
    var event_id = req.body.event_id;
    var user_id = req.body.user_id || null;
    var data = req.body.data || [];
    data = JSON.stringify(data);

    sqlRequest = "INSERT INTO 'brushes' values (null, '" + event_id + "', '" + user_id + "','" + data + "')";

    db.run(sqlRequest, function (err) {
        if (err !== null)
            console.log(err);
        else {
            res.json(this.lastID);
            console.log('event_id' + " brush added");
        }
    });

});
router.put('/brushes/:id', function (req, res) {
    var id = req.params.id;
    var user_id = req.body.user_id;
    var data = req.body.data;

    sqlUpdate = "UPDATE brushes SET user_id = " + user_id + ", data = '" + data + "' WHERE id = " + id;

    db.run(sqlUpdate, function (err, row) {
        if (row === undefined)
            res.json({message: 'Something went wrong!'});
        else
            res.json(row);
    });
});
router.get('/brushes/:id', function (req, res) {
    var id = req.params.id;

    sqlTest = "SELECT * FROM brushes WHERE event_id = '" + id + "'";

    db.get(sqlTest, function (err, row) {
        if (row === undefined)
            res.json({message: '404 not found'});
        else {
            res.json(row);
        }
    });

});
router.get('/brushes/event/:id', function (req, res) {
    var id = req.params.id;

    sqlTest = "SELECT * FROM brushes WHERE event_id = '" + id + "'";

    db.all(sqlTest, function (err, rows) {
        if (rows === undefined)
            res.json({message: '404 not found'});
        else {
            res.json(rows);
        }
    });

});

router.post('/user', function (req, res) {
    var name = req.body.name ? "'" + req.body.name + "'" : null;
    var event_id = req.body.event_id ? "'" + req.body.event_id + "'" : null;
    var brush_id = req.body.brushes_id || null;

    sqlRequest = "INSERT INTO 'users' values (null, " + name + ", " + event_id + ", " + brush_id + ")";
    console.log(sqlRequest)

    db.run(sqlRequest, function (err, row) {
        if (err !== null)
            console.log(err);
        else {
            res.json(this.lastID);
        }
    });

});

router.get('/user/:id', function (req, res) {
    var id = req.params.id;

    sqlTest = "SELECT * FROM users WHERE id = '" + id + "'";

    db.get(sqlTest, function (err, row) {
        if (row === undefined)
            res.json({message: '404 not found'});
        else {
            res.json(row);
        }
    });
});

router.get('/user/event/:id', function (req, res) {
    var id = req.params.id;

    sqlTest = "SELECT * FROM users WHERE event_id = '" + id + "'";

    db.all(sqlTest, function (err, rows) {
        if (rows === undefined)
            res.json([]);
        else {
            res.json(rows);
        }
    });
});

router.use('/api', router);

module.exports = router;

