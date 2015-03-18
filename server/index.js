process.env.PWD = process.cwd();

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//App
app.use("/public", express.static(process.env.PWD + '/public'));
app.use("/tz", express.static(process.env.PWD + '/tz'));
app.use("/bower_components", express.static(process.env.PWD + '/bower_components'));
app.get('/', function (req, res) {
    res.sendFile(process.env.PWD + '/public/index.html');
});

//API
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/api', require('./api.js'));

//Catch the rest
app.get('/*', function (req, res) {
    res.sendFile(process.env.PWD + '/public/index.html');
});

var server = app.listen(3000, function () {
    var port = server.address().port;

    console.log('Schedulenaut is listening at :%s', port)
});