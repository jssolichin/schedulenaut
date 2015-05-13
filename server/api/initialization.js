/**
 * Created by Jonathan on 2/27/2015.
 */

module.exports = function () {

    var fs = require('fs');
    var sqlite3 = require('sqlite3').verbose();

    //http://stackoverflow.com/questions/21194934/node-how-to-create-a-directory-if-doesnt-exist/21196961#21196961
    function ensureExists(path, mask, cb) {
        if (typeof mask == 'function') { // allow the `mask` parameter to be optional
            cb = mask;
            mask = 0777;
        }
        fs.mkdir(path, mask, function(err) {
            if (err) {
                if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
                else cb(err); // something else went wrong
            } else cb(null); // successfully created folder
        });
    }

    ensureExists('public/event-images', 0744, function(err) {
        if (err) // handle folder creation error
            console.log('Could not create folder: event-images');
        else // we're all good
            console.log('Folder for event images setted up: event-images');
    });

    var db = new sqlite3.Database('server/database.db');

    // Database initialization
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='events'",
        function (err, rows) {
            if (err !== null) {
                console.log(err);
            }
            else if (rows === undefined) {
                db.run('CREATE TABLE "events" ' +
                '(id varchar(255) NOT NULL PRIMARY KEY, ' +
                'name varchar(255),' +
                'open boolean NOT NULL,' +
                'admin_pass varchar(255),' +
                'event_settings varchar(255),' +
                'image varchar(255),' +
                'timezones varchar(255),' +
                'dates varchar(255),' +
                'description varchar(255),' +
                'location varchar(255),' +
                'time varchar(255),' +
                'details_confirmed varchar(255),' +
                'password varchar(255)' +
                ')', function (err) {
                    if (err !== null) {
                        console.log(err);
                    }
                    else {
                        console.log("SQL Table 'events' initialized.");
                    }
                });
            }
            else {
                console.log("SQL Table 'events' already initialized.");
            }
        });

    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'",
        function (err, rows) {
            if (err !== null) {
                console.log(err);
            }
            else if (rows === undefined) {
                db.run('CREATE TABLE "users" ' +
                '(id integer NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
                'name varchar(255) NOT NULL,' +
                'event_id varchar(255), ' +
                'brushes_id varchar(255),' +
                'secret varchar(255), ' +
                'email varchar(255) ' +
                ')', function (err) {
                    if (err !== null) {
                        console.log(err);
                    }
                    else {
                        console.log("SQL Table 'users' initialized.");
                    }
                });
            }
            else {
                console.log("SQL Table 'users' already initialized.");
            }
        });

    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='brushes'",
        function (err, rows) {
            if (err !== null) {
                console.log(err);
            }
            else if (rows === undefined) {
                db.run('CREATE TABLE "brushes" ' +
                '(id integer NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
                'event_id varchar(255) NOT NULL, ' +
                'user_id varchar(255) NOT NULL, ' +
                'data varchar(255) NOT NULL' +
                ')', function (err) {
                    if (err !== null) {
                        console.log(err);
                    }
                    else {
                        console.log("SQL Table 'brushes' initialized.");
                    }
                });
            }
            else {
                console.log("SQL Table 'brushes' already initialized.");
            }
        });

    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='discussions'",
        function (err, rows) {
            if (err !== null) {
                console.log(err);
            }
            else if (rows === undefined) {
                db.run('CREATE TABLE "discussions" ' +
                '(id integer NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
                'event_id varchar(255) NOT NULL, ' +
                'data varchar(255) NOT NULL, ' +
                'star varchar(255) NOT NULL' +
                ')', function (err) {
                    if (err !== null) {
                        console.log(err);
                    }
                    else {
                        console.log("SQL Table 'brushes' initialized.");
                    }
                });
            }
            else {
                console.log("SQL Table 'brushes' already initialized.");
            }
        });
    return db;
};