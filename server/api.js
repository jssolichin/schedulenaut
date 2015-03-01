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
    for (key in req.body){
        updateQuery += key + " = '" + req.body[key] + "',";
    }

    sqlUpdate = "UPDATE events SET " + updateQuery.substring(0, updateQuery.length-1) + " WHERE id = '" + id + "'";

    db.run(sqlUpdate, function (err, row) {
        if (row === undefined)
            res.json({message: 'Something went wrong!'});
        else
            res.json(row);
    });

});
router.post('/event', function (req, res) {
    var id = req.body.name.replace(/[^a-z0-9]+/g,'-');

    sqlTest = "select count(0) AS 'length' from (SELECT id FROM events WHERE id LIKE '" + id + "%')";
    db.each(sqlTest, function (err, rows){
        if(rows !== undefined && rows.length != 0)
            id += '-' + rows.length;

        sqlRequest = "INSERT INTO 'events' values ('"+id+"', '"+req.body.name+"', 1, -1, '"+req.body.dates+"',null)"

        db.run(sqlRequest, function (err){
            if(err !== null)
                console.log(err);
            else
                console.log(id + " Added");
        });

        res.json({id: id});
    });
});

router.use('/api', router);

module.exports = router;

