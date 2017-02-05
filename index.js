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
  name: String,
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
          text-align: center;
        }
        #count {
          font-size: 100px;
        }
      </style>
      <div id="main">
        ${user[0].name}<br />
        <div id="count">
          Today's Count: ${user[0].count}
        </div>
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

// Determines count to display
var parseEvents = (data) => {
  // TODO: Implement REGEX date parser, item type diferentiation, etc.
  var now = Date()
  for(var i = 0; i < data.length; i++) {
    // TODO: Implement time processing and crunching to local time
    data[i].time;
  }
  return data.length;
}

app.post('/collect', (req, res) => {
  // TODO: Make work
  console.log(req.body);
  console.log(req.body.experiment.slots.data);
  console.log(req.body.experiment.info.title);
  var userId = req.body.anonid;
  var dayCount = parseEvents(req.body.experiment.slots.data.data);
  User.find({ userId }, (err, users) => {
    if (users[0] && users.length == 1) {
      users[0].count = dayCount;
      users[0].name = req.body.experiment.info.title.value;
      users[0].save();
      var publicId = users[0].publicId;
      res.send(
          {html:
          `<div class="">
            <div class="nui-list">
              <div class="text-center">
                Your Public ID: <a href="https://nomiepublic.herokuapp.com/users/${publicId}">${publicId}</a>
              </div>
            </div>
          </div>`
          });
    } else if (!users[0]) {
      var publicId = passGen(12, false);
      var newUser = User({
        publicId,
        userId,
        name: req.body.experiment.info.title.value,
        count: dayCount
      });
      newUser.save();
      res.send(
          {html:
          `<div class="">
            <div class="nui-list">
              <div class="text-center">
                Your Public ID: <a href="https://nomiepublic.herokuapp.com/users/${publicId}">${publicId}</a>
              </div>
            </div>
          </div>`
          });
    }
  });
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
