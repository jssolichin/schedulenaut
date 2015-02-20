process.env.PWD = process.cwd();

var express = require('express');
var app = express();

app.use("/public", express.static(process.env.PWD + '/public'));
app.use("/bower_components", express.static(process.env.PWD + '/bower_components'));

app.get('/', function (req, res) {
  res.sendFile(process.env.PWD + '/public/index.html');
});

app.get('/*', function(req, res){
  res.sendFile(process.env.PWD + '/public/index.html');
});

var server = app.listen(3000, function () {
  var port = server.address().port;

  console.log('Schedulenaut is listening at :%s', port)
});