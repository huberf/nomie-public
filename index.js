//Getting all dependencies
var express = require('express');
var passGen = require('password-generator');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);

//Setting up the port to listen to
app.set('port', (process.env.PORT || 5000));

//Setting up the resource directory
app.use(express.static(__dirname + '/public'));

app.use( bodyParser.urlencoded({ extended: false }));
app.use( bodyParser.json());

//Setting up cookie use
app.use(cookieParser());

//Setting up session handling
app.use(session({secret: 's3cr3tsSh0uldB3K3pt'}));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Setup DB
var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
	userId: String,
  publicId: String,
  count: Number,
});
const User = mongoose.model('User', userSchema);
const db = mongoose.connect(process.env.MONGO_DB_URL);


app.get('/', (req, res) => {
  res.send('{"status": "online"}');
});

app.get('/users/:publicId', (req, res) => {
  User.find({ publicId: req.params.publicId }, (err, user) => {
    if (user[0]) {
      var message = `<style>
        #main {
          color: grey;
          font-size: 120px;
        }
      </style>
      <div id="main">
        Count: ${user[0].count}
      </div>`
      res.send(message);
    } else {
      res.send('No user found');
    }
  });
});

app.get('/join', (req, res) => {
  var config = require('./join.json');
  res.send(config);
});

app.post('/collect', (req, res) => {
  // TODO: Make work
  console.log(req.body);
  console.log(req.body.experiment.slots.data);
  var userId = req.body.anonid;
  var dayCount = 2; // TODO: Make actual value
  User.find({ userId }, (err, users) => {
    if (users[0] && users.length == 1) {
      users[0].count = dayCount;
      users[0].save();
    } else if (!users[0]) {
      var newUser = User({userId, publicId: passGen(12, false), count: dayCount});
      newUser.save();
    }
  });
  res.send('{"status": "success"}')
});

app.get('/leave', (req, res) => {
  // TODO: Delete saved user data
});

io.sockets.on('connection', function(socket) {
  /*
  socket.on('test', function(data) {
    var data = [];
    io.emit('testsend', data);
  }
   */
});

http.listen(app.get('port'), function() {
  console.log('Node app is running on port ', app.get('port'));
});
