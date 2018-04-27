//Getting all dependencies
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
var http = require('http').Server(app);

//Setting up the port to listen to
app.set('port', (process.env.PORT || 5000));

//Setting up the resource directory
app.use(express.static(__dirname + '/public'));

app.use( bodyParser.urlencoded({ extended: false }));
app.use( bodyParser.json());

//Setting up cookie use
app.use(cookieParser());

//Setting up session handling
app.use(session({secret: 'this_is_not_secret_actually_but_right_now_it_doesnt_matter'}));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/:userId', (req, res) => {
  var mockData = {
    id: req.params.userId,
    title: 'Mock Data',
    backgroundColor: '
    todayCount: 10,
    yesterdayCount: 6,
    monthCount: 37,
    color: 'blue'
  };
  res.render('results', mockData);
});

app.post('/data/:userId', (req, res) => {
  // Add saving of data
  res.send({ status: 'success' });
});

http.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

