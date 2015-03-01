/**
 * Created by Jonathan on 2/27/2015.
 */

module.exports = function(){

    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database('server/database.db');

    // Database initialization
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='events'",
        function(err, rows) {
            if(err !== null) {
                console.log(err);
            }
            else if(rows === undefined) {
                db.run('CREATE TABLE "events" ' +
                '(id varchar(255) NOT NULL PRIMARY KEY, ' +
                'name varchar(255) NOT NULL,' +
                'open boolean NOT NULL,' +
                'creator integer NOT NULL,' +
                'dates varchar(255) NOT NULL,' +
                'description varchar(255)' +
                ')', function(err) {
                    if(err !== null) {
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

    return db;
};