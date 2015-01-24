process.env.PWD = process.cwd();

var express = require('express');
var app = express();

app.use("/public", express.static(process.env.PWD + '/public'));
app.use("/bower_components", express.static(process.env.PWD + '/bower_components'));

app.get('/', function (req, res) {
  res.sendFile(process.env.PWD + '/public/index.html');
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port)
});