var express = require('express');
var path = require('path');
var app = express();

app.use(express.static('public'));

app.get('/', function (req, res) {
  console.log(__dirname);
  res.sendFile(path.join(__dirname, './public', 'login.html'));
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
