var fs = require('fs');
var express = require('express');
var app = express();
var ejs = require('ejs');
var bodyParser = require('body-parser');

//allow for JSON parsing 
app.use(bodyParser.json());

//set static directory for all style and script files
app.use(express.static(__dirname + '/../client'));
//render html files as ejs templates
app.engine('html', ejs.renderFile);
//serve all views from the client directory
app.set('views', __dirname + '/../client');
app.set('port', (process.env.PORT || 3333));

//root url, serve up index file which resolves all dependencies via CDN and instantiates angular modules
app.get('/', function(req, res){
  res.render('index.html');
  res.end();
});

app.listen(app.get('port'), function(){
  console.log("listening:" + app.get('port'));
}); 
