/**
 * Created by Jonathan on 2/26/2015.
 */
var express = require('express');
var fs = require('fs');
var router = express.Router();
var crypto = require('crypto');
var nodemailerMailgun = require('./api/mail.js');

var db = require('./api/initialization.js')();
var key = 'schedulenaut';

var imgPath = 'public/event-images/';

//http://blog.tompawlak.org/how-to-generate-random-values-nodejs-javascript
var randomValueBase64 = function (len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString('base64')   // convert to base64 format
        .slice(0, len)        // return required number of characters
        .replace(/\+/g, '0')  // replace '+' with '0'
        .replace(/\//g, '0'); // replace '/' with '0'
};

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
router.get('/event/:id/:property', function (req, res) {
    var id = req.params.id;
    var property  = req.params.property;

    sqlTest = "SELECT " + property + " FROM events WHERE id = '" + id + "'";

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
        if(key == 'admin_pass')
            req.body['admin_pass'] = crypto.createHash('sha1', key).update(req.body.admin_pass).digest('hex');

		if(key == 'name')
			updateQuery += key + " = (?),";
		else
			updateQuery += key + " = '" + req.body[key] + "',";
	}

    sqlUpdate = "UPDATE events SET " + updateQuery.substring(0, updateQuery.length - 1) + " WHERE id = '" + id + "'";
    console.log(sqlUpdate)

    db.run(sqlUpdate, req.body.name, function (err, row) {
        if (row === undefined)
            res.json({message: 'Something went wrong!'});
        else
            res.json(row);
    });

});

router.post('/event/:id/admin_pass', function (req, res) {
    var id = req.params.id;
    var admin_pass = crypto.createHash('sha1', key).update(req.body.admin_pass).digest('hex');

    sqlTest = "SELECT admin_pass FROM events WHERE id = '" + id + "'";

    db.get(sqlTest, function (err, row) {
        var authenticated = row.admin_pass === admin_pass;
        res.json({authenticated: authenticated});
    });

});

