//include plugins
var express = require('express');
var path = require('path');

//init app
var app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//set public folder (satic files)
app.use(express.static(path.join(__dirname, 'puclic')));

app.get('/', function(req, res){
    res.send('working!');   //just for testing!
})

//start server
var port = 3000;
app.listen(port, function(){
    console.log('Server started on port ' + port);
})