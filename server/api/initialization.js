/**
 * Created by Jonathan on 2/27/2015.
 */

module.exports = function () {

    var sqlite3 = require('sqlite3').verbose();
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
                'creator_id integer NOT NULL,' +
                'timezones varchar(255),' +
                'dates varchar(255),' +
                'description varchar(255),' +
                'location varchar(255),' +
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
    return db;
};