router.post('/event', function (req, res) {
    var id = randomValueBase64(7);

    sqlTest = "select count(0) AS 'length' from (SELECT id FROM events WHERE id LIKE '" + id + "%')";
    db.each(sqlTest, function (err, rows) {
        if (rows !== undefined && rows.length != 0)
            id += '-' + rows.length;

		sqlRequest = "INSERT INTO 'events' values ((?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?), (?))";
        console.log(sqlRequest)

		db.run(sqlRequest, 
			   id, req.body.name, true, req.body.admin_pass, req.body.event_settings, req.body.image, req.body.timezones, req.body.dates, req.body.description, req.body.location, req.body.time, req.body.details_confirmed, req.body.password,
		function (err) {
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
router.delete('/brushes/:id', function (req, res) {
    var id = req.params.id;

    sqlDelete = "DELETE FROM brushes WHERE id=" + id;
    console.log(sqlDelete);

    db.run(sqlDelete, function (err, row) {
        if (row === undefined)
            res.json({message: 'Something went wrong!'});
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

router.post('/user/:id/secret', function (req, res) {
    var id = req.params.id;
    var secret = crypto.createHash('sha1', key).update(req.body.secret).digest('hex');

    sqlTest = "SELECT * FROM users WHERE id = '" + id + "'";

    db.get(sqlTest, function (err, row) {
        var authenticated = row.secret === secret;
        res.json({authenticated: authenticated});
    });


});

router.post('/user', function (req, res) {
    var secret;

    if(req.body.secret)
        secret = crypto.createHash('sha1', key).update(req.body.secret).digest('hex');
    else
		secret = null;

    var brush_id = req.body.brushes_id || null;

    sqlRequest = "INSERT INTO 'users' values (null, (?), (?), (?), (?), (?))";
    console.log(sqlRequest)

	db.run(sqlRequest, 
		   req.body.name, req.body.event_id, brush_id, secret, req.body.email,
		function (err, row) {
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

router.put('/user/:id', function (req, res) {
    var secret;
    if(req.body.secret)
        secret = crypto.createHash('sha1', key).update(req.body.secret).digest('hex');
    else
        secret = null;

    var id = req.params.id;

    var updateQuery = '';
    for (key in req.body) {
        var value = isNaN(req.body[key]) ? "'" + req.body[key] + "'" : req.body[key];
        if(key == 'secret')
            updateQuery += 'secret= ' + secret + ',';
		else if(key == 'name')
			updateQuery += key + " = (?),";
        else if (key != 'id')
            updateQuery += key + " = " + value + ",";
    }

    sqlUpdate = "UPDATE users SET " + updateQuery.substring(0, updateQuery.length - 1) + " WHERE id = '" + id + "'";
    console.log(sqlUpdate);

    db.run(sqlUpdate, req.body.name, function (err, row) {
        if (row === undefined)
            res.json({message: 'Something went wrong!'});
        else
            res.json(row);
	});

});

router.delete('/user/:id', function (req, res) {
    var id = req.params.id;

    sqlDelete = "DELETE FROM users WHERE id=" + id;
    console.log(sqlDelete);

    db.run(sqlDelete, function (err, row) {
        if (row === undefined)
            res.json({message: 'Something went wrong!'});
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

router.get('/discussion/event/:id', function (req, res) {
    var id = req.params.id;

    sqlTest = "SELECT * FROM discussions WHERE event_id = '" + id + "'";

    db.get(sqlTest, function (err, row) {
        if (row === undefined)
            res.json({message: '404 not found'});
        else {
            res.json(row);
        }
    });
});

router.put('/discussion/event/:id', function (req, res) {
    var id = req.params.id;

    var updateQuery = '';
    for (key in req.body) {
        var value = isNaN(req.body[key]) ? "'" + req.body[key] + "'" : req.body[key];
        if (key != 'id')
            updateQuery += key + " = " + value + ",";
    }

    console.log(id);

    sqlUpdate = "UPDATE discussions SET " + updateQuery.substring(0, updateQuery.length - 1) + " WHERE event_id = '" + id + "'";
    console.log(sqlUpdate);

    db.run(sqlUpdate, function (err, row) {
        if (row === undefined)
            res.json({message: 'Something went wrong!'});
        else
            res.json(row);
    });

});

router.delete('/discussion/event/:id', function (req, res) {
    var id = req.params.id;

    sqlDelete = "DELETE FROM users WHERE event_id=" + id;
    console.log(sqlDelete);

    db.run(sqlDelete, function (err, row) {
        if (row === undefined)
            res.json({message: 'Something went wrong!'});
    });

});

router.post('/discussion', function (req, res) {
    var event_id = req.body.event_id;
    var data = req.body.data || [];
    data = JSON.stringify(data);
    var star = req.body.star || [];
    star = JSON.stringify(star);

    sqlRequest = "INSERT INTO 'discussions' values (null, '" + event_id + "', '" + data + "', '" + star + "')";
    console.log(sqlRequest);

    db.run(sqlRequest, function (err) {
        if (err !== null)
            console.log(err);
        else {
            res.json(this.lastID);
            console.log('event_id' + " brush added");
        }
    });

});

router.post('/saveimage', function (request, response) {
	//TODO: Create auth to upload

    var imgUri = '';
    request.on('data', function (data) {
        imgUri += data.toString().replace(/^data:image\/(png|gif|jpeg);base64,/, '');
    });
    request.on('end', function (d) {
        var img = new Buffer(imgUri, 'base64');
        var filename = imgPath + randomValueBase64(7) + '.png';
        console.log(filename)
        fs.writeFile(filename, img, 'base64', function (err) {
            response.send(filename);
            if (err)
                console.log(err);
        });
    })
});

router.post('/sendmail', function (req, res) {
	//TODO: Create auth to send

	nodemailerMailgun.sendMail(req.body, function (err, info) {
	  if (err) {
		res.json({error: err});
	  }
	  else {
		res.json({Response: info});
	  }
	});

});

router.use('/api', router);

module.exports = router;

